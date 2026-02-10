-- Add archived column to leads table for soft delete functionality
ALTER TABLE leads ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_leads_archived ON leads(archived);
