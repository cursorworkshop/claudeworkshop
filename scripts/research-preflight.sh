#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_PATH="${1:-}"
FAILURES=0

append_report() {
  local line="${1:-}"
  if [ -n "$REPORT_PATH" ]; then
    printf '%s\n' "$line" >>"$REPORT_PATH"
  fi
}

pass() {
  append_report "- OK: $1"
}

fail() {
  append_report "- FAIL: $1"
  FAILURES=$((FAILURES + 1))
}

require_secret() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$(printf '%s' "$value" | tr -d '\r\n')" ]; then
    fail "Missing required secret: $name"
    return 1
  fi
  pass "Secret present: $name"
}

check_repo_access() {
  local repo="$1"
  if gh repo view "$repo" --json name >/dev/null 2>&1; then
    pass "GitHub repo access works for $repo"
    return 0
  fi
  fail "GitHub repo access failed for $repo"
  return 1
}

check_vercel_access() {
  local label="$1"
  local project_id="$2"

  if VERCEL_VERIFY_PROJECT_ID="$project_id" bash "$SCRIPT_DIR/verify-vercel-access.sh" >/dev/null 2>&1; then
    pass "Vercel auth works for $label"
    return 0
  fi
  fail "Vercel auth failed for $label"
  return 1
}

if [ -n "$REPORT_PATH" ]; then
  mkdir -p "$(dirname "$REPORT_PATH")"
  : >"$REPORT_PATH"
  append_report "# Research Preflight Report"
  append_report
  append_report "- Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  append_report "- Repository: ${GITHUB_REPOSITORY:-cursorworkshop/cursorworkshop}"
  append_report "- Workflow: ${GITHUB_WORKFLOW:-local}"
  append_report "- Run ID: ${GITHUB_RUN_ID:-local}"
  append_report
fi

require_secret OPENAI_API_KEY || true
require_secret OPENAI_TEXT_MODEL || true
require_secret OPENAI_IMAGE_MODEL || true
require_secret AUTH_TOKEN || true
require_secret CT0 || true
require_secret RESEND_API_KEY || true
require_secret RESEARCH_NOTIFY_EMAILS || true
require_secret RESEARCH_NOTIFY_FROM || true
require_secret RESEARCH_NOTIFY_REPLY_TO || true
require_secret BRAND_SYNC_TOKEN || true
require_secret VERCEL_ORG_ID || true
require_secret VERCEL_PROJECT_ID || true
require_secret VERCEL_CLAUDE_PROJECT_ID || true
require_secret VERCEL_CODEX_PROJECT_ID || true

check_vercel_access "cursorworkshop.com" "${VERCEL_PROJECT_ID:-}" || true
check_vercel_access "claudeworkshop.com" "${VERCEL_CLAUDE_PROJECT_ID:-}" || true
check_vercel_access "codexworkshop.com" "${VERCEL_CODEX_PROJECT_ID:-}" || true

check_repo_access "cursorworkshop/claudeworkshop" || true
check_repo_access "cursorworkshop/codexworkshop" || true

if [ "$FAILURES" -gt 0 ]; then
  append_report
  append_report "Result: FAIL ($FAILURES issue(s))"
  exit 1
fi

append_report
append_report "Result: PASS"
