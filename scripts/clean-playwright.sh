#!/usr/bin/env bash
# Clean up Playwright MCP screenshots and console logs older than N days.
# Usage: ./scripts/clean-playwright.sh [days]  (default: 3)

set -euo pipefail

DAYS="${1:-3}"
DIR=".playwright-mcp"

if [ ! -d "$DIR" ]; then
  echo "No $DIR directory found. Nothing to clean."
  exit 0
fi

count=$(find "$DIR" -type f \( -name '*.png' -o -name '*.jpeg' -o -name '*.log' \) -mtime +"$DAYS" | wc -l)

if [ "$count" -eq 0 ]; then
  echo "No files older than $DAYS days in $DIR."
  exit 0
fi

find "$DIR" -type f \( -name '*.png' -o -name '*.jpeg' -o -name '*.log' \) -mtime +"$DAYS" -delete
echo "Deleted $count files older than $DAYS days from $DIR."
