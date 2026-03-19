---
ftr: 4
title: "Architecture Longevity — 10-Year Design Horizon"
summary: "Three-tier durability model: permanent foundations, replaceable platforms, and disposable tools"
state: approved-foundational
domain: foundation
governed-by: [PRI-10]
always-load: true
---

# FTR-004: Architecture Longevity

## Rationale

- **Date:** 2026-02-17

### Context

The teaching portal serves Yogananda's published works — content that is timeless. The portal itself should be designed for a decade of service. This doesn't mean nothing changes; it means nothing needs to be thrown away and rebuilt from scratch. Every component should be replaceable incrementally.

This ADR documents the longevity analysis and the specific design choices that protect the portal's long-term viability.

### Decision

Design for **graceful evolution** over a 10-year horizon. The architecture prioritizes durable formats and replaceable components.

#### Durability Tiers

**Tier 1 — Effectively Permanent (10+ years, no migration expected):**

| Component | Why It Lasts |
|-----------|-------------|
| PostgreSQL (Neon) | 35+ years old. Industry standard. Growing adoption. |
| SQL migrations (dbmate) | Raw SQL. No framework dependency. A 2026 migration runs in 2036. |
| The data model (books, chapters, chunks, themes, places) | The content is Yogananda's published works. The schema models reality. |
| REST + JSON APIs | HTTP is the internet's substrate. 20+ years dominant. |
| HTML + CSS | The web platform is permanent. Semantic HTML from 2026 renders in 2036. |
| Terraform HCL | Since 2014. Massive enterprise adoption. OpenTofu fork as insurance. |
| FTR files (`features/`) | Markdown in Git. The most durable artifact in the project. |
| WCAG accessibility standards | 2.1 stable since 2018. 3.0 is backwards-compatible. |

**Tier 2 — Stable, May Need Version Upgrades (5-7 years):**

| Component | Risk | Mitigation |
|-----------|------|------------|
| pgvector | Extension is PostgreSQL-native. Strong momentum. | Standard float arrays. No proprietary format. |
| Embedding models | AI model landscape evolving rapidly. | `embedding_model` column tracks which model generated each vector. Incremental re-embedding. (FTR-024) |
| next-intl | Popular i18n library for Next.js. | Locale JSON files are framework-agnostic. The files survive even if the library changes. |

**Tier 3 — Expect Replacement in 5-10 Years:**

| Component | Risk | Mitigation |
|-----------|------|------------|
| Next.js | JS framework churn cycle: 5-7 years. | Shared service layer (FTR-015). Business logic in `/lib/services/` has zero framework dependency. UI rewrite against same APIs. |
| Vercel | Platform risk. Pricing changes. Acquisition. | Next.js deploys to any Node.js host. Vercel-specific features (ISR, Edge) have equivalents elsewhere. |
| Contentful | CMS market volatility. Pricing increases. | Content synced to Neon. Search index doesn't depend on Contentful availability. Swap CMS, rebuild webhook sync. |
| Auth0 | Acquired by Okta. Pricing trajectory. | Standard OAuth 2.0 / OIDC. Any identity provider implements the same protocols. |
| Claude API | Anthropic's product direction. AI market evolution. | Stateless usage (query expansion, passage ranking). Prompts in service layer. Swap to any LLM. |
| Amplitude | Analytics tool churn. | DELTA allowlist = ~5 events. Trivial to migrate to any analytics tool. |

#### The Five Longevity Guarantees

1. **All data in PostgreSQL.** Nothing lives exclusively in a SaaS tool. Contentful syncs *to* Neon. Amplitude receives *from* the app. If any SaaS tool disappears, the data is in PostgreSQL.

2. **Business logic is framework-agnostic.** `/lib/services/` is pure TypeScript. No Next.js imports. No Vercel imports. A framework migration rewrites the UI layer (~40% of code), not the business logic (~60%).

3. **Raw SQL migrations.** dbmate migrations are `.sql` files that don't depend on an ORM version, a TypeScript compiler version, or a framework version. They outlive everything else in the codebase.

4. **Standard protocols, not proprietary integrations.** OAuth 2.0 for auth. REST + JSON for APIs. SQL for data. HTTP for communication. `hreflang` for i18n. Every integration uses industry standards, not vendor-specific SDKs, at the boundary layer.

5. **Decisions are documented.** ADRs capture *why* every choice was made. When a future team evaluates replacing a component, they understand the original constraints and can make an informed decision rather than guessing.

#### Content Export Capability

The portal can export its entire content graph at any time via standard PostgreSQL tools:

```bash
# Full data export
pg_dump --format=custom --no-owner portal_db > portal_export.dump

# Restore to any PostgreSQL instance
pg_restore --no-owner -d new_portal_db portal_export.dump
```

This is inherent in using PostgreSQL — not a feature to build, but a capability to document and protect. The export includes all books, chapters, chunks, embeddings, themes, places, passage cross-references, and subscriber data.

### Rationale

- **The content is permanent.** Yogananda's published works don't change. A portal that makes them accessible should outlive any single technology trend.
- **SRF institutional continuity.** SRF has existed since 1920. The portal should be designed for an organization that thinks in decades, not quarters.
- **Total cost of ownership.** A 10-year architecture that evolves incrementally costs far less than a 5-year architecture that requires a ground-up rewrite.
- **The service layer is the key insight.** Most web applications that "don't last" failed because business logic was embedded in a framework that became obsolete. The shared service layer (FTR-015) is the single most important longevity decision — it separates what endures (logic) from what changes (presentation).

### Consequences

- All architectural decisions are evaluated against a 10-year horizon, not just immediate needs
- The shared service layer convention (FTR-015) is treated as the project's most important structural rule
- Component replacement is expected and planned for — it's maintenance, not failure
- The search quality test suite (deliverable STG-001-8) serves as the acceptance gate for any AI model migration
- Future developers can replace any Tier 3 component without touching Tier 1 or Tier 2 components
- `pg_dump` export capability is documented as a deliberate architectural feature

## Specification

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

The shared service layer (FTR-015) is pure TypeScript with no Next.js dependency. If SRF ever migrates away from Next.js:
- `/lib/services/` — portable, zero framework dependency
- `/app/` (Server Components, Route Handlers) — framework-specific, would be rewritten
- `/migrations/` — portable, raw SQL
- Contentful webhook sync — portable, standard HTTP handler

The business logic (search, passage retrieval, theme queries) survives a framework change. Only the presentation layer is coupled.

### Data Portability

All content lives in Neon (PostgreSQL) — standard SQL, exportable via `pg_dump`. Embeddings in pgvector use standard float arrays. No vendor-specific data formats. Contentful content is exportable via their API. There is no vendor lock-in on content.

### Documentation as Longevity Tool

The FTR documentation convention is the most undervalued longevity tool. When a future developer asks "why didn't we use GraphQL?" or "why not embed Google Maps?" — the answer is recorded with full context. This prevents teams from revisiting settled decisions and accidentally undoing architectural choices that had good reasons.

### FTR-004: 10-Year Horizon

The architecture is designed so that **nothing needs to be thrown away and rebuilt from scratch.** Every component can be replaced incrementally. The most valuable artifacts (data, logic, decisions) are in the most durable formats.

| Horizon | What Holds | What May Change |
|---------|-----------|-----------------|
| **3 years (2029)** | Everything. Minor dependency upgrades. | Library versions. |
| **5 years (2031)** | Core data model, service layer, migrations, ADRs. | Embedding model (swap via FTR-024). Possibly CMS or auth provider. |
| **7 years (2033)** | Database, APIs, platform config, service functions. | Next.js may be superseded. UI layer rewrite against same APIs. |
| **10 years (2036)** | PostgreSQL schema, SQL migrations, service logic, ADRs. | UI framework, some SaaS integrations will have evolved. |

**The five longevity guarantees:**

1. **All data in PostgreSQL.** Nothing lives exclusively in a SaaS tool.
2. **Business logic is framework-agnostic.** `/lib/services/` is pure TypeScript.
3. **Raw SQL migrations.** dbmate `.sql` files don't depend on any framework version.
4. **Standard protocols at boundaries.** OAuth 2.0, REST + JSON, SQL, HTTP, `hreflang`.
5. **Decisions are documented.** ADRs capture *why* every choice was made.

### FTR-024: Embedding Model Migration

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
