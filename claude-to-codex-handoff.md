# Claude to Codex handoff

## What was done

### Part 1: Slop cleanup (COMPLETE)

Removed banned AI words/structures from 5 files per CLAUDE.md rules:

- `src/components/StunningEventDetails.tsx` - removed "stunning", "nestled in the picturesque", "breathtaking", "it's not just... it's..." structure
- `src/components/WorkshopDetails.tsx` - removed "dramatic, untamed landscapes, historic stone towers, and pristine coastline" (rule-of-three), "nestled", "stunning", "breathtaking", "renowned"
- `content/workshops/2025-10-20-claude-deep-dive/index.md` - removed 2 em dashes, "nestled"
- `content/sponsors/cursor.md` - changed "Seamless Migration" to "Easy Migration"
- `docs/agentic-methodology.md` - replaced 6 em dashes with periods, commas, or colons

All confirmed clean via grep. Zero remaining banned words in these files.

### Part 3: Outreach system (CODE COMPLETE, UNTESTED)

Created these new files:

1. **`src/lib/outreach-emails.ts`** - 3 drip email templates (day 2, 5, 10) matching the existing delivery email style exactly (same font stack, colors, layout, signature block, "limited availability" pill)
2. **`src/app/api/cron/outreach/route.ts`** - Vercel Cron handler that runs daily at 9:00 UTC. Queries leads table, matches to drip steps by `created_at` date offset, sends via Resend, logs to `outreach_log` table. Idempotent (checks for existing sends before sending).
3. **`src/app/api/webhooks/resend/route.ts`** - Resend webhook handler for open/click/bounce tracking. Updates `outreach_log` with `opened_at`, `clicked_at`, `bounced` fields. Validates svix headers if RESEND_WEBHOOK_SECRET is set.
4. **`src/app/api/admin/outreach/route.ts`** - Admin API endpoint for the outreach dashboard tab. Aggregates per-step metrics and timeline data.
5. **`vercel.json`** - Cron schedule config (`0 9 * * *`)
6. **`supabase/migrations/20260212_outreach_log.sql`** - Migration for `outreach_log` table with unique index on `(lead_id, step)`
7. **`src/app/email-preview/layout.tsx`** - Moved metadata (robots noindex) to layout since page became client component
8. **`src/app/email-preview/page.tsx`** - Updated to show all 4 emails (delivery + 3 drip) with tab navigation

Modified:

9. **`src/components/AdminDashboardClient.tsx`** - Added "Outreach" tab (7th tab) with: total sent metric, per-step cards showing open/click rates, step performance table, timeline bar chart of sends vs opens

## What was NOT done

### Part 2: Supabase leads query

Did not run the Supabase query to check lead numbers. This was a one-time check, not a code change. Can be done via:

```bash
# Via the admin dashboard at /admin/dashboard (Conversions tab shows leads)
# Or directly via Supabase dashboard
# Or via curl:
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/leads?select=*&order=created_at.desc&limit=100"
```

### Part 4: Build verification

The build (`npm run build`) fails due to **pre-existing dependency corruption**, not related to any changes in this PR. The errors are:

## Problems encountered

### 1. Corrupted node_modules (BLOCKING)

The `node_modules` directory has corrupted packages. Multiple symptoms:

- `es-toolkit@1.44.0` has missing internal files (used by `recharts`):
  - `Can't resolve '../dist/compat/predicate/isPlainObject.js'`
  - `Can't resolve '../_internal/compareValues.js'`
  - `Can't resolve '../dist/compat/object/get.js'`
  - `Can't resolve '../../function/ary.js'`
- `@alloc/quick-lru` has invalid `package.json` (used by `tailwindcss`)
- `unrs-resolver` has truncated `package.json` ("Unexpected end of JSON input")
- `next` binary is missing from its expected location
- `rm -rf node_modules` fails because directories cannot be removed ("Directory not empty")

**Fix**: Force remove and reinstall:

```bash
# The normal rm -rf fails. Try:
find node_modules -type f -delete
find node_modules -type d -empty -delete
rm -rf node_modules

# Then reinstall:
pnpm install
```

Or delete the directory from Finder, or reboot and try again.

### 2. next/font PostCSS plugin error (BLOCKING)

```
Error: [object Object] is not a PostCSS plugin
```

This appears during `next build` in `next/font` processing. Likely caused by version mismatch between the globally installed `next` (`/usr/local/lib/node_modules/next`) and the project's local `next@15.5.9`. The global next is being used for the build instead of the local one.

**Fix**: Either:

- Remove global next: `npm uninstall -g next`
- Or use local binary explicitly: `./node_modules/.bin/next build`

### 3. ETIMEDOUT errors during build (INTERMITTENT)

```
Module build failed: Error: ETIMEDOUT: connection timed out, read
```

Seen on `next/dist/server/htmlescape.js` and `next/dist/server/utils.js`. This is a filesystem timeout, possibly caused by:

- Corrupted pnpm hardlinks
- Slow disk I/O
- File system watchers (Claude, Spotlight, etc.)

### 4. git index.lock conflicts

Git operations occasionally fail with:

```
error: Unable to create '.git/index.lock': File exists
```

Caused by Claude's `gitWorker` process. Fix: `pkill -9 -f "gitWorker" && rm -f .git/index.lock`

### 5. TypeScript type errors (NON-BLOCKING, PRE-EXISTING)

`npx tsc --noEmit` reports many errors, all pre-existing:

- `next/server` and `next/navigation` have no type declarations (type version mismatch with next@15.5.9)
- `'event' is possibly null` in multiple page components
- `Module '"next/font/google/index.js"' has no exported member 'Inter'`
- `Module '"react-hook-form"' has no exported member 'FieldPath'`

These don't block the Next.js build (which uses its own compiler), but they exist.

## Environment vars needed for outreach

These need to be set in Vercel dashboard:

- `CRON_SECRET` - any random string, used to authenticate cron requests
- `RESEND_WEBHOOK_SECRET` - from Resend dashboard webhook settings (optional but recommended)

Existing vars already in use: `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Supabase migration to run

Run the SQL in `supabase/migrations/20260212_outreach_log.sql` against the cursorworkshop Supabase project. This creates the `outreach_log` table referenced by the cron and webhook handlers.

## Post-fix testing checklist

After fixing node_modules:

1. `npm run build` should succeed
2. Start dev server: `npm run dev`
3. Visit `/email-preview` to see all 4 email templates
4. Test cron locally: `curl -X POST http://localhost:3760/api/cron/outreach` (will return empty results without leads)
5. Check admin dashboard `/admin/dashboard` > Outreach tab
6. Run the Supabase migration
7. Set `CRON_SECRET` and `RESEND_WEBHOOK_SECRET` in Vercel
8. Deploy
