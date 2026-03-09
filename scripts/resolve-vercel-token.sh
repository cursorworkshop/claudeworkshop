#!/usr/bin/env bash

set -euo pipefail

trim_line_endings() {
  printf '%s' "$1" | tr -d '\r\n'
}

decode_b64_candidate() {
  local token_b64="$1"

  if [ -z "$token_b64" ]; then
    return 0
  fi

  VERCEL_TOKEN_B64="$token_b64" node -e 'process.stdout.write(Buffer.from(process.env.VERCEL_TOKEN_B64 || "", "base64").toString("utf8"))'
}

read_local_auth_token() {
  node - <<'NODE'
const fs = require('fs');
const os = require('os');
const path = require('path');

const candidates = [
  path.join(os.homedir(), '.vercel', 'auth.json'),
  path.join(os.homedir(), 'Library', 'Application Support', 'com.vercel.cli', 'auth.json'),
  path.join(os.homedir(), '.config', 'vercel', 'auth.json'),
];

for (const filePath of candidates) {
  if (!fs.existsSync(filePath)) continue;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (parsed && typeof parsed.token === 'string' && parsed.token.trim()) {
      process.stdout.write(parsed.token.trim());
      process.exit(0);
    }
  } catch {}
}
NODE
}

looks_like_vercel_token() {
  local candidate="$1"

  [ -n "$candidate" ] || return 1
  [[ "$candidate" =~ ^vca_[A-Za-z0-9]{56}$ ]]
}

raw_token="$(trim_line_endings "${VERCEL_TOKEN:-}")"
b64_token="$(trim_line_endings "${VERCEL_TOKEN_B64:-}")"
decoded_b64_token="$(trim_line_endings "$(decode_b64_candidate "$b64_token")")"
local_auth_token="$(trim_line_endings "$(read_local_auth_token)")"

for candidate in "$decoded_b64_token" "$raw_token" "$local_auth_token"; do
  if looks_like_vercel_token "$candidate"; then
    printf '%s' "$candidate"
    exit 0
  fi
done

if [ -n "$decoded_b64_token" ] || [ -n "$raw_token" ] || [ -n "$local_auth_token" ]; then
  echo "No valid Vercel token candidate found via VERCEL_TOKEN_B64, VERCEL_TOKEN, or local Vercel auth." >&2
  echo "Debug token lengths: raw_len=$(printf '%s' "$raw_token" | wc -c | tr -d ' '), decoded_b64_len=$(printf '%s' "$decoded_b64_token" | wc -c | tr -d ' '), local_auth_len=$(printf '%s' "$local_auth_token" | wc -c | tr -d ' ')" >&2
  echo "Debug token shapes: raw_matches_pattern=$([ -n "$raw_token" ] && looks_like_vercel_token "$raw_token" && echo yes || echo no), decoded_b64_matches_pattern=$([ -n "$decoded_b64_token" ] && looks_like_vercel_token "$decoded_b64_token" && echo yes || echo no), local_auth_matches_pattern=$([ -n "$local_auth_token" ] && looks_like_vercel_token "$local_auth_token" && echo yes || echo no)" >&2
  exit 1
fi

echo "Missing required secret: VERCEL_TOKEN or VERCEL_TOKEN_B64 (and no local Vercel auth token was found)" >&2
exit 1
