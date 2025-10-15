/**
 * ZoomInfo API Client
 * Handles authentication and contact searches
 * Documentation: https://api-docs.zoominfo.com/
 */

const ZOOMINFO_API_BASE = 'https://api.zoominfo.com';
const ZOOMINFO_USERNAME = process.env.ZOOMINFO_USERNAME;
const ZOOMINFO_PASSWORD = process.env.ZOOMINFO_PASSWORD;
const ZOOMINFO_API_KEY = process.env.ZOOMINFO_API_KEY;

if (!ZOOMINFO_USERNAME || !ZOOMINFO_PASSWORD) {
  console.warn('Missing ZoomInfo credentials');
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

interface ZoomInfoContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  company?: {
    name: string;
    website?: string;
    industry?: string;
    revenue?: number;
    employeeCount?: number;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Authenticate with ZoomInfo and get an access token
 */
async function authenticate(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${ZOOMINFO_API_BASE}/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: ZOOMINFO_USERNAME,
      password: ZOOMINFO_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`ZoomInfo authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.jwt;
  // Token typically expires in 1 hour, cache for 50 minutes
  tokenExpiry = Date.now() + 50 * 60 * 1000;

  return cachedToken!;
}

/**
 * Search for contacts based on criteria
 * @param filters Search filters (company, industry, location, etc.)
 * @param limit Maximum number of results
 */
export async function searchContacts(
  filters: {
    companyName?: string;
    industry?: string;
    location?: string;
    revenueMin?: number;
    revenueMax?: number;
    employeeCountMin?: number;
    employeeCountMax?: number;
  },
  limit: number = 25
): Promise<ZoomInfoContact[]> {
  const token = await authenticate();

  const searchBody: any = {
    outputFields: [
      'id',
      'firstName',
      'lastName',
      'email',
      'phone',
      'title',
      'companyName',
      'companyWebsite',
      'companyIndustry',
      'companyRevenue',
      'companyEmployeeCount',
      'city',
      'state',
      'country',
    ],
    maxResults: limit,
  };

  // Build query filters
  const queryFilters: any[] = [];

  if (filters.companyName) {
    queryFilters.push({
      field: 'companyName',
      value: filters.companyName,
    });
  }

  if (filters.industry) {
    queryFilters.push({
      field: 'companyIndustry',
      value: filters.industry,
    });
  }

  if (filters.location) {
    queryFilters.push({
      field: 'location',
      value: filters.location,
    });
  }

  if (filters.revenueMin || filters.revenueMax) {
    queryFilters.push({
      field: 'companyRevenue',
      min: filters.revenueMin,
      max: filters.revenueMax,
    });
  }

  if (filters.employeeCountMin || filters.employeeCountMax) {
    queryFilters.push({
      field: 'companyEmployeeCount',
      min: filters.employeeCountMin,
      max: filters.employeeCountMax,
    });
  }

  if (queryFilters.length > 0) {
    searchBody.query = { filters: queryFilters };
  }

  const response = await fetch(`${ZOOMINFO_API_BASE}/search/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(searchBody),
  });

  if (!response.ok) {
    throw new Error(`ZoomInfo search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Get contact enrichment data by email
 */
export async function enrichContactByEmail(email: string): Promise<ZoomInfoContact | null> {
  const token = await authenticate();

  const response = await fetch(`${ZOOMINFO_API_BASE}/enrich/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      matchPersonInput: [
        {
          email: email,
        },
      ],
      outputFields: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'title',
        'companyName',
        'companyWebsite',
        'companyIndustry',
      ],
    }),
  });

  if (!response.ok) {
    console.error(`Failed to enrich contact: ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

/**
 * Bulk contact search - useful for daily batch jobs
 */
export async function bulkContactSearch(
  searchCriteria: any[],
  limit: number = 100
): Promise<ZoomInfoContact[]> {
  const token = await authenticate();

  const response = await fetch(`${ZOOMINFO_API_BASE}/search/contact/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      searches: searchCriteria,
      maxResults: limit,
    }),
  });

  if (!response.ok) {
    throw new Error(`ZoomInfo bulk search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}
