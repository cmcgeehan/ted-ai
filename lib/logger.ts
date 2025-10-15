/**
 * Logging and job tracking utilities
 */

import { supabase } from './supabaseClient';

type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'retrying';

export interface JobLog {
  id?: string;
  type: string;
  status: JobStatus;
  details?: any;
  error_message?: string;
}

/**
 * Create a new job log entry
 */
export async function createJob(type: string, details?: any): Promise<string> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      type,
      status: 'running',
      details,
      run_time: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create job log:', error);
    throw error;
  }

  return data.id;
}

/**
 * Update a job's status
 */
export async function updateJob(
  jobId: string,
  status: JobStatus,
  details?: any,
  errorMessage?: string
): Promise<void> {
  const updateData: any = {
    status,
    details,
  };

  if (status === 'success' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId);

  if (error) {
    console.error('Failed to update job log:', error);
    throw error;
  }
}

/**
 * Log a successful job completion
 */
export async function logSuccess(jobId: string, details?: any): Promise<void> {
  await updateJob(jobId, 'success', details);
}

/**
 * Log a failed job
 */
export async function logFailure(
  jobId: string,
  error: Error | string,
  details?: any
): Promise<void> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  await updateJob(jobId, 'failed', details, errorMessage);
}

/**
 * Send a Slack notification (if webhook is configured)
 */
export async function sendSlackNotification(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Slack webhook not configured, skipping notification');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

/**
 * Get recent job statistics
 */
export async function getJobStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('jobs')
    .select('type, status')
    .gte('run_time', since);

  if (error) {
    console.error('Failed to get job stats:', error);
    return null;
  }

  const stats: Record<string, { success: number; failed: number; total: number }> = {};

  data.forEach((job) => {
    if (!stats[job.type]) {
      stats[job.type] = { success: 0, failed: 0, total: 0 };
    }
    stats[job.type].total++;
    if (job.status === 'success') {
      stats[job.type].success++;
    } else if (job.status === 'failed') {
      stats[job.type].failed++;
    }
  });

  return stats;
}
