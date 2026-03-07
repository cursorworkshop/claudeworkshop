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
   - publish to `claudeworkshop.com/research`
   - sync the exact same publish to `claudeworkshop.com/research` and `codexworkshop.com/research`
   - wait until the `/research/<slug>` URL is live on all three sites
   - send Resend completion email to founders with source links + generation cost
6. Research generation runs exactly once per cycle, in `cursorworkshop/claudeworkshop`.
7. `claudeworkshop` and `codexworkshop` do not run their own separate nightly research generation.
8. The automated research pipeline does not create or send LinkedIn posts. Do not add LinkedIn secrets or LinkedIn posting steps back into this job.
9. The nightly GitHub Actions cron for the production research cycle is `0 1 * * *` (01:00 UTC daily).

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

## Deployment Topology

**IMPORTANT**: Deployment is repo-specific and site-specific. Do not treat the
three workshop sites as one shared Vercel target.

### Repo -> Site -> Vercel project mapping

1. `cursorworkshop/claudeworkshop`
   - site: `https://www.claudeworkshop.com`
   - Vercel project: `cursorworkshop`
   - purpose: source of truth + deploys `claudeworkshop.com`
2. `cursorworkshop/claudeworkshop`
   - site: `https://www.claudeworkshop.com`
   - Vercel project: `claudeworkshop`
   - purpose: brand mirror + deploys `claudeworkshop.com`
3. `cursorworkshop/codexworkshop`
   - site: `https://www.codexworkshop.com`
   - Vercel project: `codexworkshop`
   - purpose: brand mirror + deploys `codexworkshop.com`

### Hard deployment rules

1. Each repo must deploy only its own site.
2. Each repo must point at its own matching Vercel project.
3. Never deploy `claudeworkshop` or `codexworkshop` from the source repo's
   `.vercel` link.
4. Never point multiple repos at the same Vercel project.
5. Never mirror `.vercel/`, `.env.local`, or `.env.vercel` between repos.
6. If a site is live but shows stale content, verify the repo-to-Vercel mapping
   before changing code.

### Required GitHub secrets by repo

1. In `cursorworkshop/claudeworkshop`:
   - `BRAND_SYNC_TOKEN`
2. Optional manual CLI fallback secrets in any repo:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### Proven production path

1. The currently proven production path is a local Vercel CLI production deploy
   from the repo that owns the site.
2. As of `2026-03-07`, the successful production deployments for:
   - `claudeworkshop.com`
   - `claudeworkshop.com`
   - `codexworkshop.com`
     were all created with `source: cli` in Vercel.
3. Use the Vercel CLI from the correct linked repo:
   - source repo -> `cursorworkshop` Vercel project
   - Claude mirror repo -> `claudeworkshop` Vercel project
   - Codex mirror repo -> `codexworkshop` Vercel project
4. The GitHub Actions workflow in `.github/workflows/deploy.yml` is build
   verification only.
5. Nightly research is the exception: `.github/workflows/research-cycle.yml`
   in `cursorworkshop/claudeworkshop` uses the Vercel CLI to deploy the source
   site and both mirror sites after sync.
6. GitHub pushes and mirror syncs are still required so repo history stays in
   sync, but they are not the reliable final step for getting the live site
   updated immediately.

### Commit author requirement for Vercel

1. Vercel can still attach Git metadata during CLI deploys.
2. If that Git metadata points at a commit authored by someone who does not
   have access to the `cursorworkshop` Vercel team, Vercel can fail the deploy
   with an author-access error.
3. The safe deploy author for this workspace is:
   - `Claude Workshop <info@claudeworkshop.com>`
4. Use a deploy-safe author on commits that are intended to ship.
5. Mirror sync commits must also use a deploy-safe author. The sync script in
   `scripts/sync-brand-sites.mjs` is expected to commit as
   `Claude Workshop <info@claudeworkshop.com>`.
6. If Vercel shows `Git author ... must have access to the team
cursorworkshop`, create a new follow-up commit with the deploy-safe author
   and redeploy from the local CLI.

### Standard production flow

1. Make the change in `cursorworkshop`.
2. Run formatting/build checks before pushing:
   - `pnpm format`
   - `pnpm build`
3. Commit with a deploy-safe author when the push is meant to trigger
   production:
   - `Claude Workshop <info@claudeworkshop.com>`
   - or another email that has access to the `cursorworkshop` Vercel team
4. Push `cursorworkshop` to `main`.
5. Deploy the source repo locally with:
   - `vercel --prod --yes`
6. Let `cursorworkshop/.github/workflows/sync-brand-sites.yml` or
   `pnpm deploy:brands` fan the same change out to:
   - `cursorworkshop/claudeworkshop`
   - `cursorworkshop/codexworkshop`
7. From a clean local clone of each mirror repo, link the matching Vercel
   project if needed and deploy with:
   - `vercel --prod --yes`
8. Verify all three production domains after the deploys finish.

### Nightly research automation path

1. Only `cursorworkshop/claudeworkshop` owns the nightly research workflow.
2. `/api/automation/cron` should dispatch `cursorworkshop/claudeworkshop`
   `research-cycle.yml` by default, even when the request originates from a
   brand mirror domain.
3. The source workflow must:
   - generate the research package once
   - commit with the deploy-safe author
   - deploy `claudeworkshop.com`
   - sync the same publish to `claudeworkshop` and `codexworkshop`
   - deploy both mirror sites with their own Vercel project IDs
   - wait for the new `/research/<slug>` URL to be live on all three sites
   - send the founders email
4. Do not add a separate research cron, selection state, or content generator
   to the mirror repos.

## Brand-Specific Funnel Rules

1. `claudeworkshop.com` is the only brand that currently has the white paper
   lead magnet enabled.
2. `claudeworkshop.com` and `codexworkshop.com` must not expose:
   - `/white-paper`
   - the exit-intent white paper modal
   - the public lead-magnet submission flow
3. When working on white paper, exit-intent, or lead-magnet code, keep that
   split intact unless the founders explicitly say the Claude and Codex white
   papers are ready.
4. If a shared UI change touches those flows, verify that Claude still works
   and Claude/Codex still stay disabled after the rollout.

### Source repo workflows

1. `.github/workflows/deploy.yml`
   - runs on push to `main`
   - runs build verification only
   - does not perform the production deploy
2. `.github/workflows/sync-brand-sites.yml`
   - runs on push to `main`
   - pushes mirrored commits into the Claude and Codex repos
   - requires `BRAND_SYNC_TOKEN`
   - does not itself complete the production rollout

### Mirror repo workflows

1. `cursorworkshop/claudeworkshop/.github/workflows/deploy.yml`
   - runs build verification only
2. `cursorworkshop/codexworkshop/.github/workflows/deploy.yml`
   - runs build verification only

### Manual deploy checklist

1. Before every deploy, confirm the repo is linked to the correct Vercel
   project:
   - `cursorworkshop` local repo -> `cursorworkshop`
   - `claudeworkshop` local repo -> `claudeworkshop`
   - `codexworkshop` local repo -> `codexworkshop`
2. The standard production command is:
   - `vercel --prod --yes`
3. If the repo is not linked correctly, relink before deploying.
4. When the source repo changed, deploy all three sites in this order:
   - `cursorworkshop`
   - `claudeworkshop`
   - `codexworkshop`
5. Do not treat the rollout as complete until all three domains show the new
   content.

### Deployment troubleshooting

1. Push succeeded but site did not change:
   - check whether a fresh `source: cli` production deployment exists in Vercel
   - if not, run `vercel --prod --yes` locally from the correct repo
   - check the commit author email on the shipped commit
2. Source site updated but Claude/Codex did not:
   - check `sync-brand-sites.yml`
   - check whether mirrored commits landed in the sibling repos
   - deploy each mirror repo locally with `vercel --prod --yes`
3. Mirror repo updated but live mirror site stayed old:
   - check the mirrored commit author email
   - confirm the local mirror repo is linked to the matching Vercel project
   - rerun `vercel --prod --yes` from that mirror repo
4. Vercel author-access failure:
   - look for `Git author ... must have access to the team cursorworkshop`
   - create a follow-up commit authored as
     `Claude Workshop <info@claudeworkshop.com>`
   - redeploy from the local CLI
5. If a deploy path worked once and the site is stale again, prefer repeating
   the same local CLI pathway before inventing a new one.

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
