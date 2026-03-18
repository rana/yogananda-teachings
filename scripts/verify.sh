#!/usr/bin/env bash
# SRF Portal — Infrastructure Pre-Flight Check
#
# Verifies all configured services are reachable and functioning.
# Automatically detects which services are configured and tests them.
# Skips unconfigured services with a clear note.
#
# Usage:
#   ./scripts/preflight.sh              # Read-only connectivity tests
#   ./scripts/preflight.sh --write      # Include write tests (create + delete)
#   ./scripts/preflight.sh --verbose    # Show response details
#
# Governing refs: FTR-095, FTR-094, FTR-112

set -euo pipefail

WRITE_MODE=false
VERBOSE=false
for arg in "$@"; do
  case "$arg" in
    --write)   WRITE_MODE=true ;;
    --verbose) VERBOSE=true ;;
    --help)
      echo "Usage: $0 [--write] [--verbose]"
      echo "  --write    Test write access (creates and deletes ephemeral resources)"
      echo "  --verbose  Show response details"
      exit 0
      ;;
  esac
done

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
DIM='\033[2m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0

pass()   { ((PASS++)) || true; echo -e "  ${GREEN}✓${NC} $1"; }
fail()   { ((FAIL++)) || true; echo -e "  ${RED}✗${NC} $1${2:+ — $2}"; }
skip()   { ((SKIP++)) || true; echo -e "  ${DIM}—${NC} $1 ${DIM}(not configured)${NC}"; }
header() { echo -e "\n${BLUE}$1${NC}"; }
detail() { $VERBOSE && echo -e "    ${DIM}$1${NC}" || true; }

# ── Load .env.local ──
if [[ -f .env.local ]]; then
  set -a
  source <(grep -vE '^\s*(#|$)' .env.local) 2>/dev/null || true
  set +a
fi

echo ""
echo "SRF Portal — Pre-Flight Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Prerequisites ──
header "Prerequisites"
for cmd in curl jq; do
  command -v "$cmd" &>/dev/null \
    && pass "$cmd installed" \
    || fail "$cmd not found" "install: apt install $cmd / brew install $cmd"
done

HAS_PSQL=false
command -v psql &>/dev/null && { HAS_PSQL=true; pass "psql installed"; } \
  || skip "psql — database tests will use API fallback"

HAS_AWS=false
command -v aws &>/dev/null && { HAS_AWS=true; pass "aws CLI installed"; } \
  || skip "aws CLI — AWS tests will be skipped"

# ── Environment Variables ──
header "Environment Variables (required)"
check_var() {
  local name="$1" level="${2:-required}"
  local val="${!name:-}"
  if [[ -n "$val" ]]; then
    pass "$name"
  elif [[ "$level" == "required" ]]; then
    fail "$name is empty"
  else
    skip "$name"
  fi
}

check_var NEON_DATABASE_URL
check_var NEON_PROJECT_ID
check_var CONTENTFUL_SPACE_ID
check_var CONTENTFUL_ACCESS_TOKEN
check_var VOYAGE_API_KEY

header "Environment Variables (optional — needed for later milestones)"
check_var NEON_DATABASE_URL_DIRECT optional
check_var NEON_API_KEY optional
check_var CONTENTFUL_MANAGEMENT_TOKEN optional
check_var NEXT_PUBLIC_SENTRY_DSN optional
check_var SENTRY_AUTH_TOKEN optional
check_var AWS_REGION optional

# ══════════════════════════════════════════════════════
# Service connectivity tests
# ══════════════════════════════════════════════════════

# ── Neon PostgreSQL ──
header "Neon PostgreSQL"
if [[ -n "${NEON_DATABASE_URL:-}" ]] && $HAS_PSQL; then
  # Connection + version
  PG_VERSION=$(psql "${NEON_DATABASE_URL}" --no-psqlrc -tAc "SELECT version();" 2>&1) && {
    if echo "$PG_VERSION" | grep -q "PostgreSQL 18"; then
      pass "Connected — PostgreSQL 18"
    elif echo "$PG_VERSION" | grep -q "PostgreSQL"; then
      pass "Connected — $(echo "$PG_VERSION" | grep -oP 'PostgreSQL \d+')"
    else
      fail "Unexpected response" "$PG_VERSION"
    fi
    detail "$PG_VERSION"
  } || fail "Connection failed" "$PG_VERSION"

  # pgvector
  psql "${NEON_DATABASE_URL}" --no-psqlrc -tAc "SELECT '[1,2,3]'::vector;" &>/dev/null \
    && pass "pgvector extension loaded" \
    || fail "pgvector not available — run: CREATE EXTENSION IF NOT EXISTS vector"

  # pg_search
  PG_SEARCH=$(psql "${NEON_DATABASE_URL}" --no-psqlrc -tAc \
    "SELECT extname FROM pg_extension WHERE extname = 'pg_search';" 2>/dev/null)
  [[ "$PG_SEARCH" == "pg_search" ]] \
    && pass "pg_search extension loaded" \
    || skip "pg_search — not installed yet (created during schema migration)"

  # UUIDv7 (PG18 feature)
  UUID_RESULT=$(psql "${NEON_DATABASE_URL}" --no-psqlrc -tAc "SELECT gen_random_uuid();" 2>/dev/null) && {
    pass "UUID generation available"
    detail "Sample: $UUID_RESULT"
  } || skip "UUID generation"

  # Write tests (--write flag)
  if $WRITE_MODE; then
    header "Neon Write Tests (ephemeral — creates and deletes)"

    psql "${NEON_DATABASE_URL}" --no-psqlrc -c "
      CREATE TABLE IF NOT EXISTS _preflight_smoke (id serial PRIMARY KEY, val text);
      INSERT INTO _preflight_smoke (val) VALUES ('smoke-test');
      DO \$\$ BEGIN
        ASSERT (SELECT count(*) FROM _preflight_smoke WHERE val = 'smoke-test') > 0;
      END \$\$;
      DROP TABLE _preflight_smoke;
    " &>/dev/null \
      && pass "SQL write test (create → insert → assert → drop)" \
      || fail "SQL write test failed"

    psql "${NEON_DATABASE_URL}" --no-psqlrc -c "
      CREATE TABLE IF NOT EXISTS _preflight_vec (id serial, emb vector(3));
      INSERT INTO _preflight_vec (emb) VALUES ('[1,2,3]');
      SELECT id FROM _preflight_vec ORDER BY emb <-> '[3,2,1]' LIMIT 1;
      DROP TABLE _preflight_vec;
    " &>/dev/null \
      && pass "pgvector similarity search (create → insert → kNN → drop)" \
      || fail "pgvector write test failed"
  fi

elif [[ -z "${NEON_DATABASE_URL:-}" ]]; then
  skip "Neon — NEON_DATABASE_URL not set"
else
  skip "Neon — psql not installed (apt install postgresql-client)"
fi

# ── Contentful ──
header "Contentful"
if [[ -n "${CONTENTFUL_SPACE_ID:-}" && -n "${CONTENTFUL_ACCESS_TOKEN:-}" ]]; then
  RESP=$(curl -s -w "\n%{http_code}" \
    "https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}" \
    -H "Authorization: Bearer ${CONTENTFUL_ACCESS_TOKEN}" 2>&1)
  HTTP_CODE=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | sed '$d')
  if [[ "$HTTP_CODE" == "200" ]]; then
    SPACE_NAME=$(echo "$BODY" | jq -r '.name // "unnamed"' 2>/dev/null)
    pass "Delivery API — space: ${SPACE_NAME}"
    detail "Space ID: ${CONTENTFUL_SPACE_ID}"
  else
    MSG=$(echo "$BODY" | jq -r '.message // .sys.id // "unknown"' 2>/dev/null)
    fail "Delivery API — HTTP ${HTTP_CODE}" "$MSG"
  fi
else
  skip "Contentful Delivery API — CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN not set"
fi

if [[ -n "${CONTENTFUL_SPACE_ID:-}" && -n "${CONTENTFUL_MANAGEMENT_TOKEN:-}" ]]; then
  RESP=$(curl -s -w "\n%{http_code}" \
    "https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}" \
    -H "Authorization: Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}" 2>&1)
  HTTP_CODE=$(echo "$RESP" | tail -1)
  if [[ "$HTTP_CODE" == "200" ]]; then
    pass "Management API — authenticated"
  else
    fail "Management API — HTTP ${HTTP_CODE}"
  fi
else
  skip "Contentful Management API — token not set"
fi

# ── Voyage AI ──
header "Voyage AI"
if [[ -n "${VOYAGE_API_KEY:-}" ]]; then
  RESP=$(curl -s -w "\n%{http_code}" \
    "https://api.voyageai.com/v1/embeddings" \
    -H "Authorization: Bearer ${VOYAGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"input":["preflight smoke test"],"model":"voyage-4-large"}' 2>&1)
  HTTP_CODE=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | sed '$d')
  if [[ "$HTTP_CODE" == "200" ]]; then
    DIMS=$(echo "$BODY" | jq '.data[0].embedding | length' 2>/dev/null)
    if [[ "$DIMS" == "1024" ]]; then
      pass "Embeddings API — 1024 dimensions (voyage-4-large)"
    else
      fail "Unexpected dimensions: ${DIMS} (expected 1024)"
    fi
    USAGE=$(echo "$BODY" | jq -r '.usage.total_tokens // "?"' 2>/dev/null)
    detail "Tokens used: $USAGE"
  else
    MSG=$(echo "$BODY" | jq -r '.detail // "unknown error"' 2>/dev/null)
    fail "Embeddings API — HTTP ${HTTP_CODE}" "$MSG"
  fi
else
  skip "Voyage AI — VOYAGE_API_KEY not set"
fi

# ── Sentry ──
header "Sentry"
if [[ -n "${NEXT_PUBLIC_SENTRY_DSN:-}" ]]; then
  if echo "${NEXT_PUBLIC_SENTRY_DSN}" | grep -qE 'https://.*sentry\.io'; then
    pass "DSN format valid"
    detail "${NEXT_PUBLIC_SENTRY_DSN}"
  else
    fail "DSN format invalid" "expected: https://KEY@oORG.ingest.REGION.sentry.io/PROJECT"
  fi
else
  skip "Sentry DSN — NEXT_PUBLIC_SENTRY_DSN not set"
fi

if [[ -n "${SENTRY_AUTH_TOKEN:-}" ]]; then
  RESP=$(curl -s -w "\n%{http_code}" \
    "https://sentry.io/api/0/organizations/" \
    -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" 2>&1)
  HTTP_CODE=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | sed '$d')
  if [[ "$HTTP_CODE" == "200" ]]; then
    ORG_NAME=$(echo "$BODY" | jq -r '.[0].name // "unknown"' 2>/dev/null)
    pass "Auth token valid — org: ${ORG_NAME}"
  else
    fail "Auth token — HTTP ${HTTP_CODE}"
  fi
else
  skip "Sentry auth token — SENTRY_AUTH_TOKEN not set"
fi

# ── AWS ──
header "AWS"
if $HAS_AWS && [[ -n "${AWS_REGION:-}" ]]; then
  CALLER=$(aws sts get-caller-identity --output json 2>&1) && {
    ACCOUNT=$(echo "$CALLER" | jq -r '.Account')
    ARN=$(echo "$CALLER" | jq -r '.Arn')
    pass "Authenticated — account ${ACCOUNT}"
    detail "ARN: ${ARN}"
  } || fail "Authentication failed" "run: aws configure"

  # Secrets Manager
  SM_COUNT=$(aws secretsmanager list-secrets \
    --filter Key="name",Values="/portal" \
    --query 'length(SecretList)' \
    --region "${AWS_REGION}" \
    --output text 2>&1) && {
    if [[ "$SM_COUNT" -gt 0 ]]; then
      pass "Secrets Manager — ${SM_COUNT} /portal/* entries"
    else
      skip "Secrets Manager — no /portal/* entries yet (created by bootstrap.sh)"
    fi
  } || skip "Secrets Manager — access denied or not configured"

  # S3 Terraform state bucket
  if aws s3api head-bucket --bucket "srf-portal-terraform-state" 2>/dev/null; then
    pass "Terraform state bucket exists"
  else
    skip "Terraform state bucket — not created yet (created by bootstrap.sh)"
  fi
elif ! $HAS_AWS; then
  skip "AWS — aws CLI not installed"
else
  skip "AWS — AWS_REGION not set"
fi

# ══════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}${PASS} passed${NC}   ${RED}${FAIL} failed${NC}   ${DIM}${SKIP} skipped${NC}"
echo ""
if [[ $FAIL -eq 0 ]]; then
  echo -e "  ${GREEN}Pre-flight check passed.${NC}"
  if [[ $SKIP -gt 0 ]]; then
    echo -e "  ${DIM}Skipped services are not yet configured — expected before full setup.${NC}"
  fi
  if ! $WRITE_MODE; then
    echo -e "  ${DIM}Run with --write to also test create/delete access.${NC}"
  fi
else
  echo -e "  ${RED}Pre-flight check failed.${NC} Fix the issues above and re-run."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

[[ $FAIL -eq 0 ]]
