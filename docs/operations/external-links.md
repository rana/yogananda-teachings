# External Links Inventory

> Audited 2026-03-02. All production-facing external links verified.

## SRF Ecosystem Links (User-Facing)

| URL | Status | Used In | Notes |
|-----|--------|---------|-------|
| `https://yogananda.org` | 200 OK | Footer, layout JSON-LD, legal page | Main SRF website |
| `https://yogananda.org/lessons` | 200 OK | Homepage Practice Bridge, About page, Footer | SRF Lessons enrollment |
| `https://yogananda.org/locations` | 200 OK | About page | Find a temple/center |
| `https://onlinemeditation.yogananda.org/` | 200 OK | About page | Separate subdomain |
| `https://yogananda.org/app-faq` | 200 OK | About page | SRF mobile app download |
| `https://yogananda.org/contact-us` | 200 OK | Privacy page | Contact form |
| `https://yogananda.org/paramahansa-yogananda` | 200 OK | Layout JSON-LD | Biography page |
| `https://bookstore.yogananda-srf.org` | 200 OK | Footer, About page, Books page | Imperva/hCaptcha protected |
| `https://bookstore.yogananda-srf.org/autobiography-of-a-yogi` | 200 OK | DB bookstore_url (English) | Product page |
| `https://bookstore.yogananda-srf.org/autobiografia-de-un-yogui-autobiography-of-a-yogi-spanish` | 200 OK | DB bookstore_url (Spanish) | Product page |
| `https://www.youtube.com/@YoganandaSRF` | 200 OK | Footer, About page, layout JSON-LD | YouTube channel |

## Crisis Support Links

| URL | Status | Used In |
|-----|--------|---------|
| `https://988lifeline.org` | 200 OK | Crisis interstitial (English) |
| `https://988lifeline.org/es` | 200 OK | Crisis interstitial (Spanish) |

## Structured Data References

| URL | Status | Used In |
|-----|--------|---------|
| `https://www.wikidata.org/wiki/Q1075365` | 200 OK | Layout JSON-LD (SRF Organization) |
| `https://www.wikidata.org/wiki/Q131814` | 200 OK | Layout JSON-LD (Yogananda Person) |
| `https://en.wikipedia.org/wiki/Self-Realization_Fellowship` | 200 OK | Layout JSON-LD sameAs |
| `https://en.wikipedia.org/wiki/Paramahansa_Yogananda` | 200 OK | Layout JSON-LD sameAs |
| `https://schema.org` | N/A | JSON-LD @context (9 references) |

## API Endpoints (Server-Side Only)

| URL | Used In | Notes |
|-----|---------|-------|
| `https://api.voyageai.com/v1/embeddings` | search.ts, ingest scripts | Embedding generation |

## Internal References

| URL | Used In | Notes |
|-----|---------|-------|
| `https://teachings.yogananda.org` | Sitemap, canonical URLs, JSON-LD, OpenAPI | Portal's own domain (15 references) |

## Captcha-Protected Sites

The following sites use bot protection (Imperva/hCaptcha) that blocks automated link checking. They return 200 to `curl` but block headless browsers:

- `bookstore.yogananda-srf.org` — All bookstore URLs are verified via `curl` but cannot be accessed programmatically via Playwright. Manual browser testing required for full verification.

## Broken Links Fixed (2026-03-02)

| Old URL (404) | New URL (200) | File |
|---------------|---------------|------|
| `yogananda.org/find-a-center` | `yogananda.org/locations` | about/page.tsx |
| `yogananda.org/online-meditation-center` | `onlinemeditation.yogananda.org/` | about/page.tsx |
| `yogananda.org/srf-app` | `yogananda.org/app-faq` | about/page.tsx |
| `yogananda.org/contact` | `yogananda.org/contact-us` | privacy/page.tsx |

## Maintenance

External URLs should be re-audited quarterly or when SRF updates their website structure. Add a link check to CI if feasible (advisory, non-blocking — external sites can have transient outages).
