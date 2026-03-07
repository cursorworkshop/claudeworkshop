# Minimal + Robust Cloud Plan (Bookmarks -> Research -> Multi-Site Rollout)

## What “minimal but robust” means here

- Keep the moving parts small.
- Store state in plain JSON/CSV in the repo.
- Fail safely: if data quality is weak, skip publishing.
- Make every step reproducible from one command.

## The pipeline

1. Nightly: fetch newest bookmarks, score them, update CSV/JSON artifacts.
2. Pick the next candidate above a relevance threshold.
3. Draft cycle: generate a research draft + hero image package.
4. Humanizer pass: rewrite the draft so it reads like a person wrote it.
5. Publish only if quality gates pass.
6. Deploy the same article to all three workshop sites.

## Required secrets

- `X_AUTH_TOKEN`
- `X_CT0`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `BRAND_SYNC_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Reliability rules

- Idempotent outputs:
  - Same input file + state file should produce the same candidate pick.
- State file is source of truth:
  - `X-bookmarks.selection-state.json`
- Safe fallback:
  - If no high-quality candidate exists, publish nothing that cycle.
- Auditability:
  - Keep summary files committed so you can trace what happened each run.

## Suggested rollout

1. Keep nightly fetch, candidate rotation, article generation, and image generation automated.
2. Deploy `claudeworkshop.com` first, then sync/deploy Claude and Codex.
3. Treat the run as complete only when all three `/research/<slug>` URLs are live.
