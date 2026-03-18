#!/usr/bin/env bash
# SRF Portal — Infrastructure Bootstrap
#
# Creates all AWS infrastructure needed before the first `terraform apply`.
# Idempotent — safe to run multiple times (checks before creating).
#
# Prerequisites:
#   - AWS CLI v2 configured (aws configure --region us-west-2)
#   - GitHub CLI authenticated (gh auth login)
#   - Vercel CLI installed (npm i -g vercel)
#   - Terraform 1.7+ installed
#   - jq installed
#
# What this creates:
#   1. S3 bucket for Terraform state (versioned, encrypted, public-blocked)
#   2. DynamoDB table for Terraform state locks
#   3. GitHub OIDC provider + CI IAM role (portal-ci)
#   4. KMS key for Secrets Manager encryption
#   5. Secrets Manager entries (empty — populated during and after bootstrap)
#   6. Vercel OIDC provider + runtime IAM role (portal-vercel-runtime)
#   7. GitHub secrets for CI/CD
#
# After this script completes, tell Claude: "Bootstrap complete. Run terraform."
#
# Governing refs: FTR-095, FTR-106, FTR-110, FTR-112, FTR-113

set -euo pipefail

# ── Constants ──
PROJECT="srf-portal"
REGION="us-west-2"
BUCKET="${PROJECT}-terraform-state"
TABLE="${PROJECT}-terraform-locks"
KMS_ALIAS="alias/${PROJECT}-secrets"
CI_ROLE="${PROJECT}-ci"
VERCEL_ROLE="${PROJECT}-vercel-runtime"
SM_PREFIX="/portal/production"

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
DIM='\033[2m'
NC='\033[0m'

info()  { echo -e "  ${BLUE}→${NC} $1"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
err()   { echo -e "  ${RED}✗${NC} $1"; }
skip()  { echo -e "  ${DIM}—${NC} $1 ${DIM}(already exists)${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ══════════════════════════════════════════════════════
# Prerequisites
# ══════════════════════════════════════════════════════

check_prereqs() {
  info "Checking prerequisites..."
  local missing=0
  for cmd in aws gh jq terraform; do
    if ! command -v "$cmd" &>/dev/null; then
      err "$cmd not found"
      ((missing++)) || true
    fi
  done
  if [[ $missing -gt 0 ]]; then
    echo ""
    err "Install missing prerequisites and try again."
    exit 1
  fi
  ok "All tools installed (aws, gh, jq, terraform)"

  # AWS credentials
  aws sts get-caller-identity &>/dev/null || {
    err "AWS credentials not configured. Run: aws configure --region ${REGION}"
    exit 1
  }
  ok "AWS credentials valid"

  # GitHub auth
  gh auth status &>/dev/null 2>&1 || {
    err "GitHub CLI not authenticated. Run: gh auth login"
    exit 1
  }
  ok "GitHub CLI authenticated"

  # Must be in repo root
  [[ -f "${PROJECT_ROOT}/CLAUDE.md" ]] || {
    err "Run this script from the project root (or scripts/ directory)."
    exit 1
  }
  ok "Running from project root"
}

# ══════════════════════════════════════════════════════
# Context
# ══════════════════════════════════════════════════════

get_context() {
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  info "AWS Account: ${ACCOUNT_ID}"

  GITHUB_REPO=$(cd "$PROJECT_ROOT" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null) || {
    err "Not in a GitHub repository. Push to GitHub first."
    exit 1
  }
  info "GitHub repo: ${GITHUB_REPO}"
}

# ══════════════════════════════════════════════════════
# AWS Infrastructure
# ══════════════════════════════════════════════════════

create_s3_bucket() {
  if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
    skip "S3 bucket: ${BUCKET}"
    return
  fi
  info "Creating S3 bucket: ${BUCKET}"
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" >/dev/null
  aws s3api put-bucket-versioning \
    --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled
  aws s3api put-bucket-encryption \
    --bucket "$BUCKET" \
    --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
    '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}'
  ok "S3 bucket created (versioned, encrypted, public-blocked)"
}

create_dynamodb_table() {
  if aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" &>/dev/null; then
    skip "DynamoDB table: ${TABLE}"
    return
  fi
  info "Creating DynamoDB table: ${TABLE}"
  aws dynamodb create-table \
    --table-name "$TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" >/dev/null
  aws dynamodb wait table-exists --table-name "$TABLE" --region "$REGION"
  ok "DynamoDB table created (on-demand billing)"
}

create_github_oidc() {
  if aws iam list-open-id-connect-providers --output text 2>/dev/null \
    | grep -q "token.actions.githubusercontent.com"; then
    skip "GitHub OIDC provider"
    return
  fi
  info "Creating GitHub OIDC provider"
  aws iam create-open-id-connect-provider \
    --url "https://token.actions.githubusercontent.com" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" >/dev/null
  ok "GitHub OIDC provider created"
}

create_ci_role() {
  if aws iam get-role --role-name "$CI_ROLE" &>/dev/null; then
    skip "IAM role: ${CI_ROLE}"
    return
  fi
  info "Creating IAM role: ${CI_ROLE}"

  # Build trust policy from template
  local trust_policy
  trust_policy=$(sed \
    -e "s/ACCOUNT_ID/${ACCOUNT_ID}/g" \
    -e "s|GITHUB_ORG/GITHUB_REPO|${GITHUB_REPO}|g" \
    "${PROJECT_ROOT}/terraform/bootstrap/trust-policy.json")

  aws iam create-role \
    --role-name "$CI_ROLE" \
    --assume-role-policy-document "$trust_policy" \
    --description "SRF Portal CI — GitHub Actions OIDC" >/dev/null

  # Attach scoped policy
  aws iam put-role-policy \
    --role-name "$CI_ROLE" \
    --policy-name "${CI_ROLE}-policy" \
    --policy-document "file://${PROJECT_ROOT}/terraform/bootstrap/ci-policy.json"

  ok "IAM role created with CI permissions"
}

create_kms_key() {
  if aws kms describe-key --key-id "$KMS_ALIAS" --region "$REGION" &>/dev/null; then
    KMS_KEY_ID=$(aws kms describe-key --key-id "$KMS_ALIAS" --region "$REGION" \
      --query 'KeyMetadata.KeyId' --output text)
    skip "KMS key: ${KMS_ALIAS}"
    return
  fi
  info "Creating KMS key: ${KMS_ALIAS}"
  KMS_KEY_ID=$(aws kms create-key \
    --description "SRF Portal — Secrets Manager encryption" \
    --region "$REGION" \
    --query 'KeyMetadata.KeyId' \
    --output text)
  aws kms create-alias \
    --alias-name "$KMS_ALIAS" \
    --target-key-id "$KMS_KEY_ID" \
    --region "$REGION"
  ok "KMS key created"
}

create_sm_entries() {
  local entries=(
    "${SM_PREFIX}/neon/org-api-key"
    "${SM_PREFIX}/neon/database-url"
    "${SM_PREFIX}/neon/database-url-direct"
    "${SM_PREFIX}/neon/project-api-key"
    "${SM_PREFIX}/voyage/api-key"
    "${SM_PREFIX}/contentful/access-token"
    "${SM_PREFIX}/contentful/management-token"
    "${SM_PREFIX}/sentry/auth-token"
    "${SM_PREFIX}/sentry/dsn"
  )

  info "Ensuring Secrets Manager entries..."
  local created=0
  for entry in "${entries[@]}"; do
    if aws secretsmanager describe-secret --secret-id "$entry" --region "$REGION" &>/dev/null; then
      continue
    fi
    aws secretsmanager create-secret \
      --name "$entry" \
      --secret-string "placeholder" \
      --kms-key-id "${KMS_KEY_ID:-}" \
      --region "$REGION" >/dev/null 2>&1 || true
    ((created++)) || true
  done
  if [[ $created -gt 0 ]]; then
    ok "Created ${created} new Secrets Manager entries"
  else
    skip "All ${#entries[@]} Secrets Manager entries already exist"
  fi
}

# ══════════════════════════════════════════════════════
# Credentials (2 interactive prompts)
# ══════════════════════════════════════════════════════

prompt_credentials() {
  echo ""
  echo -e "  ${BLUE}── Credentials (2 prompts) ──${NC}"
  echo ""

  # Neon org API key
  info "Neon org API key"
  echo "    console.neon.tech → Organization Settings → API Keys → Create"
  echo -n "    Paste key (or Enter to skip): "
  read -r NEON_ORG_KEY
  if [[ -n "$NEON_ORG_KEY" ]]; then
    aws secretsmanager put-secret-value \
      --secret-id "${SM_PREFIX}/neon/org-api-key" \
      --secret-string "$NEON_ORG_KEY" \
      --region "$REGION" >/dev/null
    ok "Neon org key → Secrets Manager"
  else
    warn "Skipped — required for Terraform Neon provider"
  fi

  echo ""

  # Sentry auth token
  info "Sentry auth token"
  echo "    sentry.io → Settings → Auth Tokens → Create"
  echo "    Scopes: project:read, project:write, org:read"
  echo -n "    Paste token (or Enter to skip): "
  read -r SENTRY_TOKEN
  if [[ -n "$SENTRY_TOKEN" ]]; then
    aws secretsmanager put-secret-value \
      --secret-id "${SM_PREFIX}/sentry/auth-token" \
      --secret-string "$SENTRY_TOKEN" \
      --region "$REGION" >/dev/null
    ok "Sentry auth token → Secrets Manager"

    # Fetch org slug automatically
    SENTRY_ORG=$(curl -s "https://sentry.io/api/0/organizations/" \
      -H "Authorization: Bearer ${SENTRY_TOKEN}" | jq -r '.[0].slug // empty' 2>/dev/null)
    if [[ -n "$SENTRY_ORG" ]]; then
      ok "Sentry org slug: ${SENTRY_ORG}"
    else
      warn "Could not fetch Sentry org slug — set SENTRY_ORG GitHub secret manually"
    fi
  else
    warn "Skipped — required for Terraform Sentry provider"
  fi
}

# ══════════════════════════════════════════════════════
# Vercel
# ══════════════════════════════════════════════════════

setup_vercel() {
  echo ""
  echo -e "  ${BLUE}── Vercel ──${NC}"
  echo ""

  if [[ -f "${PROJECT_ROOT}/.vercel/project.json" ]]; then
    VERCEL_ORG_ID=$(jq -r '.orgId // empty' "${PROJECT_ROOT}/.vercel/project.json")
    VERCEL_PROJECT_ID=$(jq -r '.projectId // empty' "${PROJECT_ROOT}/.vercel/project.json")
    if [[ -n "$VERCEL_ORG_ID" ]]; then
      skip "Vercel project linked — org: ${VERCEL_ORG_ID}"
      return
    fi
  fi

  if ! command -v vercel &>/dev/null; then
    warn "Vercel CLI not installed — run: npm i -g vercel"
    warn "Then run: vercel link (from project root)"
    return
  fi

  info "Linking Vercel project..."
  echo "    Choose: Link to existing → No → enter project name"
  echo ""
  (cd "$PROJECT_ROOT" && vercel link) || {
    warn "Vercel linking failed or was cancelled"
    return
  }

  VERCEL_ORG_ID=$(jq -r '.orgId // empty' "${PROJECT_ROOT}/.vercel/project.json" 2>/dev/null)
  VERCEL_PROJECT_ID=$(jq -r '.projectId // empty' "${PROJECT_ROOT}/.vercel/project.json" 2>/dev/null)
  [[ -n "$VERCEL_ORG_ID" ]] && ok "Vercel linked — org: ${VERCEL_ORG_ID}"
}

create_vercel_oidc() {
  if ! command -v vercel &>/dev/null; then
    warn "Vercel OIDC setup skipped — install Vercel CLI first"
    return
  fi

  # Attempt to get team slug
  local team_slug
  team_slug=$(vercel team ls 2>/dev/null | awk 'NR>1 && /✓/ {print $1}' | head -1) || true

  if [[ -z "$team_slug" ]]; then
    # Try from vercel whoami
    team_slug=$(vercel whoami 2>/dev/null | tail -1 | tr -d ' ') || true
  fi

  if [[ -z "$team_slug" ]]; then
    warn "Could not determine Vercel team slug — create OIDC provider manually"
    warn "  IAM → Identity Providers → https://oidc.vercel.com/{team-slug}"
    return
  fi

  local oidc_url="oidc.vercel.com/${team_slug}"

  if aws iam list-open-id-connect-providers --output text 2>/dev/null | grep -q "oidc.vercel.com"; then
    skip "Vercel OIDC provider"
  else
    info "Creating Vercel OIDC provider: https://${oidc_url}"
    aws iam create-open-id-connect-provider \
      --url "https://${oidc_url}" \
      --client-id-list "urn:vercel:${team_slug}" \
      --thumbprint-list "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" >/dev/null
    ok "Vercel OIDC provider created"
  fi

  # Vercel runtime IAM role
  if aws iam get-role --role-name "$VERCEL_ROLE" &>/dev/null; then
    skip "IAM role: ${VERCEL_ROLE}"
    return
  fi

  info "Creating IAM role: ${VERCEL_ROLE}"
  local trust_policy
  trust_policy=$(sed \
    -e "s/ACCOUNT_ID/${ACCOUNT_ID}/g" \
    -e "s/VERCEL_TEAM_SLUG/${team_slug}/g" \
    "${PROJECT_ROOT}/terraform/bootstrap/vercel-trust-policy.json")

  aws iam create-role \
    --role-name "$VERCEL_ROLE" \
    --assume-role-policy-document "$trust_policy" \
    --description "SRF Portal — Vercel OIDC runtime (Bedrock + Secrets Manager)" >/dev/null

  aws iam put-role-policy \
    --role-name "$VERCEL_ROLE" \
    --policy-name "${VERCEL_ROLE}-policy" \
    --policy-document "file://${PROJECT_ROOT}/terraform/bootstrap/vercel-runtime-policy.json"

  VERCEL_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${VERCEL_ROLE}"
  ok "Vercel runtime role created"
}

# ══════════════════════════════════════════════════════
# GitHub Secrets
# ══════════════════════════════════════════════════════

set_github_secrets() {
  echo ""
  echo -e "  ${BLUE}── GitHub Secrets ──${NC}"
  echo ""

  info "Setting GitHub repository secrets..."
  cd "$PROJECT_ROOT"

  local ci_role_arn="arn:aws:iam::${ACCOUNT_ID}:role/${CI_ROLE}"

  gh secret set TF_STATE_BUCKET --body "$BUCKET"
  gh secret set TF_STATE_REGION --body "$REGION"
  gh secret set TF_LOCK_TABLE --body "$TABLE"
  gh secret set AWS_ROLE_ARN --body "$ci_role_arn"

  [[ -n "${NEON_ORG_KEY:-}" ]]       && gh secret set NEON_API_KEY --body "$NEON_ORG_KEY"
  [[ -n "${SENTRY_TOKEN:-}" ]]       && gh secret set SENTRY_AUTH_TOKEN --body "$SENTRY_TOKEN"
  [[ -n "${SENTRY_ORG:-}" ]]         && gh secret set SENTRY_ORG --body "$SENTRY_ORG"
  [[ -n "${VERCEL_ORG_ID:-}" ]]      && gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
  [[ -n "${VERCEL_PROJECT_ID:-}" ]]  && gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

  # Vercel API token (separate prompt)
  echo ""
  info "Vercel API token (for CI deployments)"
  echo "    vercel.com → Settings → Tokens → Create"
  echo -n "    Paste token (or Enter to skip): "
  read -r VERCEL_API_TOKEN
  if [[ -n "$VERCEL_API_TOKEN" ]]; then
    gh secret set VERCEL_TOKEN --body "$VERCEL_API_TOKEN"
    ok "VERCEL_TOKEN → GitHub secrets"
  else
    warn "Skipped — needed for CI deployments in Milestone 1c"
  fi

  ok "GitHub secrets configured"
}

# ══════════════════════════════════════════════════════
# Terraform init
# ══════════════════════════════════════════════════════

run_terraform_init() {
  echo ""
  echo -e "  ${BLUE}── Terraform ──${NC}"
  echo ""

  if [[ ! -d "${PROJECT_ROOT}/terraform" ]] || [[ ! -f "${PROJECT_ROOT}/terraform/main.tf" ]]; then
    warn "terraform/main.tf not found"
    warn "Claude creates Terraform configuration during Milestone 1c."
    warn "After that, re-run: cd terraform && terraform init"
    return
  fi

  info "Running terraform init..."
  cd "${PROJECT_ROOT}/terraform"
  terraform init \
    -backend-config="bucket=${BUCKET}" \
    -backend-config="key=terraform.tfstate" \
    -backend-config="region=${REGION}" \
    -backend-config="dynamodb_table=${TABLE}" \
    -backend-config="encrypt=true"
  ok "Terraform initialized with S3 backend"
}

# ══════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════

main() {
  echo ""
  echo "SRF Online Teachings Portal — Infrastructure Bootstrap"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Creates AWS infrastructure for Terraform, CI/CD, and OIDC federation."
  echo "  Idempotent — safe to run multiple times."
  echo ""

  check_prereqs
  get_context

  echo ""
  echo -e "  ${BLUE}── AWS Infrastructure ──${NC}"
  echo ""

  create_s3_bucket
  create_dynamodb_table
  create_github_oidc
  create_ci_role
  create_kms_key
  create_sm_entries
  prompt_credentials
  setup_vercel
  create_vercel_oidc
  set_github_secrets
  run_terraform_init

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "  ${GREEN}Bootstrap complete.${NC}"
  echo ""
  echo "  Next steps:"
  echo "    1. Tell Claude: \"Bootstrap complete. Run terraform.\""
  echo "    2. After Terraform: ./scripts/preflight.sh"
  echo ""
  echo "  Cost protection (manual, ~30 seconds):"
  echo "    Neon:   console.neon.tech → Billing → Alerts → \$50/mo"
  echo "    Vercel: vercel.com → Settings → Billing → Spend Management → \$50/mo"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

main "$@"
