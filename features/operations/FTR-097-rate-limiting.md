---
ftr: 97
title: Rate Limiting
summary: "Two-layer rate limiting via Vercel Firewall and application middleware to prevent API abuse"
state: implemented
domain: operations
governed-by: [PRI-05, PRI-08]
---

# FTR-097: Rate Limiting

## Rationale

**Status:** Accepted | **Date:** 2026-02-19

### Context

The search API (`/api/v1/search`) calls the Claude API for query expansion and passage ranking. Each search costs approximately $0.01–0.02 in Claude API usage. The portal has no authentication until Milestone 7a+. All API routes are public.

A bot or bad actor could hammer the search endpoint and generate significant Claude API costs. At 100 requests/second, the portal would burn through $50–100/hour in Claude API charges. Even accidental abuse (a misbehaving scraper, a search indexer hitting the API) could spike costs.

The DESIGN.md security section mentions "Rate limiting on API routes" but doesn't specify the implementation.

### Decision

Implement rate limiting at two layers:

#### Layer 1: Vercel Firewall (edge — Milestone 1a)

Vercel Pro includes Firewall Rules, DDoS protection, and bot detection. Configure rate limiting via Vercel Firewall Rules or Edge Middleware:

| Rule | Limit | Scope |
|------|-------|-------|
| Global API rate limit | 60 requests/minute per IP | All `/api/v1/*` routes |
| Search rate limit | 15 requests/minute per IP | `/api/v1/search` specifically |
| Burst protection | 5 requests/second per IP | All routes |

These limits are generous for human seekers (who search a few times per session) but block automated abuse. Vercel's built-in DDoS mitigation and bot protection provide the network-layer defense. No separate CDN/WAF vendor required (FTR-118).

#### Layer 2: Application (API route — Milestone 1a)

A lightweight in-memory rate limiter (e.g., `rate-limiter-flexible` with Vercel's edge runtime, or a simple sliding window counter in a Vercel KV store) as a defense-in-depth measure:

- **Claude API calls gated**: If the IP exceeds the search rate limit, the API falls back to database-only search (vector + FTS without Claude query expansion or re-ranking). The seeker still gets results — just without the AI refinement layer. This is graceful degradation, not a hard block.
- **Hard block threshold**: If an IP exceeds 200 requests/hour to any API endpoint, return `429 Too Many Requests` with a `Retry-After` header and a calm message: "Please wait a moment before searching again."

#### Claude API budget cap

Set a monthly spending cap via the Anthropic API dashboard. If the cap is reached, the search API silently falls back to database-only search for all users. The portal degrades gracefully — search still works, just without query expansion. This is the last line of defense against cost runaway.

### Rationale

- **Cost protection is a Milestone 1a requirement**, not an afterthought. The Claude API is the only variable-cost component in the early milestones. Unbounded cost exposure on a public, unauthenticated API is an unacceptable risk.
- **Graceful degradation over hard blocks.** A seeker who happens to search frequently (exploring themes, trying different queries) should never see an error page. They see slightly less refined results. The portal remains welcoming.
- **Two-layer defense.** Vercel Firewall catches the obvious abuse (bots, scrapers) at the edge. The application layer catches the edge cases (distributed abuse, legitimate but excessive use).

### Consequences

- Vercel Firewall Rules configured in Milestone 1a (Vercel Pro tier, no separate infrastructure module needed)
- Application-level rate limiter in the search API route
- Claude API monthly budget cap set via Anthropic dashboard
- Search gracefully degrades to database-only when rate-limited or budget-exceeded
- Monitoring: Sentry alert on rate limit triggers; New Relic dashboard for Claude API usage (Milestone 3d)
- **Extends** the security section of DESIGN.md with concrete implementation

## Notes

**Provenance:** FTR-097 → FTR-097
