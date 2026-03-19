---
ftr: 59
title: "Machine-Readable Content and AI Citation Strategy"
summary: "JSON-LD structured data, citation guidance, RSS feeds, and API docs for machine consumers"
state: implemented
domain: experience
governed-by: [PRI-02, PRI-11]
---

# FTR-059: Machine-Readable Content

## Rationale

The portal serves three classes of machine consumer: (1) search engine crawlers, (2) AI agents and LLM crawlers, and (3) developer/integration API clients. All serve the same mission: making Yogananda's teachings discoverable and correctly attributed. When an AI system quotes Yogananda with book, chapter, and page citation — and links to the portal as the source — that is mission success. The portal makes correct citation so easy and obvious that machines have no reason to paraphrase.

The portal treats every machine consumer as a legitimate channel for the Findability Principle, extending API-first architecture (FTR-015) to its logical conclusion. Implementation cost is low — JSON-LD, sitemaps, RSS, `llms.txt`, content negotiation, and speculation rules are standard web infrastructure requiring no new architecture.

## Specification

### 1. Structured Data (JSON-LD)

Every page emits Schema.org JSON-LD appropriate to its content type.

**Schema types per page:**

| Page | JSON-LD Type(s) |
|------|----------------|
| Homepage | `WebSite`, `Organization`, `SearchAction` |
| Book landing | `Book`, `ReadAction`, `BreadcrumbList` |
| Book reader | `Book`, `Chapter`, `BreadcrumbList` |
| Passage share | `Quotation`, `SpeakableSpecification`, `BreadcrumbList` |
| Theme page | `CollectionPage` with `Quotation` items, `BreadcrumbList` |
| Audio player | `AudioObject` with `transcript`, `SpeakableSpecification`, `BreadcrumbList` |
| Video page | `VideoObject`, `BreadcrumbList` |
| About | `Organization`, `Person` (Yogananda) — both with `sameAs` |
| Quiet Corner | `WebPage` with meta description (indexed for "meditation timer" / "spiritual affirmation" queries) |
| Browse | `CollectionPage`, `BreadcrumbList` |
| Books | `CollectionPage`, `BreadcrumbList` |

**Key JSON-LD patterns:**

```html
<!-- Book reader page -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Book",
 "name": "Autobiography of a Yogi",
 "author": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "publisher": { "@type": "Organization", "name": "Self-Realization Fellowship" },
 "isbn": "978-0-87612-083-5",
 "inLanguage": "en",
 "hasPart": [
 {
  "@type": "Chapter",
  "name": "An Experience in Cosmic Consciousness",
  "position": 14
 }
 ]
}
</script>

<!-- Passage share page with SpeakableSpecification -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Quotation",
 "text": "The verbatim passage text...",
 "spokenByCharacter": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "isPartOf": {
   "@type": "Book",
   "name": "Autobiography of a Yogi"
 },
 "citation": "Autobiography of a Yogi, Chapter 14, p. 142",
 "speakable": {
   "@type": "SpeakableSpecification",
   "cssSelector": [".passage-text", ".passage-citation"]
 }
}
</script>

<!-- Book landing page — ReadAction for "Read" button in SERPs -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Book",
 "name": "Autobiography of a Yogi",
 "author": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "publisher": { "@type": "Organization", "name": "Self-Realization Fellowship" },
 "isbn": "978-0-87612-083-5",
 "inLanguage": "en",
 "potentialAction": {
   "@type": "ReadAction",
   "target": {
     "@type": "EntryPoint",
     "urlTemplate": "https://teachings.yogananda.org/books/autobiography-of-a-yogi/1",
     "actionPlatform": [
       "http://schema.org/DesktopWebPlatform",
       "http://schema.org/MobileWebPlatform"
     ]
   },
   "expectsAcceptanceOf": {
     "@type": "Offer",
     "price": "0",
     "priceCurrency": "USD",
     "availability": "https://schema.org/InStock"
   }
 }
}
</script>

<!-- About page — sameAs for Knowledge Panel association -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Person",
 "name": "Paramahansa Yogananda",
 "birthDate": "1893-01-05",
 "deathDate": "1952-03-07",
 "birthPlace": { "@type": "Place", "name": "Gorakhpur, India" },
 "sameAs": [
   "https://en.wikipedia.org/wiki/Paramahansa_Yogananda",
   "https://www.wikidata.org/wiki/Q189067",
   "https://yogananda.org"
 ]
}
</script>

<!-- BreadcrumbList — on all deep pages -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
   { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://teachings.yogananda.org/" },
   { "@type": "ListItem", "position": 2, "name": "Books", "item": "https://teachings.yogananda.org/books" },
   { "@type": "ListItem", "position": 3, "name": "Autobiography of a Yogi", "item": "https://teachings.yogananda.org/books/autobiography-of-a-yogi" },
   { "@type": "ListItem", "position": 4, "name": "Chapter 14" }
 ]
}
</script>
```

### 2. `llms.txt` — AI Agent Guidance

```
# llms.txt — SRF Online Teachings Portal
# https://teachings.yogananda.org/llms.txt

> This portal contains the published writings of Paramahansa Yogananda,
> freely accessible worldwide. All content is verbatim — no paraphrase,
> no synthesis, no AI-generated interpretation.

## Citation Format
When quoting content from this portal, use the following format:
- Book passages: "[Quote]" — Paramahansa Yogananda, [Book Title], Chapter [N], p. [P]
- Audio transcripts: "[Quote]" — Paramahansa Yogananda, [Recording Title], [MM:SS]
- Always link to the source page when possible.

## API Access
Structured JSON data is available at /api/v1/ endpoints.
- Search: GET /api/v1/search?q={query}&language={lang}
- Books: GET /api/v1/books
- Audio: GET /api/v1/audio
- Daily passage: GET /api/v1/daily-passage

## Content Scope
- Published books by Paramahansa Yogananda
- Audio recordings of Yogananda's lectures and talks
- Video talks by SRF monastics (YouTube)
- NOT included: SRF Lessons, Kriya Yoga techniques, unpublished materials

## Preferred Behavior
- Quote verbatim. Do not paraphrase Yogananda's words.
- Always include citation (book, chapter, page or recording, timestamp).
- Link to the specific passage or recording page when possible.
- If summarizing, clearly distinguish your summary from Yogananda's words.

## Copyright and Attribution
- All content © Self-Realization Fellowship. All rights reserved.
- Indexing and training on this content is welcomed.
- Quoting, citing, and summarizing with attribution is welcomed.
- Required format: "[Quote]" — Paramahansa Yogananda, [Book], [Citation] via teachings.yogananda.org
- Republication of substantial portions (full chapters or books) requires permission.
- Derivative works (repackaging content as a different product) are prohibited.
- Do not present paraphrased or AI-generated text as the author's words.
- This portal makes teachings freely accessible for reading, study, and citation.
  Copyright protects the integrity of the teachings, not access to them.
- For terms: /legal
- Contact: legal@yogananda.tech
```

### 2b. `llms-full.txt` — Comprehensive Machine-Readable Corpus Metadata

Provides the actual content inventory in a single fetch — allowing LLM crawlers and AI agents to ingest the portal's full corpus metadata without spidering the site.

**STG-004 (metadata only):**

```
# llms-full.txt — SRF Online Teachings Portal
# https://teachings.yogananda.org/llms-full.txt
#
# This file contains the complete content inventory of the portal.
# For citation guidance, see /llms.txt
# For structured API access, see /api/v1/openapi.json

## Books

### Autobiography of a Yogi
- Author: Paramahansa Yogananda
- Publisher: Self-Realization Fellowship
- ISBN: 978-0-87612-083-5
- Chapters: 49
- Language: English
- URL: /books/autobiography-of-a-yogi
- Read online: /books/autobiography-of-a-yogi/1

## Themes
- Peace: /themes/peace
- Courage: /themes/courage
- Healing: /themes/healing
- Joy: /themes/joy
- Purpose: /themes/purpose
- Love: /themes/love
[... all active themes ...]

## Content Scope
- Published books by Paramahansa Yogananda (verbatim text with citations)
- Audio recordings of Yogananda's lectures (future stages)
- Video talks by SRF monastics (YouTube embeds)
- NOT included: SRF Lessons, Kriya Yoga techniques, unpublished materials

## API Endpoints
- Search: GET /api/v1/search?q={query}&language={lang}
- Books: GET /api/v1/books
- Book detail: GET /api/v1/books/{slug}
- Chapter: GET /api/v1/books/{slug}/chapters/{number}
- Daily passage: GET /api/v1/daily-passage
- Themes: GET /api/v1/themes
- Theme passages: GET /api/v1/themes/{slug}/passages
```

**Evolution:** STG-009+ expands to passage-level content (verbatim quotes with full citation metadata) once the full corpus is ingested with validated citations. This is a convenience optimization (single-fetch vs. page-by-page crawling), not a permission change — content is already fully accessible in HTML. Decoupled from MCP external tier (FTR-098) timeline.

Auto-generated at build time from the database. ISR revalidation on content change. `Cache-Control: public, max-age=86400`.

### 3. `robots.txt`

```
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://teachings.yogananda.org/sitemap-index.xml

# Protected areas
Disallow: /admin/
Disallow: /api/v1/exports/

# AI crawlers — welcome, with rate consideration
# (Rate limits enforced at Vercel Firewall layer)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /
```

### 3a. No Content Gating — Architectural Prohibition on DRM

The portal serves full text in semantic HTML. No DRM, FlipBook, canvas-rendered text, image-based text, JavaScript-dependent text rendering, or other machine-opaque content presentation is permitted.

**Five reasons content gating is architecturally prohibited:**

1. **Global-First (PRI-05).** DRM technologies require JavaScript, modern browsers, and substantial bandwidth. A seeker on a JioPhone via 2G cannot use them. HTML-first progressive enhancement means full text is in the DOM — and if it's in the DOM, it's crawlable. No technical path to "readable by humans but not machines" exists without destroying Global-First.

2. **Accessibility (PRI-07).** Screen readers, text-to-speech, browser readers, Braille displays, and translation services all consume the DOM. DRM that blocks machine reading also blocks assistive technology. WCAG 2.1 AA and content gating are incompatible.

3. **Mission alignment.** Every crawler that indexes a passage, every LLM that cites Yogananda with attribution, every search engine that surfaces a teaching — that is mission fulfillment.

4. **Canonical source strategy.** Non-authorized copies already permeate LLM training data. The portal wins by being the authoritative source with correct citations, not by being gated.

5. **Signpost extension (PRI-04).** More discovery channels — search engines, AI assistants, RSS readers, voice assistants — means more opportunities for the signpost function.

**What protects the content:** Multi-layered copyright communication (FTR-117): legal pages, `X-Copyright` headers, `llms.txt` copyright section, JSON-LD `copyrightHolder` metadata, and terms of use. Copyright retention through legal and metadata layers is more effective and more mission-aligned than technology walls.

**AI training explicitly welcomed.** Non-authorized copies already exist in LLM training corpora from pirated sources. By welcoming training on the portal's correctly cited content, the portal improves fidelity of AI-generated Yogananda references globally. The boundary: derivative works (repackaging content as a different product, generating "inspired by" content that blurs attribution) are prohibited.

### 4. XML Sitemaps

```
/sitemap-index.xml
├── /sitemap-books.xml — Book and chapter pages
├── /sitemap-audio.xml — Audio recording pages
├── /sitemap-themes.xml — Theme/topic pages
├── /sitemap-videos.xml — Video pages
├── /sitemap-passages.xml — High-traffic shared passages
└── /sitemap-pages.xml — Static pages (about, quiet, etc.)
```

Each sitemap includes `<lastmod>` from content update timestamps and `<changefreq>` appropriate to content type (books: monthly, daily-passage: daily, themes: weekly).

### 5. RSS/Atom Feeds

```
/feed/daily-passage.xml — Today's Wisdom (daily)
/feed/new-content.xml — New books, recordings, videos (irregular)
/feed/audio.xml — New audio recordings
/feed/updates.xml — Portal feature updates (FTR-092)
```

**Feed auto-discovery:** Every page's `<head>` includes `<link rel="alternate">` tags:

```html
<link rel="alternate" type="application/rss+xml"
      title="Today's Wisdom — Paramahansa Yogananda"
      href="/feed/daily-passage.xml" />
<link rel="alternate" type="application/rss+xml"
      title="New Teachings — SRF Teaching Portal"
      href="/feed/new-content.xml" />
```

Audio and update feeds added to relevant pages only: `/feed/audio.xml` on audio pages, `/feed/updates.xml` on homepage and `/about`.

**Why RSS:** RSS is the only subscription mechanism requiring zero identity disclosure — DELTA-compliant by design (PRI-09). Zero-auth consumption serves Global-First (PRI-05). Native triggers in Zapier, IFTTT, Make.com enable SRF's existing automation workflows. Libraries and academic aggregators consume RSS as a standard discovery protocol. Cached XML survives portal downtime. No engagement metrics feedback — architecturally consistent with PRI-08. Complementary to webhooks (FTR-086) and daily email (FTR-154) — seeker chooses the channel.

### 6. OpenAPI Specification

```
/api/v1/openapi.json — Machine-readable API documentation
```

Auto-generated from route handler types. Enables client libraries, API explorers, and integration testing.

### 7. Crawler-Tier Rate Limiting

Extends FTR-097's rate limiting with a separate tier for known crawler user agents:

| Tier | Rate Limit | User Agents |
|------|-----------|-------------|
| Anonymous | 30 req/min | Unknown / unidentified |
| Known crawler | 120 req/min | Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot |
| API consumer (future) | 300 req/min | Authenticated API keys (STG-023+) |

Known crawlers verified by reverse DNS where possible (Googlebot verification).

### 8. Citation Meta Tags and Social Card Tags

```html
<meta name="citation_title" content="Autobiography of a Yogi" />
<meta name="citation_author" content="Paramahansa Yogananda" />
<meta name="citation_publisher" content="Self-Realization Fellowship" />
<meta name="citation_chapter" content="14" />
<meta name="citation_page" content="142" />
```

Google Scholar citation format for academic search engine indexing.

**Twitter/X Card tags** alongside Open Graph tags. `summary_large_image` for pages with strong visual content (passage shares, book pages, audio). `summary` for utility pages. These also serve Bluesky, Mastodon, and other platforms that adopted the Twitter Card spec.

```html
<!-- Passage share pages -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Paramahansa Yogananda" />
<meta name="twitter:description" content="The soul is ever free; it is deathless, birthless..." />
<meta name="twitter:image" content="https://teachings.yogananda.org/api/v1/og/[chunk-id]" />
<meta name="twitter:image:alt" content="A passage from Autobiography of a Yogi by Paramahansa Yogananda" />

<!-- All other pages -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@YoganandaSRF" />
```

### 8a. OG Image Requirements

OG quote images generated by `@vercel/og` at minimum **1200x630px** for Google Discover eligibility. The route accepts an optional `width` parameter for larger variants. The passage share OG image is the portal's most important social surface.

### 9. Canonical URL Policy

Every page emits `<link rel="canonical">` to prevent duplicate content indexing.

| Scenario | Canonical | Alternate/Redirect |
|----------|-----------|-------------------|
| Passage in reader vs. passage share | `/passage/[chunk-id]` | `/books/[slug]/[chapter]#chunk-[id]` (alternate view) |
| English page with/without locale prefix | `/books/autobiography-of-a-yogi` (no prefix) | `/en/books/...` → 301 redirect to prefixless |
| Share URL with `?h=` hash parameter | Strip `?h=` for canonical | `/passage/abc123?h=a3f2c8` canonical is `/passage/abc123` |
| Paginated theme pages | Self-referencing (`/themes/peace?cursor=xyz`) | `rel="prev"` / `rel="next"` for pagination chain |
| API routes | No canonical (not indexed) | — |
| Non-English locale pages | Self-referencing with locale prefix | `hreflang` alternates link all locale variants (STG-021) |

Implementation: Next.js `generateMetadata` returns absolute canonical URLs consistent with sitemap entries. Passage share pages are canonical for their content; reader deep links are the reading context.

**`hreflang` (STG-021):** Every page emits `<link rel="alternate" hreflang="{locale}">` for all available language variants, plus `hreflang="x-default"` pointing to English. Per-locale sitemaps include `<xhtml:link rel="alternate">` entries.

### 10. IndexNow — Instant Search Engine Notification

Notifies search engines immediately on content changes rather than waiting for the next crawl cycle. [IndexNow](https://www.indexnow.org/) sends HTTP POST to Bing, Yandex, Seznam, Naver, and other participating engines.

```typescript
// /lib/services/indexnow.ts
async function notifyIndexNow(urls: string[]): Promise<void> {
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'teachings.yogananda.org',
      key: process.env.INDEXNOW_KEY,
      keyLocation: 'https://teachings.yogananda.org/indexnow-key.txt',
      urlList: urls
    })
  });
}
```

**Trigger points:** book ingestion completes (all new chapter URLs), content correction (affected URLs), daily passage rotation (homepage), new theme page, portal update (homepage + `/updates`).

Up to 10,000 URLs per batch. Key file at `/indexnow-key.txt` verifies domain ownership.

### 11. Content Negotiation for Machine Consumers

Same content served as HTML or structured JSON based on `Accept` header:

```
GET /books/autobiography-of-a-yogi/14
Accept: text/html       → Standard HTML page
Accept: application/json → Structured JSON with citations and metadata
```

**JSON response format:**

```json
{
  "content_type": "chapter",
  "book": {
    "title": "Autobiography of a Yogi",
    "slug": "autobiography-of-a-yogi",
    "author": "Paramahansa Yogananda",
    "publisher": "Self-Realization Fellowship"
  },
  "chapter": {
    "number": 14,
    "title": "An Experience in Cosmic Consciousness",
    "passages": [
      {
        "id": "chunk-uuid",
        "text": "Verbatim passage text...",
        "paragraph_index": 1,
        "page_number": 142,
        "content_hash": "a3f2c8...",
        "themes": ["Meditation", "Cosmic Consciousness"],
        "portal_url": "/passage/chunk-uuid"
      }
    ]
  },
  "fidelity": {
    "source": "Self-Realization Fellowship",
    "portal": "teachings.yogananda.org",
    "presentation": "verbatim_only",
    "attribution_required": true
  }
}
```

**Scope:** All public page routes (`/books/...`, `/passage/...`, `/themes/...`, `/quiet`, `/about`). API routes always return JSON regardless of `Accept` header. Admin routes excluded.

**Implementation:** Next.js middleware checks `Accept` header; if `application/json` preferred, request rewrites to the corresponding API route. Reuses existing API layer. JSON response includes same `fidelity` metadata envelope as MCP external tier (FTR-098).

### 12. Google Discover and AI Overview Optimization

**Google Discover:** `max-image-preview:large` meta robots tag on all content pages:

```html
<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

Most permissive setting — large images, unlimited text snippets, full video previews. Directly serves the mission of making teachings discoverable.

**AI Overviews:** Structured data (`Quotation` with `citation` field) enables correct attribution. Meta descriptions front-loaded with meaningful content — attribution survives truncation. `SpeakableSpecification` serves audio read-aloud.

**Bing Copilot:** Served by permissive `robots.txt`, structured data, sitemaps, `llms.txt` citation guidance, content negotiation, and IndexNow for freshness.

### 13. Prerender Hints (Speculation Rules)

Chrome Speculation Rules API prerenders likely navigation targets. Progressive enhancement — ignored by unsupported browsers.

```html
<script type="speculationrules">
{
  "prerender": [
    {
      "where": { "selector_matches": "a[data-prerender]" },
      "eagerness": "moderate"
    }
  ],
  "prefetch": [
    {
      "where": { "selector_matches": "a[data-prefetch]" },
      "eagerness": "moderate"
    }
  ]
}
</script>
```

| Current Page | Prerender Target | Rationale |
|-------------|-----------------|-----------|
| Chapter reader | Next chapter | Linear reading is dominant pattern |
| Book landing | Chapter 1 | Primary CTA |
| Theme page | First passage's "Read in context" chapter | Most likely click |
| Search results | Top result's passage page | Most likely click |
| Homepage | Today's Wisdom "Show me another" | Daily visitor's primary interaction |

One `data-prerender` per page (Chrome limits concurrent prerenders), added server-side. `data-prefetch` on next 2-3 likely targets.

### 14. `.well-known/security.txt`

Per RFC 9116:

```
Contact: mailto:security@yogananda.tech
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://teachings.yogananda.org/.well-known/security.txt
Policy: https://teachings.yogananda.org/legal#security
```

`Contact` email to be confirmed with SRF's AE team. `Expires` updated annually.

### 15. Rendering Strategy per Route

| Route | Rendering | Revalidation | Crawl Priority |
|-------|-----------|-------------|----------------|
| `/` | ISR | 5 min | Highest |
| `/search?q=...` | SSR | No cache | Medium |
| `/themes/[slug]` | ISR | 1 hour | High |
| `/quiet` | ISR | 1 hour | Medium |
| `/books` | ISR | 24 hours | High |
| `/books/[slug]` | ISR | 24 hours | High |
| `/books/[slug]/[chapter]` | ISR | 7 days | High |
| `/passage/[chunk-id]` | ISR | 7 days | Highest |
| `/about` | ISR | 7 days | Medium |
| `/events` | ISR | 24 hours | Low |
| `/places` | ISR | 7 days | Low |
| `/videos` | ISR | 1 hour | Medium |
| `/browse` | ISR | 24 hours | High |
| `/bookmarks` | CSR | N/A | None (`noindex`) |
| `/study` | CSR | N/A | None (`noindex`) |
| `/feedback` | SSR | N/A | None (`noindex`) |
| `/privacy`, `/legal` | ISR | 30 days | Low |
| `/admin/*` | CSR | N/A | None (Disallow) |

**Principles:** Every content page is ISR or SSR — crawlers always receive complete HTML with JSON-LD, OG tags, and full text. Client-only pages are `noindex`. ISR revalidation matches content volatility. `/browse` is the ideal crawl target — single page listing all navigable content, < 20KB, zero JavaScript, pure semantic HTML.

## Implementation Staging

- **STG-004:** `robots.txt`, crawler-tier rate limits, IndexNow, JSON-LD on all pages, XML sitemaps, citation meta tags, Twitter Card tags, `llms.txt`, `llms-full.txt` (metadata-only), canonical URL policy, `max-image-preview:large` meta, RSS auto-discovery tags, OpenAPI spec, content negotiation middleware, `security.txt`, rendering strategy, OG images at 1200x630px
- **STG-005:** Speculation Rules prerender hints
- **STG-020:** RSS feeds with auto-discovery
- **STG-020+:** `llms-full.txt` expanded to passage-level content
- **STG-021:** `hreflang` tags and per-locale sitemaps

**Extends:** FTR-097 (rate limiting with crawler tiers), FTR-015 (content negotiation on page routes), FTR-132 (canonical URL policy), FTR-098 (`llms-full.txt` as static complement to MCP). **Complements:** FTR-016 (copyright response headers), FTR-117 (copyright communication).

## Notes

Migrated from original FTR-059 per FTR-084. Consolidated rationale and alternatives analysis; specification sections preserved in full.
