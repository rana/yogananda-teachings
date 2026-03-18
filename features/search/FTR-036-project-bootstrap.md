---
ftr: 36
title: Project Bootstrap
summary: "Reproducible bootstrap ceremony from zero to working search including provisioning, migration, and ingestion"
state: implemented
domain: search
governed-by: [PRI-10, PRI-12]
---

# FTR-036: Project Bootstrap

## Rationale

### Context

The portal's architecture is thoroughly documented across root documents (CLAUDE.md, PRINCIPLES.md, CONTEXT.md, ROADMAP.md) and FTR files in `features/`, but the path from "no code" to "running system" was undocumented. The first developer experience — creating the repository, provisioning infrastructure, running the first migration, ingesting the first book, and verifying search works — is a critical ceremony that, if not specified, leads to inconsistent environments and wasted time.

### Decision

Document the bootstrap sequence as a reproducible, ordered ceremony. The ceremony covers:

1. **Repository creation** — Next.js + TypeScript + Tailwind + pnpm
2. **Neon project provisioning** — PostgreSQL with pgvector, dev branch for local work
3. **Schema migration** — dbmate applies `001_initial_schema.sql` (all tables, indexes, functions, triggers)
4. **Vercel deployment** — Link repo, set environment variables, verify health check
5. **Sentry configuration** — Error tracking with source maps
6. **First content ingestion** — Autobiography of a Yogi: PDF -> chunks -> embeddings -> relations
7. **Smoke test** — Search "How do I overcome fear?" returns relevant passages with citations

The `.env.example` file documents all required environment variables with comments explaining each.

### Rationale

- **Reproducibility.** Any developer (or AI assistant) should be able to go from zero to working search in a single session by following the ceremony.
- **Environment parity.** Explicit variable documentation prevents "works on my machine" drift.
- **10-year horizon (FTR-004).** The bootstrap ceremony is a durable artifact — it outlives any individual contributor's tribal knowledge.
- **Design-to-implementation bridge.** The root documents and FTR files describe *what* the system does. The bootstrap ceremony describes *how to bring it into existence*.

### Consequences

- This FTR captures the step-by-step ceremony and `.env.example` contents
- First-time setup is documented and reproducible
- Onboarding new developers or AI assistants requires reading CLAUDE.md (for context) and following the bootstrap ceremony (for setup)

## Specification

**Status: Implemented** — see `migrations/001_initial_schema.sql`, `scripts/book-ingest/`, `lib/services/`, `app/api/v1/`

The path from "no code" to "running search" — the ceremony that transforms design documents into a working system.

### Environment Setup

```
1. Repository
 └── pnpm create next-app@latest srf-teachings --typescript --tailwind --app
 └── pnpm add @neondatabase/serverless @anthropic-ai/sdk voyageai
 └── Copy .env.example → .env.local (see below)

2. Neon Project
 └── Create project in Neon Console (or via MCP)
 └── Enable pgvector extension
 └── Note: connection string (pooled), direct connection string
 └── Create dev branch for local development

3. Database Schema
 └── pnpm add -D dbmate
 └── dbmate up (runs /migrations/001_initial_schema.sql)
 └── Verify: tables, indexes, BM25 index (pg_search), entity_registry

4. Vercel Project
 └── Link repo → Vercel
 └── Set environment variables (see below)
 └── First deploy: verify /api/v1/health returns OK

5. Sentry Project
 └── Create project in Sentry
 └── Configure NEXT_PUBLIC_SENTRY_DSN
 └── Verify error capture with test exception

6. First Content
 └── Run ingestion script (M1a-4)
 └── Verify: pnpm run ingest -- --book autobiography
 └── Check: book_chunks populated, embeddings present
 └── Run: pnpm run relations -- --full
 └── Smoke test: search "How do I overcome fear?" returns results
```

### Environment Variables

See FTR-095 § Environment Configuration for the canonical `.env.example`, named constants (`/lib/config.ts`), CI-only secrets, and developer tooling configuration. That section is the single source of truth for all environment variables.

**Milestone 1a minimum viable `.env.local`** (the subset needed before Contentful is connected):

```bash
NEON_DATABASE_URL=               # From Neon MCP → get_connection_string (pooled)
NEON_DATABASE_URL_DIRECT=        # From Neon MCP → get_connection_string (direct)
NEON_PROJECT_ID=                 # From Neon MCP → list_projects
NEON_API_KEY=                    # Project-scoped key (create after terraform apply — see FTR-094 § API Key Scoping)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=               # IAM user with Bedrock inference permissions
AWS_SECRET_ACCESS_KEY=           # Paired with above
VOYAGE_API_KEY=                  # From Voyage AI dashboard
NEXT_PUBLIC_SENTRY_DSN=          # From Sentry → Project Settings → Client Keys
SENTRY_AUTH_TOKEN=               # From Sentry → Settings → Auth Tokens
```

## Notes

- **Origin:** Migrated from ADR-041 and design/search/ during FTR unification (2026-03-05). See MIGRATION.md.
