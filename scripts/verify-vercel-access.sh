#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VERCEL_TOKEN_CLEAN="$(bash "$SCRIPT_DIR/resolve-vercel-token.sh" | tr -d '\r\n')"
VERCEL_ORG_ID_CLEAN="$(printf '%s' "${VERCEL_ORG_ID:-}" | tr -d '\r\n')"
VERCEL_PROJECT_ID_CLEAN="$(printf '%s' "${VERCEL_PROJECT_ID:-}" | tr -d '\r\n')"
VERCEL_ENVIRONMENT_CLEAN="$(printf '%s' "${VERCEL_ENVIRONMENT:-production}" | tr -d '\r\n')"

require_secret() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$(printf '%s' "$value" | tr -d '\r\n')" ]; then
    echo "Missing required secret: $name" >&2
    exit 1
  fi
}

require_secret VERCEL_ORG_ID
require_secret VERCEL_PROJECT_ID

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

(
  cd "$tmp_dir"
  export VERCEL_ORG_ID="$VERCEL_ORG_ID_CLEAN"
  export VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID_CLEAN"
  vercel pull \
    --yes \
    --environment="$VERCEL_ENVIRONMENT_CLEAN" \
    --token="$VERCEL_TOKEN_CLEAN" \
    >/dev/null
)

printf '%s\n' "$VERCEL_PROJECT_ID_CLEAN"
