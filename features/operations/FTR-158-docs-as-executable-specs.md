---
ftr: 158
title: Spec Fidelity System
summary: "Three-layer verification system mapping every FTR assertion to sentinel, fitness, or deep review"
state: proposed
domain: operations
governed-by: [PRI-10, PRI-12]
depends-on: [FTR-084, FTR-081, FTR-096]
---

# FTR-158: Spec Fidelity System

## Rationale

### The Gap

FTR files contain ~160 verifiable assertions across 162 files: "< 100KB JS" (FTR-003), "zero framework imports in `/lib/services/`" (FTR-004), "no push notifications" (PRI-08), "every content table carries a `language` column" (PRI-06), "search p95 < 500ms" (FTR-096). These assertions are manually translated into tests by the implementer. If the implementer (Claude) misses one — or a future session doesn't load the governing FTR — the assertion exists in the document but not in the test suite.

The original proposal (FTR-158 v1) suggested a `doc-to-test.sh` script that regex-parses prose for quantitative patterns and generates test stubs. Analysis revealed three problems: (1) the taxonomy was too narrow — "quantitative vs. qualitative" misses structural and prohibition assertions that are deterministic but non-numeric; (2) regex parsing of prose is fragile and couples test generation to document formatting; (3) a generated test file obscures what's actually being verified.

### Decision

Replace the regex-parsing approach with a **3-layer Spec Fidelity System** where handwritten deterministic tests cover structural assertions, existing CI covers quantitative assertions, and AI-assisted review covers qualitative assertions. Every FTR assertion maps to exactly one layer. Nothing goes unverified — the question is only *when* and *how*.

## Specification

### Assertion Taxonomy

FTR assertions fall into seven categories, each assigned to a verification layer:

| Category | Examples | Layer | Method |
|----------|---------|-------|--------|
| **Numeric thresholds** | `< 100KB JS`, `FCP < 1.5s`, `p95 < 500ms`, `44x44px` | L1 Sentinel | Existing perf/a11y tests, `check-perf-budget.sh` |
| **Structural rules** | Zero framework imports, language columns, API prefix, cursor pagination | L2 Fitness | grep, SQL, AST checks in Vitest |
| **Prohibition rules** | No push notifications, no session tracking, no content generation | L2 Fitness | grep for banned patterns |
| **Behavioral contracts** | Every search result links to chapter, Practice Bridge routes technique queries | L2 Fitness + L3 Deep | E2E tests + AI review |
| **Data integrity** | Full attribution on every passage, no orphaned quotes, contentful_id coverage | L2 Fitness | SQL invariant queries |
| **Design quality** | "Worthy of presenting Yogananda's words", "feels curated" | L3 Deep | AI review only (milestone) |
| **Tunable parameters** | Chunk size, rate limits, model IDs | L2 Fitness | `/lib/config.ts` audit |

### Layer 1: Sentinels (every CI run, ~0 cost)

Deterministic checks that already exist or are trivially added. Fast. Cheap. Blocking.

| Check | Source FTR | Mechanism | Status |
|-------|-----------|-----------|--------|
| Bundle budget `< 100KB JS` | FTR-003 | `scripts/check-perf-budget.sh` | Exists |
| Accessibility (axe-core) | FTR-003 | `lib/__tests__/a11y.test.ts` | Exists |
| API response shapes | FTR-088 | API route tests | Exists |
| Type checking | FTR-080 | `tsc --noEmit` | Exists |
| Document cross-refs | FTR-096 | `scripts/doc-validate.sh` | Exists (advisory) |
| Performance budget (FCP) | FTR-003 | Lighthouse CI | Not yet in CI |

**Action:** Promote `doc-validate.sh` from advisory to blocking. Add Lighthouse CI when infra supports it.

### Layer 2: Fitness Functions (per-PR, low cost)

**This is the missing layer.** A single Vitest test file — `tests/fitness/spec-fidelity.test.ts` — containing deterministic checks for structural, architectural, and prohibition assertions. Each test references its governing FTR/PRI in a comment.

The test file *is* the verification manifest. You read it to see what's verified.

**Structural checks:**

```typescript
describe("Architecture fitness (FTR-004, PRI-10)", () => {
  it("service layer has zero framework imports", async () => {
    // grep lib/services/ for next/react imports — must find none
  });

  it("all API routes use /api/v1/ prefix (FTR-015)", async () => {
    // glob app/api/ — every route handler is under v1/
  });
});

describe("Multilingual foundation (PRI-06)", () => {
  it("every content table has language column", async () => {
    // SQL: check information_schema for content tables
  });
});
```

**Prohibition checks:**

```typescript
describe("Calm technology prohibitions (PRI-08, PRI-09)", () => {
  it("no push notification APIs", async () => {
    // grep for pushManager, Notification API, ServiceWorkerRegistration.showNotification
  });

  it("no session tracking", async () => {
    // grep for sessionStorage writes, session IDs, cross-visit correlation
  });

  it("no engagement patterns", async () => {
    // grep for streak, gamif, badge, leaderboard, notification badge
  });
});

describe("Content fidelity prohibitions (PRI-01)", () => {
  it("no content generation in services", async () => {
    // grep lib/services/ for generateText, paraphrase, synthesize, summarize
  });
});
```

**Data integrity checks:**

```typescript
describe("Data integrity (PRI-02)", () => {
  it("no orphaned chunks (missing book or chapter)", async () => {
    // SQL: SELECT count(*) FROM chunks WHERE book_id IS NULL
  });

  it("all chunks have contentful_id", async () => {
    // SQL: SELECT count(*) FROM chunks WHERE contentful_id IS NULL
  });
});
```

**Traceability coverage:**

```typescript
describe("Spec traceability", () => {
  it("test files reference governing FTR or PRI", async () => {
    // grep test files for FTR-\d{3}|PRI-\d{2} — report coverage %
    // Advisory: log coverage but don't fail below threshold yet
  });
});
```

**Trigger:** CI runs fitness tests on every PR as part of the existing Vitest suite. Path-scoped tests (e.g., framework isolation) run only when relevant paths change. Full suite also runs weekly via `workflow_dispatch`.

**Database checks:** Fitness tests requiring live database run as integration tests using Neon branch isolation per FTR-081. Alternatively, export schema to SQL dump and grep that for unit-test-speed checks.

### Layer 3: Deep Verification (milestone gates, moderate cost)

AI-assisted verification for assertions requiring judgment, context, or semantic understanding. Three differentiated modes:

| Mode | Actor | Timing | What it checks |
|------|-------|--------|---------------|
| **Builder awareness** | Claude implementing a deliverable | Before/during implementation | Gated-loading protocol surfaces relevant FTR constraints. Prevention, not verification. |
| **Compliance sweep** | Claude in operator mode | Per milestone | `/verify` skill across domain FTRs. Produces compliance matrix. |
| **Architectural audit** | Claude at milestone boundaries | Milestone gates | Full-corpus `/verify`. Feeds milestone gate criteria (ROADMAP.md). |

**Builder awareness** is the highest-leverage intervention. When Claude starts a deliverable, the gated-loading protocol in CLAUDE.md should surface relevant FTR assertions as constraints *before* code is written. The cheapest verification is the violation that never happens.

**Compliance sweep** runs the `/verify` skill per domain at milestone boundaries:

```
Domain: search (31 FTRs)
  FTR-020: Data model ........... 12/12 satisfied
  FTR-024: Embeddings ........... 8/8 satisfied
  FTR-027: Search quality ....... 6/7 (1 deferred: HyDE not evaluated)
  ...
  Coverage: 94% (148/157 assertions, 9 deferred)
```

**Architectural audit** is the milestone gate ceremony — every `implemented` FTR gets a full `/verify` pass before milestone transition approval.

**Cost:** Builder awareness: $0 (reading docs). Compliance sweep: ~$2-5 per domain. Architectural audit: ~$20-30 per milestone gate.

### How the Layers Compose

```
Every commit:
  L1 Sentinels (build, lint, test, a11y, perf budget, doc-validate)
  Blocking. Existing. ~3 min.

Every PR:
  L1 Sentinels
  L2 Fitness Functions (spec-fidelity.test.ts, path-scoped)
  Blocking. ~1 min incremental.

Weekly (workflow_dispatch):
  L2 Full Fitness Suite
  Advisory. Catches drift in untouched code.

Per milestone:
  L3 Compliance Sweep (/verify per domain)
  Advisory. Updates FTR states where verified.

Per milestone gate:
  L3 Architectural Audit (full /verify)
  Go/no-go input for milestone transition.
```

### Optional: FTR Verification Sections

FTR files may carry a `## Verification` section documenting which checks enforce their assertions:

```markdown
## Verification

| Assertion | Layer | Check |
|-----------|-------|-------|
| JS bundle < 100KB per page | L1 | `scripts/check-perf-budget.sh` |
| 44x44px minimum touch targets | L2 | `tests/fitness/spec-fidelity.test.ts` |
| axe-core zero violations | L1 | `lib/__tests__/a11y.test.ts` |
```

This is documentation, not a prerequisite. The test file is the source of truth for what's verified. Add these sections incrementally as FTRs are touched — do not backfill.

### What This Is NOT

- **Not generated tests.** The fitness function test file is handwritten. Simpler, more reliable, and more maintainable than regex-parsing prose into test stubs.
- **Not comprehensive AI coverage.** L3 runs at milestones, not every commit. The architecture is economical about AI token spend.
- **Not a new annotation system.** The existing convention — FTR/PRI references in test comments — is sufficient for traceability. No `@implements`/`@validates` annotations needed.

### Relationship to Other FTRs

- **FTR-096 Layer 4** (Design-Artifact Traceability): Simplified. The fitness test file + existing FTR comment convention replaces the `@implements`/`@validates` annotation system.
- **FTR-081** (Testing Strategy): Fitness functions are Vitest tests — they fit the existing test pyramid with no new framework.
- **FTR-084** (Documentation Architecture): FTR files remain the source of truth for assertions. The test file enforces them; the optional `## Verification` section documents the mapping.
- **FTR-096 Layer 3** (`doc-validate.sh`): Continues as-is for document integrity. Complementary to spec-fidelity tests.

### Implementation Plan

| Priority | Action | Target |
|----------|--------|--------|
| 1 | Create `tests/fitness/spec-fidelity.test.ts` with initial structural + prohibition checks | STG-006 |
| 2 | Promote `doc-validate.sh` to blocking in CI | STG-006 |
| 3 | Add data integrity SQL checks (Neon branch integration tests) | STG-006 |
| 4 | Run first compliance sweep (`/verify` across search + foundation domains) | STG-006 gate |
| 5 | Add `## Verification` sections to high-traffic FTRs as they're touched | Ongoing |

## Notes

**Provenance:** FTR-158 (v1: Docs as Executable Specs, proposed regex `doc-to-test.sh`) revised to Spec Fidelity System based on archaeology/reframe/invoke analysis. The original gap identification was correct; the solution was too narrow. The 3-layer architecture covers structural and prohibition assertions that regex couldn't reach, and replaces generated tests with handwritten fitness functions.
