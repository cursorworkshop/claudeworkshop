import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client (uses service role key for admin access)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Type definitions for analytics tables
export type AnalyticsSession = {
  id?: string;
  session_id: string;
  visitor_id?: string;
  started_at?: string;
  ended_at?: string;
  last_activity_at?: string;
  referrer?: string;
  referrer_host?: string;
  channel?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  li_fat_id?: string;
  ttclid?: string;
  landing_page?: string;
  landing_query_string?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  timezone?: string;
  language?: string;
  languages?: string[];
  connection_type?: string;
  is_bot?: boolean;
  is_returning_visitor?: boolean;
};

export type AnalyticsPageView = {
  id?: string;
  session_id: string;
  path: string;
  query_string?: string;
  page_title?: string;
  started_at?: string;
  ended_at?: string;
  duration_ms?: number;
  scroll_depth_percent?: number;
  max_scroll_depth_percent?: number;
  had_interaction?: boolean;
  had_click?: boolean;
  had_form_interaction?: boolean;
  previous_page?: string;
  exit_page?: boolean;
  time_visible_ms?: number;
  time_hidden_ms?: number;
  load_time_ms?: number;
  first_contentful_paint_ms?: number;
};

export type AnalyticsEvent = {
  id?: string;
  session_id: string;
  page_view_id?: string;
  event_name: string;
  event_category?: string;
  event_data?: Record<string, unknown>;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  element_href?: string;
  form_id?: string;
  form_name?: string;
  timestamp?: string;
  time_since_session_start_ms?: number;
  time_since_page_load_ms?: number;
};

export type AnalyticsFormSubmission = {
  id?: string;
  session_id: string;
  event_id?: string;
  form_type: string;
  form_page: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_company?: string;
  inquiry_type?: string;
  pages_before_submit?: number;
  time_to_submit_ms?: number;
  channel?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_host?: string;
  landing_page?: string;
  device_type?: string;
  country?: string;
  submitted_at?: string;
};
