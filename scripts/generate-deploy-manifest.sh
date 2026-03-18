#!/usr/bin/env bash
# Generate deploy manifest — M1c-17 (FTR-096 § Layer 3).
#
# Creates /.well-known/deploy-manifest.json with version, timestamp,
# milestone, blast tier, design refs, and commit info.
#
# Usage:
#   ./scripts/generate-deploy-manifest.sh [version]

set -euo pipefail

VERSION="${1:-$(git describe --tags --always 2>/dev/null || echo 'dev')}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MILESTONE="1c"
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
COMMITS_SINCE_TAG=$(git rev-list --count "$(git describe --tags --abbrev=0 2>/dev/null || echo HEAD)"..HEAD 2>/dev/null || echo "0")

# Blast tier classification (T1-T5) from git diff
# T1: docs/config only, T2: styles/UI, T3: API/services, T4: schema/data, T5: infrastructure
CHANGED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || echo "")
BLAST_TIER="T1"
if echo "$CHANGED_FILES" | grep -qE '^terraform/|^\.github/|^scripts/bootstrap'; then
  BLAST_TIER="T5"
elif echo "$CHANGED_FILES" | grep -qE '^migrations/|^scripts/ingest'; then
  BLAST_TIER="T4"
elif echo "$CHANGED_FILES" | grep -qE '^lib/services/|^app/api/'; then
  BLAST_TIER="T3"
elif echo "$CHANGED_FILES" | grep -qE '^app/|globals\.css'; then
  BLAST_TIER="T2"
fi

# Design refs from changed files (grep @implements/@validates annotations)
DESIGN_REFS=$(grep -rh '@implements\|@validates' $CHANGED_FILES 2>/dev/null | \
  grep -oE '(ADR|DES|PRO)-[0-9]+' | sort -u | tr '\n' ',' | sed 's/,$//' || echo "")

# Output
OUT_DIR="public/.well-known"
mkdir -p "$OUT_DIR"

cat > "$OUT_DIR/deploy-manifest.json" << EOF
{
  "version": "$VERSION",
  "timestamp": "$TIMESTAMP",
  "milestone": "$MILESTONE",
  "commit": "$COMMIT",
  "commitsSinceTag": $COMMITS_SINCE_TAG,
  "blastTier": "$BLAST_TIER",
  "designRefs": "$DESIGN_REFS",
  "status": "deployed"
}
EOF

echo "Deploy manifest generated: $OUT_DIR/deploy-manifest.json"
echo "  Version: $VERSION"
echo "  Blast tier: $BLAST_TIER"
echo "  Design refs: ${DESIGN_REFS:-none}"
