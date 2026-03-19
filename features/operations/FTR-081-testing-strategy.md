---
ftr: 81
title: Testing Strategy
summary: "Layered testing strategy with Vitest, Playwright, axe-core, Lighthouse, and search quality evaluation"
state: implemented
domain: operations
governed-by: [PRI-01, PRI-07, PRI-10]
always-load: true
---

# FTR-081: Testing Strategy

## Rationale

### Context

The portal serves sacred text. A bug that misattributes a quote, displays the wrong passage, or breaks search undermines the core mission of fidelity. Testing is not optional polish — it's a fidelity guarantee.

The SRF tech stack doesn't prescribe a testing framework. The portal needs a layered testing approach that covers components, services, API routes, end-to-end user flows, accessibility, search quality, and visual consistency.

### Decision

Adopt a **layered testing strategy** with specific tools for each layer:

| Layer | Tool | What It Tests | Stage |
|-------|------|---------------|-----------|
| **Unit / Integration** | **Vitest** + React Testing Library | Service functions, API route handlers, component rendering, database queries | STG-004 |
| **End-to-End** | **Playwright** | Full user flows: search → read → share → navigate. Cross-browser (Chrome, Firefox, Safari). | STG-004 (core flows) |
| **Accessibility** | **axe-core** (CI) + Playwright a11y assertions | Automated WCAG checks on every page. Keyboard navigation flows. | STG-004 (basic) / STG-005 (CI) |
| **Search quality** | Custom Vitest suite | ~30 representative queries with expected passages. Precision/recall metrics. | STG-001 (deliverable STG-001-8) |
| **Performance** | **Lighthouse CI** | Core Web Vitals thresholds: LCP < 2.5s, CLS < 0.1, INP < 200ms. | STG-004 |
| **Visual** | Browser rendering (code-first) | Design emerges through code iteration; browser is the design artifact | STG-001+ |
| **Visual regression** | Playwright screenshot comparison | Catch unintended visual changes to reading UI, passage cards, Quiet Corner | dissolved (evaluate when component library stabilizes) |

#### Tool Choices

**Vitest over Jest:** Faster execution, native ESM support, better Vite/Next.js integration. The JavaScript testing ecosystem is converging on Vitest.

**Playwright over Cypress:** Multi-browser support (Chrome, Firefox, WebKit/Safari), native accessibility snapshot API (`page.accessibility.snapshot`), more reliable in CI, better parallel execution. Playwright's test generator also speeds up writing E2E tests.

**Storybook suspended (FTR-153):** During AI-led development, the browser rendering is the design artifact. Storybook adds setup overhead without consumers. Reactivate if human designers join.

**No MCP-based testing.** MCP servers are valuable for development workflows (Neon MCP for database operations), but test execution must be deterministic, automated, and reproducible. MCP doesn't add value to test pipelines.

#### Database Test Isolation

Each test run creates a **Neon branch**, runs integration tests against it, and deletes the branch afterward. This provides full database isolation without maintaining a separate test database, using Neon's instant copy-on-write branching.

```
CI pipeline:
 1. Create Neon branch from production (TTL: 1 hour)
 2. Apply migrations to branch
 3. Seed test data
 4. Run Vitest integration tests against branch
 5. Run Playwright E2E tests against branch
 6. Delete branch (cleanup — TTL ensures deletion even if CI fails)
```

#### Preview Branches per PR

Beyond test isolation, create a **persistent preview branch** for each PR that needs database state. This enables Vercel preview deployments with their own database.

```
On PR open:
 1. Create Neon branch: pr-{number} (TTL: 7 days)
 2. Apply migrations to branch
 3. Seed with representative data
 4. Pass branch connection string to Vercel preview deployment

On PR close/merge:
 1. Delete preview branch (TTL auto-deletes if missed)
```

Scale tier supports 25 branches included + $1.50/month per additional branch (up to 5,000). With TTL auto-expiry, orphaned branches are impossible.

#### Schema Diff in CI

Neon's built-in schema diff compares branch schemas. Add as a CI step and GitHub Action:

```
On every PR with migration changes:
 1. Create Neon branch from production
 2. Apply migrations to branch
 3. Run: neonctl branches schema-diff --branch pr-{number} --compare-to production
 4. Post schema diff as PR comment (GitHub Action)
 5. Reviewer sees exact schema changes before approving
```

This catches migration drift, unintended column changes, and missing indexes before they reach production.

#### CI Pipeline

```
┌─────────────────────────────────────────┐
│ On every PR: │
│ │
│ 1. Lint (ESLint + Prettier) │
│ 2. Type check (tsc --noEmit) │
│ 3. Unit/integration tests (Vitest) │
│ 4. Accessibility audit (axe-core) │
│ 5. Build (next build) │
│ 6. E2E tests (Playwright) │
│ 7. Lighthouse CI (performance) │
│ 8. Search quality suite │
│ 9. Schema diff (if migrations changed) │
│ │
│ All must pass before merge. │
└─────────────────────────────────────────┘
```

### Rationale

- **Fidelity guarantee.** The search quality test suite is the most important test layer — it verifies that seekers find the right passages. A regression in search quality is a mission failure.
- **Accessibility as gate.** axe-core in CI means accessibility violations block merges, not just generate warnings. This enforces FTR-003.
- **Neon branching for test isolation.** Eliminates the "works on my machine" problem for database-dependent tests. Each PR gets a clean database. TTL auto-expiry ensures cleanup even when CI fails.
- **Preview branches per PR.** Vercel preview deployments get their own database state — reviewers see the full experience, not just code changes.
- **Schema diff as safety net.** Migrations are verified against production schema before merge. Catches unintended column changes, missing indexes, and migration drift.
- **Cross-browser E2E.** Seekers worldwide use diverse browsers. Playwright's multi-browser support catches rendering issues that single-browser testing misses.
- **Performance budgets.** Lighthouse CI prevents performance regressions. A portal that's slow on a mobile connection in rural India fails the global accessibility mission.

### Consequences

- STG-004 includes Vitest, Playwright, axe-core, and Lighthouse CI setup (basic axe-core testing begins in STG-004)
- CI pipeline runs all test layers on every PR, including schema diff when migrations change
- Neon branches use TTL auto-expiry: 1 hour for test branches, 7 days for preview branches (FTR-094)
- Preview branches per PR enable database-backed Vercel preview deployments
- Neon Schema Diff GitHub Action posts migration diff as PR comment
- Design validation through browser rendering (code-first, no external design tool during AI-led development)
- Search quality test suite is a STG-001 deliverable (STG-001-8) and grows as the corpus expands
- Visual regression testing begins when the component library stabilizes

## Specification

### Test Pyramid Proportions

The portal's test pyramid reflects its architecture: a thick service layer (`/lib/services/`) with a thin presentation layer (Next.js). Business logic is framework-agnostic TypeScript — highly unit-testable.

| Layer | Proportion | Focus | Speed |
|-------|-----------|-------|-------|
| **Unit** | ~60% | Service functions, data transformers, config validation, utility functions. Fast, isolated, no I/O. | < 1s per suite |
| **Integration** | ~25% | Service → Neon queries, API route handlers, Contentful sync, embedding pipeline. Uses Neon branch isolation. | < 30s per suite |
| **E2E** | ~10% | Full user flows via Playwright. Cross-browser. Search → read → share. | < 5 min total |
| **Specialized** | ~5% | Search quality (golden set), accessibility (axe-core), performance (Lighthouse), visual regression. | Varies |

These proportions are guidelines, not gates — the important thing is that most logic is tested at the unit level where feedback is fastest, and E2E tests cover critical user journeys rather than exhaustive paths.

### Test Layers

| Layer | Tool | What It Tests | Stage |
|-------|------|---------------|-----------|
| **Unit / Integration** | Vitest + React Testing Library | Service functions, API route handlers, component rendering | STG-004 |
| **End-to-End** | Playwright | Full user flows: search → read → share → navigate. Cross-browser. | STG-004 |
| **Accessibility** | axe-core (CI) + Playwright a11y | Automated WCAG checks. Keyboard navigation flows. | STG-004 |
| **Search quality** | Custom eval harness (`/scripts/eval/search-quality.ts`) | ~58 English + ~15 Spanish queries (golden set). Recall@3, MRR@10, routing accuracy. Six categories. CI regression on search-affecting PRs. FTR-037. | STG-001 (en), 1b (es) |
| **Related content quality** | Custom Vitest suite | Pre-computed relations are thematically relevant, cross-book diverse, no false friends. | STG-008 |
| **Performance** | Lighthouse CI | LCP < 2.5s, CLS < 0.1, INP < 200ms | STG-004 |
| **Visual** | Browser rendering (code-first) | Design emerges through code iteration; browser is the design artifact | STG-001+ |
| **Visual regression** | Playwright screenshot comparison | Catch unintended visual changes | STG-020 |

### Database Test Isolation via Neon Branching

```
CI pipeline:
 1. Create Neon branch from production (TTL: 1 hour)
 2. Apply migrations to branch
 3. Seed test data
 4. Run Vitest integration tests against branch
 5. Run Playwright E2E tests against branch
 6. Delete branch (TTL ensures cleanup even if CI fails)
```

Each test run gets a fully isolated database. No shared test database. No cleanup scripts. Neon's instant copy-on-write branching makes this practical. TTL auto-expiry prevents orphaned branches.

**Preview branches per PR:** Persistent branches (TTL: 7 days) enable database-backed Vercel preview deployments. Reviewers see the full experience, not just code changes.

**Schema diff in CI:** When migrations change, Neon's schema diff compares the PR branch against production and posts the diff as a PR comment via GitHub Action. Catches migration drift before merge.

### CI Pipeline

```
On every PR:
 1. Lint (ESLint + Prettier)
 2. Type check (tsc --noEmit)
 3. Unit / integration tests (Vitest)
 4. Accessibility audit (axe-core)
 5. Build (next build)
 6. E2E tests (Playwright)
 7. Lighthouse CI (performance)
 8. Search quality suite
 9. Schema diff (if migrations changed)

All must pass before merge.
```

### Key E2E Test Scenarios (STG-004)

| Scenario | Flow |
|----------|------|
| **Search and read** | Homepage → type query → view results → click "Read in context" → verify passage highlighted in reader |
| **Today's Wisdom** | Homepage → verify passage displayed → click "Show me another" → verify new passage |
| **Quiet Corner** | Navigate to `/quiet` → verify affirmation → start timer → verify completion |
| **Share passage** | Search → click share icon → verify URL copied → navigate to share URL → verify OG meta tags |
| **Keyboard navigation** | Tab through homepage → search → navigate results → read in context — all via keyboard |
| **Theme browsing** | Homepage → click theme door → verify themed passages → click "Read in context" |
| **Related teachings** | Read a chapter → verify side panel shows related passages from other books → click a related passage → verify navigation to new context → verify side panel updates (graph traversal) |
| **Continue the Thread** | Read to end of chapter → verify "Continue the Thread" section shows cross-book passages → click one → verify navigation |
| **Seeking entry points** | Homepage → scroll to "Seeking..." → click entry point → verify search results page with relevant passages |

### Related Content Quality Evaluation (STG-008+)

Mirrors the search quality evaluation (STG-001-8) but for the pre-computed `chunk_relations`. The teaching portal is focused on quality teaching — bad relations undermine trust as much as bad search results.

**Test suite:**

| Criterion | Test | Threshold |
|-----------|------|-----------|
| **Thematic relevance** | For N representative paragraphs across diverse topics, human-judge the top 3 related passages. Score: relevant / partially relevant / irrelevant. | ≥ 80% relevant or partially relevant |
| **No self-referential results** | Relations must not include adjacent paragraphs from the same chapter (those are already "in context"). | Zero violations |
| **Cross-book diversity** | When ≥ 2 books are available, top 3 relations should span ≥ 2 books. | ≥ 70% of test cases |
| **No false friends** | Superficially similar text with unrelated meaning (e.g., "light" as illumination vs. "light" as weight) must not appear in top 3. | Zero critical false friends |
| **Filtered query quality** | When filtering by book, the returned relations must still be thematically relevant (not just the best-available from a poor match set). | ≥ 70% relevant |
| **Realtime fallback quality** | When pre-computed results are insufficient (< 3 after filtering), the realtime vector fallback returns comparable quality. | Within 10% of precomputed quality |

**Test data:** A curated set of ~50 representative paragraphs from across the ingested corpus, spanning topics: meditation, fear, love, death, science, daily life, guru-disciple relationship, and scriptural commentary. Each paragraph has human-judged "expected related" passages and "should not appear" passages.

**Regression gate:** This suite runs as part of the CI pipeline after any content re-ingestion or embedding model change. Quality must not degrade below thresholds.

## Notes

**Provenance:** FTR-081 + FTR-081 → FTR-081
