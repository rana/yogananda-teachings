---
ftr: 82
title: Observability
summary: "DELTA-compliant observability stack with Sentry, New Relic, Amplitude, and Vercel Analytics"
state: approved
domain: operations
governed-by: [PRI-08, PRI-09, PRI-12]
always-load: true
---

# FTR-082: Observability

## Rationale

### Context

The SRF tech stack specifies New Relic (APM), Sentry (error tracking), and Amplitude (product analytics). The portal should use these tools, but with DELTA-compliant configuration — particularly Amplitude, which defaults to user-level behavioral tracking that violates the Agency and Dignity principles.

### Decision

Use the **SRF-standard observability stack** with portal-specific configuration:

| Layer | Tool | What It Measures |
|-------|------|-----------------|
| **Error tracking** | **Sentry** | Unhandled exceptions, API errors, client-side errors. Next.js source maps for readable stack traces. |
| **APM (performance)** | **New Relic** | API route latency, database query duration, external call timing (Claude API, Voyage embeddings). Server-side distributed tracing. |
| **Synthetic monitoring** | **New Relic Synthetics** | Uptime checks on key routes (`/`, `/api/v1/search`, `/api/v1/health`, `/quiet`). Alerts on downtime. |
| **Product analytics** | **Amplitude** | *Only* appropriate metrics from CONTEXT.md. DELTA-compliant configuration (see below). |
| **Log aggregation** | **Vercel Logs → New Relic** | Structured JSON logs. Request ID correlation across services. |
| **Frontend performance** | **Vercel Analytics** | Core Web Vitals (LCP, CLS, INP). Edge function performance. Cold start monitoring. |

#### Health Check Endpoint

```
GET /api/v1/health

Response:
{
 "status": "ok",
 "version": "1.0.0",
 "database": "connected",
 "timestamp": "2026-02-17T12:00:00Z"
}
```

New Relic Synthetics pings this endpoint at regular intervals. Alert if non-200 for > 2 minutes.

#### SLI/SLO Numeric Targets

Service Level Indicators (SLIs) and Objectives (SLOs) for the production portal. These are tunable parameters per FTR-012 — initial values based on pre-production estimates. Revisit after first month of production traffic. Full operational surface specification: FTR-096 (FTR-096).

| SLI | Target (SLO) | Measurement Source |
|-----|-------------|-------------------|
| Search p95 latency | < 500ms | New Relic APM / Vercel Analytics |
| Availability | 99.5% uptime (monthly) | New Relic Synthetics (2-min check interval) |
| First Contentful Paint (FCP) | < 1.5s | Vercel Analytics Core Web Vitals |
| Error rate | < 0.1% of requests | Sentry error count / Vercel request count |
| Search quality (Recall@3) | >= 80% | Golden set evaluation (FTR-037) |

**Alerting thresholds:** SLO breach triggers PagerDuty-style alert (configured in New Relic) to the human principal. Sustained degradation (>15 min below SLO) escalates. Search quality is evaluated at deployment time (golden set regression), not continuously.

#### Structured Logging

Every API route logs a consistent JSON structure via `/lib/logger.ts`:

```typescript
// Standard fields on every request
{
 requestId: string, // UUID, propagated across services
 route: string, // e.g., "/api/v1/search"
 method: string, // GET, POST
 statusCode: number,
 durationMs: number,
 language: string, // User's locale
 timestamp: string // ISO 8601
}

// Additional fields for search routes (anonymized)
{
 query: string, // The search query
 resultCount: number,
 searchMode: string, // "hybrid", "fts", "vector"
 expansionUsed: boolean // Whether Claude query expansion was invoked
}
```

No user identification. No IP addresses. No session IDs. Search queries are logged for aggregate trend analysis ("What is humanity seeking?"), not user tracking.

#### DELTA-Compliant Amplitude Configuration

Amplitude's defaults assume user-level behavioral tracking. The portal must explicitly disable:

| Amplitude Default | Portal Override | Reason |
|-------------------|----------------|--------|
| User identification | **Disabled** | Violates Dignity — seekers are not data points |
| Session tracking | **Disabled** | Violates Agency — optimizes for retention |
| Event sequencing | **Disabled** | Violates Agency — builds behavioral profiles |
| Autocapture (clicks, page views) | **Disabled** | Violates Agency — surveillance by default |

#### Telemetry Methodology

Principles determine what to build. Telemetry reveals whether what we built actually serves the seekers principles say we must serve. The portal instruments for three purposes only:

1. **Failure detection** — a principle-mandated feature is broken, undiscoverable, or degraded for a specific population
2. **Discovery** — an unasked question about how seekers find the portal or which populations are underserved
3. **Prioritization evidence** — real demand data to replace census estimates when ordering principle-mandated work (FTR-011)

Telemetry does not direct development. Principle-mandated features (audio, accessibility, multilingual, Practice Bridge) exist regardless of usage. Every event in the allowlist has a documented decision framework — if a metric wouldn't change a decision, it is not collected. Infrastructure metrics (Vercel Analytics, New Relic, CDN logs) serve as free telemetry and should be read as product intelligence before adding explicit instrumentation (see FTR-096 § Infrastructure-as-Intelligence).

**What Amplitude tracks (allowlist):**

Events are grouped by telemetry purpose. All events are aggregate counters — no user IDs, no session IDs, no sequencing.

*Reach and reporting:*

| Event | Properties | Purpose | If surprisingly high | If surprisingly low |
|-------|-----------|---------|---------------------|---------------------|
| `page_viewed` | `page_type, language, requested_language, country_code` | Countries reached, languages served, unmet language demand | Celebrate; report to philanthropist | Investigate discoverability — SEO, link sharing, SRF cross-promotion |
| `passage_served` | `book_slug, language` | Content delivery volume by book and language | Identify popular books for editorial curation priority | Investigate: discovery problem or content gap? |
| `search_performed` | `language, result_count, zero_results` | Search usage, zero-result rate | Study query patterns → vocabulary bridge (FTR-028) | Investigate: is search discoverable? |

*Failure detection:*

| Event | Properties | Purpose | If surprisingly high | If surprisingly low |
|-------|-----------|---------|---------------------|---------------------|
| `error_page_shown` | `error_type, route, language` | Broken experiences by population and route | Fix immediately — which populations are affected? | Normal |
| `audio_play_started` | `book_slug, language, chapter_number` | Audio accessibility — is the feature working? | Invest in audio quality for high-demand languages | Investigate: broken on low-end devices? Undiscoverable? (Do not deprioritize — PRI-05 mandates audio for accessibility) |

*Mission alignment (PRI-04):*

| Event | Properties | Purpose | If surprisingly high | If surprisingly low |
|-------|-----------|---------|---------------------|---------------------|
| `practice_bridge_shown` | `trigger_type` | How often seekers encounter technique-sensitive queries | Study which query types trigger — inform editorial curation | Normal — not all seekers query about techniques |
| `practice_bridge_followed` | `destination` | Digital → practice conversion (PRI-04 north star) | Editorial success — study what content bridges work and share with SRF | Investigate: is the bridge discoverable? Is it compelling? |
| `center_locator_clicked` | — | Digital → physical bridge | Share with SRF — the portal drives physical visits | Normal — center visits are a subset of seeker intent |

*Discovery and prioritization:*

| Event | Properties | Purpose | If surprisingly high | If surprisingly low |
|-------|-----------|---------|---------------------|---------------------|
| `share_link_generated` | `format` | How seekers share teachings | Invest in share UX for popular formats | Normal — sharing is optional |
| `cross_language_link_followed` | `from_language, to_language` | Bilingual seeker patterns | Strengthen cross-language linking UX | Normal — monolingual use is expected |
| `reading_preference_changed` | `preference, direction` | Aggregate accessibility needs (font size, theme) | Adjust defaults for affected populations | Defaults are well-chosen |

Country code derived from Vercel edge headers, not IP geolocation lookup. Anonymized at the edge. `requested_language` derived from `Accept-Language` header — measures the gap between what seekers want and what the portal serves. `zero_results` boolean flags searches returning no passages — the zero-result rate is the most actionable operational metric for search quality. `practice_bridge_followed / practice_bridge_shown` is the portal's single most mission-aligned ratio — the quantitative expression of PRI-04 "signpost, not destination." Zero-result queries feed into golden set candidate pipeline (FTR-037).

### Rationale

- **SRF stack alignment.** Using the established tools (New Relic, Sentry, Amplitude) means the SRF AE team can support the portal without learning new tools.
- **DELTA compliance requires active configuration.** Amplitude, New Relic, and Sentry all default to collecting more data than the DELTA framework permits. The allowlist approach — explicitly specifying what to track rather than what not to track — is the only safe pattern.
- **Structured logging is the foundation.** Good logs make every other observability tool more effective. A request ID that traces from Vercel edge → API route → Neon query → Claude API call makes debugging trivial.
- **Health check + Synthetics = uptime confidence.** A dedicated health endpoint is trivial to implement and provides the foundation for reliable uptime monitoring.

### Consequences

- STG-001 includes Sentry setup, structured logging (`lib/logger.ts`), and health check endpoint
- New Relic integration in STG-009 (depending on SRF providing New Relic account access)
- Amplitude configured with explicit allowlist — no autocapture, no user identification
- DELTA compliance review of all observability configuration before launch
- Vercel Analytics enabled from STG-001 (free with Vercel deployment)
- Practice Bridge events (`practice_bridge_shown`, `practice_bridge_followed`) included in STG-001 structured logging — does not wait for Amplitude (STG-009-5)
- Infrastructure metrics (Vercel Analytics, New Relic, CDN logs) read as product intelligence before adding explicit Amplitude events — see FTR-096 § Infrastructure-as-Intelligence

## Specification

### Tool Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Error tracking** | Sentry | Unhandled exceptions, API errors, client-side errors. Next.js source maps. |
| **APM** | New Relic | API route latency, database query duration, Claude API/Voyage embedding call timing. Distributed tracing. |
| **Synthetic monitoring** | New Relic Synthetics | Uptime checks: `/`, `/api/v1/search`, `/api/v1/health`, `/quiet`. |
| **Product analytics** | Amplitude | DELTA-compliant: event counts only. No user identification, no session tracking, no autocapture. |
| **Log aggregation** | Vercel Logs → New Relic | Structured JSON logs with request ID correlation. |
| **Frontend performance** | Vercel Analytics | Core Web Vitals (LCP, CLS, INP). Cold start monitoring. |

### Health Check Endpoint

```
GET /api/v1/health

Response:
{
 "status": "ok",
 "version": "1.0.0",
 "database": "connected",
 "timestamp": "2026-02-17T12:00:00Z"
}
```

### Structured Logging (`/lib/logger.ts`)

Every API route logs a consistent JSON structure:

```typescript
interface RequestLog {
 requestId: string; // UUID, propagated across services
 route: string; // e.g., "/api/v1/search"
 method: string; // GET, POST
 statusCode: number;
 durationMs: number;
 language: string; // User's locale
 timestamp: string; // ISO 8601
}

// Additional fields for search routes (anonymized)
interface SearchLog extends RequestLog {
 query: string; // The search query
 resultCount: number;
 searchMode: string; // "hybrid", "fts", "vector"
 expansionUsed: boolean; // Whether Claude query expansion was invoked
}
```

No user identification. No IP addresses. No session IDs.

### DELTA-Compliant Amplitude Configuration

| Amplitude Feature | Setting | Reason |
|-------------------|---------|--------|
| User identification | **Disabled** | Seekers are not data points (Dignity) |
| Session tracking | **Disabled** | Optimizes for retention (violates Agency) |
| Event sequencing | **Disabled** | Builds behavioral profiles (violates Agency) |
| Autocapture | **Disabled** | Surveillance by default (violates Dignity) |

**Amplitude event allowlist:**

| Event | Properties | Metric It Supports |
|-------|-----------|-------------------|
| `page_viewed` | `{ page_type, language, requested_language, country_code }` | Countries reached, languages served, unmet language demand |
| `passage_served` | `{ book_slug, language }` | Books/passages served |
| `share_link_generated` | `{ format }` | Share link generation count |
| `center_locator_clicked` | `{}` | Digital → physical bridge |
| `search_performed` | `{ language, result_count, zero_results }` | Search usage volume, zero-result rate |

**`requested_language` rationale:** The `page_viewed` event carries `language` (the locale actually served) and `requested_language` (the seeker's `Accept-Language` header preference). The delta between requested and served is a direct measure of unmet language demand — e.g., how many seekers per week arrive wanting Hindi but receive English. This signal is impossible to backfill and directly informs STG-021 language prioritization. When `requested_language === language`, the property adds no information and can be elided in analysis.

**`zero_results` rationale:** The `search_performed` event's `zero_results` boolean tracks searches that return no passages. The zero-result rate is the portal's single most actionable operational metric: a rising rate signals corpus gaps, query expansion failures, or search pipeline regressions. The STG-009 staff dashboard (STG-009-4, FTR-149) should surface zero-result rate trend and the most common zero-result queries as top-level indicators.

### Standing Operational Metrics

Beyond the Amplitude event allowlist and APM tooling, the following derived metrics should be computed and surfaced in the STG-009 staff dashboard (FTR-149) for ongoing operational awareness:

| Metric | Source | Refresh | Dashboard |
|--------|--------|---------|-----------|
| Zero-result rate (% of searches returning 0 passages) | `search_performed` events | Daily | Staff dashboard (FTR-149) |
| Most common zero-result queries (top 20) | `search_queries` table | Daily | Staff dashboard (FTR-149) |
| Search degradation mode distribution | Structured logs (`searchMode` field) | Daily | Staff dashboard (FTR-149) |
| AI cost (Claude Haiku calls × per-call cost) | AWS Bedrock billing / CloudWatch | Daily | Staff dashboard (FTR-149) |
| Unmet language demand (requested ≠ served) | `page_viewed` events | Weekly | Staff dashboard (FTR-149) + Impact Dashboard (STG-021) |
| Content availability matrix (books × languages) | `books` + `book_chunks` tables | On content change | Impact Dashboard |
| Editorial queue depth by type | `review_queue` tables | Real-time | Admin portal pipeline dashboard |
| Geographic Core Web Vitals (per target region) | New Relic Synthetics | Continuous | New Relic |

## Notes

**Provenance:** FTR-082 + FTR-082 → FTR-082
