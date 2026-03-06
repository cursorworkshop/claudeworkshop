#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-cursorworkshop/cursorworkshop}"
LOCKED_LINKEDIN_CLIENT_ID="775wbb9ubr5s2x"
LOCKED_LINKEDIN_ORGANIZATION_URN="urn:li:organization:108842408"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install: https://cli.github.com/"
  exit 1
fi

echo "Setting secrets for ${REPO}"
echo "PERSONAL LINKEDIN POSTING IS FORBIDDEN. USE ONLY LINKEDIN_ORGANIZATION_URN."

echo -n "OPENAI_API_KEY: "
read -r -s OPENAI_API_KEY

echo

echo -n "X_AUTH_TOKEN: "
read -r -s X_AUTH_TOKEN

echo

echo -n "X_CT0: "
read -r -s X_CT0

echo

echo -n "LINKEDIN_CLIENT_ID (required, must be ${LOCKED_LINKEDIN_CLIENT_ID}): "
read -r -s LINKEDIN_CLIENT_ID

echo

echo -n "LINKEDIN_ACCESS_TOKEN (required): "
read -r -s LINKEDIN_ACCESS_TOKEN

echo

echo -n "RESEND_API_KEY (optional): "
read -r -s RESEND_API_KEY

echo

echo -n "RESEARCH_NOTIFY_EMAILS (optional, comma-separated): "
read -r RESEARCH_NOTIFY_EMAILS

echo

echo -n "RESEARCH_BASE_URL (optional, e.g. https://www.cursorworkshop.com/research): "
read -r RESEARCH_BASE_URL

echo

gh secret set OPENAI_API_KEY --repo "${REPO}" --body "${OPENAI_API_KEY}"
gh secret set X_AUTH_TOKEN --repo "${REPO}" --body "${X_AUTH_TOKEN}"
gh secret set X_CT0 --repo "${REPO}" --body "${X_CT0}"

if [ -z "${LINKEDIN_CLIENT_ID}" ] || [ "${LINKEDIN_CLIENT_ID}" != "${LOCKED_LINKEDIN_CLIENT_ID}" ]; then
  echo "LINKEDIN_CLIENT_ID must be exactly ${LOCKED_LINKEDIN_CLIENT_ID}."
  exit 1
fi
if [ -z "${LINKEDIN_ACCESS_TOKEN}" ]; then
  echo "LINKEDIN_ACCESS_TOKEN is required."
  exit 1
fi

gh secret set LINKEDIN_CLIENT_ID --repo "${REPO}" --body "${LINKEDIN_CLIENT_ID}"
gh secret set LINKEDIN_ACCESS_TOKEN --repo "${REPO}" --body "${LINKEDIN_ACCESS_TOKEN}"
gh secret set LINKEDIN_ORGANIZATION_URN --repo "${REPO}" --body "${LOCKED_LINKEDIN_ORGANIZATION_URN}"

# Remove disallowed legacy secrets for stricter org-only enforcement.
gh secret delete LINKEDIN_CLIENT_SECRET --repo "${REPO}" >/dev/null 2>&1 || true
gh secret delete LINKEDIN_REFRESH_TOKEN --repo "${REPO}" >/dev/null 2>&1 || true

if [ -n "${RESEND_API_KEY}" ]; then
  gh secret set RESEND_API_KEY --repo "${REPO}" --body "${RESEND_API_KEY}"
fi
if [ -n "${RESEARCH_NOTIFY_EMAILS}" ]; then
  gh secret set RESEARCH_NOTIFY_EMAILS --repo "${REPO}" --body "${RESEARCH_NOTIFY_EMAILS}"
fi
if [ -n "${RESEARCH_BASE_URL}" ]; then
  gh secret set RESEARCH_BASE_URL --repo "${REPO}" --body "${RESEARCH_BASE_URL}"
fi

echo "Secrets set successfully for ${REPO}."
echo "Locked LinkedIn policy applied:"
echo "- LINKEDIN_CLIENT_ID=${LOCKED_LINKEDIN_CLIENT_ID}"
echo "- LINKEDIN_ORGANIZATION_URN=${LOCKED_LINKEDIN_ORGANIZATION_URN}"
echo "- LINKEDIN_CLIENT_SECRET and LINKEDIN_REFRESH_TOKEN removed"
