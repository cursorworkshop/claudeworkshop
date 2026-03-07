# Research Autopost Workflow

## Objective

Create high-signal research posts from fresh X bookmarks, publish them to `/research`, and roll the same publish to all three workshop sites every night.

## SSOT

- Live bookmarks dataset:
  - `data/live/X-bookmarks.live.scored.json`
- Selection state:
  - `data/state/X-bookmarks.selection-state.json`
- Current candidate:
  - `data/state/X-bookmarks.next-research-candidate.json`
- Latest publish run:
  - `data/state/latest-publish.json`

## Step 1: Fetch + Score

```bash
node pipeline/fetch-bookmarks-to-csv.mjs \
  --max-pages 100 \
  --top 20
```

## Step 2: Select Candidate

```bash
node pipeline/select-next-research-candidate.mjs \
  --min-relevance 65 \
  --mark-selected
```

## Step 3: Build + Humanize + Image + Publish Package

```bash
OPENAI_API_KEY=... \
node pipeline/build-and-package-research.mjs \
  --candidate-json data/state/X-bookmarks.next-research-candidate.json \
  --state-dir data/state \
  --outbox-dir data/outbox \
  --min-relevance 65
```

This step:

- drafts the article
- runs a second humanizer pass
- generates a research image via OpenAI image API
- writes the package snapshot in `data/outbox/...`

## Step 4: Apply + Deploy + Fan-Out

After commit/push:

- deploy `claudeworkshop.com`
- sync the same content into `claudeworkshop` and `codexworkshop`
- deploy both mirror sites
- wait for `/research/<slug>` to return `200` on all three
- send founders a Resend email with:
  - X bookmark used
  - all live research URLs
  - estimated generation cost

## Quality gates

- Candidate relevance must be `>= 65`.
- Article must stay technical and practical for agentic coders.
- No `###` headings in research content.
- Humanizer pass is mandatory before publish.
- If quality is weak, skip the cycle instead of posting filler.
