# Agent Instructions for claudeworkshop.com

## Supabase Project

**IMPORTANT**: This project uses a dedicated Supabase project for claudeworkshop.com.

When working with Supabase:

1. Only use the `claudeworkshop` Supabase project
2. Never use other projects like `nomovu` or any other unrelated project
3. Always verify the project name/ID before running migrations or SQL

## Analytics System

The analytics system tracks:

- Session data (referrer, UTM params, device, location)
- Page views with time spent
- Form submissions
- LLM/AI referrer detection (ChatGPT, Perplexity, Claude, etc.)

All analytics data goes to the claudeworkshop Supabase project.

## Deployment

**IMPORTANT**: This project deploys using Vercel CLI only. Auto-deploy is NOT enabled.

When deploying:

1. Push changes to main branch first: `git push origin main`
2. Then deploy manually with: `vercel --prod --yes`
3. Environment variables are configured in Vercel dashboard
4. Always run `npx prettier --write .` before deploying to avoid build failures

## Troubleshooting: Command Hanging Issues

### Git Commands Hanging

**Problem**: `git status`, `git add`, `git commit` hang indefinitely.

**Cause**: Claude Code's `gitWorker` process interferes with git operations.

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
