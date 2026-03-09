#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SHADOW_ROOT="${RESEARCH_SHADOW_ROOT:-$(mktemp -d)}"
OWN_SHADOW_ROOT="${RESEARCH_SHADOW_ROOT:+0}"
if [ -z "${RESEARCH_SHADOW_ROOT:-}" ]; then
  OWN_SHADOW_ROOT=1
fi

cleanup() {
  if [ "$OWN_SHADOW_ROOT" = "1" ]; then
    rm -rf "$SHADOW_ROOT"
  fi
}
trap cleanup EXIT

NAUTILUS_SHADOW_ROOT="$SHADOW_ROOT/nautilus"
mkdir -p "$NAUTILUS_SHADOW_ROOT"
rsync -a --delete "$PROJECT_ROOT/docs/nautilus/" "$NAUTILUS_SHADOW_ROOT/"

require_value() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$(printf '%s' "$value" | tr -d '\r\n')" ]; then
    echo "Missing required secret: $name" >&2
    exit 1
  fi
}

require_value OPENAI_API_KEY
require_value AUTH_TOKEN
require_value CT0
require_value RESEND_API_KEY
require_value VERCEL_ORG_ID
require_value VERCEL_PROJECT_ID
require_value VERCEL_CLAUDE_PROJECT_ID
require_value VERCEL_CODEX_PROJECT_ID

bash "$PROJECT_ROOT/scripts/verify-vercel-access.sh" >/dev/null
VERCEL_VERIFY_PROJECT_ID="$VERCEL_CLAUDE_PROJECT_ID" bash "$PROJECT_ROOT/scripts/verify-vercel-access.sh" >/dev/null
VERCEL_VERIFY_PROJECT_ID="$VERCEL_CODEX_PROJECT_ID" bash "$PROJECT_ROOT/scripts/verify-vercel-access.sh" >/dev/null

GH_TOKEN_VALUE="${GH_TOKEN:-${BRAND_SYNC_TOKEN:-}}"
if [ -n "$(printf '%s' "$GH_TOKEN_VALUE" | tr -d '\r\n')" ]; then
  export GH_TOKEN="$GH_TOKEN_VALUE"
fi
gh repo view cursorworkshop/claudeworkshop --json name >/dev/null
gh repo view cursorworkshop/codexworkshop --json name >/dev/null

MAX_PAGES="${NAUTILUS_MAX_PAGES:-100}"
TOP_N="${NAUTILUS_TOP_N:-20}"
MIN_RELEVANCE="${NAUTILUS_MIN_RELEVANCE:-25}"
MAX_DRAFT_ATTEMPTS="${NAUTILUS_MAX_DRAFT_ATTEMPTS:-3}"
MIN_WORD_COUNT="${NAUTILUS_MIN_WORD_COUNT:-450}"
MAX_WORD_COUNT="${NAUTILUS_MAX_WORD_COUNT:-1100}"
TARGET_WORD_COUNT="${NAUTILUS_TARGET_WORD_COUNT:-900}"

PIPELINE_STARTED_AT="${NAUTILUS_PIPELINE_STARTED_AT:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}"
export NAUTILUS_PIPELINE_STARTED_AT="$PIPELINE_STARTED_AT"

node "$NAUTILUS_SHADOW_ROOT/pipeline/fetch-bookmarks-to-csv.mjs" \
  --max-pages "$MAX_PAGES" \
  --top "$TOP_N"

node "$NAUTILUS_SHADOW_ROOT/pipeline/select-next-research-candidate.mjs" \
  --min-relevance "$MIN_RELEVANCE" \
  --cursor-repo "$PROJECT_ROOT"

CANDIDATE_JSON="$NAUTILUS_SHADOW_ROOT/data/state/X-bookmarks.next-research-candidate.json"
if [ ! -f "$CANDIDATE_JSON" ]; then
  echo "Missing shadow candidate output: $CANDIDATE_JSON" >&2
  exit 1
fi

CANDIDATE_STATUS="$(node -e "const fs=require('fs'); const x=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(x.status||''));" "$CANDIDATE_JSON")"
if [ "$CANDIDATE_STATUS" != "ok" ]; then
  echo "Shadow run found no publishable candidate above floor ${MIN_RELEVANCE}."
  printf '%s\n' "$NAUTILUS_SHADOW_ROOT" > "$SHADOW_ROOT/latest-shadow-root.txt"
  exit 0
fi

node "$NAUTILUS_SHADOW_ROOT/pipeline/build-and-package-research.mjs" \
  --candidate-json "$CANDIDATE_JSON" \
  --state-dir "$NAUTILUS_SHADOW_ROOT/data/state" \
  --outbox-dir "$NAUTILUS_SHADOW_ROOT/data/outbox" \
  --cursor-repo "$PROJECT_ROOT" \
  --min-relevance "$MIN_RELEVANCE" \
  --max-draft-attempts "$MAX_DRAFT_ATTEMPTS" \
  --min-word-count "$MIN_WORD_COUNT" \
  --max-word-count "$MAX_WORD_COUNT" \
  --target-word-count "$TARGET_WORD_COUNT"

node "$NAUTILUS_SHADOW_ROOT/pipeline/apply-package-to-cursorworkshop.mjs" \
  --cursor-repo "$PROJECT_ROOT"

node "$NAUTILUS_SHADOW_ROOT/pipeline/distribute-after-live.mjs" \
  --dry-run \
  --skip-live-check

printf '%s\n' "$NAUTILUS_SHADOW_ROOT" > "$SHADOW_ROOT/latest-shadow-root.txt"
printf '%s\n' "$NAUTILUS_SHADOW_ROOT"
