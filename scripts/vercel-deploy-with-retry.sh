#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VERCEL_TOKEN_CLEAN="$(bash "$SCRIPT_DIR/resolve-vercel-token.sh" | tr -d '\r\n')"
VERCEL_ORG_ID_CLEAN="$(printf '%s' "${VERCEL_ORG_ID:-}" | tr -d '\r\n')"
VERCEL_PROJECT_ID_CLEAN="$(printf '%s' "${VERCEL_PROJECT_ID:-}" | tr -d '\r\n')"
VERCEL_DEPLOY_MAX_ATTEMPTS="${VERCEL_DEPLOY_MAX_ATTEMPTS:-12}"
VERCEL_DEPLOY_BUFFER_SECONDS="${VERCEL_DEPLOY_BUFFER_SECONDS:-5}"

require_secret() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$(printf '%s' "$value" | tr -d '\r\n')" ]; then
    echo "Missing required secret: $name"
    exit 1
  fi
}

is_retryable_limit_error() {
  local output="$1"
  grep -Eq \
    'api-deployments-free-per-day|api-upload-free|Resource is limited|rate limit' \
    <<<"$output"
}

extract_retry_seconds() {
  local output="$1"
  local fallback_seconds=60

  if [[ "$output" =~ try\ again\ in\ ([0-9]+)\ (second|seconds|minute|minutes) ]]; then
    local amount="${BASH_REMATCH[1]}"
    local unit="${BASH_REMATCH[2]}"
    local seconds="$amount"

    if [[ "$unit" == minute || "$unit" == minutes ]]; then
      seconds=$((amount * 60))
    fi

    seconds=$((seconds + VERCEL_DEPLOY_BUFFER_SECONDS))
    echo "$seconds"
    return 0
  fi

  echo "$fallback_seconds"
}

deploy_with_retry() {
  local attempt=1

  while true; do
    local log_file
    log_file="$(mktemp)"

    set +e
    vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN_CLEAN" 2>&1 | tee "$log_file"
    local status=${PIPESTATUS[0]}
    set -e

    if [ "$status" -eq 0 ]; then
      rm -f "$log_file"
      return 0
    fi

    local output
    output="$(cat "$log_file")"
    rm -f "$log_file"

    if ! is_retryable_limit_error "$output"; then
      echo "Vercel deploy failed with a non-retryable error."
      return "$status"
    fi

    if [ "$attempt" -ge "$VERCEL_DEPLOY_MAX_ATTEMPTS" ]; then
      echo "Vercel deploy hit a retryable rate/quota limit, but max attempts were reached."
      return "$status"
    fi

    local retry_seconds
    retry_seconds="$(extract_retry_seconds "$output")"

    echo "Retryable Vercel limit encountered. Waiting ${retry_seconds}s before retry ${attempt}/${VERCEL_DEPLOY_MAX_ATTEMPTS}."
    sleep "$retry_seconds"

    attempt=$((attempt + 1))
  done
}

require_secret VERCEL_ORG_ID
require_secret VERCEL_PROJECT_ID

rm -rf .vercel
export VERCEL_ORG_ID="$VERCEL_ORG_ID_CLEAN"
export VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID_CLEAN"

vercel pull --yes --environment=production --token="$VERCEL_TOKEN_CLEAN"
vercel build --prod --token="$VERCEL_TOKEN_CLEAN"
deploy_with_retry
