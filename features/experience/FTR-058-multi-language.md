---
ftr: 58
title: Multi-Language Architecture
summary: "Three-layer localization strategy for UI chrome, book content, and search across 10 languages"
state: implemented
domain: experience
governed-by: [PRI-01, PRI-05, PRI-06]
---

# FTR-058: Multi-Language Architecture

## Rationale

### FTR-058: Multi-Language Architecture — Three-Layer Localization

### Context

The portal's mission — making the teachings "available freely throughout the world" — requires multi-language support. The core language set (FTR-058) defines 10 languages: en, de, es, fr, it, pt, ja, th, hi, bn. However, localization for this portal has a unique challenge: not all books are translated into all languages. The content availability is asymmetric.

Three distinct layers require different localization strategies:

| Layer | What | Challenge |
|-------|------|-----------|
| **UI chrome** | Navigation, labels, buttons, error messages, search prompts | Small corpus (~200–300 strings). Standard i18n. |
| **Book content** | Yogananda's published text in official SRF/YSS translations | Not all books exist in all languages. Must never machine-translate sacred text. |
| **Search** | Full-text search (language-specific stemming), vector similarity (embedding model dependent), query expansion (LLM language) | Per-language FTS dictionaries. Embedding model must handle target languages. |

### Decision

Implement a **three-layer localization strategy** with English fallback:

**Layer 1 — UI chrome:** Next.js i18n routing with `next-intl` (or `i18next`). URL-based locale prefixes (`/es/search`, `/de/quiet`). English as default (no prefix). All UI strings externalized to locale JSON files from STG-004 — never hardcoded in components.

**Layer 2 — Book content:** Language-specific chunks in Neon, differentiated by the existing `language` column on `book_chunks`. No machine translation of Yogananda's words — if an official translation doesn't exist, the book is not available in that language. Contentful locales (production) provide per-locale editorial content.

**Layer 3 — Search:** Per-language pg_search BM25 indexes with ICU tokenization for full-text search (FTR-025). Multilingual embedding model (Voyage voyage-4-large, 1024 dimensions, 26 languages — FTR-024). Claude handles query expansion in all target languages.

**English fallback:** When the user's language has insufficient content (fewer than 3 search results, sparse theme pages, small daily passage pool), supplement with English passages clearly marked with a `[EN]` language tag and "Read in English" links. The fallback is transparent — never silent.

### STG-004 i18n Infrastructure + Bilingual UI

STG-004 delivers **bilingual UI chrome** (English, Spanish) alongside bilingual content (FTR-011 Tier 1). Spanish UI strings are translated via Claude draft → human review (FTR-135) in STG-004 — not deferred to 5b. Hindi and remaining language UI strings are a Milestone 5b deliverable. The i18n infrastructure is in place from day one for all 10 core languages:

| Requirement | Rationale |
|-------------|-----------|
| All UI strings in `messages/en.json` | Retrofitting i18n into hardcoded JSX is expensive |
| `next-intl` configured with `en`, `es` locales | Adding more locales later is a config change, not a refactor |
| CSS logical properties (`margin-inline-start`, not `margin-left`) | Free RTL support for future languages |
| `lang` attribute on `<html>` element | Screen readers and search engines depend on this |
| `language` column on all content tables | Already present in the schema |

### Rationale

- **Mission alignment:** "Freely throughout the world" means in the seeker's language.
- **Sacred text fidelity:** Machine translation of Yogananda's words is unacceptable. Only official SRF/YSS translations are used.
- **Graceful degradation:** English fallback ensures seekers always find something, with honest labeling.
- **Low STG-004 cost:** Externalizing strings and using CSS logical properties costs nothing when done from the start but saves a major refactor later.
- **Spiritual terminology:** Sanskrit terms (samadhi, karma, dharma, prana) appear differently across translations — some keep Sanskrit, some translate, some transliterate. Per-language search must handle both forms.

### Design Decisions (Multilingual Audit, 2026-02-18)

The following decisions were made during a comprehensive multilingual audit to ensure the architecture serves Earth's population:

1. **Locale-first search.** The `language` API parameter means "the user's locale," not "detected query language." Auto-detection on short queries is unreliable ("karma" is identical in six languages). The service layer (not the SQL function) implements the English fallback when locale results < 3. This keeps the database function clean and the fallback policy in application code.

2. **Theme slugs stay in English.** `/es/themes/peace`, not `/es/temas/paz`. English slugs provide URL stability — no breakage if the taxonomy changes. Display names are localized via a `topic_translations` table. `hreflang` tags handle the SEO signal.

3. **`reader_url` is locale-relative.** API responses return `/books/slug/chapter#chunk` without locale prefix. The client (web or mobile) prepends the locale. This keeps the API presentation-agnostic per FTR-015.

4. **Locale + English fallback is the multilingual model.** The practical need is the seeker's language plus English supplementation — not arbitrary cross-language search (e.g., Japanese query finding German results). The multilingual embedding model *enables* cross-language search at near-zero cost, but the core experience is locale-first with English fallback. Cross-language search may be activated later if usage data justifies it, but it is not a core Milestone 5b deliverable.

5. **`canonical_book_id` links translations to originals.** A new column on `books` enables "Available in 6 languages" on the Books page and "Read in English →" navigation between editions. The `canonical_chunk_id` column on `book_chunks` enables passage-level cross-language links.

6. **`chunk_relations` stores per-language relations.** Top 30 same-language + top 10 English supplemental per chunk ensures non-English languages get full related teachings without constant real-time fallback. The English supplemental relations follow the same pattern as the search fallback — supplement, clearly mark with `[EN]`, never silently substitute.

7. **Per-language search quality evaluation is a launch gate.** Each language requires a dedicated search quality test suite (15–20 queries with expected passages) that must pass before that language goes live. This mirrors STG-001's bilingual search quality evaluation (Deliverable STG-001-8: ~58 en + STG-002: ~15 es queries) and prevents launching a language with degraded retrieval quality.

8. **Chunk size must be validated per language.** English-calibrated chunk sizes (200/300/500 tokens) may produce different semantic density across scripts. Per-language chunk size benchmarking is required during Milestone 5b ingestion — particularly for CJK and Indic scripts where tokenization differs significantly from Latin text.

### Consequences

- STG-004 includes i18n infrastructure setup (locale routing, string externalization) and **bilingual UI chrome** (en/es) via Claude draft → human review (FTR-135); the initial milestone content is bilingual (en/es) per FTR-011
- The initial migration includes the `topic_translations` table (empty until Milestone 5b)
- Milestone 5b requires knowing which books SRF has in digital translated form (stakeholder question)
- STG-004 Spanish UI string translation uses the AI-assisted workflow (FTR-135): Claude generates drafts, human reviewer refines tone, spiritual terminology, and cultural nuance. Milestone 5b repeats this proven workflow for Hindi and remaining 7 languages.
- The content availability matrix creates asymmetric experiences per language — this is honest, not a bug
- The book catalog per language shows only available books, plus a "Also available in English" section
- The `hybrid_search` function accepts a `search_language` parameter and filters to the user's locale
- Per-language pg_search BM25 indexes with ICU tokenization provide language-aware full-text search (FTR-025)
- All content-serving API endpoints accept a `language` parameter with English fallback at the service layer
- Per-language search quality test suite (15–20 queries per language) is a launch gate before any language goes live in Milestone 5b
- Per-language chunk size benchmarking required during Milestone 5b ingestion for non-Latin scripts
- `books.bookstore_url` provides "Find this book" links to SRF Bookstore. Per-language bookstore routing (e.g., YSS Bookstore for Hindi/Bengali) can be added via a simple lookup table if needed at Milestone 5b.


### FTR-058: CSS Logical Properties

### Context

The core language set (en, de, es, fr, it, pt, ja, th, hi, bn) includes only left-to-right (LTR) languages. However, Yogananda's teachings have readership in Arabic, Urdu, and Hebrew-speaking communities (evaluation candidates). Building a CSS architecture that only works for LTR requires a significant retrofit when RTL languages are added.

CSS logical properties (`margin-inline-start` instead of `margin-left`, `padding-block-end` instead of `padding-bottom`) provide directional-agnostic layout at zero additional cost when used from the start.

### Decision

Use **CSS logical properties** throughout all portal stylesheets and Tailwind utility classes from STG-004.

**In practice:**

| Instead of | Use |
|-----------|-----|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |
| `border-left` | `border-inline-start` |

Tailwind CSS supports logical properties via the `ms-*` (margin-start), `me-*` (margin-end), `ps-*`, `pe-*` utilities.

### Rationale

- **Zero cost now, high cost later.** Writing `ms-4` instead of `ml-4` takes the same keystrokes. Retrofitting an entire codebase from physical to logical properties is a multi-day refactor.
- **Future-proofing.** Arabic and Urdu readership of Yogananda's works exists. Hindi uses Devanagari (LTR but with specific layout expectations). RTL support is not speculative — it's eventual.
- **Browser support.** Logical properties are supported in all modern browsers (97%+ global coverage as of 2025).

### Consequences

- Developers must be trained/reminded to use logical properties (Tailwind's `ms-*`/`me-*`/`ps-*`/`pe-*` instead of `ml-*`/`mr-*`/`pl-*`/`pr-*`)
- **CI enforces logical property usage.** A grep-based CI check scans all `.tsx`, `.ts`, and `.css` files for physical property patterns (`ml-`, `mr-`, `pl-`, `pr-`, `margin-left`, `margin-right`, `padding-left`, `padding-right`, `text-align: left`, `text-align: right`, `float: left`, `float: right`, `border-left`, `border-right`) and fails the build if any are found outside explicitly allowlisted exceptions (e.g., third-party overrides). This replaces the earlier aspiration of "can enforce" with a concrete gate. Implementation: shell script in CI (`scripts/lint-logical-properties.sh`) or an ESLint custom rule.
- Adding `dir="rtl"` to an RTL locale "just works" for layout — only typography and some edge cases need special attention


### FTR-058: Core Language Set and Priority Ordering

### Context

The portal's mission — making the teachings "available freely throughout the world" — requires multi-language support. The question is not *whether* to support multiple languages, but *which* languages constitute the core commitment and how to sequence them.

Official SRF/YSS translations of Yogananda's works exist in multiple languages. The core language set should reflect the intersection of mission reach, available translations, and organizational presence. A previous revision (2026-02-24) adopted "no wave ordering" to avoid Western-before-Indian sequencing. However, analysis revealed that "all 9 simultaneously" in practice meant "none until we can resource all 9" — deferring Hindi (609M speakers, Yogananda's country) and Bengali (284M speakers, Yogananda's mother tongue) to the same timeline as Italian (68M speakers). FTR-011 established a quantitative framework to resolve this: order by reachable population.

### Decision

Define a **core language set of 10 languages** that the portal commits to supporting. Languages are **ordered by reachable population** (FTR-011) and ship as they clear a readiness gate.

**Priority ordering:**

| Priority | Language | Code | Script | Reachable | Rationale |
|----------|----------|------|--------|-----------|-----------|
| — | **English** | en | Latin | ~390M L1 | Default. All content originates in English. |
| **Tier 1** | **Hindi** | hi | Devanagari | **~425M** | Yogananda's country. YSS homeland. Largest non-English audience. |
| **Tier 1** | **Spanish** | es | Latin | **~430M** | Highest L1 ratio (86.7%). Strong SRF Latin America presence. |
| Tier 2 | **Portuguese** | pt | Latin | ~225M | Brazil digital leader. High L1 ratio (93.6%). |
| Tier 2 | **Bengali** | bn | Bengali | ~130M | Yogananda's mother tongue. Deep YSS catalog. |
| Tier 3 | **German** | de | Latin | ~123M | SRF Deutschland. Near-universal internet. |
| Tier 3 | **Japanese** | ja | CJK | ~119M | Established SRF Japan presence. |
| Tier 3 | **French** | fr | Latin | ~116M | Francophone Africa + France + Canada. |
| Tier 3 | **Italian** | it | Latin | ~61M | Official translations exist. |
| Tier 3 | **Thai** | th | Thai | ~49M | SRF/YSS Thailand. Script diversity forcing function. |

*Speaker data: Ethnologue 2025. Internet penetration: ITU/DataReportal 2025–2026. Full analysis: docs/reference/prioritizing-global-language-rollout.md.*

**Tier 1 (Hindi, Spanish):** Both Tier 1 by reachable population. Spanish activated in the initial milestone alongside English (~820M reachable). Hindi deferred from the initial milestone — authorized YSS ebook only purchasable from India/Nepal/Sri Lanka (Razorpay); Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates when an authorized source becomes available (Milestone 5b or earlier).

**Tier 2 (Portuguese, Bengali):** Activated as the next priority after Tier 1 languages are live. Bengali's mission weight (Yogananda's mother tongue, YSS heartland) is significant despite lower internet penetration.

**Tier 3 (German, Japanese, French, Italian, Thai):** Activated as content and reviewer readiness permits, ordered by reachable population within resourcing constraints.

**Language readiness gate:** A language ships when: (1) *Autobiography of a Yogi* digital text is ingested, (2) UI strings (~200–300) are translated and human-reviewed per FTR-135, (3) per-language search quality evaluation passes (15–20 test queries, ≥ 80% relevant in top 3). Languages ship independently — no language waits for another.

**Evaluation candidates** (not in core set, evaluated based on demand data and translation availability): Chinese, Korean, Russian, Arabic, Indonesian. See FTR-011 § Evaluation Candidates for demographic analysis.

### Rationale

- **Mission integrity.** The core set covers the languages where official Yogananda translations exist and SRF/YSS has organizational presence. Every core language has published translations — the portal serves verbatim text, not machine-translated content.
- **Reachable population ordering.** Priority determined by `speakers × internet_penetration × content_availability` (FTR-011). Spanish matches English L1 reach. Hindi is Tier 1 by population but deferred from the initial milestone due to authorized source availability — activates when sourcing resolves.
- **Population reach.** The core set covers ~3 billion speakers across 6 scripts (Latin, CJK, Thai, Devanagari, Bengali). Hindi + Bengali alone exceed 830M speakers.
- **Script diversity drives architectural quality.** Supporting Latin, CJK, Thai, Devanagari, and Bengali from the core set forces robust i18n infrastructure — font loading, line-height adaptation, word-boundary handling (Thai has none), search tokenization.
- **Thai inclusion.** Official Thai translations exist. Thai script's lack of word boundaries makes it an excellent forcing function for search tokenization quality. SRF/YSS has presence in Thailand.

### Risks

- **Tier 1 adds scope incrementally.** Spanish ingestion in the initial milestone requires per-language search quality evaluation. Hindi (when sourced) requires the same plus full Devanāgarī typography (Noto Serif Devanagari for reading, Noto Sans Devanagari for UI — FTR-131) and conjunct rendering QA. Mitigated: same ingestion pipeline, same embedding model (Voyage multilingual), same search infrastructure. Incremental cost is modest.
- **Digital text availability.** Confirmed that official translations exist in all core languages. Digital text availability (machine-readable format) must be verified per language — a critical stakeholder question. The initial milestone uses purchased books as temporary sources (same approach as spiritmaji.com for English).
- **Human reviewer availability.** Each language needs a fluent, SRF-aware reviewer for UI strings (FTR-135). The readiness gate ensures no language ships with unreviewed translations.
- **Thai script complexity.** Thai has no word boundaries, combining characters, and tone marks. Search tokenization (pg_search ICU) handles Thai, but per-language search quality benchmarking is essential.

### Consequences

- Spanish *Autobiography* ingested in STG-002 alongside English — bilingual from the proof-of-concept. Hindi ingested when authorized source becomes available (Milestone 5b or earlier).
- Remaining languages activate ordered by reachable population, each clearing the readiness gate independently
- Need to confirm digital text availability for all core languages (stakeholder question)
- YSS-specific UI adaptations needed for Hindi and Bengali locales (organizational branding differences between SRF and YSS per FTR-119)
- Font stacks: Noto Serif/Sans Devanagari (Hindi — eagerly preloaded on `/hi/` locale, conditionally on English pages), Noto Sans/Serif Bengali (Bengali), Noto Sans/Serif Thai (Thai), Noto Sans/Serif JP (Japanese). Non-Hindi fonts loaded conditionally per locale.
- Portal URL and branding question for Hindi/Bengali: same domain (`teachings.yogananda.org/hi/`) or YSS-branded domain?
- YSS representatives participate in Hindi/Bengali design decisions as co-equal stakeholders (see CONTEXT.md § Stakeholders)
- Thai design decisions require input from SRF/YSS Thailand community


### FTR-058: Language API Design — Locale Prefix on Pages, Query Parameter on API

### Context

The portal serves content in multiple languages (Milestone 5b+). Two independent systems need language awareness: the frontend pages (rendered by Next.js for seekers) and the API routes (consumed by the web frontend, mobile apps, WhatsApp bots, and future integrations). The question is how language is expressed in URLs.

Three approaches were considered:

| Approach | Frontend URL | API URL | Pros | Cons |
|----------|-------------|---------|------|------|
| **Locale prefix everywhere** | `/hi/themes/peace` | `/api/v1/hi/themes/peace/passages` | Consistent URL pattern | Conflates locale and API versioning; not every API endpoint is language-scoped (`/health`, passage-by-id); awkward for mobile apps that manage locale in their own state |
| **Query parameter everywhere** | `/themes/peace?language=hi` | `/api/v1/themes/peace/passages?language=hi` | Clean API contract; single endpoint surface | Loses SEO benefits for frontend pages; no `hreflang` linking; no `lang` attribute signal from URL |
| **Hybrid: prefix on pages, parameter on API** | `/hi/themes/peace` | `/api/v1/themes/peace/passages?language=hi` | SEO-friendly pages; clean API contract; each system uses the pattern natural to its consumers | Two patterns to understand (but each is standard in its domain) |

### Decision

Adopt the **hybrid approach**: locale path prefix on frontend pages, query parameter on API routes.

**Frontend pages:** `/{locale}/path` — standard Next.js i18n routing via `next-intl`.

```
/hi/themes/peace ← Hindi theme page
/hi/books/autobiography ← Hindi book page
/hi/search?q=... ← Hindi search
/hi/quiet ← Hindi Quiet Corner
/themes/peace ← English (default, no prefix)
```

**API routes:** `/api/v1/path?language={locale}` — language as query parameter.

```
/api/v1/themes/peace/passages?language=hi ← Hindi passages for theme
/api/v1/search?q=...&language=hi ← Hindi search
/api/v1/daily-passage?language=hi ← Hindi daily passage
/api/v1/passages/[chunk-id] ← Language inherent to chunk
/api/v1/passages/[chunk-id]?language=hi ← Cross-language: find Hindi equivalent via canonical_chunk_id
/api/v1/health ← No language parameter needed
```

**Server Components** call service functions with language as a function parameter: `findPassages(query, 'hi', options)`. The locale is extracted from the URL prefix by the Next.js middleware and passed down. The service layer never reads the URL — it receives language as a plain argument.

### Rationale

- **Language is a property of content, not a namespace for operations.** "Search" is the same operation regardless of language. The `?language=` parameter modifies what content is returned, not what operation is performed. This is the fundamental insight.
- **API consumers vary.** The web frontend handles locale via URL prefix (standard i18n SEO). A mobile app manages locale in its own state. A WhatsApp bot receives locale from the user's profile. A third-party scholar tool may request multiple languages in sequence. The API should serve all with a single, clean contract.
- **Not every endpoint is language-scoped.** `/api/v1/health`, `/api/v1/passages/[chunk-id]` (the passage already *is* in a language), `/api/v1/books` (returns all books with their `language` field) — forcing a locale prefix on these creates semantic confusion.
- **CDN caching works with query parameters.** Vercel caches based on full URL including query string. `?language=hi` produces a distinct cache entry.
- **Versioning and locale are orthogonal.** `/api/v1/` is the version namespace. Locale is content filtering. Mixing them (`/api/v1/hi/`) conflates two independent axes of variation.
- **10-year horizon.** New languages are added by supporting a new `language` parameter value — no new route structure, no new endpoints. The API contract is stable across all future languages.

### Consequences

- Frontend i18n uses `next-intl` with URL-based locale prefixes from STG-004 (consistent with FTR-058)
- All API endpoints accept an optional `language` query parameter (default: `en`)
- The `language` parameter triggers locale-first search and English fallback at the service layer (FTR-058)
- Mobile apps and other consumers pin to the API and pass language as a parameter
- Server Components extract locale from the URL prefix and pass it to service functions — business logic never reads URLs
- `hreflang` tags on frontend pages enable cross-locale SEO linking
- The OG meta tags on passage share URLs include the language, so shared links render in the correct locale
- **Extends FTR-058** (multi-language architecture) and **FTR-015** (API-first architecture)

## Specification


(See FTR-058 for architectural rationale, FTR-058 for CSS logical properties, FTR-058 for core language set.)

### Three-Layer Localization

| Layer | What | Approach | Milestone |
|-------|------|----------|-----------|
| **UI chrome** | Nav, labels, buttons, errors, search prompts (~200–300 strings) | `next-intl` with locale JSON files. URL-based routing (`/es/...`, `/de/...`). AI-assisted workflow: Claude drafts → human review → production (FTR-135). | Infrastructure + hi/es translations in STG-004. Remaining 7 languages in Milestone 5b. |
| **Book content** | Yogananda's published text in official translations | Language-specific chunks in Neon (`language` column). Contentful locales (available from the initial migration, activated in Milestone 5b). **Never machine-translate sacred text.** | 5b |
| **Search** | FTS, vector similarity, query expansion | Per-language BM25 index (pg_search, FTR-025). Multilingual embedding model (Voyage, FTR-024). Claude expands queries per language. | 5b |

### STG-004 — Bilingual Content and Bilingual UI

STG-001/1b ingests content in English and Spanish (FTR-011 Tier 1; Hindi deferred — authorized source unavailable outside India). **STG-004 delivers bilingual UI chrome** — Spanish UI strings translated via Claude draft → human review (FTR-135). A seeker reading Spanish content deserves Spanish navigation. The i18n infrastructure is in place from day one for all 10 core languages:

- All UI strings externalized to `messages/en.json` (never hardcoded in components)
- Spanish UI strings translated: `messages/es.json` (FTR-135 workflow). Hindi (`messages/hi.json`) added when content becomes available.
- Spiritual terminology glossary bootstrapped: `messages/glossary-es.json`. Hindi glossary added with Hindi content.
- String context file: `messages/en.context.json` — per-key description of where each string appears
- Translation script: `scripts/translate-ui.ts` — generates `{locale}.draft.json` from `en.json` + glossary + context
- `next-intl` configured with `en`, `es` locales (`hi` added when Hindi content available; remaining locales in Milestone 5b)
- CSS logical properties throughout (`ms-4` not `ml-4`, `text-align: start` not `text-align: left`)
- `lang` attribute set dynamically per locale on `<html>` element
- `language` column already present on `book_chunks`, `search_queries`, `email_subscribers`
- Playwright visual snapshots verify Hindi/Spanish UI renders correctly (FTR-131 typography, no truncation)

Adding new locales later is a configuration change, not a codebase refactor. Adding new UI strings triggers `scripts/translate-ui.ts` to generate drafts for review.

### URL Structure

```
/ → English (default, no prefix)
/es/ → Spanish
/de/search?q=Angst → German search
/ja/quiet → Japanese Quiet Corner
/hi/themes/peace → Hindi theme page
```

Locale detection on first visit: `Accept-Language` header → redirect to best match → user override via language selector → preference stored in cookie (no account needed).

### Content Availability Matrix

Not all books are translated into all languages. This creates asymmetric experiences:

| Book | en | es | de | fr | it | pt | ja | th | hi | bn |
|------|----|----|----|----|----|----|----|----|----|----|
| Autobiography of a Yogi | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ✓ | ✓ |
| Where There Is Light | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ? | ? | ? |
| Sayings | ✓ | ✓ | ? | ? | ? | ? | ? | ? | ? | ? |
| Man's Eternal Quest | ✓ | ✓ | ? | ? | ? | ? | ? | ? | ? | ? |
| Second Coming of Christ | ✓ | ? | ? | ? | ? | ? | ? | ? | ? | ? |

*(This matrix must be verified with SRF/YSS — it is a critical stakeholder question.)*

**Query pattern:** The content availability matrix is derived from the `books` table via `canonical_book_id`:

```sql
-- Which languages is a given book available in?
SELECT DISTINCT b.language
FROM books b
WHERE b.canonical_book_id = :canonical_id OR b.id = :canonical_id;

-- Full matrix: all books × all languages
SELECT
 COALESCE(b_en.title, b.title) AS title,
 b.language,
 b.id AS book_id
FROM books b
LEFT JOIN books b_en ON b.canonical_book_id = b_en.id
ORDER BY COALESCE(b_en.title, b.title), b.language;
```

This is a derived view, not a separate table. The `books` table with `canonical_book_id` is the single source of truth for content availability.

**Consequence:** The book catalog, search index depth, theme page richness, and daily passage pool all vary by language. This asymmetry is honest and transparent, not hidden.

### English Fallback Hierarchy

When the user's language has insufficient content, supplement with English — always clearly marked.

| Feature | Fallback Behavior |
|---------|-------------------|
| **Search results** | Search user's language first. If fewer than 3 results, also search English. English results marked with `[EN]` tag and "Read in English →" link. |
| **Today's Wisdom** | Draw from user's language pool. If pool < 20 passages, supplement with English (marked). |
| **Theme pages** | Show passages in user's language. If fewer than 5, supplement with English (marked). |
| **Quiet Corner** | Show affirmation in user's language. If none available, show English. |
| **Book reader** | No fallback — if book isn't translated, it's not in the catalog for that language. Show link: "Read in English →" |
| **Book catalog** | Show books available in user's language + a "Also available in English" section for remaining books. |
| **Daily email** | Send in subscriber's language. If passage pool too small, send English with language note. |

**Fallback display design:**

```
"The soul is ever free; it is deathless, birthless..."

— Autobiography of a Yogi, Chapter 26, p. 312 [EN]
 Read in English →
```

The `[EN]` tag is a small, muted language indicator. It is honest, not apologetic.

### Language-Specific Search

**Full-text search:** pg_search / ParadeDB BM25 indexes (FTR-025) handle per-language tokenization, stemming, and normalization via ICU analyzers.

> **Note:** pg_search BM25 indexes are configured per-language using ICU tokenization (defined in § Data Model). Each chunk's `language` column determines the appropriate analyzer at query time. No additional indexes are needed when new languages are added in Milestone 5b — only new content rows with the correct `language` value and the corresponding ICU analyzer configuration.

**Vector search:** The embedding model **must be multilingual** — this is an explicit requirement, not an accident. Voyage voyage-4-large (FTR-024) supports 26 languages and places semantically equivalent passages in different languages close together in the unified cross-lingual embedding space. This means initial embeddings (en/es) remain valid when Hindi, German, Japanese, and other chunks are added in Milestone 5b — no re-embedding of the existing corpus. Any future embedding model migration (FTR-024) must preserve this multilingual property. Benchmark per-language retrieval quality with actual translated passages in Milestone 5b. Switch to per-language models only if multilingual quality is insufficient — but note that per-language models sacrifice the English fallback's vector search quality and cross-language passage alignment.

**Query expansion:** Claude handles all target languages. The expansion prompt includes the target language:

```
Expand this {language} search query into semantic search terms in {language}: "{query}"
```

### Spiritual Terminology Across Languages

Yogananda uses Sanskrit terms throughout: *samadhi*, *karma*, *dharma*, *prana*, *guru*. Different translations handle these differently — some keep the Sanskrit, some translate, some transliterate. The search index must handle both forms.

**Example:** A German seeker searching "Samadhi" should find passages whether the German translation uses "Samadhi" or "Überbewusstsein" (superconsciousness).

**Approach:** The query expansion step (Claude) naturally handles this — it can expand "Samadhi" into both the Sanskrit term and the language-specific translation. For FTS, the trigram index (`pg_trgm`) already catches partial matches across transliterations.

### Locale-First Search Policy

The `language` API parameter means **the user's locale**, not the detected query language. Auto-detection on short queries (2–5 words) is unreliable — "karma" is the same word in six languages, "peace" gets typed by Spanish users who know the English word.

**Policy:**
1. Search the user's locale language first (via `hybrid_search` with `search_language` parameter)
2. If fewer than 3 results, supplement with English (service layer calls `hybrid_search` again with `search_language='en'`)
3. English fallback results are marked with `[EN]` tag and "Read in English →" link

This policy is implemented in `search.ts` at the service layer, not in the SQL function. The `hybrid_search` function is a single-language primitive; the service function composes the multilingual behavior.

### Cross-Language Features

The multilingual architecture serves two practical use cases, not arbitrary cross-language search:

1. **User's locale + English fallback.** A seeker reads and searches in their language. When content is insufficient (< 3 search results, sparse theme pages), English supplements it — clearly marked with `[EN]` tags. This is the primary multilingual experience. Arbitrary cross-language search (e.g., querying in Japanese, finding German results) solves a problem few seekers have — the real need is locale + English.

2. **Cross-language passage alignment.** When the same book exists in multiple translations, the `canonical_chunk_id` column on `book_chunks` links a translated chunk to its English original. This enables "Read this passage in Spanish →" navigation between editions. Alignment is done during ingestion by matching (canonical_book_id, chapter_number, paragraph_index). Edge cases (translator's notes, merged paragraphs) are resolved in the human QA step.

**Cross-language search as optional future feature:** The multilingual embedding model places semantically equivalent text in different languages close together in vector space. If usage data (Milestone 5b analytics) reveals demand for searching across all languages simultaneously, this can be enabled by calling `hybrid_search` without the `language` filter. But this is not a core Milestone 5b deliverable — locale + English fallback covers the practical need.

### Chunk Relations in a Multilingual Corpus

The `chunk_relations` table stores pre-computed semantic similarity. In a multilingual corpus, a naive "top 30 global" approach would leave non-English languages underserved — most of the 30 slots would be consumed by chunks in other languages (predominantly English, which will be the largest corpus).

**Computation strategy (Milestone 5b):**
- For each chunk, store **top 30 same-language** relations + **top 10 English supplemental** relations (best from English corpus when the chunk is non-English; empty for English chunks)
- Total: up to 40 rows per chunk (at 400K chunks across all languages = 16M rows — trivial for PostgreSQL)
- Same-language relations power the default "Related Teachings" side panel
- English supplemental relations provide fallback when the same-language corpus is small — a Spanish reader with only 3 Spanish books can still see related English passages in the side panel, clearly marked with `[EN]`
- The `rank` column indicates rank within its group (1–30 for same-language, 1–10 for English supplemental)
- Query pattern: `JOIN book_chunks target ON target.id = cr.target_chunk_id WHERE target.language = :lang` for same-language; add `OR target.language = 'en'` to include English supplemental
- Fallback: when filtered results < 3 (rare with this strategy), fall back to real-time vector similarity with a WHERE clause

This ensures every language gets full related teachings, not an afterthought. English supplemental relations are the multilingual equivalent of the search fallback strategy — same pattern, same `[EN]` marking.

### Language Selector

A globe icon in the header navigation, opening a simple dropdown of available languages. Each language displayed in its own script:

```
English
Español
Deutsch
Français
Italiano
Português
日本語
ไทย
हिन्दी
বাংলা
```

Selection stored in a cookie. Available on every page. Not gated by account.

### Font Stack for Non-Latin Scripts

| Language | Script | Font |
|----------|--------|------|
| Japanese | CJK | Noto Serif JP (reading), Noto Sans JP (UI) |
| Thai | Thai | Noto Serif Thai (reading), Noto Sans Thai (UI) |
| Hindi | Devanagari | Noto Serif Devanagari (reading), Noto Sans Devanagari (UI) |
| Bengali | Bengali | Noto Serif Bengali (reading), Noto Sans Bengali (UI) |
| All Latin | Latin | Merriweather / Lora / Open Sans (existing stack) |

Non-Latin font loading strategy: Hindi locale (`/hi/`) eagerly preloads Noto Serif Devanagari (reading) and Noto Sans Devanagari (UI) in `<head>`. English pages load Noto Sans Devanagari conditionally (only when Devanāgarī characters are present — Gita verses, Holy Science verses). All other non-Latin fonts loaded conditionally when the user selects that locale.

### Per-Language SEO

| Requirement | Implementation |
|-------------|---------------|
| `hreflang` tags | Every page includes `<link rel="alternate" hreflang="es" href="/es/...">` for all available locales. |
| Per-language sitemap | Separate sitemap per locale, submitted to Google Search Console. |
| Localized meta tags | Page titles and descriptions translated per locale. |
| JSON-LD language | `inLanguage` field on Book and Article schemas matches the page locale. |

### Resolved Design Decisions

1. **Locale-first search:** The `language` API parameter means the user's locale, not the detected query language. No auto-detection of query language. English fallback implemented at service layer.
2. **Theme slugs stay in English** for URL stability (`/es/themes/peace`, not `/es/temas/paz`). Display names localized via `topic_translations` table.
3. **Embedding model must be multilingual.** Explicit requirement (not accident). Ensures initial embeddings remain valid when Milestone 5b adds new languages.
4. **`reader_url` is locale-relative.** API returns `/books/slug/chapter#chunk`. Client prepends locale prefix. API stays presentation-agnostic.
5. **`chunk_relations` store per-language.** Top 30 same-language + top 10 English supplemental per chunk. Ensures non-English languages get full related teachings with English fallback.
6. **Locale + English fallback is the multilingual model.** Arbitrary cross-language search (e.g., Japanese query finding German results) is deferred as optional — the practical need is the user's language plus English fallback, not N×N language combinations. The multilingual embedding model enables cross-language search at near-zero cost if usage data later justifies it.
7. **Chunk size must be validated per language (Milestone 5b).** Token economies differ across scripts — a 300-token chunk in Japanese may hold less semantic content than 300 English tokens. Per-language chunk size benchmarking is required before ingesting non-English content. At minimum, validate that English-calibrated chunk sizes produce acceptable retrieval quality in all target languages.

### Open Questions (Require SRF Input)

> **Central registry:** CONTEXT.md § Open Questions. The Milestone 5b questions below are tracked there with the full stakeholder list.

- Digital text availability of official translations for the remaining 7 non-English core languages beyond Hindi and Spanish (highest-impact Milestone 5b question; Hindi and Spanish already sourced for STG-001/1b)
- Translation reviewer staffing per language
- YSS portal branding for Hindi/Bengali/Thai locales
- Whether translated editions preserve paragraph structure (affects `canonical_chunk_id` alignment)
- Thai word-boundary handling for search tokenization (Thai script has no whitespace between words)

---

## Notes

Merged from FTR-058, FTR-058, FTR-058, FTR-058 (rationale) and FTR-058 (specification) per FTR-084.
