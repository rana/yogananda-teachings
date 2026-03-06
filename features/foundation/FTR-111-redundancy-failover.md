---
ftr: 111
title: Redundancy, Failover, and Regional Distribution Strategy
state: approved
domain: foundation
arc: 1+
governed-by: [PRI-05, PRI-10]
---

# FTR-111: Redundancy, Failover, and Regional Distribution Strategy

## Rationale

### Context

The portal serves a global audience. Seekers in India, Latin America, Africa, and Southeast Asia are as important as those in North America and Europe. The architecture must balance global availability and latency against cost and operational complexity. The key question: which layers need multi-region redundancy, and which are adequately served by edge caching in front of a single-region origin?

### Decision

Adopt a **single-region origin with global edge distribution** strategy for Arcs 1–4, expanding to **read replicas and cross-region asset replication** at Milestone 5a+ when traffic patterns justify it. No active-active multi-region. The portal is a reading and search tool, not a financial transaction system — the availability requirements are high but not extreme.

### Architecture by Layer

**Layer 1: Edge (global from day one)**

| Service | Distribution | Notes |
|---------|-------------|-------|
| Vercel Edge Network | 70+ PoPs worldwide | Static pages (ISR) cached at edge. HTML reaches seekers from the nearest PoP. |
| Vercel Firewall | Global edge | DDoS protection and rate limiting at Vercel's edge network. |
| CloudFront | Global edge | Audio files, PDFs, and static assets cached at edge. Origin is S3 in the primary region. |

Edge caching means a seeker in Mumbai requesting a book chapter gets HTML from a Vercel PoP in Mumbai, a PDF from a CloudFront PoP in Mumbai, and only the search query itself routes to the single-region origin.

**Layer 2: Compute (single-region, Arcs 1–4)**

| Service | Region | Failover |
|---------|--------|----------|
| Vercel Serverless Functions | `us-west-2` (co-located with Neon and Bedrock) | Vercel provides within-region redundancy. No cross-region failover. |
| AWS Lambda | Same region as Neon primary | Within-region redundancy (Lambda runs across multiple AZs automatically). |

**Layer 3: Database (single-region with HA, Arcs 1–4)**

| Service | Strategy | Notes |
|---------|----------|-------|
| Neon PostgreSQL | Single-region primary with automatic AZ failover | Neon manages replication and failover within the region. If the primary compute goes down, Neon promotes a replica. |
| Neon read replicas (Milestone 5a+) | Add read replicas in EU and Asia-Pacific | Search queries and reader pages route to the nearest read replica. Write operations (ingestion, editorial review) route to the primary. |

**Layer 4: Storage (single-region with CDN, expanding at Milestone 5a+)**

| Service | Strategy | Notes |
|---------|----------|-------|
| S3 (primary) | Single-region | Audio files, PDFs, backups. CloudFront sits in front for global delivery. |
| S3 Cross-Region Replication (Milestone 5a+) | Replicate to a second region | Disaster recovery for assets. If primary region S3 is unavailable, CloudFront falls back to the replica bucket. |

### Failure Scenarios and Response

| Scenario | Impact | Recovery |
|----------|--------|----------|
| Vercel outage (regional) | Pages unavailable | Vercel's global load balancing routes to other regions. ISR-cached pages still served from edge. |
| Neon outage (regional) | Search and dynamic content unavailable. Static pages still served. | Neon's automatic AZ failover. If full region down: portal degrades to static content only (ISR pages, cached PDFs). |
| S3 outage (regional) | New PDF/audio requests fail. CloudFront serves cached copies. | CloudFront continues serving cached assets. At Milestone 5a+, cross-region replica takes over. |
| Lambda outage | Batch jobs fail (ingestion, backup, email) | Lambda retries automatically. Batch jobs are idempotent — safe to re-run. Email delayed, not lost. |
| CloudFront outage | Asset delivery degraded | Extremely rare (global service). Fallback: direct S3 URLs (slower, no edge caching). |

### Regional Latency Targets

With pure hybrid search as the primary search mode (FTR-027 — no external AI services in the search hot path), search latency is dominated by database query time (~50–200ms) plus network round-trip time. This achieves competitive global latency without multi-region database infrastructure.

| Region | Network RTT to us-west-2 | DB Query | Search Total | Target |
|--------|--------------------------|----------|-------------|--------|
| US West | ~10ms | ~100ms | ~110ms | < 200ms |
| US East | ~60ms | ~100ms | ~160ms | < 300ms |
| Europe | ~140ms | ~100ms | ~240ms | < 400ms |
| South Asia | ~200ms | ~100ms | ~300ms | < 500ms |
| Southeast Asia | ~150ms | ~100ms | ~250ms | < 400ms |
| Sub-Saharan Africa | ~250ms | ~100ms | ~350ms | < 500ms |
| South America | ~150ms | ~100ms | ~250ms | < 400ms |

**Target: search p95 < 500ms from any continent.** This is competitive with general-purpose search engines and appropriate for a contemplative portal. The target is achievable today with pure hybrid search against a single-region Neon instance. No edge caching, multi-region database, or architectural changes required.

*Parameter — latency targets above, evaluate: Milestone 1c real-world traffic patterns (FTR-012).*

**What is already globally distributed (day one):**
- Book chapters and reading pages (ISR, cached at Vercel's 70+ edge PoPs)
- Search suggestions (static JSON at CDN edge, < 10ms globally — FTR-029)
- Daily Passage / Today's Wisdom (pre-rendered at every PoP)
- All static assets (Vercel CDN + CloudFront)

**What crosses the network to the origin:**
- Search queries (~200–400ms total — the only user-facing operation with origin latency)
- Contentful webhook sync (editorial, not user-facing)

### Multi-Region Neon

Neon is the portal's database provider for the long term (FTR-094). When Neon ships cross-region read replicas, activate them to reduce search latency further — particularly for South Asia and Africa where network RTT to us-west-2 is highest.

**Activation plan:**
- When available: create read replicas in `ap-south-1` (Mumbai) and `eu-central-1` (Frankfurt) via Platform MCP
- Route search API read queries to the nearest replica; writes (ingestion, editorial) to the primary
- This is a platform configuration change, not an architectural change — the application code is unaffected
- Expected search latency improvement: South Asia drops from ~300ms to ~150ms; Europe from ~240ms to ~140ms

**No exit ramp needed.** Neon's Scale tier, branching workflow, pgvector + pg_search extension ecosystem, and development velocity are the right fit for this project. Plan to grow with Neon, not away from it.

### Rationale

- **Cost-proportionate resilience.** Active-active multi-region would cost 3–5× more in infrastructure and add significant operational complexity. The portal's availability SLA does not justify this. "Search is down for 30 minutes while Neon fails over" is acceptable; "a seeker loses their reading progress" is not (but all reading state is client-side in `localStorage` anyway).
- **Pure hybrid search removes the latency bottleneck.** With no AI services in the search hot path (FTR-027), search latency is ~200–400ms globally — competitive with Google Search. The AI services (Claude, Cohere) were the latency bottleneck, not the database or network. Removing them from the hot path achieves the p95 < 500ms target without multi-region infrastructure.
- **Edge distribution covers most requests.** The majority of portal requests — page loads, PDFs, audio streams, static assets, search suggestions — are served from Vercel's edge. Only search queries reach the origin.
- **Neon multi-region read replicas are the next-level investment.** When Neon ships them, activating replicas in Mumbai and Frankfurt is a platform configuration change that further improves the experience for the largest seeker populations (India, Europe).
- **Backup is separate from failover.** FTR-109 (nightly pg_dump to S3) provides data recovery. This ADR addresses service availability. They complement each other.

### Alternatives Evaluated

- **Turso (libSQL edge database):** Evaluated 2026-02-28. Turso's embedded replicas offer genuine low-latency reads for distributed workloads. Rejected for this project because: (1) no confirmed ICU tokenization for multilingual FTS — fails PRI-06 for 10 target languages including Thai, Hindi, Bengali; (2) vector search (DiskANN) is less mature than pgvector HNSW — one known production customer; (3) hybrid search (vector + BM25 + graph in one query) is not composable in SQLite's virtual table architecture; (4) embedded replicas require persistent filesystems, incompatible with Vercel Edge Functions; (5) libsql-server is v0.x with no published SLA; (6) migration from PostgreSQL would require rewriting all SQL migrations, violating FTR-004 longevity principle. Turso is excellent for multi-tenant SaaS and local-first mobile apps — it solves a different problem than the one this portal has.

### Consequences

- Primary region: `us-west-2` — co-locates Neon, Bedrock, Lambda, and S3 in a single region
- Vercel function region co-located with Neon primary
- Lambda functions deployed to the same region as Neon primary
- CloudFront distribution configured for all static assets from Arc 1
- Search p95 < 500ms from any continent (achieved by pure hybrid search, no multi-region required)
- When Neon ships cross-region read replicas: activate via Platform MCP in `ap-south-1` and `eu-central-1`
- Health check endpoint (`/api/v1/health`) reports database connectivity, enabling uptime monitoring
- **Explicit non-goal:** No active-active multi-region. No global database write replication. No cross-region Lambda orchestration. No edge database replacement.
