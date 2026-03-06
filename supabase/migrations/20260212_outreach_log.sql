-- Outreach Log Table
-- Tracks drip email sends and engagement (opens, clicks, bounces)

CREATE TABLE IF NOT EXISTS outreach_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  email TEXT NOT NULL,
  step INTEGER NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_id TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced BOOLEAN NOT NULL DEFAULT false
);

-- Prevent duplicate sends per lead per step
CREATE UNIQUE INDEX idx_outreach_lead_step ON outreach_log(lead_id, step);

-- Query by resend_id for webhook lookups
CREATE INDEX idx_outreach_resend_id ON outreach_log(resend_id);

-- Query by sent_at for timeline views
CREATE INDEX idx_outreach_sent_at ON outreach_log(sent_at DESC);

-- Enable RLS
ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to outreach_log"
  ON outreach_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
