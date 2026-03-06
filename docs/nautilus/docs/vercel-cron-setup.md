# Vercel Cron Setup (Auto-Generate Research)

This setup keeps generation fully automatic while staying minimal:

1. Vercel Cron runs every 2 days.
2. It hits `/api/automation/cron`.
3. That endpoint dispatches the GitHub `research-cycle.yml` workflow.
4. GitHub Actions runs the heavy pipeline (fetch X -> draft -> humanizer -> publish).

## 1. Configure Vercel Cron

`vercel.json` already contains:

```json
{
  "crons": [
    {
      "path": "/api/automation/cron",
      "schedule": "0 3 */2 * *"
    }
  ]
}
```

This means every 2 days at 03:00 UTC.

## 2. Add Vercel env vars

In Vercel Project Settings -> Environment Variables:

- `CRON_SECRET`: random long token
- `GITHUB_ACTIONS_TRIGGER_TOKEN`: GitHub PAT that can dispatch workflows
- Optional:
  - `RESEARCH_GH_OWNER=cursorworkshop`
  - `RESEARCH_GH_REPO=cursorworkshop`
  - `RESEARCH_GH_WORKFLOW_ID=research-cycle.yml`
  - `RESEARCH_GH_REF=main`

## 3. Create GitHub PAT (for dispatch only)

Create a fine-grained token scoped to `cursorworkshop/claudeworkshop` with:

- `Actions: Read and write`
- `Contents: Read`

Use this token as `GITHUB_ACTIONS_TRIGGER_TOKEN` in Vercel.

## 4. Keep pipeline secrets in GitHub

In GitHub repo secrets:

- `OPENAI_API_KEY`
- `X_AUTH_TOKEN`
- `X_CT0`
- Optional model overrides:
  - `OPENAI_TEXT_MODEL`
  - `OPENAI_IMAGE_MODEL`

## 5. Validate

Run once manually:

```bash
curl -i "https://www.claudeworkshop.com/api/automation/cron?token=$CRON_SECRET"
```

Expected:

- `202` + `status: queued` (workflow dispatched), or
- `202` + `status: skipped` (if one run is already in progress).

## Reliability note

If X fetch fails in one run, `run-cycle.mjs` now falls back to the latest usable scored
bookmark snapshot so generation can continue instead of hard-stopping.
