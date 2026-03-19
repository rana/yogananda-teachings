---
ftr: 62
title: "Living Glossary — Spiritual Terminology as User-Facing Feature"
summary: "Browsable glossary page and opt-in inline term highlighting with verbatim Yogananda definitions"
state: approved
domain: editorial
governed-by: [PRI-01, PRI-02, PRI-06]
depends-on: [FTR-028]
---

# FTR-062: Living Glossary

## Rationale

### Context

The Vocabulary Bridge (FTR-028) maps modern and cross-tradition terms to Yogananda's vocabulary for internal search expansion. It is invisible to seekers. Yet Yogananda's writings use hundreds of Sanskrit, yogic, and esoteric terms — *samadhi*, *chitta*, *prana*, *astral body*, *Christ Consciousness* — that newcomers cannot be expected to know. A seeker encountering "samadhi" for the first time has nowhere within the portal to learn what it means. They must leave the portal, which breaks the reading flow and undermines the library's self-contained nature.

### Decision

Surface the spiritual terminology bridge as a user-facing glossary with two delivery mechanisms:

**1. Glossary page (`/glossary`):**
- Browsable, searchable, organized by category (Sanskrit terms, yogic concepts, spiritual states, scriptural references)
- Each entry contains: term, brief definition (1-2 sentences, editorially written), Yogananda's own explanation (verbatim quote from the corpus where he defines the term, with full citation), and links to theme pages and reader passages where the term appears
- Search within the glossary uses trigram matching (`pg_trgm`) for partial/fuzzy lookups
- Multilingual: glossary entries carry a `language` column; STG-021 adds per-locale glossaries built during the human review cycle

**2. Inline term highlighting in the reader (opt-in):**
- Toggle in reader settings: "Show glossary terms" (off by default)
- When enabled, recognized glossary terms in the reader text receive a subtle dotted underline (`border-bottom: 1px dotted var(--srf-gold)` at 40% opacity)
- Hovering (desktop) or tapping (mobile) reveals a tooltip: brief definition + "Read Yogananda's explanation →" linking to the relevant passage
- No AI-generated definitions — every definition is editorially written, every "explanation" is a verbatim Yogananda quote
- Terms are matched at ingestion time (stored in `chunk_glossary_terms` junction table), not at render time — zero client-side regex

### Schema

```sql
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  term TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brief_definition TEXT NOT NULL,  -- 1-2 sentences, editorially written
  category TEXT NOT NULL CHECK (category IN (
    'sanskrit', 'yogic_concept', 'spiritual_state',
    'scriptural', 'cosmological', 'practice'
  )),
  explanation_chunk_id UUID REFERENCES book_chunks(id),  -- Yogananda's own definition
  language TEXT NOT NULL DEFAULT 'en',
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now,
  updated_at TIMESTAMPTZ DEFAULT now
);

CREATE TABLE chunk_glossary_terms (
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES glossary_terms(id) ON DELETE CASCADE,
  PRIMARY KEY (chunk_id, term_id)
);
```

### Scheduling

- Data: Seeded from Vocabulary Bridge Layer 2 entries (FTR-028). Enriched per-book via FTR-028 extraction lifecycle.
- Glossary page (`/glossary`): STG-005 (when multi-book content provides sufficient explanation passages).
- Inline reader highlighting: STG-005 (reader settings already exist from STG-004).

### Consequences

- Two new tables (`glossary_terms`, `chunk_glossary_terms`)
- Glossary page added to navigation (linked from reader settings and footer, not in primary nav — it's a reference tool, not a destination)
- Inline highlighting is opt-in and off by default — respects the clean reading experience
- Editorial effort: brief definitions must be written for each term. Yogananda's own definitions are identified during ingestion QA.
- **Extends FTR-028** (Vocabulary Bridge) from an internal search tool to a user-facing feature

## Specification

The Vocabulary Bridge Layer 2 entries (FTR-028, FTR-028) are surfaced as a user-facing glossary. See FTR-062. Sanskrit display and search normalization policy in FTR-131.

### FTR-131: Glossary Schema Extensions

The `glossary_terms` table (defined in FTR-062) gains three optional columns for Sanskrit and spiritual terminology support:

- **`phonetic_guide`** — Simplified pronunciation guide (e.g., "PRAH-nah-YAH-mah" for prāṇāyāma). Editorially written, based on standard Sanskrit phonology. Ships with STG-007 glossary.
- **`pronunciation_url`** — URL to an SRF-approved audio pronunciation recording. Nullable; populated when SRF provides recordings (STG-021+). Stakeholder question pending.
- **`has_teaching_distinction`** — Boolean flag for terms where Yogananda's usage intentionally differs from common usage and the difference itself is part of the teaching (e.g., Aum vs. Om, "meditation," "Self-realization"). When true, the glossary UI highlights the distinction as pedagogically significant.

### Glossary API Endpoints

```
GET /api/v1/glossary → All glossary terms (paginated, cursor-based)
  ?language=en — Filter by language
  ?category=sanskrit — Filter by category
  ?q=samadhi — Search within glossary (trigram fuzzy)
  ?has_teaching_distinction=true — Filter to terms with teaching distinctions

GET /api/v1/glossary/{slug} → Single term with definition, Yogananda's explanation passage,
  phonetic guide, and pronunciation URL (if available)
```

### Glossary Page Layout

```
/glossary → Glossary landing
├── Search bar ("Find a term...")
├── Category filter (Sanskrit, Yogic Concepts, Spiritual States, Scriptural, Cosmological, Practice)
├── Alphabetical term list
│   ├── Term + phonetic guide (if available) + brief definition (1-2 sentences)
│   ├── 🔊 Pronunciation (if audio available — STG-021+)
│   ├── "Yogananda's explanation →" link to source passage
│   ├── ⚡ Teaching distinction callout (if has_teaching_distinction)
│   │   └── "Yogananda's usage differs from common usage..." with explanation
│   └── Related theme links
└── Inline reader integration (opt-in via reader settings: "Show glossary terms")
    └── Dotted underline on recognized terms → tooltip with definition
```
