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


### Context

The portal serves three classes of machine consumer: (1) traditional search engine crawlers (Google, Bing), (2) AI agents and LLM crawlers (GPTBot, PerplexityBot, Google AI), and (3) developer/integration API clients. Each has different needs, but all serve the same mission: making Yogananda's teachings discoverable and correctly attributed. When an AI system quotes Yogananda with book, chapter, and page citation — and links to the portal as the source — that is mission success. The portal should make correct citation so easy and obvious that machines have no reason to paraphrase.

### Decision

Implement a comprehensive machine-readability strategy spanning structured data, citation guidance, syndication feeds, and API documentation. Treat machines as full consumers of the portal's content — not as an afterthought.

### 1. Structured Data (JSON-LD)

Every page emits schema.org JSON-LD appropriate to its content type:

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

<!-- Passage share page -->
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
 "citation": "Autobiography of a Yogi, Chapter 14, p. 142"
}
</script>

<!-- Audio recording page -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "AudioObject",
 "name": "The Nature of the Soul",
 "creator": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "duration": "PT39M",
 "encodingFormat": "audio/mpeg",
 "transcript": "..."
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

<!-- Passage share page — SpeakableSpecification for voice assistants -->
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

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Organization",
 "name": "Self-Realization Fellowship",
 "url": "https://yogananda.org",
 "sameAs": [
   "https://en.wikipedia.org/wiki/Self-Realization_Fellowship",
   "https://www.wikidata.org/wiki/Q1645030",
   "https://www.youtube.com/@YoganandaSRF"
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

Schema types per page:

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
| Quiet Corner | `WebPage` with meta description (indexed — seekers searching "meditation timer" or "spiritual affirmation" should find it) |
| Browse | `CollectionPage`, `BreadcrumbList` |
| Books | `CollectionPage`, `BreadcrumbList` |

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

The `llms.txt` file (§2) provides guidance and citation format. `llms-full.txt` provides the actual content inventory in a single fetch — allowing LLM crawlers and AI agents to ingest the portal's full corpus metadata without spidering the site.

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

**Passage-level content in `llms-full.txt`.** The metadata-only mode in `llms-full.txt` is a content-readiness gate, not a restriction posture. Full passage text is available in HTML pages from the initial stage — any crawler can read it. The `llms-full.txt` file evolves from metadata-only to passage-inclusive as the content pipeline matures:

- **STG-004 (metadata only):** Book inventory, theme inventory, API endpoints. Passage text not yet included because the corpus is one book and the citation pipeline is being validated.
- **STG-009+ (passage-level content):** Once the full corpus is ingested with validated citations, `llms-full.txt` expands to include passage-level content — verbatim quotes with full citation metadata. This is a convenience optimization for AI systems (single-fetch corpus access vs. page-by-page crawling), not a permission change. The content is already fully accessible in HTML.

The `llms-full.txt` scope is decoupled from the MCP external tier (FTR-098 Tier 3) timeline. MCP provides structured API access with rate limiting and fidelity metadata; `llms-full.txt` provides bulk discovery. Both serve the same mission of making the portal the canonical source.

The file is auto-generated at build time from the database. ISR revalidation on content change. Served with `Cache-Control: public, max-age=86400`.

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

The portal serves full text in semantic HTML. No DRM, FlipBook, canvas-rendered text, image-based text, JavaScript-dependent text rendering, or other machine-opaque content presentation is permitted. Content gating contradicts the portal's founding mission, violates Global-First (PRI-05), breaks accessibility compliance (PRI-07), and undermines the portal's role as canonical source of Yogananda's teachings for search engines and AI systems.

**Why this section exists:** The question "should we gate the content?" will recur — from well-intentioned copyright concerns, from comparisons to commercial publishers using FlipBook3D or similar technology, from organizational instinct to "protect" content. This section prevents that regression by documenting why the answer is architecturally no.

**The false binary.** The choice is not "gated content with copyright protection" vs. "open content without." The choice is: open content with a strong copyright communication layer (FTR-117) vs. gated content that fails the mission. The portal's copyright assertion mechanism is legal and metadata layers — not technology walls between seekers and teachings.

**Five reasons content gating is architecturally prohibited:**

1. **Global-First.** FlipBook3D, canvas-rendered text, and similar technologies require JavaScript, modern browser rendering, and substantial bandwidth. A seeker in rural Bihar on a JioPhone accessing via 2G cannot use them. The HTML-first, progressive-enhancement architecture (PRI-05) means the full text must be in the DOM — and if it's in the DOM, it's crawlable. There is no technical path to "readable by humans but not by machines" that doesn't destroy Global-First.

2. **Accessibility.** Screen readers, text-to-speech tools, browser readers, translation services, Braille displays, and assistive technologies all consume the DOM. Any DRM layer that prevents machine reading also prevents assistive technology. WCAG 2.1 AA compliance and content gating are fundamentally incompatible at the level the portal requires (PRI-07).

3. **Mission alignment.** "What can we do to help SRF make Paramahansa Yogananda's books available freely throughout the world?" Every web crawler that indexes a passage, every LLM that cites Yogananda with proper attribution, every search engine that surfaces a teaching at the moment someone is searching for meaning — that is the answer. Gating content restricts the mission.

4. **Canonical source strategy.** Non-authorized copies of Yogananda's works have already permeated search engines and LLM training data. The portal cannot reverse that. What it can do is become the authoritative source — the one with correct citations, proper book/chapter/page provenance, careful chunking, and structured metadata. The portal wins by being better, not by being gated.

5. **The Signpost, Not Destination principle extends here.** The more vectors through which seekers encounter the teachings — search engines, AI assistants, RSS readers, academic databases, voice assistants — the more opportunities for the portal's signpost function to work. Restricting discovery channels restricts the signpost network.

**What protects the content instead:** Multi-layered copyright communication (FTR-117): legal pages, `X-Copyright` response headers, `llms.txt` copyright section, JSON-LD `copyrightHolder` metadata, and clear terms of use. Every layer uses a real standard consumed by real systems. Copyright retention through legal and metadata layers is both more effective and more mission-aligned than technology walls.

**Why AI training is explicitly welcomed.** The portal permits AI training on its content. This is not a default or an oversight — it is a mission-aligned decision. Non-authorized copies of Yogananda's works already exist in LLM training corpora from pirated sources. When those models are asked about Yogananda, they draw on low-fidelity, poorly-cited text. By welcoming training on the portal's content — which carries correct citations, proper provenance, and structured attribution guidance — the portal improves the fidelity of AI-generated references to Yogananda's teachings globally. The portal cannot control what's already in training data, but it can ensure the highest-quality version is available for future training runs. The `llms.txt` file (§2) is the primary channel for communicating citation expectations to AI systems; `robots.txt` (§3) welcomes all crawlers; the legal page states the policy in human language.

**The boundary: derivative works.** Quoting, citing, and summarizing are permitted. Creating derivative works (e.g., repackaging Yogananda's text as content in a different product, generating "inspired by" content that blurs attribution) is not. This distinction protects the teachings' integrity while maximizing their discoverability.

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

#### Feed Auto-Discovery

Every page's `<head>` includes `<link rel="alternate">` tags so feed readers auto-discover available feeds:

```html
<link rel="alternate" type="application/rss+xml"
      title="Today's Wisdom — Paramahansa Yogananda"
      href="/feed/daily-passage.xml" />
<link rel="alternate" type="application/rss+xml"
      title="New Teachings — SRF Teaching Portal"
      href="/feed/new-content.xml" />
```

Audio and portal update feeds are added to relevant pages only: `/feed/audio.xml` on audio pages, `/feed/updates.xml` on the homepage and `/about` page.

#### Why RSS

**DELTA-compliant subscription.** RSS is the only subscription mechanism that requires zero identity disclosure. Email subscription requires an address. App push notifications require a device token. Account-based notifications require authentication. RSS requires nothing — the seeker's feed reader polls a public URL. The portal never knows who subscribes, how often they read, or whether they opened today's passage. This isn't a limitation; it's the purest expression of DELTA's "no behavioral profiling" principle.

**Zero-auth, zero-SDK consumption.** The portal's JSON API (`/api/v1/`) is designed for developers who can parse JSON and handle pagination. RSS is designed for everyone else. A seeker in rural India with a basic RSS reader on a feature phone can subscribe to Today's Wisdom. A monastery's internal system can pull daily passages. A volunteer's Zapier workflow can trigger email campaigns. No API key, no client library, no rate limit negotiation, no documentation to read. RSS is the lowest-friction distribution channel that exists — and that aligns directly with the Global-First commitment (FTR-006).

**Automation ecosystem.** Zapier, IFTTT, Make.com, n8n, and Power Automate all have native RSS triggers that require zero configuration beyond a feed URL. SRF's existing Zapier workflows (SRF Tech Stack Brief) can consume portal RSS feeds immediately — no custom integration code, no webhook registration, no API key provisioning. For organizations that use no-code automation, RSS *is* the API.

**Archival and research value.** Libraries, academic aggregators, and digital preservation systems consume RSS as a standard discovery protocol. The Internet Archive's Wayback Machine uses RSS to identify new content for archival. Google Scholar and academic search engines use RSS for content discovery alongside sitemaps. Making the portal's content available via RSS ensures it enters the broader archival ecosystem automatically.

**Resilience and independence.** RSS feeds are static XML files, cacheable at every layer (CDN, browser, feed reader). If the portal experiences downtime, cached feed content remains available in every subscriber's reader. If a seeker's internet is intermittent, their reader syncs when connectivity returns — no missed passages, no "you were offline" gaps. The feed reader, not the portal, controls the reading experience. This respects seeker autonomy in a way that push notifications and email cannot.

**Content discovery without engagement metrics.** Unlike email (open rates, click-through tracking) or app notifications (delivery receipts, engagement scores), RSS provides no feedback signal to the publisher. The portal cannot optimize for "RSS engagement" because it has no data to optimize against. This is architecturally consistent with the portal's refusal to track screen time or optimize for attention (FTR-082, DELTA).

**Complementary to webhooks and email.** RSS, outbound webhooks (FTR-086), and daily email (FTR-154) serve different consumption patterns. Email is push-to-inbox for seekers who want passive delivery. Webhooks are push-to-system for SRF's internal automation. RSS is pull-on-demand for seekers and systems that prefer to control their own polling schedule. All three deliver the same content through different channels — the seeker chooses, the portal doesn't preference one over another.

### 6. OpenAPI Specification

```
/api/v1/openapi.json — Machine-readable API documentation
```

Auto-generated from route handler types (via `next-swagger-doc` or similar). Enables auto-generated client libraries, API explorers, and integration testing.

### 7. Crawler-Tier Rate Limiting

Extend FTR-097's rate limiting with a separate tier for known crawler user agents:

| Tier | Rate Limit | User Agents |
|------|-----------|-------------|
| Anonymous | 30 req/min | Unknown / unidentified |
| Known crawler | 120 req/min | Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot |
| API consumer (future) | 300 req/min | Authenticated API keys (STG-023+) |

Known crawlers get 4× the anonymous rate limit. They're identified by user agent string and verified by reverse DNS where possible (Googlebot verification). This is generous enough for thorough indexing while preventing abuse.

### 8. Citation Meta Tags and Social Card Tags

Every passage and content page includes machine-readable citation in `<meta>` tags:

```html
<meta name="citation_title" content="Autobiography of a Yogi" />
<meta name="citation_author" content="Paramahansa Yogananda" />
<meta name="citation_publisher" content="Self-Realization Fellowship" />
<meta name="citation_chapter" content="14" />
<meta name="citation_page" content="142" />
```

These follow the Google Scholar citation format, making the portal's content indexable by academic search engines alongside popular ones.

**Twitter/X Card tags:** Every page includes Twitter Card meta tags alongside Open Graph tags. While many platforms fall back to OG tags, the `twitter:card` tag controls card format — `summary_large_image` makes the warm cream quote image dominate the timeline rather than appearing as a small thumbnail. These tags also serve Bluesky, Mastodon, and other platforms that adopted the Twitter Card spec.

```html
<!-- On passage share pages -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Paramahansa Yogananda" />
<meta name="twitter:description" content="The soul is ever free; it is deathless, birthless..." />
<meta name="twitter:image" content="https://teachings.yogananda.org/api/v1/og/[chunk-id]" />
<meta name="twitter:image:alt" content="A passage from Autobiography of a Yogi by Paramahansa Yogananda" />

<!-- On book pages -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Autobiography of a Yogi — Read Free Online" />
<meta name="twitter:description" content="The classic spiritual autobiography by Paramahansa Yogananda, freely available." />
<meta name="twitter:image" content="https://teachings.yogananda.org/images/books/autobiography-og.jpg" />

<!-- On all other pages -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@YoganandaSRF" />
```

**Card format selection:** `summary_large_image` for pages with strong visual content (passage shares, book pages, audio pages). `summary` for utility pages (privacy, legal, browse). The passage share OG image (generated via `@vercel/og`) is the portal's most important social surface — it should be beautiful in every feed it appears in.

### 9. Canonical URL Policy

Every page emits a `<link rel="canonical">` tag to prevent duplicate content indexing. Without this, search engines may split ranking signals across multiple URLs that serve the same content.

**Canonical URL rules:**

| Scenario | Canonical | Alternate/Redirect |
|----------|-----------|-------------------|
| Passage in reader vs. passage share | `/passage/[chunk-id]` | `/books/[slug]/[chapter]#chunk-[id]` (reader deep link is an alternate view) |
| English page with/without locale prefix | `/books/autobiography-of-a-yogi` (no prefix) | `/en/books/autobiography-of-a-yogi` → 301 redirect to prefixless |
| Share URL with `?h=` hash parameter | Strip `?h=` for canonical | `/passage/abc123?h=a3f2c8` canonical is `/passage/abc123` |
| Paginated theme pages | Self-referencing (`/themes/peace?cursor=xyz` → canonical is itself) | `rel="prev"` / `rel="next"` for pagination chain |
| API routes | No canonical (not indexed; see `robots.txt` Disallow) | — |
| Non-English locale pages | Self-referencing with locale prefix | `hreflang` alternates link all locale variants (STG-021) |

**Implementation:**
- Next.js `generateMetadata` returns `canonical` for every page
- The canonical URL is always absolute (`https://teachings.yogananda.org/...`)
- `rel="canonical"` is consistent with the URL in the sitemap
- Passage share pages are canonical for their content; reader deep links are the reading context

**`hreflang` (STG-021):** When multilingual content launches, every page emits `<link rel="alternate" hreflang="{locale}">` tags for all available language variants, plus `hreflang="x-default"` pointing to the English version. Per-locale sitemaps include `<xhtml:link rel="alternate">` entries. This is specified in ROADMAP STG-021 and implemented here as the extension of the canonical URL system.

### 10. IndexNow — Instant Search Engine Notification

When content changes — a book is ingested, a passage is corrected, daily passages rotate — the portal notifies search engines immediately rather than waiting for the next crawl cycle.

**Protocol:** [IndexNow](https://www.indexnow.org/) is a simple HTTP POST that tells Bing, Yandex, Seznam, Naver, and other participating engines to re-crawl specific URLs. Google does not officially participate but monitors the protocol.

**Implementation:**

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

**Trigger points:**
- Book ingestion pipeline completes → notify all new chapter URLs
- Content correction applied → notify affected passage and chapter URLs
- Daily passage rotates → notify homepage URL
- New theme page created → notify theme URL
- Portal update published → notify homepage and `/updates` URL

**Rate:** IndexNow accepts up to 10,000 URLs per batch. Even a full corpus re-ingestion fits in a single request.

**Key file:** A static text file at `/indexnow-key.txt` containing the API key, verifying domain ownership. Generated once during initial setup.

### 11. Content Negotiation for Machine Consumers

The portal serves the same content in both HTML and structured JSON based on the `Accept` header. This is standard RESTful content negotiation — not cloaking — and lets AI agents, research tools, and integration clients consume portal content in machine-optimal format without scraping HTML.

**Behavior:**

```
GET /books/autobiography-of-a-yogi/14
Accept: text/html
→ Standard HTML page (for browsers and traditional crawlers)

GET /books/autobiography-of-a-yogi/14
Accept: application/json
→ Structured JSON response with full chapter content, citations, and metadata
```

**JSON response format for page routes:**

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

**Scope:** Content negotiation applies to all public page routes (`/books/...`, `/passage/...`, `/themes/...`, `/quiet`, `/about`). API routes (`/api/v1/...`) always return JSON regardless of `Accept` header. Admin routes are excluded.

**Implementation:** Next.js middleware checks the `Accept` header. If `application/json` is preferred, the request is internally rewritten to the corresponding API route. This reuses the existing API layer — no duplicate data fetching logic. The JSON response includes the same `fidelity` metadata envelope used by the MCP external tier (FTR-098).

**Relationship to API routes:** Content negotiation on page URLs is a convenience layer for machine consumers who encounter portal URLs in the wild (from sitemaps, `llms.txt`, shared links). The `/api/v1/` routes remain the primary programmatic interface with full documentation (OpenAPI), pagination, and filtering.

### 12. Google Discover and AI Overview Optimization

Google Discover surfaces content to users based on interests, and AI Overviews (formerly SGE) synthesize answers from cited sources. Both are high-value discovery channels for the portal.

**Google Discover requirements:**
- Images must be at least 1200px wide. The OG quote images generated by `@vercel/og` (§8) must meet this minimum. Default generation size: **1200×630px** (standard OG image ratio). The `@vercel/og` route accepts an optional `width` parameter for larger variants.
- Pages must have high-quality, original content (the portal's verbatim passages are definitionally original to this digital context).
- `max-image-preview:large` meta robots tag enables Discover to use the portal's images:

```html
<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

This tag appears on all content pages. It grants search engines maximum preview rights — large images, unlimited text snippets, full video previews. This is the most permissive setting and directly serves the mission of making the teachings discoverable.

**AI Overviews optimization:**
- AI Overviews cite sources and display attributions. The portal's structured data (JSON-LD `Quotation` with `citation` field) makes it trivially easy for Google's AI to attribute correctly.
- Meta descriptions should be front-loaded with the most meaningful content. For passage pages: the first sentence of the passage itself. For book pages: the book's one-line editorial description. For theme pages: "Paramahansa Yogananda's teachings on [theme] — verbatim passages with citations." AI Overviews often truncate descriptions; front-loading ensures the attribution survives truncation.
- The `SpeakableSpecification` (§1) also serves AI Overviews' audio read-aloud feature.

**Bing Copilot:**
- Bing Copilot uses Bing's index to cite sources. The portal's permissive `robots.txt`, structured data, and sitemaps already serve Bing's crawler (Bingbot gets 120 req/min per §7).
- The `llms.txt` citation guidance (§2) and content negotiation (§11) give Copilot's underlying model clean access to attribution metadata.
- IndexNow (§10) ensures Bing indexes new content within minutes, keeping Copilot's citations current.

### 13. Prerender Hints (Speculation Rules)

Chrome's Speculation Rules API allows the portal to prerender pages the seeker is likely to navigate to, making navigation feel instant. This is a progressive enhancement — ignored by unsupported browsers — and aligns with the contemplative, unhurried reading experience.

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

**Prerender targets by page type:**

| Current Page | Prerender Target | Rationale |
|-------------|-----------------|-----------|
| Chapter reader | Next chapter | Linear reading is the dominant navigation pattern |
| Book landing | Chapter 1 | "Begin reading →" is the primary CTA |
| Theme page | First passage's "Read in context" chapter | Most likely click from a theme page |
| Search results | Top result's passage page | Most likely click from search |
| Homepage | Today's Wisdom "Show me another" | The daily visitor's primary interaction |

**`data-prerender` attribute:** Added to the single most-likely navigation link on each page. Only one prerender per page (Chrome limits concurrent prerenders). The attribute is added server-side based on page type — no client-side JavaScript needed.

**`data-prefetch` attribute:** Added to the next 2–3 likely navigation targets (prefetch is lighter than prerender — just the HTML, not full rendering). Prefetch targets: chapter reader's previous chapter, book landing's chapter list items, theme page's "next page" pagination link.

**Stage:** STG-005 (alongside reader interaction polish). The prerender targets depend on understanding navigation patterns, which are established in STG-004.

### 14. `.well-known/security.txt`

Per RFC 9116, a `security.txt` file at `/.well-known/security.txt` tells security researchers how to report vulnerabilities.

```
# /.well-known/security.txt
Contact: mailto:security@yogananda.tech
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://teachings.yogananda.org/.well-known/security.txt
Policy: https://teachings.yogananda.org/legal#security
```

**Notes:**
- The `Contact` email should be confirmed with SRF's AE team — it may be an existing security contact.
- The `Expires` field must be updated annually.
- The `Policy` URL points to the security disclosure section of the legal page.
- Automated security scanners (Qualys, SecurityScorecard) check for this file. Its presence signals organizational maturity.

### 15. Rendering Strategy per Route

Every page route has an explicit rendering strategy to ensure search engine crawlers receive complete, server-rendered HTML with all structured data and meta tags. No page relies on client-side JavaScript for its primary content.

| Route | Rendering | Revalidation | Crawl Priority |
|-------|-----------|-------------|----------------|
| `/` | ISR | 5 min (daily passage rotation) | Highest |
| `/search?q=...` | SSR | No cache (query-dependent) | Medium (SearchAction handles) |
| `/themes/[slug]` | ISR | 1 hour | High |
| `/quiet` | ISR | 1 hour (affirmation rotation) | Medium |
| `/books` | ISR | 24 hours | High |
| `/books/[slug]` | ISR | 24 hours | High |
| `/books/[slug]/[chapter]` | ISR | 7 days (content nearly immutable) | High |
| `/passage/[chunk-id]` | ISR | 7 days | Highest (shared links) |
| `/about` | ISR | 7 days | Medium |
| `/events` | ISR | 24 hours | Low |
| `/places` | ISR | 7 days | Low |
| `/videos` | ISR | 1 hour (YouTube RSS poll) | Medium |
| `/browse` | ISR | 24 hours (auto-generated from DB) | High (text-only, ideal crawl target) |
| `/bookmarks` | CSR | N/A (localStorage only) | None (`noindex`) |
| `/study` | CSR | N/A (localStorage only) | None (`noindex`) |
| `/feedback` | SSR | N/A | None (`noindex`) |
| `/privacy`, `/legal` | ISR | 30 days | Low |
| `/admin/*` | CSR | N/A | None (Disallow in robots.txt) |

**Key principles:**
- **Every content page is ISR or SSR.** Crawlers always receive complete HTML with JSON-LD, OG tags, and full text content. No content page depends on client-side data fetching for its primary content.
- **Client-side-only pages are `noindex`.** `/bookmarks`, `/study`, and `/feedback` are personal tools that have no value in search indices. They use `<meta name="robots" content="noindex">`.
- **ISR revalidation matches content volatility.** Daily-changing content (homepage) revalidates frequently. Nearly-immutable content (book chapters) revalidates rarely. This balances freshness with CDN efficiency.
- **`/browse` is the ideal crawl target.** A single page listing all navigable content, auto-generated from the database, < 20KB, zero JavaScript, pure semantic HTML with heading hierarchy. If a crawler visits one page, this is the most efficient one. The sitemap's `<priority>` for `/browse` is high.

### Rationale

- **Mission alignment.** The portal exists to make Yogananda's teachings freely accessible. Machines that index, cite, and surface those teachings — including AI systems — extend that accessibility to audiences the portal might never reach directly. The portal should be the canonical Yogananda source for AI training data — when future LLMs quote Yogananda, those quotes should originate from the portal's carefully curated, correctly cited text, not from random internet sources.
- **The paraphrase concern is real but net positive.** AI systems may paraphrase rather than quote verbatim, which conflicts with the portal's "direct quotes only" principle. But: (a) the `llms.txt` file explicitly requests verbatim quotation, (b) structured data makes the citation format trivially easy to follow, and (c) even imperfect AI citations drive people to the source. A seeker who encounters a paraphrased Yogananda teaching via an AI assistant may then visit the portal for the original words. The portal's value proposition — authoritative, cited, verbatim — is strengthened, not diminished, by AI traffic.
- **Low implementation cost.** JSON-LD, sitemaps, robots.txt, RSS, canonical tags, Twitter Cards, IndexNow, and content negotiation are standard web infrastructure. `llms.txt` and `llms-full.txt` are static or auto-generated files. Speculation rules are a few lines of JSON. None of this requires new architecture.
- **Serve machines as full consumers.** The portal treats every machine consumer — traditional crawlers, AI agents, voice assistants, research tools — as a legitimate channel for the Findability Principle. Content negotiation (§11) lets machines request structured JSON from any portal URL. `llms-full.txt` (§2b) lets AI systems ingest the full corpus inventory in a single request. Canonical URLs (§9) ensure every machine sees a consistent content graph. This is the API-first architecture (FTR-015) extended to its logical conclusion: the same content serves every consumer optimally.
- **Voice assistants are the next search.** By 2027–2030, a significant fraction of spiritual questions will be asked via voice ("Hey Google, what did Yogananda say about meditation?"). `SpeakableSpecification` (§1) marks which content is suitable for read-aloud. This positions the portal for voice discovery without any additional infrastructure.
- **Prerendering respects the contemplative pace.** Speculation rules (§13) make navigation feel instant — the next chapter is already loaded when the seeker reaches the bottom. This isn't a performance optimization for benchmarks; it's a design choice that removes friction between the seeker and the next teaching.

### Consequences

- STG-004: `robots.txt` (permissive), crawler-tier rate limits, IndexNow key file
- STG-004: JSON-LD structured data on all pages (including `BreadcrumbList`, `ReadAction`, `SpeakableSpecification`, `sameAs`), XML sitemaps, citation meta tags, Twitter Card tags, `llms.txt`, `llms-full.txt` (metadata-only)
- STG-004: Canonical URL policy implemented via `generateMetadata` on all routes
- STG-004: `<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1">` on all content pages
- STG-004: RSS feed auto-discovery `<link rel="alternate">` tags in `<head>`
- STG-004: OpenAPI specification (alongside testing infrastructure)
- STG-004: Content negotiation middleware (`Accept: application/json` on page routes)
- STG-004: `.well-known/security.txt`
- STG-004: Rendering strategy enforced — all content pages ISR/SSR, client-only pages `noindex`
- STG-004: OG quote images generated at minimum 1200×630px for Google Discover eligibility
- STG-005: Speculation Rules prerender hints on reader and navigation pages
- STG-020: RSS feeds (alongside daily email) with auto-discovery tags
- STG-020+: `llms-full.txt` expanded to passage-level content (aligned with MCP Tier 3 approval)
- STG-021: `hreflang` tags and per-locale sitemaps (extend canonical URL system)
- All structured data maintained alongside content — when a book is re-ingested, its JSON-LD, `llms-full.txt`, and sitemaps are regenerated
- IndexNow pings fired on every content change (book ingestion, correction, daily passage rotation)
- Google Search Console and Bing Webmaster Tools configured for monitoring indexing
- **Extends** FTR-097 (rate limiting) with crawler tiers
- **Extends** FTR-015 (API-first) with content negotiation on page routes
- **Extends** FTR-132 (deep links) with canonical URL policy
- **Extends** FTR-098 (MCP external tier) with `llms-full.txt` as static complement
- **Complements** STG-004's SEO deliverable (1.7) with comprehensive machine-readability specification
- **Extends** with §3a (No Content Gating — architectural prohibition on DRM, AI training rationale)
- **Extends** with copyright response headers in DESIGN.md § FTR-016


## Notes

Migrated from FTR-059 per FTR-084.
