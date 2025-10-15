# Autopilot Sales Automation — PRD & Starter Scaffold

Implementation-ready PRD and Next.js + Supabase + Vercel scaffold for Claude Code.
(Full content is included from the working document.)

## 📊 Implementation Progress

**Last Updated:** 2025-10-15

### ✅ Completed (Phase I - Ready for Testing)

- [x] Next.js 14 project setup with TypeScript
- [x] Supabase database schema and client
- [x] Claude API client (Messages API with latest models)
- [x] HubSpot API integration (CRUD contacts, deals, notes)
- [x] ZoomInfo API integration (with MCP support)
- [x] Error handling, logging, and retry logic
- [x] Phase I: `/api/zoominfo/fetchContacts` - Fetch leads from ZoomInfo
- [x] Phase I: `/api/hubspot/syncContact` - Sync leads to HubSpot
- [x] Phase I: `/api/jobs/runner` - Full workflow orchestration
- [x] Vercel deployment configuration with cron jobs (9 AM weekdays)
- [x] Comprehensive README with setup and testing instructions
- [x] Git repository initialized with initial commit

### 🔄 In Progress

- [ ] Environment variables setup (.env.local with real credentials)
- [ ] Local testing of Phase I endpoints
- [ ] Vercel deployment and connection

### 📅 Upcoming (Phase II - Lead Scoring)

- [ ] Fetch historical HubSpot conversion data
- [ ] Create Claude prompts for lead scoring
- [ ] Implement `/api/claude/scoreLead` endpoint
- [ ] Write scores back to HubSpot custom properties
- [ ] Test and validate scoring accuracy

### 📅 Future Phases

- **Phase III**: Automated lead research with news APIs
- **Phase IV**: Email optimization analysis
- **Phase V**: Market prioritization

---

PRD — Autopilot Sales Automation Backend (Claude + Supabase + Vercel)

1. Overview

We are building a backend service to automate and optimize lead collection, enrichment, prioritization, and outreach for Autopilot’s supply sales.

This system will:

Pull new contacts from ZoomInfo.

Enrich and prioritize leads using AI and internal HubSpot data.

Research relevant news for context.

Push structured insights and outreach recommendations back into HubSpot.

Optionally, trigger personalized outbound emails.

The backend will run as a serverless app hosted on Vercel, use Supabase for persistence/logs, and use Claude (Anthropic API) for all AI logic.

2. Goals & Non-Goals

Goals

Automate lead ingestion from ZoomInfo → HubSpot.

Score and prioritize leads based on historical conversion data in HubSpot.

Run AI research on each lead to find recent news or insights.

Write summarized insights + scores back to HubSpot.

Provide logging and retry capability via Supabase.

Run all jobs on a scheduled or event-triggered basis.

Non-Goals

Building a full front-end dashboard (Phase II).

Real-time analytics visualization (HubSpot will serve this purpose).

Ongoing optimization of email content or campaign design.

3. System Architecture

Primary Components:

Supabase — Stores logs, job state, AI results, and temporary lead data. Acts as durable task queue.

Vercel Serverless Functions — Orchestration layer that calls external APIs and AI models.

Claude API (Anthropic) — Runs all AI tasks: summarization, prioritization, market analysis.

HubSpot API — Source of truth for leads, deals, and conversion data.

ZoomInfo API — Contact ingestion pipeline (Phase I).

CoStar Portal — (Optional) Human-in-the-loop or manual scrape layer — not automated initially.

4. Phase Breakdown

Phase I — Contact Collection + Upload

Goal: Automate ingestion of new leads from ZoomInfo and upload to HubSpot.

Process:

Scheduled job (Vercel CRON) runs every morning.

Fetch new contacts from ZoomInfo API (filter by company type or region).

Save contact payloads in Supabase leads_raw table.

Push valid leads to HubSpot via API.

Log success/failure in jobs table.

Tables:

leads_raw (id, source_id, name, title, company, email, phone, hubspot_id, created_at)

jobs (id, type, status, run_time, error_message)

Phase II — Lead Prioritization

Goal: Identify high-likelihood-to-convert leads using historical HubSpot data.

Process:

Fetch HubSpot deal history and contacts.

Aggregate basic features (industry, region, company size, prior engagement).

Send structured prompt to Claude:

“Given this JSON of past leads and conversion outcomes, infer top 3 predictors of conversion. Score new leads from 0–100 accordingly.”

Write scores to leads_scored in Supabase and back to HubSpot as a custom property (ai_conversion_score).

Tables:

leads_scored (lead_id, hubspot_id, score, rationale, created_at)

Phase III — Automated Lead Research

Goal: Add contextual intelligence to leads.

Process:

For each prioritized lead, search the web (Google or NewsAPI) for recent mentions.

Send article excerpts to Claude for summarization:

“Summarize key updates about this company relevant to supply partnerships.”

Store summary in lead_research table and sync to HubSpot note or field.

Tables:

lead_research (lead_id, summary_text, sources, created_at)

Phase IV — Email Optimization (Optional)

Goal: Identify best-performing outreach templates.

Process:

Periodically fetch HubSpot email engagement metrics.

Send structured dataset to Claude:

“Determine patterns between email type and conversion rates.”

Output: Recommended cadence + subject tone (e.g., “shorter subject lines, 2-day follow-up works best”).

Output stored in email_insights.

Phase V — Market Prioritization

Goal: Identify markets or regions with highest opportunity potential.

Process:

Aggregate deal and occupancy data from HubSpot.

Claude analyzes patterns to rank markets.

Store rankings in market_insights table.

Use insights to guide daily contact prioritization.

5. API Integrations

HubSpot API — REST (OAuth2): CRUD for contacts, deals, properties

ZoomInfo API — REST: Fetch new contacts

Claude API — REST (key-based): AI scoring and summarization

Gmail API (optional) — REST: For automated outbound emails

NewsAPI / Serper.dev — REST: For lead research content

6. Data Flow Summary

ZoomInfo → Supabase (raw leads)
        ↓
Vercel function triggers → Claude (lead scoring + research)
        ↓
Supabase (store scores, summaries, logs)
        ↓
HubSpot (update contact + notes)

7. Authentication & Security

All environment variables (API keys, Supabase URL, Claude API key) stored in Vercel environment.

Supabase Row-Level Security (RLS) enabled.

Communication between Vercel and Supabase over HTTPS only.

OAuth2 for HubSpot access tokens with refresh job.

8. Error Handling & Monitoring

Each workflow execution logged in jobs table with:

status ENUM (success, failed, retrying)

details JSON field

Automatic retry on transient errors (ZoomInfo rate limit, Claude timeout).

Daily Slack notification (via webhook) with job summary.

9. Deliverables

Supabase schema migration file.

Vercel serverless functions for each phase.

Claude prompt templates for:

Lead prioritization

Lead research summarization

Market analysis

HubSpot integration logic.

Logging + Slack notifications.

README with setup steps.

10. Future Phases (Post-MVP)

Simple internal GUI (Supabase + Next.js) to monitor job runs.

Human approval workflow before sending AI-generated emails.

Fine-tuned scoring model using HubSpot data exports.

Multi-market trend visualization dashboard.

11. Success Criteria

Metric

Target

Manual SDR hours saved

≥ 60% reduction

Lead-to-meeting rate

+20% improvement

Daily job success rate

≥ 95%

Data freshness

<24 hours

Starter Code Scaffold — Next.js + Vercel + Supabase (TypeScript)

This scaffold contains file templates and example code to get a developer started building Phase I and II quickly.

Project file tree (suggested)

/ted-ai
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ prisma/ (optional) or supabase/sql/
│  └─ migrations/001_init.sql
├─ lib/
│  ├─ supabaseClient.ts
│  └─ claudeClient.ts
├─ pages/
│  └─ api/
│     ├─ zoominfo/fetchContacts.ts
│     ├─ hubspot/syncContact.ts
│     ├─ jobs/runner.ts
│     └─ claude/scoreLead.ts
├─ scripts/
│  └─ migrate.sql
├─ prompts/
│  ├─ prioritizeLead.md
│  └─ summarizeLead.md
└─ README.md


package.json

{
  "name": "autopilot-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14",
    "react": "18",
    "react-dom": "18",
    "@supabase/supabase-js": "^2.0.0",
    "node-fetch": "^3.0.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}

supabase schema — migrations/001_init.sql

-- leads_raw: incoming raw leads from ZoomInfo
CREATE TABLE leads_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text,
  first_name text,
  last_name text,
  title text,
  company text,
  email text,
  phone text,
  hubspot_id text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- leads_scored: results from Claude scoring
CREATE TABLE leads_scored (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads_raw(id) ON DELETE CASCADE,
  hubspot_id text,
  score integer,
  rationale text,
  created_at timestamptz DEFAULT now()
);

-- lead_research: summaries
CREATE TABLE lead_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads_raw(id) ON DELETE CASCADE,
  summary_text text,
  sources jsonb,
  created_at timestamptz DEFAULT now()
);

-- jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  status text,
  run_time timestamptz DEFAULT now(),
  details jsonb
);

lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side only

export const supabase = createClient(supabaseUrl, supabaseKey);

lib/claudeClient.ts (example fetch wrapper)

import fetch from 'node-fetch';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY!;
const CLAUDE_BASE = process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com';

export async function runClaude(prompt: string) {
  const res = await fetch(`${CLAUDE_BASE}/v1/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY
    },
    body: JSON.stringify({
      model: 'claude-2.1',
      prompt,
      max_tokens: 1000
    })
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const json = await res.json();
  return json;
}

Note: Update the Claude endpoint and payload per the exact API you will use (Claude Code or Anthropic's production endpoints). The function above is illustrative.

pages/api/zoominfo/fetchContacts.ts

