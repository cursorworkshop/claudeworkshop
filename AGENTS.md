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
10. Once a bookmark candidate has been published, it must be marked as `done` in the scored CSV/JSON state and must not be selected again unless reuse is explicitly forced for debugging.
11. The default nightly research floor is `25` relevance. The selector should still choose top-down from the ranked list, but should not drop below that floor unless someone explicitly overrides it for a manual debug run.

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
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
2. In `cursorworkshop/claudeworkshop`:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. In `cursorworkshop/codexworkshop`:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### Proven production path

1. The authoritative production path is GitHub Actions plus Vercel CLI.
2. `.github/workflows/deploy.yml` is the production deploy workflow in all
   three repos.
3. On `cursorworkshop/claudeworkshop`, `deploy.yml` must:
   - run formatting and build verification
   - deploy `claudeworkshop.com`
   - sync the mirror repos' `VERCEL_*` secrets
   - sync `claudeworkshop` and `codexworkshop`
   - deploy both mirror sites from the freshly synced mirror clones
4. On `cursorworkshop/claudeworkshop` and `cursorworkshop/codexworkshop`,
   `deploy.yml` must deploy only that repo's own site.
5. Sync-generated mirror commits in the sibling repos should not trigger a
   second automatic deploy, because the source repo workflow already deployed
   those mirrors in the same rollout.
6. Local Vercel CLI deploys remain the manual fallback:
   - `vercel --prod --yes`
7. Workflow-only, docs-only, and mirror-sync-infrastructure commits should skip
   the production deploy path to avoid wasting Vercel quota.
8. If a workflow-only or docs-only source-repo commit still needs to be
   mirrored, use the manual mirror sync path:
   - `node scripts/sync-brand-sites.mjs --all --push`
   - or manually dispatch `.github/workflows/sync-brand-sites.yml`
     Those mirror sync commits should also skip production deploy.
9. Nightly research remains a source-repo-owned workflow, but it must keep the
   same deploy principle:
   - deploy source
   - sync mirrors
   - deploy mirrors
   - the generated `chore: run research cycle [skip deploy]` commit must not
     trigger a second source `deploy.yml` rollout
10. Do not rely on Vercel's native Git auto-deploys for these repos.
11. If Vercel starts sending failure emails for push-triggered deploys again,
    check whether a Git repository is still connected to the project and
    disconnect it so GitHub Actions remains the single deploy authority.

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
5. Let `.github/workflows/deploy.yml` perform the production rollout.
6. The expected automatic rollout from the source repo is:
   - deploy `claudeworkshop.com`
   - sync mirrored commits into `claudeworkshop` and `codexworkshop`
   - deploy `claudeworkshop.com`
   - deploy `codexworkshop.com`
   - retry temporary Vercel quota/rate-limit windows instead of failing fast
7. Verify all three production domains after the workflow finishes.
8. Use a manual local CLI deploy only if the GitHub Actions path is degraded.

### Nightly research automation path

1. Only `cursorworkshop/claudeworkshop` owns the nightly research workflow.
2. `/api/automation/cron` should dispatch `cursorworkshop/claudeworkshop`
   `research-cycle.yml` by default, even when the request originates from a
   brand mirror domain.
3. The source workflow must:
   - generate the research package once
   - commit with the deploy-safe author
   - use the commit message `chore: run research cycle [skip deploy]`
   - deploy from the workflow workspace first, then push that committed result to `main`
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
   - is the authoritative production deploy workflow
   - deploys `claudeworkshop.com`
   - syncs the mirror repos
   - deploys `claudeworkshop.com` and `codexworkshop.com`
2. `.github/workflows/sync-brand-sites.yml`
   - is manual fallback only
   - pushes mirrored commits into the Claude and Codex repos
   - requires `BRAND_SYNC_TOKEN`
   - does not replace the main production deploy workflow

### Mirror repo workflows

1. `cursorworkshop/claudeworkshop/.github/workflows/deploy.yml`
   - deploys `claudeworkshop.com` on direct/manual mirror pushes
   - skips auto-deploy on sync-generated mirror commits because the source repo
     workflow already deployed that rollout
2. `cursorworkshop/codexworkshop/.github/workflows/deploy.yml`
   - deploys `codexworkshop.com` on direct/manual mirror pushes
   - skips auto-deploy on sync-generated mirror commits because the source repo
     workflow already deployed that rollout

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
6. If GitHub Actions is healthy, prefer the automated path over manual CLI.

### Deployment troubleshooting

1. Push succeeded but site did not change:
   - check whether `.github/workflows/deploy.yml` finished successfully
   - check whether a fresh `source: cli` production deployment exists in Vercel
   - if not, run `vercel --prod --yes` locally from the correct repo
   - check the commit author email on the shipped commit
2. Source site updated but Claude/Codex did not:
   - check the later source-workflow steps that sync and deploy mirrors
   - check whether mirrored commits landed in the sibling repos
   - if needed, run the manual fallback sync workflow and then deploy the
     affected mirror locally
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
   the same GitHub Actions plus Vercel CLI pathway before inventing a new one.

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

## CHANGELOG

1. Keep a repo changelog in `docs/CHANGELOG.md`.
2. For every repo change, prepend exactly one new line.
3. Line format:
   - `YYYY-MM-DD | what changed | key files changed | why this solves the issue`
4. Newest entry stays on top.
5. If a change spans `cursorworkshop`, `claudeworkshop`, `codexworkshop`, or
   `nautilus`, add the matching entry in each repo that actually changed.

## Non-Negotiables

1. No emojis in code, docs, or chat.
2. Never say something is validated unless you actually validated it.
3. Never leak secrets. Do not print `.env`, keys, tokens, or secret values in
   code, chat, logs, or pull requests.
4. If asked to pick up a build or deploy, own it to green or report the exact
   blocker plus the next step.
5. After every atomic change on `main`, push it to `origin main`. Do not leave
   committed local-only work behind.
6. If runtime behavior is testable, do not claim success without validating the
   real path you changed.
7. If full validation is impossible, state what you validated, why full
   validation was impossible, and what still remains pending.
8. Prefer minimal changes. Delete or simplify before adding parallel
   implementations.
9. If a feature is dead, duplicate, unlinked, or half-shipped, remove it
   instead of polishing around it.

## Work Style

1. Telegraph style is fine.
2. Noun phrases are fine.
3. Keep grammar simple.
4. Minimize tokens.
5. Default mantra: subtract first.
6. Keep only what changes outcome, proof, or decision.

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
