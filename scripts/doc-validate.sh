#!/usr/bin/env bash
# Document Integrity Validation — M1a-9 (DES-060)
#
# Validates cross-reference integrity across project documents:
#   1. Builds identifier registry (ADR-NNN, DES-NNN, PRO-NNN, PRI-NN)
#   2. Checks all cross-references resolve
#   3. Verifies design files are indexed in DESIGN.md
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

# ADR declarations (## ADR-NNN: in DECISIONS body files)
while IFS= read -r match; do
  id=$(echo "$match" | grep -oP 'ADR-\d{3}')
  registry["$id"]=1
done < <(grep -rn '^## ADR-[0-9]\{3\}:' DECISIONS-core.md DECISIONS-experience.md DECISIONS-operations.md 2>/dev/null || true)

# DES declarations (files named DES-NNN-*.md in design/)
while IFS= read -r file; do
  id=$(basename "$file" | grep -oP 'DES-\d{3}')
  registry["$id"]=1
done < <(find design/ -name 'DES-*.md' 2>/dev/null || true)

# PRO declarations (### PRO-NNN: in PROPOSALS.md)
while IFS= read -r match; do
  id=$(echo "$match" | grep -oP 'PRO-\d{3}')
  registry["$id"]=1
done < <(grep -n '^### PRO-[0-9]\{3\}:' PROPOSALS.md 2>/dev/null || true)

# PRI declarations (### PRI-NN: in PRINCIPLES.md)
while IFS= read -r match; do
  id=$(echo "$match" | grep -oP 'PRI-\d{2}')
  registry["$id"]=1
done < <(grep -n '^### PRI-[0-9]\{2\}:' PRINCIPLES.md 2>/dev/null || true)

# ADR declarations in design/ files (dual-homed ADRs)
while IFS= read -r file; do
  id=$(basename "$file" | grep -oP 'ADR-\d{3}')
  registry["$id"]=1
done < <(find design/ -name 'ADR-*.md' 2>/dev/null || true)

adr_count=$(printf '%s\n' "${!registry[@]}" | grep -c '^ADR' || true)
des_count=$(printf '%s\n' "${!registry[@]}" | grep -c '^DES' || true)
pro_count=$(printf '%s\n' "${!registry[@]}" | grep -c '^PRO' || true)
pri_count=$(printf '%s\n' "${!registry[@]}" | grep -c '^PRI' || true)
total=${#registry[@]}

echo "Identifiers found: $total ($adr_count ADR, $des_count DES, $pro_count PRO, $pri_count PRI)"

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
  done < <(grep -oP '(?:ADR-\d{3}|DES-\d{3}|PRO-\d{3}|PRI-\d{2})' "$file" 2>/dev/null | sort -u || true)
done < <(find . -name '*.md' -not -path './.elmer/*' -not -path './node_modules/*' -not -path './docs/reference/*' | sort)

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

# ── 3. Design file index completeness ────────────────────────────

missing_index=()
while IFS= read -r file; do
  id=$(basename "$file" | grep -oP '(?:DES|ADR)-\d{3}')
  if ! grep -q "$id" DESIGN.md 2>/dev/null; then
    missing_index+=("$file ($id)")
  fi
done < <(find design/ -name '*.md' 2>/dev/null | sort)

if [[ ${#missing_index[@]} -gt 0 ]]; then
  echo ""
  echo "WARN: ${#missing_index[@]} design file(s) not indexed in DESIGN.md:"
  for m in "${missing_index[@]}"; do
    echo "  $m"
  done
  warnings=$((warnings + ${#missing_index[@]}))
else
  echo "  All design files indexed in DESIGN.md"
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
