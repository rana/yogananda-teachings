# SRF Online Teachings Portal — AI Context

## What This Project Is

A free, world-class online teachings portal for Self-Realization Fellowship (SRF) to make Paramahansa Yogananda's published books freely accessible worldwide, with an AI-powered intelligent search tool. Funded by a philanthropist. Launching late 2026.

**AI-human collaboration.** The AI is architect, designer, implementer, and operator; the human principal directs strategy, stakeholder decisions, and editorial judgment (PRI-12). The documentation volume is intentional — it serves as institutional memory across AI context windows. MCP servers are the primary operational interface. See CONTEXT.md § Project Methodology for the full collaboration model.

## Read These Files

1. **PRINCIPLES.md** — The 12 immutable commitments that define the project, with rationale. Always load this.
2. **CONTEXT.md** — Project background, mission, stakeholders, theological constraints, current state, open questions
3. **features/FEATURES.md** — Single index of all FTR files across 5 domains. Maps every feature to its file. Includes Always-Load FTRs list.
4. **features/foundation/** — Core identity, cross-cutting constraints, infrastructure, conventions (39 files)
5. **features/search/** — Search architecture, data model, ingestion, AI pipeline, taxonomy (32 files)
6. **features/experience/** — Frontend, pages, accessibility, responsive, multilingual (41 files)
7. **features/editorial/** — Staff tools, editorial workflows, content intelligence (23 files)
8. **features/operations/** — CI/CD, observability, testing, governance, operational tooling (30 files)
9. **ROADMAP.md** — Milestone-based roadmap. Current milestone first, planned milestones next, completed milestones archived. Deliverables, success criteria, milestone gates.

**Domain-gated reading.** Do not read front-to-back. Load what the task requires:
- **Always:** This file (CLAUDE.md) + PRINCIPLES.md + CONTEXT.md § Current State + ROADMAP.md § Current + FEATURES.md § Always-Load FTRs (11 FTRs)
- **When implementing:** FTRs referenced in the current milestone's deliverable table
- **When implementing search/data/ingestion:** + `features/search/` files (or specific ones by identifier)
- **When implementing frontend/pages/UX:** + `features/experience/` files (specific ones by identifier)
- **When implementing editorial/staff/intelligence:** + `features/editorial/` files (specific ones by identifier)
- **When making decisions:** FEATURES.md index to locate the relevant domain, then load the FTR file
- **When evaluating proposals or at milestone boundaries:** FTR files with state `proposed` or `deferred`

## Ignore

- **scratch.md** — Personal scratchpad. Not project documentation. Do not read.

## Reference Documents (Background Research)

Located in `docs/reference/`:

- **overview-youtube.md** — Brother Chidananda's announcement of the portal (YouTube transcript)
- **srf-teaching-portal-research-gemini-3-pro.md** — Comprehensive theological, pedagogical, and technical analysis
- **srf-tech-stack-brief-3.md** — SRF's established technology stack (AWS, Vercel, Contentful, Neon, Auth0, etc.). **Conformance note:** This document is prescriptive for SRF projects. When designing infrastructure, compare choices against this brief and document divergences with explicit justification. The portal adopted Secrets Manager (FTR-112) and OIDC (FTR-113) aligned with this standard; SSM Parameter Store deferred with documented rationale. See FTR-112 § "SSM Parameter Store — Deferred, Not Rejected."
- **rag-architecture-proposal.md** — Comprehensive RAG architecture and feature proposal (Claude Web, Feb 2026). Merge-reviewed: FTR-025–FTR-026 and FTR-034–FTR-070 adopted; Features 10–11 omitted/constrained; stack divergences annotated.
- **prioritizing-global-language-rollout.md** — Global language demographics, device/bandwidth analysis, and content rollout strategy (53 cited sources: Ethnologue, ITU, UNESCO, DataReportal, GSMA). Used as the data foundation for FTR-011 (Reachable Population prioritization framework). Some recommendations conflict with project decisions (payment infrastructure, SRF Lessons scope, language phasing) — see FTR-011 for what was adopted and what was set aside.
- **google-ai-ecosystem-2026.md** — Comparative analysis of Gemini Embedding 2 vs Voyage 4, Google Developer API vs Vertex AI, and Deep Research agent (web app vs Interactions API). Informed Voyage 4 migration evaluation (FTR-024) and autosuggestion research design (FTR-029). Gemini Embedding 2 not adopted — portal is text-only, Voyage 4 MoE is better fit.
- **autosuggestion-architecture-sacred-texts-2026.md** — Gemini Deep Research output (March 2026): 11-topic frontier survey covering client-side search indices (FlexSearch), snippet previews, semantic suggestions, voice/dictation UX, IME composition, edge functions, offline PWA, faceted search, ARIA 1.3, cross-lingual bridging, and SRF/YSS corpus inventory. Directly informs FTR-029 revision and FTR-120 book priority.
- **gemini-deep-research-structural-enrichment-report.md** — Gemini Deep Research analysis (March 2026): 12-topic survey, 94 citations. Computational narratology, emotional trajectory modeling, author voice profiling, cross-text alignment, sacred text analysis, Indian literary theory (rasa, dhvani, auchitya), long-context LLM prompting, museum curation, validation methodology, cross-language structural analysis, semantic coordinates, hierarchical enrichment. Key finding: Indian literary theory provides categories native to Yogananda's tradition for structural enrichment. Directly informs FTR-128 schema and methodology.
- **claude-deep-research-structural-enrichment-report.md** — Claude Deep Research report (March 2026): 12-topic survey. Key corrections to Gemini findings: (1) "No Free Labels" — Sonnet-as-judge risks for interpretive outputs; (2) dhvani/auchitya never computationalized (stronger than Gemini's "barely"); (3) 17-point GPQA gap justifies Opus for all interpretive tasks; (4) back-propagation is genuinely novel; (5) contemplative emotion taxonomy gap. Informs FTR-128 all-Opus decision, validation methodology, and FTR-165 creation.
- **deep-research-report-contemplative-emotion-taxonomy-2026.md** — Gemini Deep Research report (March 2026): 6-topic survey, 57 citations. Bhakti rasa extension (Rupa Goswami's 5 devotional rasas beyond Navarasa), dhvani computationalization via hermeneutic depth tiers (Abhidha/Lakshana/Vyanjana mapped to Informational/Practical/Transcendent), auchitya filtered to 6-tag structural role taxonomy for prose, dual-layer contemplative classification (described emotion vs. evoked emotion), cross-cultural bifurcated architecture (Sanskrit system-facing / culturally legible user-facing), multi-persona LLM prompting and probability vector storage. Key finding: Nested Aesthetic Taxonomy merging Navarasa + Bhakti provides the precise devotional vocabulary Yogananda's corpus requires. Critical disambiguation: most "rasa classification" NLP papers are actually Rasa NLU chatbot or musical raga classification. Directly informs FTR-128 rasa taxonomy, structural role schema, and prompt design; FTR-127 dual-layer depth signatures and hermeneutic tiers; FTR-165 rasa dimension.
- **claude-deep-research-contemplative-emotion-taxonomy-report.md** — Claude Deep Research report (March 2026): 6-topic survey. Key corrections and extensions to Gemini findings: (1) dhvani has zero computational implementations — not even theoretical proposals; (2) auchitya's 27 categories clustered into 4 groups, recommends ~8 passage-function values vs Gemini's 6; (3) 23 contemplative states missing from all NLP taxonomies (GoEmotions explicitly filtered religion words); (4) described-vs-evoked dual perspective essential — sacred text has triple function (describe, evoke, transmit); (5) perspectivist annotation (diamond standard) solves no-ground-truth problem; (6) dual persona prompting (devotee + scholar) supported by ACL 2024 evidence. Key finding: GoEmotions — the dominant NLP emotion taxonomy — derived from Reddit with religion explicitly excluded; the 23 missing contemplative states represent a systematic blind spot in computational culture. Realistic targets: κ = 0.25–0.45 inter-annotator agreement, macro-F1 ≥ 0.45 full taxonomy, F1 ≥ 0.60 core states. Directly informs FTR-128 contemplative emotion taxonomy, FTR-127 depth signatures, FTR-165 rasa dimension.
- **gemini-deep-research-modern-search-report.md** — Gemini Deep Research report (March 2026): 12-topic frontier survey on modern search architecture beyond cosine vector similarity, 67 citations. Late interaction (ColBERT/VectorChord), learned sparse retrieval (SPLADE/pg_sparse replacing BM25), adaptive hybrid fusion beyond RRF, enrichment-augmented embeddings, domain-adapted fine-tuning, cross-encoder reranking (Voyage Rerank), in-database GraphRAG (Apache AGE), non-topical retrieval (rasa/emotion/depth), cross-lingual parallel corpus exploitation, PostgreSQL-native search evolution, materialized concordance views, multi-persona search evaluation. Key findings: brute-force exact search at 50K scale beats HNSW (100% recall, ~40ms); enrichment-augmented embeddings are highest-ROI upgrade; need-aware retrieval over query-aware; pre-materialized navigation over dynamic search. Directly informs FTR-020, FTR-024, FTR-025, FTR-026, FTR-027, FTR-028, FTR-034, FTR-037, FTR-128, FTR-129, FTR-165.
- **claude-deep-research-modern-search-report.md** — Claude Deep Research report (March 2026): 12-topic survey with specific model recommendations and cost estimates. Convergent with Gemini report on key findings: (1) enrichment-augmented embeddings highest-ROI (~$54 total); (2) Convex Combination replaces RRF (Bruch et al. 2022, NDCG@1000 0.454 vs 0.425); (3) cross-encoder reranking standard not optional; (4) register-driven adaptive fusion weights. Additions beyond Gemini: Jina-ColBERT-v2 for multilingual late interaction, Contextual AI Reranker v2 for instruction-following reranking, LazyGraphRAG (1000x cost reduction), MITRA project as cross-lingual parallel, Spotify dimensional model as rasa-space template, ARES over RAGAS for evaluation, RPP for A/B testing without behavioral data. Key architectural conclusion: navigation-first with search as secondary path; pre-computed concordances serve 80-90% of interactions. Directly informs FTR-020 (CC fusion, adaptive weights), FTR-024 (enrichment-augmented embedding), FTR-027 (Voyage Rerank standard), FTR-037 (multi-dimensional evaluation).
- **deep-research-sacred-reading-experience-report.md** — Gemini Deep Research report (March 2026): 8-section survey, 70 citations. Sacred text digital platform analysis (Sefaria, CBETA, Quran.com, YouVersion), contemplative reading practices as UX patterns (Lectio Divina, Svadhyaya, Tadabbur), oculomotor science applied to devotional text, Devanagari typography and sacred text pacing, study-devotion interface tension, re-reading as primary mode, reading-to-practice seam, communal reading without social features. Key findings: (1) DOM removal (not CSS hiding) for accessibility-tree silence in focus modes; (2) never `text-align: justify` for Devanagari — destroys conjunct spacing; (3) contemplatio decay — fade text after 45s inactivity in dwell/zoom; (4) lotus SVG as cognitive structural break with accessible `<title>`; (5) practice-passage detection at ingestion via instructional verb identification; (6) anonymous resonance counters for invisible global satsang; (7) no progress metrics in reader — hostile to contemplative re-reading. Directly informs FTR-041, FTR-055, FTR-026, FTR-031, FTR-131, FTR-145, FTR-163.
- **claude-deep-research-sacred-reading-experience-report.md** — Claude Deep Research report (March 2026): 8-topic survey. Key extensions and corrections to Gemini findings: (1) no existing sacred text platform designs for re-reading as primary mode — portal's largest design opportunity; (2) Vedabase's MS-DOS preference proves simpler interfaces can be spiritually superior; (3) theological convictions must drive interface decisions, not software engineering conventions (validated across Sefaria, Quran.com, SikhiToTheMax); (4) "Arrive" phase (centering transition before text) absent from portal — Lectio Divina apps demonstrate this is functional, not decorative; (5) screen reading of sacred text is measurably degraded vs print — portal should explicitly position as complement to physical books; (6) Daf Yomi synchronized daily reading creates invisible community without interaction; (7) ambient co-presence (ephemeral WebSocket reader counts) for invisible satsang; (8) five-stage re-reading deepening model (comprehension, connection, appreciation, internalization, transformation); (9) Kindle Popular Highlights cautionary tale — popularity signals distort contemplative reading. Directly informs FTR-166 (Personal Reading Map), FTR-041 (Arrive phase gap), FTR-047 (complement-to-print positioning), FTR-031 (no popular highlights), FTR-055 (practice-passage detection).
- **deep-research-report-discovery-without-surveillance-2026.md** — Gemini Deep Research report (March 2026): 6-topic survey, 42 citations. Library science (9-fold browsing effect, appeal-factor indexing, NoveList), museum curation (palette cleansers, dual-mode architecture, Rijksmuseum Art Explorer), content-only recommendation (MMR diversity, Mufin deep feature extraction, circadian context routing), sequencing and arc design (liturgical energy curves, anthology framing, emotional bridging), anonymous collective signals (resonance vs popularity weighting, productive friction, Reflective Agency Framework), the "wise librarian" effect (gift framing, scarcity of choice, curatorial transparency notes). Key finding: DELTA constraint is an advantage — behavioral systems need 11.3 sessions to stabilize taste vectors; content-only systems respond to seeker's *current* state. Directly informs FTR-030 (MMR + appeal factors), FTR-031 (temporal decay, no counters in Quiet Corner), FTR-063 (palette cleansers, anthology framing), FTR-121/122 (MMR theme diversity), FTR-138 (gift framing, single-passage response), FTR-140 (productive friction, circadian weighting), FTR-162 (liturgical energy curve, emotional bridging).

## Principles (Code-Affecting)

Twelve principles define the project's identity and directly constrain code generation. Changing any of these changes what the project is — they require full deliberation to modify. When principles tension, Content Identity takes precedence over Seeker Experience, which takes precedence over Engineering Foundation. Within each tier, principles are ordered by topic adjacency, not by weight — do not assume lower-numbered principles are less relevant. PRINCIPLES.md has the expanded rationale for each. Additional theological and ethical context (Content Honesty, Lessons Scope, Human Review Gate) is in CONTEXT.md § Theological and Ethical Constraints.

**Content Identity** — what this project is:
- **PRI-01: Verbatim Fidelity.** The AI is a librarian, not an oracle. It finds and ranks the verbatim published words of Yogananda and all SRF-published authors — it NEVER generates, paraphrases, or synthesizes content in any medium: text, voice, image, or video. AI generation, synthesis, or cloning of any media representing Yogananda or the lineage gurus is prohibited. The corpus spans three author tiers by role: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi), monastic (monastic speakers). All tiers receive verbatim fidelity. (FTR-001, FTR-005, FTR-008)
- **PRI-02: Full attribution always.** Every displayed passage carries full provenance: author, book, chapter, page. No orphaned quotes — every result links to its full chapter context. Full author name always displayed. When no official translation exists, the content is unavailable in that language — honest absence over synthetic substitution. When content is absent, guide constructively — honest absence as invitation, never a dead end. (FTR-058, FTR-135, FTR-123)
- **PRI-03: Honoring the Spirit of the Teachings.** Every interaction should amaze — and honor the spirit of the teachings it presents. The portal's execution quality should match the spiritual depth of its content — in every medium: color screens, grayscale, e-ink, print, screen readers, braille. A passage on a monochrome Kindle should feel as honored as one rendered in gold on cream. Before shipping any component, ask: "Is this worthy of presenting Yogananda's words?" Not just typography that renders text, but typography that honors its rhythm. Not just search that returns results, but search that feels curated. Restraint as excellence — the technology disappears and the teachings shine. (FTR-010, FTR-043 § Display Resilience)
- **PRI-04: Signpost, not destination.** The portal leads seekers toward practice — it never substitutes for it. Practice Bridge routes technique queries to SRF Lessons information. Crisis query detection provides safety interstitials. The AI never interprets meditation techniques or spiritual practices. (FTR-055, FTR-051, FTR-049)

**Seeker Experience** — who we serve and how:
- **PRI-05: Global-First.** Supports all humans of Earth equally — low-resourced and high-resourced peoples, low-resource phones with intermittent bandwidth and high-resource phones, tablets and desktops. A seeker in rural Bihar on 2G and a seeker in Los Angeles on fiber both get the complete experience. Progressive enhancement: HTML is the foundation, CSS enriches, JavaScript enhances. No feature gating behind connectivity. Core experiences degrade gracefully with intermittent or absent connectivity. Performance budgets enforce this. **Scope prioritization:** when scope must be ordered, the option serving more reachable people ships first (FTR-011). Spanish is Tier 1 (activated); Hindi is Tier 1 deferred to Milestone 5b (authorized YSS source not yet available outside India). (FTR-006, FTR-011)
- **PRI-06: Multilingual from the foundation.** Every content table carries a `language` column from the first migration. Every content API accepts a `language` parameter. UI strings externalized, CSS uses logical properties, schema includes cross-language linking. Adding a new language should require zero schema migrations, zero API changes, and zero search rewrites. PRI-05's structural mechanism — global-first without multilingual foundations is aspiration without substance. (FTR-058, FTR-135)
- **PRI-07: Accessibility from first deployment.** WCAG 2.1 AA from the first component. Mobile-first responsive design from the first deployable page — ~70% of the Hindi/Spanish audience is mobile-first (FTR-011, FTR-006). Semantic HTML, ARIA landmarks, keyboard navigation, screen reader support, 44×44px touch targets, `prefers-reduced-motion`. Performance budgets: < 100KB JS, FCP < 1.5s. axe-core in CI — accessibility violations block merges. (FTR-003)
- **PRI-08: Calm Technology.** No push notifications, no autoplay, no engagement tracking, no gamification, no reading streaks, no time-pressure UI. The portal waits; it does not interrupt. Technology requires the smallest possible amount of attention. (FTR-042, FTR-002)
- **PRI-09: DELTA-compliant analytics.** No user identification, no session tracking, no behavioral profiling. Amplitude event allowlist only. Curation algorithms derive intelligence from the corpus, never from user behavior patterns — even anonymized. (FTR-082, FTR-085)

**Engineering Foundation** — how we build:
- **PRI-10: 10-year design horizon.** `/lib/services/` has zero framework imports — business logic survives a UI rewrite. Raw SQL migrations outlive every ORM. Standard protocols (REST, OAuth, SQL, HTTP) at every boundary. Tier 2 components (Next.js, Vercel, Contentful) are replaceable without touching Tier 1 (PostgreSQL, SQL, HTML). (FTR-004)
- **PRI-11: API-first architecture.** All business logic in `/lib/services/`. API routes use `/api/v1/` prefix. All routes public (no auth until Milestone 7a+). Cursor-based pagination. (FTR-015)
- **PRI-12: AI-Native Development and Operations.** The AI is architect, designer, implementer, and operator. The human principal directs strategy, stakeholder decisions, and editorial judgment. MCP servers are the primary operational interface — every managed service integral to routine operations requires MCP or equivalent API access. Operational surfaces are machine-parseable: structured JSON health, script-driven deployment, machine-readable manifests. Documentation is institutional memory across context windows — load-bearing infrastructure, not overhead. (FTR-093)

**Principle dependencies.** Several principles enable or enforce others — when implementing, the enabling principle constrains code even when the enabled principle is not directly relevant:
- PRI-06 enables PRI-05: multilingual schema is global-first's structural mechanism
- PRI-07 enables PRI-05: accessibility is global-first's inclusion mechanism
- PRI-02 enables PRI-01: attribution prevents orphaned quotes
- PRI-09 enforces PRI-08: DELTA analytics is calm technology's privacy layer
- PRI-12 enables PRI-10: AI-native ops is the 10-year horizon's operational mechanism

## Quick Reference

**Scope prioritization (FTR-011).** When two features or milestones are architecturally independent, the one serving more reachable people ships first. Metric: `speakers × internet_penetration × content_availability`. Apply this when facing feature-vs-feature or language-vs-feature tradeoffs. Spanish is Tier 1 (activated); Hindi is Tier 1 (deferred to Milestone 5b — authorized YSS source unavailable outside India); Portuguese and Bengali are Tier 2; remaining 5 languages are Tier 3. Full demographic data and worked examples in FTR-011.

**Parameters as named constants (FTR-012).** Specific numeric values (chunk sizes, rate limits, thresholds) are tunable defaults, not architectural commitments. All parameters in `/lib/config.ts`. Each documents: value, rationale, evaluation trigger.

**Core stack.** Pure hybrid search (vector + BM25 + Convex Combination fusion) is the primary search mode — no AI in the search path. Enhanced search (M3a): enrichment-augmented embeddings, HyDE, Voyage Rerank, register-driven adaptive fusion weights (FTR-020, FTR-027). Infrastructure managed by yogananda-platform MCP (FTR-106 revised); one-time AWS security via `bootstrap.sh`. See FTR-014 for architecture diagrams and SRF divergence rationale.

| Layer | Technology | Role | Governing FTR |
|-------|-----------|------|---------------|
| Application | Next.js 15 on Vercel | SSR/SSG, API routes, edge CDN | FTR-100 |
| Database | Neon PostgreSQL 18 (Scale tier) | Single primary store | FTR-101, FTR-104 |
| Vector search | pgvector (HNSW) | Semantic similarity | FTR-020 |
| Full-text search | pg_search / ParadeDB (BM25) | Keyword retrieval | FTR-025 |
| Monitoring (DB) | pg_stat_statements | Query performance | FTR-094 |
| CMS | Contentful | Editorial source of truth | FTR-102 |
| Embeddings | Voyage voyage-4-large | 1024-dim semantic vectors (enrichment-augmented M3a) | FTR-024 |
| Reranking (M3a) | Voyage Rerank | Cross-encoder reranking on top-50 candidates | FTR-027 |
| AI (index-time only) | Claude via AWS Bedrock | Enrichment, evaluation — never generates content, never in search path | FTR-105 |
| Graph (M3b+) | Python + NetworkX | Knowledge graph batch pipeline | FTR-034 |
| Suggestions | Static JSON at CDN edge + pg_trgm fallback | Autosuggestion (Vercel KV if needed M2b+) | FTR-029 |
| Language detection | fastText | Multilingual query routing | FTR-058 |
| Migrations | dbmate | Raw SQL, framework-agnostic | FTR-106 |
| Infrastructure | yogananda-platform MCP | Declarative vendor management | FTR-106 |
| Error tracking | Sentry (M1a–3c) → New Relic (3d+) | Errors now, APM at scale | FTR-036, FTR-082 |
| Analytics | Amplitude (DELTA-compliant) | Event allowlist only, no user tracking | FTR-082, FTR-085 |
| Auth (M7a+) | Auth0 | Identity — provisioned, not active | FTR-114 |

**Code layout:**
```
/lib/services/ — Business logic (framework-agnostic TypeScript)
/lib/config.ts — Named constants per FTR-012 (model IDs, chunk sizes, search params)
/lib/mcp/ — MCP server (unscheduled; FTR-098)
/lib/logger.ts — Structured JSON logging
/app/ — Next.js Server Components + Route Handlers
/app/api/v1/ — Versioned API routes
/migrations/ — Numbered SQL migrations (dbmate)
/terraform/bootstrap/ — IAM policy documents (referenced by bootstrap.sh; .tf files archived)
/lambda/ — AWS Lambda handlers (Milestone 3a+, FTR-107)
/messages/ — Locale JSON files (next-intl)
/scripts/ — Bootstrap, CI-agnostic deployment, and environment lifecycle scripts (FTR-108, FTR-110)
/.github/workflows/ — CI/CD pipelines (ci.yml, neon-branch.yml)
/features/ — FTR files by domain (foundation/, search/, experience/, editorial/, operations/)
/docs/guides/ — Human onboarding and setup (getting-started, credentials, manual steps)
/docs/operations/ — Operational runbooks and procedures (Milestone 3b+)
/docs/reference/ — Background research (not active project docs)
```

**Book cover images.** Stored as optimized WebP in `public/book-images/covers/{slug}.webp` (240px wide, ~15–25KB). Database `books.cover_image_url` stores the public path (e.g., `/book-images/covers/autobiography-of-a-yogi.webp`). English source: `data/book-ingest/autobiography-of-a-yogi/assets/front-cover.png`. Spanish source: Amazon product image (no local source asset). When adding a new book: resize source to 240px wide WebP, place in covers directory, UPDATE the database row. Display uses `height: 120px; width: auto` to preserve native aspect ratio without clipping.

**Design tokens:** Merriweather + Lora + Open Sans (Latin); Noto Serif Devanagari (Hindi reading) + Noto Sans Devanagari (Hindi UI/verses). Hindi body text at 20px / 1.9 line height (FTR-131). SRF Gold `#dcbd23`, SRF Navy `#1a2744`, Warm Cream `#FAF8F5`. Full palette in FTR-014 § Visual Identity.

**MCP servers (PRI-12: every managed service integral to routine operations requires MCP or equivalent API access):**
- **Neon Management** (now) — Claude's operations interface for Neon. Branch creation, SQL execution, schema diffs, connection strings, migration safety (`prepare_database_migration`/`complete_database_migration`). Used throughout development. See FTR-095 § Three-Layer Neon Management Model. Config: VS Code `mcp.json` (HTTP type, Bearer auth).
- **New Relic** (M3d+) — Observability MCP via `newrelic-mcp` npm package. NRQL queries, APM, alerts, deployments, synthetics. Config: VS Code `mcp.json` (stdio via npx). Env: `NEW_RELIC_API_KEY`, `NEW_RELIC_REGION`.
- **Auth0** (Milestone 7a+, provisioned now) — Identity and access management via official `@auth0/auth0-mcp-server` package. Tenant management, application CRUD, user management, role/permission management, log analysis, action management. Uses OAuth 2.0 Device Authorization Flow (credentials in system keychain, not config). Config: VS Code `mcp.json` (stdio via npx). Run `npx -y @auth0/auth0-mcp-server init` to authenticate.
- **Sentry** — Error tracking and monitoring. Via Claude Code plugin.
- **Contentful** (Milestone 1a+) — CMS content management.
- **SRF Corpus** (unscheduled) — AI consumer access to search, themes, graph. Three-tier architecture for external AI systems. See FTR-083, ROADMAP.md § Unscheduled Features; FTR-098. Fundamentally different from Neon Management MCP — this serves AI consumers, not the AI operator.

## Identifier Conventions

**PRI-NN** (Principles) — The 12 immutable commitments in PRINCIPLES.md. Two-digit zero-padded (PRI-01 through PRI-12). PRI numbers are stable and append-only. Tier grouping (Content Identity PRI-01–04, Seeker Experience PRI-05–09, Engineering Foundation PRI-10–12) communicates precedence, not the number. Header format: `### PRI-NN: Title`.

**FTR-NNN** (Features) — The single unified identifier for all architectural decisions, design specifications, and proposals. Each FTR is one file in `features/{domain}/FTR-NNN-{slug}.md`. Five domains with number ranges: foundation (001–019, overflow 100–119), search (020–039, overflow 120–130, 165), experience (040–059, overflow 131–147, 160–163), editorial (060–079, overflow 148–150), operations (080–099, overflow 151–159, 164). FTR numbers are stable identifiers — do not renumber. Header format: `# FTR-NNN: Title`. New FTRs append after the current max across all domains.

**FTR lifecycle states:** `proposed` → `approved` → `implemented` | `deferred` | `declined`. Variants: `approved-foundational` (project-identity features requiring full deliberation to change), `approved-provisional` (approved pending implementation experience). In frontmatter, use hyphenated lowercase (`approved-foundational`). In prose and tables, parenthetical form is acceptable ("Approved (Foundational)").

**FTR frontmatter schema.** Every FTR file opens with a YAML metadata block. Fields:

```yaml
---
ftr: 20                    # Bare integer (prose uses zero-padded FTR-020)
title: "Hybrid Search"     # Quote if contains : — -- or leading special chars
summary: "..."             # 10–20 words: what this feature specifies
state: implemented         # proposed | approved | approved-foundational | approved-provisional | implemented | deferred | declined
domain: search             # foundation | search | experience | editorial | operations
governed-by: [PRI-01]     # Principle refs only — which PRIs constrain this feature
depends-on: [FTR-024]     # FTR refs only — direct implementation prerequisites
always-load: true          # Only on the 11 Always-Load FTRs (see FEATURES.md)
re-evaluate-at: M3d        # Only on deferred/proposed files — milestone form, not Arc
---
```

`governed-by` and `depends-on` are semantically distinct: governed-by declares which principles constrain the feature; depends-on declares which other features must exist first. Both are arrays. `summary` enables AI load/skip decisions from frontmatter alone.

**FTR file anatomy:** `# FTR-NNN: Title` → metadata header → `## Rationale` (the "why") → `## Specification` (the "how") → `## Notes` (history, absorbed proposals). Every feature's rationale and specification live in one file — no dual-homing.

**M{phase}{milestone}-{deliverable}** (Milestone Deliverables) — Deliverables in ROADMAP.md use the `M` prefix for self-identifying cross-references. Pattern: `M1a-4` (Phase 1, Milestone a, deliverable 4). Milestones in prose use full form: "Milestone 1a"; deliverables use M-notation: "M1a-4".

When referencing identifiers in prose, use the prefix form: `PRI-01`, `FTR-023`, `M1a-4`. Zero-pad to the standard width (PRI: 2 digits, FTR: 3 digits).

**Cross-reference convention.** In prose, use bare identifiers: "See FTR-023", "per FTR-020", "PRI-01 governs". No file paths in prose — identifiers are stable across restructuring. Clickable links with file paths belong only in FEATURES.md index. File naming (`FTR-NNN-{slug}.md`) makes identifiers discoverable via glob: `**/FTR-023*` finds the file without consulting an index.

**Migration reference.** `features/MIGRATION.md` maps every old identifier (ADR-NNN, DES-NNN, PRO-NNN) to its FTR number. Consult this when encountering old identifiers in external references or git history.

## Project Commands, Agents, and Skills

### Project Commands (`.claude/commands/`)

Operational commands specific to this portal. Invoked as `/command-name`.

| Command | Purpose |
|---------|---------|
| `/ingest` | Book ingestion pipeline orchestrator. 9-stage pipeline (source → extract → assemble → validate → Contentful → Neon → embeddings → relations → verify). Accepts book slug or "status". |
| `/db` | Schema-aware database operations. Migrations, diagnostics, natural language queries via Neon MCP. Knows the full schema and migration conventions. |
| `/eval` | Search quality evaluation. A/B comparison protocol for HyDE (M3a-11) and Cohere Rerank (M3a-12) against golden retrieval sets. |

### Project Agents (`.claude/agents/`)

Six agents — 4 SRF-specialized (from plugin) + 2 project-aware overrides.

| Agent | Role | Override? |
|-------|------|-----------|
| `builder` | Implementation with portal-specific conventions — code layout, testing patterns, design system, PRI constraints | Yes — overrides plugin generic `builder` |
| `operator` | Operational analysis — Neon, Vercel, Lambda, Contentful, Voyage AI, cost structure, diagnostic queries | Yes — overrides plugin generic `operator` |
| `doc-maintainer` | Document integrity — identifier audit, omission search, cross-document consistency | SRF-specialized (from plugin) |
| `pre-impl-reviewer` | Pre-implementation quality gate — coherence, gaps, threat modeling | SRF-specialized (from plugin) |
| `launch-readiness` | Production readiness — 9-dimension go/no-go | SRF-specialized (from plugin) |
| `stakeholder-brief` | Translate architecture into SRF stakeholder communication | SRF-specialized (from plugin) |

### Plugin Skills (`yogananda-skills` plugin, invoked as `/y:skill-name`)

43 skills + 11 commands distributed via the `yogananda-skills` plugin. Key skills for current work:

**Review & quality:** `/y:review`, `/y:deep-review`, `/y:gaps`, `/y:verify`, `/y:doc-health`, `/y:api-review`, `/y:crystallize`
**SRF mission:** `/y:mission-align`, `/y:seeker-ux`, `/y:cultural-lens`, `/y:proposal-merge`, `/y:theme-integrate`, `/y:ftr-curate`, `/y:ftr-stale`
**Implementation:** `/y:implement`, `/y:scope`, `/y:consequences`, `/y:context-switch`, `/y:drift-detect`
**Workflow:** `/y:explore`, `/y:explore-act`, `/y:commit`, `/y:compose`, `/y:status`

**Feature management workflow:** `/y:proposal-merge <FTR-NNN>` or `/y:theme-integrate <FTR-NNN>` → run `/y:review` to verify cross-document integrity.

## Document Maintenance

Root documents (CLAUDE.md, PRINCIPLES.md, CONTEXT.md, ROADMAP.md) plus `features/FEATURES.md` index and 164 active FTR files in `features/` (foundation/, search/, experience/, editorial/, operations/). Keep them accurate as you work — drift compounds across sessions. (FTR-084)

| When this happens... | ...update these documents |
|----------------------|--------------------------|
| Principle added or revised | Update PRINCIPLES.md (expanded rationale) and CLAUDE.md § Principles (compressed form) |
| New decision or design | Create FTR file in `features/{domain}/FTR-NNN-{slug}.md`. Add row to FEATURES.md index. |
| Open question resolved | Add one-line entry to CONTEXT.md § Resolved Questions table (date, resolution, governing FTR ref). Remove inline `[x]` item from Open Questions. |
| Open question added | Add to CONTEXT.md § Open Questions (appropriate tier). Cross-reference from relevant FTR if applicable. |
| Milestone deliverable changed | Update ROADMAP.md deliverable table/bullets and success criteria |
| Milestone status changes | Update "Current State" section in CONTEXT.md |
| New technology adopted | Update the relevant FTR file (e.g., FTR-014 Architecture Overview) |
| New content type added | Update FTR-021 (Data Model), FTR-018 (Content Pipeline), ROADMAP.md. Also: FTR-035 KG checklist. |
| New API endpoint added | Follow FTR-015 § API Conventions (FTR-088). Paginated lists: `data`/`pagination`/`meta`; complete collections: `data`/`meta`; single resources: object directly. |
| FTR fully implemented | Set state to `implemented` in the FTR file metadata. Code becomes source of truth for details; FTR remains the architectural rationale. |
| Parameter tuned (FTR-012) | Update `/lib/config.ts` with new value, rationale, and evaluation trigger. |
| Feature idea without a milestone | Create FTR file with state `proposed` in the appropriate domain. Add to FEATURES.md. |
| Feature deferred during development | Set FTR state to `deferred` with reason and re-evaluation target. Update ROADMAP.md § Unscheduled Features. |
| README.md details change | Update README.md § Documentation list and § Architecture table |

At milestone boundaries, reconcile all documents for consistency — personas, roles, workflows, directories, and cross-cutting concerns.

## Documentation–Code Transition

Once implementation begins, FTR files transition from "authoritative spec" to "architectural reference":

1. **Before code exists:** The FTR file is the source of truth. Follow it precisely.
2. **When implemented:** Set state to `implemented` in the FTR metadata. Code becomes the source of truth for details; the FTR remains the architectural rationale. Stop loading the file routinely.
3. **When implementation diverges from design:** Update the FTR file to reflect the actual decision. FTR files are living documents, not historical artifacts.

FTR files are mutable living documents. Update them directly — add, revise, or replace content in place. Git history serves as the full audit trail.
