#!/usr/bin/env bash
# Release Tagging — M1a-11 (FTR-096)
#
# Creates annotated git tags with deployment metadata.
# Tag format: v{arc}{milestone}.{patch} (e.g., v1a.1, v1c.0)
#
# Usage: ./scripts/release-tag.sh v1a.3
# Exit: 0 = tag created, 1 = error

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <version>"
  echo "  Example: $0 v1a.1"
  echo ""
  echo "  Format: v{arc}{milestone}.{patch}"
  echo "  Examples: v1a.0 (first 1a release), v1c.3 (third 1c patch)"
  exit 1
fi

VERSION="$1"

# Validate format
if ! echo "$VERSION" | grep -qP '^v\d[a-z]\.\d+$'; then
  echo "ERROR: Invalid version format '$VERSION'"
  echo "  Expected: v{arc}{milestone}.{patch} (e.g., v1a.0, v2b.3)"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "ERROR: Uncommitted changes. Commit or stash before tagging."
  exit 1
fi

# Check tag doesn't already exist
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "ERROR: Tag '$VERSION' already exists."
  exit 1
fi

# ── Gather metadata ──────────────────────────────────────────────

milestone=$(echo "$VERSION" | grep -oP '(?<=v)\d[a-z]')
last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [[ -n "$last_tag" ]]; then
  commits_since=$(git rev-list --count "${last_tag}..HEAD")
  diff_range="${last_tag}..HEAD"
else
  commits_since=$(git rev-list --count HEAD)
  diff_range="HEAD"
fi

# ── Blast radius classification ──────────────────────────────────

changed_files=$(git diff --name-only "$diff_range" 2>/dev/null || git diff --name-only HEAD~"$commits_since" HEAD 2>/dev/null || echo "")

blast_tier="T1"
if echo "$changed_files" | grep -qE '^(terraform/|\.github/workflows/)'; then
  blast_tier="T5"
elif echo "$changed_files" | grep -qE '^migrations/'; then
  blast_tier="T4"
elif echo "$changed_files" | grep -qE '^lib/services/'; then
  blast_tier="T3"
elif echo "$changed_files" | grep -cE '^app/' 2>/dev/null | grep -qvP '^[01]$'; then
  blast_tier="T3"
elif echo "$changed_files" | grep -qE '^app/'; then
  blast_tier="T2"
fi

# ── Design references ────────────────────────────────────────────

design_refs=""
if [[ -n "$changed_files" ]]; then
  design_refs=$(echo "$changed_files" | xargs grep -ohP '(?:ADR|DES)-\d{3}' 2>/dev/null | sort -u | tr '\n' ', ' | sed 's/,$//' || echo "none")
fi
[[ -z "$design_refs" ]] && design_refs="none"

# ── Create tag ───────────────────────────────────────────────────

tag_message="Release $VERSION

Milestone:    $milestone
Commits:      $commits_since since ${last_tag:-initial}
Blast tier:   $blast_tier
Design refs:  $design_refs
Tagged:       $(date -u +%Y-%m-%dT%H:%M:%SZ)"

git tag -a "$VERSION" -m "$tag_message"

echo "Tag created: $VERSION"
echo ""
echo "$tag_message"
echo ""
echo "To push: git push origin $VERSION"
