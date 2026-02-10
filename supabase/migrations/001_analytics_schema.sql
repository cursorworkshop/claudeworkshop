-- Analytics Schema for claudeworkshop.com
-- Tracks sessions, page views, events, and form submissions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SESSIONS TABLE
-- Stores visitor sessions with full attribution data
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session identification
  session_id TEXT NOT NULL UNIQUE,
  visitor_id TEXT, -- Optional persistent visitor ID from cookie
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Traffic source
  referrer TEXT,
  referrer_host TEXT,
  channel TEXT, -- Inferred: Google Ads, LinkedIn, AI (ChatGPT), etc.
  
  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- Click IDs for ad platforms
  gclid TEXT, -- Google Ads
  fbclid TEXT, -- Facebook/Meta
  msclkid TEXT, -- Microsoft/Bing Ads
  li_fat_id TEXT, -- LinkedIn
  ttclid TEXT, -- TikTok
  
  -- Landing info
  landing_page TEXT,
  landing_query_string TEXT,
  
  -- Device & browser info
  user_agent TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  
  -- Screen info
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Location (from IP geolocation)
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Language preferences
  language TEXT,
  languages TEXT[], -- All accepted languages
  
  -- Connection info
  connection_type TEXT, -- 4g, 3g, wifi, etc.
  
  -- Flags
  is_bot BOOLEAN DEFAULT FALSE,
  is_returning_visitor BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX idx_sessions_channel ON analytics_sessions(channel);
CREATE INDEX idx_sessions_utm_source ON analytics_sessions(utm_source);
CREATE INDEX idx_sessions_utm_campaign ON analytics_sessions(utm_campaign);
CREATE INDEX idx_sessions_referrer_host ON analytics_sessions(referrer_host);
CREATE INDEX idx_sessions_country ON analytics_sessions(country);
CREATE INDEX idx_sessions_device_type ON analytics_sessions(device_type);

-- =============================================================================
-- PAGE VIEWS TABLE
-- Individual page views with timing data
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Links to session
  session_id TEXT NOT NULL REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
  
  -- Page info
  path TEXT NOT NULL,
  query_string TEXT,
  page_title TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER, -- Time spent on page in milliseconds
  
  -- Engagement metrics
  scroll_depth_percent INTEGER, -- 0-100, how far they scrolled
  max_scroll_depth_percent INTEGER,
  
  -- Interaction flags
  had_interaction BOOLEAN DEFAULT FALSE, -- Any click, scroll, etc.
  had_click BOOLEAN DEFAULT FALSE,
  had_form_interaction BOOLEAN DEFAULT FALSE,
  
  -- Navigation
  previous_page TEXT,
  exit_page BOOLEAN DEFAULT FALSE, -- Was this the last page?
  
  -- Visibility
  time_visible_ms INTEGER, -- Time page was actually visible (not background tab)
  time_hidden_ms INTEGER,
  
  -- Performance (if available)
  load_time_ms INTEGER,
  first_contentful_paint_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for page views
CREATE INDEX idx_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX idx_page_views_path ON analytics_page_views(path);
CREATE INDEX idx_page_views_started_at ON analytics_page_views(started_at DESC);

-- =============================================================================
-- EVENTS TABLE
-- Custom events (clicks, form submissions, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Links to session and page view
  session_id TEXT NOT NULL REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
  page_view_id UUID REFERENCES analytics_page_views(id) ON DELETE SET NULL,
  
  -- Event identification
  event_name TEXT NOT NULL, -- e.g., 'form_submit', 'cta_click', 'video_play'
  event_category TEXT, -- e.g., 'engagement', 'conversion', 'navigation'
  
  -- Event data (flexible JSON)
  event_data JSONB DEFAULT '{}',
  
  -- Common fields extracted for querying
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  element_href TEXT,
  
  -- Form-specific (for form submissions)
  form_id TEXT,
  form_name TEXT,
  
  -- Timing
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_since_session_start_ms INTEGER,
  time_since_page_load_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_events_event_category ON analytics_events(event_category);

-- =============================================================================
-- FORM SUBMISSIONS TABLE
-- Detailed form submission tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Links
  session_id TEXT NOT NULL REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
  event_id UUID REFERENCES analytics_events(id) ON DELETE SET NULL,
  
  -- Form info
  form_type TEXT NOT NULL, -- 'contact', 'newsletter', 'booking', etc.
  form_page TEXT NOT NULL,
  
  -- Submitter info (optional, depends on form)
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_company TEXT,
  inquiry_type TEXT,
  
  -- Journey info
  pages_before_submit INTEGER,
  time_to_submit_ms INTEGER, -- Total session time before submitting
  
  -- Attribution snapshot (denormalized for easy querying)
  channel TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_host TEXT,
  landing_page TEXT,
  
  -- Device snapshot
  device_type TEXT,
  country TEXT,
  
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for form submissions
CREATE INDEX idx_form_submissions_session_id ON analytics_form_submissions(session_id);
CREATE INDEX idx_form_submissions_form_type ON analytics_form_submissions(form_type);
CREATE INDEX idx_form_submissions_submitted_at ON analytics_form_submissions(submitted_at DESC);
CREATE INDEX idx_form_submissions_channel ON analytics_form_submissions(channel);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Daily traffic summary
CREATE OR REPLACE VIEW analytics_daily_traffic AS
SELECT 
  DATE(started_at) as date,
  COUNT(*) as sessions,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(CASE WHEN channel LIKE 'AI%' THEN 1 END) as ai_sessions,
  COUNT(CASE WHEN channel = 'Google Ads' THEN 1 END) as google_ads_sessions,
  COUNT(CASE WHEN channel = 'LinkedIn Ads' THEN 1 END) as linkedin_ads_sessions,
  COUNT(CASE WHEN channel LIKE 'Organic%' THEN 1 END) as organic_sessions,
  COUNT(CASE WHEN channel = 'Direct' THEN 1 END) as direct_sessions
FROM analytics_sessions
WHERE is_bot = FALSE
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Channel performance
CREATE OR REPLACE VIEW analytics_channel_performance AS
SELECT 
  channel,
  COUNT(*) as sessions,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  AVG(EXTRACT(EPOCH FROM (last_activity_at - started_at))) as avg_session_duration_seconds,
  COUNT(DISTINCT fs.id) as conversions
FROM analytics_sessions s
LEFT JOIN analytics_form_submissions fs ON s.session_id = fs.session_id
WHERE s.is_bot = FALSE
GROUP BY channel
ORDER BY sessions DESC;

-- Page performance
CREATE OR REPLACE VIEW analytics_page_performance AS
SELECT 
  path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(duration_ms) as avg_time_ms,
  AVG(max_scroll_depth_percent) as avg_scroll_depth,
  SUM(CASE WHEN exit_page THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as exit_rate
FROM analytics_page_views
GROUP BY path
ORDER BY views DESC;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access to sessions"
  ON analytics_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to page_views"
  ON analytics_page_views FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to events"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to form_submissions"
  ON analytics_form_submissions FOR ALL
  USING (auth.role() = 'service_role');

-- Allow anon to insert (for client-side tracking)
CREATE POLICY "Anon can insert sessions"
  ON analytics_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can insert page_views"
  ON analytics_page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can insert events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update session last activity
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analytics_sessions 
  SET last_activity_at = NOW(), updated_at = NOW()
  WHERE session_id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session on new page view
CREATE TRIGGER trigger_update_session_on_page_view
  AFTER INSERT ON analytics_page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_activity();

-- Trigger to update session on new event
CREATE TRIGGER trigger_update_session_on_event
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_activity();
