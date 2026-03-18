#!/usr/bin/env bash
# Deployment ceremony — M1c-18 (FTR-096 § Layer 3).
#
# Orchestrates full deployment:
#   1. doc-validate → 2. build → 3. release tag → 4. deploy manifest → 5. deploy → 6. health check
#
# CI-agnostic per FTR-108. Can be run locally or in CI.
#
# Usage:
#   ./scripts/deploy.sh [--skip-validate] [--skip-deploy] [--dry-run]

set -euo pipefail

SKIP_VALIDATE=false
SKIP_DEPLOY=false
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --skip-validate) SKIP_VALIDATE=true ;;
    --skip-deploy) SKIP_DEPLOY=true ;;
    --dry-run) DRY_RUN=true ;;
  esac
done

echo "════════════════════════════════════════════════════════════════"
echo " SRF Teachings Portal — Deployment Ceremony"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Document validation
if [ "$SKIP_VALIDATE" = false ]; then
  echo "▶ Step 1/6: Document validation"
  if [ -f scripts/doc-validate.sh ]; then
    bash scripts/doc-validate.sh || echo "  ⚠ Doc validation had warnings (advisory)"
  else
    echo "  ⚠ doc-validate.sh not found, skipping"
  fi
  echo ""
fi

# Step 2: Build
echo "▶ Step 2/6: Build"
if [ "$DRY_RUN" = true ]; then
  echo "  [dry-run] Would run: pnpm build"
else
  pnpm build
fi
echo ""

# Step 3: Release tag
echo "▶ Step 3/6: Release tag"
if [ -f scripts/release-tag.sh ]; then
  if [ "$DRY_RUN" = true ]; then
    echo "  [dry-run] Would run: bash scripts/release-tag.sh"
  else
    bash scripts/release-tag.sh || echo "  ⚠ Tagging skipped (may already be tagged)"
  fi
else
  echo "  ⚠ release-tag.sh not found, skipping"
fi
echo ""

# Step 4: Deploy manifest
echo "▶ Step 4/6: Deploy manifest"
if [ -f scripts/generate-deploy-manifest.sh ]; then
  bash scripts/generate-deploy-manifest.sh
else
  echo "  ⚠ generate-deploy-manifest.sh not found, skipping"
fi
echo ""

# Step 5: Deploy
if [ "$SKIP_DEPLOY" = false ]; then
  echo "▶ Step 5/6: Deploy to Vercel"
  if [ "$DRY_RUN" = true ]; then
    echo "  [dry-run] Would run: vercel --prod"
  else
    if command -v vercel &>/dev/null; then
      vercel --prod
    else
      echo "  ⚠ Vercel CLI not installed. Run: npm i -g vercel"
    fi
  fi
else
  echo "▶ Step 5/6: Deploy (skipped)"
fi
echo ""

# Step 6: Health check
echo "▶ Step 6/6: Health check"
if [ "$DRY_RUN" = true ] || [ "$SKIP_DEPLOY" = true ]; then
  echo "  [skipped] Health check requires a live deployment"
else
  HEALTH_URL="${DEPLOY_URL:-https://teachings.yogananda.org}/api/v1/health"
  echo "  Checking: $HEALTH_URL"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Health check passed (HTTP $HTTP_CODE)"
  else
    echo "  ✗ Health check failed (HTTP $HTTP_CODE)"
    exit 1
  fi
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo " Deployment ceremony complete"
echo "════════════════════════════════════════════════════════════════"
