---
ftr: 91
title: Prove Before Foundation
state: approved
domain: operations
arc: "1"
governed-by: [PRI-10]
---

# FTR-091: Prove Before Foundation

## Rationale

- **Status:** Accepted
- **Date:** 2026-02-22

### Context

Arc 1 ("Prove") had accumulated 21 deliverables — a mix of the core existential question ("does semantic search work over Yogananda's text?") and production foundation work (Vercel deployment, Sentry, observability, query expansion, rate limiting, MCP server, homepage, cultural consultation). The arc was structured as a single unit gated only by SRF availability.

The risk: 21 deliverables is a product, not a proof. The most consequential question — whether hybrid vector + FTS search produces quality results over Yogananda's specific prose — was buried among infrastructure tasks. If search quality fails, everything else built in Arc 1 is premature.

Additionally, 120+ ADRs and 57 design sections existed with zero lines of code. The design was comprehensive and ready for implementation, but the gap between design and empirical contact was widening.

### Decision

Split Arc 1 into three milestones:

**Milestone 1a: Prove** (8 deliverables)
Answer one question: does semantic search over Yogananda's text return relevant, accurately cited, verbatim passages? English only. Minimal vertical slice: repo → Contentful content model → schema → ingest → search → read → evaluate. No deployment, no AI enhancements, no homepage, no observability beyond what's needed locally. Claude validates autonomously — no human QA gate.

**Milestone 1b: Bilingual** (3 deliverables)
Extend the proven English pipeline to Spanish. Spanish ingestion, cross-language search validation, and bilingual search evaluation. Proves the multilingual architecture before production deployment. Hindi deferred to Milestone 5b (authorized source unavailable outside India).

**Milestone 1c: Deploy** (16 deliverables)
Deploy to Vercel, add Claude-based query expansion and intent classification, build the homepage, establish observability, add rate limiting and search suggestions, seed the entity registry and enrichment pipeline, and establish the query intent taxonomy. This milestone transforms the proven bilingual prototype into a deployed, AI-enhanced portal.

Milestone 1a has two conversation prerequisites (edition confirmation, PDF source) but no engineering dependencies. Milestone 1b is gated on Milestone 1a's search quality evaluation passing (≥ 80% threshold). Milestone 1c is gated on Milestone 1b's bilingual search evaluation.

### Rationale

- **Empirical contact first.** The design is ready. The highest-value action is contact with the actual corpus — Yogananda's long-form, metaphor-dense, sometimes archaic spiritual prose. No amount of design iteration substitutes for running embeddings against real text.
- **Fail fast on the existential question.** If chunking, embedding, or hybrid search produce poor results on this specific corpus, the project needs to know immediately — not after building a homepage and observability stack.
- **Prove multilingual before deploying.** Spanish is Tier 1 activated in Arc 1 (FTR-011). Validating bilingual search quality before production deployment avoids shipping a monolingual portal that requires re-architecture for multilingual support.
- **Reduce Arc 1 scope creep.** 21 deliverables labeled "Prove" set an implicit expectation that all 21 must complete before declaring Arc 1 done. The three-milestone split makes each proof explicit and small.
- **Contingency planning.** Milestone 1a includes a "What If Search Quality Fails?" section with four concrete fallbacks (chunking adjustment, embedding model swap, manual curation bridge, hybrid weighting tuning). This contingency was absent from the original single-milestone structure.

### Alternatives Considered

1. **Keep Arc 1 as a single milestone, just start building.** Viable but risks building the homepage and observability before knowing if search works. The split costs nothing — it's a reframing, not a structural change.

2. **Move Milestone 1c deliverables into Milestone 2a.** Considered, but Milestone 2a ("Build") already has its own scope (all pages, engineering infrastructure, accessibility). Milestone 1c is genuinely "foundation" work that should precede Milestone 2a.

3. **Even smaller Milestone 1a (5 deliverables — no reader, no eval).** The reader and evaluation are both essential to declaring search "proven." Without the reader, "Read in context" links can't be tested. Without the evaluation, the quality threshold is subjective.

4. **Two milestones (Prove + Deploy) without a separate Bilingual milestone.** Would either delay Spanish to post-deploy (violating Global-First) or bundle bilingual validation into the proof milestone (blurring the English-only existential question).

### Consequences

- Milestone 1a can begin immediately once edition and PDF source are confirmed — no SRF AE team availability needed.
- Milestone 1b is gated on Milestone 1a's search quality evaluation. If the evaluation fails, Milestone 1b is deferred until contingency measures resolve the quality gap.
- Milestone 1c is gated on Milestone 1b's bilingual search evaluation.
- Milestone 2a's hard prerequisite changes from "Arc 1 complete" to "Milestone 1c complete."
- The Gates table in ROADMAP.md is updated to reflect the three-milestone split.
- References to Arc 1 deliverable numbers in other documents (DESIGN.md, CONTEXT.md) should use the 1a/1b/1c numbering.

## Notes

**Provenance:** FTR-091 → FTR-091
