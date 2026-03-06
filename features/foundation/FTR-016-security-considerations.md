# FTR-016: Security Considerations

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-09

## Rationale

| Concern | Approach |
|---------|----------|
| AI prompt injection | System prompts are server-side only. User input is treated as untrusted data, never concatenated into system prompts without sanitization. |
| Content scraping | Vercel bot protection + Firewall Rules. Rate limiting on API routes (FTR-097). Content fully crawlable — no DRM or content gating (FTR-059 §3a). Protection is rate limiting + copyright communication, not technology walls. |
| AI misuse | The AI cannot generate teaching content. If prompted to "ignore instructions," the constrained output format (passage IDs only) limits attack surface. |
| User privacy | No user accounts required. Search queries logged without any user identification. |
| Source attribution | Every displayed passage MUST include book, chapter, and page citation. No orphaned quotes. |

### FTR-097: Two-Layer Rate Limiting

| Layer | Tool | Limit | Behavior on Exceed |
|-------|------|-------|-------------------|
| **Outer (edge)** | Vercel Firewall | 60 general requests/min per IP; 15 search requests/min per IP | HTTP 429 with `Retry-After` header. Request never reaches application. |
| **Inner (application)** | Custom middleware | 30 search req/min anonymous, 120 search req/min known crawlers (FTR-059) | Graceful degradation: search proceeds without Claude API calls (database-only hybrid search). Still returns results. |

The outer layer stops abuse before it reaches the application — the 15 search/min Vercel Firewall limit is stricter than the inner layer because it's a hard block (429), while the inner layer's 30/min threshold triggers graceful degradation (results still returned, just without AI enhancement). A seeker who exceeds the application-layer limit still gets search results — just without AI-enhanced query expansion and passage ranking.

### Copyright Response Headers

All content API responses and HTML page responses include copyright metadata in HTTP headers. These headers travel with content even when accessed programmatically, ensuring copyright notice is present regardless of how the content is consumed.

**Headers on all responses:**

```
X-Copyright: © Self-Realization Fellowship
X-Rights: All rights reserved
X-Attribution-Required: true
X-License-URL: https://teachings.yogananda.org/legal
```

**Additional headers on content API responses (`/api/v1/books/`, `/api/v1/search/`, `/api/v1/passages/`):**

```
X-Citation-Format: "[Quote]" — Paramahansa Yogananda, [Book], [Citation] via teachings.yogananda.org
```

**Implementation:** Next.js middleware in `/lib/middleware/copyright-headers.ts`. Applied to all routes except `/api/v1/health` and static assets. Milestone 1c (ships with the copyright communication layer, FTR-117).

**Rationale:** The portal's No Content Gating policy (FTR-059 §3a) means copyright is asserted through metadata and legal layers, not technology walls. HTTP headers are the lowest-friction mechanism for machine consumers to discover copyright status — they don't need to parse HTML or visit a separate page. Combined with `llms.txt` copyright section, JSON-LD `copyrightHolder`, and the `/legal` page, this creates a multi-layered copyright communication strategy where every layer uses a real standard consumed by real systems.

### FTR-085: Sub-Processor Inventory

All services that process data on the portal's behalf, with their roles, data touched, and geographic regions. Maintained as part of the privacy policy (`/privacy`).

| Service | GDPR Role | Data Touched | Region | Milestone |
|---------|-----------|-------------|--------|-----------|
| **Neon** | Processor | All server-side data (books, themes, search queries, subscribers) | US (default); EU read replica Arc 4+ | 1a+ |
| **Vercel** | Processor | Request logs (transient), edge headers, static assets | Global edges, US origin | 1a+ |
| **Vercel Firewall** | Processor | Request metadata, IP for rate limiting (transient, not stored by portal) | Global (Vercel edge) | 1a+ |
| **Amplitude** | Processor | Anonymized events with country_code (no user ID) | US | 3d+ |
| **Sentry** | Processor | Error stack traces, request context | US | 1a+ |
| **New Relic** | Processor | Performance metrics, log aggregation | US | 3d+ |
| **AWS Bedrock** | Processor | Search queries (transient, not stored by AWS) | `us-west-2` | 1+ |
| **Voyage AI** | Processor | Corpus text at embedding time (one-time, not retained; FTR-024) | US | 1+ |
| **SendGrid** | Processor | Subscriber email addresses | US | 5a+ |
| **Auth0** | Processor | User accounts (if implemented) | US | 7a+ |
| **Contentful** | Processor | Editorial content (no personal data) | EU | 1+ |

EU-US data transfers rely on the EU-US Data Privacy Framework (DPF) where services are certified, with Standard Contractual Clauses (SCCs) as fallback. Review when services are added or changed.
