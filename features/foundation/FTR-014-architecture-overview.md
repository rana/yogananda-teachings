---
ftr: 14
title: Architecture Overview
summary: "Full tech stack, visual identity, milestone architecture diagrams, and component inventory"
state: approved
domain: foundation
governed-by: [PRI-10, PRI-11, PRI-12]
always-load: true
---

# FTR-014: Architecture Overview

## Rationale

### STG-001 Architecture (Prove — English, Pure Hybrid Search + Contentful)

Two content stores. No AI in the search path — pure hybrid retrieval. English only. Contentful is the editorial source of truth from STG-001 (FTR-102). (FTR-091)

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

STG-001 has NO Claude API calls in the search path.
Claude is used only offline: search quality evaluation (FTR-005 E5).
```

### STG-003 Architecture (Deploy — Pure Hybrid Search + Contentful Webhooks)

No AI services in the search path — pure hybrid search is the primary mode.
Deployed to Vercel. Contentful webhook sync replaces batch sync.
Bilingual (en, es). (FTR-091, FTR-102, FTR-027)

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

Contentful webhook sync (event-driven, STG-003+):

 Contentful publish ──► Webhook ──► Serverless fn ──► Chunk ──► Embed ──► Neon

STG-003 has NO Claude API calls in the search path.
AI-enhanced search (HyDE, cross-encoder reranking) is optional,
activated in STG-005 only if evaluation warrants (FTR-027).
```

### Production Architecture (Full Stack — Milestone 4a+)

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
│ │ • Cohere Rerank 3.5 — passage reranking (STG-005+) │ │
│ │ • Graph batch pipeline — Python + NetworkX (3b+)│ │
│ │ • Staff dashboard — admin panel (FTR-149)     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Key principle (STG-001+):** Contentful is where editors work. Neon is where search works. Next.js is where users work. Each system does what it's best at. Contentful is the editorial source of truth from STG-001 (FTR-102). The production diagram above adds services that arrive in later milestones (Cohere Rerank, graph pipeline, staff dashboard) but the Contentful → Neon → Next.js architecture is established from STG-001.

### Portal Stack vs. SRF IDP Stack

The portal shares SRF's core infrastructure (AWS, Vercel, Contentful, Neon, Auth0, Amplitude, Sentry) but diverges where the portal's unique requirements — vector search, AI-human editorial collaboration, DELTA-compliant analytics, sacred text fidelity, and a 10-year architecture horizon — make a different choice clearly better. This follows SRF Tech Stack Brief § Guiding Principle #3: *"When a specialized tech vendor does something significantly better than [the standard], utilize that over the less-impressive equivalent."*

**Divergences from SRF standard:**

| SRF IDP Standard | Portal Choice | Governing ADR | Rationale |
|---|---|---|---|
| DynamoDB (single-table) | Neon PostgreSQL + pgvector | FTR-104 | Vector similarity search, BM25 full-text, knowledge graph queries — none feasible in DynamoDB |
| GitLab SCM + CI/CD | GitHub + GitHub Actions | FTR-106 | Claude Code integration; GitHub Copilot workspace; open-source community norms |
| Serverless Framework v4 | Platform-Managed Lambda | FTR-107 | Platform MCP manages all vendor infrastructure including Lambda; SF v4 adds licensing cost for < 15 functions |
| Terraform (IaC) | Platform MCP + `teachings.json` | FTR-106 | AI-native operations (PRI-12) — Platform MCP preserves IaC capabilities (declarative, repeatable, auditable) through an AI-native interface. `bootstrap.sh` handles one-time AWS security. |
| Cloudflare (CDN/WAF) | Vercel-native (Firewall, DDoS, CDN) | FTR-118 | Portal runs on Vercel — double-CDN adds complexity without unique value. Compatible if SRF routes domain through Cloudflare. |
| Retool (admin panel) | Deferred — evaluate at STG-009 | FTR-149 | Portal admin needs are modest; Next.js `/admin` route may suffice. Retool remains an option. |
| New Relic (observability) | Sentry (STG-001–3c) → New Relic (3d+ APM) | FTR-036 | Sentry covers error tracking through pre-launch and early production. New Relic joins at production scale for APM, Synthetics monitors, distributed tracing, and geographic CWV — capabilities that matter at scale but not during development. |
| Vimeo (private video) | YouTube embed | FTR-057 | SRF's public teachings are on YouTube; portal links to existing assets, not re-hosted copies |
| SendGrid (transactional email) | SendGrid (aligned) | FTR-154 | Aligned with SRF standard. Open/click tracking disabled for DELTA. FTR-151 evaluates SES alternative for Milestone 5a. |
| Cypress (E2E testing) | Playwright | FTR-081 | Multi-browser support (Chrome, Firefox, WebKit), native accessibility snapshot API, better CI reliability |
| Stripo (email templates) | Server-rendered HTML | FTR-154 | One passage, one link — no template designer needed |

**Portal additions not in SRF standard:**

| Technology | Purpose | Governing ADR | Why Not Standard |
|---|---|---|---|
| Voyage voyage-4-large (embeddings) | Semantic search vector generation | FTR-024 | No SRF equivalent — SRF has no vector search |
| Cohere Rerank 3.5 (STG-005+) | Passage re-ranking for search quality | FTR-027 | No SRF equivalent |
| Claude Haiku via AWS Bedrock | AI librarian (query expansion, classification) | FTR-105 | Novel capability; routed through Bedrock for SRF's existing AWS relationship |
| pg_search / ParadeDB | BM25 full-text search in PostgreSQL | FTR-020 | SRF uses Elasticsearch; portal consolidates into single database |
| fastText | Language detection for multilingual queries | FTR-058 | No SRF equivalent |
| NetworkX (Python, STG-007+) | Knowledge graph batch pipeline | FTR-034 | No SRF equivalent |
| dbmate | SQL migration management | FTR-106 | SRF uses ORM migrations; portal uses raw SQL for 10-year durability |
| Lighthouse CI | Performance budget enforcement in CI | FTR-081 | Free, open-source, CI-agnostic — complements Vercel Analytics with pre-deployment checks |

**The pattern:** Align with SRF where the use case matches. Diverge where the portal's constraints (vector search, DELTA, sacred text fidelity, AI collaboration) demand it. Document every divergence with an ADR so it reads as principled engineering, not drift, when SRF's AE team encounters the portal.
