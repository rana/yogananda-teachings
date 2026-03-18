#!/usr/bin/env bash
# Performance Budget Check — M2a-20 (PRI-07, FTR-003)
#
# Parses Next.js build output to enforce First Load JS budgets.
# The 100KB target (PRI-07) is aspirational; the CI threshold is set
# slightly higher to avoid false failures while still catching regressions.
#
# Usage: pnpm build 2>&1 | ./scripts/check-perf-budget.sh
#    or: ./scripts/check-perf-budget.sh < build-output.txt
#    or: ./scripts/check-perf-budget.sh path/to/build-output.txt
#
# Exit: 0 = all pages within budget, 1 = budget exceeded

set -euo pipefail

# ── Budget (FTR-012: tunable default, not architectural commitment) ──
# Value: 130 KB First Load JS per page
# Rationale: PRI-07 target is <100KB. CI threshold catches regressions
#   while allowing headroom for framework overhead + reader interactivity.
#   The shared JS baseline (~102KB) is mostly React + Next.js runtime.
#   Raised 120→128 in M2b: bookmarks, keyboard nav, scroll indicator (~4KB).
#   Raised 128→130 in M2b stretch: chapter breath transition (FTR-040) and
#   chapter nav link client wrapper add ~1KB justified reader UX.
# Evaluate: When shared JS drops below 90KB (framework upgrade) or
#   when any page consistently stays below 110KB for a milestone.
BUDGET_KB=130

# ── Read build output ────────────────────────────────────────────────

if [[ $# -ge 1 && -f "$1" ]]; then
  build_output=$(cat "$1")
else
  # Read from stdin (piped build output)
  build_output=$(cat -)
fi

# Verify we have Next.js route table output
if ! echo "$build_output" | grep -q "First Load JS"; then
  echo "ERROR: No Next.js build output found."
  echo "  Expected 'First Load JS' route table in input."
  echo ""
  echo "Usage:"
  echo "  pnpm build 2>&1 | ./scripts/check-perf-budget.sh"
  echo "  ./scripts/check-perf-budget.sh path/to/build-output.txt"
  exit 1
fi

echo "Performance Budget Check — $(date +%Y-%m-%d)"
echo "──────────────────────────────────────────────"
echo "Budget: ${BUDGET_KB} KB First Load JS per page"
echo ""

# ── Parse route table ────────────────────────────────────────────────

violations=0
checked=0
max_size=0
max_route=""

# Extract route lines: lines starting with tree characters (box-drawing)
# that contain a route path and two size columns.
# Format: ├ ƒ /route/path          SIZE_1    SIZE_2
# We want SIZE_2 (First Load JS).
while IFS= read -r line; do
  # Match route lines: start with box-drawing chars, contain a / path
  # Skip sub-variant lines (├   ├ /en, ├   └ /es) — these are locale
  # expansions of the parent route, same JS size.
  if ! echo "$line" | grep -qP '^[├└┌] [○●ƒ] /'; then
    continue
  fi

  # Extract route path (first / through end of path before whitespace)
  route=$(echo "$line" | grep -oP '/\S+')

  # Extract First Load JS size (the last size value on the line)
  # Sizes look like: "102 kB", "3.69 kB", "167 B", "1.2 MB"
  first_load=$(echo "$line" | grep -oP '[0-9]+\.?[0-9]*\s+[kKmMgG]?B' | tail -1)

  if [[ -z "$route" || -z "$first_load" ]]; then
    continue
  fi

  # Convert to KB
  size_num=$(echo "$first_load" | grep -oP '^[0-9]+\.?[0-9]*')
  size_unit=$(echo "$first_load" | grep -oP '[kKmMgG]?B$')

  case "$size_unit" in
    B)  size_kb=$(echo "$size_num / 1024" | bc -l) ;;
    kB) size_kb=$size_num ;;
    MB) size_kb=$(echo "$size_num * 1024" | bc -l) ;;
    *)  size_kb=$size_num ;;
  esac

  # Round to 1 decimal for comparison
  size_kb_int=$(printf "%.0f" "$size_kb")
  checked=$((checked + 1))

  # Track maximum
  if (( $(echo "$size_kb > $max_size" | bc -l) )); then
    max_size=$size_kb
    max_route=$route
  fi

  # Check budget
  if (( size_kb_int > BUDGET_KB )); then
    echo "  FAIL: ${route}"
    echo "        First Load JS: $(printf "%.1f" "$size_kb") kB (budget: ${BUDGET_KB} kB)"
    violations=$((violations + 1))
  fi

done <<< "$build_output"

# ── Extract shared JS baseline ───────────────────────────────────────

shared_size=$(echo "$build_output" | grep 'First Load JS shared by all' | grep -oP '[0-9]+\.?[0-9]*\s+[kKmMgG]?B' | head -1 || true)

# ── Summary ──────────────────────────────────────────────────────────

echo ""
echo "Routes checked: $checked"
if [[ -n "$shared_size" ]]; then
  echo "Shared JS baseline: $shared_size"
fi
echo "Largest page: ${max_route} ($(printf "%.1f" "$max_size") kB)"
echo ""

if [[ $violations -gt 0 ]]; then
  echo "RESULT: $violations page(s) exceed ${BUDGET_KB} kB budget"
  echo ""
  echo "To reduce JS size:"
  echo "  - Move client interactivity to smaller components"
  echo "  - Use dynamic imports for non-critical features"
  echo "  - Check for accidental client-side dependencies"
  echo "  - Run 'npx @next/bundle-analyzer' to identify large modules"
  exit 1
else
  echo "RESULT: All pages within ${BUDGET_KB} kB budget"
  exit 0
fi
