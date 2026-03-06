# Agent Instructions for claudeworkshop.com

## Nautilus Subtool (Research Pipeline)

`Nautilus` is managed in its own repository: `https://github.com/rogierx/nautilus`.

When working on the automated research/image pipeline:

1. Treat `/Users/rogiermuller/Developer/nautilus` as source of truth.
2. Use `docs/nautilus/` in this repo only as a mirror/snapshot for integration.
3. If pipeline changes are made from a `cursorworkshop` branch (for example `codex/*`), port and push equivalent changes to `nautilus` before considering the work complete.
4. Always verify `nautilus` remote status (`origin`) so local-only pipeline changes are not left behind.
5. Nightly order must stay intact:
   - X bookmarks -> scored CSV/JSON
   - select best unselected candidate
   - build article + humanizer + hero image
   - publish to `/research` and wait until URL is live
   - post to LinkedIn
   - send Resend completion email to founders with source links + generation cost
6. LINKEDIN SAFETY RULE (NON-NEGOTIABLE): NEVER POST FROM A PERSONAL PROFILE. ALWAYS POST ONLY TO THE CURSORWORKSHOP ORGANIZATION PAGE.
7. LINKEDIN AUTHOR HARD LOCK (NON-NEGOTIABLE): LINKEDIN_ORGANIZATION_URN MUST BE EXACTLY `urn:li:organization:108842408`. REFUSE TO POST IF IT DOES NOT MATCH.
8. LINKEDIN APP HARD LOCK (NON-NEGOTIABLE): LINKEDIN_CLIENT_ID MUST BE EXACTLY `775wbb9ubr5s2x`. REFUSE TO POST IF IT DOES NOT MATCH.
9. LINKEDIN TOKEN POLICY (NON-NEGOTIABLE): DO NOT USE `LINKEDIN_REFRESH_TOKEN` IN THIS PIPELINE. ONLY `LINKEDIN_ACCESS_TOKEN` IS ALLOWED.

## Supabase Project

**IMPORTANT**: This repo shares the `cursorworkshop` Supabase project so backend behavior stays aligned across all brand mirrors.

When working with Supabase:

1. Only use the `cursorworkshop` Supabase project
2. Never use other projects like `nomovu` or any other unrelated project
3. Always verify the project name/ID before running migrations or SQL

## Analytics System

The analytics system tracks:

- Session data (referrer, UTM params, device, location)
- Page views with time spent
- Form submissions
- LLM/AI referrer detection (ChatGPT, Perplexity, Claude, etc.)

All analytics data goes to the cursorworkshop Supabase project.

## Outreach / Mailing Funnel

This repo includes a 3-step outreach drip system (Resend + Supabase) and an
ops-first admin dashboard to manage it.

### Sources And Enrollment

- Auto-enrolled sources (based on `leads.created_at`):
  - `white_paper_download`
  - `white_paper_landing`
  - `exit_intent`
- Manual sources must be enrolled explicitly by writing an `outreach_log` row
  with `step = 0` ("start").

Admin actions:

- `Start` (single lead): `POST /api/admin/outreach/start` (deduped by email)
- `Start all` (bulk): `POST /api/admin/outreach/start-all` (deduped by email)

### Scheduling Rules

Outreach steps live in:

- `src/lib/outreach-emails/email-1.ts` (Step 1, Day +2)
- `src/lib/outreach-emails/email-2.ts` (Step 2, Day +5)
- `src/lib/outreach-emails/email-3.ts` (Step 3, Day +10)

The scheduler runs via:

- `POST /api/cron/outreach` (Vercel cron in prod)
- `POST /api/admin/outreach/run` (admin "Run scheduler now")

Important:

- Scheduler sends only when a step is due (does not bypass schedule).
- Manual "Send next step now" bypasses schedule but remains sequential.

### De-Dupe Rules (Critical)

The system is contact-centric: the normalized email is the unique identifier.

- Admin outreach list is deduped by normalized email.
- Cron sender is deduped by normalized email and is idempotent by email+step.
- Archive/unsubscribe/delete operate across all `leads` rows that share the same
  normalized email.

### Template Rules (Greeting + Overrides)

Greeting rules:

- No title line in the email body (use the subject line instead).
- Greeting is included only if a first name exists, and is formatted as:
  `Rogier,` (no "Hi").
- If no name exists, the email starts directly with the first paragraph.

Implementation:

- Template body is minimal HTML (preferred) with `{{greeting}}` and optional
  tokens: `{{email}}`, `{{firstName}}`, `{{lastName}}`, `{{name}}`,
  `{{unsubscribeToken}}`
- Plain text bodies are supported and will be converted to minimal HTML.
- Rendering/wrapping is handled by `src/lib/outreach-emails/shared.ts`
- Outreach emails are sent as HTML + text fallback via Resend.

### Booking CTA + Tracking (Cal.com)

- Primary CTA uses Cal.com: `https://cal.com/claudeworkshop`
- Outreach emails link via redirect routes for click tracking:
  - `GET /r/call` (Cal.com)
  - `GET /r/luma` (Luma)
- Redirect tracking writes:
  - `analytics_sessions` (utm_medium = `email`, channel = `Email`)
  - `analytics_events` with event names:
    - `outreach_click_call`
    - `outreach_click_luma`
- Booking counts are fetched server-side from Cal.com API v2 in analytics summary:
  - requires `CALCOM_API_KEY` (server-only)
  - optional `CALCOM_API_VERSION` (default `2024-08-13`)
  - optional `CALCOM_API_BASE_URL` (default `https://api.cal.com`)

Admin template editing:

- Code provides defaults in `src/lib/outreach-emails/email-*.ts`
- Admin can override `subject` + `bodyHtml` in the dashboard (and reset to
  defaults).
- Overrides are stored in Supabase Storage:
  - bucket: `app-config`
  - object: `outreach/templates.json`
  - code: `src/lib/outreach-template-store.ts`

### Unsubscribe / Archive / Delete

- Unsubscribe link is appended automatically when `unsubscribeToken` is present
  (footer in `src/lib/outreach-emails/shared.ts`).
- Outreach emails set `replyTo` to `info@claudeworkshop.com`.
- Inbound replies to `info@claudeworkshop.com` are forwarded to:
  - `contact@rogyr.com`
  - `vasilis@vasilistsolis.com`
    (handled in `src/app/api/webhooks/resend/route.ts` via Resend receiving email forwarding).
- Unsubscribe endpoint: `GET /api/unsubscribe?token=...`
  - archives the contact across all duplicate lead rows by email.
- Admin archive/unarchive + name updates:
  - `PATCH /api/admin/leads` (applies by email across duplicates)
- Permanent delete:
  - `DELETE /api/admin/leads`
  - deletes all leads for that email and deletes `outreach_log` rows by email.

## Deployment

**IMPORTANT**: Production deploys use Vercel CLI in GitHub Actions (on `main`), with local CLI deploy as fallback.

When deploying:

1. Preferred path: push to `main` and let `.github/workflows/deploy.yml` run.
2. Required GitHub secrets for deploy workflow:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. If deploy auth fails, relink locally and refresh secrets from `.vercel/project.json`:
   - `vercel --prod --yes`
4. Local/manual fallback deploy remains:
   - `vercel --prod --yes`
5. Always run formatting before deploy to avoid lint/build failures:
   - `pnpm format`

## Multi-Repo Brand Mirrors

**IMPORTANT**: `cursorworkshop` is the source of truth. `claudeworkshop` and
`codexworkshop` are generated mirrors and should be updated from here.

When working across the three workshop sites:

1. Make product/site changes in `cursorworkshop` first.
2. Unless the user explicitly scopes a change to one brand, treat every
   requested product, content, design, and copy update as a shared change that
   must ship to all three sites:
   - `cursorworkshop`
   - `claudeworkshop`
   - `codexworkshop`
3. Shared media pools stay shared by default:
   - event photos, galleries, and other common image sets should appear across
     all brand mirrors unless the user explicitly asks for brand-specific media
4. Use the mirror script from this repo to fan changes out:
   - Local dry run / refresh mirrors: `pnpm sync:brands`
   - Push mirrors to GitHub: `pnpm deploy:brands`
5. The canonical sync engine is `scripts/sync-brand-sites.mjs`.
6. The automatic GitHub mirror path is `.github/workflows/sync-brand-sites.yml`
   and requires the `BRAND_SYNC_TOKEN` secret.
7. Each mirrored repo must keep its own deploy identity:
   - do not mirror `.vercel/`
   - do not mirror `.env.local`
   - do not mirror `.env.vercel`
8. Do not edit a dirty local sibling clone in place if it already contains
   unrelated work. Sync into a clean clone/root instead.
9. The mirror is intentionally one-way:
   - `cursorworkshop` -> `claudeworkshop`
   - `cursorworkshop` -> `codexworkshop`
   - never sync changes back from sibling repos into `cursorworkshop`
10. Keep backend behavior aligned across all three sites:
    - forms, lead capture, analytics, and outreach logic stay shared
    - only brand-facing defaults (names, domains, logos, repo names, CTA URLs,
      contact emails) should diverge per mirror
11. Do not blindly mirror cursor-only automation that could publish from the
    wrong brand context. Research/workflow fan-out is excluded on purpose unless
    explicitly configured per repo.

## Troubleshooting: Command Hanging Issues

### Git Commands Hanging

**Problem**: `git status`, `git add`, `git commit` hang indefinitely.

**Cause**: Claude's `gitWorker` process interferes with git operations.

**Fix**:

```bash
pkill -9 -f "gitWorker"
sleep 1
# Retry git command
```

### Build Commands Hanging

**Problem**: `npm run build` or `pnpm run build` hangs.

**Fix**:

```bash
# Kill dev servers and build processes
lsof -ti:3760 | xargs kill -9 2>/dev/null
pkill -9 -f "next build"
rm -rf .next
# Retry build
npm run build
```

**Note**: These are IDE/environment issues, not codebase problems. The repository itself is fine.
