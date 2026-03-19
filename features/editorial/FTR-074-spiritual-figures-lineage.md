---
ftr: 74
title: Spiritual Figures and Lineage
summary: "People table as primary content type with biographical metadata, lineage structure, and place associations"
state: approved
domain: editorial
governed-by: [PRI-01, PRI-02]
depends-on: [FTR-033, FTR-049]
---

# FTR-074: Spiritual Figures and Lineage

## Rationale

### FTR-074: Spiritual Figures as First-Class Entities

### Context

The portal currently models spiritual figures (Krishna, Christ, Sri Yukteswar, Lahiri Mahasaya, etc.) as teaching topics with `category = 'person'` in the `teaching_topics` table. This serves the question "What did Yogananda teach about Krishna?" — it's a collection of tagged passages.

But seekers who encounter a spiritual figure in the Autobiography often want something different: "Who *is* Krishna in the context of Yogananda's teachings?" This requires biographical context, lineage position, associated places, relationships to other figures, and *then* the relevant passages. The theme page answers a search question; the person page answers a reference question.

Three approaches were considered:

| Approach | Data Model | Pros | Cons |
|----------|-----------|------|------|
| **Person as theme only** | `teaching_topics` with `category = 'person'` | Simple; already built | No biographical metadata; no lineage structure; no place associations; every figure is "just a tag" |
| **Rich metadata on teaching_topics** | Add biographical columns to `teaching_topics` | Single table; reuses existing infrastructure | teaching_topics becomes overloaded (most topics don't have birth years or lineage positions); mixes concerns |
| **Separate people table linked to themes** | `people` table with FK to `teaching_topics` for tagging | Clean separation of entity metadata and passage tagging; each table does one thing | Additional table and API endpoint |

The same pattern applies to Places, which already have a dedicated `places` table with rich metadata (FTR-049). People deserve the same treatment.

### Decision

Add a **`people`** table as a primary content type, linked to the existing `teaching_topics` system for passage tagging. Create a Spiritual Figures section (`/people`) parallel to Books (`/books`) and Sacred Places (`/places`).

#### Schema

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,                      -- e.g., "Paramguru," "Avatar," "Yogiraj"
  lineage_position TEXT,           -- e.g., "Guru of Paramahansa Yogananda"
  birth_year INTEGER,
  death_year INTEGER,              -- NULL for avatars (Krishna) or living figures
  biography_short TEXT NOT NULL,   -- 2–3 sentences, editorial
  biography_long TEXT,             -- full detail page content, editorial
  image_id UUID,                   -- FK to images table (future stages, FTR-073)
  topic_id UUID REFERENCES teaching_topics(id),  -- links to theme tagging system
  language TEXT NOT NULL DEFAULT 'en',
  canonical_person_id UUID REFERENCES people(id),  -- cross-language linking
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_people_slug ON people(slug);
CREATE INDEX idx_people_published ON people(is_published) WHERE is_published = true;
```

#### Junction tables

```sql
-- People ↔ Places (e.g., Sri Yukteswar ↔ Serampore, Puri)
CREATE TABLE person_places (
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  role TEXT,                       -- 'birthplace', 'ashram', 'teaching_center', 'burial'
  PRIMARY KEY (person_id, place_id)
);

-- People ↔ People (lineage and relationships)
CREATE TABLE person_relations (
  source_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  target_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,     -- 'guru_of', 'disciple_of', 'contemporary', 'referenced_by'
  PRIMARY KEY (source_person_id, target_person_id)
);
```

#### API

```
GET /api/v1/people → List all published people
  ?language=en → Filter by language
  ?lineage=true → Filter to guru lineage only

GET /api/v1/people/[slug] → Person detail with metadata
  Response includes: biographical info, lineage position,
  associated places, related people, link to theme page

GET /api/v1/people/[slug]/passages → Passages tagged with this person
  (Delegates to the existing theme tagging system via topic_id)
  ?language=en&limit=10&cursor=...
```

#### Frontend

| Route | Purpose |
|-------|---------|
| `/people` | Spiritual Figures — organized by category (guru lineage, avatars, saints, referenced figures) |
| `/people/[slug]` | Person detail — biography, lineage, places, passages |

The Spiritual Figures section links bidirectionally with:
- **Theme pages:** `/people/krishna` links to `/themes/krishna` (tagged passages) and vice versa
- **Sacred Places:** `/people/sri-yukteswar` links to `/places/serampore` and `/places/puri`
- **Book reader:** Inline references to a person in the text can link to their Spiritual Figures entry
- **Reverse Bibliography:** `/references/bhagavad-gita` links to `/people/krishna`

#### Relationship to existing theme system

The theme page (`/themes/krishna`) continues to serve the question "What did Yogananda teach about Krishna?" The person page (`/people/krishna`) serves "Who is Krishna?" The person page includes a prominent link to the theme page ("Read what Yogananda taught about Krishna →"). The `topic_id` FK on `people` connects the two systems.

### Rationale

- **Seekers ask two kinds of questions about spiritual figures.** "What did Yogananda say about X?" (theme page) and "Who is X?" (person page). Both are natural; each deserves its own answer.
- **Avatars are constant.** Krishna, Christ, and the guru lineage do not change. Their biographical entries are stable reference content — a different kind of value than the growing, curated passage collection on theme pages.
- **Monastics and living teachers.** As new monastics lead SRF, the Spiritual Figures section preserves their biographical context. This is a respectful, mission-aligned record.
- **Cross-referencing is the unique value.** The Spiritual Figures section connects people to places, to books, to passages, and to each other. No other digital resource provides this integrated view of the spiritual figures in Yogananda's world.
- **Parallel to Places and Books.** The portal already has Books (entities with metadata + linked passages) and Places (entities with metadata + linked passages). People is the natural third pillar.
- **Low schema cost, high editorial value.** One table, two junction tables. The biographical content is editorial — written once, updated rarely.

### Consequences

- `people` table added to Neon schema (STG-008 migration, when person-category themes activate)
- `person_places` and `person_relations` junction tables added alongside
- `/people` and `/people/[slug]` routes added to the frontend (STG-008)
- API endpoints `GET /api/v1/people` and `GET /api/v1/people/[slug]` added (STG-008)
- Spiritual Figures entries require SRF editorial review and approval before publication (`is_published` gate)
- Guru photographs on person pages follow FTR-073 sacred image guidelines
- Cross-language person entries linked via `canonical_person_id` (STG-021)
- Theme pages for person-category topics gain a "Learn about [person] →" link to Spiritual Figures
- Reader inline references to named figures can link to Spiritual Figures entries (STG-008+)
- **Extends FTR-121** (teaching topics), **FTR-049** (Sacred Places), **FTR-122** (exploration categories)

### FTR-074: Monastic & Presidential Lineage

### Context

FTR-074 established the Spiritual Figures section as a primary content type with a `people` table, `person_relations` junction table, and five editorial categories on the `/people` index: guru lineage, avatars, saints and sages, referenced figures, and SRF/YSS leadership. The schema includes `birth_year`, `death_year`, `lineage_position`, and `person_relations` with relation types `guru_of`, `disciple_of`, `contemporary`, `referenced_by`.

This foundation handles "Who is Krishna?" and the guru lineage (Babaji → Lahiri Mahasaya → Sri Yukteswar → Yogananda) well. But three distinct monastic and organizational use cases expose gaps:

1. **Presidential succession.** The organizational lineage of SRF presidents (Yogananda → Rajarsi Janakananda → Daya Mata → Mrinalini Mata → Brother Chidananda) is distinct from the guru lineage. The current `person_relations` table has no `succeeded_by` relation type and no way to record the *period* of a relationship (e.g., "President from 1955 to 2010").

2. **Monastic roles and contributions.** SRF monastics serve in distinct roles — convocation speakers, editors of Yogananda's posthumous works, center leaders, board members. The current schema treats all people identically: a spiritual figure Yogananda wrote about and a monastic who edited his books share the same flat structure with no role or contribution metadata.

3. **In Memoriam and commemorative context.** The `birth_year` and `death_year` columns exist but are bare integers. There is no presentation pattern for commemorative display — a respectful "In Memoriam" treatment for monastics who have passed, or a visual timeline showing the succession of SRF leadership.

The Santa Rosa SRF Meditation Group displays a lineage of SRF presidents as an ordered visual display — photos, dates of service, a clear sense of succession. This is a natural fit for the portal, which can cross-reference each president with the teachings, places, and events of their era.

### Decision

Extend FTR-074's Spiritual Figures section with structured monastic and organizational metadata, temporal relationship tracking, and presentation patterns for lineage and commemoration.

#### Schema extensions to `people` table

```sql
ALTER TABLE people ADD COLUMN person_type TEXT NOT NULL DEFAULT 'spiritual_figure';
  -- 'spiritual_figure' (default): figures Yogananda wrote about (Krishna, Christ, Kabir)
  -- 'guru_lineage': Babaji, Lahiri Mahasaya, Sri Yukteswar, Yogananda
  -- 'monastic': SRF/YSS monastics (current and historical)
  -- 'historical': other historical figures referenced by Yogananda
  -- CHECK (person_type IN ('spiritual_figure', 'guru_lineage', 'monastic', 'historical'))

ALTER TABLE people ADD COLUMN honorific TEXT;
  -- SRF-specific honorific: 'Brother', 'Sister', 'Swami', 'Sri', 'Daya Ma', etc.
  -- Distinct from `title` (which holds spiritual titles like 'Paramguru', 'Avatar')

ALTER TABLE people ADD COLUMN is_living BOOLEAN;
  -- NULL = unknown or not applicable (avatars, ancient figures)
  -- true = living monastic or figure (editorial sensitivity applies)
  -- false = historical/passed

CREATE INDEX idx_people_type ON people(person_type) WHERE is_published = true;
```

#### Schema extensions to `person_relations` table

```sql
ALTER TABLE person_relations ADD COLUMN description TEXT;
  -- Freetext editorial context for the relationship
  -- e.g., "Served as SRF president during a period of global expansion"

ALTER TABLE person_relations ADD COLUMN start_year INTEGER;
ALTER TABLE person_relations ADD COLUMN end_year INTEGER;
  -- For temporal relationships: "President from 1955 to 2010"
  -- NULL start/end means open-ended or undated

ALTER TABLE person_relations ADD COLUMN display_order INTEGER;
  -- For ordered sequences like presidential succession
  -- NULL for unordered relationships
```

New `relation_type` values added to the existing set:

| Relation Type | Meaning | Example |
|--------------|---------|---------|
| `guru_of` | (existing) Spiritual teacher → student | Sri Yukteswar → Yogananda |
| `disciple_of` | (existing) Student → teacher | Yogananda → Sri Yukteswar |
| `contemporary` | (existing) Lived in same era | Yogananda ↔ Anandamayi Ma |
| `referenced_by` | (existing) Discussed in teachings | Krishna ← Yogananda |
| `succeeded_by` | (new) Organizational succession | Daya Mata → Mrinalini Mata |
| `preceded_by` | (new) Inverse of succeeded_by | Mrinalini Mata → Daya Mata |
| `mentored_by` | (new) Spiritual mentorship within SRF | Brother Anandamoy → Yogananda |
| `edited_works_of` | (new) Edited posthumous publications | Tara Mata → Yogananda |
| `collaborated_with` | (new) Worked together on SRF mission | Rajarsi Janakananda ↔ Daya Mata |

#### API extensions

```
GET /api/v1/people?person_type=monastic → Filter by person type
GET /api/v1/people?person_type=guru_lineage → Guru lineage only
GET /api/v1/people/lineage → Presidential succession
  Response: ordered array of people with service periods,
  structured for timeline rendering

GET /api/v1/people/[slug]
  Response now includes: person_type, honorific, is_living,
  relations with start_year/end_year/description
```

The `/api/v1/people/lineage` endpoint returns the presidential succession as an ordered list with service periods, suitable for rendering as a vertical timeline. It queries `person_relations` where `relation_type = 'succeeded_by'`, ordered by `display_order`.

#### Presentation patterns

**In Memoriam on person cards and detail pages:**

Person cards for figures with `death_year IS NOT NULL AND person_type IN ('monastic', 'guru_lineage')` display birth and passing years in a respectful format:

```
┌─────────────────────────────┐
│          ○ Daya Mata        │
│        SRF President        │
│        1914 – 2010          │
│                             │
│  "A life of selfless        │
│   service to God..."        │
│                             │
│        Read biography →     │
└─────────────────────────────┘
```

This is a *presentation pattern* — a tasteful rendering of existing data (`birth_year`, `death_year`) — not a separate feature or standalone page. The person detail page (`/people/[slug]`) renders the full biography with dates prominently but not morbidly.

**Presidential lineage as a navigable timeline on `/people`:**

The `/people` index gains a "Lineage of SRF Presidents" section rendered as a vertical timeline — a compact, ordered display showing succession with service dates and links to each president's person page. This uses the `succeeded_by` relations with `start_year`/`end_year` from `person_relations`.

```
┌──────────────────────────────────────────────┐
│                                              │
│  Lineage of SRF Presidents                   │
│                                              │
│  ● Paramahansa Yogananda     1920 – 1952     │
│  │ Founder and first president               │
│  │                                           │
│  ● Rajarsi Janakananda       1952 – 1955     │
│  │                                           │
│  ● Sri Daya Mata             1955 – 2010     │
│  │                                           │
│  ● Sri Mrinalini Mata        2011 – 2017     │
│  │                                           │
│  ● Brother Chidananda        2017 – present  │
│                                              │
└──────────────────────────────────────────────┘
```

**Knowledge graph lineage filter (STG-009):**

The `/explore` graph gains a "Lineage" filter mode (extends FTR-035 view modes). When active, it shows only person nodes connected by `guru_of`, `disciple_of`, `succeeded_by`, and `preceded_by` edges, rendered as a directed vertical layout rather than a force-directed graph. This provides an alternate visualization of both the spiritual lineage and the presidential succession without building a one-off component.

#### Editorial governance

- All monastic biographical content requires SRF editorial review before publication (`is_published` gate, same as FTR-074).
- Living monastics (`is_living = true`) carry heightened editorial sensitivity. Biographical detail, photographs, and role descriptions must be explicitly approved by SRF. No biographical content about living monastics is auto-generated or seeded without SRF input.
- Presidential succession dates and service periods are factual public record, but the editorial framing (the `description` on each relation, the biography text) requires SRF review.
- The honorific field follows SRF's own usage — the portal does not assign or interpret monastic titles.

### Rationale

- **Three distinct lineages, one schema.** The guru lineage (spiritual transmission), presidential succession (organizational stewardship), and broader monastic community serve different seeker questions but share the same entity model. `person_type` and temporal `person_relations` handle all three without separate tables.
- **Temporal relations are essential.** "Daya Mata was SRF president" is incomplete without "from 1955 to 2010." The current `person_relations` is snapshot-oriented; adding `start_year`/`end_year` makes it timeline-capable.
- **In Memoriam is a presentation pattern, not a feature.** The data already exists (`birth_year`, `death_year`). The ADR formalizes how the portal respectfully renders it rather than building a separate commemorative system.
- **The knowledge graph is the lineage visualization.** Rather than building a standalone timeline component, the lineage filter on `/explore` reuses the graph infrastructure. The `/people` page timeline is a lightweight, text-based complement for quick reference.
- **Cross-referencing is the unique value.** SRF.org can list presidents. Wikipedia can list presidents. Only this portal can connect each president to the teachings, places, and passages of their era — "During Daya Mata's presidency, these passages about spiritual leadership were among the most shared."
- **Living monastic sensitivity.** Explicit `is_living` flag and editorial governance acknowledge that biographical content about current monastics carries different responsibilities than historical figures.

### Consequences

- `people` table gains three columns: `person_type` (with CHECK constraint), `honorific`, `is_living`
- `person_relations` table gains four columns: `description`, `start_year`, `end_year`, `display_order`
- Five new `relation_type` values: `succeeded_by`, `preceded_by`, `mentored_by`, `edited_works_of`, `collaborated_with`
- New API endpoint: `GET /api/v1/people/lineage` (presidential succession)
- Existing `GET /api/v1/people` gains `?person_type=` filter
- `/people` index gains "Lineage of SRF Presidents" timeline section (STG-008)
- `/explore` gains "Lineage" graph filter mode (STG-009, extends FTR-035)
- Person cards render In Memoriam presentation for applicable figures (STG-008)
- STG-008 seed data expanded: presidential succession entries with service dates alongside existing spiritual figure seeds
- **Extends:** FTR-074, FTR-124, FTR-035
- **New stakeholder questions:** SRF editorial policy on living monastic biographical content; monastic content scope (content *by* vs. *about* monastics); preferred depth of presidential succession editorial framing
