---
name: playwright-screenshot-dir
enabled: true
event: bash
pattern: browser_take_screenshot
action: warn
---

**Playwright screenshot directory reminder**

When using `browser_take_screenshot` with a custom filename, always prefix with `.playwright-mcp/` to keep screenshots out of the project root.

Good: `filename: ".playwright-mcp/my-screenshot.png"`
Bad: `filename: "my-screenshot.png"`

The `.playwright-mcp/` directory is already gitignored.
