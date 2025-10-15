import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Type definitions for our tables
export interface LeadRaw {
  id: string;
  source_id?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  hubspot_id?: string;
  payload?: any;
  created_at: string;
}

export interface LeadScored {
  id: string;
  lead_id: string;
  hubspot_id?: string;
  score: number;
  rationale?: string;
  created_at: string;
}

export interface LeadResearch {
  id: string;
  lead_id: string;
  summary_text?: string;
  sources?: any;
  created_at: string;
}

export interface Job {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying';
  run_time: string;
  completed_at?: string;
  details?: any;
  error_message?: string;
}
