---
ftr: 104
title: Single Database Architecture
state: approved
domain: foundation
arc: 1+
governed-by: [PRI-10]
---

# FTR-104: Single Database Architecture

## Rationale

### Context

SRF's standard database is DynamoDB (single-table design). The portal requires:
1. Vector similarity search (pgvector)
2. Full-text search with linguistic awareness (pg_search / ParadeDB)
3. Relational queries (book → chapter → section → chunk)
4. Knowledge graph queries (recursive CTEs)
5. Geographic queries (PostGIS, for center/ashram finder if needed)

DynamoDB supports none of these natively. The question: use DynamoDB (aligned) with external search services, or consolidate into PostgreSQL?

### Decision

Use **Neon PostgreSQL as the single database** for all data: content, search indexes, embeddings, relations, and operational data. No DynamoDB.

### Rationale

- **One database, five capabilities.** pgvector (vectors), pg_search (BM25 FTS), relational (foreign keys), recursive CTEs (graph), and PostGIS (geo) — all in one database. No sync between services.
- **Operational simplicity.** One connection string, one backup strategy (FTR-109), one migration tool (dbmate), one monitoring surface.
- **Cost.** Neon Scale tier: ~$69/month for all of this. DynamoDB + Pinecone + Elasticsearch would be 3× the cost with 3× the operational surface.
- **SRF alignment is about patterns, not specific tools.** DynamoDB is the right choice for SRF's e-commerce and member systems (high write throughput, predictable key-value access). It's the wrong choice for a search-and-reading portal. This is the same principled divergence pattern as Next.js vs. custom frontend.

### Consequences

- All migrations in `/migrations/` — raw SQL via dbmate
- Single connection string per environment
- pgvector HNSW index for vector search
- pg_search (ParadeDB) for BM25 full-text search
- No DynamoDB dependency — simplifies AWS footprint
- **Extends FTR-004** (10-year horizon) — PostgreSQL is Tier 1 infrastructure. Neon is Tier 2 (the managed service layer). If Neon disappears, the database migrates to any PostgreSQL host.
