# FTR Index — Unified Feature Registry

> **Navigation.** This file is the single index for all FTR files. Load this to find any feature by number, title, domain, or state. Individual FTR files contain the full rationale, specification, and notes.
>
> **Loading guidance.** Always load this file when orienting to the project. Load individual FTR files only when the task requires their content.
>
> **Identifier format.** `FTR-NNN` — three-digit, zero-padded. Numbers are stable identifiers, not sequence counters. Gaps exist from domain allocation; do not renumber.
>
> **States.** Proposed | Approved | Approved (Foundational) | Approved (Provisional) | Implemented | Deferred | Declined. Frontmatter uses hyphenated lowercase: `approved-foundational`, `approved-provisional`. Parenthetical form is the display equivalent.

---

## Domain Allocation

| Domain | Base Range | Overflow | Directory | Count |
|--------|-----------|----------|-----------|-------|
| Foundation | FTR-001–019 | FTR-100–119, FTR-168, FTR-171, FTR-177 | `features/foundation/` | 42 |
| Search | FTR-020–039 | FTR-120–130, FTR-165 | `features/search/` | 32 |
| Experience | FTR-040–059 | FTR-131–147, FTR-160–163, FTR-166, FTR-176 | `features/experience/` | 43 |
| Editorial | FTR-060–079 | FTR-148–150 | `features/editorial/` | 22 (+1 absorbed) |
| Operations | FTR-080–099 | FTR-151–159, FTR-164, FTR-167, FTR-169–170, FTR-172–175, FTR-178 | `features/operations/` | 38 |
| **Total** | | | | **178** (176 active, 1 absorbed, 1 declined) |

---

## Foundation (39 FTRs)

Core identity, cross-cutting constraints, infrastructure, and conventions.

| FTR | Title | State |
|-----|-------|-------|
| [001](foundation/FTR-001-verbatim-fidelity.md) | Direct Quotes Only — No AI Synthesis | Approved (Foundational) |
| [002](foundation/FTR-002-personalization-restraint.md) | Personalization with Restraint — DELTA-Aligned Feature Boundaries | Approved (Foundational) |
| [003](foundation/FTR-003-accessibility-foundation.md) | Accessibility Foundation | Approved (Foundational) |
| [004](foundation/FTR-004-architecture-longevity.md) | Architecture Longevity — 10-Year Design Horizon | Approved (Foundational) |
| [005](foundation/FTR-005-claude-ai-usage-policy.md) | Claude AI Usage Policy — Permitted Roles, Prohibited Uses, and Expansion Roadmap | Approved (Foundational) |
| [006](foundation/FTR-006-global-first.md) | Global-First — Serving Earth's Underserved Seekers | Approved (Foundational) |
| [007](foundation/FTR-007-curation-as-interpretation.md) | Curation as Interpretation — The Fidelity Boundary and Editorial Proximity Standard | Approved (Foundational) |
| [008](foundation/FTR-008-verbatim-media-fidelity.md) | Verbatim Media Fidelity — Cross-Modal Content Integrity | Approved (Foundational) |
| [009](foundation/FTR-009-delta-relaxed-auth.md) | DELTA-Relaxed Authenticated Experience | Approved |
| [010](foundation/FTR-010-experience-quality-standard.md) | Experience Quality Standard — Honoring the Spirit of the Teachings | Approved (Foundational) |
| [011](foundation/FTR-011-reachable-population.md) | Reachable Population — Quantitative Prioritization Framework | Implemented |
| [012](foundation/FTR-012-principle-vs-parameter.md) | Principle vs. Parameter — Decision Classification and Governance Flexibility | Implemented |
| [013](foundation/FTR-013-design-philosophy.md) | Design Philosophy | Approved |
| [014](foundation/FTR-014-architecture-overview.md) | Architecture Overview | Approved |
| [015](foundation/FTR-015-api-first-architecture.md) | API-First Architecture for Platform Parity | Implemented |
| [016](foundation/FTR-016-security-considerations.md) | Security Considerations | Implemented |
| [017](foundation/FTR-017-seeker-persona-index.md) | Seeker & User Persona Index | Approved |
| [018](foundation/FTR-018-unified-content-pipeline.md) | Unified Content Pipeline Pattern | Implemented |
| [019](foundation/FTR-019-error-handling-resilience.md) | Error Handling and Resilience | Implemented |
| [100](foundation/FTR-100-nextjs-vercel.md) | Next.js + Vercel for Frontend | Implemented |
| [101](foundation/FTR-101-neon-pgvector.md) | Neon + pgvector for Vector Search | Implemented |
| [102](foundation/FTR-102-contentful-cms.md) | Contentful as Editorial CMS | Implemented |
| [103](foundation/FTR-103-progressive-web-app.md) | Progressive Web App | Implemented |
| [104](foundation/FTR-104-single-database.md) | Single Database Architecture | Approved |
| [105](foundation/FTR-105-aws-bedrock-claude.md) | AWS Bedrock for Claude API Access | Implemented |
| [106](foundation/FTR-106-platform-managed-infra.md) | Platform-Managed Infrastructure | Implemented |
| [107](foundation/FTR-107-platform-managed-lambda.md) | Platform-Managed Lambda for Batch Compute | Approved |
| [108](foundation/FTR-108-ci-agnostic-deploy.md) | CI-Agnostic Deployment Scripts | Implemented |
| [109](foundation/FTR-109-database-backup.md) | Database Backup and Recovery Strategy | Implemented |
| [110](foundation/FTR-110-multi-environment.md) | Multi-Environment Infrastructure Design | Implemented |
| [111](foundation/FTR-111-redundancy-failover.md) | Redundancy, Failover, and Regional Distribution Strategy | Approved |
| [112](foundation/FTR-112-secrets-management.md) | Secrets Management Strategy — Two-Tier Model with AWS Secrets Manager | Implemented |
| [113](foundation/FTR-113-vercel-oidc.md) | Vercel OIDC Federation — Zero Long-Lived AWS Credentials | Implemented |
| [114](foundation/FTR-114-neon-auth.md) | Neon Auth as Auth0 Alternative | Proposed |
| [115](foundation/FTR-115-pg-cron.md) | pg_cron for In-Database Scheduling | Proposed |
| [116](foundation/FTR-116-logical-replication.md) | Logical Replication for Analytics CDC | Proposed |
| [117](foundation/FTR-117-copyright-framework.md) | Copyright and Legal Framework | Proposed (Validated) |
| [118](foundation/FTR-118-cloudflare-re-evaluation.md) | Cloudflare Re-evaluation for SRF Domain Routing | Proposed |
| [119](foundation/FTR-119-srf-yss-platform.md) | Teachings Platform — Shared Foundation for SRF and YSS | Proposed |
| [168](foundation/FTR-168-ai-agent-platform.md) | AI Agent Platform — Vision (Umbrella: FTR-169–176) | Proposed |
| [171](foundation/FTR-171-agent-role-registry.md) | Agent Role Registry — Hierarchical Teams, Role Definitions, AGENTS.md | Proposed |
| [177](foundation/FTR-177-autonomous-skill-ecosystem.md) | Autonomous Skill Ecosystem — Instrument Principle, Agent Protocol Skills, Trust-Level Prompts | Proposed |

---

## Search (32 FTRs)

Search architecture, data model, ingestion, embeddings, knowledge graph.

| FTR | Title | State |
|-----|-------|-------|
| [020](search/FTR-020-hybrid-search.md) | Hybrid Search (Vector + Full-Text) | Implemented |
| [021](search/FTR-021-data-model.md) | Data Model | Implemented |
| [022](search/FTR-022-content-ingestion-pipeline.md) | Content Ingestion Pipeline | Implemented |
| [023](search/FTR-023-chunking-strategy.md) | Chunking Strategy Specification | Implemented |
| [024](search/FTR-024-embedding-model.md) | Embedding Model — Voyage voyage-4-large, Versioning, and Multilingual Quality | Implemented |
| [025](search/FTR-025-pg-search-bm25.md) | pg_search / ParadeDB BM25 for Full-Text Search | Approved |
| [026](search/FTR-026-unified-enrichment.md) | Unified Enrichment Pipeline — Single Index-Time Pass per Chunk | Implemented |
| [027](search/FTR-027-advanced-search-pipeline.md) | Advanced Search Pipeline — Pure Hybrid Primary, AI-Enhanced Optional | Approved |
| [028](search/FTR-028-vocabulary-bridge.md) | Vocabulary Bridge — Semantic Infrastructure for State-Aware Retrieval | Approved |
| [029](search/FTR-029-search-suggestions.md) | Search Suggestions — Corpus-Derived Autosuggestion | Implemented |
| [030](search/FTR-030-related-teachings.md) | Related Teachings — Pre-Computed Chunk Relations and Graph Traversal | Implemented |
| [031](search/FTR-031-passage-resonance.md) | Passage Resonance Signals — Content Intelligence Without Surveillance | Implemented |
| [032](search/FTR-032-search-intelligence.md) | "What Is Humanity Seeking?" — Anonymized Search Intelligence | Approved |
| [033](search/FTR-033-entity-registry.md) | Canonical Entity Registry and Sanskrit Normalization | Implemented |
| [034](search/FTR-034-knowledge-graph.md) | Knowledge Graph — Structured Spiritual Ontology and Postgres-Native Graph Intelligence | Approved |
| [035](search/FTR-035-knowledge-graph-cross-media.md) | Knowledge Graph Cross-Media Evolution — All Content Types as Graph Nodes | Approved (Provisional) |
| [036](search/FTR-036-project-bootstrap.md) | Project Bootstrap | Implemented |
| [037](search/FTR-037-search-quality-evaluation.md) | Search Quality Evaluation Harness | Implemented |
| [038](search/FTR-038-cognitive-task-classification.md) | Cognitive Task Classification (COG-NN) | Approved |
| [039](search/FTR-039-recognition-first-ia.md) | Recognition-First Information Architecture | Approved (Provisional) |
| [120](search/FTR-120-book-selection-priority.md) | Book Selection and Ingestion Priority | Implemented |
| [121](search/FTR-121-teaching-topics-taxonomy.md) | Teaching Topics — Curated Thematic Entry Points and Multi-Category Taxonomy | Approved |
| [122](search/FTR-122-exploration-themes.md) | Exploration Theme Categories — Persons, Principles, Scriptures, Practices, Yoga Paths | Approved |
| [123](search/FTR-123-content-integrity.md) | Content Integrity Verification | Implemented |
| [124](search/FTR-124-knowledge-graph-visualization.md) | Knowledge Graph Visualization | Approved (Provisional) |
| [125](search/FTR-125-scientific-spiritual-bridge.md) | Scientific-Spiritual Bridge Themes | Proposed |
| [126](search/FTR-126-word-level-graph.md) | Word-Level Graph Navigation | Proposed |
| [127](search/FTR-127-passage-depth-signatures.md) | Passage Depth Signatures — Opus-Classified Contemplative Quality | Proposed |
| [128](search/FTR-128-structural-enrichment.md) | Structural Enrichment Tier — Whole-Context AI Understanding for Navigation | Proposed |
| [129](search/FTR-129-semantic-cartography.md) | Semantic Cartography — Meaningful Spatial Navigation | Proposed |
| [130](search/FTR-130-cross-tradition-concordance.md) | Cross-Tradition Concordance as Primary Search Lens | Proposed |
| [165](search/FTR-165-cross-work-concordance.md) | Cross-Work Teaching Concordance — Passage-Level Connections Across Books | Proposed |

---

## Experience (43 FTRs)

Frontend, UX, accessibility, internationalization, seeker-facing features.

| FTR | Title | State |
|-----|-------|-------|
| [040](experience/FTR-040-frontend-design.md) | Frontend Design | Implemented |
| [041](experience/FTR-041-book-reader.md) | Book Reader | Implemented |
| [042](experience/FTR-042-design-system-calm-tech.md) | Design System — SRF-Derived with Calm Technology Principles | Implemented |
| [043](experience/FTR-043-accessibility-requirements-m2a.md) | Accessibility Requirements | Implemented |
| [044](experience/FTR-044-responsive-design.md) | Responsive Design | Implemented |
| [045](experience/FTR-045-platform-parity-mobile.md) | Platform Parity — Mobile Strategy | Implemented |
| [046](experience/FTR-046-lotus-bookmark.md) | Lotus Bookmark — Account-Free Reading Bookmarks | Implemented |
| [047](experience/FTR-047-non-search-journeys.md) | Non-Search Seeker Journeys — Equal Excellence for Every Path | Approved |
| [048](experience/FTR-048-passage-sharing.md) | Passage Sharing as Organic Growth Mechanism | Implemented |
| [049](experience/FTR-049-events-signpost.md) | Events and Sacred Places — Signpost, Not Destination | Approved |
| [050](experience/FTR-050-sacred-places.md) | Sacred Places — No Embedded Map, Street View Links Instead | Approved |
| [051](experience/FTR-051-crisis-support.md) | Crisis Resource Presence and Query Detection | Implemented |
| [052](experience/FTR-052-cognitive-accessibility.md) | Cognitive Accessibility — Reducing Complexity for All Seekers | Approved |
| [053](experience/FTR-053-screen-reader-quality.md) | Screen Reader Emotional Quality — Warmth in Spoken Interface | Implemented |
| [054](experience/FTR-054-micro-copy-as-ministry.md) | Micro-Copy as Ministry — Editorial Voice for UI Text | Approved |
| [055](experience/FTR-055-practice-bridge.md) | Practice Bridge & Public Kriya Yoga Overview — Signpost Enrichment | Approved |
| [056](experience/FTR-056-additional-ui-pages.md) | Additional UI Pages | Implemented |
| [057](experience/FTR-057-youtube-video.md) | YouTube Video Integration | Approved |
| [058](experience/FTR-058-multi-language.md) | Multi-Language Architecture | Implemented |
| [059](experience/FTR-059-machine-readable-content.md) | Machine-Readable Content and AI Citation Strategy | Implemented |
| [131](experience/FTR-131-sanskrit-devanagari.md) | Sanskrit Display, Search Normalization, and Devanagari Typography | Implemented |
| [132](experience/FTR-132-url-strategy.md) | Human-Readable URL Strategy — Slugs Over UUIDs | Implemented |
| [133](experience/FTR-133-pdf-generation.md) | PDF Generation Strategy — Resource-Anchored Exports | Approved |
| [134](experience/FTR-134-low-tech-channels.md) | Low-Tech and Messaging Channel Strategy | Approved |
| [135](experience/FTR-135-ai-assisted-translation.md) | AI-Assisted Translation Workflow | Approved (Provisional) |
| [136](experience/FTR-136-spoken-teachings.md) | Spoken Teachings — Human Narration Program | Proposed |
| [137](experience/FTR-137-audio-visual-ambiance.md) | Audio-Visual Ambiance Toggle | Proposed |
| [138](experience/FTR-138-four-doors.md) | Four Doors — Recognition-Based Emotional Entry | Proposed |
| [139](experience/FTR-139-multi-lens-homepage.md) | Multi-Lens Homepage — Recognition-First Portal Surface | Proposed |
| [140](experience/FTR-140-wanderers-path.md) | The Wanderer's Path — Depth-Weighted Passage Discovery | Proposed |
| [141](experience/FTR-141-yoganandas-voice.md) | Yogananda's Voice — Primary Source Audio Presence | Proposed |
| [142](experience/FTR-142-cross-media-intelligence.md) | Cross-Media Intelligence — Video, Audio, Chant, Content Hub | Deferred |
| [143](experience/FTR-143-study-community-tools.md) | Study & Community Tools — Workspace, Collections, VLD | Deferred |
| [144](experience/FTR-144-cross-site-harmony.md) | Cross-Site Harmony — yogananda.org Ecosystem Integration | Proposed |
| [145](experience/FTR-145-design-language-system.md) | Visual Design Language System — AI-First Design Tokens | Proposed |
| [146](experience/FTR-146-circadian-modifier.md) | Circadian as Independent Behavior Modifier | Proposed |
| [147](experience/FTR-147-offline-first-reading.md) | Offline-First Sacred Reading — Proactive Chapter Download | Proposed |
| [160](experience/FTR-160-adaptive-image-delivery.md) | Adaptive Image Delivery — Network and Device-Aware Image Optimization | Proposed |
| [161](experience/FTR-161-practice-signals.md) | Practice Signals — Anonymous Practice Engagement Without Surveillance | Proposed |
| [162](experience/FTR-162-transition-navigation.md) | Transition-Based Navigation — Emotional State-Pair Journeys | Proposed |
| [163](experience/FTR-163-sanctuary-mode.md) | Sanctuary Mode — Crisis-State Environmental Adaptation | Proposed |
| [166](experience/FTR-166-personal-reading-map.md) | Personal Reading Map — Returning-Reader Experience | Proposed |
| [176](experience/FTR-176-staff-empowerment.md) | Staff Empowerment and Onboarding — AI Agent Platform Adoption | Proposed |

---

## Editorial (23 FTRs)

Staff tools, content intelligence, curation, content types.

| FTR | Title | State |
|-----|-------|-------|
| [060](editorial/FTR-060-staff-experience.md) | Staff Experience Architecture — Five-Layer Editorial System | Approved (Provisional) |
| [061](editorial/FTR-061-delta-feedback.md) | DELTA-Compliant Seeker Feedback Mechanism | Approved (Provisional) |
| [062](editorial/FTR-062-glossary.md) | Living Glossary — Spiritual Terminology as User-Facing Feature | Approved |
| [063](editorial/FTR-063-reading-threads.md) | Editorial Reading Threads — "Teachings in Conversation" | Approved (Provisional) |
| [064](editorial/FTR-064-reverse-bibliography.md) | Reverse Bibliography — "What Yogananda Read" | Approved (Provisional) |
| [065](editorial/FTR-065-calendar-aware-content.md) | Calendar-Aware Content Surfacing | Approved (Provisional) |
| [066](editorial/FTR-066-quiet-index.md) | The Quiet Index — Browsable Contemplative Taxonomy | Approved (Provisional) |
| [067](editorial/FTR-067-review-queue.md) | Unified Review Queue Abstraction | Approved (Provisional) |
| [068](editorial/FTR-068-content-lifecycle.md) | Content Lifecycle Management | Approved (Provisional) |
| [069](editorial/FTR-069-ai-editorial-workflows.md) | AI-Assisted Editorial Workflows | Approved (Provisional) |
| [070](editorial/FTR-070-feature-catalog-rag.md) | Feature Catalog (RAG Architecture Proposal) | Approved (Provisional) |
| [071](editorial/FTR-071-epistemic-data-boundary.md) | Epistemic Data Boundary — Three-Phase Pipeline | Approved |
| [072](editorial/FTR-072-ai-editorial-maturity.md) | AI Editorial Workflow Maturity — Trust Graduation and Feedback Loops | Approved (Provisional) |
| [073](editorial/FTR-073-sacred-imagery.md) | Sacred Imagery Strategy | Approved |
| [074](editorial/FTR-074-spiritual-figures-lineage.md) | Spiritual Figures and Lineage | Approved |
| [075](editorial/FTR-075-magazine-integration.md) | Magazine Integration — Self-Realization Magazine as First-Class Content | Approved |
| 076 | ~~AI-Assisted Translation Workflow~~ → Absorbed into [FTR-135](experience/FTR-135-ai-assisted-translation.md) | Absorbed |
| [077](editorial/FTR-077-the-librarian-brand.md) | "The Librarian" — AI Search Brand Identity | Approved |
| [078](editorial/FTR-078-srf-lessons-integration.md) | SRF Lessons Integration | Deferred |
| [079](editorial/FTR-079-editorial-page-compositor.md) | Editorial Page Compositor — Data-Driven Layout Curation | Proposed |
| [148](editorial/FTR-148-proactive-editorial-ai.md) | Proactive Editorial AI Agent | Proposed |
| [149](editorial/FTR-149-retool-vs-portal-admin.md) | Retool vs. Portal Admin for Staff Dashboards | Proposed |
| [150](editorial/FTR-150-sacred-image-management.md) | Sacred Image Management — Watermarking and Multi-Size Serving | Deferred |

---

## Operations (31 FTRs)

CI/CD, observability, testing, governance, operational tooling.

| FTR | Title | State |
|-----|-------|-------|
| [080](operations/FTR-080-engineering-standards.md) | Engineering Standards | Implemented |
| [081](operations/FTR-081-testing-strategy.md) | Testing Strategy | Implemented |
| [082](operations/FTR-082-observability.md) | Observability | Approved |
| [083](operations/FTR-083-mcp-strategy.md) | MCP Strategy | Approved |
| [084](operations/FTR-084-documentation-architecture.md) | Documentation Architecture | Implemented |
| [085](operations/FTR-085-delta-privacy.md) | DELTA Privacy | Implemented |
| [086](operations/FTR-086-outbound-webhooks.md) | Outbound Webhooks | Implemented |
| [087](operations/FTR-087-api-route-rationalization.md) | API Route Rationalization | Implemented |
| [088](operations/FTR-088-api-response-conventions.md) | API Response Conventions | Implemented |
| [089](operations/FTR-089-search-result-presentation.md) | Search Result Presentation | Implemented |
| [090](operations/FTR-090-content-versioning.md) | Content Versioning | Approved |
| [091](operations/FTR-091-prove-before-foundation.md) | Prove Before Foundation | Implemented |
| [092](operations/FTR-092-portal-updates.md) | Portal Updates | Approved |
| [093](operations/FTR-093-ai-native-operations.md) | AI-Native Operations | Implemented |
| [094](operations/FTR-094-neon-platform-governance.md) | Neon Platform Governance | Implemented |
| [095](operations/FTR-095-infrastructure-and-deployment.md) | Infrastructure and Deployment | Implemented |
| [096](operations/FTR-096-operational-surface.md) | Operational Surface | Implemented |
| [097](operations/FTR-097-rate-limiting.md) | Rate Limiting | Implemented |
| [098](operations/FTR-098-srf-corpus-mcp.md) | SRF Corpus MCP | Deferred |
| [099](operations/FTR-099-agent-archetypes.md) | Agent Archetypes | Proposed |
| [151](operations/FTR-151-aws-ses.md) | AWS SES | Proposed |
| [152](operations/FTR-152-human-review-gate.md) | Human Review Gate | Proposed |
| [153](operations/FTR-153-design-tooling.md) | Design Tooling | Deferred |
| [154](operations/FTR-154-brand-distribution.md) | Brand Distribution | Deferred |
| [155](operations/FTR-155-magazine-api.md) | Magazine API | Deferred |
| [156](operations/FTR-156-dream-a-feature.md) | Dream a Feature | Proposed |
| [157](operations/FTR-157-living-golden-set.md) | Living Golden Set | Proposed |
| [158](operations/FTR-158-docs-as-executable-specs.md) | Spec Fidelity System | Proposed |
| [159](operations/FTR-159-feature-lifecycle-portal.md) | Feature Lifecycle Portal | Proposed |
| [164](operations/FTR-164-book-ingestion-operations.md) | Book Ingestion Operations | Approved |
| [167](operations/FTR-167-device-tier-performance.md) | Device-Tier Performance Framework | Approved (Provisional) |
| [169](operations/FTR-169-experiment-lifecycle.md) | Experiment Lifecycle and Platform Integration | Proposed |
| [170](operations/FTR-170-agent-workflow-orchestration.md) | Agent Workflow Orchestration Engine | Proposed |
| [172](operations/FTR-172-ai-validation-gates.md) | AI Validation Gates — Agents as CI Pipeline Stages | Proposed |
| [173](operations/FTR-173-comparative-analysis-engine.md) | Comparative Analysis Engine — Model, Workflow, and Prompt A/B Testing | Proposed |
| [174](operations/FTR-174-glass-box-operations.md) | Glass Box Operations and Cost Tracking | Proposed |
| [175](operations/FTR-175-deep-research-integration.md) | Deep Research Integration — Dual-Platform Research as Development Phase | Proposed |
| [178](operations/FTR-178-operations-topology-surface.md) | Operations Topology Surface — Interactive Architecture Intelligence | Declined (absorbed into FTR-174) |

---

## Always-Load FTRs

> This table reflects the `always-load: true` field in each FTR's YAML frontmatter.

These FTRs carry content that was previously in DESIGN.md's always-loaded sections. Load them for any task:

| FTR | Title | Reason |
|-----|-------|--------|
| [004](foundation/FTR-004-architecture-longevity.md) | Architecture Longevity | Tech stack tiering, replacement strategy |
| [007](foundation/FTR-007-curation-as-interpretation.md) | Curation as Interpretation | Cross-cutting editorial proximity standard |
| [013](foundation/FTR-013-design-philosophy.md) | Design Philosophy | Visual identity, typography, color palette |
| [014](foundation/FTR-014-architecture-overview.md) | Architecture Overview | System topology, data flow |
| [015](foundation/FTR-015-api-first-architecture.md) | API-First Architecture | API conventions, endpoint catalog |
| [016](foundation/FTR-016-security-considerations.md) | Security Considerations | Auth, CORS, CSP, input validation |
| [017](foundation/FTR-017-seeker-persona-index.md) | Seeker Persona Index | User archetypes |
| [018](foundation/FTR-018-unified-content-pipeline.md) | Unified Content Pipeline | Ingestion → enrich → index pattern |
| [019](foundation/FTR-019-error-handling-resilience.md) | Error Handling | Degradation hierarchy |
| [081](operations/FTR-081-testing-strategy.md) | Testing Strategy | Test pyramid, CI pipeline |
| [082](operations/FTR-082-observability.md) | Observability | Monitoring stack, SLIs/SLOs |

---

## Subsection Identifiers

These DES identifiers are subsections within their parent FTR file (no standalone FTR number):

| Old ID | Title | Parent FTR |
|--------|-------|-----------|
| DES-007 | Opening Moment — Portal Threshold | FTR-040 |
| DES-008 | Reader Typography Refinements | FTR-040 |
| DES-009 | "Dwell" Interaction — Passage Contemplation Mode | FTR-040 |
| DES-010 | Layered Passage Depth — "Go Deeper Within the Text" | FTR-040 |
| DES-011 | Time-Aware Reading — Circadian Color Temperature | FTR-040 |
| DES-012 | "Breath Between Chapters" — Chapter Transition Pacing | FTR-040 |
| DES-013 | Keyboard-First Reading Navigation | FTR-040 |
| DES-014 | Session Closure Moments — Departure Grace | FTR-040 |
| DES-015 | Self-Revealing Navigation | FTR-040 |
| DES-016 | Lotus as Unified Visual Motif | FTR-040 |
| DES-045 | `/journeys` — Calendar Reading Journeys | FTR-056 |
| DES-047 | `/browse` — The Complete Index | FTR-056 |
| DES-048 | `/guide` — The Spiritual Guide | FTR-056 |

---

## Migration Reference

For the complete old-to-new identifier mapping, merge groups, and ambiguity flags, see [MIGRATION.md](MIGRATION.md).
