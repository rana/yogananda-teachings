---
ftr: 94
title: Neon Platform Governance
summary: "Neon Scale tier governance for PostgreSQL version, compute sizing, branching, and extensions"
state: implemented
domain: operations
governed-by: [PRI-10, PRI-12]
depends-on: [FTR-104]
---

# FTR-094: Neon Platform Governance

## Rationale

- **Status:** Accepted
- **Date:** 2026-02-25

### Context

The portal uses Neon Serverless Postgres as its single database (FTR-104). Prior to this decision, Neon-specific platform capabilities were referenced throughout the documentation without a central governance ADR. Compute configuration, tier selection, branching strategy, extension management, and database observability were implicit or distributed across FTR-101, FTR-109, FTR-081, and design files (FTR-021, FTR-095, etc.).

A comprehensive audit of Neon's feature catalog against our design documents revealed:

1. **Tier-gated features.** Several capabilities critical to production readiness (30-day PITR, protected branches, OpenTelemetry export, configurable autosuspend) are only available on paid tiers.
2. **Missing extensions.** `pg_stat_statements` (query performance) was not in the first migration despite clear STG-001 value.
3. **No compute governance.** No ADR specified compute sizing per environment, autosuspend policy, or scaling strategy.
4. **No branch lifecycle policy.** Branch naming, TTL auto-expiry, and the distinction between persistent and ephemeral branches were undocumented.
5. **No database observability.** The observability strategy (FTR-082) covered application monitoring but not database-level metrics.

### Decision

Establish **Neon Scale tier with PostgreSQL 18** as the project's database platform from STG-001, with explicit governance for PostgreSQL version, compute, branching, extensions, and observability.

#### PostgreSQL Version: 18

| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL 18** (chosen) | Upstream stable since Sept 2025; UUIDv7, skip scan, virtual generated columns, parallel GIN builds, `casefold()`, Unicode 16.0.0; avoids future major version upgrade; patches through ~2030 (FTR-004) | Neon designates as "preview" (Feb 2026); async I/O disabled on Neon (`io_method = 'sync'`) |
| PostgreSQL 17 | Neon "stable" designation; fully validated platform features | Older; requires major version upgrade later; misses UUIDv7, skip scan, virtual columns; patches through ~2029 |

**Why PG18:** The portal launches late 2026. Neon will almost certainly exit PG18 preview well before launch — PG18 has been upstream stable for 5 months (since Sept 25, 2025). Starting on PG18 avoids a future major version upgrade. The 10-year design horizon (FTR-004) favors the newer major version.

**PG18 features leveraged:**

| Feature | Milestone | Benefit |
|---------|-----------|---------|
| `uuidv7()` | 1a+ | Time-ordered UUIDs for all content tables. Better B-tree index locality than `gen_random_uuid()`. Natural chronological ordering without separate timestamp indexes. |
| Skip scan on B-tree indexes | 1a+ | Composite `(updated_at, id)` indexes (FTR-087) become usable for id-only queries. |
| Parallel GIN index creation | 1a+ | Speeds pg_search/ParadeDB BM25 index builds during ingestion. |
| Enhanced `RETURNING` (OLD/NEW) | 1a+ | Simplifies ingestion pipeline upsert logic and `book_chunks_archive` pattern. |
| `EXPLAIN ANALYZE` with BUFFERS | 1a+ | Included by default, complementing pg_stat_statements observability (this ADR). |
| Data checksums by default | 1a+ | Enabled automatically for new Neon projects. |
| Unicode 16.0.0 | 1a+ | Improved case mapping for Sanskrit/Hindi diacritics (FTR-131). |
| Virtual generated columns | 1c+ | Compute values at read time without storage overhead. Evaluate for normalized search text. |
| `casefold()` | 1c+ | Unicode-aware case-insensitive matching. Evaluate for Sanskrit term normalization. |
| `COPY REJECT_LIMIT` | STG-001-4 | Error-tolerant bulk ingestion. Evaluate for PDF import pipeline. |
| `WITHOUT OVERLAPS` temporal constraints | 2a+ | Evaluate for daily passage scheduling, event scheduling. |
| `array_sort()` / `array_reverse()` | 2a+ | Tag array processing for teaching topics and entity aliases. |
| Async I/O | Neon-gated | Neon runs `io_method = 'sync'` during preview. Benefit arrives when Neon enables it — no code changes needed. |

**Schema convention — UUIDv7:** All table primary keys use `DEFAULT uuidv7()` instead of `gen_random_uuid()`. UUIDv7 embeds a millisecond-precision timestamp, providing natural chronological ordering and significantly better B-tree index locality (reduced page splitting on INSERT). The embedded timestamp is not sensitive — all content tables already carry explicit `created_at`/`updated_at` columns.

**Platform config parameter:** Neon project specifies `postgres_version = "18"` explicitly. Never rely on Neon's default version.

**Verification gate (Deliverable STG-001-2):** After platform provisioning, verify all 5 required extensions (pgvector, pg_search, pg_trgm, unaccent, pg_stat_statements) install correctly on Neon PG18. If any extension fails, fallback: recreate on PG17 with no code changes required (only platform `postgres_version` parameter changes).

#### Tier Selection: Scale

| Capability | Free | Launch | **Scale** (chosen) |
|-----------|------|--------|-------------------|
| PITR window | 6 hours | 7 days | **30 days** |
| Protected branches | — | 2 | **5** |
| Monitoring retention | 1 day | 3 days | **14 days** |
| OpenTelemetry export | — | — | **Included** |
| Max compute (autoscaling) | 2 CU | 16 CU | **16 CU** |
| Max compute (fixed) | 2 CU | 16 CU | **56 CU** |
| Branches included | 10 | 10 | **25** |
| Snapshots | 1 | 10 | **10** |
| IP Allow | — | — | **Included** |
| SOC 2 / ISO 27001 | — | — | **Included** |
| SLA | — | — | **Included** |

**Why Scale over Launch:** The 30-day PITR window, OpenTelemetry export, 14-day monitoring retention, and compliance certifications are worth the incremental cost for a production portal serving sacred content. The SLA provides operational confidence. Cost: ~$20/month baseline (autoscaling from 0.25 CU, pay only for active compute hours).

#### Compute Configuration by Environment

| Environment | Min CU | Max CU | Autosuspend | Protected | Notes |
|-------------|--------|--------|-------------|-----------|-------|
| **Production** | 0.5 | 4 | 300s (5 min) | Yes | Never scales to zero instantly; avoids cold-start on first seeker query |
| **Staging** | 0.25 | 2 | 60s | No | Lower baseline; faster suspend for cost efficiency |
| **Dev** | 0.25 | 2 | 0s (immediate) | No | Scales to zero when idle; developer pays nothing overnight |
| **CI test branches** | 0.25 | 1 | 0s | No | Ephemeral; auto-deleted via TTL |
| **PR preview branches** | 0.25 | 1 | 60s | No | Persists for PR lifetime; TTL: 7 days |

*Parameter — default values above, evaluate: STG-003 traffic patterns (FTR-012).*

#### Branch Lifecycle Policy

| Branch Type | Naming | TTL | Created By | Deleted By |
|-------------|--------|-----|------------|------------|
| **Production** | `production` | Permanent | Platform MCP | Never (protected) |
| **Staging** | `staging` | Permanent | Platform MCP | Never |
| **Dev** | `dev` | Permanent | Platform MCP | Manual |
| **CI test** | `ci-{run_id}` | 1 hour | GitHub Actions | Auto (TTL) or CI cleanup step |
| **PR preview** | `pr-{number}` | 7 days | GitHub Actions | Auto (TTL) or on PR close |
| **Migration test** | `migrate-{date}` | 2 hours | Manual / CI | Auto (TTL) |
| **Restore test** | `restore-{date}` | 24 hours | Manual | Auto (TTL) |

All ephemeral branches use TTL to guarantee cleanup. The 25-branch included allocation (Scale tier) comfortably handles typical concurrent PR + CI usage. Additional branches at $1.50/month each if needed.

#### Extension Governance

Extensions enabled in the first migration (`001_initial_schema.sql`):

| Extension | Purpose | Milestone | Governing ADR |
|-----------|---------|-----------|---------------|
| `vector` (pgvector) | Dense vector search (HNSW) | 1a+ | FTR-101 |
| `pg_search` (ParadeDB) | BM25 full-text search | 1a+ | FTR-025 |
| `pg_trgm` | Trigram fuzzy matching for suggestions | 1a+ | FTR-029 |
| `unaccent` | Diacritics-insensitive search | 1a+ | FTR-131 |
| `pg_stat_statements` | Query performance monitoring | 1a+ | This ADR |

**Future extensions** (evaluate at milestone boundaries):

| Extension | Purpose | Evaluate At | Notes |
|-----------|---------|-------------|-------|
| `hypopg` | Virtual index testing (hypothetical indexes visible only to planner) | Now (dev branches) | Zero risk — indexes exist only in planner memory. Useful for prototyping HNSW parameter changes, pg_search BM25 indexes, and ontology table indexes without build cost. `CREATE EXTENSION IF NOT EXISTS hypopg` on dev/migration branches. |
| `pg_prewarm` | Buffer cache prewarming after compute wake-up | STG-006 | Addresses cold-start latency after autosuspend (production 300s). Preloads HNSW index, GIN index, and core search tables into shared buffers. Pair with `pg_cron` (FTR-115) for automatic prewarming. Directly serves PRI-05 (Global-First) — seekers shouldn't pay cold-cache latency. |
| `pg_cron` | In-database scheduled jobs | STG-006 | Only useful with always-on compute; may replace some Lambda cron jobs. See FTR-115. |
| `pg_tiktoken` | Token counting for chunk pipeline | Deferred | Uses OpenAI tokenizer (cl100k_base), not Voyage/Claude tokenizers. Evaluate when Anthropic/Bedrock provides accurate token counting. |
| `pg_jsonschema` | JSONB column schema validation | STG-007 | Validate `entities`, `cross_references`, `metadata` columns on `book_chunks` and ontology JSONB. Re-evaluate when ontology tables (FTR-034) ship. Application-layer validation may suffice. |
| `pgrag` | RAG utilities | Deferred | Evaluate whether it simplifies the retrieval pipeline. Custom pipeline likely sufficient. |

**Extension addition policy:** New extensions require an ADR amendment or new ADR referencing this governance section. Extensions must be tested on a migration branch before production.

#### Database Observability

**Built-in monitoring (Scale tier, 14-day retention):**
- RAM, CPU, connection count, deadlocks, rows (insert/update/delete), replication delay, local file cache hit rate, working set size

**pg_stat_statements (installed from STG-001):**
- Top queries by frequency and average duration
- Query plan changes after index modifications
- Performance regression detection after migrations
- **Caveat:** Stats reset on compute suspend/restart. For production (300s autosuspend), this is acceptable — most sessions are long enough to accumulate meaningful data.

**OpenTelemetry export (Scale tier, STG-004+):**
- Export database metrics and Postgres logs to the observability stack (Sentry, New Relic, or Grafana)
- Complements application-level observability (FTR-082) with database-level visibility
- Enables alerts on: connection pool saturation, cache miss rate spikes, replication lag, query duration regressions

### Multi-Region Readiness

Neon is the portal's database provider for the long term. The project plans to grow with Neon as its multi-region capabilities mature.

**Current state (2026-02):** Neon read replicas are same-region only. The portal uses a single-region origin in `us-west-2` with global edge distribution via Vercel CDN. Pure hybrid search (FTR-027) achieves search p95 < 500ms from any continent without multi-region database infrastructure (see FTR-111 § Regional Latency Targets).

**When Neon ships cross-region read replicas:**
- Activate replicas in `ap-south-1` (Mumbai) and `eu-central-1` (Frankfurt) via Platform MCP
- Route search API read queries to the nearest replica; writes to the primary
- Expected improvement: South Asia search latency drops from ~300ms to ~150ms
- This is a platform configuration change — no application code changes

**Why Neon, long-term:** Neon's Scale tier, PostgreSQL 18, branching workflow, pgvector + pg_search extension ecosystem, scale-to-zero economics, and developer velocity are the right fit for this project. The single-database architecture (FTR-104) depends on PostgreSQL's extension ecosystem — pgvector, pg_search/ParadeDB, pg_trgm, unaccent, pg_stat_statements — which Neon supports fully. No alternative database (Turso, Aurora DSQL, PlanetScale) provides equivalent single-database hybrid search capability. See FTR-111 § Alternatives Evaluated for the Turso evaluation.

### Rationale

- **Production readiness from day one.** Scale tier's 30-day PITR, protected branches, and SLA provide the safety net appropriate for a portal serving sacred content.
- **Cost-proportionate.** ~$20/month baseline for Scale tier is negligible for a philanthropist-funded project. Compute autoscaling means costs track actual usage.
- **Observability completeness.** Application monitoring (FTR-082) without database monitoring is like monitoring a car's dashboard but not the engine. `pg_stat_statements` + OTLP export close this gap.
- **Branch discipline.** TTL auto-expiry eliminates orphaned branches — a common operational headache. Named conventions make branches discoverable in the Neon Console.
- **Extension discipline.** Centralizing extension governance prevents sprawl and ensures every extension has a documented purpose and governing ADR.

#### API Key Scoping Policy

Neon offers three API key types (Personal, Organization, Project-scoped). The portal uses scoped keys to enforce least privilege across management contexts.

| Context | Key Type | GitHub Secret Name | Scope | Rationale |
|---------|----------|-------------------|-------|-----------|
| **Platform MCP** | Organization API key | `NEON_API_KEY` | All org projects | Platform MCP creates/deletes projects — requires org-level access |
| **CI branch ops** (`neon-branch.yml`, `neon-cleanup.yml`) | Project-scoped key | `NEON_PROJECT_API_KEY` | Single project | Can create/delete branches; cannot delete the project |
| **Claude Code / MCP** (development) | Project-scoped key | local `.env` | Single project | Interactive operations; least privilege for exploratory work |

**Key lifecycle:** Organization key created once during bootstrap (manual, store in password manager + GitHub secret). Project-scoped keys created after Platform MCP provisions the Neon project — either via Neon Console or `neonctl api-keys create --project-id`. Secret token displayed only once; store immediately. Revocation is immediate and permanent.

**Limitation:** Neon does not offer granular RBAC within a key scope. A project-scoped key can perform all operations on that project except deletion. No finer-grained permissions are available (e.g., "branches only" or "read-only"). This is acceptable for the portal's single-project architecture.

#### Platform MCP Governance

Neon infrastructure is managed via Platform MCP (FTR-106), which uses the Neon REST API directly. This avoids the dependency on community-maintained Terraform providers and provides the AI operator with direct programmatic access (PRI-12).

- **API version tracking.** Monitor Neon API changelog for breaking changes. Platform MCP abstracts API calls, so version changes are isolated to the platform layer.
- **Fallback:** `neonctl` CLI or direct `curl` to the Neon REST API. All Neon operations are API-accessible (see FTR-095 § Three-Layer Neon Management Model).

### Consequences

- Neon project created as PostgreSQL 18, Scale tier from STG-001 (`postgres_version = "18"` in platform config)
- All table primary keys use `uuidv7()` — schema convention for time-ordered UUIDs
- Production branch protected; compute configuration applied per environment
- 5 extensions verified on PG18 in first migration (vector, pg_search, pg_trgm, unaccent, pg_stat_statements)
- Branch naming convention and TTL policy enforced in CI scripts
- `pg_stat_statements` data informs search query optimization from STG-001
- OpenTelemetry export configured during STG-004 observability setup
- Snapshot schedule configured during Milestone STG-001-2 via Neon API (FTR-109)
- API keys scoped per context: org key for Platform MCP, project-scoped keys for CI and development
- Platform MCP uses Neon REST API directly; no community provider dependency
- **Extends FTR-101** (pgvector), **FTR-109** (backup), **FTR-081** (testing), **FTR-082** (observability)
- `design/search/FTR-021-data-model.md` schema updated to include all 5 extensions and `uuidv7()` convention
- `design/search/FTR-095-infrastructure-and-deployment.md` updated with Three-Layer Neon Management Model (Infrastructure / Operations / Data)
- ROADMAP.md cost model updated to reflect Scale tier pricing

## Notes

**Provenance:** FTR-094 → FTR-094

FTR-094 (Time Travel Queries) was adopted into this ADR.
