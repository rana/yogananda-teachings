# SRF Online Teachings Portal — Architecture Decision Records

Each record captures architectural reasoning with full context — not just the direction chosen but *why*, and what alternatives were considered. In a pre-code project, "Accepted" means accepted as architectural direction. Implementation validates or revises. Foundational ADRs (Principles group) are immutable without full deliberation. Provisional ADRs (distant-arc groups) represent thorough thinking about future direction, not binding commitments. See ADR-098 for the maturity classification.

**ADR maturity:** Foundational (project identity, change requires deliberation) · Active (governing current/imminent implementation) · Provisional (thorough direction for future arcs, may be revised or suspended) · Suspended (moved to PROPOSALS.md, reasoning preserved here) · Implemented (validated through code).

**Arc navigation:** ADRs in the Foundational Constraints, Infrastructure & Platform, Application Architecture, Content & Data Model, and Search & AI groups govern Arcs 1–3 and require close attention during implementation. Operations, Engineering & Governance is mixed: engineering standards, testing, observability, and project governance apply from Arc 1; staff operations, brand, and distribution are Arc 3+. ADRs in other groups (Cross-Media, Seeker Experience, Internationalization, Staff & Community, Brand & Communications) are Provisional — they represent thorough architectural thinking but their implementation is distant. Treat them as direction, not immediate specification.

*ADR numbers are stable identifiers, not sequence counters — do not renumber to fill gaps. Gaps at 028, 045, 051, 102–103 exist from restructuring. New ADRs append after 130. A gap may be reused for a new ADR if thematically adjacent to its group (e.g., ADR-015 was reclaimed for a Foundational ADR).*

*◆ marks architectural hub ADRs — those with 8+ inbound cross-references from other ADRs. Hub ADRs are load-bearing decisions that anchor multiple dependent choices. Start here when orienting to a new domain.*

### Index by Concern

**Foundational Constraints**

Establishes the project's theological and ethical identity. The portal displays only Yogananda's verbatim words — Claude acts as librarian, never oracle — with personalization boundaries governed by the DELTA privacy framework. Verbatim media fidelity extends this commitment to all modalities: AI generation of voice, image, or video representing the gurus or reading sacred text is prohibited. Accessibility is a Milestone 2a requirement (not a retrofit), the architecture targets a 10-year horizon, global equity ensures underserved seekers are never second-class users, an experience quality standard demands that execution match the spiritual depth of the content, scope is prioritized by reachable population so the most people are served soonest, and the AI-native development model (PRI-12, ADR-131) shapes the entire operational architecture.

- ADR-001: Direct Quotes Only — No AI Synthesis
- ADR-002: Personalization with Restraint — DELTA-Aligned Feature Boundaries
- ADR-003: Accessibility Foundation
- ADR-004: Architecture Longevity — 10-Year Design Horizon
- ADR-005: Claude AI Usage Policy — Permitted Roles, Prohibited Uses, and Expansion Roadmap ◆
- ADR-006: Global-First — Serving Earth's Underserved Seekers
- ADR-007: Curation as Interpretation — The Fidelity Boundary and Editorial Proximity Standard
- ADR-015: Verbatim Media Fidelity — Cross-Modal Content Integrity ◆
- ADR-121: DELTA-Relaxed Authenticated Experience
- ADR-127: Experience Quality Standard — Honoring the Spirit of the Teachings
- ADR-128: Reachable Population — Quantitative Prioritization Framework

**Infrastructure & Platform**

The technology stack and infrastructure topology. Next.js on Vercel (frontend), Neon PostgreSQL with pgvector and pg_search (single-database, no DynamoDB), Contentful as editorial source of truth, AWS Bedrock Claude with model tiering. Infrastructure managed by yogananda-platform MCP server (ADR-016 revised 2026-03-01); one-time AWS security via `bootstrap.sh`. GitHub Actions CI/CD with OIDC federation. Secrets management uses AWS Secrets Manager (ADR-125) with Vercel OIDC federation eliminating long-lived credentials (ADR-126). Also covers PWA strategy, database backup, multi-environment design, redundancy/failover, and Postgres-native graph intelligence.

- ADR-008: Next.js + Vercel for Frontend
- ADR-009: Neon + pgvector for Vector Search
- ADR-010: Contentful as Editorial Source of Truth
- ADR-012: Progressive Web App as Mobile Intermediate Step
- ADR-013: Single-Database Architecture — No DynamoDB
- ADR-014: AWS Bedrock Claude with Model Tiering ◆
- ADR-016: Infrastructure as Code — Platform-Managed Infrastructure (revised 2026-03-01)
- ADR-017: Platform-Managed Lambda (revised 2026-03-01)
- ADR-018: CI-Agnostic Deployment Scripts
- ADR-019: Database Backup and Recovery Strategy
- ADR-020: Multi-Environment Infrastructure Design
- ADR-021: Redundancy, Failover, and Regional Distribution Strategy
- ADR-117: Postgres-Native Graph Intelligence Layer
- ADR-125: Secrets Management Strategy — Two-Tier Model with AWS Secrets Manager
- ADR-126: Vercel OIDC Federation — Zero Long-Lived AWS Credentials

**Application Architecture**

Cross-cutting application design patterns. API-first architecture for platform parity, content-addressable passage deep links, rate limiting and abuse prevention, PDF generation, low-tech channel support, language URL design, native sharing, and three-tier suggestion caching (static JSON → pg_trgm → Vercel KV).

- ADR-011: API-First Architecture for Platform Parity
- ADR-022: Content-Addressable Passage Deep Links
- ADR-023: Search API Rate Limiting and Abuse Prevention
- ADR-024: Native Share API as Primary Mobile Sharing
- ADR-025: PDF Generation Strategy — Resource-Anchored Exports
- ADR-026: Low-Tech and Messaging Channel Strategy
- ADR-027: Language API Design — Locale Prefix on Pages, Query Parameter on API
- ADR-120: Three-Tier Suggestion Cache Architecture

**Content & Data Model**

Specifies what content the portal holds and how it is structured in the database. Autobiography of a Yogi is the Arc 1 focus book; ingestion priority follows life-impact over scholarly significance; the data model is edition-aware with teaching topics taxonomy, exploration themes, a living glossary, a spiritual figures section (including monastic lineage), and a canonical entity registry with Sanskrit normalization. Content integrity verification, sacred image guidelines, and a structured spiritual ontology ensure fidelity and machine-readability.

- ADR-029: Autobiography of a Yogi as Focus Book
- ADR-030: Book Ingestion Priority — Life-Impact Over Scholarly Significance
- ADR-031: Teaching Topics — Curated Thematic Entry Points
- ADR-032: Teaching Topics Multi-Category Taxonomy and Semi-Automated Tagging Pipeline
- ADR-033: Exploration Theme Categories — Persons, Principles, Scriptures, Practices, Yoga Paths
- ADR-034: Edition-Aware Content Model
- ADR-035: Image Content Type — Photographs as First-Class Content
- ADR-036: Spiritual Figures as First-Class Entities
- ADR-037: Monastic & Presidential Lineage
- ADR-038: Living Glossary — Spiritual Terminology as User-Facing Feature
- ADR-039: Content Integrity Verification
- ADR-040: Magazine Integration — Self-Realization Magazine as First-Class Content
- ADR-041: Arc 1 Bootstrap
- ADR-042: Sacred Image Usage Guidelines
- ADR-043: Structured Spiritual Ontology — Machine-Readable Teaching Structure
- ADR-116: Canonical Entity Registry and Sanskrit Normalization

**Search & AI**

Governs how seekers find passages and how AI assists retrieval. Pure hybrid search (vector + BM25, fused via Reciprocal Rank Fusion) is the **primary search mode** with no AI services in the search hot path — achieving search p95 < 500ms globally. Index-time enrichment bridges vocabulary gaps so seekers find passages without query-time AI. Voyage voyage-3-large embeddings, pg_search/ParadeDB for full-text. AI-enhanced search (HyDE, cross-encoder reranking) is available as an optional upgrade, activated only if evaluation warrants. Suggestions are corpus-derived (never behavior-derived), related teachings use pre-computed chunk relations and graph traversal, and a unified enrichment pipeline runs a single index-time pass per chunk. The **Vocabulary Bridge** (ADR-129) is a five-layer semantic infrastructure mapping human states of being to Yogananda's corpus — subsumes the flat terminology bridge with register awareness, retrieval intent routing, and language-specific cultural grounding. The bridge is Opus-generated and loaded in application memory for microsecond query-time lookups.

- ADR-044: Hybrid Search (Vector + Full-Text)
- ADR-046: Embedding Model Versioning and Migration (updated by ADR-118)
- ADR-047: Multilingual Embedding Quality Strategy (updated by ADR-118)
- ADR-048: Chunking Strategy Specification
- ADR-049: Search Suggestions — Corpus-Derived, Not Behavior-Derived ◆
- ADR-050: Related Teachings — Pre-Computed Chunk Relations and Graph Traversal
- ADR-052: Passage Resonance Signals — Content Intelligence Without Surveillance
- ADR-053: "What Is Humanity Seeking?" — Anonymized Search Intelligence
- ADR-114: pg_search / ParadeDB BM25 for Full-Text Search
- ADR-115: Unified Enrichment Pipeline — Single Index-Time Pass per Chunk
- ADR-118: Voyage voyage-3-large as Primary Embedding Model
- ADR-119: Advanced Search Pipeline — Pure Hybrid Primary, AI-Enhanced Optional
- ADR-129: Vocabulary Bridge — Semantic Infrastructure for State-Aware Retrieval
- ADR-130: Recognition-First Information Architecture

**Cross-Media**

Decides how video, audio, image, and cross-media content integrate into the portal. YouTube videos use hybrid RSS + API ingestion (ADR-054). The knowledge graph evolves to treat all content types as nodes (ADR-062), with visualization (ADR-061). Six cross-media intelligence ADRs (transcript sync, platform-agnostic video, audio search, AI audio, chant reader, unified content hub) and two sacred image ADRs (watermarking, multi-size serving) are suspended to PRO-029 and PRO-030 respectively — thorough thinking preserved for future activation.

- ADR-054: YouTube Integration via Hybrid RSS + API with ISR
- ADR-055: Video Transcript Time-Synced Architecture *(Suspended → PRO-029)*
- ADR-056: Platform-Agnostic Video Model and Documentary Integration *(Suspended → PRO-029)*
- ADR-057: Audio and Cross-Media Audio Search *(Suspended → PRO-029)*
- ADR-058: AI Audio Generation for Portal Audio Assets *(Suspended → PRO-029)*
- ADR-059: Chant Reader — Devotional Poetry with Deterministic Cross-Media Linking *(Suspended → PRO-029)*
- ADR-060: Unified Content Hub — Cross-Media Relations, Search, and Theming *(Suspended → PRO-029)*
- ADR-061: Knowledge Graph Visualization
- ADR-062: Knowledge Graph Cross-Media Evolution — All Content Types as Graph Nodes ◆
- ADR-063: Digital Watermarking Strategy for SRF Images *(Suspended → PRO-030)*
- ADR-064: Multi-Size Image Serving and Download Options *(Suspended → PRO-030)*

**Seeker Experience**

Shapes how the portal feels and behaves for readers. The design system derives from SRF's visual identity with Calm Technology principles — quiet, unhurried, spiritually resonant. Features include lotus bookmarks (no account required), non-search discovery journeys, passage sharing as organic growth, events and sacred places as signposts, crisis resources as a gentle safety net, cognitive accessibility for all seekers, screen reader emotional quality, and micro-copy treated as ministry. Practice Bridge provides signpost enrichment linking teachings to spiritual practice.

- ADR-065: SRF-Derived Design System with Calm Technology Principles
- ADR-066: Lotus Bookmark — Account-Free Reading Bookmarks
- ADR-067: Non-Search Seeker Journeys — Equal Excellence for Every Path
- ADR-068: Passage Sharing as Organic Growth Mechanism
- ADR-069: Events and Sacred Places — Signpost, Not Destination
- ADR-070: Sacred Places — No Embedded Map, Street View Links Instead
- ADR-071: Crisis Resource Presence — Gentle Safety Net on Grief and Death Content
- ADR-072: Cognitive Accessibility — Reducing Complexity for All Seekers
- ADR-073: Screen Reader Emotional Quality — Warmth in Spoken Interface
- ADR-074: Micro-Copy as Ministry — Editorial Voice for UI Text
- ADR-104: Practice Bridge & Public Kriya Yoga Overview — Signpost Enrichment
- ADR-122: Crisis Query Detection — Safety Interstitial for Acute-Distress Searches

**Internationalization**

Architects the portal for worldwide multilingual access from the foundation up. Three-layer localization separates UI strings, content translations, and locale-specific formatting; CSS uses logical properties from Milestone 2a for RTL readiness. The core language set defines 10 languages ordered by reachable population (ADR-128); Spanish is Tier 1 (Arc 1), Hindi is Tier 1 deferred (Milestone 5b). AI-assisted translation is permitted for UI and editorial text but never for Yogananda's words — only official SRF/YSS translations. Sanskrit display is normalized for search; content is machine-readable for AI citation with full crawler support. Content gating (DRM, FlipBook) is architecturally prohibited; `ai.txt` provides machine-parseable AI permissions; copyright asserted through metadata and legal layers, not technology walls. YSS branding and locale strategy (ADR-079) is suspended to PRO-033.

- ADR-075: Multi-Language Architecture — Three-Layer Localization
- ADR-076: CSS Logical Properties
- ADR-077: Core Language Set and Priority Ordering
- ADR-078: AI-Assisted Translation Workflow
- ADR-079: YSS Organizational Branding and Locale Strategy *(Suspended → PRO-033)*
- ADR-080: Sanskrit Display, Search Normalization, and Devanāgarī Typography
- ADR-081: Machine-Readable Content and AI Citation Strategy ◆

**Staff & Community**

Defines editorial tools and community participation features. Staff get a five-layer editorial system (ADR-082); feedback is DELTA-compliant with no user profiling (ADR-084). Study workspace (ADR-083), lessons integration (ADR-085), community collections (ADR-086), and VLD editorial delegation (ADR-087) are suspended to PRO-031 and PRO-002 — preserved for future activation.

- ADR-082: Staff Experience Architecture — Five-Layer Editorial System
- ADR-083: Study Workspace — Universal Teaching Tools Without Authentication *(Suspended → PRO-031)*
- ADR-084: DELTA-Compliant Seeker Feedback Mechanism
- ADR-085: Lessons Integration Readiness *(Suspended → PRO-002)*
- ADR-086: Community Collections — Tiered Visibility Public Curation *(Suspended → PRO-031)*
- ADR-087: VLD Editorial Delegation — Volunteer Curation Pipeline *(Suspended → PRO-031)*

**Brand & Communications**

Governs the portal's public identity and outreach channels. SRF imagery follows specific usage guidelines (ADR-088); the AI search feature is branded as "The Librarian" to reinforce the non-oracle role (ADR-089); a seeker-facing changelog communicates portal updates (ADR-105). Three distribution ADRs ("What Is Humanity Seeking?" communications, daily email, social media) are suspended to PRO-032 — preserved for future activation.

- ADR-088: SRF Imagery Strategy in the Portal
- ADR-089: "The Librarian" — AI Search Brand Identity
- ADR-090: "What Is Humanity Seeking?" as Strategic Communications Asset *(Suspended → PRO-032)*
- ADR-091: Daily Email — Verbatim Passage Delivery *(Suspended → PRO-032)*
- ADR-092: Social Media Strategy — Portal-Generated Assets, Human Distribution *(Suspended → PRO-032)*
- ADR-105: Portal Updates — Seeker-Facing Changelog

**Operations, Engineering & Governance**

How the portal is built, tested, monitored, and governed. Engineering standards, testing strategy (unit through e2e with Neon branch-per-PR isolation), observability (Sentry + structured logging + Amplitude DELTA analytics). Documentation architecture with domain-based design files and gated loading, ADR maturity classification, global privacy compliance (DELTA as primary framework), Arc 1 prove-then-build split. API response conventions, search result presentation, content versioning, and the principle-vs-parameter classification (ADR-123). Neon platform governance (ADR-124) covers PG18, tier selection, compute, branching, extensions, UUIDv7, and database observability. Secrets management (ADR-125) and Vercel OIDC (ADR-126) are in the Infrastructure group (DECISIONS-core.md). AI-native operations architecture (ADR-131) governs MCP requirements, machine-readable surfaces, and documentation-as-infrastructure — the governing ADR for PRI-12. MCP development tooling, AI editorial workflow maturity, outbound webhooks, timestamp filtering, cross-API route rationalization. Three suspended: Figma (PRO-027), MCP corpus (PRO-001), magazine API (PRO-034).

- ADR-093: Engineering Standards for SRF Projects
- ADR-094: Testing Strategy
- ADR-095: Observability Strategy
- ADR-096: Design Tooling — Figma *(Suspended → PRO-027)*
- ADR-097: MCP Server Strategy — Development Tooling for AI Implementation
- ADR-098: Documentation Architecture — Domain-Based Design Files with Gated Loading
- ADR-099: Global Privacy Compliance — DELTA as Primary Framework
- ADR-100: AI Editorial Workflow Maturity — Trust Graduation and Feedback Loops
- ADR-101: MCP as Three-Tier Corpus Access Layer — Development, Internal, and External *(Suspended → PRO-001)*
- ADR-106: Outbound Webhook Events — Push-Based Content Syndication ◆
- ADR-107: Timestamp Filtering on List Endpoints — Incremental Sync for Automation Consumers
- ADR-108: Magazine API Rationalization — Flat Resources, Single-Segment Slugs *(Suspended → PRO-034)*
- ADR-109: Cross-API Route Rationalization — Consistent Identifiers, Consolidated Namespaces, Complete CRUD
- ADR-110: API Response Conventions — Envelope, Naming, and Identifier Standards
- ADR-111: Search Result Presentation — Ranking, Display, and Intentional Non-Pagination
- ADR-112: Content Versioning Strategy — Editions, Translations, and Archive Policy
- ADR-113: Prove Before Foundation (Arc 1 Milestone Split)
- ADR-123: Principle vs. Parameter — Decision Classification and Governance Flexibility ◆
- ADR-124: Neon Platform Governance — PostgreSQL Version, Tier, Compute, Branching, Extensions, and Observability ◆
- ADR-131: AI-Native Operations Architecture — MCP Requirements, Machine-Readable Surfaces, and Documentation-as-Infrastructure
- ADR-132: Human-Readable URL Strategy — Slugs Over UUIDs

---

## ADR Body Files

ADR bodies are split across three files by concern group:

| File | Groups | ADRs | Arc Relevance |
|------|--------|------|---------------|
| [DECISIONS-core.md](DECISIONS-core.md) | Foundational, Infrastructure, Application Architecture, Content, Search | ADR-001–027, 029–044, 046–050, 052–053, 114–121, 125–130, 132 | Arc 1+ (implementation-critical) |
| [DECISIONS-experience.md](DECISIONS-experience.md) | Cross-Media, Seeker Experience, Internationalization | ADR-054–081, 104, 122 | Arc 2+ (experience design) |
| [DECISIONS-operations.md](DECISIONS-operations.md) | Staff, Brand, Operations & Governance | ADR-082–101, 105–113, 123–124, 131 | Arc 1+ (governance, engineering standards); Arc 3+ (staff, brand, operations) |

