# FTR-100: Next.js + Vercel for Frontend

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10

## Rationale

### Context

The SRF tech stack designates Next.js on Vercel as the standard frontend stack. The convocation site uses this. No alternative was seriously considered.

### Decision

Use **Next.js on Vercel** with **Tailwind CSS** for the frontend.

### Rationale

- SRF organizational standard
- SSG for book reader pages (fast, SEO-friendly, cacheable)
- API routes for search endpoints (serverless, no separate backend for Arc 1)
- ISR for content updates when Contentful is integrated
- Vercel edge caching for global performance

### Consequences

- Arc 1 can use Next.js API routes instead of AWS Lambda (simpler)
- Production may migrate search API routes to Lambda if needed for scale or separation
