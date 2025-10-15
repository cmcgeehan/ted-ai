/**
 * HubSpot API Client
 * Handles contact creation, updates, and data retrieval from HubSpot
 */

const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN!;

if (!HUBSPOT_ACCESS_TOKEN) {
  console.warn('Missing HUBSPOT_ACCESS_TOKEN environment variable');
}

interface HubSpotContact {
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    jobtitle?: string;
    phone?: string;
    [key: string]: any;
  };
}

interface HubSpotContactResponse {
  id: string;
  properties: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create or update a contact in HubSpot
 */
export async function createOrUpdateContact(
  contact: HubSpotContact
): Promise<HubSpotContactResponse> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(contact),
    }
  );

  if (!response.ok) {
    // If contact exists, try to update instead
    if (response.status === 409) {
      return await updateContactByEmail(contact.properties.email, contact.properties);
    }
    const error = await response.text();
    throw new Error(`HubSpot API error (${response.status}): ${error}`);
  }

  return await response.json();
}

/**
 * Update a contact by email address
 */
export async function updateContactByEmail(
  email: string,
  properties: Record<string, any>
): Promise<HubSpotContactResponse> {
  // First, search for the contact by email
  const searchResponse = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!searchResponse.ok) {
    throw new Error(`Failed to search for contact: ${searchResponse.statusText}`);
  }

  const searchResult = await searchResponse.json();
  if (!searchResult.results || searchResult.results.length === 0) {
    throw new Error(`Contact not found with email: ${email}`);
  }

  const contactId = searchResult.results[0].id;

  // Update the contact
  const updateResponse = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ properties }),
    }
  );

  if (!updateResponse.ok) {
    throw new Error(`Failed to update contact: ${updateResponse.statusText}`);
  }

  return await updateResponse.json();
}

/**
 * Get contact by ID
 */
export async function getContact(contactId: string): Promise<HubSpotContactResponse> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`,
    {
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get contact: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all contacts with pagination
 */
export async function getAllContacts(limit: number = 100) {
  const contacts: HubSpotContactResponse[] = [];
  let after: string | undefined;

  do {
    const url = new URL(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`);
    url.searchParams.append('limit', limit.toString());
    if (after) {
      url.searchParams.append('after', after);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get contacts: ${response.statusText}`);
    }

    const data = await response.json();
    contacts.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return contacts;
}

/**
 * Get deals (for conversion history analysis)
 */
export async function getDeals(limit: number = 100) {
  const deals: any[] = [];
  let after: string | undefined;

  do {
    const url = new URL(`${HUBSPOT_API_BASE}/crm/v3/objects/deals`);
    url.searchParams.append('limit', limit.toString());
    if (after) {
      url.searchParams.append('after', after);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get deals: ${response.statusText}`);
    }

    const data = await response.json();
    deals.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return deals;
}

/**
 * Create a note on a contact
 */
export async function createContactNote(
  contactId: string,
  noteContent: string
): Promise<any> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/notes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: noteContent,
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 202, // Note to Contact association
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create note: ${response.statusText}`);
  }

  return await response.json();
}
