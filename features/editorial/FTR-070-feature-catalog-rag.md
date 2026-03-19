---
ftr: 70
title: Feature Catalog (RAG Architecture Proposal)
summary: "Catalog of adopted RAG proposal features with milestone assignments and governing FTR references"
state: approved-provisional
domain: editorial
governed-by: [PRI-01, PRI-10]
depends-on: [FTR-030, FTR-034, FTR-026]
---

# FTR-070: Feature Catalog (RAG Architecture Proposal)

## Rationale

This section catalogs the features proposed in the RAG Architecture Proposal (`docs/reference/rag-architecture-proposal.md`) that were accepted for integration into the project. Each feature has a milestone assignment, governing ADRs, and key dependencies. The reference document contains the full design exploration; this catalog tracks what was adopted and when it ships.

### Accepted for Design Integration

These features are actively designed into the architecture and have governing ADRs:

| Feature | Milestone | Governing ADRs | Key Dependencies |
|---------|-----------|----------------|------------------|
| **Related Teachings — Categorized** | 3a (similarity), 3b+ (graph-categorized) | FTR-030, FTR-034 | Chunk relations (STG-001), graph batch pipeline (STG-007) |
| **Contemplative Companion** | 3d+ | FTR-030, FTR-026, FTR-034 | Enrichment metadata (experiential_depth, voice_register), knowledge graph |
| **Scripture-in-Dialogue** | 3d | FTR-034, FTR-033 | Scripture nodes in knowledge graph, verse-level chunking for Gita/Bible commentaries |
| **Reading Arc** | 5a | FTR-034, FTR-026 | Graph algorithms (PageRank, betweenness centrality), experiential depth progression |
| **Living Commentary** | 3d | FTR-030, FTR-026 | Cross-reference extraction in enrichment pipeline, inline reference cards |

**Related Teachings — Categorized:** When a seeker reads a passage, the side panel shows not just *that* other passages are related but *why*. Five relationship categories: Same Concept, Deeper in This Theme, Another Teacher's Expression, Parallel Tradition, Technique for This State. STG-006 uses embedding similarity to approximate categories. STG-007+ uses graph traversal for true categorization.

**Contemplative Companion:** A depth-aware reading mode that, given a passage, surfaces the contemplative arc: preparatory teachings → the passage itself → deeper explorations → related practices. Uses experiential_depth (1–7 scale) and voice_register enrichment metadata to build the arc. Not a chatbot — a curated pathway through existing content.

**Scripture-in-Dialogue:** For Yogananda's scriptural commentaries (God Talks with Arjuna, The Second Coming of Christ), presents the original scripture verse alongside Yogananda's interpretation, with CROSS_TRADITION_EQUIVALENT edges linking parallel verses across traditions. Navigation follows the scripture's structure, not the book's page order.

**Reading Arc:** Multi-session guided paths through the corpus, constructed from graph analysis. A seeker interested in "meditation" receives a progressive sequence from introductory passages through advanced teachings, following the PROGRESSION_TO edges and experiential_depth ordering. Paths are computed, not editorially curated — but editorial review approves before publication.

**Living Commentary:** Yogananda's commentaries are dense with internal cross-references ("as I explained in Chapter X"). The enrichment pipeline extracts these references; Living Commentary makes them navigable. Inline reference cards show a verbatim preview of the referenced passage without leaving the current reading position.

### Deferred with Milestone Assignment

These features are documented and milestone-assigned but not yet actively designed. Features without a milestone assignment belong in ROADMAP.md § Unscheduled Features instead.

| Feature | Milestone | Key Dependency | Notes |
|---------|-----------|---------------|-------|
| **Knowledge Graph Exploration UI** | Future milestones | FTR-034, graph batch | react-force-graph-3d, interactive 3D visualization |
| **Concept/Word Graph Exploration UI** | Future milestones | FTR-034, graph batch | D3 + WebGL progressive enhancement |
| **Lineage Voice Comparator** | 5a | FTR-034, FTR-026 | Compare how Yogananda and his gurus discuss the same concept |
| **Evolution of a Teaching** | 5a | FTR-034, temporal metadata | How Yogananda's expression of a concept evolved across books over decades |
| **Cosmic Chants as Portal** | Distributed | FTR-034, chant content | If chants are in corpus scope: verse-by-verse with Yogananda's explanations |
| **Passage Genealogy** | 5a | FTR-034, cross-reference extraction | The lineage of thought behind each passage — what influenced it |
| **Semantic Drift Detection** | 5a | FTR-026, temporal metadata | Staff tool: detect when the same term shifts meaning across books |
| **Consciousness Cartography** | Future milestones | FTR-034, FTR-034, graph batch | Stretch goal: visual map of consciousness states and their relationships |

### Explicitly Omitted

| Feature | Reason | See |
|---------|--------|-----|
| **Healing Architecture** | Creating a structured condition-to-practice graph risks health claims positioning. Scientific Healing Affirmations is searchable as a book; no structured healing graph. | Annotated in reference document |
| **Inter-Tradition Bridge** (beyond corpus) | The portal surfaces Yogananda's own explicit cross-tradition mappings. Extending beyond his words is theological interpretation, violating FTR-001. | Annotated in reference document |
