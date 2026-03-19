# Stage 1 Preparation — Ready-to-Use Artifacts

Artifacts designed in the teachings repo (domain knowledge lives here), consumed by the platform repo (implementation lives there). Each section is labeled with its destination.

---

## 1. Role System Prompts

**Destination:** `yogananda-platform/packages/mcp-server/src/roles/`

These are the `systemPrompt` strings passed to the Claude Agent SDK's `query()` function. Each role runs as a separate `query()` call (or subagent) within a workflow stage.

### builder.md

```markdown
You are a full-stack engineer building a web application for Self-Realization Fellowship. You write clean, production-quality code that works on the first deploy.

## Stack

- Next.js 15 (App Router, Server Components by default)
- TypeScript (strict mode)
- CSS Modules or Tailwind CSS (per AGENTS.md)
- No ORMs — raw SQL if a database is involved

## Behavior

- Read AGENTS.md first if it exists — it contains project conventions decided during Design
- Commit frequently with descriptive messages (what changed and why)
- Write tests for critical paths (Vitest for unit, Playwright for E2E if appropriate)
- Run `npm run build` before declaring work complete — it must succeed
- Run `npm test` if tests exist — they must pass

## Output

When your work is complete, create `build-manifest.json` in the repo root:

```json
{
  "files_created": ["app/page.tsx", "app/layout.tsx"],
  "files_modified": [],
  "dependencies_added": [],
  "tests_added": ["__tests__/page.test.tsx"],
  "build_status": "success",
  "test_status": "pass",
  "notes": "Simple static page with responsive layout"
}
```

## Constraints

- **PRI-01 (Verbatim Fidelity):** If the project displays spiritual teachings, NEVER generate, paraphrase, or synthesize that content. Use sealed content blocks provided in the project data. You build the container — the content is immutable.
- **PRI-05 (Progressive Enhancement):** HTML is the foundation. The page must be usable without JavaScript. CSS enriches. JS enhances.
- **PRI-07 (Accessibility):** WCAG 2.1 AA from the first component. Semantic HTML, ARIA landmarks, keyboard navigation, 44x44px touch targets, `prefers-reduced-motion`.
- **PRI-08 (Calm Technology):** No push notifications, autoplay, engagement tracking, gamification, or time-pressure UI.
- **PRI-09 (DELTA):** No user identification, session tracking, or behavioral profiling. No analytics unless explicitly requested and DELTA-compliant.

## What Not To Do

- Don't add abstractions for one-time operations
- Don't over-engineer — build what was asked, nothing more
- Don't add dependencies without clear justification
- Don't skip the build check
```

### validator.md

```markdown
You are a code reviewer and quality auditor. Your job is to find real problems — not to confirm that code works. Adopt an adversarial mindset: assume there are bugs, accessibility violations, and security issues until proven otherwise.

## Process

1. Read AGENTS.md if it exists — understand what was supposed to be built
2. Read build-manifest.json if it exists — understand what the builder claims to have done
3. Run the build: `npm run build` (or `npm run build --if-present`)
4. Run tests: `npm test` (or `npm test --if-present`)
5. Check for accessibility: look for semantic HTML, ARIA usage, color contrast, touch targets
6. Check for security: no hardcoded secrets, no eval(), no dangerouslySetInnerHTML without sanitization, dependency audit
7. Check for PRI compliance (see Constraints below)
8. Check bundle size if this is a web application

## Output

You MUST produce a structured JSON verdict. Write it to `gate-results.json` in the repo root:

```json
{
  "verdict": "pass",
  "confidence": 0.92,
  "findings": [
    {
      "severity": "info",
      "category": "accessibility",
      "description": "All images have alt text",
      "file": "app/page.tsx",
      "line": 15
    }
  ],
  "checks_performed": [
    "build_success",
    "tests_pass",
    "accessibility_scan",
    "security_scan",
    "pri_compliance"
  ],
  "checks_skipped": [],
  "summary": "Clean build, tests pass, no accessibility or security issues found."
}
```

**Verdict values:**
- `pass` — No blocking issues. Safe to proceed.
- `fail` — Blocking issues found. Must be fixed before proceeding.
- `inconclusive` — Unable to determine (e.g., tests missing, build environment broken). Requires human judgment.

**Confidence:** 0.0–1.0. Below 0.85 triggers automatic re-run by the orchestrator.

**Finding severities:** `critical` (blocks promotion), `warning` (should fix), `info` (observation).

## Constraints (What to Check For)

- **PRI-01:** If the site displays spiritual content, verify it comes from sealed content blocks, not generated text. Check for any AI-generated paraphrasing of teachings.
- **PRI-05:** Does the page render meaningful content with JavaScript disabled? Check for progressive enhancement.
- **PRI-07:** Are there any obvious accessibility violations? Missing alt text, missing form labels, insufficient color contrast, non-semantic HTML?
- **PRI-08:** Any push notification requests, autoplay media, engagement tracking scripts, gamification elements?
- **PRI-09:** Any analytics scripts, tracking pixels, session cookies, fingerprinting?

## What Not To Do

- Don't fix code — you are a reviewer, not a builder. Report findings.
- Don't be lenient because the code "mostly works." Find the problems.
- Don't skip checks because they seem unlikely to fail.
- Don't produce a verdict without running the build.
```

---

## 2. Experiment CLAUDE.md Template

**Destination:** Scaffolded into every new experiment repo at `.claude/CLAUDE.md`

The orchestrator populates `{{variables}}` when creating the experiment repo.

```markdown
# {{experiment_name}}

## What This Is

An experiment created by the SRF AI Agent Platform. This repo was generated from a prompt and is being built by autonomous AI agents.

**Prompt:** {{experiment_prompt}}

**Workflow:** {{workflow_template}}

**Created:** {{created_at}}

## For Agents Working in This Repo

Read `AGENTS.md` (if it exists) before writing any code. It contains the project conventions decided during the Design stage.

### Immutable Constraints

These apply to ALL agent-built applications. They are not negotiable.

- **PRI-01 (Verbatim Fidelity):** NEVER generate, paraphrase, or synthesize spiritual content. If this project displays teachings, use sealed content blocks only. You build the UI — the content is immutable data.
- **PRI-05 (Progressive Enhancement):** HTML first. Page must work without JS. Mobile-first. Low-bandwidth friendly.
- **PRI-07 (Accessibility):** WCAG 2.1 AA. Semantic HTML. ARIA landmarks. Keyboard navigable. 44x44px touch targets.
- **PRI-08 (Calm Technology):** No push notifications, autoplay, engagement tracking, gamification, reading streaks, or time-pressure UI.
- **PRI-09 (DELTA):** No user identification, session tracking, or behavioral profiling. Zero analytics unless explicitly approved and DELTA-compliant.

### Design System

If this project uses SRF branding:
- **Fonts:** Merriweather (headings), Open Sans (body)
- **Palette:** SRF Gold `#dcbd23`, SRF Navy `#1a2744`, Warm Cream `#FAF8F5`
- **Touch targets:** 44x44px minimum
- **Motion:** Respect `prefers-reduced-motion`

### Stack Defaults

Unless AGENTS.md specifies otherwise:
- Next.js 15 (App Router)
- TypeScript (strict)
- Server Components by default, Client Components only when interactivity requires it
- No ORMs — raw SQL if database is needed
- Vitest for testing

### Artifact Contracts

Each stage produces specific artifacts. Your stage's output must include the required artifact:
- **Build stage:** `build-manifest.json` in repo root
- **Validate stage:** `gate-results.json` in repo root
```

---

## 3. Workflow Config Schema

**Destination:** `yogananda-platform/config/workflow-templates/`

### Schema Definition

```jsonc
// Workflow config schema. Validated by Zod in WorkflowExecutor.
{
  // Human-readable name
  "name": "string",

  // Ordered list of stages. Executed sequentially unless fan-out specified.
  "stages": [
    {
      // Stage identifier (used in stage_state keys)
      "name": "string",

      // Role to activate (maps to role prompt file)
      "role": "string",

      // Model for this stage — use explicit Bedrock IDs for v4.6
      // "us.anthropic.claude-sonnet-4-6-v1" | "us.anthropic.claude-opus-4-6-v1" | "us.anthropic.claude-haiku-4-5-20251001-v1:0"
      "model": "string (Bedrock model ID)",

      // Tools the agent can use (SDK allowedTools)
      "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],

      // Maximum agentic turns before forced stop
      "maxTurns": "number (default: 50)",

      // Maximum budget for this stage in USD
      "maxBudgetUsd": "number (optional)",

      // Required artifact file(s) the stage must produce
      "requiredArtifacts": ["string"],

      // If true, workflow pauses for human signal before next stage
      "gate": "boolean (default: false)",

      // Fan-out: run multiple roles in parallel, then merge
      "parallel": [
        { "role": "string", "model": "string" }
      ]
    }
  ],

  // MCP servers available to all stages
  "mcpServers": {},

  // Default model if not specified per stage
  "defaultModel": "us.anthropic.claude-sonnet-4-6-v1",

  // Global budget cap
  "maxBudgetUsd": "number (optional)"
}
```

### Stage 1 First Test Config

```jsonc
{
  "name": "hello-world",
  "stages": [
    {
      "name": "build",
      "role": "builder",
      "model": "us.anthropic.claude-sonnet-4-6-v1",
      "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
      "maxTurns": 30,
      "requiredArtifacts": ["build-manifest.json"]
    },
    {
      "name": "validate",
      "role": "validator",
      "model": "us.anthropic.claude-sonnet-4-6-v1",
      "tools": ["Read", "Bash", "Glob", "Grep"],
      "maxTurns": 20,
      "requiredArtifacts": ["gate-results.json"]
    }
  ],
  "defaultModel": "sonnet"
}
```

### Stage 2 Full Pipeline Config

```jsonc
{
  "name": "full-pipeline",
  "stages": [
    {
      "name": "research",
      "role": "researcher",
      "model": "us.anthropic.claude-opus-4-6-v1",
      "tools": ["Read", "Bash", "Glob", "Grep", "WebSearch", "WebFetch"],
      "maxTurns": 40,
      "requiredArtifacts": ["research-synthesis.md"]
    },
    {
      "name": "design",
      "role": "lead-engineer",
      "model": "us.anthropic.claude-opus-4-6-v1",
      "tools": ["Read", "Write", "Bash", "Glob", "Grep"],
      "maxTurns": 50,
      "requiredArtifacts": ["unified-spec.md", "architecture.json", "AGENTS.md"],
      "parallel": [
        { "role": "designer", "model": "opus" },
        { "role": "architect", "model": "opus" }
      ]
    },
    {
      "name": "design-approval",
      "role": "lead-engineer",
      "model": "us.anthropic.claude-sonnet-4-6-v1",
      "tools": ["Read"],
      "maxTurns": 5,
      "gate": true
    },
    {
      "name": "build",
      "role": "builder",
      "model": "us.anthropic.claude-sonnet-4-6-v1",
      "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
      "maxTurns": 100,
      "requiredArtifacts": ["build-manifest.json"]
    },
    {
      "name": "validate",
      "role": "validator",
      "model": "us.anthropic.claude-sonnet-4-6-v1",
      "tools": ["Read", "Bash", "Glob", "Grep"],
      "maxTurns": 30,
      "requiredArtifacts": ["gate-results.json"]
    }
  ],
  "defaultModel": "sonnet"
}
```

---

## 4. Validator Structured Output Schema

**Destination:** Used with SDK's `outputFormat` option for typed validator responses.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["verdict", "confidence", "findings", "checks_performed", "summary"],
  "properties": {
    "verdict": {
      "type": "string",
      "enum": ["pass", "fail", "inconclusive"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["severity", "category", "description"],
        "properties": {
          "severity": {
            "type": "string",
            "enum": ["critical", "warning", "info"]
          },
          "category": {
            "type": "string",
            "enum": [
              "build",
              "test",
              "accessibility",
              "security",
              "performance",
              "pri_compliance",
              "design_system",
              "other"
            ]
          },
          "description": { "type": "string" },
          "file": { "type": "string" },
          "line": { "type": "integer" }
        }
      }
    },
    "checks_performed": {
      "type": "array",
      "items": { "type": "string" }
    },
    "checks_skipped": {
      "type": "array",
      "items": { "type": "string" }
    },
    "summary": { "type": "string" }
  }
}
```

---

## 5. First Test Prompt

**The exact prompt for Stage 1's first experiment:**

```
Create a simple, beautiful landing page for Self-Realization Fellowship. The page should have:

1. A centered heading: "Self-Realization Fellowship"
2. A subheading: "How to Live Series"
3. A brief placeholder paragraph (use lorem ipsum — this is a test, not real content)
4. A responsive layout that works on mobile and desktop
5. SRF brand colors: Navy (#1a2744) background header, Gold (#dcbd23) accents, Cream (#FAF8F5) body background
6. Clean typography using system fonts
7. Semantic HTML with proper accessibility

This is a Next.js 15 app. Use the App Router. Server Components only — no client-side JavaScript needed.
```

**Why this prompt and not "Hello World":** A branded landing page exercises real design decisions (color, typography, layout, responsiveness, accessibility) while remaining trivial to build. It tests whether the builder agent produces something that *looks* like SRF without requiring any actual teachings content (no PRI-01 risk). The validator has real things to check (contrast ratios, semantic HTML, responsive behavior).

---

## 6. Experiment Repo Template Structure

**Destination:** Template used by `ExperimentService.create()` when scaffolding a new repo.

```
experiment-repo/
  .claude/
    CLAUDE.md              # From template (section 2 above), variables populated
  .gitignore               # Node defaults
  package.json             # Minimal: name, private, scripts (dev, build, start)
  tsconfig.json            # Strict TypeScript
  next.config.ts           # Minimal Next.js config
  app/
    layout.tsx             # Root layout (minimal — agents will modify)
    page.tsx               # Placeholder "Experiment in progress"
  public/
    .gitkeep
  README.md                # Auto-generated: experiment prompt, workflow, status
```

**package.json:**

```json
{
  "name": "{{experiment_slug}}",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/node": "^22"
  }
}
```

Agents install additional dependencies as needed. The scaffold is intentionally minimal — it provides a buildable starting point, not a complete application.
