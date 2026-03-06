# FTR-119: Teachings Platform — Shared Foundation for SRF and YSS

**State:** Proposed
**Domain:** foundation
**Arc:** 1+
**Governed by:** FTR-058, FTR-058, FTR-135, FTR-011, FTR-015

## Rationale

### The Reframe

FTR-119 frames YSS as a branding variant — different colors and logos for Hindi/Bengali locales. But YSS is not a locale. Yogoda Satsanga Society of India was founded by Paramahansa Yogananda in 1917. It is SRF's sister organization — independent governance, independent properties (yssofindia.org, WordPress + WPML), 9 supported Indian languages (English, Hindi, Bengali, Kannada, Tamil, Telugu, Gujarati, Marathi, Malayalam), a Lessons program in 4 languages (English, Hindi, Tamil, Telugu), physical ashrams across India, a bookstore with Indian payment rails (Razorpay), and a mobile Lessons app.

The portal's API-first architecture (FTR-015) already means we're building a platform. We just haven't named the second consumer. Same philanthropist funding covers both organizations. The question is not "how do we skin the portal for Hindi?" but:

> How does the teachings platform serve two independent organizations as equal partners — sharing what benefits both, while respecting each one's autonomy?

### YSS Value Proposition — Conversation Sequencing

The authorization conversation is extractive if it leads with "we need your Hindi text." It becomes reciprocal when it leads with value:

1. **Deliver first.** English search widget for yssofindia.org — a Web Component that drops into any WordPress page, branded YSS, zero maintenance. YSS sees the platform working before being asked to contribute.
2. **Name the platform neutrally.** "Yogananda Teachings Platform" — not "SRF Online Teachings Portal." Language matters in organizational conversations.
3. **Ask second.** With the widget demonstrating value, the Hindi authorization conversation becomes "shall we extend this to Hindi seekers?" rather than "can we have your text?"
4. **Empower, don't extract.** Offer methodology transfer (AI-human collaboration, design documentation as institutional memory), development tooling (Claude Code skills for YSS integration), and technology choice (WordPress, React, or anything that calls REST).

The timeline also matters. If the authorization conversation happens *after* the English portal launches (late 2026), Hindi activation could be 2027+. If it happens *during* Arc 1 development, Hindi could ship months earlier — potentially alongside or shortly after Spanish.

### Platform Architecture: Shared Engine, Independent Surfaces

```
SHARED ENGINE (one instance, both organizations benefit)
├── Corpus database (Neon, all languages, all content types)
├── Hybrid search (BM25 + vector + RRF, per-language indexes)
├── Content ingestion pipeline (source-agnostic, 12 steps)
├── AI enrichment (themes, entities, relations — deterministic)
├── Knowledge graph (cross-language, cross-author connections)
├── Embedding index (Voyage voyage-3-large, 26 languages)
└── REST API (/api/v1/*, language param, org param where needed)

ORGANIZATION CONFIG (per-org settings, not multi-tenancy)
├── Brand tokens (colors, fonts, logos)
├── Language matrix (which languages this org surfaces)
├── Bookstore routing (SRF Bookstore vs YSS Bookstore per language)
├── Practice Bridge routing (SRF Lessons vs YSS Lessons)
├── Feature flags (which platform features this org has selected)
└── Domain / URL strategy

SURFACE OPTIONS (each organization selects)
├── Full portal deployment (Next.js, org-configured)
├── Embeddable widgets (search, passage, theme — Web Components)
├── API integration (REST endpoints, documented, versioned)
└── App integration (API powering mobile Lessons app)
```

The shared engine is exactly what we are building. The organization config is a lightweight configuration layer. The surface options are natural consequences of the API-first architecture.

### Component 1: Hindi Authorization Partnership

YSS has the authorized Hindi *Autobiography of a Yogi*. The entire Milestone 5b deferral was based on ebook purchasing logistics, not content availability. YSS authorization of the Hindi source text for the shared corpus could unblock Hindi activation — ~425M reachable people, comparable to Spanish (~430M).

If authorized, Hindi could enter the execution sequence after Spanish, potentially as a parallel workstream during Milestone 1c or as a dedicated milestone. The language readiness gate (FTR-058) still applies: text ingested + UI strings translated + human reviewer confirmed + search quality evaluation passes.

**Action needed:** Conversation with YSS about authorizing the Hindi text for shared corpus use.

**Hindi Vocabulary Bridge.** The Vocabulary Bridge (FTR-028) for Hindi is a separate artifact, not a translation of the English bridge. Hindi spiritual vocabulary carries distinct cultural weight — *dhyan* (ध्यान), *sadhana* (साधना), *kriya* (क्रिया) map differently than their English approximations. The Hindi bridge should be co-created with YSS editorial input to ensure cultural fidelity. Additionally, Hindi seekers commonly type in Roman script ("yogananda dhyan"); the search pipeline needs a Romanized-to-Devanagari transliteration step using fastText (already in stack for language detection) + `indic-transliteration`. This is genuinely new technical scope not present in any Latin-script language workstream.

### Component 2: Bidirectional Content Contribution

YSS-published editions of Yogananda's works carry full lineage authority — Yogananda founded YSS. These are not third-party texts. Tamil, Telugu, and Kannada editions (if they exist as YSS publications) enter the corpus through the same ingestion pipeline with the same quality gates. Languages enter the platform without expanding SRF's 10-language scope commitment — each organization determines which languages it surfaces.

By FTR-011 reachable population metrics, YSS-contributed languages are significant:

| Language | Speakers | Internet % | Reachable | Equivalent Tier |
|----------|----------|------------|-----------|-----------------|
| Tamil | ~85M | ~60% | ~51M | Tier 2 |
| Telugu | ~96M | ~60% | ~58M | Tier 2 |
| Kannada | ~64M | ~60% | ~38M | Tier 2–3 |

Together ~147M reachable people — more than Portuguese (Tier 2, ~145M) or any individual Tier 3 language.

**Content provenance** is attribution metadata, not a search signal. A Tamil passage from YSS's edition is attributed to Yogananda with publication source noted. Language matching provides natural audience curation — Hindi content serves Hindi seekers regardless of which organization contributed it. No organizational relevance bias in search ranking.

### Component 3: Magazine Content

Both SRF and YSS publish magazines with teaching-relevant articles. Magazine content enters the shared corpus through the same 12-step pipeline (FTR-022) with a magazine-specific source adapter. FTR-018 (Unified Content Pipeline Pattern) already handles multiple content types.

Magazine-specific considerations: `content_type` distinguishes from book chapters; `publication_date` enables temporal discovery; organizational source is attribution metadata. Search treats all content equally — Yogananda's words are Yogananda's words. See also FTR-155 (Magazine API Rationalization, currently suspended).

### Component 4: Organization Configuration Layer

Lightweight configuration, not multi-tenancy:

```
/lib/config/organizations/srf.json   — SRF brand tokens, language matrix, routing
/lib/config/organizations/yss.json   — YSS brand tokens, language matrix, routing
```

| Config | SRF | YSS |
|--------|-----|-----|
| Primary color | Navy `#1a2744` | Rust/Terracotta `#bb4f27` |
| Accent | Gold `#dcbd23` | (TBD — from YSS design review) |
| Heading font | Merriweather | Raleway (per yssofindia.org) or TBD |
| Body font | Lora / Merriweather | TBD (review with YSS) |
| Devanagari | Noto Serif/Sans Devanagari | Same (shared typography research, FTR-131) |
| Bookstore URL | srfbookstore.org | yssofindia.org/bookstore |
| Practice Bridge | srflessons.org | yssofindia.org/lessons |
| Languages | EN, ES, HI, PT, BN, DE, JA, FR, IT, TH | HI, BN, TA, TE, KN, EN (+ others per YSS) |

API endpoints that return bookstore links or Practice Bridge routing accept an optional `org` parameter. Search, content, themes, and knowledge graph endpoints are organization-agnostic.

**Early proof-of-concept: Earth reader theme.** The "Earth" color theme (terracotta accent `#bb4f27`, clay-paper background) was implemented as a standalone reader feature — the sixth theme in the Auto → Light → Sepia → Earth → Dark → Meditate progression. It validates that the theme system supports accent-color variation per context without organizational infrastructure. When the organization configuration layer ships, Earth becomes the natural default theme for Hindi locale — cultural welcome without explicit branding. See FTR-040 § Earth theme.

**Organizational provenance via source edition.** The deferred `organization` column may be unnecessary. Each book edition already carries a publisher in its metadata — "Self-Realization Fellowship" or "Yogoda Satsanga Society of India." Source edition → publisher provides organizational provenance without adding an explicit column. Language matching handles audience separation naturally. If a future use case genuinely requires an `organization` column, it can be added as a simple migration — but the burden of proof is on demonstrating that edition-based provenance is insufficient.

### Component 5: Surface Options — Parts or Whole

YSS selects their integration level:

**Option A: Embeddable Widgets (lowest friction).** Web Components that drop into any WordPress page. Search widget, passage display, theme explorer. Configurable branding via attributes. YSS team needs no Next.js skills.

**Option B: API Integration (medium friction).** YSS developers or their mobile Lessons app call REST endpoints directly. Full control over presentation. Documented, versioned API per FTR-015.

**Option C: Full Portal Deployment (highest value).** The Next.js portal configured with YSS branding, language matrix, and routing. Separate domain (e.g., `teachings.yssofindia.org`). Shared API backend.

All three can coexist — YSS might embed a search widget in yssofindia.org (A), power their Lessons app with the API (B), and later deploy a full YSS teachings portal (C).

### Component 6: Feature Select-In Model

Each portal capability is independently adoptable:

| Feature | SRF | YSS Priority | Notes |
|---------|-----|-------------|-------|
| Hybrid search | Core | Core | Same engine, per-language |
| Reading experience | Full | Widget or portal | Shared Devanagari typography |
| Practice Bridge | → SRF Lessons | → YSS Lessons | Same concept, different routing |
| Presentation mode (M2b-15) | Full | **High** | Communal reading primary in India |
| Passage sharing (WhatsApp) | Full | **High** | WhatsApp dominant in India |
| Knowledge graph | Full | Selectable | Cross-language connections |
| Theme browser | Full | Selectable | Theme priorities may differ |
| Quiet Corner | Full | Selectable | Contemplative micro-sanctuary |
| Bookstore integration | SRF Bookstore | YSS Bookstore | Per-org routing |
| Ashram/center finder | Not planned | **YSS-developed** | New capability, could generalize |

**Minimal Presentation Mode.** Communal reading (satsang, group study) is primary in Indian devotional culture, not secondary. A CSS toggle (~50–100 lines) that strips navigation chrome for projected/shared reading could ship in Milestone 2a — high value for YSS at minimal technical cost. This is a design decision, not a feature — "display the same content with less chrome."

YSS can also develop new capabilities — ashram finder, Dhyana Kendra schedule, India-specific entry paths — that may flow back to the shared platform if generalized.

### Component 7: Development Empowerment

YSS's technical capacity is unknown. The platform should empower regardless of capacity level:

- **Platform documentation as AI development context.** The design docs (DESIGN.md, ADRs, design files) serve as context for AI-assisted development. A YSS developer using Claude Code loads platform docs and builds on the API with full architectural understanding.
- **Custom Claude Code skills** for YSS integration tasks: widget embedding, language addition, content contribution workflows.
- **Methodology transfer.** The AI-human collaboration model, design documentation as institutional memory, ADR-driven decisions — a practice YSS could adopt for their own properties.
- **Technology choice.** YSS may prefer WordPress integration, a separate React app, or a framework entirely of their choosing. The API-first architecture supports all.

### Component 8: Content Governance

Each organization governs its contributed source text through the ingestion process (editorial review, authorization, quality gates). The enrichment pipeline is shared and deterministic — same AI model, same theme taxonomy, same entity resolution. Content that passes the language readiness gate (FTR-058) becomes part of the shared corpus.

Human editorial overrides (theme corrections, entity fixes) are per-content, not per-organization. Once a text enters the corpus, it is Yogananda's teaching — attributed to its publication source but not organizationally siloed.

Governance questions to resolve: Who triggers re-ingestion when errors are found? Does each organization maintain editorial authority over contributed texts? Lightweight governance that respects both organizations' authority without creating bureaucracy.

### Component 9: The SRF/YSS App as Integration Surface

The existing SRF/YSS mobile app (iOS/Android) has an eReader for the private Lessons. The portal's API could power discovery features within that app:
- Search published teachings from the Lessons app → portal search API
- Thematic connections between Lessons content and published books → knowledge graph API
- "Read more about this topic" → portal reading experience or API-served content

This is high-value, low-friction integration — the API exists, the app exists, the connection is an API call.

### Phased Approach

| Phase | When | What |
|-------|------|------|
| **Design** | Arc 1 | Organization config structure. API parameter design. Widget architecture decisions. Documented in this PRO and successor ADR/DES when adopted. |
| **Hindi activation** | When YSS authorizes | Hindi source text enters ingestion pipeline. Language readiness gate (FTR-058) determines activation timeline. Could be Arc 1 or early Arc 2. |
| **API + Widgets** | Milestone 2a+ | Organization-aware API parameters. Embeddable search widget with configurable branding. YSS can integrate into yssofindia.org. |
| **Content expansion** | Milestone 5b+ | Tamil, Telugu, Kannada editions enter corpus. Magazine content from both organizations. Each clears readiness gate independently. |
| **Full deployment** | When YSS is ready | YSS-branded portal deployment if desired. Same codebase, different configuration. |

### Subsumption of FTR-119

FTR-119 (YSS Locale Branding) is one facet of this broader platform proposal. Locale-specific branding (colors, logos, organizational identity for Hindi/Bengali locales) is addressed by Component 4 (Organization Configuration Layer). FTR-119 is subsumed, not invalidated — its concerns are fully covered here.

### What This Changes Architecturally

| Layer | Change | Cost |
|-------|--------|------|
| `/lib/config/organizations/` | Per-org JSON config files | Trivial |
| API endpoints | Optional `org` param on content responses (bookstore links, Practice Bridge routing) | Small |
| Design tokens | Exportable per-org token sets | Medium |
| Widget build target | Web Components build of search/passage/theme components | Medium |
| Content pipeline | Already source-agnostic — no change needed | Zero |
| Search engine | Already per-language — no change needed | Zero |
| Database schema | No changes now. Defer `organization` column until model is vetted. | Zero |

### What This Does NOT Change

Search engine architecture, enrichment pipeline, knowledge graph, API conventions (FTR-088), core reading experience, accessibility infrastructure, DELTA compliance, or the 11 principles. The platform's spiritual character is unchanged — only its organizational reach expands.

## Notes

- **Dependencies:** Working API (Milestone 1c). Hindi authorization conversation with YSS. Content availability in Tamil, Telugu, Kannada.
- **Target:** Design decisions in Arc 1; content activation incremental from Milestone 5b onward (or earlier if Hindi authorization proceeds)
- **Re-evaluate at:** Arc 1 boundary (design decisions), Hindi authorization progress, Milestone 5b planning
- **Decision required from:** Human principal (YSS stakeholder conversation), Architecture (config structure, API parameters, widget architecture)
- **Absorbs:** FTR-119 (YSS Locale Branding — subsumed by Component 4)
