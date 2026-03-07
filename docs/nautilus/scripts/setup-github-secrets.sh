#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-cursorworkshop/cursorworkshop}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install: https://cli.github.com/"
  exit 1
fi

echo "Setting research automation secrets for ${REPO}"

echo -n "OPENAI_API_KEY: "
read -r -s OPENAI_API_KEY

echo

echo -n "X_AUTH_TOKEN: "
read -r -s X_AUTH_TOKEN

echo

echo -n "X_CT0: "
read -r -s X_CT0

echo

echo -n "RESEND_API_KEY: "
read -r -s RESEND_API_KEY

echo

echo -n "RESEARCH_NOTIFY_EMAILS (optional, comma-separated): "
read -r RESEARCH_NOTIFY_EMAILS

echo

echo -n "RESEARCH_BASE_URL (optional, e.g. https://www.cursorworkshop.com/research): "
read -r RESEARCH_BASE_URL

echo

echo -n "RESEARCH_SITE_BASE_URLS (optional, comma-separated): "
read -r RESEARCH_SITE_BASE_URLS

echo

gh secret set OPENAI_API_KEY --repo "${REPO}" --body "${OPENAI_API_KEY}"
gh secret set X_AUTH_TOKEN --repo "${REPO}" --body "${X_AUTH_TOKEN}"
gh secret set X_CT0 --repo "${REPO}" --body "${X_CT0}"
gh secret set RESEND_API_KEY --repo "${REPO}" --body "${RESEND_API_KEY}"

if [ -n "${RESEARCH_NOTIFY_EMAILS}" ]; then
  gh secret set RESEARCH_NOTIFY_EMAILS --repo "${REPO}" --body "${RESEARCH_NOTIFY_EMAILS}"
fi
if [ -n "${RESEARCH_BASE_URL}" ]; then
  gh secret set RESEARCH_BASE_URL --repo "${REPO}" --body "${RESEARCH_BASE_URL}"
fi
if [ -n "${RESEARCH_SITE_BASE_URLS}" ]; then
  gh secret set RESEARCH_SITE_BASE_URLS --repo "${REPO}" --body "${RESEARCH_SITE_BASE_URLS}"
fi

gh secret delete LINKEDIN_CLIENT_ID --repo "${REPO}" >/dev/null 2>&1 || true
gh secret delete LINKEDIN_CLIENT_SECRET --repo "${REPO}" >/dev/null 2>&1 || true
gh secret delete LINKEDIN_ACCESS_TOKEN --repo "${REPO}" >/dev/null 2>&1 || true
gh secret delete LINKEDIN_REFRESH_TOKEN --repo "${REPO}" >/dev/null 2>&1 || true
gh secret delete LINKEDIN_ORGANIZATION_URN --repo "${REPO}" >/dev/null 2>&1 || true

echo "Secrets set successfully for ${REPO}."
echo "LinkedIn secrets removed from the automated research pipeline."
