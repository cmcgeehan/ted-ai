/**
 * Phase I - ZoomInfo Contact Fetching Endpoint
 * Fetches new contacts from ZoomInfo and stores them in Supabase
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { searchContacts } from '@/lib/zoominfoClient';
import { supabase } from '@/lib/supabaseClient';
import { createJob, logSuccess, logFailure } from '@/lib/logger';
import { retryWithBackoff, handleAPIError } from '@/lib/errors';

interface FetchContactsRequest {
  filters?: {
    companyName?: string;
    industry?: string;
    location?: string;
    revenueMin?: number;
    revenueMax?: number;
    employeeCountMin?: number;
    employeeCountMax?: number;
  };
  limit?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jobId = await createJob('zoominfo_fetch', { request: req.body });

  try {
    const { filters = {}, limit = 25 } = req.body as FetchContactsRequest;

    console.log('Fetching contacts from ZoomInfo...', { filters, limit });

    // Fetch contacts from ZoomInfo with retry logic
    const contacts = await retryWithBackoff(() =>
      searchContacts(filters, limit)
    );

    console.log(`Found ${contacts.length} contacts from ZoomInfo`);

    // Store contacts in Supabase
    const insertedContacts = [];
    for (const contact of contacts) {
      const { data, error } = await supabase
        .from('leads_raw')
        .insert({
          source_id: contact.id,
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          company: contact.company?.name,
          payload: contact,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to insert contact:', error);
        continue;
      }

      insertedContacts.push(data);
    }

    console.log(`Inserted ${insertedContacts.length} contacts into Supabase`);

    await logSuccess(jobId, {
      contacts_fetched: contacts.length,
      contacts_inserted: insertedContacts.length,
    });

    return res.status(200).json({
      success: true,
      contacts_fetched: contacts.length,
      contacts_inserted: insertedContacts.length,
      jobId,
    });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    await logFailure(jobId, error);

    const errorResponse = handleAPIError(error);
    return res.status(errorResponse.statusCode).json(JSON.parse(errorResponse.body));
  }
}
