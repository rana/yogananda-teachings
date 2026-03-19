---
ftr: 19
title: Error Handling and Resilience
summary: "Graceful degradation hierarchy, circuit breaker for Claude API, retry with backoff, and calm error messages"
state: implemented
domain: foundation
governed-by: [PRI-05, PRI-08]
always-load: true
---

# FTR-019: Error Handling and Resilience

## Rationale

The portal's error handling philosophy follows from two principles: **Global-First** (a degraded experience is still a complete experience) and **Calm Technology** (errors should not alarm the seeker). Every external dependency has a degradation path that preserves the core reading experience.

### Degradation Hierarchy

The portal degrades gracefully through layers. Each layer down removes a capability but never blocks reading or basic search.

| Dependency | If Unavailable | Degradation | Seeker Impact |
|------------|---------------|-------------|---------------|
| **Claude API (Bedrock)** | Query expansion, intent classification, passage ranking skip | Pure hybrid search (vector + BM25) — still returns relevant results | Slightly less precise ranking; no intent routing |
| **Neon PostgreSQL** | Search and API calls fail | Book reader falls back to Contentful Delivery API; search shows calm error message | Reading works, search does not |
| **Contentful Delivery API** | Book reader pages fail to render | Search still works (Neon is the search index); reader shows fallback message | Search works, reading does not |
| **Voyage API** | New embedding generation fails | Existing embeddings continue to serve search; ingestion pipeline pauses | Zero seeker impact (ingestion is offline) |
| **Vercel Edge** | Complete outage | Standard Vercel reliability; no self-hosted fallback in STG-001 | Full outage (accept this risk) |

### Error Handling Patterns

**Retry policy.** External API calls (Bedrock, Voyage, Contentful) use exponential backoff with jitter: 3 retries, base delay 200ms, max delay 5s. Database connection retries follow Neon's connection pooler recommendations (see FTR-094 § Connection Resilience). No retries on 4xx responses — only 5xx and network errors.

**Circuit breaker.** The Claude API path uses a simple circuit breaker in `/lib/services/`:
- **Closed** (normal): all requests pass through
- **Open** (after 5 consecutive failures in 60s): skip Claude, fall back to hybrid-only search for 30s
- **Half-open**: send one probe request; if it succeeds, close the circuit

This prevents cascading latency when Bedrock is degraded. The circuit breaker state is in-memory (per serverless instance), not shared — acceptable because each Vercel function instance independently detects degradation.

**Timeout policy.** Claude API calls timeout at 8s (query expansion: 3s, intent classification: 2s, passage ranking: 5s). Database queries timeout at 5s. Contentful API calls timeout at 10s. All timeouts implemented via `AbortController` in service functions.

**User-facing error presentation.** Errors follow the portal's contemplative register (FTR-054):
- Search degradation is invisible — seekers get results, just via a simpler path
- Reader errors: "This chapter is temporarily unavailable. Please try again shortly."
- Full search failure: "The search is resting. You might enjoy browsing the library while we restore it." with a link to `/books`
- Never show stack traces, error codes, or technical details to seekers

**Structured error logging.** All errors are logged via `/lib/logger.ts` with: error type, service name, request ID, duration, and whether degradation was triggered. Sentry captures unhandled exceptions. The `searchMode` field in search response metadata reveals which path was taken (full AI-enhanced, hybrid-only, FTS-only) for operational monitoring.

### Partial Failure in Ingestion Pipeline

The ingestion pipeline (FTR-022) processes chunks individually. A failure on one chunk does not abort the pipeline:
- Failed embeddings are logged and retried in a separate pass
- Failed enrichment produces a chunk with `enrichment_status = 'failed'` — it is still searchable via FTS, just not enriched
- The pipeline produces a summary report: N chunks processed, M failures, failure types
