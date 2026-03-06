# Research + LinkedIn Content Task (Manual-First, Automation-Ready)

## Goal
Publish one in-depth research article on `https://www.claudeworkshop.com/research` and one LinkedIn preview post for each cycle.

Cadence target: every other day (scheduler handled outside this repo).

Current phase: manual publishing.
Future phase: same workflow can run via Codex Desktop automation.

## Feasibility Verdict
Yes, this is feasible with current platform capabilities.

What is already possible:
- Pull the newest X bookmarks for the authenticated user through official X API bookmark endpoints.
- Filter bookmarked items for relevance to agentic coders.
- Generate a long-form research article in this repo's MDX format.
- Generate a LinkedIn "sneak preview" post that links to the article.
- Keep publishing manual for now (copy/paste final post and publish in LinkedIn UI).

What has constraints:
- X bookmarks require OAuth user auth and approved developer setup.
- LinkedIn organization posting by API requires proper permissions and page-role authorization.

## Required Inputs and Access

### 1) X Bookmarks Source (Primary)
- Account: `goretexsherpa`
- Endpoint family: `GET /2/users/:id/bookmarks`
- Requirements:
  - Approved X developer account
  - Project + App
  - OAuth user token (PKCE / 3-legged)
  - Scopes: `bookmark.read`, `tweet.read`, `users.read`

Operational notes:
- Always fetch latest bookmarks first, before selecting topic.
- Use `max_results` and `pagination_token` to traverse recent bookmarks.
- API docs note up to 800 most recent bookmarked posts are available via lookup.

### 2) LinkedIn Output Target
- Target output: post text for manual publication (this phase).
- Link strategy: final line should include the research article URL so LinkedIn renders a link preview.
- Future automation can post via API only after access review/permissions are confirmed for your specific app/page setup.

### 3) Writing Skill Requirement (Mandatory)
Use the Humanizer skill for article and LinkedIn copy cleanup.

Required rule:
- Do a normal draft pass first.
- Then run a dedicated Humanizer pass before final output.
- Keep factual meaning intact; improve natural voice and reduce AI-writing patterns.

Reference:
- https://github.com/blader/humanizer

## Repository-Aware Content Contract

### Research article location
- `content/editorials/<slug>.mdx`

### Required frontmatter shape
Use this structure:

```mdx
---
title: '...'
description: '...'
author: 'Rogier Muller'
authorUrl: 'https://www.linkedin.com/in/rogyr/'
publishedAt: 'YYYY-MM-DD'
category: 'cursor-features' | 'methodology' | 'ai-coding' | 'open-source'
tags:
  - ...
featured: false
metaTitle: '...'
metaDescription: '...'
keyTakeaways:
  - '...'
  - '...'
  - '...'
---
```

Hard rules from this repo:
- Do not add `tldr` frontmatter.
- Use `##` sections for primary structure.
- Do not use `###` headings; use bold subsection labels instead.
- Keep paragraphs concise.
- Include at least one meaningful code/config/process example when relevant.
- Use `/contact` for CTA links when needed.

Optional polish:
- Add or map a dedicated research image in `src/components/ResearchList.tsx` for the new slug.

## Per-Run Workflow

### Step 0: Freshness Guard (non-negotiable)
Before topic selection, fetch the newest bookmark set from X.
Never reuse a stale local shortlist as the first source of truth.

### Step 1: Build Candidate Pool from Newest Bookmarks
From latest bookmarks:
- Extract linked URL, author, post text, post date, engagement signals if available.
- Expand short links where possible.
- Drop items with missing source material.

### Step 2: Relevance Filter for Agentic Coders
Score each candidate from 0-2 on:
- Agentic coding depth
- Practicality for engineering teams
- Enterprise/team relevance
- Novelty/timeliness
- Evidence density (real examples, data, concrete architecture)

Keep only candidates with total score >= 7/10.

Reject candidates that are mostly:
- Pure hype
- Generic AI news with no engineering implications
- Off-topic domains for your audience

### Step 3: Pick Topic and Angle
Select one primary topic and one backup topic.
Check for overlap with existing articles in `content/editorials/` to avoid near-duplicates.

Angle template:
- What happened
- Why this matters for agentic coding teams
- What to do next (operational implications)

### Step 4: Draft Long-Form Research Article
Target depth: practical and evidence-led, not fluffy commentary.

Recommended structure:
1. Clear intro with concrete claim
2. What changed (facts + sources)
3. Technical implications for agentic coders
4. Implementation patterns and anti-patterns
5. Adoption checklist
6. Conclusion + CTA

### Step 5: Humanizer Pass (Mandatory)
Run a strict humanization pass on:
- Article body
- Title/description
- LinkedIn snippet

Must preserve factual claims and references.

### Step 6: Create LinkedIn Sneak-Preview Snippet
Write a short post that previews insight and points to the full research piece.

Style target:
- Similar rhythm to the example screenshot: conversational, specific, practical.
- Avoid buzzword-heavy language.
- End with the article URL on its own line to trigger preview.

Snippet template:
1. Hook: specific event or release
2. Core idea in plain language
3. Most interesting technical detail
4. Why it matters for real teams
5. Link to full article

### Step 7: Manual Publish Package
Prepare a handoff package with:
- Final MDX article path
- Final LinkedIn post text
- Source shortlist used for claims
- One-sentence "why this topic now"

## Quality Gates (Must Pass Before Publish)
- Newest bookmarks were fetched in this run before topic selection.
- Topic passed relevance threshold for agentic coders.
- Article follows repo format rules and frontmatter shape.
- No `tldr` field.
- Humanizer pass completed.
- LinkedIn post links to the corresponding research URL.
- Claims map back to real sources.

## Fallback Rules
- If X API access fails, stop and report blocker instead of fabricating topic selection.
- If newest bookmark batch has no qualifying topics, publish nothing for that cycle and produce a "no-ship" note with top rejected candidates.
- If selected topic overlaps heavily with a recent article, switch to backup topic.

## Useful Source Links
- Claude Workshop Research page: https://www.claudeworkshop.com/research
- X Bookmarks overview: https://docs.x.com/x-api/posts/bookmarks/introduction
- X Bookmarks quickstart (scopes): https://docs.x.com/x-api/posts/bookmarks/quickstart/bookmarks-lookup
- X Bookmarks integration guide (rate limits and 800 recent bookmarks note): https://docs.x.com/x-api/posts/bookmarks/integrate
- X bookmarks URL behavior (requires login): https://x.com/i/bookmarks
- LinkedIn API access and permission model: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- LinkedIn Community Management API migration and tier restrictions: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api-migration-guide
- LinkedIn article post permission details (`w_organization_social`, `w_member_social`): https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/advertising-targeting/version/article-ads-integrations
