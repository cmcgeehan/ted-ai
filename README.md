# Autopilot Sales Automation Backend

Automated lead collection, enrichment, and prioritization system using Next.js, Supabase, Claude AI, and Vercel.

## Overview

This system automates the sales pipeline by:
- **Phase I**: Fetching contacts from ZoomInfo and syncing to HubSpot
- **Phase II** (Coming Soon): AI-powered lead scoring with Claude
- **Phase III** (Coming Soon): Automated lead research
- **Phase IV** (Coming Soon): Email optimization analysis
- **Phase V** (Coming Soon): Market prioritization

## Tech Stack

- **Framework**: Next.js 14 (Pages Router + API Routes)
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Deployment**: Vercel (with cron jobs)
- **APIs**: ZoomInfo (MCP), HubSpot, NewsAPI/Serper

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account with project created
- Anthropic API key
- HubSpot account with API access
- ZoomInfo credentials
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ted-ai
npm install
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_init.sql`
4. Verify tables are created: `leads_raw`, `leads_scored`, `lead_research`, `jobs`

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxx...

# HubSpot
HUBSPOT_ACCESS_TOKEN=pat-xxx...

# ZoomInfo
ZOOMINFO_USERNAME=your_username
ZOOMINFO_PASSWORD=your_password

# Optional: Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Optional: CRON security
CRON_SECRET=your_random_secret_string
```

### 4. Run Locally

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## API Endpoints

### Phase I Endpoints

#### 1. Fetch Contacts from ZoomInfo

**POST** `/api/zoominfo/fetchContacts`

Fetches new contacts from ZoomInfo based on filters and saves to Supabase.

```bash
curl -X POST http://localhost:3000/api/zoominfo/fetchContacts \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "industry": "Real Estate",
      "employeeCountMin": 10,
      "employeeCountMax": 500
    },
    "limit": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "contacts_fetched": 50,
  "contacts_inserted": 48,
  "jobId": "uuid"
}
```

#### 2. Sync Contacts to HubSpot

**POST** `/api/hubspot/syncContact`

Syncs leads from Supabase to HubSpot.

```bash
curl -X POST http://localhost:3000/api/hubspot/syncContact \
  -H "Content-Type: application/json" \
  -d '{
    "syncAll": false
  }'
```

**Options:**
- `syncAll: false` - Only sync leads without HubSpot ID
- `syncAll: true` - Sync all leads
- `leadIds: ["uuid1", "uuid2"]` - Sync specific leads

**Response:**
```json
{
  "success": true,
  "synced_count": 48,
  "failed_count": 2,
  "synced": [...],
  "failed": [...],
  "jobId": "uuid"
}
```

#### 3. Job Runner (Orchestration)

**POST** `/api/jobs/runner`

Runs the complete Phase I workflow: fetch → sync.

```bash
curl -X POST http://localhost:3000/api/jobs/runner \
  -H "Authorization: Bearer your_cron_secret"
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid",
  "results": {
    "phase_1_fetch": { ... },
    "phase_1_sync": { ... }
  }
}
```

## Testing Phase I

### Manual Testing Steps

1. **Test ZoomInfo Fetch:**
   ```bash
   curl -X POST http://localhost:3000/api/zoominfo/fetchContacts \
     -H "Content-Type: application/json" \
     -d '{"filters": {"industry": "Real Estate"}, "limit": 5}'
   ```

2. **Verify in Supabase:**
   - Go to Supabase dashboard → Table Editor → `leads_raw`
   - Check if contacts were inserted

3. **Test HubSpot Sync:**
   ```bash
   curl -X POST http://localhost:3000/api/hubspot/syncContact \
     -H "Content-Type: application/json" \
     -d '{"syncAll": false}'
   ```

4. **Verify in HubSpot:**
   - Go to HubSpot → Contacts
   - Search for newly created contacts

5. **Test Full Workflow:**
   ```bash
   curl -X POST http://localhost:3000/api/jobs/runner
   ```

6. **Check Logs:**
   - Go to Supabase → Table Editor → `jobs`
   - Review job status and details

## Deployment

### Deploy to Vercel

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables:**
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Enable Cron Jobs:**
   - The `vercel.json` config enables daily runs at 9 AM (Mon-Fri)
   - Schedule: `0 9 * * 1-5` (cron format)

4. **Secure the Cron Endpoint:**
   - Set `CRON_SECRET` environment variable
   - Vercel will automatically include this in cron requests

### Vercel Cron Configuration

The job runner executes automatically every weekday at 9 AM:

```json
{
  "crons": [
    {
      "path": "/api/jobs/runner",
      "schedule": "0 9 * * 1-5"
    }
  ]
}
```

## Monitoring

### Job Logs

Query recent jobs in Supabase:

```sql
SELECT * FROM jobs
ORDER BY run_time DESC
LIMIT 10;
```

### Slack Notifications

If `SLACK_WEBHOOK_URL` is configured, you'll receive daily summaries:

```
🤖 Autopilot Daily Run Summary
📥 Fetch: 48/50 contacts saved
🔄 HubSpot Sync: 48 synced, 0 failed
```

## Troubleshooting

### Common Issues

**1. ZoomInfo Authentication Failed**
- Verify `ZOOMINFO_USERNAME` and `ZOOMINFO_PASSWORD` are correct
- Check if ZoomInfo account is active

**2. HubSpot API Rate Limit**
- HubSpot has rate limits (100 requests/10 seconds)
- The sync endpoint processes sequentially to avoid limits

**3. Supabase Connection Error**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check if Supabase project is active

**4. Vercel Cron Not Running**
- Check Vercel dashboard → Deployments → Cron Logs
- Ensure `vercel.json` is committed and deployed

## Project Structure

```
ted-ai/
├── lib/
│   ├── supabaseClient.ts      # Supabase connection
│   ├── claudeClient.ts         # Claude AI client
│   ├── hubspotClient.ts        # HubSpot API wrapper
│   ├── zoominfoClient.ts       # ZoomInfo API wrapper
│   ├── logger.ts               # Job logging utilities
│   └── errors.ts               # Error handling
├── pages/api/
│   ├── zoominfo/
│   │   └── fetchContacts.ts    # Phase I: Fetch contacts
│   ├── hubspot/
│   │   └── syncContact.ts      # Phase I: Sync to HubSpot
│   └── jobs/
│       └── runner.ts           # Job orchestration
├── supabase/migrations/
│   └── 001_init.sql            # Database schema
├── .env.example                # Environment template
├── vercel.json                 # Vercel config + cron
└── README.md                   # This file
```

## Next Steps

### Phase II - Lead Scoring (Coming Soon)
- Fetch historical HubSpot data
- Use Claude to identify conversion predictors
- Score new leads 0-100
- Write scores back to HubSpot

### Phase III - Lead Research (Coming Soon)
- Search for company news and updates
- Summarize with Claude
- Add insights to HubSpot notes

## Support

For issues or questions:
1. Check the [PRD document](./implementations/Autopilot_Sales_Automation_PRD.md)
2. Review Supabase logs in the `jobs` table
3. Check Vercel deployment logs

## License

Private - Autopilot Internal Use Only
