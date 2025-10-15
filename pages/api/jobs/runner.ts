/**
 * Job Runner - Orchestrates the complete workflow
 * This endpoint can be triggered by Vercel CRON or manually
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createJob, logSuccess, logFailure, sendSlackNotification } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is from Vercel CRON (optional security)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const jobId = await createJob('workflow_runner', { trigger: req.method });

  try {
    const results: any = {
      phase_1_fetch: null,
      phase_1_sync: null,
      phase_2_scoring: null,
    };

    // Phase I: Fetch contacts from ZoomInfo
    console.log('Running Phase I - Fetch Contacts...');
    try {
      const fetchResponse = await fetch(
        `${getBaseUrl(req)}/api/zoominfo/fetchContacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filters: {
              // Customize these filters based on your target criteria
              industry: 'Real Estate',
              employeeCountMin: 10,
            },
            limit: 50,
          }),
        }
      );

      results.phase_1_fetch = await fetchResponse.json();
    } catch (error) {
      console.error('Phase I fetch failed:', error);
      results.phase_1_fetch = { error: String(error) };
    }

    // Phase I: Sync contacts to HubSpot
    console.log('Running Phase I - Sync to HubSpot...');
    try {
      const syncResponse = await fetch(
        `${getBaseUrl(req)}/api/hubspot/syncContact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ syncAll: false }),
        }
      );

      results.phase_1_sync = await syncResponse.json();
    } catch (error) {
      console.error('Phase I sync failed:', error);
      results.phase_1_sync = { error: String(error) };
    }

    // Phase II: Score leads (if implemented)
    console.log('Running Phase II - Score Leads...');
    try {
      const scoreResponse = await fetch(
        `${getBaseUrl(req)}/api/claude/scoreLead`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scoreAll: true }),
        }
      );

      results.phase_2_scoring = await scoreResponse.json();
    } catch (error) {
      console.error('Phase II scoring failed:', error);
      results.phase_2_scoring = { error: String(error) };
    }

    // Send summary notification
    const summary = buildSummaryMessage(results);
    await sendSlackNotification(summary);

    await logSuccess(jobId, results);

    return res.status(200).json({
      success: true,
      jobId,
      results,
    });
  } catch (error: any) {
    console.error('Job runner error:', error);
    await logFailure(jobId, error);

    // Send error notification
    await sendSlackNotification(`❌ Job runner failed: ${error.message}`);

    return res.status(500).json({
      success: false,
      error: error.message,
      jobId,
    });
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

function buildSummaryMessage(results: any): string {
  const parts: string[] = ['🤖 *Autopilot Daily Run Summary*\n'];

  if (results.phase_1_fetch) {
    const { contacts_fetched, contacts_inserted } = results.phase_1_fetch;
    parts.push(
      `📥 *Fetch*: ${contacts_inserted || 0}/${contacts_fetched || 0} contacts saved`
    );
  }

  if (results.phase_1_sync) {
    const { synced_count, failed_count } = results.phase_1_sync;
    parts.push(
      `🔄 *HubSpot Sync*: ${synced_count || 0} synced, ${failed_count || 0} failed`
    );
  }

  if (results.phase_2_scoring) {
    const { scored_count } = results.phase_2_scoring;
    parts.push(`🎯 *Scoring*: ${scored_count || 0} leads scored`);
  }

  return parts.join('\n');
}
