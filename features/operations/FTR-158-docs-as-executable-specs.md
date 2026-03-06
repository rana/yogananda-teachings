# FTR-158: Docs as Executable Specs

> **State:** Proposed
> **Domain:** operations
> **Arc:** Arc 2+
> **Governed by:** FTR-084, FTR-081, FTR-096
> **Replaces:** FTR-158

## Proposal

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** FTR-084 (Documentation Architecture), FTR-081 (Testing Strategy), FTR-096 (Document Integrity Validation)
**Target:** Milestone 2a (alongside test infrastructure buildout, M2a-21)
**Dependencies:** FTR-096 (`doc-validate.sh`) operational. Test infrastructure (Vitest, Playwright) operational. Design documents contain testable assertions.

**The gap.** ADRs and DES sections contain testable assertions in prose: "WCAG 2.1 AA" (FTR-003), "search p95 < 500ms" (FTR-111), "no horizontal scrolling at 320px" (FTR-006), "44x44px touch targets" (FTR-003), "< 100KB JS" (FTR-003), "FCP < 1.5s" (FTR-003). These assertions are manually translated into tests by the implementer. If the implementer (Claude) misses one, the assertion exists in the document but not in the test suite. The design→implement→verify loop has a manual, lossy step.

**Close the loop: `scripts/doc-to-test.sh` generates test stubs from design documents.**

The script parses design documents for patterns that map to testable assertions:

| Document Pattern | Generated Test |
|-----------------|---------------|
| "WCAG 2.1 AA" / "axe-core" | `expect(axeResults).toHaveNoViolations()` |
| "p95 < Nms" / "latency < Nms" | Performance assertion: `expect(p95).toBeLessThan(N)` |
| "< NKB JS" | Bundle size assertion: `expect(jsSize).toBeLessThan(N * 1024)` |
| "FCP < Ns" | Lighthouse assertion: `expect(fcp).toBeLessThan(N * 1000)` |
| "NxNpx touch targets" | Computed style assertion: `expect(minDimension).toBeGreaterThanOrEqual(N)` |
| "no horizontal scrolling at Npx" | Playwright viewport test at N width |
| "cursor-based pagination" | API contract test: response has `cursor` field |

**Output:** `tests/generated/spec-assertions.test.ts` — regenerated on every CI run. If a design document changes its assertion, the generated test changes. If a new document adds an assertion, a new test appears. The loop closes automatically.

**What this is NOT:**
- Not a replacement for handwritten tests. Generated tests verify *documented assertions*. Handwritten tests verify *implementation behavior*.
- Not AI-generated. The parsing is deterministic regex/pattern matching against known assertion formats. No LLM in the loop.
- Not comprehensive. Covers quantitative assertions (numbers, thresholds, standards). Does not cover qualitative assertions ("the reading experience should feel curated"). Those require `/verify` skill review.

**Estimated coverage:** ~30-40 testable assertions exist across current design documents. Each takes ~5 lines to parse and ~3 lines to generate. The script is ~200 lines of TypeScript or bash.

**The deeper value:** When a design document is the source of truth for a test, changing the document changes the test. The spec and the verification are the same artifact viewed from two angles. A stakeholder reads "search p95 < 500ms" in FTR-111; CI enforces `expect(p95).toBeLessThan(500)`. Same commitment, same number, one source.

**Re-evaluate At:** Milestone 2a (alongside test infrastructure buildout)
**Decision Required From:** Architecture (parsing patterns, test framework integration)

## Notes

**Provenance:** FTR-158 → FTR-158
