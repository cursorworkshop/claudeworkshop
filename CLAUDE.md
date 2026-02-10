# Claude Instructions for claudeworkshop.com

## Writing Style (Anti-AI-Slop Rules)

Follow these rules to avoid generic AI writing patterns:

### Banned Words and Phrases

Never use these overused AI words:

- additionally, crucial, delve, emphasizing, enduring, enhance, fostering
- garner, highlight, interplay, intricate, invaluable, landscape (figurative)
- leverage, multifaceted, nuanced, pivotal, realm, robust, seamless
- showcase, synergy, tapestry, testament, transformative, underscore
- utilize, vibrant, vital

Never use these promotional phrases:

- nestled, in the heart of, groundbreaking, renowned, commitment to
- natural beauty, exemplifies, boasts a, rich (figurative)

Never use these vague attributions:

- Industry reports, Observers note, Experts argue, Some critics suggest

### Banned Structures

- No em dashes (—). Use commas, periods, or rewrite.
- No "serves as" / "stands as" / "marks" / "represents". Just use "is".
- No "not only... but also" or "it's not just... it's..." parallelisms.
- No rule-of-three patterns ("adjective, adjective, and adjective").
- No "-ing" phrases tacked onto sentence ends to add fake analysis.
- No "In summary" / "In conclusion" / "Overall" section openers.
- No "It's important to note/remember/consider".
- No "Would you like..." / "I hope this helps" / "Certainly!".
- No title case in section headers (use sentence case).
- No excessive boldface for emphasis.

### Good Writing Principles

- Use simple "is/are/has" instead of fancy substitutes.
- Write short, direct sentences. Cut filler.
- Be specific. Name things. Give numbers.
- Start paragraphs with the point, not buildup.
- Vary sentence length. Mix short punchy lines with longer ones.
- Use active voice. "We train teams" not "Teams are trained by us".
- Sound like a person wrote it, not a press release.

## Client References

**NEVER mention specific client names** (like SAP, etc.). Instead use:

- "Fortune 100 companies"
- "Top EU enterprises"
- "Large enterprises"
- "Enterprise teams"

## Supabase Project Restriction

**CRITICAL**: Only use the `claudeworkshop` Supabase project.

- DO NOT use `nomovu` or any other Supabase project
- Always verify project ID before running Supabase MCP commands
- When listing projects, select only the claudeworkshop.com project

## Project Context

This is a Next.js 15 website for Claude Workshop - an AI development training company.

Key features:

- Training/workshop pages
- Contact forms with analytics tracking
- Admin dashboard at /admin for analytics
- Research/blog section at /research

## Research Writing Rules

When writing or editing research articles in `content/research/`:

1. **NO TL;DR** - Never include a tldr field or TL;DR section. We don't use these.
2. **Key Takeaways** - Use `keyTakeaways` array in frontmatter. These render as simple text (no underline, no heading).
3. **Article format**:
   - Start with a brief intro paragraph
   - Use `##` (h2) for main sections - these get a divider line underneath
   - **DO NOT use h3 (###)** - use `**bold text**` for subsections instead
   - Keep paragraphs concise
   - Use bullet points for lists
   - Include code examples where relevant
4. **Tables** - Use markdown tables, they render with full styling
5. **Links** - Always link to `/contact` for CTAs
6. **Images** - Guide hero images (full-width, 1920x1080). Style: Renaissance painting, semi-topical.

   **Prompt template:**
   "Renaissance oil painting. [PERIOD-APPROPRIATE SCENE]. Rich warm tones, dramatic lighting, classical composition. Full bleed, no frame, no border, no wall, no museum setting. 1920x1080 landscape."

   **Important rules:**
   - Translate tech concepts to Renaissance-era equivalents (NOT modern)
   - Managing agents → managing people/workers
   - Code structure → architectural blueprints/plans
   - Orchestration → conductor/maestro with musicians
   - Senior/junior → master craftsman and apprentice
   - NO computers, NO modern technology, NO screens
   - Full bleed (no edges, no frame visible), 1920x1080 landscape

7. **Author** - Default author is Rogier Muller
   - **LinkedIn URL: https://www.linkedin.com/in/rogyr/** (NOT /in/rogiermuller)
   - Always use `/in/rogyr/` for Rogier's LinkedIn profile

## Pre-Push Checks (MANDATORY)

**ALWAYS run these checks before pushing to main.** Vercel builds must succeed.

```bash
# 1. Format all changed files with Prettier
npx prettier --write .

# 2. Run TypeScript type checking
npx tsc --noEmit

# 3. Run ESLint
npx eslint . --ext .ts,.tsx

# 4. Run the full build (catches all errors)
npm run build
```

**Quick single command:**

```bash
npx prettier --write . && npx tsc --noEmit && npm run build
```

**Common issues to fix before pushing:**

- Prettier formatting errors (auto-fixed with `--write`)
- TypeScript type errors
- ESLint violations
- Unused imports/variables
- Missing dependencies
- Build-time errors in server components

**Do NOT push if any of these fail.** Fix all errors first.

## Deployment and Security

**Vercel deployment:**

- Site deploys automatically on push to main
- Environment variables are configured in Vercel dashboard
- RESEND_API_KEY, SUPABASE keys, ADMIN credentials are all in Vercel env

**Never commit these files** (already in .gitignore):

- `.env.local`, `.env` - local environment files
- `*credentials*.json`, `*client_secret*.json` - API credentials
- `**/.gemini/settings.json`, `**/mcp.json`, `**/mcp_settings.json` - MCP configs with tokens
- `*.sqlite`, `*.sqlite-journal` - local database files

## Analytics Architecture

Analytics uses Supabase (NOT SQLite) for persistent storage:

- Sessions table: visitor sessions with full attribution data
- Page views table: individual page visits with timing
- Events table: form submissions and custom events

The admin dashboard at /admin/dashboard shows:

- Traffic sources (including AI/LLM referrers)
- Page journey analysis
- Form submission details
- UTM campaign performance

## Troubleshooting: Git Commands Hanging

**SYMPTOM**: Git commands (like `git status`, `git add`, `git commit`) hang indefinitely without completing.

**ROOT CAUSE**: Claude Code's `gitWorker` process can interfere with git operations, causing them to hang. This happens when Claude Code's internal git worker process locks git operations.

**FIX**:

```bash
# Kill Claude Code's git worker processes
pkill -9 -f "gitWorker"

# Wait a moment, then retry git command
sleep 1
git status
```

**PREVENTION**: If git commands hang:

1. First try killing gitWorker: `pkill -9 -f "gitWorker"`
2. Wait 1-2 seconds
3. Retry the git command
4. If still hanging, restart Claude Code

**NOTE**: This is a known Claude Code issue and doesn't affect the codebase itself. The git repository is fine - it's just Claude Code's worker process interfering.

## Troubleshooting: Build Commands Hanging

**SYMPTOM**: `npm run build` or `pnpm run build` hangs during execution.

**POSSIBLE CAUSES**:

1. Port conflicts (dev server still running on port 3760)
2. File watchers holding locks
3. Memory issues with large builds

**FIX**:

```bash
# 1. Kill any running dev servers
lsof -ti:3760 | xargs kill -9 2>/dev/null

# 2. Kill any Next.js build processes
pkill -9 -f "next build"

# 3. Clear Next.js cache
rm -rf .next

# 4. Retry build
npm run build
```

**IF STILL HANGING**: Check for file system issues or restart your terminal/IDE.
