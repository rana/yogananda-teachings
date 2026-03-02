## ADR-041: Arc 1 Bootstrap

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

See DES-039 § Environment Configuration for the canonical `.env.example`, named constants (`/lib/config.ts`), CI-only secrets, and developer tooling configuration. That section is the single source of truth for all environment variables.

**Milestone 1a minimum viable `.env.local`** (the subset needed before Contentful is connected):

```bash
NEON_DATABASE_URL=               # From Neon MCP → get_connection_string (pooled)
NEON_DATABASE_URL_DIRECT=        # From Neon MCP → get_connection_string (direct)
NEON_PROJECT_ID=                 # From Neon MCP → list_projects
NEON_API_KEY=                    # Project-scoped key (create after terraform apply — see ADR-124 § API Key Scoping)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=               # IAM user with Bedrock inference permissions
AWS_SECRET_ACCESS_KEY=           # Paired with above
VOYAGE_API_KEY=                  # From Voyage AI dashboard
NEXT_PUBLIC_SENTRY_DSN=          # From Sentry → Project Settings → Client Keys
SENTRY_AUTH_TOKEN=               # From Sentry → Settings → Auth Tokens
```

---
