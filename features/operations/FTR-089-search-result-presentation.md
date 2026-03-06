---
ftr: 89
title: Search Result Presentation
state: approved
domain: operations
arc: 1a+
governed-by: [PRI-01, PRI-02, PRI-03]
---

# FTR-089: Search Result Presentation

## Rationale

**Status:** Accepted | **Date:** 2026-02-22

**Relates to:** FTR-001, FTR-005, FTR-020, FTR-030, FTR-088, FTR-015

### Context

The portal's search architecture is distributed across multiple ADRs: hybrid search mechanics (FTR-020), Claude's role in ranking (FTR-005 C2), related teachings (FTR-030), search suggestions (FTR-029), and API conventions (FTR-088). But no single ADR addresses how search results are *presented* to seekers — the ranking signals, display format, deduplication rules, and the deliberate absence of pagination. These decisions are architectural (they shape the seeker's primary interaction) and should be governed, not left to implementation.

### Decision

#### 1. Ranking signal hierarchy

Search results are ranked by a composite score combining multiple signals. The hierarchy (highest to lowest weight):

| Signal | Source | Weight | Notes |
|---|---|---|---|
| **Semantic relevance** | Vector similarity (cosine distance) | Primary | The passage's meaning matches the query's intent |
| **Lexical relevance** | Full-text search rank (ParadeDB BM25 `paradedb.score()`, FTR-025) | Secondary | Exact term matches, especially for proper nouns and Sanskrit terms |
| **Claude passage ranking** | Claude Haiku (FTR-005 C2) | Tertiary (re-ranker) | Re-ranks the top candidates from hybrid retrieval based on query intent |
| **Accessibility level** | `accessibility_level` column (FTR-005 E3) | Tie-breaker | When two passages are equally relevant, the more accessible passage ranks higher |
| **Tone appropriateness** | `tone` column (FTR-005 E4) | Tie-breaker | When the query implies emotional need (grief, fear), consoling passages rank higher |

| **Author tier** | `books.author_tier` column (FTR-001) | Tie-breaker | Guru tier ranks above president at equivalent relevance; president above monastic. Reflects author role hierarchy. |

**Not used as ranking signals:** Passage length, book popularity, recency, seeker behavior, click-through rates. The portal never uses engagement metrics to shape results (FTR-082, FTR-002).

#### 2. Display format per result

Each search result displays:
- **Passage text** — the verbatim chunk content. No AI-generated summary, no truncation below 200 characters.
- **Author name** — full author name on ALL passages across ALL author tiers (FTR-001). Always "Paramahansa Yogananda", "Swami Sri Yukteswar", "Sri Daya Mata", etc. — never shortened. Displayed in search results, passage display, daily wisdom, social media cards, and all other citation contexts.
- **Citation** — author name, book title, chapter title, page number. Always present. Never omitted for brevity.
- **"Read in context" link** — deep link to the reader at the passage's location. This link is the critical bridge between the librarian's finding and the seeker's reading (FTR-001).
- **Relevance score** — not displayed to seekers. Used internally for debugging and search quality evaluation.

**Not displayed:** Themes, accessibility level, tone classification. These are infrastructure signals, not seeker-facing metadata.

#### 3. Deduplication

When the same passage appears in multiple editions or as both a book chunk and a magazine article chunk:
- **Same content, different editions:** Display once. Use the preferred edition (highest `edition_year`). The archived edition's passage does not appear.
- **Same content, different content types (book vs. magazine):** Display the book passage. The magazine attribution appears only if the seeker is browsing the magazine section.
- **Near-duplicate passages** (same teaching in different books, different wording): Display both. Yogananda deliberately taught the same principles in different contexts — these are not duplicates, they are complementary perspectives.

#### 4. Result count rationale

Default 5 results, maximum 20 per request. No pagination.

- **5 as default:** The librarian metaphor — "Here are the five most relevant passages" — matches how a human librarian responds. Presenting 50 results would imply a search engine, not a librarian.
- **20 as maximum:** A seeker who explicitly requests more (via `limit` parameter or future "Show more" button) can see up to 20. Beyond 20, the relevance tail drops below usefulness for most queries.
- **No pagination:** The librarian does not say "here are results 21–40." If a seeker wants broader exploration, the portal offers theme pages (`/themes/{slug}`), the browse index (`/browse`), and the Knowledge Graph — purpose-built for exploration, not search result pagination.

#### 5. Empty results behavior

When search returns zero results:
- Display a warm message: *"I couldn't find teachings on that topic. You might explore related themes below, or try different words."*
- Suggest 2–3 related themes based on query term similarity to theme names.
- Never display "No results found" without guidance.
- Log the zero-result query for search quality evaluation (anonymized, FTR-082).

#### 6. Search quality evaluation integration

The presentation decisions above are validated by the search quality test suite (ROADMAP deliverable M1a-8):
- Each test query has expected passages that should appear in the top 3 results.
- Accessibility boosting is validated: for empathic queries ("dealing with grief"), consoling/accessible passages should rank higher.
- Deduplication is validated: edition variants should not appear as separate results.
- Empty results guidance is validated: intentionally obscure queries should produce helpful suggestions, not empty pages.

### Alternatives Considered

1. **Display themes and accessibility level on results.** Provides more context but risks visual clutter on a calm interface. Theme information is available by clicking "Read in context."

2. **Paginated search.** Conventional but contradicts the librarian model. The portal is not a search engine — it is a finding aid.

3. **AI-generated result summaries.** Would provide quick scanning but violates FTR-001 (no AI synthesis of Yogananda's words). The passage text *is* the summary.

### Consequences

- FTR-015 search endpoint documentation updated to reference this ADR for presentation logic.
- The search quality test suite (deliverable M1a-8) must validate ranking, deduplication, accessibility boosting, and empty-result behavior.
- Future content types entering search (video transcripts, audio transcripts, magazine articles) must follow the same ranking hierarchy and deduplication rules. Cross-media result interleaving rules will be specified when those content types are integrated (Arc 6).
- The "5 results" default is a design decision, not a technical constraint. It may be adjusted based on Milestone 1a search quality evaluation — but the adjustment should be governed (update this ADR), not ad hoc.

## Notes

**Provenance:** FTR-089 → FTR-089
