---
ftr: 40
title: Frontend Design
summary: "Page routes, rendering strategies, and data sources for all portal pages"
state: implemented
domain: experience
governed-by: [PRI-03, PRI-05, PRI-07, PRI-10, PRI-11]
---

# FTR-040: Frontend Design

## Rationale

### Pages

| Route | Purpose | Data Source | Rendering | Indexed |
|-------|---------|------------|-----------|---------|
| `/` | Home — Today's Wisdom, search bar, thematic doors, "Seeking..." entry points, latest video | Neon (daily passages) + YouTube RSS | ISR (5 min) | Yes |
| `/search?q=...` | Search results — ranked verbatim quotes | Neon (hybrid search) | SSR | Yes (via `SearchAction`) |
| `/themes/[slug]` | Topic page — curated passages for a theme, person, principle, or practice | Neon (topic-tagged chunks) | ISR (1 hr) | Yes |
| `/quiet` | The Quiet Corner — single affirmation, timer, stillness | Neon (affirmations pool) | ISR (1 hr) | Yes |
| `/books` | Books — book catalog with editorial descriptions | Contentful (SSG/ISR) | ISR (24 hr) | Yes |
| `/books/[slug]` | Book landing page with cover, description, chapter list | Contentful (SSG/ISR) | ISR (24 hr) | Yes |
| `/bookmarks` | Lotus Bookmarks — saved chapters and passages (client-only, `localStorage`) | `localStorage` (no server) | CSR | No (`noindex`) |
| `/books/[slug]/[chapter]` | Chapter reader | Contentful (SSG/ISR) | ISR (7 days) | Yes |
| `/books/[slug]/[chapter]#chunk-[id]` | Deep link to specific passage | Same as above, scrolled to passage | ISR (7 days) | Yes (canonical: passage page) |
| `/passage/[chunk-id]` | Single passage shareable view (OG + Twitter Card optimized) | Neon | ISR (7 days) | Yes |
| `/about` | About SRF, Yogananda, the line of gurus, "Go Deeper" links | Static (ISR) | ISR (7 days) | Yes |
| `/events` | Gatherings & Events — convocation, commemorations, online events, retreats | Static (ISR) | ISR (24 hr) | Yes |
| `/places` | Sacred Places — SRF/YSS properties and biographical sites | Neon `places` table (ISR) | ISR (7 days) | Yes |
| `/places/[slug]` | Individual place detail with book cross-references | Neon `places` + `chunk_places` (ISR) | ISR (7 days) | Yes |
| `/videos` | Videos — categorized by playlist | YouTube API (ISR) | ISR (1 hr) | Yes |
| `/videos/[category]` | Filtered view (e.g., How-to-Live, Meditations) | YouTube API (ISR) | ISR (1 hr) | Yes |
| `/study` | Study Workspace — passage collection, teaching arc assembly, export (FTR-143) | `localStorage` (no server) | CSR | No (`noindex`) |
| `/collections` | Community Collections gallery — published curated passage collections (STG-024, FTR-143) | Neon | ISR (1 hr) | Yes |
| `/collections/[share-hash]` | Single community collection view | Neon | ISR (24 hr) | Yes |
| `/feedback` | Seeker feedback — citation errors, search suggestions (STG-007, FTR-061) | Neon | SSR | No (`noindex`) |
| `/privacy` | Privacy policy (FTR-085) | Static (ISR) | ISR (30 days) | Yes |
| `/legal` | Legal information — terms of use, copyright, content licensing (FTR-085) | Static (ISR) | ISR (30 days) | Yes |
| `/browse` | Complete content index — all navigable content by category (FTR-056) | Neon (ISR) | ISR (24 hr) | Yes |
| `/updates` | Portal updates — new books, features, languages (STG-020+, FTR-092) | Neon | ISR (1 hr) | Yes |

**Rendering key:** ISR = Incremental Static Regeneration (cached at CDN, revalidated on schedule). SSR = Server-Side Rendered (fresh per request). CSR = Client-Side Rendered (JavaScript only). All ISR/SSR pages deliver complete HTML with JSON-LD, OG tags, and full content to crawlers. Content negotiation (FTR-059 §11): ISR/SSR routes respond with JSON when `Accept: application/json` is sent.

### Portal Threshold — Opening Moment

On the **first visit** per browser session, the homepage presents a brief threshold:

1. Warm cream background with a small SRF lotus SVG (~40px, `--srf-gold` at 30% opacity) centered.
2. After 800ms, the lotus fades to 0% over 400ms as content fades in. Total: ~1.2s.
3. No text, no logo, no "loading..." — just a breath.

**Constraints:** First visit only (`sessionStorage`). `prefers-reduced-motion`: skipped. Deep links: never delayed. Slow connections: lotus remains visible until ready — a technical necessity becomes a contemplative gesture.

### Homepage: "The Living Library"

The homepage feels like opening a sacred book — not a SaaS dashboard. Purpose: offer stillness (Today's Wisdom), invite exploration (thematic doors), and serve the deliberate seeker (search).

#### Today's Wisdom

A single Yogananda passage displayed prominently on every visit, changing on each page load. Random selection from the `daily_passages` pool.

**Source material (priority order):** *Sayings of Paramahansa Yogananda*, *Where There Is Light*, *Metaphysical Meditations*, curated selections from any ingested book.

**Behavior:**
- "Show me another" fetches a different passage (`/api/v1/daily-passage?exclude=[current-id]`). Gentle cross-fade (300ms), no reload. With `prefers-reduced-motion`: instant swap.
- No limit on refreshes. This is bibliomancy — opening a sacred text to a random page for guidance.
- "Show me another" is a text link in Merriweather 300 with `--srf-gold` underline on hover. Not a button — an invitation.
- No personalization, no tracking, no cookies — pure randomness.

**Seasonal curation (optional, editorial):** Passages tagged with seasonal affinity (renewal in January, light in December). Soft bias: 60% seasonal / 40% general, never a hard filter.

**Circadian content choreography (FTR-146):** The passage pool carries `time_affinity` tags aligned with circadian bands:

| Band | Hours | Passage affinity |
|------|-------|-----------------|
| Dawn | 5:00–8:59 | Vitality, new beginnings, divine energy |
| Morning | 9:00–11:59 | Willpower, concentration, purpose |
| Afternoon | 12:00–16:59 | Perseverance, equanimity, courage |
| Evening | 17:00–20:59 | Gratitude, love, devotion, peace |
| Night | 21:00–4:59 | The eternal soul, fearlessness, comfort |

The 2 AM seeker encounters passages about comfort and consciousness, not willpower. Client sends `time_band` from `new Date().getHours()`; server selects from affinity-weighted pool (60% matched / 40% general). Both seasonal and circadian compose naturally.

**Solar-position awareness (STG-021+):** Fixed clock-hour bands don't account for cultural context (brahmamuhurta 3:30–5:30 AM in Indian tradition) or latitude variation. A ~5KB client-side module derives latitude from `Intl.DateTimeFormat().resolvedOptions().timeZone` + country code, computes solar position, and sends only a band name to the server. Indian locales (`hi`, `bn`) get a `brahmamuhurta` band (meditation-weighted pool). No geolocation, no IP lookup — DELTA-compliant. See FTR-146.

**API:** `GET /api/v1/daily-passage` — params: `language`, `exclude`, `time_band`. Returns chunk_id, content, book_title, page_number, chapter_title, reader_url.

#### Thematic Doors ("Doors of Entry")

Six quality theme cards below the search bar, linking to `/themes/[slug]`. Only `category = 'quality'` themes appear here. Minimal cards: theme name in Merriweather Light, centered on cream, subtle `--srf-gold` border on hover. No icons, no images — the single word is the invitation. "Explore all themes" link below leads to `/themes` with all categories (FTR-121, FTR-122).

**Theme page (`/themes/[slug]`):** 5–8 random passages from tagged pool per visit. Same format as search results. "Show more" loads 5 more (infinite gentle scroll). Only `tagged_by IN ('manual', 'reviewed')` displayed. See FTR-121 for taxonomy and FTR-122 for exploration categories.

#### Practice Bridge (FTR-055)

On passages tagged `practice_bridge: true` — where Yogananda explicitly invites the reader toward practice — a quiet note appears below the citation linking to yogananda.org/meditate and yogananda.org/lessons. Styled in `--portal-text-muted`, same weight as "Find this book." A signpost, not a funnel. See FTR-055 for full specification.

#### "Seeking..." (Empathic Entry Points)

Below-the-fold section for the 2 AM visitor. Quiet text links that execute pre-built search queries:

| Entry Point | Maps to Search Query |
|-------------|---------------------|
| "Peace in a restless mind" | `"peace calm mind anxiety restlessness stillness"` |
| "Comfort after loss" | `"death soul eternal life comfort grief immortality"` |
| "Purpose and direction" | `"purpose meaning life divine plan destiny"` |
| "Courage through fear" | `"courage fear fearlessness soul protection bravery"` |
| "The heart to forgive" | `"forgiveness love peace resentment compassion"` |

Editorially curated, culturally adapted per locale in STG-021 (FTR-135 scope). Grief elevated to primary theme page (`/themes/grief`) in STG-007. DELTA-aligned: same for every visitor, informed by aggregated search trends, not individual tracking.

### Books (`/books`) and Book Landing Page (`/books/[slug]`)

**Books page:** Generous cards — not a cramped grid. Each card: cover image (fallback: cream card with title), title (Merriweather 700), author + year (Open Sans 400), 2–3 sentence editorial description, chapter count, "Begin reading" and "Find this book" links. Scales from 1 book to 15+ without redesign. STG-021: shows books in user's language plus "Also available in English" section.

**Book landing page:** Cover image (centered, max 300px), title, author + year, optional featured quote (Merriweather 300, italic), editorial description, chapter list. Each chapter: number in `--srf-gold` + title link. Lotus bookmark indicator beside bookmarked chapters (FTR-046). "Begin reading" and "Find this book" links.

**APIs:** `GET /api/v1/books`, `GET /api/v1/books/{slug}`.

### Book Reader (`/books/[slug]/[chapter]`)

The reader is the portal's primary experience. It must feel like reading a physical book, not scrolling a web page.

#### Reading Typography

The most important decision: **line length at 65–75 characters** (`max-width: 38rem`). Wide screens get wider margins, not wider text.

| Property | Value | Rationale |
|----------|-------|-----------|
| Max text width | `38rem` (~65-75 chars) | Optimal reading length. CJK: ~30–35 chars/line (within traditional optimal), tighten line height to 1.6–1.7. |
| Font | Merriweather 400 | Serif for extended reading |
| Size | `--text-base` (18px) | Comfortable for long sessions |
| Line height | `--leading-relaxed` (1.8) | Spacious for contemplation |
| Paragraph spacing | `--space-6` (1.5rem) | Clear separation |
| Chapter title | Lora 400 at `--text-xl` | Distinct from body |
| Page numbers | `--portal-text-muted`, inline margin | Present but unobtrusive |

#### Related Teachings Side Panel (FTR-030)

Right side panel showing passages from *other books* semantically related to the current paragraph. Updates via a "settled paragraph" model: Intersection Observer watches a focus zone (upper-middle 45% of viewport), scoring visible paragraphs by `intersectionRatio * elementHeight`, with 1.2s debounce. Crossfade (300ms) on change. Source indication shows first ~40 chars of settled paragraph.

**Data and loading:** Pre-computed `chunk_relations` table. Batch prefetch on good connections; on-demand for slow connections; "Continue the Thread" only for Save-Data/2G. See FTR-030 for full specification including filters, graph traversal, and API.

**Narrow screens (< 1024px):** Side panel collapses to a floating pill ("Related Teachings") opening a bottom sheet. Never obscures reading text.

**Dwell mode override:** When dwell activates (see below), side panel updates immediately — no debounce.

#### End of Chapter

The end of a chapter belongs to the **book**. Primary invitation: next chapter, centered, clean. No cross-book suggestions in the reading column.

**"Continue the Thread"** lives in the side panel (or bottom sheet), aggregating the chapter's strongest cross-book connections (deduplicated, top 3). Exception for Save-Data/2G: appears inline below the Next Chapter link.

#### Physical Book Bridge

Every passage includes a "Find this book" link to the SRF Bookstore (`books.bookstore_url`). Styled as small `--portal-text-muted` text link near the citation. Supports DELTA's Embodiment principle.

#### Print Stylesheet

`@media print`: remove nav/footer/side panel, full-width at optimal reading width, Merriweather 11pt, citation below each passage, portal URL in footer, page breaks between chapters, no background colors. Hindi: Noto Serif Devanagari 12pt, no drop capitals, 40–50 aksharas/line. STG-021 adds per-script font stacks (Noto Serif JP, Thai, Bengali).

#### Chant/Poetry Reader Variant (FTR-142)

When `books.content_format` is `'chant'` or `'poetry'`, the reader renders whole units (one per page) with prev/next navigation instead of continuous scroll. Chants with `performance_of` relations get an inline media panel (audio/video below text). Performance provenance: Yogananda's voice first, monastic recordings second, others third. See FTR-142 for full specification.

### Reader Typography Refinements

Micro-details that distinguish sacred text presentation from a blog post:

- **Drop capitals:** Chapter-opening Merriweather 700, `--srf-navy`, 3-line span via CSS `::first-letter`. Latin-script only. STG-021: CJK/Indic scripts get generous whitespace with subtle `--srf-gold` rule above first paragraph.
- **Decorative opening quotation marks:** Large Merriweather 700, 48px, `--srf-gold` at 40% opacity, positioned as hanging element above-left on all displayed Yogananda passages.
- **Optical margin alignment:** `hanging-punctuation: first last` (progressive enhancement).
- **Page texture:** CSS-only inline SVG noise pattern blended with `--portal-bg` via `background-blend-mode: multiply`. Zero network cost.
- **Chapter epigraphs:** Centered, Merriweather 300 at `--text-sm`, `--portal-text-muted`, source in small caps.
- **Typographic details (applied at ingestion):** True em dashes with hair spaces, curly quotes, single-glyph ellipses, small caps for abbreviations.
- **Citations:** `-- [Book], Chapter [N], p. [N]` in Open Sans 400, `--portal-text-muted`.

### "Dwell" Interaction — Passage Contemplation Mode

When reading a physical book, a profound passage stops you mid-page. Dwell is the digital equivalent.

**Trigger:** Long-press (mobile, 500ms). Desktop: click hover-revealed dwell icon (12px gold circle, appears after 1.5s hover). Keyboard: `d` on focused paragraph. One-time tooltip on first visit.

**Effect:** Surrounding text dims to 15% opacity (600ms). Selected passage remains vivid, background warms to `--portal-quote-bg`. Share icon, citation, and lotus bookmark appear below. Related Teachings side panel updates immediately (bypasses debounce).

**Exit:** Tap/click elsewhere, or `Escape`. Returns to normal over 300ms.

**No modal, no popup, no overlay.** The passage comes forward in place — mirroring how eyes narrow focus in physical reading.

**Haptic:** Mobile: `navigator.vibrate(10)` — 10ms tap confirming activation. Suppressed for `prefers-reduced-motion`.

**Accessibility:** `Escape` exits. Screen readers announce enter/exit (FTR-053). `prefers-reduced-motion`: instant transitions, haptic suppressed.

### Layered Passage Depth — "Go Deeper Within the Text"

A "Go deeper" link below any passage citation expands two layers inline:

| Layer | Label | Shows | Source |
|-------|-------|-------|--------|
| **Context** | "In context" | ±2 adjacent paragraphs from same chapter, current highlighted | Neighboring chunks by `paragraph_index` |
| **Web** | "Across the library" | Up to 5 cross-book passages expressing the same idea | `chunk_relations` + `composition_era` metadata |

Layers toggle independently. `Escape` collapses all. No new API endpoints — uses existing chapter data and `/api/v1/passages/[id]/related`. Stage: STG-008.

### Time-Aware Reading — Circadian Color Temperature

The portal shifts warmth by time of day. **On by default, opt-out via toggle.**

| Band | Hours | Background | Character |
|------|-------|------------|-----------|
| Morning | 5:00–9:59 | `#FDFBF8` (cooler cream) | Crisp, like morning light |
| Midday | 10:00–15:59 | `#FAF8F5` (standard) | Baseline palette |
| Evening | 16:00–20:59 | `#F7F2EC` (warmer cream) | Golden hour warmth |
| Night | 21:00–4:59 | `--srf-navy` bg, cream text | Restful, low-light |

Client-side script sets `data-time-band` on `<html>`. CSS custom properties apply palette. No polling. DELTA-compliant. Toggle cycles: Auto → Light → Dark. `prefers-color-scheme: dark` overrides.

**Meditation Mode:** Deeper than Night band — `--portal-bg-deep` (#0a1633), reduced contrast `#d4cfc7` text, golden highlights on key phrases. Activates automatically on `/quiet`. Available in reader as part of six-theme progression: Auto → Light → Sepia → **Earth** → Dark → **Meditate**.

**Earth theme:** Warm clay-paper `#f2e8de`, deep brown `#3a2518`, YSS terracotta `#bb4f27` accent (FTR-119). WCAG AA: text 12.1:1, accent 5.0:1. Proof-of-concept for brand-variant theming.

### "Breath Between Chapters"

When navigating via prev/next (not deep links): 1.2s pause showing only the chapter title (Lora 400, `--text-xl`) centered on cream. Then text fades in (400ms). `prefers-reduced-motion`: skipped. No loading spinner — silence, not waiting.

### Lotus Bookmark (FTR-046)

`localStorage`-based bookmarking. Chapter: lotus icon in reader header (click to toggle). Passage: lotus icon in dwell mode. `/bookmarks` page lists all by book. No server, no accounts. STG-023: offered for import to server sync. See FTR-046.

### Keyboard-First Reading Navigation

Single-key shortcuts, active when no input/textarea focused:

| Key | Action |
|-----|--------|
| `→` or `Space` | Next chapter (with breath) |
| `←` | Previous chapter |
| `j` / `k` | Next / previous paragraph |
| `d` | Enter dwell mode |
| `Escape` | Exit dwell, close panels |
| `b` | Toggle lotus bookmark |
| `r` | Toggle related teachings |
| `t` | Jump to table of contents |
| `/` | Focus search bar |
| `?` | Shortcut help overlay |

`Space` for next chapter only at bottom of chapter. Contextual teaching: shortcuts introduced one at a time in context (e.g., "Press → for next chapter" at chapter end).

### Responsive Aura — Visual Warmth from Reading State

All state is `localStorage`-only (structurally identical to lotus bookmarks). No server, no tracking.

| Interaction | Visual Response | Opacity |
|-------------|----------------|---------|
| Passage hover | `--srf-gold` left border fades in | 15% → 40% |
| Lotus-bookmarked passage | Persistent golden glow on left border | 30% |
| Recently read chapter (TOC) | Warm tint on chapter row | 8% `--srf-gold` bg |

All effects ≤ 40% opacity. Felt, not seen. `prefers-reduced-motion`: instant transitions. Reading state: chapter IDs only, no timestamps/duration/scroll position.

### The Quiet Corner (`/quiet`)

A single-purpose page for the moment of crisis — the 2 AM seeker who needs a hand to hold.

**Design:** Maximum whitespace. A single affirmation centered vertically and horizontally (Merriweather Light). Source citation in muted text. Optional timer (1, 5, 15 min) — when started, button/options fade away leaving only the affirmation. Soft chime at end (Web Audio API), no progress bar, no countdown. Background: `--portal-bg-alt`.

**Source material:** *Scientific Healing Affirmations*, *Metaphysical Meditations*, curated passages.

**Timer completion:** Chime → 3s stillness → affirmation crossfades (300ms) to a parting passage about returning from meditation. Transforms "session over" to "now begin."

**Constraints:** No tracking, no history, no "sessions completed," no streaks. No ambient sound. No account required. Timer is client-side (`setTimeout` + Web Audio). Chime has visual equivalent (gentle flash), haptic equivalent (slow resonance `navigator.vibrate([10, 50, 8, 70, 5, 100, 3])` mimicking singing bowl decay), suppressed for `prefers-reduced-motion`. Header collapses to lotus mark only, footer suppressed.

### About Section (`/about`)

Front door for the uninitiated and bridge to SRF's broader mission.

| Section | Content |
|---------|---------|
| **Introduction** | What the portal is, philanthropic origin, "free access" meaning |
| **Paramahansa Yogananda** | Brief biography (3–4 paragraphs), official portrait as frontispiece |
| **The Line of Gurus** | Babaji → Lahiri Mahasaya → Sri Yukteswar → Yogananda, one sentence each, portrait for each |
| **Self-Realization Fellowship** | Mission, aims and ideals, global presence. Informational, not promotional. |
| **Go Deeper** | Enriched Practice Bridge (FTR-055): books as invitation to practice, free Beginner's Meditation first, SRF Lessons path, signpost links (center locator, guided meditations, kirtan, bookstore, temples, Magazine). All framing SRF-reviewed. Free path foregrounded. |

### Navigation Structure

**Header:** SRF lotus (home link) + primary nav: Search, Books, Videos, Magazine, Quiet Corner, About. Mobile: hamburger. No notification badges, no user avatar, no bell icon.

**Footer:** SRF Resources grid (yogananda.org, Lessons, Online Meditation Center, Bookstore, center locator, free literature, App, YouTube). Tagline: "The teachings of Paramahansa Yogananda, made freely available to seekers worldwide." © SRF. All external links open in new tabs.

### Passage Sharing

Every passage includes a quiet share affordance.

**Share link:** `/passage/[chunk-id]` — renders single passage with full citation, "Read in context," and warm cream design.

**OG/Twitter Card meta tags:** `og:title` = "Paramahansa Yogananda", `og:description` = first ~120 chars, `og:image` = generated quote image. Twitter `summary_large_image`. Canonical URL per FTR-059 §9.

**Quote image generation:** `GET /api/v1/og/[chunk-id]` via `@vercel/og` (Satori). Merriweather on cream, citation, lotus mark, portal URL. Language-aware font selection: `hi` → Noto Serif Devanagari, `en`/`es` → Merriweather, STG-021 adds per-script fonts.

**Share menu:** Copy link · Email this passage (`mailto:` — no server infrastructure) · Save as image · Save as PDF (FTR-133). No social media buttons, no third-party scripts.

### UI Copy Standards (FTR-054)

Every word the portal speaks beyond Yogananda's own is treated as reviewed content. The portal's verbal character: **a warm, quiet librarian.** Warm, not clinical. Honest, not apologetic. Inviting, not instructional. Brief. Never cute, never corporate.

**Preferred vocabulary:** "seeker" not "user," "passage" not "result," "the teachings" not "our content," "explore" not "browse," "mark" not "bookmark." ARIA labels carry warmth (FTR-053). See FTR-054 for full specification.

### Session Closure Moments — Departure Grace

The portal has opening (threshold) and closing gestures. The last word is always Yogananda's.

**"Parting word" content blocks at natural endpoints:**

| Location | Content character |
|----------|-------------------|
| End of chapter (below "Next Chapter") | Practice — "Take these words into your day" |
| Quiet Corner timer completion | Returning — "Carry this stillness with you" |
| Bottom of search results | Encouragement — "The teachings are always here" |
| Bottom of theme page | Exploration — "There is always more to discover" |

Parting passage pool: 10–20 short Yogananda passages in `daily_passages` with `usage = 'parting'`, rotated randomly. Appears *below* primary navigation — seekers continuing never scroll to it.

**Quiet Corner departure:** After chime + 3s, affirmation crossfades to parting passage. Below it (after whitespace), two-line practice signpost linking to yogananda.org/meditate and guided meditations. Maximum receptivity moment. Two lines, never a card (FTR-055).

### Non-Search Seeker Journeys (FTR-047)

Seven paths, each with specific design standards. See FTR-047 for full specification. Summary:

1. **Shared-link recipient** (`/passage/[id]`) — the ambassador page. Context for unfamiliar seekers, "Continue reading" → book, "Explore more" → homepage.
2. **Google arrival** (external referrer) — subtle one-line context bar, dismissed on scroll.
3. **Daily visitor** (Today's Wisdom → "Show me another") — sessionStorage exclusion prevents repeats.
4. **Quiet Corner seeker** (`/quiet` directly) — self-contained, minimal cognitive load, passes "2 AM crisis test."
5. **Linear reader** (chapter → chapter) — reading column belongs to the book; cross-book in side panel only.
6. **Devoted practitioner** — partial-phrase matching, cross-book comparison, future collections (STG-024).
7. **Scholar** — stable canonical URLs, citation export (STG-009), Knowledge Graph as primary tool.

**Single-invitation principle:** Each path invites exactly one step deeper, never more.

**Honest absence principle:** When the portal can't help — no results, unavailable language, out-of-corpus topic — it says so clearly and offers the closest alternative. Never fabricates relevance.

### Self-Revealing Navigation

The portal teaches its own navigation through use, not tooltips:

- **Dwell discovery:** First evocative passage gets subtly warmer background on first visit — a hint.
- **Theme discovery:** First search includes "This passage also appears in the theme: **Courage** →."
- **Keyboard discovery:** Contextual hints one at a time ("Press → for next chapter" at chapter end).
- **Vocabulary bridge:** Suggestion dropdown showing Yogananda's terms teaches the concept naturally.
- **Fallback guarantee:** Every self-revealing pattern has a conventional fallback (tooltip, overlay, link).

**Secondary navigation (FTR-039):** Progressively populated as features arrive: Books + About → + Four Doors + Guide → + Listen → + Places. Never the primary surface.

### Image Usage Guidelines (FTR-073)

**Core principle: The reading experience is text-only.** No images in the book reader column. The portal is photo-optional — every layout works without images. Guru photographs: About page (lineage + bio), Quiet Corner (small above affirmation), book landing pages (author photo), footer (small sepia ~48-60px). Nature photos: homepage hero (seasonal SRF property), Quiet Corner (desaturated at 5-8% opacity), theme pages (ambient, muted), 404 (SRF garden). Never crop/filter guru photos. Never stock photography. See FTR-073.

### SEO and Discoverability

**Per-page meta tags:**

| Page Type | Title Pattern |
|-----------|--------------|
| Homepage | "Teachings of Paramahansa Yogananda — Free Online Teachings" |
| Theme | "Yogananda on [Theme] — Verbatim Passages" |
| Book | "[Title] by Paramahansa Yogananda — Read Free Online" |
| Chapter | "[Chapter Title] — [Book Title]" |
| Passage | Quote snippet (120 chars) + citation |
| Quiet Corner | "A Moment of Stillness — Yogananda Affirmation" |

**Structured data (JSON-LD):** `Book` on book pages, `Article` on chapters, `WebSite` with `SearchAction`, `Organization` for SRF. Auto-generated sitemap from Neon data. Theme pages are the primary SEO entry point.

## Specification

### Design System: SRF Design Tokens

Tokens derived from yogananda.org, convocation.yogananda.org, and onlinemeditation.yogananda.org. Full implementation in `/app/globals.css` and the yogananda-design repo.

#### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--srf-gold` | `#dcbd23` | Primary accent, lotus, CTA borders |
| `--srf-orange` | `#de6a10` | Hover states, warm accent |
| `--srf-navy` | `#1a2744` | Headings, nav, Night mode bg |
| `--yss-terracotta` | `#bb4f27` | YSS accent, Earth theme (FTR-119) |
| `--srf-blue` | `#0274be` | Interactive focus, links |
| `--portal-bg` | `#FAF8F5` | Warm cream background |
| `--portal-bg-alt` | `#F5F0EB` | Alternating sections, Quiet Corner |
| `--portal-quote-bg` | `#F9F6F1` | Quote card background |
| `--portal-text` | `#2C2C2C` | Primary reading text |
| `--portal-text-muted` | `#595959` | Citations, metadata (WCAG AA on cream) |
| `--portal-bg-deep` | `#0a1633` | Meditation Mode background |
| `--portal-text-meditate` | `#d4cfc7` | Meditation Mode text |
| `--color-error` | `#d32f2f` | Error states |
| `--color-success` | `#2e7d32` | Success states |

#### Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| Book text (reading) | Merriweather | 400 | 18px | 1.8 |
| Quoted passages | Merriweather | 300 | 18px | 1.8 |
| Page headings | Merriweather | 700 | 32px | 1.3 |
| Section headings | Merriweather | 700 | 28px | 1.3 |
| UI chrome | Open Sans | 400/600 | 15px | 1.6 |
| Citations | Open Sans | 400 | 15px | 1.6 |
| Chapter titles (reader) | Lora | 400 | 28px | 1.3 |
| Hindi body text | Noto Serif Devanagari | 400 | 20px | 1.9 |
| Hindi UI | Noto Sans Devanagari | 400/600 | 15px | 1.6 |
| Devanagari verses | Noto Sans Devanagari | 400 | 18px | 1.8 |

**Font families:** `--font-serif` (Merriweather), `--font-serif-alt` (Lora), `--font-sans` (Open Sans), `--font-devanagari-reading` (Noto Serif Devanagari), `--font-devanagari-ui` (Noto Sans Devanagari). STG-021 adds `--font-thai`, `--font-bengali`.

**IAST diacritics:** Merriweather and Lora must render combining characters (ā, ī, ū, ṛ, ṃ, ḥ, ñ, ṅ, etc.) at all sizes. Verify at `--text-sm` (15px).

#### Spacing, Borders, Breakpoints

**Spacing scale:** 4px increments from `--space-1` (4px) through `--space-20` (80px). Key values: `--space-3` (12px, button padding), `--space-4` (16px, input padding), `--space-8` (32px, section spacing), `--space-16` (64px, page separators).

**Borders:** `--border-thin` (1px), `--border-standard` (1.5px), `--border-medium` (2px). **Radii:** `--radius-sm` (3px), `--radius-md` (5px), `--radius-lg` (8px), `--radius-pill` (50px).

**Breakpoints:** mobile ≤639px, tablet ≥768px, desktop ≥1024px, wide ≥1280px, max-content 1440px.

**Transitions:** `--transition-standard: all 0.3s ease` — only on hover/focus. No decorative animation.

#### Calm Technology UI Rules

| Rule | Implementation |
|------|---------------|
| Background | `--portal-bg` warm cream, never pure white |
| Quoted passages | `--portal-quote-bg` cards with `--srf-gold` left border |
| Whitespace | Generous: `--space-16` between sections, `--space-8` between passages |
| Animations | Only `--transition-standard` on hover/focus |
| Loading states | Quiet skeleton screens, no spinners with messages |
| Section dividers | Small lotus SVG (16px, `--srf-gold` at 25%) instead of `<hr>` |
| Sacred space | Scripture/guru passages: soft inset shadow, thin gold top border, quote bg, relaxed spacing |

### Lotus as Unified Visual Motif

One simplified lotus design (geometric, 3-petal, SVG) at different sizes and opacities:

| Use | Size | Opacity |
|-----|------|---------|
| Section divider | ~16px | 25% |
| Bookmark icon (FTR-046) | 20px | 50% / 100% |
| Favicon | 16/32px | 100% |
| Opening threshold | ~40px | 30% |
| Quote card accent | 12px | 20% |

Always `--srf-gold`. Never heavy. Geometric, not photographic. Works at 12px. Defined once as reusable component.

### Self-Hosted Fonts (FTR-085)

Self-hosted from Vercel CDN, not Google Fonts (German GDPR compliance, performance). WOFF2 in `/public/fonts/`. `font-display: swap`.

## Notes

