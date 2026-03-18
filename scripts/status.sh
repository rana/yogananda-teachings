#!/usr/bin/env bash
# System Status — M1a-10 (FTR-096)
#
# Prints a concise operational briefing. Claude's first action in any session.
# Reports version, milestone progress, health, document integrity, and open items.
#
# Usage: ./scripts/status.sh
# Exit: 0 = success

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "Portal Status — $(date +%Y-%m-%d)"
echo "──────────────────────────────────"

# ── Version & branch ─────────────────────────────────────────────

latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
branch=$(git branch --show-current)
commit_count=$(git rev-list --count HEAD)
last_commit=$(git log -1 --format='%h %s' 2>/dev/null)

echo "Version:     $latest_tag"
echo "Branch:      $branch"
echo "Commits:     $commit_count"
echo "Last commit: $last_commit"

# ── Neon database ────────────────────────────────────────────────

if [[ -n "${NEON_DATABASE_URL:-}" ]]; then
  chunk_count=$(psql "$NEON_DATABASE_URL" -t -c "SELECT COUNT(*) FROM book_chunks" 2>/dev/null | tr -d ' ' || echo "?")
  embed_count=$(psql "$NEON_DATABASE_URL" -t -c "SELECT COUNT(*) FROM book_chunks WHERE embedding IS NOT NULL" 2>/dev/null | tr -d ' ' || echo "?")
  book_count=$(psql "$NEON_DATABASE_URL" -t -c "SELECT COUNT(*) FROM books" 2>/dev/null | tr -d ' ' || echo "?")
  echo ""
  echo "Database:"
  echo "  Books:      $book_count"
  echo "  Chunks:     $chunk_count"
  echo "  Embeddings: $embed_count"
else
  echo ""
  echo "Database:    NEON_DATABASE_URL not set"
fi

# ── Document integrity ───────────────────────────────────────────

echo ""
echo "Document Integrity:"
if ./scripts/doc-validate.sh > /tmp/doc-validate-output.txt 2>&1; then
  identifiers=$(grep 'Identifiers found' /tmp/doc-validate-output.txt || echo "  unknown")
  echo "  $identifiers"
  echo "  Cross-ref errors: 0"
else
  echo "  Errors found — run ./scripts/doc-validate.sh for details"
fi

# ── Open questions & proposals ───────────────────────────────────

echo ""
open_questions=$(grep -c '^\- \[' CONTEXT.md 2>/dev/null | head -1 || echo "?")
proposed_ftrs=$(grep -rl '^state: proposed' features/ 2>/dev/null | wc -l || echo "0")
echo "Open questions: $open_questions (see CONTEXT.md)"
echo "Proposed FTRs:  $proposed_ftrs"

# ── Credential status ────────────────────────────────────────────

echo ""
echo "Credentials:"
check_var() {
  local name=$1
  local val="${!name:-}"
  if [[ -z "$val" || "$val" == "CHANGE_ME" ]]; then
    echo "  $name: MISSING"
  else
    echo "  $name: set"
  fi
}

check_var NEON_DATABASE_URL
check_var VOYAGE_API_KEY
check_var CONTENTFUL_SPACE_ID
check_var CONTENTFUL_MANAGEMENT_TOKEN
check_var NEXT_PUBLIC_SENTRY_DSN
check_var SENTRY_AUTH_TOKEN
