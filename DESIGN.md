# SRF Online Teachings Portal — Technical Design

> **Navigation guide.** Design specifications are organized by domain into individual files under `design/`. This root file contains the navigation index and cross-cutting sections that apply to all domains. The **File** column shows where each section lives. Use the domain directories as loading groups: `design/search/` for search and data platform, `design/experience/` for frontend and seeker-facing pages, `design/editorial/` for staff tools and content intelligence.
>
> **Parameter convention (ADR-123).** Specific numeric values in this document (cache TTLs, debounce timers, fusion parameters, chunk sizes, rate limits, color band boundaries, purge delays, revalidation intervals) are **tunable defaults**, not architectural commitments. They represent best pre-production guesses and should be implemented as named configuration constants in `/lib/config.ts`, not hardcoded literals. M1a-8 (search quality evaluation) and subsequent arc gates include parameter validation as deliverables. When a parameter is tuned based on evidence, annotate the section: `*Parameter tuned: [date], [old] → [new], [evidence].*` See ADR-123 for the full governance framework.

| Section | Arc/Milestone | File |
|---------|---------------|------|
| [DES-001: Design Philosophy](#des-001-design-philosophy) | — | DESIGN.md |
| [DES-002: Architecture Overview](#des-002-architecture-overview) | 1, 4+ | DESIGN.md |
| [DES-003: The AI Librarian: Search Architecture](design/search/DES-003-the-ai-librarian-search.md) | 1–2a | design/search/ |
| &emsp;[ADR-049: Search Suggestions — Corpus-Derived, Not Behavior-Derived](design/search/DES-003-the-ai-librarian-search.md#adr-049-search-suggestions--corpus-derived-not-behavior-derived) | 1, 3a, 5b | design/search/ |
| [DES-004: Data Model](design/search/DES-004-data-model.md) | 1+ | design/search/ |
| [DES-005: Content Ingestion Pipeline](design/search/DES-005-content-ingestion-pipeline.md) | 1, 4+ | design/search/ |
| [ADR-041: Arc 1 Bootstrap](design/search/ADR-041-arc-1-bootstrap.md) | 1 | design/search/ |
| [DES-006: Frontend Design](design/experience/DES-006-frontend-design.md) | 2a–5 | design/experience/ |
| &emsp;[DES-007: Opening Moment — Portal Threshold](design/experience/DES-006-frontend-design.md#des-007-opening-moment--portal-threshold) | 2a+ | design/experience/ |
| &emsp;[DES-008: Reader Typography Refinements](design/experience/DES-006-frontend-design.md#des-008-reader-typography-refinements) | 2b+ | design/experience/ |
| &emsp;[DES-009: "Dwell" Interaction — Passage Contemplation Mode](design/experience/DES-006-frontend-design.md#des-009-dwell-interaction--passage-contemplation-mode) | 2b+ | design/experience/ |
| &emsp;[DES-010: Layered Passage Depth — "Go Deeper Within the Text"](design/experience/DES-006-frontend-design.md#des-010-layered-passage-depth--go-deeper-within-the-text) | 2b+ | design/experience/ |
| &emsp;[DES-011: Time-Aware Reading — Circadian Color Temperature](design/experience/DES-006-frontend-design.md#des-011-time-aware-reading--circadian-color-temperature) | 2b+ | design/experience/ |
| &emsp;[DES-012: "Breath Between Chapters" — Chapter Transition Pacing](design/experience/DES-006-frontend-design.md#des-012-breath-between-chapters--chapter-transition-pacing) | 2b+ | design/experience/ |
| &emsp;[DES-013: Keyboard-First Reading Navigation](design/experience/DES-006-frontend-design.md#des-013-keyboard-first-reading-navigation) | 2b+ | design/experience/ |
| &emsp;[DES-014: Session Closure Moments — Departure Grace](design/experience/DES-006-frontend-design.md#des-014-session-closure-moments--departure-grace) | 2b+ | design/experience/ |
| &emsp;[DES-015: Self-Revealing Navigation](design/experience/DES-006-frontend-design.md#des-015-self-revealing-navigation) | 2a+ | design/experience/ |
| &emsp;[DES-016: Lotus as Unified Visual Motif](design/experience/DES-006-frontend-design.md#des-016-lotus-as-unified-visual-motif) | 2a+ | design/experience/ |
| [DES-017: Multi-Language Strategy](design/experience/DES-017-multi-language-strategy.md) | 2a (infra), 5b (content) | design/experience/ |
| [DES-019: API Design (Next.js API Routes)](#des-019-api-design-nextjs-api-routes) | 1+ | DESIGN.md |
| [DES-020: Platform Parity (Mobile Readiness)](design/experience/DES-020-platform-parity-mobile-readiness.md) | 2a+ | design/experience/ |
| [DES-021: YouTube Video Section Architecture](design/experience/DES-021-youtube-video-section-architecture.md) | 2a+ | design/experience/ |
| [DES-022: Events Section](design/experience/DES-022-events-section.md) | 2a+ | design/experience/ |
| [DES-023: Sacred Places — Contemplative Geography](design/experience/DES-023-sacred-places.md) | 3a+ | design/experience/ |
| [DES-024: Security Considerations](#des-024-security-considerations) | 1+ | DESIGN.md |
| [DES-025: Accessibility Requirements (Milestone 2a Foundation)](design/experience/DES-025-accessibility-requirements-milestone-2a.md) | 2a+ | design/experience/ |
| [DES-026: Editorial Reading Threads — "Teachings in Conversation"](design/editorial/DES-026-editorial-reading-threads.md) | 3c+ | design/editorial/ |
| [DES-027: Reverse Bibliography — "What Yogananda Read"](design/editorial/DES-027-reverse-bibliography.md) | 3c+ | design/editorial/ |
| [DES-028: Calendar-Aware Content Surfacing](design/editorial/DES-028-calendar-aware-content-surfacing.md) | 3b+ | design/editorial/ |
| [ADR-048: Chunking Strategy Specification](design/search/ADR-048-chunking-strategy-specification.md) | 1+ | design/search/ |
| &emsp;[Semantic Density Classification](design/search/ADR-048-chunking-strategy-specification.md#semantic-density-classification) | 3a+ | design/search/ |
| &emsp;[ADR-039 ext: Corpus Stylometric Fingerprint](design/search/ADR-048-chunking-strategy-specification.md#adr-039-ext-corpus-stylometric-fingerprint) | 3d+ | design/search/ |
| [DES-029: The Quiet Index — Browsable Contemplative Taxonomy](design/editorial/DES-029-the-quiet-index.md) | 3b+ | design/editorial/ |
| [ADR-084: DELTA-Compliant Seeker Feedback Mechanism](design/editorial/ADR-084-delta-compliant-seeker-feedback.md) | 3b+ | design/editorial/ |
| [DES-031: MCP Server Strategy](design/search/DES-031-mcp-server-strategy.md) | 1+ | design/search/ |
| [ADR-082: Staff Experience Architecture — Five-Layer Editorial System](design/editorial/ADR-082-staff-experience-architecture.md) | 3b+ | design/editorial/ |
| [DES-033: Unified Review Queue Abstraction](design/editorial/DES-033-unified-review-queue-abstraction.md) | 3b+ | design/editorial/ |
| [DES-034: Content Lifecycle Management](design/editorial/DES-034-content-lifecycle-management.md) | 3b+ | design/editorial/ |
| [DES-035: AI-Assisted Editorial Workflows](design/editorial/DES-035-ai-assisted-editorial-workflows.md) | 3b+ | design/editorial/ |
| [DES-036: Migration, Evolution, and Longevity](#des-036-migration-evolution-and-longevity) | 1+ | DESIGN.md |
| [ADR-007: Curation as Interpretation — The Fidelity Boundary and Editorial Proximity Standard](#adr-007-curation-as-interpretation--the-fidelity-boundary-and-editorial-proximity-standard) | — | DESIGN.md |
| [DES-037: Observability](#des-037-observability) | 1+ | DESIGN.md |
| [DES-038: Testing Strategy](#des-038-testing-strategy) | 1+ | DESIGN.md |
| [DES-039: Infrastructure and Deployment](design/search/DES-039-infrastructure-and-deployment.md) | 1 | design/search/ |
| [DES-042: Glossary Architecture](design/editorial/DES-042-glossary-architecture.md) | 3b+ | design/editorial/ |
| [DES-044: Additional New UI Pages](design/experience/DES-044-additional-new-ui-pages.md) | 2a+ | design/experience/ |
| &emsp;[`/library` — Personal Library](design/experience/DES-044-additional-new-ui-pages.md#library-personal-library) | **Implemented** | design/experience/ |
| &emsp;[DES-045: `/journeys` — Calendar Reading Journeys](design/experience/DES-044-additional-new-ui-pages.md#des-045-journeys-calendar-reading-journeys) | 3b+ | design/experience/ |
| &emsp;[DES-047: `/browse` — The Complete Index](design/experience/DES-044-additional-new-ui-pages.md#des-047-browse-the-complete-index) | 2a+ | design/experience/ |
| &emsp;[DES-048: `/guide` — The Spiritual Guide](design/experience/DES-044-additional-new-ui-pages.md#des-048-guide-the-spiritual-guide) | 3b+ | design/experience/ |
| [DES-049: Responsive Design Strategy](design/experience/DES-049-responsive-design-strategy.md) | 2a+ | design/experience/ |
| [DES-050: Seeker & User Persona Index](#des-050-seeker--user-persona-index) | — | DESIGN.md |
| [DES-051: Portal Updates Page — "The Library Notice Board"](design/editorial/DES-051-portal-updates-page.md) | 3b+ | design/editorial/ |
| [DES-052: Outbound Webhook Event System](design/editorial/DES-052-outbound-webhook-event-system.md) | 3b+ | design/editorial/ |
| [DES-053: Unified Content Pipeline Pattern](#des-053-unified-content-pipeline-pattern) | 1+ | DESIGN.md |
| [DES-054: Knowledge Graph Ontology](design/search/DES-054-knowledge-graph-ontology.md) | 1 (design), 3b+ (batch) | design/search/ |
| [DES-055: Concept/Word Graph](design/editorial/DES-055-conceptword-graph.md) | 3b+ | design/editorial/ |
| [DES-056: Feature Catalog (RAG Architecture Proposal)](design/editorial/DES-056-feature-catalog-rag-architecture.md) | 2b–6+ | design/editorial/ |
| [DES-057: Error Handling and Resilience](#des-057-error-handling-and-resilience) | 1+ | DESIGN.md |
| [DES-058: Search Quality Evaluation Harness](design/search/DES-058-search-quality-evaluation-harness.md) | 1 | design/search/ |
| [DES-059: Vocabulary Bridge](design/search/DES-059-vocabulary-bridge.md) | 1+ | design/search/ |
| [DES-060: Operational Surface — Health, Deployment, and Traceability](design/search/DES-060-operational-surface.md) | 1a, 1c, 2a | design/search/ |
| [DES-061: Epistemic Data Boundary — Three-Phase Pipeline](design/editorial/DES-061-epistemic-data-boundary.md) | 1+ | design/editorial/ |
| [DES-062: Cognitive Task Classification (COG-NN)](design/search/DES-062-cognitive-task-classification.md) | 2b+ | design/search/ |
| [DES-063: Book Reader — The Reading Surface](design/experience/DES-063-book-reader.md) | 2+ | design/experience/ |

*DES numbers are stable identifiers, not sequence counters — gaps at 018, 030, 032, 040, 043, 046 exist from restructuring; do not renumber to fill them.*

---

## DES-001: Design Philosophy

This portal is a **digital library with an AI librarian**, not a chatbot or content generator. The AI finds and surfaces Yogananda's actual words — it never speaks for him. Every architectural decision flows from this principle.

---

## DES-002: Architecture Overview

### Milestone 1a Architecture (Prove — English, Pure Hybrid Search + Contentful)

Two content stores. No AI in the search path — pure hybrid retrieval. English only. Contentful is the editorial source of truth from Arc 1 (ADR-010). (ADR-113)

```
┌──────────────────────────────────────────────────────────────────┐
│ USERS │
│ │ │
│ ▼ │
│ ┌──────────────────────────────────────┐ │
│ │ Next.js (local dev) │ │
│ │ │ │
│ │ • Search UI (query bar + results) │ │
│ │ • Book Reader (chapter navigation) │ │
│ │ • "Read in context" deep links │ │
│ └──────────┬──────────────┬─────────────┘ │
│ │ │ │
│ /api/v1/search │ │
│ │ Book reader pages │
│ ▼ ▼ │
│ ┌────────────────────┐ ┌────────────────────────┐ │
│ │ Neon PostgreSQL │ │ Contentful │ │
│ │ + pgvector │ │ (editorial source) │ │
│ │ │ │ │ │
│ │ • book_chunks │ │ Book → Chapter │ │
│ │ (text + embeddings)│ │ → Section → TextBlock │ │
│ │ • BM25 (pg_search) │ │ │ │
│ │ • HNSW vector index │ │ Rich Text AST │ │
│ │ • RRF fusion │ │ Locale: en │ │
│ │ • search_queries │ │ │ │
│ └────────────────────┘ └────────────────────────┘ │
│ ▲ │ │
│ └──────── Batch sync ────────────┘ │
│ (chunk + embed + insert) │
└──────────────────────────────────────────────────────────────────┘

One-time ingestion (English text already extracted — see scripts/book-ingest/):

 book.json ──► Contentful import script ──► Contentful (entries)
                                                    │
                                          Batch sync script
                                                    │
                                          Chunk ──► Embed ──► Neon

Milestone 1a has NO Claude API calls in the search path.
Claude is used only offline: search quality evaluation (ADR-005 E5).
```

### Milestone 1c Architecture (Deploy — Pure Hybrid Search + Contentful Webhooks)

No AI services in the search path — pure hybrid search is the primary mode.
Deployed to Vercel. Contentful webhook sync replaces batch sync.
Bilingual (en, es). (ADR-113, ADR-010, ADR-119)

```
┌──────────────────────────────────────────────────────────────────┐
│ USERS │
│ │ │
│ ▼ │
│ ┌──────────────────────────────────────┐ │
│ │ Next.js on Vercel │ │
│ │ │ │
│ │ • Search UI (query bar + results) │ │
│ │ • Book Reader (SSG/ISR from │ │
│ │ Contentful Delivery API) │ │
│ │ • Homepage (Today's Wisdom) │ │
│ │ • "Read in context" deep links │ │
│ └──────────┬──────────────┬─────────────┘ │
│ │ │ │
│ /api/v1/search Book reader │
│ /api/v1/suggest (Contentful) │
│ │ │ │
│ ▼ ▼ │
│ ┌────────────────────┐ ┌────────────────────────┐ │
│ │ Neon PostgreSQL │ │ Contentful │ │
│ │ + pgvector │◄─── webhook ───│ (editorial source) │ │
│ │ │ sync │ │ │
│ │ • book_chunks │ service │ Book → Chapter │ │
│ │ • BM25 (pg_search) │ │ → Section → TextBlock │ │
│ │ • HNSW vector index │ │ │ │
│ │ • search_queries │ │ Locales: en, es │ │
│ └────────────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Contentful webhook sync (event-driven, Milestone 1c+):

 Contentful publish ──► Webhook ──► Serverless fn ──► Chunk ──► Embed ──► Neon

Milestone 1c has NO Claude API calls in the search path.
AI-enhanced search (HyDE, cross-encoder reranking) is optional,
activated in Milestone 2b only if evaluation warrants (ADR-119).
```

### Production Architecture (Full Stack — Arc 4+)

```
┌──────────────────────────────────────────────────────────────────┐
│ │
│ EDITORIAL LAYER SEARCH LAYER │
│ (Source of Truth) (Derived Index) │
│ │
│ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ Contentful │ webhook │ Neon PostgreSQL │ │
│ │ │────────►│ + pgvector │ │
│ │ Book │ sync │ │ │
│ │ └─ Chapter │ service │ book_chunks │ │
│ │ └─ Section │ │ (text + embeddings + │ │
│ │ └─ Block │ │ Contentful entry IDs) │ │
│ │ │ │ │ │
│ │ Locales: │ │ Hybrid search: │ │
│ │ en, de, es, fr, it, │ │ vector + BM25 │ │
│ │ pt, ja, th, hi, bn │ │ │ │
│ └──────────────────┘ └──────────────────────────┘ │
│ │ │ │
│ │ (book text │ (search results) │
│ │ for reader) │ │
│ ▼ ▼ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Next.js on Vercel │ │
│ │ │ │
│ │ • Book Reader (SSG from Contentful at build time) │ │
│ │ • Search UI (queries Neon via API routes) │ │
│ │ • "Read in context" links to reader pages │ │
│ └──────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Supporting Services │ │
│ │ │ │
│ │ • Claude API — query expansion + HyDE          │ │
│ │ • Cohere Rerank 3.5 — passage reranking (M2b+) │ │
│ │ • Graph batch pipeline — Python + NetworkX (3b+)│ │
│ │ • Staff dashboard — admin panel (PRO-016)     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Key principle (Arc 1+):** Contentful is where editors work. Neon is where search works. Next.js is where users work. Each system does what it's best at. Contentful is the editorial source of truth from Arc 1 (ADR-010). The production diagram above adds services that arrive in later arcs (Cohere Rerank, graph pipeline, staff dashboard) but the Contentful → Neon → Next.js architecture is established from Milestone 1a.

### Portal Stack vs. SRF IDP Stack

The portal shares SRF's core infrastructure (AWS, Vercel, Contentful, Neon, Auth0, Amplitude, Sentry) but diverges where the portal's unique requirements — vector search, AI-human editorial collaboration, DELTA-compliant analytics, sacred text fidelity, and a 10-year architecture horizon — make a different choice clearly better. This follows SRF Tech Stack Brief § Guiding Principle #3: *"When a specialized tech vendor does something significantly better than [the standard], utilize that over the less-impressive equivalent."*

**Divergences from SRF standard:**

| SRF IDP Standard | Portal Choice | Governing ADR | Rationale |
|---|---|---|---|
| DynamoDB (single-table) | Neon PostgreSQL + pgvector | ADR-013 | Vector similarity search, BM25 full-text, knowledge graph queries — none feasible in DynamoDB |
| GitLab SCM + CI/CD | GitHub + GitHub Actions | ADR-016 | Claude Code integration; GitHub Copilot workspace; open-source community norms |
| Serverless Framework v4 | Platform-Managed Lambda | ADR-017 | Platform MCP manages all vendor infrastructure including Lambda; SF v4 adds licensing cost for < 15 functions |
| Terraform (IaC) | Platform MCP + `teachings.json` | ADR-016 | AI-native operations (PRI-12) — Platform MCP preserves IaC capabilities (declarative, repeatable, auditable) through an AI-native interface. `bootstrap.sh` handles one-time AWS security. |
| Cloudflare (CDN/WAF) | Vercel-native (Firewall, DDoS, CDN) | PRO-017 | Portal runs on Vercel — double-CDN adds complexity without unique value. Compatible if SRF routes domain through Cloudflare. |
| Retool (admin panel) | Deferred — evaluate at Milestone 3d | PRO-016 | Portal admin needs are modest; Next.js `/admin` route may suffice. Retool remains an option. |
| New Relic (observability) | Sentry (Arc 1–3c) → New Relic (3d+ APM) | ADR-041 | Sentry covers error tracking through pre-launch and early production. New Relic joins at production scale for APM, Synthetics monitors, distributed tracing, and geographic CWV — capabilities that matter at scale but not during development. |
| Vimeo (private video) | YouTube embed | ADR-054 | SRF's public teachings are on YouTube; portal links to existing assets, not re-hosted copies |
| SendGrid (transactional email) | SendGrid (aligned) | ADR-091 | Aligned with SRF standard. Open/click tracking disabled for DELTA. PRO-015 evaluates SES alternative for Milestone 5a. |
| Cypress (E2E testing) | Playwright | ADR-094 | Multi-browser support (Chrome, Firefox, WebKit), native accessibility snapshot API, better CI reliability |
| Stripo (email templates) | Server-rendered HTML | ADR-091 | One passage, one link — no template designer needed |

**Portal additions not in SRF standard:**

| Technology | Purpose | Governing ADR | Why Not Standard |
|---|---|---|---|
| Voyage voyage-3-large (embeddings) | Semantic search vector generation | ADR-118 | No SRF equivalent — SRF has no vector search |
| Cohere Rerank 3.5 (Milestone 2b+) | Passage re-ranking for search quality | ADR-119 | No SRF equivalent |
| Claude Haiku via AWS Bedrock | AI librarian (query expansion, classification) | ADR-014 | Novel capability; routed through Bedrock for SRF's existing AWS relationship |
| pg_search / ParadeDB | BM25 full-text search in PostgreSQL | ADR-044 | SRF uses Elasticsearch; portal consolidates into single database |
| fastText | Language detection for multilingual queries | ADR-077 | No SRF equivalent |
| NetworkX (Python, Milestone 3b+) | Knowledge graph batch pipeline | ADR-117 | No SRF equivalent |
| dbmate | SQL migration management | ADR-016 | SRF uses ORM migrations; portal uses raw SQL for 10-year durability |
| Lighthouse CI | Performance budget enforcement in CI | ADR-094 | Free, open-source, CI-agnostic — complements Vercel Analytics with pre-deployment checks |

**The pattern:** Align with SRF where the use case matches. Diverge where the portal's constraints (vector search, DELTA, sacred text fidelity, AI collaboration) demand it. Document every divergence with an ADR so it reads as principled engineering, not drift, when SRF's AE team encounters the portal.

---

## DES-019: API Design (Next.js API Routes)

All API routes use a versioned prefix (`/api/v1/`) from Arc 1 per ADR-011. Language is passed as a query parameter on API routes (`?language=hi`), not as a path prefix — language is a property of content, not a namespace for operations (ADR-027). Frontend pages use locale path prefixes (`/hi/themes/peace`) for SEO and `hreflang` linking. This enables mobile apps pinned to older API versions to coexist with the evolving web frontend. List endpoints use cursor-based pagination for mobile compatibility.

### Design Rationale

The API surface exists to make the teachings findable by machines — mobile apps, messaging bots, MCP consumers, Zapier workflows, and future integrations we can't predict (ADR-011). Every design choice serves the 10-year horizon (ADR-004): versioning provides room to evolve without breaking consumers, cursor-based pagination handles data changes gracefully across editions and re-ingestion, and the shared service layer (`/lib/services/`) ensures that the API is never a second-class citizen behind Server Components. The language-as-parameter convention (ADR-027) was chosen because language is a *content filter*, not an operation namespace — the same endpoint returns the same shape regardless of language, and mobile apps pinned to `/api/v1/` never need to know about locale path conventions. The contemplative error messages (ADR-074) apply here because the API is not only consumed by code — seekers see error states in the UI, and those states should carry the same care as the rest of the portal.

### API Conventions

**Field naming: `snake_case`.** All JSON response fields use `snake_case`, matching PostgreSQL column naming and providing consistency across the API surface. Examples: `chunk_id`, `book_title`, `page_number`, `reader_url`, `has_more`, `total_count`. TypeScript interfaces in `/lib/services/` use `camelCase` internally; the API route layer transforms at the boundary.

**Resource identifiers.** Resources use the identifier type natural to their domain:
- **Books** use slugs (human-readable, SEO-friendly): `/api/v1/books/autobiography-of-a-yogi`
- **Chapters** use numbers within their book: `/api/v1/books/{slug}/chapters/26`
- **Passages** use UUIDs (stable across re-ingestion via content-hash fallback, ADR-022): `/api/v1/passages/{uuid}`
- **Themes** use English slugs (stable across locales, ADR-027): `/api/v1/themes/peace`
- **People, places, glossary terms** use slugs: `/api/v1/people/sri-yukteswar`, `/api/v1/glossary/samadhi`

**Response envelope.** List endpoints follow one of two patterns:

*Paginated lists* (theme passages, books with sync, editorial threads, magazine articles):
```json
{
  "data": [...],
  "pagination": { "cursor": "opaque_value", "has_more": true },
  "meta": { "total_count": 47 }
}
```
When timestamp filtering is active (ADR-107), responses include `sync` metadata in `meta`:
```json
{
  "meta": {
    "sync": {
      "filtered_by": "updated_since",
      "since": "2026-03-01T00:00:00Z",
      "result_count": 3,
      "latest_timestamp": "2026-03-14T09:22:11Z"
    }
  }
}
```

*Complete collections* (themes list, books list, glossary) where the full set fits in one response:
```json
{
  "data": [...],
  "meta": { "total_count": 12 }
}
```

*Single resource* endpoints return the resource object directly (no `data` wrapper):
```json
{
  "id": "uuid",
  "title": "Autobiography of a Yogi",
  "slug": "autobiography-of-a-yogi",
  ...
}
```

**Search is intentionally unpaginated.** The search endpoint returns the best-ranked results (default 5, max 20) with no cursor or `has_more`. This is deliberate: the AI librarian returns the *most relevant* passages, not a paginated result set to browse. Pagination would imply browsing a corpus dump, which contradicts the librarian metaphor (ADR-001). If a seeker needs broader exploration, theme pages and the `/browse` index serve that purpose.

**`exclude` parameter.** Endpoints that support "show me another" behavior accept an `exclude` query parameter (a resource ID to omit from results). Used on `/api/v1/daily-passage` and `/api/v1/affirmations` for repeat-free refresh without client-side deduplication.

### Error Response Contract

All API endpoints return errors in a consistent JSON format:

```typescript
interface ErrorResponse {
 error: string; // Machine-readable code (e.g., "RATE_LIMITED", "NOT_FOUND", "INVALID_PARAMETER")
 message: string; // Human-readable description (compassionate tone per DELTA Love principle)
 request_id: string; // UUID for Sentry correlation and support debugging
}
```

| Status | Code | When |
|--------|------|------|
| 400 | `INVALID_PARAMETER` | Missing required parameter, invalid cursor, malformed query |
| 404 | `NOT_FOUND` | Book, chapter, chunk, theme, or place does not exist |
| 429 | `RATE_LIMITED` | Rate limit exceeded. Response includes `Retry-After` header (seconds) |
| 500 | `INTERNAL_ERROR` | Unexpected failure. Logged to Sentry with `request_id` |

Error messages use the same compassionate, clear language as the rest of the portal. Example: `"We couldn't find that passage. It may have been moved when a new edition was added."` — never terse HTTP-speak.

### `GET /api/v1/search`

```
Query params:
 q (required) — user's search query
 language (optional) — default 'en'
 book_id (optional) — restrict to a specific book
 author_tier (optional) — comma-separated: 'guru', 'president', 'monastic'.
   Default: 'guru,president'. Specify 'guru,president,monastic' to include all tiers. (PRO-014)
 limit (optional) — default 5, max 20
 mode (optional) — 'hybrid' (default), 'fts', 'vector'

Response (intentionally unpaginated — see § API Conventions):
{
 "query": "How do I overcome fear?",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The soul is ever free; it is deathless...",
 "author": "Paramahansa Yogananda",
 "book_title": "Autobiography of a Yogi",
 "chapter_title": "The Law of Miracles",
 "chapter_number": 26,
 "page_number": 312,
 "section_heading": null,
 "author_tier": "guru",
 "score": 0.87,
 "reader_url": "/books/autobiography-of-a-yogi/26#chunk-uuid"
 },
 ...
 ],
 "meta": { "total_count": 5 }
}
```

### `GET /api/v1/daily-passage`

```
Query params:
 language (optional) — default 'en'

Response:
{
 "chunk_id": "uuid",
 "content": "Have courage. Whatever you are going through will pass...",
 "author": "Paramahansa Yogananda",
 "book_title": "Where There Is Light",
 "chapter_title": "Courage",
 "page_number": 42,
 "author_tier": "guru",
 "reader_url": "/books/where-there-is-light/3#chunk-uuid"
}

Implementation:
 SELECT bc.id, bc.content, b.author, b.title, ch.title, bc.page_number, b.author_tier
 FROM daily_passages dp
 JOIN book_chunks bc ON bc.id = dp.chunk_id
 JOIN books b ON b.id = bc.book_id
 LEFT JOIN chapters ch ON ch.id = bc.chapter_id
 WHERE dp.is_active = true
 AND b.author_tier = 'guru' -- PRO-014: only guru tier in daily pool
 AND bc.language = :language -- filter to user's locale
 ORDER BY random()
 LIMIT 1;

 English fallback: if no results for user's language, re-query with
 language='en' and mark response with "fallback_language": "en".

 Optional seasonal weighting: if current month maps to a season,
 prefer passages with matching season_affinity (60/40 weighted random).
```

### `GET /api/v1/themes`

```
Query params:
 language (optional) — default 'en'. Returns localized theme names
 from topic_translations if available;
 falls back to English name if no translation exists.
 category (optional) — 'quality', 'situation', 'person', 'principle',
 'scripture', 'practice', 'yoga_path', or omit for all. (ADR-032, ADR-033)
 Homepage "Doors of Entry" uses category=quality.
 "Explore all themes" page omits this parameter.

Response (complete collection — see § API Conventions):
{
 "data": [
 {
 "id": "uuid",
 "name": "Paz",
 "slug": "peace",
 "category": "quality",
 "header_quote": "Sé tan sencillo como puedas; te asombrará...",
 "header_citation": "Autobiografía de un Yogui, Capítulo 12"
 },
 ...
 ],
 "meta": { "total_count": 12 }
}

Implementation:
 SELECT lt.id, lt.slug, lt.category, lt.sort_order,
 COALESCE(ltt.name, lt.name) AS name,
 COALESCE(ltt.header_quote, lt.header_quote) AS header_quote,
 COALESCE(ltt.header_citation, lt.header_citation) AS header_citation
 FROM teaching_topics lt
 LEFT JOIN topic_translations ltt
 ON ltt.theme_id = lt.id AND ltt.language = :language
 WHERE (:category IS NULL OR lt.category = :category)
 ORDER BY lt.category, lt.sort_order;
```

### `GET /api/v1/themes/{slug}`

Returns metadata for a single theme.

Response (single resource — see § API Conventions):

```json
{
  "id": "uuid",
  "name": "Peace",
  "slug": "peace",
  "description": "Yogananda's teachings on inner peace...",
  "category": "quality",
  "passage_count": 47,
  "language": "en",
  "created_at": "2026-03-01T00:00:00Z",
  "updated_at": "2026-03-15T12:00:00Z"
}
```

### `GET /api/v1/themes/[slug]/passages`

```
Query params:
 language (optional) — default 'en'. Filters passages to user's locale.
 If fewer than 5 results, supplements with English
 passages marked with fallback_language.
 limit (optional) — default 8, max 20
 cursor (optional) — opaque cursor from previous response
 shuffle (optional) — if true, returns a random selection (default for first request)

Response (paginated list — see § API Conventions):
{
 "theme": "Peace",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The verbatim passage text...",
 "book_title": "Man's Eternal Quest",
 "chapter_title": "How to Have Courage",
 "page_number": 187,
 "reader_url": "/books/mans-eternal-quest/12#chunk-uuid"
 },
 ...
 ],
 "pagination": { "cursor": "eyJpZCI6MTIzfQ", "has_more": true },
 "meta": { "total_count": 47 }
}

Implementation:
 Default (no cursor): randomly samples from theme-tagged chunks.
 With cursor: returns next page in stable order.
 "Show more" uses cursor from previous response.
 No user-specific personalization.
 Only serves tags with tagged_by IN ('manual', 'reviewed') — never 'auto'.
```

### `GET /api/v1/affirmations`

```
Query params:
 language (optional) — default 'en'
 exclude (optional) — affirmation ID to exclude (for "show me another")

Response:
{
 "affirmation_id": "uuid",
 "content": "I am submerged in eternal light...",
 "book_title": "Scientific Healing Affirmations",
 "page_number": 23,
 "section_heading": "Healing Affirmations"
}

Implementation:
 SELECT id, content, book_title, page_number, section_heading
 FROM affirmations
 WHERE is_active = true
 AND language = :language
 AND (:exclude IS NULL OR id != :exclude)
 ORDER BY random()
 LIMIT 1;

 Fallback: if no affirmations in user's language, return English.
```

### `GET /api/v1/books`

```
Query params:
 language (optional) — default 'en'. Returns books available in user's locale.
 Milestone 5b: also returns an "also_available_in_english"
 section for untranslated works (per ADR-075).

Response (complete collection — see § API Conventions):
{
 "data": [
 {
 "id": "uuid",
 "title": "Autobiography of a Yogi",
 "subtitle": null,
 "author": "Paramahansa Yogananda",
 "publication_year": 1946,
 "cover_image_url": "...",
 "chapter_count": 48,
 "slug": "autobiography-of-a-yogi",
 "available_languages": ["en", "es", "de", "fr", "it", "pt", "ja", "th", "hi", "bn"]
 }
 ],
 "also_available_in_english": [...],
 "meta": { "total_count": 1 }
}

Implementation:
 Primary: SELECT ... FROM books WHERE language = :language
 Also available: SELECT ... FROM books b
 WHERE b.language = 'en'
 AND b.id NOT IN (
 SELECT canonical_book_id FROM books WHERE language = :language
 AND canonical_book_id IS NOT NULL
)
 available_languages: derived from books grouped by canonical_book_id
```

### `GET /api/v1/books/{slug}`

```
Response:
{
 "id": "uuid",
 "title": "Autobiography of a Yogi",
 "subtitle": null,
 "author": "Paramahansa Yogananda",
 "slug": "autobiography-of-a-yogi",
 "publication_year": 1946,
 "cover_image_url": "...",
 "description": "A spiritual classic...",
 "bookstore_url": "https://bookstore.yogananda.org/...",
 "available_languages": ["en", "es", "de", "fr", "it", "pt", "ja", "th", "hi", "bn"],
 "chapters": [
   { "number": 1, "title": "My Parents and Early Life" },
   { "number": 2, "title": "My Mother's Death and the Mystic Amulet" },
   ...
 ]
}

Cache-Control: max-age=86400, stale-while-revalidate=604800
```

### `GET /api/v1/books/[slug]/chapters/[number]`

```
Response:
{
 "book_title": "Autobiography of a Yogi",
 "chapter_number": 26,
 "chapter_title": "The Law of Miracles",
 "paragraphs": [
 {
 "chunk_id": "uuid",
 "content": "Full paragraph text...",
 "page_number": 310,
 "paragraph_index": 0
 },
 ...
 ],
 "prev_chapter": 25,
 "next_chapter": 27
}
```

### `GET /api/v1/passages/[passage-id]/related`

```
Query params:
 limit (optional) — default 3, max 20
 book_id (optional) — filter to a specific book
 language (optional) — filter to a specific language
 theme_id (optional) — filter to a specific teaching topic
 exclude_book_id (optional) — exclude a specific book (typically current book)

Response:
{
 "source_chunk_id": "uuid",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The verbatim passage text...",
 "book_title": "Man's Eternal Quest",
 "chapter_title": "How to Have Courage",
 "chapter_number": 12,
 "page_number": 201,
 "similarity": 0.89,
 "reader_url": "/books/mans-eternal-quest/12#chunk-uuid"
 },
 ...
 ],
 "meta": { "total_available": 27, "source": "precomputed" }
}

Implementation:
 1. Query chunk_relations WHERE source_chunk_id = :id
 ORDER BY rank, with optional JOINs for filtering
 2. If filtered results < limit, fall back to real-time
 vector similarity query with WHERE clauses
 3. Response includes "source" field indicating whether
 results are from precomputed table or realtime fallback

Cache-Control: max-age=86400, stale-while-revalidate=604800
 (relations are stable; only change when new content is ingested)
```

### `GET /api/v1/books/[slug]/chapters/[number]/thread`

```
Response:
{
 "book_title": "Autobiography of a Yogi",
 "chapter_number": 14,
 "chapter_title": "An Experience in Cosmic Consciousness",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The soul's nature is infinite bliss...",
 "book_title": "The Divine Romance",
 "chapter_title": "The Nature of the Soul",
 "page_number": 142,
 "max_similarity": 0.91,
 "reader_url": "/books/the-divine-romance/8#chunk-uuid"
 },
 ...
 ],
 "meta": { "themes": ["cosmic consciousness", "the soul", "meditation"] }
}

Implementation:
 1. Get all chunk_ids for the given chapter
 2. Query chunk_relations for all those source_chunk_ids
 3. Filter to other books only
 4. Aggregate by target_chunk_id, take MAX(similarity)
 5. Deduplicate, rank by max_similarity, take top 3
 6. Extract prominent themes from chunk_topics for intro text

Cache-Control: max-age=86400, stale-while-revalidate=604800
```

### Timestamp Filtering on List Endpoints (ADR-107)

All list endpoints that return content collections support optional `updated_since` and `created_since` query parameters for incremental sync. These enable automation consumers (Zapier, Lambda, partner integrations) to fetch only what changed since their last poll — reducing API calls by orders of magnitude for stable collections.

```
GET /api/v1/books?updated_since=2026-03-01T00:00:00Z
GET /api/v1/themes?created_since=2026-03-15T12:00:00Z&language=hi
GET /api/v1/audio?updated_since=2026-02-28T00:00:00Z
```

- `updated_since` — items where `updated_at > :timestamp` (new + modified)
- `created_since` — items where `created_at > :timestamp` (new only)
- Mutually exclusive — providing both returns 400
- Results ordered by filtered timestamp ascending (natural incremental sync order)

When active, responses include `sync` metadata within `meta` for the consumer's next call:

```json
{
  "data": [...],
  "pagination": { "cursor": "...", "has_more": true },
  "meta": {
    "sync": {
      "filtered_by": "updated_since",
      "since": "2026-03-01T00:00:00Z",
      "result_count": 3,
      "latest_timestamp": "2026-03-14T09:22:11Z"
    }
  }
}
```

See ADR-107 for the full endpoint coverage table, schema requirements (`updated_at` columns and triggers on all content tables), and phasing.

---

## DES-024: Security Considerations

| Concern | Approach |
|---------|----------|
| AI prompt injection | System prompts are server-side only. User input is treated as untrusted data, never concatenated into system prompts without sanitization. |
| Content scraping | Vercel bot protection + Firewall Rules. Rate limiting on API routes (ADR-023). Content fully crawlable — no DRM or content gating (ADR-081 §3a). Protection is rate limiting + copyright communication, not technology walls. |
| AI misuse | The AI cannot generate teaching content. If prompted to "ignore instructions," the constrained output format (passage IDs only) limits attack surface. |
| User privacy | No user accounts required. Search queries logged without any user identification. |
| Source attribution | Every displayed passage MUST include book, chapter, and page citation. No orphaned quotes. |

### ADR-023: Two-Layer Rate Limiting

| Layer | Tool | Limit | Behavior on Exceed |
|-------|------|-------|-------------------|
| **Outer (edge)** | Vercel Firewall | 60 general requests/min per IP; 15 search requests/min per IP | HTTP 429 with `Retry-After` header. Request never reaches application. |
| **Inner (application)** | Custom middleware | 30 search req/min anonymous, 120 search req/min known crawlers (ADR-081) | Graceful degradation: search proceeds without Claude API calls (database-only hybrid search). Still returns results. |

The outer layer stops abuse before it reaches the application — the 15 search/min Vercel Firewall limit is stricter than the inner layer because it's a hard block (429), while the inner layer's 30/min threshold triggers graceful degradation (results still returned, just without AI enhancement). A seeker who exceeds the application-layer limit still gets search results — just without AI-enhanced query expansion and passage ranking.

### Copyright Response Headers

All content API responses and HTML page responses include copyright metadata in HTTP headers. These headers travel with content even when accessed programmatically, ensuring copyright notice is present regardless of how the content is consumed.

**Headers on all responses:**

```
X-Copyright: © Self-Realization Fellowship
X-Rights: All rights reserved
X-Attribution-Required: true
X-License-URL: https://teachings.yogananda.org/legal
```

**Additional headers on content API responses (`/api/v1/books/`, `/api/v1/search/`, `/api/v1/passages/`):**

```
X-Citation-Format: "[Quote]" — Paramahansa Yogananda, [Book], [Citation] via teachings.yogananda.org
```

**Implementation:** Next.js middleware in `/lib/middleware/copyright-headers.ts`. Applied to all routes except `/api/v1/health` and static assets. Milestone 1c (ships with the copyright communication layer, PRO-012).

**Rationale:** The portal's No Content Gating policy (ADR-081 §3a) means copyright is asserted through metadata and legal layers, not technology walls. HTTP headers are the lowest-friction mechanism for machine consumers to discover copyright status — they don't need to parse HTML or visit a separate page. Combined with `llms.txt` copyright section, JSON-LD `copyrightHolder`, and the `/legal` page, this creates a multi-layered copyright communication strategy where every layer uses a real standard consumed by real systems.

### ADR-099: Sub-Processor Inventory

All services that process data on the portal's behalf, with their roles, data touched, and geographic regions. Maintained as part of the privacy policy (`/privacy`).

| Service | GDPR Role | Data Touched | Region | Milestone |
|---------|-----------|-------------|--------|-----------|
| **Neon** | Processor | All server-side data (books, themes, search queries, subscribers) | US (default); EU read replica Arc 4+ | 1a+ |
| **Vercel** | Processor | Request logs (transient), edge headers, static assets | Global edges, US origin | 1a+ |
| **Vercel Firewall** | Processor | Request metadata, IP for rate limiting (transient, not stored by portal) | Global (Vercel edge) | 1a+ |
| **Amplitude** | Processor | Anonymized events with country_code (no user ID) | US | 3d+ |
| **Sentry** | Processor | Error stack traces, request context | US | 1a+ |
| **New Relic** | Processor | Performance metrics, log aggregation | US | 3d+ |
| **AWS Bedrock** | Processor | Search queries (transient, not stored by AWS) | `us-west-2` | 1+ |
| **Voyage AI** | Processor | Corpus text at embedding time (one-time, not retained; ADR-118) | US | 1+ |
| **SendGrid** | Processor | Subscriber email addresses | US | 5a+ |
| **Auth0** | Processor | User accounts (if implemented) | US | 7a+ |
| **Contentful** | Processor | Editorial content (no personal data) | EU | 1+ |

EU-US data transfers rely on the EU-US Data Privacy Framework (DPF) where services are certified, with Standard Contractual Clauses (SCCs) as fallback. Review when services are added or changed.

---

## DES-036: Migration, Evolution, and Longevity

The portal may be maintained for a decade. These architectural decisions ensure the codebase remains maintainable as teams change.

### Database Migrations

Numbered SQL migration files in `/migrations/`, applied via **dbmate** (SQL-based, no ORM lock-in):

```
migrations/
 001_initial_schema.sql
 002_add_places_table.sql
 003_add_chunk_places.sql
 004_add_email_subscribers.sql
```

Each migration is reviewed in Git, tested against a Neon branch, and reversible. Neon's branching capability allows safe migration testing: create a branch, apply the migration, verify, delete the branch (or merge to main).

**Why dbmate over Drizzle/Prisma Migrate:** SQL-based migrations have zero framework coupling. A future developer can read and understand raw SQL without knowing Drizzle's API. The migrations are the most long-lived artifact in the codebase — they should be in the most stable language.

### Dependency Management

- **Renovate** configured on the repo for automated dependency update PRs
- Production dependencies pinned to exact versions (not ranges)
- Quarterly review of major version upgrades (especially Next.js, which releases major versions annually)
- `package.json` engines field specifies minimum Node.js version

### Framework Exit Strategy

The shared service layer (ADR-011) is pure TypeScript with no Next.js dependency. If SRF ever migrates away from Next.js:
- `/lib/services/` — portable, zero framework dependency
- `/app/` (Server Components, Route Handlers) — framework-specific, would be rewritten
- `/migrations/` — portable, raw SQL
- Contentful webhook sync — portable, standard HTTP handler

The business logic (search, passage retrieval, theme queries) survives a framework change. Only the presentation layer is coupled.

### Data Portability

All content lives in Neon (PostgreSQL) — standard SQL, exportable via `pg_dump`. Embeddings in pgvector use standard float arrays. No vendor-specific data formats. Contentful content is exportable via their API. There is no vendor lock-in on content.

### Documentation as Longevity Tool

The ADR convention (DECISIONS.md) is the most undervalued longevity tool. When a future developer asks "why didn't we use GraphQL?" or "why not embed Google Maps?" — the answer is recorded with full context. This prevents teams from revisiting settled decisions and accidentally undoing architectural choices that had good reasons.

### ADR-004: 10-Year Horizon

The architecture is designed so that **nothing needs to be thrown away and rebuilt from scratch.** Every component can be replaced incrementally. The most valuable artifacts (data, logic, decisions) are in the most durable formats.

| Horizon | What Holds | What May Change |
|---------|-----------|-----------------|
| **3 years (2029)** | Everything. Minor dependency upgrades. | Library versions. |
| **5 years (2031)** | Core data model, service layer, migrations, ADRs. | Embedding model (swap via ADR-046). Possibly CMS or auth provider. |
| **7 years (2033)** | Database, APIs, platform config, service functions. | Next.js may be superseded. UI layer rewrite against same APIs. |
| **10 years (2036)** | PostgreSQL schema, SQL migrations, service logic, ADRs. | UI framework, some SaaS integrations will have evolved. |

**The five longevity guarantees:**

1. **All data in PostgreSQL.** Nothing lives exclusively in a SaaS tool.
2. **Business logic is framework-agnostic.** `/lib/services/` is pure TypeScript.
3. **Raw SQL migrations.** dbmate `.sql` files don't depend on any framework version.
4. **Standard protocols at boundaries.** OAuth 2.0, REST + JSON, SQL, HTTP, `hreflang`.
5. **Decisions are documented.** ADRs capture *why* every choice was made.

### ADR-046: Embedding Model Migration

The `book_chunks` table includes `embedding_model`, `embedding_dimension`, and `embedded_at` columns to support incremental model migration:

```
Model swap workflow:
 1. Benchmark new model on Neon branch (sample of 100 chunks)
 2. Run search quality test suite against new embeddings
 3. If improved: re-embed all chunks in background batches
 4. During transition: query both old and new vectors, merge via RRF
 5. After completion: drop old vectors, update indexes
```

For dimension changes (e.g., 1024 → 2048), add a new vector column, build HNSW index, re-embed, then drop the old column. The search function handles both during transition.

### Content Export

The portal can export its entire content graph via standard PostgreSQL tools:

```bash
pg_dump --format=custom --no-owner portal_db > portal_export.dump
pg_restore --no-owner -d new_portal_db portal_export.dump
```

This is inherent in using PostgreSQL — not a feature to build, but a capability to document and protect. The export includes all books, chapters, chunks (with embeddings), themes, places, passage cross-references, and subscriber data.

---

## ADR-007: Curation as Interpretation — The Fidelity Boundary and Editorial Proximity Standard

> **Arc:** — (cross-cutting, applies to all arcs that place non-Yogananda prose near sacred text)

Multiple features place portal-authored prose within visual proximity of Yogananda's verbatim text: editorial reading threads (DES-026), glossary definitions, search suggestion hints (ADR-049), crisis resource text (ADR-071), social media captions (ADR-092), magazine articles, the `/guide` page (DES-047), and chant instructions metadata (ADR-059). Each feature has its own ADR, but no single standard governs the shared boundary. This section establishes one.

### The Principle

Yogananda's verbatim words and portal-authored prose occupy **distinct visual and structural layers**. A seeker should never need to wonder whether they are reading Yogananda or the portal. The distinction must be evident to sighted users, screen reader users, and users of any assistive technology.

### Visual Rules

| Element | Treatment |
|---------|-----------|
| **Yogananda's verbatim text** | Merriweather serif, standard body size, warm cream background. The default. |
| **Citations** (book, chapter, page) | Lora italic, smaller size, SRF Navy. Visually subordinate, never omitted. |
| **Editorial prose** (thread notes, glossary definitions, `/guide` introductions, magazine articles) | Open Sans, slightly smaller size, left border accent (SRF Gold, 2px). Clearly portal voice. |
| **Functional prose** (search hints, UI chrome, empty states, ARIA labels) | Open Sans, system-appropriate size. No border accent — it is part of the interface, not content. |
| **Crisis resources** | Open Sans, muted tone, bottom-positioned. Present but never competing with the passage. |
| **User-authored notes** (study workspace) | Distinct background tint, user's own font choice where supported, labeled "Your note." Never adjacent to sacred text without a visual separator. |

### Structural Rules

1. **Sacred text is never inline with editorial prose.** Passages and editorial notes occupy separate `<article>` or `<section>` elements. Screen readers announce them as distinct regions.
2. **Attribution is structural, not decorative.** Citations are in `<cite>` elements, linked to the source. They are not CSS flourishes that disappear on mobile.
3. **Editorial notes identify their author class.** Thread notes carry "Portal editorial" attribution. Magazine articles carry author bylines. Community collections carry "Curated by [name/anonymous]." Yogananda's text carries no attribution beyond the citation — it needs no introduction.
4. **Glossary definitions link to source passages.** Every definition of a spiritual term must cite at least one passage where Yogananda himself defines or uses the term. Definitions are *derived from* the corpus, not *imposed on* it.
5. **Social media captions never paraphrase.** Captions provide context ("From Chapter 26 of Autobiography of a Yogi") or an editorial framing question ("What does it mean to be still?") — never a restatement of what Yogananda said. The quote image contains the verbatim text; the caption exists in a separate field.
6. **Maximum editorial proximity ratio.** On any page where editorial prose appears alongside sacred text, the sacred text must be the dominant visual element. Editorial framing should not exceed approximately one-third of the visible content area when a passage is displayed.

### Accessibility Implications

- Screen readers must announce the transition between sacred text and editorial prose. Use `aria-label` or `role="note"` on editorial elements.
- The visual distinction (serif vs. sans-serif, border accent) must have a non-visual equivalent. Color alone is insufficient (WCAG 1.4.1).
- Focus order places the sacred text first in the reading sequence. Editorial framing follows, not precedes.

### Features Governed

| Feature | Sacred Text | Adjacent Prose | Boundary Mechanism |
|---------|------------|----------------|-------------------|
| Search results | Verbatim passage + highlight | None (UI chrome only) | N/A — pure sacred text |
| Editorial reading threads (DES-026) | Verbatim passages | Transition notes between passages | Left-border accent, "Portal editorial" label |
| Glossary (ADR-005 E2) | Linked source passages | Term definitions | Definition in Open Sans; passage quotes in Merriweather |
| Daily email | Verbatim passage | Citation + "Read in context" link | Email template structure |
| Social media (ADR-092) | Quote image (verbatim) | Caption (separate field) | Image/text separation, human review |
| Magazine articles | Embedded block quotes | Monastic commentary | Block quote with citation, author byline on article |
| `/guide` page (DES-047) | Linked passages | Editorial introductions | Section headers + visual separation |
| Crisis resources (ADR-071) | Passage about death/suffering | Helpline information | Bottom-positioned, muted treatment |
| Study workspace (ADR-083) | Collected passages | User's personal notes | Distinct background tint, "Your note" label |
| Chant reader (ADR-059) | Chant text | Practice instructions, mood classification | Instructions in metadata panel; text in main area |
| Community collections (ADR-086) | Curated passages | Curator's description | "Curated by [name]" label, Open Sans for description |

---

## DES-037: Observability

The portal uses the SRF-standard observability stack with DELTA-compliant configuration. See ADR-095.

### Tool Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Error tracking** | Sentry | Unhandled exceptions, API errors, client-side errors. Next.js source maps. |
| **APM** | New Relic | API route latency, database query duration, Claude API/Voyage embedding call timing. Distributed tracing. |
| **Synthetic monitoring** | New Relic Synthetics | Uptime checks: `/`, `/api/v1/search`, `/api/v1/health`, `/quiet`. |
| **Product analytics** | Amplitude | DELTA-compliant: event counts only. No user identification, no session tracking, no autocapture. |
| **Log aggregation** | Vercel Logs → New Relic | Structured JSON logs with request ID correlation. |
| **Frontend performance** | Vercel Analytics | Core Web Vitals (LCP, CLS, INP). Cold start monitoring. |

### Health Check Endpoint

```
GET /api/v1/health

Response:
{
 "status": "ok",
 "version": "1.0.0",
 "database": "connected",
 "timestamp": "2026-02-17T12:00:00Z"
}
```

### Structured Logging (`/lib/logger.ts`)

Every API route logs a consistent JSON structure:

```typescript
interface RequestLog {
 requestId: string; // UUID, propagated across services
 route: string; // e.g., "/api/v1/search"
 method: string; // GET, POST
 statusCode: number;
 durationMs: number;
 language: string; // User's locale
 timestamp: string; // ISO 8601
}

// Additional fields for search routes (anonymized)
interface SearchLog extends RequestLog {
 query: string; // The search query
 resultCount: number;
 searchMode: string; // "hybrid", "fts", "vector"
 expansionUsed: boolean; // Whether Claude query expansion was invoked
}
```

No user identification. No IP addresses. No session IDs.

### DELTA-Compliant Amplitude Configuration

| Amplitude Feature | Setting | Reason |
|-------------------|---------|--------|
| User identification | **Disabled** | Seekers are not data points (Dignity) |
| Session tracking | **Disabled** | Optimizes for retention (violates Agency) |
| Event sequencing | **Disabled** | Builds behavioral profiles (violates Agency) |
| Autocapture | **Disabled** | Surveillance by default (violates Dignity) |

**Amplitude event allowlist:**

| Event | Properties | Metric It Supports |
|-------|-----------|-------------------|
| `page_viewed` | `{ page_type, language, requested_language, country_code }` | Countries reached, languages served, unmet language demand |
| `passage_served` | `{ book_slug, language }` | Books/passages served |
| `share_link_generated` | `{ format }` | Share link generation count |
| `center_locator_clicked` | `{}` | Digital → physical bridge |
| `search_performed` | `{ language, result_count, zero_results }` | Search usage volume, zero-result rate |

**`requested_language` rationale:** The `page_viewed` event carries `language` (the locale actually served) and `requested_language` (the seeker's `Accept-Language` header preference). The delta between requested and served is a direct measure of unmet language demand — e.g., how many seekers per week arrive wanting Hindi but receive English. This signal is impossible to backfill and directly informs Milestone 5b language prioritization. When `requested_language === language`, the property adds no information and can be elided in analysis.

**`zero_results` rationale:** The `search_performed` event's `zero_results` boolean tracks searches that return no passages. The zero-result rate is the portal's single most actionable operational metric: a rising rate signals corpus gaps, query expansion failures, or search pipeline regressions. The Milestone 3d staff dashboard (M3d-4, PRO-016) should surface zero-result rate trend and the most common zero-result queries as top-level indicators.

### Standing Operational Metrics

Beyond the Amplitude event allowlist and APM tooling, the following derived metrics should be computed and surfaced in the Milestone 3d staff dashboard (PRO-016) for ongoing operational awareness:

| Metric | Source | Refresh | Dashboard |
|--------|--------|---------|-----------|
| Zero-result rate (% of searches returning 0 passages) | `search_performed` events | Daily | Staff dashboard (PRO-016) |
| Most common zero-result queries (top 20) | `search_queries` table | Daily | Staff dashboard (PRO-016) |
| Search degradation mode distribution | Structured logs (`searchMode` field) | Daily | Staff dashboard (PRO-016) |
| AI cost (Claude Haiku calls × per-call cost) | AWS Bedrock billing / CloudWatch | Daily | Staff dashboard (PRO-016) |
| Unmet language demand (requested ≠ served) | `page_viewed` events | Weekly | Staff dashboard (PRO-016) + Impact Dashboard (Milestone 5b) |
| Content availability matrix (books × languages) | `books` + `book_chunks` tables | On content change | Impact Dashboard |
| Editorial queue depth by type | `review_queue` tables | Real-time | Admin portal pipeline dashboard |
| Geographic Core Web Vitals (per target region) | New Relic Synthetics | Continuous | New Relic |

---

## DES-038: Testing Strategy

Testing is a fidelity guarantee, not optional polish. A bug that misattributes a quote or breaks search undermines the core mission. See ADR-094.

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

| Layer | Tool | What It Tests | Milestone |
|-------|------|---------------|-----------|
| **Unit / Integration** | Vitest + React Testing Library | Service functions, API route handlers, component rendering | Milestone 2a |
| **End-to-End** | Playwright | Full user flows: search → read → share → navigate. Cross-browser. | Milestone 2a |
| **Accessibility** | axe-core (CI) + Playwright a11y | Automated WCAG checks. Keyboard navigation flows. | Milestone 2a |
| **Search quality** | Custom eval harness (`/scripts/eval/search-quality.ts`) | ~58 English + ~15 Spanish queries (golden set). Recall@3, MRR@10, routing accuracy. Six categories. CI regression on search-affecting PRs. DES-058. | Milestone 1a (en), 1b (es) |
| **Related content quality** | Custom Vitest suite | Pre-computed relations are thematically relevant, cross-book diverse, no false friends. | Milestone 3c |
| **Performance** | Lighthouse CI | LCP < 2.5s, CLS < 0.1, INP < 200ms | Milestone 2a |
| **Visual** | Browser rendering (code-first) | Design emerges through code iteration; browser is the design artifact | Arc 1+ |
| **Visual regression** | Playwright screenshot comparison | Catch unintended visual changes | Arc 5 |

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

### Key E2E Test Scenarios (Milestone 2a)

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

### Related Content Quality Evaluation (Milestone 3c+)

Mirrors the search quality evaluation (M1a-8) but for the pre-computed `chunk_relations`. The teaching portal is focused on quality teaching — bad relations undermine trust as much as bad search results.

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

---

## DES-057: Error Handling and Resilience

The portal's error handling philosophy follows from two principles: **Global-First** (a degraded experience is still a complete experience) and **Calm Technology** (errors should not alarm the seeker). Every external dependency has a degradation path that preserves the core reading experience.

### Degradation Hierarchy

The portal degrades gracefully through layers. Each layer down removes a capability but never blocks reading or basic search.

| Dependency | If Unavailable | Degradation | Seeker Impact |
|------------|---------------|-------------|---------------|
| **Claude API (Bedrock)** | Query expansion, intent classification, passage ranking skip | Pure hybrid search (vector + BM25) — still returns relevant results | Slightly less precise ranking; no intent routing |
| **Neon PostgreSQL** | Search and API calls fail | Book reader falls back to Contentful Delivery API; search shows calm error message | Reading works, search does not |
| **Contentful Delivery API** | Book reader pages fail to render | Search still works (Neon is the search index); reader shows fallback message | Search works, reading does not |
| **Voyage API** | New embedding generation fails | Existing embeddings continue to serve search; ingestion pipeline pauses | Zero seeker impact (ingestion is offline) |
| **Vercel Edge** | Complete outage | Standard Vercel reliability; no self-hosted fallback in Arc 1 | Full outage (accept this risk) |

### Error Handling Patterns

**Retry policy.** External API calls (Bedrock, Voyage, Contentful) use exponential backoff with jitter: 3 retries, base delay 200ms, max delay 5s. Database connection retries follow Neon's connection pooler recommendations (see ADR-124 § Connection Resilience). No retries on 4xx responses — only 5xx and network errors.

**Circuit breaker.** The Claude API path uses a simple circuit breaker in `/lib/services/`:
- **Closed** (normal): all requests pass through
- **Open** (after 5 consecutive failures in 60s): skip Claude, fall back to hybrid-only search for 30s
- **Half-open**: send one probe request; if it succeeds, close the circuit

This prevents cascading latency when Bedrock is degraded. The circuit breaker state is in-memory (per serverless instance), not shared — acceptable because each Vercel function instance independently detects degradation.

**Timeout policy.** Claude API calls timeout at 8s (query expansion: 3s, intent classification: 2s, passage ranking: 5s). Database queries timeout at 5s. Contentful API calls timeout at 10s. All timeouts implemented via `AbortController` in service functions.

**User-facing error presentation.** Errors follow the portal's contemplative register (ADR-074):
- Search degradation is invisible — seekers get results, just via a simpler path
- Reader errors: "This chapter is temporarily unavailable. Please try again shortly."
- Full search failure: "The search is resting. You might enjoy browsing the library while we restore it." with a link to `/books`
- Never show stack traces, error codes, or technical details to seekers

**Structured error logging.** All errors are logged via `/lib/logger.ts` with: error type, service name, request ID, duration, and whether degradation was triggered. Sentry captures unhandled exceptions. The `searchMode` field in search response metadata reveals which path was taken (full AI-enhanced, hybrid-only, FTS-only) for operational monitoring.

### Partial Failure in Ingestion Pipeline

The ingestion pipeline (DES-005) processes chunks individually. A failure on one chunk does not abort the pipeline:
- Failed embeddings are logged and retried in a separate pass
- Failed enrichment produces a chunk with `enrichment_status = 'failed'` — it is still searchable via FTS, just not enriched
- The pipeline produces a summary report: N chunks processed, M failures, failure types

---

## DES-050: Seeker & User Persona Index

A consolidated reference to every persona type defined across the portal's design documents. This section does not duplicate persona details — it indexes them so that any developer, designer, or editorial staff member can find who the portal serves and where the design commitments for each persona live.

### Design Philosophy

The portal's personas are **need-based, not demographic**. A 16-year-old in career crisis and a 45-year-old career-changer both enter through the same life-phase pathway. A Christian contemplative in Atlanta and a Hindu practitioner in Kolkata both find Yogananda's words, but through different worldview entry points. Age, income, education, and geography are treated as *constraints to design around* (performance budgets, accessibility, cultural adaptation), never as audience segments to target.

**The portal intentionally does not design for passive consumption.** There is no algorithmic feed, no infinite scroll, no "recommended for you" engine, no engagement optimization. Every interaction is seeker-initiated. This is not a limitation — it is the Calm Technology principle (CLAUDE.md constraint #3) applied to the entire product. The portal is a library, not a feed. Seekers come with intent; the portal meets that intent and then lets go. (Relates to ADR-095 DELTA-compliant analytics, ADR-071 Quiet Corner.)

**Inhabit, don't label.** When the portal addresses seekers directly in UI copy, use their language — questions they'd ask, feelings they'd name, actions they'd describe. Reserve persona taxonomy ("The curious reader," "The meditation seeker") for internal design documents. The seeker should never read a label they wouldn't apply to themselves. A person in grief is not "A Person in Need" — they're someone for whom light exists in dark hours. A newcomer is not "The Curious Reader" — they're someone looking for a place to begin. This principle follows from PRI-03 (the technology disappears) and PRI-08 (calm technology meets you without naming you).

### Seeker Personas (External)

Persona names below are **internal design vocabulary** — used in design documents, code comments, and team discussion. UI-facing copy follows the "Inhabit, don't label" principle above: the homepage Start Here section uses "A Place to Begin," "Light for Dark Hours," and "Be Still And..." rather than surfacing these taxonomy labels. Descriptions give rather than ask — "Millions have found their way here" instead of "New to Yogananda?"

| Persona | Entry Pattern | Primary Section | Key ADRs |
|---|---|---|---|
| **The curious reader** | Homepage → themes / search / browse | DES-048 seeker archetypes | ADR-129 |
| **The person in need** | "Seeking..." empathic entry → Quiet Corner / theme page | DES-006, DES-011 | ADR-071 |
| **The meditation seeker** | Homepage → `/guide` → practice pathways | DES-048 | ADR-104 |
| **The shared-link recipient** | `/passage/[id]` via friend's message | ADR-067 (#1) | — |
| **The Google arrival** | `/books/[slug]/[chapter]` from external search | ADR-067 (#2) | — |
| **The daily visitor** | Homepage → Today's Wisdom → contemplate → leave | ADR-067 (#3) | DES-028 |
| **The Quiet Corner seeker** | `/quiet` directly, often in crisis | ADR-067 (#4) | ADR-071 |
| **The linear reader** | Chapter 1 → 2 → ... → N | ADR-067 (#5) | ADR-072 |
| **The devoted practitioner** | Search for half-remembered passages, cross-book study | ADR-067 (#6) | ADR-104 |
| **The scholar** | Citation-driven, cross-referencing, export-oriented | ADR-067 (#7) | ADR-043, ADR-061 |
| **The study circle leader** | Find → collect → arrange → share → present | ADR-082 external personas | ADR-006 §5, ADR-086 |
| **The crisis seeker** | 2 AM, acute distress, grief, suicidal ideation | DES-011 (Quiet Corner) | ADR-071 |
| **The Global South seeker** | Rural Bihar, 2G, JioPhone, paying per MB | ADR-006 (Global-First) | ADR-003 |

### Worldview Pathways (14 entry points)

Seekers arrive from different epistemological and tradition-based starting points. Each worldview pathway (WP-01 through WP-14) is an editorially curated reading path that meets the seeker where they are. Full catalog in DES-048.

| ID | Worldview | Primary Corpus | Status |
|---|---|---|---|
| WP-01 | Christian Contemplative | *The Second Coming of Christ* | Approved |
| WP-02 | Hindu/Vedantic Practitioner | *God Talks With Arjuna* | Approved |
| WP-03 | Buddhist/Zen Meditator | *Autobiography* meditation chapters | Approved |
| WP-04 | Sufi/Poetry Lover | *Wine of the Mystic* | Approved |
| WP-05 | Jewish/Contemplative | *The Second Coming of Christ* (OT) | Approved |
| WP-06 | Science & Consciousness Explorer | *Autobiography* science chapters | Approved |
| WP-07 | Spiritual But Not Religious | *Autobiography*, *Where There Is Light* | Approved |
| WP-08 | Yoga Practitioner (Body to Spirit) | *Autobiography*, *God Talks With Arjuna* | Approved |
| WP-09 | Grief/Crisis Visitor | Cross-cutting | Approved |
| WP-10 | Psychology/Self-Improvement | *Man's Eternal Quest* | Approved |
| WP-11 | Comparative Religion/Academic | All books + Knowledge Graph | Approved |
| WP-12 | Parent/Family-Oriented | *Man's Eternal Quest*, *Journey to Self-Realization* | Approved |
| WP-13 | Muslim/Sufi Seeker | *Wine of the Mystic*, *Autobiography* | Requires SRF approval |
| WP-14 | Agnostic/Skeptical-but-Curious | *Autobiography* science chapters | Requires SRF approval |

### Life-Phase Pathways (9 temporal states)

Seekers are also in a season of life that shapes what they need. Each life-phase pathway (LP-01 through LP-09) uses a universal question, not an age label, as its entry point. Full catalog in DES-048.

| ID | Life Phase | Entry Question | Tone |
|---|---|---|---|
| LP-01 | Young Seeker | "What should I do with my life?" | Practical, joyful |
| LP-02 | Building a Life | "How do I balance inner and outer?" | Practical |
| LP-03 | Raising a Family | "How do I raise children wisely?" | Practical |
| LP-04 | The Middle Passage | "Is this all there is?" | Contemplative, challenging |
| LP-05 | The Caregiver | "Where do I find strength?" | Consoling, practical |
| LP-06 | Facing Illness | "How do I heal or accept?" | Consoling, practical |
| LP-07 | The Second Half | "How do I grow old with grace?" | Contemplative, consoling |
| LP-08 | Approaching the End | "What awaits me?" | Consoling, contemplative |
| LP-09 | New to Spiritual Practice | "I want to begin, don't know how" | Practical, joyful |

### Situational Themes (8 life circumstances)

Cross-cutting life situations that any seeker may navigate, independent of age or worldview. Implemented as editorial theme groupings in ADR-032.

Work | Relationships | Parenting | Health/Wellness | Loss & Grief | Aging | Facing Illness | Purpose

### Staff & Operational Personas (Internal)

Full profiles in ADR-082. Summary index:

| Persona | Type | Active From |
|---|---|---|
| Monastic content editor | Core staff | Milestone 3b+ |
| Theological reviewer | Core staff | Milestone 3b+ |
| AE social media staff | Core staff | Milestone 3d+ |
| Translation reviewer | Core staff (or volunteer) | Milestone 5b+ |
| AE developer | Core staff | Arc 1+ |
| Leadership (monastic) | Core staff | Milestone 3b+ |
| Portal coordinator | Operational (unstaffed) | Milestone 3b+ |
| Book ingestion operator | Operational (unstaffed) | Milestone 2a+ |
| VLD coordinator | Operational (unstaffed) | Milestone 5a+ |

### Volunteer Personas

| Persona | Active From |
|---|---|
| VLD curation volunteer | Milestone 5a+ |
| VLD translation volunteer | Milestone 5b+ |
| VLD theme tag reviewer | Milestone 5a+ |
| VLD feedback triager | Milestone 5a+ |
| VLD content QA reviewer | Milestone 5a+ |

### External Personas

| Persona | Primary Need |
|---|---|
| Philanthropist's foundation | Pre-formatted impact reports |
| Study circle leader | Find → collect → arrange → share → present (see ADR-082 expanded profile) |
| Institutional intermediary | Chaplain, therapist, hospice worker accessing on behalf of others (see CONTEXT.md open question) |

### Non-English Seeker Journeys

Three brief empathy narratives for how non-English seekers may discover and use the portal. These are not design specifications — they are grounding artifacts that keep the team oriented toward real human experiences when making UX decisions.

**Priya, Varanasi (Hindi).** Priya is 34, a schoolteacher. Her grandmother kept a Hindi copy of *Autobiography of a Yogi* by the prayer altar — she called Yogananda "Yogananda ji" and read from it during evening prayers. Priya never read it herself. After her grandmother's death, she searches on her phone: "योगानन्द जी मृत्यु के बाद" (Yogananda ji, after death). She finds the portal through Google. She arrives at the Hindi locale, sees the YSS branding she recognizes from her grandmother's prayer room, and finds a passage about the soul's immortality in the same words her grandmother read aloud. She doesn't search again for three weeks. Then she returns for "योगानन्द जी ध्यान कैसे करें" (how to meditate). The Practice Bridge links her to YSS's free beginner meditation page. She has never heard of SRF. The portal does not need her to.

**Carlos, São Paulo (Portuguese).** Carlos is 22, a university student studying philosophy. He finds Yogananda through a yoga studio's Instagram post that links to a portal passage about willpower. He reads in Portuguese, explores the "Purpose" theme, and finds passages from *Man's Eternal Quest*. He doesn't know what SRF or YSS is. He uses the citation export to reference a passage in his philosophy paper on Eastern and Western concepts of will. Six months later, he discovers the Knowledge Graph and spends an afternoon following connections between Yogananda's references to Patanjali, the Gita, and Western science. He still has no interest in meditation. The portal does not try to make him interested.

**Amara, Lagos (English, but not from the Western spiritual tradition).** Amara is 40, a hospital nurse and devout Christian. A colleague shared a portal link to a passage about courage during suffering. Amara is suspicious — is this a Hindu thing that conflicts with her faith? She sees the passage is from a book by "Paramahansa Yogananda" and doesn't know who that is. She reads the passage and finds it moving. The WP-01 (Christian Contemplative) worldview pathway surfaces Yogananda's commentary on the Gospels. She is surprised. She reads one chapter of *The Second Coming of Christ* on her phone during a night shift break, on a hospital Wi-Fi connection that drops every few minutes. The portal's progressive loading means she never loses her place. She never clicks "Learn about meditation." She comes back to read the next chapter the following week. The portal's <100KB JS budget means her data cost is negligible on her Nigerian mobile plan.

### Locale-Specific Cultural Adaptation

The same seeker archetype requires cultural adaptation across locales — not just language translation but emotional register, platform habits, and trust signals. Summary of key design differentiators:

| Locale | Key Adaptation | Platform Priority |
|---|---|---|
| Spanish (es) | Emotional warmth, relational tone | WhatsApp |
| French (fr) | Diacritic-insensitive search, Francophone Africa vs European French | — |
| German (de) | Compound word search, privacy expectations exceed GDPR | — |
| Portuguese (pt) | Brazilian vs European variants, university/intellectual framing | WhatsApp |
| Japanese (ja) | CJK tokenization, omikuji framing, *ma* aesthetic, LINE (not WhatsApp) | LINE |
| Thai (th) | No word boundaries (search tokenization), Buddhist context, gold/lotus aesthetics | LINE |
| Hindi (hi) | YSS branding, mobile-first, text-only mode essential, *sādhak* terminology | WhatsApp |
| Bengali (bn) | YSS branding, lyrical editorial register, Tagore's aesthetic influence | WhatsApp |

### Open Persona Questions

These questions are tracked in CONTEXT.md § Open Questions (Stakeholder) and require SRF input:

1. **Young seekers** — should the editorial voice acknowledge teenagers explicitly, or is agelessness the mode of inclusion? (Line 76)
2. **WP-13 and WP-14** — Muslim/Sufi and Agnostic/Skeptical worldview pathways require SRF editorial approval. (Line 77)
3. **Institutional intermediaries** — chaplains, therapists, hospice workers accessing on behalf of others. (Line 69)
4. **Operational role assignment** — portal coordinator, book ingestion operator, VLD coordinator. (Line 85–86)
5. **"Who *shouldn't* use this portal?"** — The seeker searching for Kriya technique instructions should be redirected to SRF Lessons, not shown Autobiography excerpts that might be misinterpreted as instruction. The Practice Bridge (ADR-104) addresses this, but the persona of "the seeker who needs what we don't offer" could be more explicitly designed for.
6. **Abuse and misuse patterns** — Automated corpus extraction, quote weaponization, SEO parasitism. (CONTEXT.md technical open question)
7. **"Seeking..." and Start Here section overlap** — The homepage's "What are you seeking?" section (first-person empathic entry) and "Start Here" section (navigational cards) map to three of the same personas and route to overlapping search queries. Consider whether these earn separate screen weight or should merge into a single section that combines the Seeking section's first-person warmth with Start Here's richer card format (title + description + specific destination). Low priority — the current experience works — but worth revisiting when the homepage evolves.

---

## DES-053: Unified Content Pipeline Pattern

Content enters the portal through five media-type-specific pipelines: books (DES-005), magazine articles (ADR-040), video transcripts (ADR-055), audio transcripts (ADR-057), and images (ADR-035). Each is specified independently, but all follow a shared seven-stage pattern. This section names the pattern explicitly, so that Arc 6+ implementations and future content types inherit the structure rather than re-inventing it.

### The Seven Stages

```
Source → Normalize → Chunk → Embed → QA → Index → Relate
```

| Stage | What Happens | Governing Decisions |
|---|---|---|
| **1. Source** | Raw content acquired: PDF scan, Contentful entry, YouTube caption, audio file, image file. Format varies by media type. | ADR-029 (book priority), ADR-040 (magazine), ADR-055 (video), ADR-057 (audio), ADR-035 (images) |
| **2. Normalize** | Convert to a uniform text representation. PDFs → structured text with page/paragraph boundaries. Captions → timestamped transcript. Audio → Whisper transcription. Images → editorial description text (images are not directly searchable). | DES-005 (book normalization), ADR-055 (caption → transcript), ADR-057 (audio → Whisper) |
| **3. Chunk** | Segment normalized text into retrieval units. Books use paragraph-based chunking (ADR-048). Transcripts use speaker-turn or timestamp-window chunking. Image descriptions are single-chunk. | ADR-048 (chunking strategy) — book-specific but principles apply cross-media |
| **4. Embed** | Generate vector embeddings for each chunk. Same embedding model across all content types (ADR-046). `embedding_model` column tracks the model version. Multilingual benchmarking applies (ADR-047). | ADR-046, ADR-047 |
| **5. QA** | Mandatory human review gate. Every chunk's text, citation, and metadata are verified before the content reaches seekers. AI-assisted (Claude flags anomalies), human-approved. Review enters the unified review queue (DES-033). | ADR-001 (verbatim fidelity), ADR-078 (human review mandatory), DES-033 (review queue) |
| **6. Index** | Approved chunks enter the search index: BM25 index (pg_search) automatically updated on INSERT, vector embeddings available for similarity queries, content surfaced in browse pages and theme listings. | ADR-044 (hybrid search), ADR-114 (pg_search BM25), DES-019 (API endpoints) |
| **7. Relate** | Pre-compute cross-content relationships: chunk-to-chunk similarity (ADR-050), theme membership (ADR-032), cross-media relations (ADR-060), Knowledge Graph edges (ADR-062). Relations are computed after indexing, not during — they're a derived layer. | ADR-050, ADR-060, ADR-062 |

### Media-Type Variations

The stages are shared; the implementations differ:

| Media Type | Source Format | Chunking Unit | Special QA | Relation Types |
|---|---|---|---|---|
| **Books** | Contentful Rich Text (imported from PDF or digital text) | Paragraph (ADR-048) | Page number verification, edition alignment | chunk_relations, theme_membership |
| **Magazine** | Contentful entry or PDF | Article section | Author attribution verification | chunk_relations, theme_membership, issue_membership |
| **Video** | YouTube caption / Whisper | Speaker turn + timestamp window | Timestamp accuracy, speaker diarization | chunk_relations, cross_media (video ↔ book) |
| **Audio** | Whisper transcription | Speaker turn + timestamp window | Sacred artifact flag for Yogananda's voice | chunk_relations, cross_media (audio ↔ book), performance_of (chant) |
| **Images** | Editorial description | Single chunk (description text) | Alt text review, sacred image guidelines (ADR-042) | depicts_person, depicts_place, related_passage |

### When to use this pattern

Any new content type entering the portal in future arcs (e.g., letters, unpublished manuscripts, study guides) should follow this seven-stage pattern. The implementation checklist for a new content type:

1. Define source format and normalization process
2. Choose chunking strategy (or declare single-chunk if the unit is atomic)
3. Verify embedding model handles the content type adequately (or benchmark alternatives per ADR-047)
4. Add a QA review queue type to DES-033
5. Update the search index to include the new content type (DES-019 API, ADR-044 hybrid search)
6. Define relation types and update the Knowledge Graph node/edge types (ADR-062)
7. Update this section's Media-Type Variations table

### Not a premature abstraction

Arcs 1–3 implement each pipeline independently — books, magazine, then video/audio/images. The unified content hub (ADR-060) arrives in Arc 6 as a deliberate migration. This section documents the *pattern* shared across independent implementations, not a shared codebase. If a shared `ContentPipeline` base class emerges naturally during Arc 6, it should be extracted from working code, not designed in advance.

---

## Open Questions

See CONTEXT.md § Open Questions for the consolidated list. Technical and stakeholder questions live there so they're visible at session start and move to "Resolved" as work progresses. Architectural questions that arise during implementation should be added to CONTEXT.md and, if they require a decision, captured as an ADR in DECISIONS.md.

---
