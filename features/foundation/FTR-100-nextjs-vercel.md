---
ftr: 100
title: Next.js + Vercel for Frontend
summary: "Next.js on Vercel with SSG for book pages, API routes for search, ISR for content updates"
state: implemented
domain: foundation
governed-by: [PRI-10]
---

# FTR-100: Next.js + Vercel for Frontend

## Rationale

### Context

The SRF tech stack designates Next.js on Vercel as the standard frontend stack. The convocation site uses this. No alternative was seriously considered.

### Decision

Use **Next.js on Vercel** with **Tailwind CSS** for the frontend.

### Rationale

- SRF organizational standard
- SSG for book reader pages (fast, SEO-friendly, cacheable)
- API routes for search endpoints (serverless, no separate backend for the initial milestone)
- ISR for content updates when Contentful is integrated
- Vercel edge caching for global performance

### Consequences

- STG-001 can use Next.js API routes instead of AWS Lambda (simpler)
- Production may migrate search API routes to Lambda if needed for scale or separation
