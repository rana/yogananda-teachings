---
ftr: 101
title: Neon + pgvector for Vector Search
summary: "Neon PostgreSQL with pgvector extension for semantic similarity search on corpus embeddings"
state: implemented
domain: foundation
governed-by: [PRI-10]
---

# FTR-101: Neon + pgvector for Vector Search

## Rationale

### Context

The Intelligent Query Tool requires semantic (vector) search to find thematically relevant passages even when the user's wording differs from Yogananda's. Options evaluated:

| Option | Pros | Cons |
|--------|------|------|
| **Neon + pgvector** | Already in SRF stack; vector + FTS + relational in one DB; Scale tier provides 30-day PITR, protected branches, OTLP export; no vendor sprawl | Not a purpose-built vector DB; HNSW index tuning required |
| **Pinecone** | Purpose-built vector search; managed; fast | New vendor; no relational data; no FTS; cost at scale; sync complexity |
| **Weaviate / Qdrant** | Strong vector search; hybrid search built-in | New vendor; operational overhead if self-hosted; overkill for corpus size |

### Decision

Use **Neon PostgreSQL** with the **pgvector** extension for vector search.

### Rationale

- The corpus is ~50,000 chunks at full scale — well within pgvector's performance envelope
- A single database for relational data, full-text search, AND vector search eliminates sync complexity
- Neon is already in the SRF tech stack (Tech Stack Brief § 3)
- Scale tier provides the governance features we need: PITR, protected branches, OTLP export, 4 CU compute

### Consequences

- Vector search, FTS, and relational queries all in one database — no multi-service sync
- HNSW index parameters need tuning for the corpus: `m=16, ef_construction=64` (start conservative, benchmark)
- Neon's connection pooler (PgBouncer) supports prepared statements in transaction mode — compatible with pgvector queries
- If vector search performance ever exceeds pgvector's capacity (unlikely at this corpus size), a dedicated vector DB can be added as a secondary index — the service layer abstracts the search backend
