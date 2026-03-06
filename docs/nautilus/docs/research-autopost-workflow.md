# Research Autopost Workflow

## Objective

Create high-signal research posts from fresh X bookmarks, then publish to `/research` with a matching LinkedIn snippet.

## SSOT

- Live bookmarks dataset:
  - `docs/nautilus/data/live/X-bookmarks.live.scored.json`
- Selection state:
  - `docs/nautilus/data/state/X-bookmarks.selection-state.json`
- Current candidate:
  - `docs/nautilus/data/state/X-bookmarks.next-research-candidate.json`
- Latest publish run:
  - `docs/nautilus/data/state/latest-publish.json`

## Step 1: Fetch + Score (daily)

```bash
node docs/nautilus/pipeline/fetch-bookmarks-to-csv.mjs \
  --out-dir docs/nautilus/data/live \
  --max-pages 100 \
  --top 20 \
  --bird-cmd "node tools/bird-fork/dist/index.js"
```

## Step 2: Select Candidate (nightly, one candidate per run)

```bash
node docs/nautilus/pipeline/select-next-research-candidate.mjs \
  --out-dir docs/nautilus/data \
  --min-relevance 65 \
  --mark-selected
```

## Step 3: Build + Humanize + Image + Publish Package

```bash
OPENAI_API_KEY=... \
node docs/nautilus/pipeline/build-and-publish-research.mjs \
  --candidate-json docs/nautilus/data/state/X-bookmarks.next-research-candidate.json \
  --state-dir docs/nautilus/data/state \
  --outbox-dir docs/nautilus/data/outbox \
  --min-relevance 65
```

This step:

- drafts the article
- runs a second humanizer pass
- generates a research image via OpenAI image API
- writes the article to `content/editorials/<slug>.mdx`
- updates image mapping in `src/components/ResearchList.tsx`
- writes LinkedIn draft + package snapshot in `docs/nautilus/data/outbox/...`

## Step 4: Deploy + Live Check + LinkedIn + Resend

After commit/push:

- deploy workflow publishes to production
- distribution step waits for `/research/<slug>` to be live
- posts to LinkedIn API with final article URL
- sends founders a Resend email with:
  - X bookmark used
  - research URL
  - LinkedIn URL
  - estimated generation cost

## Quality gates

- Candidate relevance must be `>= 65`.
- Article must stay technical and practical for agentic coders.
- No `###` headings in research content.
- Humanizer pass is mandatory before publish.
- If quality is weak, skip the cycle instead of posting filler.
