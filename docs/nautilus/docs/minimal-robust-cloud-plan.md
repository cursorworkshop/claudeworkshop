# Minimal + Robust Cloud Plan (Bookmarks -> Research -> LinkedIn)

## What “minimal but robust” means here
- Keep the moving parts small.
- Store state in plain JSON/CSV in the repo.
- Fail safely: if data quality is weak, skip publishing.
- Make every step reproducible from one command.

## The pipeline
1. Nightly: fetch newest bookmarks, score them, update CSV/JSON artifacts.
2. Every 3 days: pick the next candidate above a relevance threshold.
3. Draft cycle: generate a research draft + LinkedIn snippet + image prompt.
4. Humanizer pass: rewrite the draft/snippet so they read like a person wrote them.
5. Publish only if quality gates pass.

## What is already wired in this repo
- Nightly fetch workflow:
  - [.github/workflows/x-bookmarks-nightly.yml](/Users/rogiermuller/Developer/cursorworkshop/.github/workflows/x-bookmarks-nightly.yml)
- Candidate rotation workflow:
  - [.github/workflows/research-candidate-cadence.yml](/Users/rogiermuller/Developer/cursorworkshop/.github/workflows/research-candidate-cadence.yml)
- Fetch + score script:
  - [fetch-bookmarks-to-csv.mjs](/Users/rogiermuller/Developer/cursorworkshop/docs/nautilus/pipeline/fetch-bookmarks-to-csv.mjs)
- Candidate selector:
  - [select-next-research-candidate.mjs](/Users/rogiermuller/Developer/cursorworkshop/docs/nautilus/pipeline/select-next-research-candidate.mjs)
  - [build-and-publish-research.mjs](/Users/rogiermuller/Developer/cursorworkshop/docs/nautilus/pipeline/build-and-publish-research.mjs)

## Required secrets (free-friendly setup)
- `X_AUTH_TOKEN`
- `X_CT0`
- Optional later:
  - `OPENAI_API_KEY`
  - `LINKEDIN_ACCESS_TOKEN` (only if you automate posting)

## Why this works headless in the cloud
- Bird can read auth from env vars (`AUTH_TOKEN` and `CT0`) in CI.
- No browser login is needed inside CI when tokens are present.
- You can refresh tokens manually if X invalidates them.

## Draft + Humanizer + Image stage (recommended next)
1. Input:
  - `X-bookmarks.next-research-candidate.json`
2. Generate:
  - `content/editorials/<slug>.mdx` draft
  - LinkedIn preview text
  - image prompt
3. Humanizer pass:
  - Run a dedicated rewrite pass that removes AI writing tells while preserving facts.
4. Image generation:
  - Use OpenAI image API with the generated image prompt.
  - Save file to `public/images/editorials/<slug>.png`.
5. Publish:
  - Open PR (safe) or direct commit (faster but riskier).
  - Optional LinkedIn auto-post after article URL is live.

## Quality gates (do not skip)
- Candidate `relevance % >= 65`.
- At least 2 concrete source links verified manually or by script.
- Article contains practical implementation detail, not just commentary.
- Humanizer pass completed.
- Link in LinkedIn snippet points to the final live research URL.

## Reliability rules
- Idempotent outputs:
  - Same input file + state file should produce same pick.
- State file is source of truth:
  - `X-bookmarks.selection-state.json`
- Safe fallback:
  - If no high-quality candidate exists, publish nothing that cycle.
- Auditability:
  - Keep summary files committed so you can trace what happened each run.

## Cost and complexity
- Data refresh + scoring: free on GitHub Actions minutes.
- Candidate rotation: free.
- Paid part is only generation APIs (text/image), and you can cap usage by:
  - Running draft generation every 3 days.
  - Skipping image generation when confidence is low.
  - Stopping publish when quality gate fails.

## Suggested rollout
1. Week 1:
  - Keep nightly fetch and candidate rotation automated.
  - Draft and publish manually.
2. Week 2:
  - Automate draft + humanizer + image generation.
  - Keep final publish approval manual.
3. Week 3:
  - Auto-publish to `/research`.
  - Keep LinkedIn auto-post behind one final approval toggle.
