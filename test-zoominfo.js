/**
 * Quick ZoomInfo API Test
 * Usage: node test-zoominfo.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const ZOOMINFO_API_BASE = 'https://api.zoominfo.com';
const ZOOMINFO_USERNAME = process.env.ZOOMINFO_USERNAME;
const ZOOMINFO_PASSWORD = process.env.ZOOMINFO_PASSWORD;

async function authenticate() {
  console.log('🔐 Authenticating with ZoomInfo...\n');

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
    const error = await response.text();
    throw new Error(`Authentication failed (${response.status}): ${error}`);
  }

  const data = await response.json();
  console.log('✅ Authentication successful!\n');
  return data.jwt;
}

async function searchGreystar(token) {
  console.log('🔍 Searching for contacts at Greystar...\n');

  const searchBody = {
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
    maxResults: 10,
    query: {
      filters: [
        {
          field: 'companyName',
          value: 'Greystar',
        },
      ],
    },
  };

  const response = await fetch(`${ZOOMINFO_API_BASE}/search/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(searchBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Search failed (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('  ZOOMINFO API TEST - Greystar Contacts');
    console.log('═══════════════════════════════════════════════\n');

    // Check credentials
    if (!ZOOMINFO_USERNAME || !ZOOMINFO_PASSWORD) {
      throw new Error('Missing ZoomInfo credentials in .env.local');
    }

    // Authenticate
    const token = await authenticate();

    // Search for Greystar contacts
    const contacts = await searchGreystar(token);

    console.log(`✅ Found ${contacts.length} contacts\n`);
    console.log('═══════════════════════════════════════════════\n');

    // Display results
    if (contacts.length === 0) {
      console.log('⚠️  No contacts found for Greystar');
      console.log('\nThis could mean:');
      console.log('  - Company name spelling is different in ZoomInfo');
      console.log('  - Your ZoomInfo account has restrictions');
      console.log('  - Try a different company name\n');
    } else {
      contacts.forEach((contact, index) => {
        console.log(`\n📇 Contact ${index + 1}`);
        console.log('─────────────────────────────────────────────');
        console.log(`Name:     ${contact.firstName} ${contact.lastName}`);
        console.log(`Title:    ${contact.title || 'N/A'}`);
        console.log(`Email:    ${contact.email || 'N/A'}`);
        console.log(`Phone:    ${contact.phone || 'N/A'}`);
        console.log(`Company:  ${contact.companyName || 'N/A'}`);
        console.log(`Industry: ${contact.companyIndustry || 'N/A'}`);
        console.log(`Location: ${contact.city || ''}${contact.city && contact.state ? ', ' : ''}${contact.state || ''}`);
      });

      // Summary stats
      console.log('\n\n═══════════════════════════════════════════════');
      console.log('📊 SUMMARY');
      console.log('═══════════════════════════════════════════════');

      const withEmails = contacts.filter(c => c.email).length;
      const withPhones = contacts.filter(c => c.phone).length;
      const executives = contacts.filter(c =>
        c.title && (
          c.title.toLowerCase().includes('ceo') ||
          c.title.toLowerCase().includes('president') ||
          c.title.toLowerCase().includes('vp') ||
          c.title.toLowerCase().includes('vice president') ||
          c.title.toLowerCase().includes('director') ||
          c.title.toLowerCase().includes('chief')
        )
      ).length;

      console.log(`Total Contacts:     ${contacts.length}`);
      console.log(`With Email:         ${withEmails}`);
      console.log(`With Phone:         ${withPhones}`);
      console.log(`Executives/Leaders: ${executives}`);
      console.log('═══════════════════════════════════════════════\n');
    }

    // Show raw JSON sample
    if (contacts.length > 0) {
      console.log('\n📄 Sample Raw Data (First Contact):');
      console.log('─────────────────────────────────────────────');
      console.log(JSON.stringify(contacts[0], null, 2));
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nPlease check:');
    console.error('  1. Your .env.local file exists');
    console.error('  2. ZOOMINFO_USERNAME and ZOOMINFO_PASSWORD are set');
    console.error('  3. Your ZoomInfo credentials are correct');
    console.error('  4. Your ZoomInfo account is active\n');
  }
}

main();
