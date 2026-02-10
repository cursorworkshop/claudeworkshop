-- Leads Table for Exit Intent and Lead Magnets
-- Tracks email signups from exit intent modal and other lead capture forms

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact info
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  
  -- Source tracking
  source TEXT NOT NULL, -- 'exit_intent_cheatsheet', 'newsletter', etc.
  page_url TEXT,
  
  -- Attribution (captured at signup time)
  session_id TEXT,
  channel TEXT,
  referrer_host TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Device/geo
  device_type TEXT,
  country TEXT,
  
  -- Status
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_channel ON leads(channel);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');
