/**
 * Phase I - HubSpot Contact Sync Endpoint
 * Syncs leads from Supabase to HubSpot
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { createOrUpdateContact } from '@/lib/hubspotClient';
import { createJob, logSuccess, logFailure } from '@/lib/logger';
import { retryWithBackoff, handleAPIError } from '@/lib/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jobId = await createJob('hubspot_sync', { request: req.body });

  try {
    const { leadIds, syncAll = false } = req.body;

    // Fetch leads to sync
    let query = supabase.from('leads_raw').select('*');

    if (!syncAll && leadIds && leadIds.length > 0) {
      query = query.in('id', leadIds);
    } else if (!syncAll) {
      // Default: sync only leads without a HubSpot ID
      query = query.is('hubspot_id', null);
    }

    const { data: leads, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!leads || leads.length === 0) {
      await logSuccess(jobId, { synced_count: 0 });
      return res.status(200).json({
        success: true,
        synced_count: 0,
        message: 'No leads to sync',
      });
    }

    console.log(`Syncing ${leads.length} leads to HubSpot...`);

    // Sync each lead to HubSpot
    const syncedContacts = [];
    const failedContacts = [];

    for (const lead of leads) {
      try {
        // Skip if no email
        if (!lead.email) {
          console.log(`Skipping lead ${lead.id} - no email`);
          failedContacts.push({ leadId: lead.id, reason: 'No email' });
          continue;
        }

        // Create or update in HubSpot
        const hubspotContact = await retryWithBackoff(() =>
          createOrUpdateContact({
            properties: {
              email: lead.email,
              firstname: lead.first_name,
              lastname: lead.last_name,
              company: lead.company,
              jobtitle: lead.title,
              phone: lead.phone,
            },
          })
        );

        // Update Supabase with HubSpot ID
        await supabase
          .from('leads_raw')
          .update({ hubspot_id: hubspotContact.id })
          .eq('id', lead.id);

        syncedContacts.push({
          leadId: lead.id,
          hubspotId: hubspotContact.id,
        });

        console.log(`Synced lead ${lead.id} to HubSpot (${hubspotContact.id})`);
      } catch (error: any) {
        console.error(`Failed to sync lead ${lead.id}:`, error);
        failedContacts.push({
          leadId: lead.id,
          reason: error.message,
        });
      }
    }

    console.log(
      `Sync complete: ${syncedContacts.length} synced, ${failedContacts.length} failed`
    );

    await logSuccess(jobId, {
      synced_count: syncedContacts.length,
      failed_count: failedContacts.length,
      synced: syncedContacts,
      failed: failedContacts,
    });

    return res.status(200).json({
      success: true,
      synced_count: syncedContacts.length,
      failed_count: failedContacts.length,
      synced: syncedContacts,
      failed: failedContacts,
      jobId,
    });
  } catch (error: any) {
    console.error('Error syncing contacts:', error);
    await logFailure(jobId, error);

    const errorResponse = handleAPIError(error);
    return res.status(errorResponse.statusCode).json(JSON.parse(errorResponse.body));
  }
}
