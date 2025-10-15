# Vercel Deployment Guide

## Quick Setup

### 1. Connect GitHub Repository to Vercel

**Option A: Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New Project"**
3. Import from GitHub: `cmcgeehan/ted-ai`
4. Vercel will auto-detect Next.js settings
5. Click **"Deploy"** (don't add environment variables yet)

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 2. Configure Environment Variables

After the first deployment:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pudnwvvsqaaqikflaqzr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>

# Anthropic Claude
ANTHROPIC_API_KEY=<your_anthropic_api_key>

# HubSpot
HUBSPOT_ACCESS_TOKEN=<your_hubspot_access_token>

# ZoomInfo
ZOOMINFO_USERNAME=<your_zoominfo_username>
ZOOMINFO_PASSWORD=<your_zoominfo_password>

# Optional: Slack notifications
SLACK_WEBHOOK_URL=<your_slack_webhook_url>

# Optional: CRON security
CRON_SECRET=<generate_a_random_string>
```

**To find your Supabase Service Role Key:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/pudnwvvsqaaqikflaqzr)
2. Settings → API → Service Role Key (secret)
3. Copy the `service_role` key

### 3. Redeploy with Environment Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Select **"Redeploy"**

Or via CLI:
```bash
vercel --prod
```

### 4. Verify Cron Job Configuration

The `vercel.json` file already configures a cron job:

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

**Schedule:** Runs every weekday at 9:00 AM UTC

To verify:
1. Go to **Project Settings** → **Cron Jobs**
2. You should see the job listed
3. Vercel automatically adds `Authorization: Bearer <CRON_SECRET>` header

### 5. Test Your Deployment

**Test individual endpoints:**

```bash
# Fetch contacts from ZoomInfo
curl -X POST https://your-project.vercel.app/api/zoominfo/fetchContacts \
  -H "Content-Type: application/json" \
  -d '{"filters": {"industry": "Real Estate"}, "limit": 5}'

# Sync to HubSpot
curl -X POST https://your-project.vercel.app/api/hubspot/syncContact \
  -H "Content-Type: application/json" \
  -d '{"syncAll": false}'

# Run full workflow
curl -X POST https://your-project.vercel.app/api/jobs/runner \
  -H "Authorization: Bearer <your_cron_secret>"
```

### 6. Monitor Job Execution

**Check Vercel Logs:**
1. Go to **Deployments** → Select latest → **Functions** tab
2. Click on any function to see logs

**Check Supabase Logs:**
```sql
-- Recent jobs
SELECT * FROM jobs
ORDER BY run_time DESC
LIMIT 10;

-- Failed jobs
SELECT * FROM jobs
WHERE status = 'failed'
ORDER BY run_time DESC;

-- Success rate (last 24 hours)
SELECT
  type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM jobs
WHERE run_time > NOW() - INTERVAL '24 hours'
GROUP BY type;
```

## Troubleshooting

### Issue: Environment Variables Not Working

**Solution:** Make sure you added variables to all three environments (Production, Preview, Development) and redeployed.

### Issue: Cron Job Not Running

**Possible causes:**
1. `vercel.json` not committed to Git
2. CRON_SECRET environment variable not set
3. Function timeout (max 10s on Hobby plan, 60s on Pro)

**Check cron logs:**
- Vercel Dashboard → Project Settings → Cron Jobs → View Logs

### Issue: Function Timeout

If you're processing many leads, you might hit Vercel's timeout limits:

**Solutions:**
1. Reduce batch size in `/api/jobs/runner.ts` (limit: 50 → 25)
2. Upgrade to Vercel Pro for 60s timeout
3. Split into multiple smaller cron jobs

### Issue: Rate Limiting (HubSpot or ZoomInfo)

The system includes retry logic, but if you hit rate limits:

**HubSpot:** 100 requests per 10 seconds
- Reduce batch size
- Add delays between requests

**ZoomInfo:** Varies by plan
- Check your ZoomInfo quota
- Reduce `limit` parameter

## Production Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] Supabase migrations run successfully
- [ ] Test endpoints manually via curl
- [ ] Verify cron job appears in Vercel dashboard
- [ ] Set up Slack webhook for notifications (optional)
- [ ] Test a full workflow run
- [ ] Monitor first few cron executions
- [ ] Set up alerting for failed jobs

## Monitoring Best Practices

1. **Daily:** Check Slack notifications for job summaries
2. **Weekly:** Review Supabase `jobs` table for failures
3. **Monthly:** Analyze success rates and adjust filters

## Next Steps After Deployment

1. Monitor Phase I for 1 week
2. Validate data quality in HubSpot
3. Adjust ZoomInfo search filters based on results
4. Begin Phase II implementation (lead scoring)

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project README:** See `README.md` for API documentation
