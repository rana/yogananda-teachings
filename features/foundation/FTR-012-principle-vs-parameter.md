# FTR-012: Principle vs. Parameter — Decision Classification and Governance Flexibility

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10

## Rationale

- **Date:** 2026-02-23

### Context

After a comprehensive review of the project's 120 ADRs, 57 design sections, and 7-arc roadmap, a structural pattern emerged: the documents frequently conflate *principles* (immutable commitments that define the project's identity) with *parameters* (tunable defaults that should adapt to real data). Both are recorded at the same authority level in DECISIONS.md and DESIGN.md, which creates a ratchet effect — every mechanism decision accumulates the weight of a principle decision, and relaxing any parameter *feels* like violating a principle even when it doesn't.

This matters because: (1) no code exists yet; (2) many specific values (cache TTLs, debounce timers, chunk sizes, rate limits, fusion parameters) are pre-production guesses that need validation against real data; (3) the 10-year horizon (FTR-004) demands that future maintainers can tune operational parameters without navigating the full ADR governance process.

### Decision

Classify every decision and design specification into one of two categories:

**Principles** — Immutable commitments. Changing these changes the project's identity. Require full ADR-level deliberation to modify.

Examples:
- Direct quotes only, no AI synthesis (FTR-001)
- Human review as mandatory gate (FTR-005, FTR-121, FTR-135)
- DELTA-compliant analytics (FTR-082)
- Sacred text fidelity (FTR-058)
- Global-First (FTR-006)
- Calm Technology (FTR-042)
- Signpost, not destination (FTR-055)
- 10-year architecture horizon (FTR-004)
- API-first architecture (FTR-015)
- Accessibility from first deployment (FTR-003)
- Multilingual from the foundation (FTR-058)

**Parameters** — Tunable defaults. Ship with the documented value. Adjust based on evidence. Changes are configuration updates, not architectural decisions. Document the current value, the rationale for the default, and the evaluation trigger (what data would prompt reconsideration).

Examples:
- RRF fusion k=60 (FTR-020) — tune after Milestone M1a-8 search quality evaluation
- Dwell debounce 1200ms (FTR-040) — tune after Milestone 2b user testing
- Chunk size 200–300 tokens (FTR-023) — tune per language after ingestion
- Chunk overlap: none (FTR-023) — evaluate 10% overlap in Milestone M1a-8
- Rate limits: 15 req/min search, 200 req/hr hard block (FTR-097) — adjust based on observed traffic
- Email purge delay: 90 days (FTR-085) — adjust based on legal review
- Cache TTLs: 5min/1hr/24hr (FTR-045) — adjust based on cache hit rate data
- ISR revalidation intervals (FTR-040) — adjust based on Vercel Analytics metrics
- Circadian color band boundaries (FTR-040) — adjust after Milestone 2b user feedback
- Quiet Index texture count: 5 (FTR-066) — adjust after Milestone 3b usage data

### Implementation

1. **Annotation convention:** Parameters in DESIGN.md are annotated with `*[Parameter — default: {value}, evaluate: {trigger}]*` inline after the value. This signals to implementers that the value should be a configuration constant, not a hardcoded literal.

2. **Configuration constants:** All parameters are implemented as named constants in `/lib/config.ts` (or environment variables for deployment-specific values), never as magic numbers in application code.

3. **Evaluation log:** When a parameter is tuned based on data, add a brief note to the relevant DESIGN.md section: `*Parameter tuned: [date], [old] → [new], [evidence].*`

4. **Milestone gate integration:** Milestone M1a-8 (search quality evaluation) and Milestone 2b success criteria explicitly include parameter validation as deliverables. Parameters marked "evaluate: Milestone M1a-8" are reviewed during that gate.

### Rationale

- **Reduces governance friction.** Future maintainers can adjust a cache TTL without feeling they're violating an architectural decision.
- **Makes assumptions explicit.** Every parameter documents what would trigger reconsideration — a form of intellectual honesty about what we don't yet know.
- **Preserves architectural integrity.** Principles remain firm. The distinction *protects* principles by preventing parameter-level fatigue from eroding respect for the governance process.
- **Serves the 10-year horizon.** In year 7, a new developer can identify what's tunable vs. what's sacred without reading 120+ ADRs.

### Consequences

- All existing magic numbers in DESIGN.md to be annotated with the parameter convention during Arc 1 implementation
- `/lib/config.ts` created as the canonical location for runtime parameters
- Milestone M1a-8 success criteria updated to include parameter validation
- Future ADRs specify whether each specific value is a principle or parameter
- CLAUDE.md updated to reference this classification in the document maintenance guidance
