# FTR-001: Direct Quotes Only — No AI Synthesis

**State:** Approved (Foundational)
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-01, PRI-02

## Rationale

- **Date:** 2026-02-17

### Context

The Intelligent Query Tool could operate in two modes:

1. **Synthesis mode:** AI reads retrieved passages and generates a natural-language answer in its own words, citing sources.
2. **Librarian mode:** AI finds and ranks the most relevant passages but the user reads only verbatim text from SRF-published authors.

### Decision

**Librarian mode only.** The AI's role is strictly limited to:
- Expanding user queries into semantic search terms
- Ranking retrieved passages by relevance
- Identifying highlight boundaries within long passages

The AI **never**:
- Generates text that could be mistaken for any SRF-published author's words
- Paraphrases, summarizes, or synthesizes across passages
- Interprets meditation techniques or spiritual practices
- Answers questions not addressable from the corpus

### Rationale

- **Sacred text fidelity:** The words of Yogananda and all SRF-published authors are considered transmitted teachings from realized masters and their direct successors (FTR-001). Even subtle paraphrasing can distort meaning. "God-consciousness" and "cosmic consciousness" are not interchangeable in this tradition.
- **Hallucination risk:** LLMs generate plausible but incorrect statements. In a spiritual context, a hallucinated teaching could be spiritually harmful.
- **Trust:** Users can verify every result against the source text. There is nothing to hallucinate because the AI generates no content.
- **Theological alignment:** The DELTA framework principle of Agency — the AI facilitates access to the teachings, it does not become a teacher.
- **Simplicity:** The Librarian model is architecturally simpler, cheaper (fewer LLM tokens), and more reliable than synthesis.

### Consequences

- **Chunking quality is paramount.** Each chunk must be a coherent, self-contained passage suitable for display as a standalone quote.
- **The "Read in context" link is critical.** Every search result must deep-link to the full chapter view, positioned at that passage.
- **The "no results" case must be handled gracefully.** When the corpus doesn't address a query, the system must say so honestly rather than stretching to find something.
- **The AI's output format is constrained.** Query expansion returns a JSON array of terms. Passage ranking returns a JSON array of IDs. No prose output.
- **Consolidated in FTR-005:** The full Claude AI Usage Policy — permitted roles, prohibited uses, output format constraints, and expansion roadmap — is maintained in FTR-005.
- **Multi-author scope (FTR-001).** The librarian model applies to all SRF-published authors across three author tiers: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi Janakananda), monastic (monastic speakers). All tiers receive verbatim fidelity. Tiers govern search inclusion, daily passage eligibility, and social media pool participation — not fidelity level. See FTR-001 for the confirmed hierarchy and per-tier feature behavior.
