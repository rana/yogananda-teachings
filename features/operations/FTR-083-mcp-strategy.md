---
ftr: 83
title: MCP Strategy
summary: "Three-tier MCP server adoption plan for AI operator access to infrastructure services"
state: approved
domain: operations
governed-by: [PRI-12]
---

# FTR-083: MCP Strategy

## Rationale

**Status:** Accepted (external-facing tiers expanded by FTR-098: Three-Tier Corpus Access Layer; elevated to operational infrastructure by PRI-12 and FTR-093) | **Date:** 2026-02-20

### Context

The portal is architected, designed, implemented, and operated by AI (PRI-12). MCP (Model Context Protocol) servers provide the AI operator with direct programmatic access to infrastructure services — querying databases, reading error logs, inspecting CMS content models, managing deployments — without leaving the coding context. PRI-12 elevates MCP from development tooling to operational infrastructure: every managed service integral to routine operations requires MCP or equivalent API access (FTR-093). The question is which MCP servers provide genuine value versus adding configuration overhead for marginal benefit.

The evaluation criteria:
1. **Frequency** — Is this queried during active development, or only during setup?
2. **Context value** — Does seeing this data improve code decisions in the moment?
3. **Alternative quality** — Is the CLI or dashboard already excellent?

### Decision

Three tiers of MCP server adoption, phased with the project:

**Essential (configure now):**

| MCP Server | Purpose | Why Essential |
|------------|---------|---------------|
| **Neon** | Database schema management, SQL execution, migration testing, branch-per-test isolation | The database is the center of everything. Used in virtually every development session. |
| **Sentry** | Error investigation — stack traces, breadcrumbs, affected routes, error frequency | When something breaks during development, seeing the full error context without switching tools is genuinely valuable. Eliminates context switching during debugging. |

**High value (add when the service is introduced):**

| MCP Server | Stage | Purpose | Why Valuable |
|------------|-----------|---------|-------------|
| **Contentful** | STG-003+ | Content model queries, entry management, webhook debugging | Contentful is the editorial source of truth from STG-001 (FTR-102). The content model is tightly coupled to code from the start. Prevents drift between what code expects and what CMS provides. |

**Evaluate (try, keep if useful):**

| MCP Server | Stage | Purpose | Assessment |
|------------|-----------|---------|------------|
| **GitHub** | STG-001+ | Issue context, PR details, review comments | Modest benefit over `gh` CLI. Try it; drop if redundant. |
| **Vercel** | STG-001+ | Deployment status, build logs, preview URLs | Useful for debugging deployment failures. The `vercel` CLI covers most of this. |
| ~~**Cloudflare**~~ | — | Removed from portal stack (FTR-118). If SRF routes domain through Cloudflare, evaluate Cloudflare MCP at that point. | — |

**Not recommended (skip):**

| Service | Why Skip |
|---------|----------|
| **AWS** | Platform MCP manages infrastructure declaratively. Sentry catches errors. The gap — "what's in that S3 bucket?" — is too narrow. `aws` CLI through Bash handles rare ad-hoc queries. |
| **Figma** | Suspended (FTR-153). No design tool needed during AI-led development. |
| **Amplitude** | Analytics code targets the SDK, not the query API. By the time analytics data matters (STG-009+), queries are infrequent. Dashboard is adequate. |
| **New Relic** | APM data (slow queries, endpoint latency) is useful during the STG-009 observability work, but that's a narrow window. Dashboards handle ongoing monitoring. |
| **Auth0** | Auth is configured once and rarely touched. When it breaks, the Auth0 CLI or dashboard is adequate for the low frequency of interaction. |

**Custom MCP server (unscheduled):**

The **SRF Corpus MCP** server architecture (FTR-098, FTR-083) gives the AI development-time access to the book corpus — "find all passages about meditation in Autobiography." All three tiers were moved to Unscheduled Features (2026-02-24) to focus on core delivery. The architecture is preserved in `design/search/FTR-083-mcp-server-strategy.md`.

### Consequences

- Sentry MCP added to project configuration at STG-001 alongside existing Neon MCP
- Contentful MCP evaluated and added at STG-003 when Contentful webhook sync activates
- GitHub MCP evaluated during STG-001; kept or dropped based on actual utility versus `gh` CLI
- SRF Corpus MCP server moved to Unscheduled Features (2026-02-24). Architecture preserved in FTR-083.
- AWS MCP explicitly not adopted — Platform MCP + Sentry + `aws` CLI is sufficient
- MCP server configuration documented in CLAUDE.md for all future AI sessions
- This decision is revisited at future stages (cross-media) and STG-023 (user accounts) when new services enter the stack

## Specification

MCP (Model Context Protocol) serves two fundamentally different purposes in this project, distinguished by audience and lifecycle:

1. **Platform MCP servers** — Claude's tools for operating infrastructure during development. These are third-party MCP servers connected to Claude Code. They manage platforms, not portal content.
2. **SRF Corpus MCP server** — The portal's own MCP interface for AI consumers (internal and external). Wraps `/lib/services/` functions. Serves content, not infrastructure.

Both ultimately wrap service layers, but they serve different audiences, have different security models, and follow different lifecycles.

### Platform MCP Servers (FTR-083) — AI Operator Tools

These are Claude's operational interface during development. They are the Operations layer of the Three-Layer Neon Management Model (FTR-095).

| MCP Server | Use Case | Availability | Role |
|------------|----------|-------------|------|
| **Neon MCP** (`@neondatabase/mcp-server-neon`) | Branch creation, SQL execution, schema diffs, migration safety (`prepare_database_migration`/`complete_database_migration`/`compare_database_schema`), connection string retrieval, Time Travel queries | Available now | **Primary operations interface** — replaces Console for verification, experimentation, and development workflows. See FTR-095 § Three-Layer Neon Management Model. |
| **Sentry MCP** | Error investigation — stack traces, breadcrumbs, affected routes | STG-001 | Debugging and incident response |
| **Contentful MCP** | Content model design, entry management during development | STG-003 (evaluate) | CMS operations |

See FTR-083 for the full evaluation framework (essential, high-value, evaluate, not recommended).

### SRF Corpus MCP — Three-Tier Architecture (FTR-098)

**Status: Unscheduled.** All three SRF Corpus MCP tiers moved to ROADMAP.md § Unscheduled Features (2026-02-24). The architecture below is preserved as design reference for when scheduling is decided. Platform MCP servers (Neon, Sentry, Contentful) remain on schedule — they are separate from this.

```
Seeker (browser) → API Route → Service Layer → Neon
AI agent (MCP)   → MCP Tool  → Service Layer → Neon
Claude Code (dev) → MCP Tool → Service Layer → Neon
```

The service layer doesn't care who's calling. The access protocol and metadata envelope differ by tier.

#### Tier 1: Development (STG-001)

Unrestricted access for Claude Code during portal development. Also used for iterating on guide pathway generation prompts (FTR-069 § Worldview Guide Pathway Generation, FTR-056 § Worldview Pathway Catalog) — developer tests "generate a guide pathway for Buddhist meditators" interactively, refining prompt templates before deploying to the admin portal batch workflow.

| Tool | Service Function | Purpose |
|---|---|---|
| `search_corpus(query, limit)` | `search.ts` | Find passages by semantic query |
| `search_by_theme(slug)` | `themes.ts` | Theme-based retrieval |
| `search_references(source_name)` | `references.ts` | External reference lookup |
| `get_vocabulary_bridge(category)` | reads `spiritual-terms.json` | Terminology mapping |
| `get_book_metadata(slug)` | `books.ts` | Book information |
| `get_theme_metadata(slug)` | `themes.ts` | Theme information |

#### Tier 2: Internal (STG-007+)

Authenticated service-to-service access for editorial AI agents, batch pipelines, admin portal AI features, and cross-property consumers (SRF app, staff dashboard per FTR-149). Adds tools that FTR-069 AI workflows need for corpus-grounded proposals. Authentication via API key or IAM role (not Auth0).

| Tool | Service Function | Purpose | Stage |
|---|---|---|---|
| `get_chunk_with_context(chunk_id, window)` | `chunks.ts` | Passage + N surrounding chunks (for QA, classification, review) | 3b |
| `get_similar_passages(chunk_id, threshold, limit)` | `search.ts` | Embedding-based nearest neighbors (distinct from theme search) | 3b |
| `get_glossary_terms_in_passage(chunk_id)` | `glossary.ts` | Glossary terms in a passage with definitions | 3b |
| `get_content_coverage(theme_slug)` | `themes.ts` | Passage count, book distribution, tone distribution per theme | 3b |
| `verify_citation(book_slug, chapter, page)` | `citations.ts` | Confirm a quote exists in the corpus | 3b |
| `get_pending_reviews(queue_type, limit)` | `queue.ts` | Items awaiting human review in a specific queue | 3b |
| `get_daily_passage(language, exclude_id)` | `daily.ts` | Random passage from curated pool | 3b |
| `get_cross_book_connections(chunk_id)` | `relations.ts` | Related passages from other books | 3c |
| `get_person_context(person_slug)` | `people.ts` | Biography, lineage position, key mentioning passages | 3c |
| `get_graph_neighborhood(node_id, depth, types[])` | `graph.ts` | Subgraph around any node, filtered by node/edge type | 3d |
| `get_search_trends(period, min_count)` | `analytics.ts` | Anonymized aggregated query themes (DELTA-compliant) | 3d |
| `find_concept_path(source_slug, target_slug)` | `graph.ts` | Shortest ontological path between two concepts | STG-020+ |
| `get_passage_translations(canonical_chunk_id)` | `translations.ts` | All language variants of a passage | 5b |

**Internal MCP use cases by consumer:**

| Consumer | Primary Tools | Stage |
|---|---|---|
| Theme tag proposal AI | `get_similar_passages`, `get_content_coverage`, `get_graph_neighborhood` | 3b, 3d |
| Guide pathway generation AI | `search_corpus`, `search_references`, `get_vocabulary_bridge`, `find_concept_path` | 3b, STG-020+ |
| Ingestion QA AI | `get_chunk_with_context`, `verify_citation` | 3b |
| Translation review AI | `get_passage_translations`, `get_glossary_terms_in_passage` | 5b |
| Reading thread drafting AI | `get_cross_book_connections`, `get_graph_neighborhood`, `find_concept_path` | 3c, 3d, STG-020+ |
| Social media caption AI | `search_corpus`, `get_book_metadata`, `get_theme_metadata` | 5a |
| Impact narrative AI | `get_search_trends`, `get_graph_neighborhood` | 3d |
| SRF mobile app | `search_corpus`, `get_daily_passage`, `get_graph_neighborhood`, `get_person_context` | TBD (stakeholder) |
| Admin portal AI features | `get_pending_reviews`, `get_content_coverage`, `get_search_trends` | 4, 6 |

#### Tier 3: External (STG-020+)

Rate-limited access for third-party AI assistants (ChatGPT, Claude, Gemini, custom agents). Exposes a content-serving subset (no admin/editorial tools). Every response wrapped in fidelity metadata.

**Available tools:** `search_corpus`, `search_by_theme`, `get_book_metadata`, `get_theme_metadata`, `get_glossary_terms_in_passage`, `get_graph_neighborhood`, `find_concept_path`, `get_person_context`, `get_daily_passage`, `verify_citation`.

**Not available externally:** `get_pending_reviews`, `get_search_trends`, `get_content_coverage`, `get_similar_passages`, `get_chunk_with_context`, `get_passage_translations`.

**Fidelity metadata envelope:**

```jsonc
{
  "passages": [
    {
      "text": "Verbatim passage text...",
      "citation": {
        "book": "Autobiography of a Yogi",
        "chapter": 12,
        "chapter_title": "Years in My Master's Hermitage",
        "page": 142
      },
      "context_url": "/books/autobiography-of-a-yogi/12#chunk-uuid",
      "themes": ["Peace", "Meditation"]
    }
  ],
  "fidelity": {
    "source": "Self-Realization Fellowship",
    "portal": "teachings.yogananda.org",
    "presentation": "verbatim_only",
    "paraphrase_permitted": false,
    "attribution_required": true,
    "attribution_format": "{book}, Chapter {chapter}, p. {page}",
    "context_url_purpose": "Full chapter context — present to user alongside quote"
  }
}
```

The `fidelity` object is a moral signal, not a technical enforcement — analogous to Creative Commons metadata. The `context_url` ensures seekers always have one click to the full, unmediated portal.

**Rate limiting:** Same Vercel Firewall + application-level tiering as HTTP API (FTR-097). Registered consumers (fidelity contract acknowledged) receive higher limits. Unregistered consumers receive anonymous web crawler limits (FTR-059).

**Access governance:** Stakeholder decision (CONTEXT.md). Recommendation: registered access — clients receive an API key upon acknowledging the fidelity contract, balancing reach with accountability.

### Knowledge Graph as MCP Surface

The Knowledge Graph (FTR-035) answers structural queries that text search cannot:

| Query Type | Tool | What It Returns |
|---|---|---|
| "How does meditation relate to concentration?" | `get_graph_neighborhood("meditation", 2, ["theme", "concept"])` | Structural relationships between concepts |
| "What is the path from pranayama to samadhi?" | `find_concept_path("pranayama", "samadhi")` | Ontological steps with a representative passage at each |
| "Who is Lahiri Mahasaya?" | `get_person_context("lahiri-mahasaya")` | Biography, lineage position, key passages |
| "What themes cluster around grief?" | `get_graph_neighborhood("grief", 2, ["theme"])` | Related themes and their connection types |

These structural queries are the portal's unique offering via MCP — no other digital representation of Yogananda's teachings encodes relational structure. The graph API (`/api/v1/graph/subgraph`) serves the web client; MCP tools serve AI consumers needing the same relational data in a different access pattern.

### MCP Tool Interface Contract

All MCP tools across all three tiers follow a shared interface contract. This ensures consistency for AI consumers that may graduate from Tier 1 (development) to Tier 2 (internal) or encounter Tier 3 (external) — the tool naming and response shape remain predictable.

**Naming convention:** `snake_case` verbs: `search_corpus`, `get_book_metadata`, `verify_citation`. Prefix indicates action: `search_*` (query-based retrieval), `get_*` (ID-based lookup), `verify_*` (boolean validation), `find_*` (graph traversal).

**Parameter naming:** `snake_case`, matching the API response convention (FTR-088). Common parameters: `language` (ISO 639-1, default `'en'`), `limit` (positive integer), `chunk_id` / `book_slug` / `theme_slug` (resource identifier matching the type conventions in FTR-088).

**Response shape:** MCP tools return the same shape as their corresponding HTTP API endpoints (when one exists), plus tier-specific metadata:

```jsonc
{
  // For Tier 3 only: fidelity metadata envelope wraps the response
  "fidelity": { ... },
  // The response body matches the HTTP API equivalent
  "data": [...],
  "meta": { ... }
}
```

Tier 1 and Tier 2 tools return raw service-layer output (matching the HTTP API shape). Tier 3 tools wrap the output in the fidelity envelope. This means a tool like `search_corpus` returns the same `data` array as `GET /api/v1/search`, with identical field names and structure.

**Error shape:** MCP tools return errors using the same `error` / `message` / `request_id` structure as the HTTP API error contract (FTR-015). The compassionate error messaging applies equally — an AI consumer's end user may see these messages.

### MCP Service File

`/lib/mcp/` directory:
- `server.ts` — MCP server setup, tier routing, authentication
- `tools/corpus.ts` — search, theme, reference, vocabulary bridge tools
- `tools/editorial.ts` — internal editorial tools (Tier 2 only)
- `tools/graph.ts` — Knowledge Graph traversal tools
- `tools/people.ts` — Spiritual Figures tools
- `tools/fidelity.ts` — fidelity metadata envelope wrapper (Tier 3)

All tools delegate to `/lib/services/` — zero business logic in the MCP layer.

## Notes

**Provenance:** FTR-083 + FTR-083 → FTR-083
