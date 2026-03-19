---
ftr: 56
title: Additional UI Pages
summary: "Personal library, browse index, and supplementary pages beyond core reading and search"
state: implemented
domain: experience
governed-by: [PRI-08, PRI-09]
depends-on: [FTR-029, FTR-055, FTR-062, FTR-121, FTR-123, FTR-124]
---

# FTR-056: Additional UI Pages

## Rationale

The portal needs pages beyond the core reading and search experiences: a personal library for tracking reading progress, a comprehensive browse index, curated guidance for newcomers and returning seekers, and several content-specific pages. Each page serves a distinct navigational role — the library tracks where you have been, browse shows what exists, and guide recommends where to go.

---

## Specification

### `/library` — Personal Library

**Status: Implemented** — see `app/[locale]/library/`

A quiet, personal map of the seeker's reading journey. Books appear automatically when the seeker visits any chapter — no explicit "add to library" action. The library aggregates three localStorage sources into one coherent view:

- **Visited chapters** (`lib/visited-chapters.ts`) — which chapters the seeker has read in each book
- **Reading journey** (`lib/reading-journey.ts`) — last-read position (book, chapter, timestamp)
- **Bookmarks** (`lib/services/bookmarks.ts`) — saved passages and chapters

**Design principles:**
- Auto-add on chapter visit — silent, frictionless (the act of reading IS the act of adding)
- Chapter count shown (not percentage bar — total chapter count is server data unavailable client-side)
- "Continue" link to last-read chapter per book
- Bookmark count badge per book
- Relative timestamps ("today", "yesterday", "3 days ago") — calm, not precise
- **No time tracking, no minutes spent, no streaks** — antithetical to PRI-08 (calm technology)
- Empty state with warm invitation and "Browse books" CTA for first-time visitors
- DELTA-compliant: all data stays on-device (PRI-09)

**Architecture note:** Designed as a "Books" section with extension points for future media types. When videos (FTR-057), audio, and other content types arrive, they can appear as additional sections. The `LibraryBook` type is the first of what will become a `LibraryItem` union.

**Files:**
- `lib/personal-library.ts` — Aggregation utility: `getLibrary()`, `hasLibraryEntries()`
- `app/[locale]/library/page.tsx` — Server component (metadata, translations)
- `app/[locale]/library/LibraryView.tsx` — Client component (book cards, empty state)
- `lib/__tests__/personal-library.test.ts` — 13 tests
- `app/[locale]/library/__tests__/LibraryView.test.tsx` — 7 tests

**Navigation:** Header nav (between Books and Quiet Corner), Footer nav (before Bookmarks).

---

### `/browse` — The Complete Index

A single, high-density text page listing every navigable content item in the portal, organized by category and subcategory. Designed text-first — not a degraded rich page, but a page whose primary form IS text. The card catalog that completes the librarian metaphor.

**Purpose:** Bird's-eye view of the entire teaching corpus. Universal fallback — the best page for screen readers, feature phones, terminal browsers, offline caching, and SEO crawlers.

**Categories:** Books (by subcategory: Spiritual Classics, Scripture Commentary, Daily Practice), Themes (qualities, life situations, spiritual figures, yoga paths, practices, principles, scriptures), Reading Threads, Glossary A-Z (see FTR-062), People, External References, The Quiet Corner. A link to the Knowledge Graph visualization connects the text index to the visual explorer.

**Data source:** Auto-generated from the database at build time (ISR). Zero editorial overhead. Grows automatically as content is added.

**Performance:** < 20KB HTML. Zero JavaScript required. Zero images. Cacheable by Service Worker as a single offline artifact.

**Semantic structure:** `h2` for top-level categories, `h3` for subcategories, links for individual items. Ideal for screen reader navigation (heading-level browsing). ARIA labels follow FTR-053 warm speech conventions.

**Multilingual:** Content filtered by seeker's language preference. Multi-language availability indicated ("Also in: Espanol").

**Growth by stage:**

| Stage | Content shown |
|-------|---------------|
| STG-004 | Books only (with chapter counts) |
| STG-006 | + Themes, Glossary terms, Quiet Corner textures |
| STG-007 | + People, External References, Reading Threads |
| STG-008+ | + Knowledge Graph link, Calendar Journeys |

---

### `/guide` — The Spiritual Guide

A curated recommendation page organized by spiritual need. Where `/browse` answers "what's here?", `/guide` answers "where should I go?"

**Purpose:** Serve the seeker who has a specific need but doesn't know which book, theme, or reading thread addresses it. The reference librarian's recommendation list.

**Page flow:** (1) need-based pathways, (2) worldview pathways, (3) life-phase pathways, (4) Practice pathway, (5) Thematic Corpus Exploration input.

**Editorial voice:** Follows FTR-054 micro-copy standards. Never paraphrases Yogananda — only provides navigational context. Each section provides 2-3 specific recommendations with brief editorial framing.

**Provenance:** Three-state model (FTR-063): `auto` (Claude draft), `reviewed` (human approved), `manual` (human authored). All user-facing content requires human review.

**Cultural adaptation:** Per-locale guide variants in STG-021+ (stored in `messages/{locale}.json`).

**Navigation:** Linked from site footer ("Where to begin"), from "Start Here" newcomer path, and from `/browse` (bidirectional link).

**Stage:** STG-007 (requires theme system, glossary, and editorial infrastructure). Grows editorially through STG-008+.

#### Worldview Pathway Catalog

15 worldview pathways, each a self-contained `/guide` section. Pathways acknowledge where the seeker is, then point to where Yogananda's words are — they never assert what Yogananda "would say to" a given tradition. Whether to include worldview pathways is an SRF editorial decision (see CONTEXT.md § Open Questions).

| ID | Perspective | Key Corpus Affinity | Primary Books |
|---|---|---|---|
| WP-01 | Christian Contemplative | 1,600-page Gospel commentary, Bible engagement | *Second Coming of Christ*, *Autobiography* |
| WP-02 | Hindu / Vedantic Practitioner | Gita commentary, yoga philosophy, Sanskrit terminology | *God Talks With Arjuna*, *Autobiography* |
| WP-03 | Buddhist / Zen Meditator | Scientific meditation, consciousness states, concentration | *Autobiography*, *Scientific Healing Affirmations* |
| WP-04 | Sufi / Poetry Lover | Rubaiyat commentary, Kabir/Rumi references, devotional love | *Wine of the Mystic*, *Cosmic Chants* |
| WP-05 | Jewish / Contemplative Seeker | Old Testament references, mystical unity, ethical teachings | *Second Coming of Christ*, *Man's Eternal Quest* |
| WP-06 | Science & Consciousness Explorer | Yogananda's scientific framing of yoga | *Autobiography*, *Man's Eternal Quest* |
| WP-07 | Spiritual But Not Religious | Universal human themes, no doctrinal prerequisites | *Autobiography*, *Where There Is Light* |
| WP-08 | Yoga Practitioner (Body to Spirit) | Yoga philosophy beyond asana, pranayama, energy body | *Autobiography*, *God Talks With Arjuna* |
| WP-09 | Grief / Crisis Visitor | Consolation, soul's immortality, purpose of suffering | All books (cross-cutting) |
| WP-10 | Psychology / Self-Improvement | Willpower, habit formation, concentration, practical advice | *Man's Eternal Quest*, *Where There Is Light* |
| WP-11 | Comparative Religion / Academic | Cross-tradition references, reverse bibliography | All books |
| WP-12 | Parent / Family-Oriented | Raising children, family life, relationships | *Man's Eternal Quest*, *Journey to Self-Realization* |
| WP-13 | Muslim / Sufi Seeker | Islamic mysticism, Rubaiyat, universal God-consciousness | *Wine of the Mystic*, *Autobiography* |
| WP-14 | Agnostic / Skeptical-but-Curious | Science engagement, verifiable experience over blind faith | *Autobiography*, *Man's Eternal Quest* |
| WP-15 | Documentary Viewer ("Awake") | Discovered Yogananda through the film; biographical entry | *Autobiography*, *Where There Is Light* |

**Pathway template:** Each pathway includes (1) editorial framing text, (2) 2-3 resource recommendations with links, (3) a "You may also recognize" vocabulary bridge showing 2-3 terms from the seeker's tradition mapped to Yogananda's equivalent (omitted for perspectives where no bridge applies — SBNR, grief, comparative religion), and (4) one representative verbatim Yogananda passage with full citation.

**Generation:** AI-assisted via FTR-069 § Worldview Guide Pathway Generation, with theological review before publication. Priority: WP-01, WP-03, WP-06, WP-07, WP-09 first (strongest corpus affinity, largest populations). WP-13, WP-14 require SRF editorial approval. WP-15 requires confirming SRF's posture toward the *Awake* documentary (see CONTEXT.md § Open Questions).

**What is NOT a pathway:** Anything requiring the portal to adopt a theological position. "If you believe all religions are one" is a claim; "If you come from a Christian contemplative tradition" is a starting point.

#### Life-Phase Pathway Catalog

9 life-phase pathways organized by where the seeker is in the arc of a life. Distinct from situation themes (FTR-121): situation themes describe circumstances ("parenting"); life-phase pathways describe temporal identity and characteristic questions.

| # | Life Phase | Characteristic Question | Tone | Accessibility |
|---|---|---|---|---|
| 1 | Young Seeker (13-22) | "What should I do with my life?" | practical, joyful | Level 1 |
| 2 | Building a Life (22-35) | "How do I balance the inner and the outer?" | practical | Level 1-2 |
| 3 | Raising a Family | "How do I raise my children wisely?" | practical | Level 1-2 |
| 4 | The Middle Passage (40-55) | "Is this all there is?" | contemplative, challenging | Level 2-3 |
| 5 | The Caregiver | "Where do I find strength to keep going?" | consoling, practical | Level 1-2 |
| 6 | Facing Illness | "How do I heal — or accept?" | consoling, practical | Level 1-2 |
| 7 | The Second Half (55+) | "How do I grow old with grace?" | contemplative, consoling | Level 2-3 |
| 8 | Approaching the End | "What awaits me?" | consoling, contemplative | Level 2-3 |
| 9 | New to Spiritual Practice | "I want to begin but don't know how." | practical, joyful | Level 1 |

**Seeker-facing framing:** Uses seasons and questions, not age ranges. Age ranges above are editorial guidance for corpus selection only.

**Relationship to situation themes:** Life-phase pathways compose existing situation themes into temporal context. Each includes an "Others in this season have found" section with lateral connections to other portal features (Quiet Corner, Grief theme, Knowledge Graph), editorially curated.

**The Autobiography as life-phase narrative:** Yogananda's childhood chapters speak to young seekers; his years of searching speak to those in transition; his mission-building years speak to those building a life. An editorial reading thread (FTR-063) could map chapters to seasons.

**Young Seeker signpost:** Includes a quiet link to SRF youth programs after content recommendations (`--portal-text-muted`, Merriweather 300). SRF URL is a stakeholder question (CONTEXT.md Q112).

**Generation:** Same AI-assisted pipeline as worldview pathways (FTR-069). Prompts use tone filters, accessibility levels, situation theme associations, and the characteristic question as generation anchor. Priority: pathways 1, 4, 6, 8 (most acute emotional urgency).

#### Practice Pathway: "If You Feel Drawn to Practice" (FTR-055)

The culminating pathway — bridges from the portal to SRF's institutional path. Progression mirrors SRF's own site: begin free (Beginner's Meditation at yogananda.org) -> taste stillness (Quiet Corner) -> meditate with others (center locator, Online Meditation Center) -> understand the path (Autobiography Ch. 26, Kriya theme) -> commit when ready (SRF Lessons). Free resources appear first.

**Distinct from LP-9 ("New to Spiritual Practice"):** LP-9 serves newcomers who have never meditated. The Practice pathway serves seekers who have been reading on the portal and feel drawn to formal practice — includes Autobiography Ch. 26, Kriya Yoga theme, and SRF Lessons.

**Editorial voice:** Navigational, never promotional. "Yogananda wrote that reading about God is not enough" is a factual description of his published position.

**Stage:** STG-007. Kriya Yoga theme link requires STG-008+; until then, links to Autobiography Ch. 26 only.

#### Thematic Corpus Exploration — "Explore a Theme in Depth"

Query-driven deep exploration answering "show me everything this library holds on a topic I choose." Positioned after curated pathways on `/guide` as a natural deepening — "Or explore the library yourself."

**How it works (no real-time AI):**

1. Seeker enters a question or selects from editorially suggested starting points (10-15 curated topics, refreshed quarterly)
2. Hybrid search (FTR-020) retrieves relevant passages
3. Results grouped by pre-computed sub-theme tags (FTR-026 enrichment, reviewed per FTR-072)
4. Within groups: ordered by relevance, annotated with pre-computed tone and depth
5. Cross-book distribution shown via chunk relations (FTR-030)
6. Glossary terms from entity references (FTR-033) — see FTR-062 for glossary specification
7. Related themes from taxonomy (FTR-121)

**Sub-theme grouping:** Two strategies — (1) exact taxonomy match, (2) dimensional combination from enrichment data (tone + voice register + depth + book). Falls back to ungrouped list when neither produces meaningful structure — honest about indexing depth rather than fabricating structure.

**Relationships:** Search (FTR-020) returns a ranked list for lookup; exploration returns a structured overview for study. Theme pages show one curated theme; exploration spans multiple themes for a given question.

**Technique boundary (FTR-055, PRI-04):** Queries about meditation technique receive Practice Bridge behavior, not exploration results.

**API endpoint:** `GET /api/v1/guide/explore` — params: `q` (required), `language` (optional), `limit_per_group` (optional, default 3, max 10). Response: `groups` (passages grouped by sub-theme with totals), `distribution` (book-level counts), `glossary_terms`, `related_themes`, `meta`.

**Service layer:** `/lib/services/guide-exploration.ts` — orchestrates existing services (search, themes, glossary, relations). No AI calls at query time.

**Caching:** `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`. Suggested starting points cached at ISR build time with 24-hour revalidation.

**Global-First (FTR-006):** HTML-first with semantic `<section>` elements. Full exploration renders without JavaScript. Progressive enhancement adds expand/collapse and keyboard navigation (FTR-040). FCP < 1.5s.

**Multilingual (FTR-058):** Honest about coverage differences across languages.

**No account required.** Anonymous through STG-023 (FTR-002, FTR-009). Passages saveable via Lotus Bookmarks (FTR-046).

**Stage:** STG-007. Degrades gracefully before full enrichment — flat list grouped by book with basic theme tags.

---

### `/journeys` — Calendar Reading Journeys

Browse available time-bound reading experiences. Lists evergreen, seasonal, and annual journeys with descriptions, durations, and "Subscribe" buttons. Active seasonal journeys highlighted.

### `/explore` — Knowledge Graph Visualization (FTR-124, FTR-035)

Interactive visual map of the entire teaching corpus. See FTR-124 for the consolidated specification.

### `/integrity` — Content Integrity Verification (FTR-123)

Public page listing all books and per-chapter content hashes. "How to verify" instructions. Statement of textual fidelity. See FTR-123.

### `/vocabulary` — Yogananda's Language (FTR-029, FTR-062)

A dedicated page presenting Yogananda's vocabulary as a translation guide between contemporary language and his specific usage. Not definitions (the glossary handles that — see FTR-062), but a bridge: "You might search for 'mindfulness' — Yogananda's word is 'concentration, one-pointed attention.'" Each term links to the glossary definition, passages where Yogananda uses it, and related search.

**Data source:** The terminology bridge mapping built for FTR-029 search suggestions. The vocabulary page is a human-readable view of the same data.

**Stage:** STG-007 (alongside Glossary). Content is editorial — the mapping requires human curation.

---

## Notes

Consolidated from original ADR-056 per FTR-084. Browse redesign history removed — specification reflects the current text-first design. Worldview pathway catalog (WP-01 through WP-15) and life-phase catalog (9 pathways) consolidated from iterative design sessions. Glossary specification lives in FTR-062.
