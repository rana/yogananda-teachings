#!/usr/bin/env bash
# Document Integrity Validation — M1a-9 (FTR-096)
#
# Validates cross-reference integrity across project documents:
#   1. Builds identifier registry (FTR-NNN, PRI-NN)
#   2. Checks all cross-references resolve
#   3. Verifies FTR files are indexed in FEATURES.md
#
# Usage: ./scripts/doc-validate.sh
# Exit: 0 = all checks pass, 1 = failures found

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

errors=0
warnings=0

echo "Document Integrity Check — $(date +%Y-%m-%d)"
echo "──────────────────────────────────────────────"

# ── 1. Build identifier registry ─────────────────────────────────

declare -A registry

# FTR declarations (files named FTR-NNN-*.md in features/)
while IFS= read -r file; do
  id=$(basename "$file" | grep -oP 'FTR-\d{3}')
  registry["$id"]=1
done < <(find features/ -name 'FTR-*.md' 2>/dev/null || true)

# PRI declarations (### PRI-NN: in PRINCIPLES.md)
while IFS= read -r match; do
  id=$(echo "$match" | grep -oP 'PRI-\d{2}')
  registry["$id"]=1
done < <(grep -n '^### PRI-[0-9]\{2\}:' PRINCIPLES.md 2>/dev/null || true)

ftr_count=$(printf '%s\n' "${!registry[@]}" | grep -c '^FTR' || true)
pri_count=$(printf '%s\n' "${!registry[@]}" | grep -c '^PRI' || true)
total=${#registry[@]}

echo "Identifiers found: $total ($ftr_count FTR, $pri_count PRI)"

# ── 2. Cross-reference resolution ────────────────────────────────

ref_count=0
dangling=()

# Scan all markdown files for identifier references
while IFS= read -r file; do
  while IFS= read -r ref; do
    ref_count=$((ref_count + 1))
    if [[ -z "${registry[$ref]:-}" ]]; then
      dangling+=("$file: $ref")
    fi
  done < <(grep -oP '(?:FTR-\d{3}|PRI-\d{2})' "$file" 2>/dev/null | sort -u || true)
done < <(find . -name '*.md' -not -path './node_modules/*' -not -path './docs/reference/*' -not -path './features/MIGRATION.md' | sort)

echo "Cross-references checked: $ref_count"

if [[ ${#dangling[@]} -gt 0 ]]; then
  echo ""
  echo "WARN: ${#dangling[@]} forward reference(s) (documents not yet created):"
  for d in "${dangling[@]}"; do
    echo "  $d"
  done
  warnings=$((warnings + ${#dangling[@]}))
else
  echo "  All cross-references resolve"
fi

# ── 3. FTR file index completeness ───────────────────────────────

missing_index=()
while IFS= read -r file; do
  id=$(basename "$file" | grep -oP 'FTR-\d{3}')
  if ! grep -q "$id" features/FEATURES.md 2>/dev/null; then
    missing_index+=("$file ($id)")
  fi
done < <(find features/ -name 'FTR-*.md' 2>/dev/null | sort)

if [[ ${#missing_index[@]} -gt 0 ]]; then
  echo ""
  echo "WARN: ${#missing_index[@]} FTR file(s) not indexed in FEATURES.md:"
  for m in "${missing_index[@]}"; do
    echo "  $m"
  done
  warnings=$((warnings + ${#missing_index[@]}))
else
  echo "  All FTR files indexed in FEATURES.md"
fi

# ── Summary ──────────────────────────────────────────────────────

echo ""
if [[ $errors -gt 0 ]]; then
  echo "RESULT: $errors error(s), $warnings warning(s)"
  exit 1
elif [[ $warnings -gt 0 ]]; then
  echo "RESULT: 0 errors, $warnings warning(s)"
  exit 0
else
  echo "RESULT: All checks passed"
  exit 0
fi
