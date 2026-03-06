-- Add structured name fields for outreach personalization and admin editing
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Backfill structured name fields from legacy `name` column when available
UPDATE leads
SET
  first_name = COALESCE(
    NULLIF(first_name, ''),
    NULLIF(split_part(trim(name), ' ', 1), '')
  ),
  last_name = COALESCE(
    NULLIF(last_name, ''),
    NULLIF(trim(regexp_replace(trim(COALESCE(name, '')), '^\S+\s*', '')), '')
  )
WHERE COALESCE(trim(name), '') <> '';

-- Keep `name` in sync for rows where only first/last are present
UPDATE leads
SET name = NULLIF(
  trim(
    concat_ws(' ', NULLIF(trim(first_name), ''), NULLIF(trim(last_name), ''))
  ),
  ''
)
WHERE COALESCE(trim(name), '') = ''
  AND (COALESCE(trim(first_name), '') <> '' OR COALESCE(trim(last_name), '') <> '');
