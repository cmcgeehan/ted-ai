-- Autopilot Sales Automation - Initial Schema
-- Created: 2025-10-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Index for faster lookups
CREATE INDEX idx_leads_raw_hubspot_id ON leads_raw(hubspot_id);
CREATE INDEX idx_leads_raw_email ON leads_raw(email);
CREATE INDEX idx_leads_raw_created_at ON leads_raw(created_at);

-- leads_scored: results from Claude scoring
CREATE TABLE leads_scored (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads_raw(id) ON DELETE CASCADE,
  hubspot_id text,
  score integer,
  rationale text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_leads_scored_lead_id ON leads_scored(lead_id);
CREATE INDEX idx_leads_scored_score ON leads_scored(score DESC);

-- lead_research: summaries and news
CREATE TABLE lead_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads_raw(id) ON DELETE CASCADE,
  summary_text text,
  sources jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_lead_research_lead_id ON lead_research(lead_id);

-- jobs table: track all job executions
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed', 'retrying')),
  run_time timestamptz DEFAULT now(),
  completed_at timestamptz,
  details jsonb,
  error_message text
);

CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_run_time ON jobs(run_time DESC);

-- email_insights: for Phase IV (optional)
CREATE TABLE email_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text,
  analysis_text text,
  recommendations jsonb,
  created_at timestamptz DEFAULT now()
);

-- market_insights: for Phase V
CREATE TABLE market_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_name text,
  region text,
  score integer,
  analysis_text text,
  metrics jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_market_insights_score ON market_insights(score DESC);
