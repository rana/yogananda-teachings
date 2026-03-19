---
ftr: 121
title: "Teaching Topics — Curated Thematic Entry Points and Multi-Category Taxonomy"
summary: "Curated thematic entry points (Peace, Courage, Healing, Joy, Purpose, Love) with auto-tagging and editorial review"
state: approved
domain: search
governed-by: [PRI-03, PRI-08, PRI-09]
depends-on: [FTR-026]
---

# FTR-121: Teaching Topics

## Rationale

### FTR-121: Teaching Topics — Curated Thematic Entry Points

#### Context

The current portal design centers on a search bar: the user must articulate a query to find relevant passages. But many seekers — especially those arriving in distress — cannot articulate what they need. They know they are suffering, but they may not know that Yogananda wrote specifically about their kind of suffering.

Three approaches were considered:

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **Search-only** | User must type a query | Simple; no editorial curation needed | Requires the user to know what to search for; fails the "2 AM crisis" test |
| **AI recommendation engine** | AI analyzes user behavior and recommends passages | Personalized; adaptive | Violates DELTA principle of Agency (algorithmic manipulation); violates Calm Technology (attention-harvesting); requires user accounts and tracking |
| **Curated thematic entry points** | Pre-defined teaching topics (Peace, Courage, Healing, Joy, Purpose, Love) with editorially tagged passages | No tracking; no algorithmic manipulation; works for anonymous users; SEO-discoverable | Requires editorial effort to tag passages; topics are subjective |

#### Decision

Implement **curated thematic entry points** ("Doors of Entry") as a complement to search. The homepage presents 4–6 teaching topics alongside the search bar. Each topic links to a curated collection of passages drawn from across all ingested books.

**Initial theme taxonomy:**

| Theme | Maps to Life Challenges | Yogananda's Terms |
|-------|------------------------|-------------------|
| **Peace** | Anxiety, stress, overwhelm, insomnia | Calmness, equanimity, stillness, tranquility |
| **Courage** | Fear, self-doubt, uncertainty, worry | Fearlessness, divine protection, will power |
| **Healing** | Physical illness, depression, grief, addiction | Health, vitality, affirmation, life force |
| **Joy** | Depression, loneliness, emptiness, sorrow | Bliss, divine joy, happiness, ananda |
| **Purpose** | Existential questioning, career, direction | Dharma, duty, right activity, God's plan |
| **Love** | Relationships, family, loneliness, loss | Divine love, unconditional love, soul love, friendship |

#### Rationale

- **Meets seekers where they are.** A person in crisis doesn't need a search engine — they need a door to walk through. "Peace" is easier to tap than formulating "how do I overcome anxiety according to Yogananda."
- **No algorithmic manipulation.** Themes are editorially curated, not behaviorally targeted. Every user sees the same doors. This satisfies the DELTA principle of Agency.
- **No tracking required.** Works for anonymous users with no accounts. Aligns with the portal's zero-friction access design.
- **SEO discoverability.** Theme pages (e.g., `/themes/peace`, `/themes/healing`) become landing pages. Someone Googling "spiritual guidance for grief" can land directly on a relevant page.
- **Scales with the corpus.** Each new ingested book adds passages to existing themes. The doors become richer over time without redesign.
- **Precedent in Yogananda's own works.** *Where There Is Light* is organized exactly this way — by life topic. The feature is a digital extension of an editorial structure Yogananda's publishers already established.

#### Implementation

- A `teaching_topics` table in Neon with a many-to-many join to `book_chunks`
- Themes assigned during ingestion (automated via embeddings + human review) or as a lightweight editorial curation step
- Theme pages are pre-built search results, rendered as static pages with ISR
- Each theme page shows a rotating selection of passages (different on each visit, not algorithmically personalized — simple random sampling)

#### Consequences

- Requires a theme taxonomy to be defined and maintained (initial set above, expandable)
- Requires tagging infrastructure: either manual tagging during ingestion QA, or semi-automated tagging using embedding similarity to theme descriptions
- Theme pages need design work (a new page template beyond search results and the book reader)
- The tagging effort is front-loaded but amortized: once the taxonomy exists, new books are tagged during their ingestion pipeline
- The themes must be validated against the actual corpus — a theme is only useful if the corpus contains sufficient passages for it
- **MMR diversity (Discovery Research, March 2026):** When generating the random passage selection for a theme page visit, apply Maximal Marginal Relevance (MMR) rescoring. If a seeker clicks "Peace," the algorithm selects passages highly relevant to Peace but uses MMR to ensure maximum variance among selections in terms of depth signature and voice register — preventing five dense philosophical passages in a row. MMR penalizes candidates similar to already-selected items, ensuring a balanced reading experience across consoling, catalytic, narrative, and contemplative passages within the same theme. Also apply appeal-factor faceting: allow seekers to filter a theme by experiential dimension — separating "consoling peace" from "catalytic peace" — scaling the librarian's nuanced interview process to a global audience (see deep-research-gemini-discovery-without-surveillance.md)
- **Extended by FTR-121:** Multi-category taxonomy (quality, situation, person, principle, scripture, practice, yoga_path), semi-automated tagging pipeline with three-state provenance, and `description_embedding` for auto-tagging

### FTR-121: Teaching Topics Multi-Category Taxonomy and Semi-Automated Tagging Pipeline

#### Context

The initial teaching topic design (FTR-121) defined six abstract spiritual qualities — Peace, Courage, Healing, Joy, Purpose, Love — as curated thematic entry points ("Doors of Entry") on the homepage. These serve seekers who want to cultivate a spiritual quality.

However, Yogananda wrote extensively about *life circumstances* — relationships, parenting, grief, work, aging, loneliness. These are a different kind of entry point: not "I want to cultivate this quality" but "I'm going through this and need guidance." A seeker dealing with a divorce, raising a child, or mourning a parent has a concrete situational need that the abstract quality themes don't directly address.

The portal's theme taxonomy needed to expand to serve both dimensions without compromising the calm, focused homepage design.

#### Alternatives Considered

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **Expand the flat list** | Add situation themes alongside quality themes in a single list | Simple; no schema change | Homepage "Doors of Entry" grid becomes unwieldy at 12–15 themes; mixes two different kinds of entry point |
| **Two-tier taxonomy** | Add a `category` column ('quality' vs 'situation'); homepage shows only qualities; a "Browse all themes" page shows both | Preserves calm homepage; honest about the two different entry-point types; trivial schema change | Situation themes are one click further from the homepage |
| **Expand "Seeking..." section** | Keep six quality themes; evolve "Seeking..." entry points into full curated collections | No schema change; preserves homepage | Overloads the "Seeking..." section, which was designed as empathic search shortcuts, not browsable collections |

#### Decision

Implement a **multi-category theme taxonomy** with a `category` column on `teaching_topics`:

- **`quality`** — spiritual/emotional states (Peace, Courage, Healing, Joy, Purpose, Love). Displayed as "Doors of Entry" on the homepage. Six cards, stable.
- **`situation`** — life circumstances (Relationships, Parenting, Loss & Grief, Work, Loneliness, Aging, and others as content supports). Accessible from "Explore all themes" page linked below the Doors of Entry and from Books. Not on the homepage grid.
- **`person`**, **`principle`**, **`scripture`**, **`practice`**, **`yoga_path`** — added in FTR-122. Accessible from the "Explore all themes" page. Same tagging pipeline.

All categories use the same theme page template (`/themes/[slug]`). No visual distinction — a seeker browsing "Christ" gets the same reverent, passage-focused experience as one browsing "Peace."

#### Theme Tagging Pipeline

Themes are applied to passages via a **semi-automated pipeline: embeddings propose, humans approve.**

**Three-layer process:**

1. **Embedding similarity (automated proposal).** Each theme has a `description` field and a `description_embedding` (same model as book chunks). At ingestion time — or when a new theme is added retroactively — every chunk's embedding is compared against every theme's description embedding via cosine similarity. Chunks above a threshold (e.g., 0.45) receive a candidate `chunk_topics` row with `tagged_by = 'auto'`. This is pure vector math against existing embeddings — no new API calls, no re-ingestion.

2. **Claude classification (optional, for ambiguous cases).** Passages near the similarity threshold may be ambiguous — a passage about "finding peace in family conflict" could be Peace, Relationships, or Healing. Claude can be used as a classifier (same "librarian" role as in search — classifying, not generating): given a passage and theme definitions, which themes apply? This catches what pure vector similarity misses.

3. **Human review (mandatory gate).** No auto-tagged passage is served to users. Auto-tagging produces a candidate list per theme. A reviewer approves, rejects, or adjusts. Approved tags are marked `tagged_by = 'reviewed'`. Reviewers can adjust `relevance` — a passage that perfectly encapsulates the theme gets higher relevance, making it more likely to appear on the theme page.

**Three-state `tagged_by` provenance:**

| Value | Meaning | Served to users? |
|-------|---------|-----------------|
| `manual` | Human placed this tag directly | Yes |
| `auto` | Machine proposed, not yet reviewed | **No** — candidates only |
| `reviewed` | Machine proposed, human approved | Yes |

**Adding a new theme retroactively is cheap:** All chunks already have embeddings. Adding "Relationships" requires one `INSERT` into `teaching_topics`, one vector similarity scan (seconds), optional Claude refinement on borderline cases, and human review of the candidate list. No re-ingestion, no re-embedding. The front-loaded cost is the initial tagging of existing books. After that, each new theme is incremental.

**Publication decision:** A topic page goes live when an editor judges the tagged passages have sufficient depth. No fixed minimum count — five deeply relevant passages about a niche topic like Laya Yoga is worth publishing, while three tangentially tagged passages about a broader topic probably isn't. Human judgment, not mechanical thresholds. This is consistent with the portal's philosophy: AI proposes, humans approve.

#### Schema Changes

```sql
-- teaching_topics: add category and description_embedding columns
ALTER TABLE teaching_topics ADD COLUMN category TEXT NOT NULL DEFAULT 'quality';
ALTER TABLE teaching_topics ADD COLUMN description_embedding VECTOR(1024);
CREATE INDEX idx_teaching_topics_category ON teaching_topics(category);

-- chunk_topics: three-state tagged_by + similarity score
-- tagged_by values: 'manual', 'auto', 'reviewed'
-- similarity: cosine similarity when auto-tagged (NULL for manual)
ALTER TABLE chunk_topics ADD COLUMN similarity FLOAT;
CREATE INDEX idx_chunk_topics_pending ON chunk_topics(tagged_by) WHERE tagged_by = 'auto';
```

#### API Changes

`GET /api/v1/themes` gains a `category` query parameter:
- `category=quality` — returns only quality themes (used by homepage Doors of Entry)
- `category=situation` — returns only situation themes
- `category=person` — spiritual figures (FTR-122)
- `category=principle` — yogic principles / Yama-Niyama (FTR-122)
- `category=scripture` — sacred texts (FTR-122)
- `category=practice` — spiritual practices (FTR-122)
- `category=yoga_path` — paths of yoga (FTR-122)
- Omitted — returns all topics, ordered by category then sort_order

`GET /api/v1/themes/[slug]/passages` — unchanged. Works identically for all categories. Only serves passages with `tagged_by IN ('manual', 'reviewed')`.

#### Multilingual Implications

None. The existing `topic_translations` table handles localized names for any theme regardless of category. Theme descriptions used for auto-tagging are internal (not displayed). The multilingual embedding model produces reasonable candidates for non-English chunks even from English-language theme descriptions. Per-language theme descriptions can improve accuracy in STG-021 but are not required.

#### Consequences

- STG-007 scope expanded: deliverable 4.1 (theme tagging pipeline) now includes the auto-tagging infrastructure, not just manual tagging
- Situation themes are added incrementally during STG-007+ as content is ingested and sufficient passages confirmed
- The homepage stays calm — six quality doors, one quiet link to explore all themes
- Editorial governance needed: who decides when a new theme has enough passages to go live?
- The `description` field on `teaching_topics` now serves double duty: internal reference *and* auto-tagging input. Descriptions should be written as rich keyword-laden paragraphs, not terse labels.
- The review queue (`tagged_by = 'auto'`) needs a workflow — Stages 1a–3d use a script or Retool dashboard; post-STG-009 uses Contentful
- **Extended by FTR-122:** Four additional exploration categories (person, principle, scripture, practice) added to the taxonomy, using the same infrastructure

## Notes

- **Origin:** FTR-121 (Rationale) + FTR-121 (Rationale)
