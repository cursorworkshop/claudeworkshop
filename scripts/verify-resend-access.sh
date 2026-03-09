#!/usr/bin/env bash

set -euo pipefail

RESEND_API_KEY_CLEAN="$(printf '%s' "${RESEND_API_KEY:-}" | tr -d '\r\n')"

if [ -z "$RESEND_API_KEY_CLEAN" ]; then
  echo "Missing required secret: RESEND_API_KEY" >&2
  exit 1
fi

curl --fail --silent --show-error \
  --header "Authorization: Bearer $RESEND_API_KEY_CLEAN" \
  --header "Content-Type: application/json" \
  "https://api.resend.com/domains" \
  >/dev/null

printf '%s\n' "resend_access_ok"
