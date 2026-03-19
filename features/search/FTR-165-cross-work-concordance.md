---
ftr: 165
title: "Cross-Work Teaching Concordance — Passage-Level Connections Across Books"
summary: "Four-dimensional passage connections detecting same teaching in different structural forms across books"
state: proposed
domain: search
governed-by: [PRI-01, PRI-03, PRI-12]
depends-on: [FTR-128, FTR-030, FTR-034, FTR-105]
---

# FTR-165: Cross-Work Teaching Concordance

## Rationale

**Target:** STG-007+ (after FTR-128 structural enrichment prototype validates)
**Dependencies:** FTR-128 structural enrichment (chapter/book metadata), multi-book corpus (STG-006), Opus batch access (Bedrock).

**The gap.** FTR-128 provides structural understanding at chapter, book, and author scale. FTR-030 (Related Teachings) provides search-time embedding similarity between passages. FTR-034 (Knowledge Graph) provides entity-based connections. But none of these capture the relationship that matters most for Yogananda's corpus: **same teaching, different form.**

Yogananda teaches the same truth through different structural forms across different works — a concept explained philosophically in one book, narratively in another, experientially in a third. A seeker who finds a philosophical passage on the immortality of the soul in *God Talks with Arjuna* should be able to reach Yogananda's personal narrative of the same truth in *Autobiography of a Yogi* and his practical affirmation of it in *Scientific Healing Affirmations*. Embedding similarity catches topical overlap. Cross-work concordance catches structural complementarity.

This is the passage-level counterpart to FTR-128's chapter resonances. Where chapter resonances identify "this chapter does the same structural work as that chapter," concordance identifies "this passage teaches the same thing as that passage, through a different form."

**Design constraint: invisible, corpus-derived, DELTA-compliant.** Concordance links are pre-computed at index time. They power navigation without any search-time AI and without any behavioral data. The passage the seeker is currently reading IS the signal — not the seeker's behavior, but the portal's understanding of the text. The corpus is the teacher; connections emerge from the text itself.

**"Same teaching, different form" detection does not exist as a named system** (Claude Deep Research, March 2026, Topic 4). Sentence-level paraphrase detection (SBERT) operates at too fine a granularity. Chapter-level structural alignment lacks purpose-built tools. The synoptic Gospel parallel tradition remains manually curated. This would be a novel contribution.

## Specification

### The Core Design: Multi-Dimensional Connections

**CRITICAL DESIGN INTENT — read this section before implementing.**

Every connection between two passages has up to four orthogonal dimensions. These are NOT four versions of the same thing. They are fundamentally different ways passages relate, each enabling a different seeker journey. The entire navigation experience depends on keeping these dimensions distinct. Collapsing them into a flat list of "relationship types" destroys the design.

#### Four Dimensions of Connection

**1. Structural dimension — how they relate pedagogically.**

The mechanism of the connection. One passage explains philosophically; the other narrates experientially. One introduces simply; the other deepens. This is the Western narratological lens.

Types: `parallel_teaching` (same truth, equivalent form), `progressive_deepening` (same concept at deeper level), `structural_complement` (same teaching through different structure), `experiential_counterpart` (conceptual teaching paired with first-person experience), `metaphor_echo` (same metaphor system for different teaching).

Seeker journey: **"Go deeper"** and **"See this differently."**

**2. Rasa dimension — how their aesthetic experiences relate.**

What the passages *feel like* to the reader. Not what emotions the text describes — what aesthetic experience it evokes. Two passages can share the same rasa despite being about completely different subjects. Chapter 14 (cosmic consciousness) and Chapter 43 (resurrection of Sri Yukteswar) both evoke adbhuta (wonder). A seeker moved by wonder in one can reach wonder in the other. No topic-based or structural-based system connects them.

Rasa is orthogonal to structure. Two passages can be structurally unrelated but share the same aesthetic quality. Two passages can be structurally complementary but evoke contrasting rasas — the same teaching entered through grief (karuna) in one passage and through peace (shanta) in another. The contrast IS the connection: same truth, different emotional doorway.

Values per passage: from FTR-128 (dominant_rasa field on structural_chapters). Relationship between passages: `same` (rasa resonance), `contrasting` (same teaching through different emotional doorway), `complementary` (rasas that enhance each other — wonder + peace, courage + devotion).

Seeker journey: **"Feel more of this"** (same rasa) and **"Feel this differently"** (contrasting rasa, shared dhvani).

**3. Dhvani dimension — how their unstated meanings relate.**

The hidden teaching beneath the surface narrative. When Yogananda tells the story of the Levitating Saint (Ch. 7), the surface is anecdote; the dhvani is a teaching about consciousness transcending material law. When he tells the story of the Tiger Swami (Ch. 8), the surface is a different anecdote; the dhvani is the same truth from a different angle.

Dhvani has a unique property that rasa and structure do not: **the hidden can become the stated.** Chapter 7's dhvani (consciousness transcends material law) is stated *directly* in God Talks with Arjuna. The unstated teaching in one passage is the explicit teaching in another. This bridges narrative and philosophy — story and direct teaching. A seeker who intuited something beneath the surface of a story can find it stated plainly. A seeker who read a philosophical statement can find it *lived* in a narrative. This hidden-to-surface bridge is the highest-value connection type for Yogananda's corpus because it mirrors his own pedagogical method: teaching through story what cannot be conveyed through proposition alone.

Values per passage: from FTR-128 (dhvani field on structural_chapters). Relationship between passages: `shared` (same hidden teaching beneath different surfaces), `deepening` (same dhvani at deeper understanding), `hidden_to_surface` (what is implicit in one is explicit in the other), `surface_to_hidden` (reverse direction).

Seeker journey: **"Explore this teaching"** (shared dhvani) and **"What is this story really about?"** (hidden-to-surface).

**4. Auchitya dimension — how their architectural roles relate.**

Why each passage is *where it is* in its respective book. Not a property of the passage in isolation — a property of its relationship to its context. Two chapters in different books can serve the same architectural function: both are the hinge where the book shifts from teaching to experience. Both are the opening that establishes the seeker's entry point. The content is completely different. The role is the same.

Auchitya connects passages not by what they say or how they feel, but by what structural work they do. "Show me the pivotal moments across all books." "How does Yogananda open each work?" "Where does each book shift register?" These are navigation paths that neither topic, feeling, nor hidden meaning can power.

Values per passage: from FTR-128 (auchitya field in structural_works.key_chapters). Relationship between passages: `parallel_function` (same architectural role in different works), `complementary_function` (together they complete a structural pattern).

Seeker journey: **"See the architecture"** — the rarest seeker journey, but the one that reveals Yogananda as a deliberate literary architect, not just a storyteller.

#### Orthogonality: One Connection, Multiple Dimensions

A single connection between two passages can carry all four dimensions simultaneously. A connection is not "a rasa connection" or "a dhvani connection" — it is a multi-dimensional relationship with up to four facets:

- These passages share **karuna** rasa (both evoke compassion)
- They share the **dhvani** "love transcends death" (same hidden teaching)
- They are **structural complements** (one is narrative, the other philosophical)
- They both serve as **architectural hinges** in their respective books

Or a connection might have only one salient dimension — two passages that share adbhuta (wonder) but have different dhvani, different structure, different roles. That's a rasa-primary connection.

**Each connection has a `primary_dimension`** — the dimension that is most notable or useful for navigation. Opus classifies this during analysis. The navigation layer uses primary_dimension to group connections for the seeker:

| Primary dimension | Seeker-facing language | What it means |
|-------------------|----------------------|---------------|
| `structural` | "Go deeper" / "See this differently" | Pedagogical relationship |
| `rasa` | "Feel more of this" / "Feel this differently" | Aesthetic resonance |
| `dhvani` | "Explore this teaching" / "What is this really about?" | Hidden meaning connection |
| `auchitya` | "See the architecture" | Structural role parallel |

The seeker never sees "rasa" or "dhvani" or "auchitya." They see natural navigation language. The 1,000-year-old analytical framework native to Yogananda's own tradition powers the experience invisibly.

### What This Enables (Seeker Experience)

A seeker reads AoY Chapter 26 — "The Science of Kriya Yoga." FTR-128 has classified this chapter: rasa is vira (heroic spiritual resolve); the dhvani is "divine effort is a collaboration between human will and grace"; its auchitya is architectural hinge — the shift from "stories of saints" to "the path of practice."

The portal, invisibly, knows all three dimensions. It offers:

- **"Go deeper"** — passages where the same dhvani appears at greater depth. God Talks with Arjuna's commentary on surrender and effort. Structural: progressive_deepening. Dhvani: hidden_to_surface.
- **"Feel more of this"** — passages sharing vira rasa. Chapter 12's fierce determination. Sri Daya Mata on spiritual will. Different topics, same quality of experience. Rasa: same.
- **"Explore this teaching"** — passages sharing the dhvani (effort as collaboration with grace). Including a story about gardening that carries the same hidden teaching. Dhvani: shared. No topic system would find this.
- **"Feel this differently"** — passages where the same dhvani appears through a different rasa. The grief passage in Chapter 11 teaching about divine collaboration through karuna rather than vira. Same truth, different emotional doorway. Dhvani: shared. Rasa: contrasting.

This is the world-class experience: the seeker navigates by feeling, by meaning, by depth, by structural complement — and the portal uses the corpus's own tradition to power that navigation, without ever showing the framework itself.

### Architecture: Approach B (Chapter-Pair Whole-Context)

**Preferred approach.** For each chapter pair across books, Opus reads both full chapters and identifies passage-level connections across all four dimensions.

- ~49 chapters × 24 other books = ~1,176 chapter pairs for 25 books
- Each call: both chapter texts (~3K–10K words each) + FTR-128 structural metadata for both chapters (rasa, dhvani, auchitya, structural type already computed)
- Opus sees full chapter context — richer than isolated passage pairs
- Opus has FTR-128 metadata as input — it doesn't rediscover rasa/dhvani per passage, it uses the understanding already computed to identify connections

Opus produces per chapter pair: all passage-level connections, each with four-dimensional classification, primary_dimension, description, and confidence.

**Why Approach B over Approach A (embedding pre-filter + pair validation):** Embedding similarity finds topical overlap. But dhvani connections (shared hidden meaning beneath different surfaces), rasa connections (shared feeling across different topics), and auchitya connections (shared structural role) are invisible to embeddings. Approach B discovers connections that Approach A's pre-filter would never surface. The cost is comparable (~$810 vs. ~$900 for 15K pairs); the connection quality is categorically richer.

### Storage

Multi-dimensional connections in the existing `chunk_relations` table:

```sql
-- Extends existing chunk_relations table
-- Existing types: translation, same_chapter, golden_thread
-- New: concordance connections with multi-dimensional metadata

-- chunk_relations already has: source_chunk_id, target_chunk_id, relation_type,
-- metadata JSONB, confidence FLOAT, enrichment_model TEXT

-- relation_type for concordance connections: 'concordance'
-- (primary_dimension and structural_type live in metadata, not in relation_type,
--  because a single connection carries multiple dimensions)

-- metadata schema for concordance connections:
-- {
--   primary_dimension: "dhvani",           -- rasa | dhvani | auchitya | structural
--   description: "Both passages teach love transcending death...",
--
--   structural: {
--     type: "experiential_counterpart",    -- parallel_teaching | progressive_deepening |
--                                          -- structural_complement | experiential_counterpart |
--                                          -- metaphor_echo | null
--     source_form: "narrative_exemplar",
--     target_form: "scriptural_commentary"
--   },
--
--   rasa: {
--     source: "karuna",                    -- from FTR-128
--     target: "shanta",                    -- from FTR-128
--     relationship: "contrasting"          -- same | contrasting | complementary | null
--   },
--
--   dhvani: {
--     shared: "love transcends bodily death",
--     relationship: "hidden_to_surface"    -- shared | deepening | hidden_to_surface |
--                                          -- surface_to_hidden | null
--   },
--
--   auchitya: {
--     shared_role: "architectural_hinge",  -- from FTR-128 key_chapters
--     relationship: "parallel_function"    -- parallel_function | complementary_function | null
--   }
-- }
```

### Cost Analysis

All costs are one-time at ingestion. Full corpus: ~25 books, ~15,000 chunks, ~1,200 cross-book chapter pairs.

#### Approach B: Chapter-Pair Whole-Context (Preferred)

| Model | Per call | ~1,200 chapter pairs | With caching | Bedrock batch (50% off) |
|-------|----------|---------------------|--------------|------------------------|
| **Opus** ($15/$75 MTok) | ~$0.68 | **~$810** | **~$550** | **~$275** |
| Sonnet ($3/$15 MTok) | ~$0.14 | ~$165 | ~$115 | ~$58 |

Breakdown per call: ~20K input tokens (two chapters + FTR-128 structural context) + ~5K output tokens (multi-dimensional connection JSON). Prompt caching: source book's chapter text cached across all pairings with that book.

**Delta between all-Opus and all-Sonnet: ~$217 at batch pricing.** One-time.

**Recommendation: All-Opus.** Multi-dimensional connection classification — simultaneously judging structural relationship, aesthetic resonance, hidden meaning, and architectural role — is the deepest interpretive task in the entire pipeline. The 17-point GPQA gap (Opus 91.3% vs. Sonnet 74.1%) compounds across 1,200 chapter pairs and four dimensions per connection. For ~$275 one-time, the world-class experience is Opus.

**Combined FTR-128 + FTR-165 (all-Opus, Bedrock batch):** Under $700 for the entire multi-scale enrichment + cross-work concordance for the full 25-book corpus.

#### Approach A: Embedding Pre-Filter + LLM Validation (Alternative)

Included for comparison. Not recommended — misses dhvani/rasa/auchitya connections invisible to embeddings.

| Model | 750 calls (15K pairs) | 1,500 calls (30K pairs) | With caching |
|-------|----------------------|------------------------|--------------|
| **Opus** | **~$900** | **~$1,800** | **$630–$1,260** |
| Sonnet | ~$180 | ~$360 | $126–$252 |

### Relationship to Existing Architecture

- **FTR-128 (Structural Enrichment):** Prerequisite. Provides rasa, dhvani, auchitya, structural type per chapter — the understanding that concordance consumes. Without FTR-128, concordance collapses to embedding similarity (FTR-030 already provides this). FTR-128 is understanding; FTR-165 is connection.
- **FTR-030 (Related Teachings):** Currently search-time embedding similarity (one dimension: topical). FTR-165 adds index-time pre-computed connections across four dimensions. FTR-030 consumes FTR-165 data.
- **FTR-034 (Knowledge Graph):** Entity-based connections. FTR-165 is teaching-based connections. Complementary. The entity "samadhi" connects passages via the graph; FTR-165 knows which samadhi passages explain it philosophically (structural), which evoke wonder (rasa), which carry the hidden teaching that practice transcends concept (dhvani).
- **FTR-029 (Autosuggestion):** Concordance data enriches suggestion with dimensioned connections.
- **FTR-140 (Wanderer's Path):** Cross-book passage discovery across all four dimensions. "Surprise the seeker" becomes "surprise the seeker with the same teaching through a feeling they haven't encountered."
- **FTR-060 (Staff Experience):** Editorial portal surfaces AI-detected multi-dimensional concordance for human curation. The librarian proposes; the editor curates.

### Validation

1. **Prototype during FTR-128 multi-book experiment.** AoY + *Where There Is Light* — run Approach B on chapter pairs between these two books. Evaluate per dimension: do rasa connections feel meaningful? Do dhvani connections surface hidden-meaning links that topic similarity misses? Do auchitya connections reveal structural parallels?
2. **Precision over recall.** False positives (spurious connections) are worse than false negatives. Set confidence threshold high per dimension; let editorial curation add what Opus missed.
3. **Dimension utility test.** For each of the four seeker journeys ("Feel more of this," "Explore this teaching," etc.), evaluate: does the dimension produce connections that feel like "curated library" or "AI noise"? A dimension that consistently produces noise is demoted from navigation.
4. **Editorial validation.** Surface top-50 connections per book pair, grouped by primary_dimension, to a monastic editor. Does the editor find each dimension's connections meaningful?

### Progressive Revelation Chains

A distinctive output: **progressive revelation chains** — ordered sequences of passages across the corpus where Yogananda introduces a concept simply, then deepens it, then presents it experientially. These chains are the highest-value navigation artifact because they embody Yogananda's actual pedagogical method made navigable.

Example chain for "the soul's immortality":
1. *Sayings of Paramahansa Yogananda* — one-sentence affirmation (introduction). Rasa: shanta.
2. *Where There Is Light* — paragraph-length teaching (development). Rasa: shanta.
3. *Autobiography of a Yogi* Ch. 43 — personal narrative of resurrection (experience). Rasa: adbhuta.
4. *God Talks with Arjuna* — full scriptural commentary on Gita 2:19–20 (philosophical depth). Rasa: shanta.

The chain carries a **rasa trajectory** alongside the progressive deepening — mostly shanta (peace), with an irruption of adbhuta (wonder) at the experiential node. This trajectory itself is navigation metadata: the seeker can follow the peaceful path (1→2→4) or include the wonder (1→2→3→4).

Chains are stored in `structural_works.progressive_revelation_chains` (FTR-128) at book level and as directed `progressive_deepening` edges with full dimensional metadata in `chunk_relations` at passage level.

**Re-evaluate At:** After FTR-128 prototype (multi-book experiment with AoY + *Where There Is Light*)
**Decision Required From:** Architecture (prototype results determine scheduling, approach selection, and dimension utility)
**Origin:** Discussion of cross-product passage-level analysis during FTR-128 research absorption (2026-03-17)

## Notes

- **Origin:** FTR-165, proposed during absorption of Claude Deep Research structural enrichment report.
- **Novel contribution:** "Same teaching, different form" detection does not exist as a named system. Multi-dimensional connection classification (structural + rasa + dhvani + auchitya) across a sacred text corpus has no precedent.
- **Critical design insight (2026-03-17):** Rasa, dhvani, and auchitya are NOT three versions of the same mechanism. They are orthogonal dimensions enabling different seeker journeys. Rasa connects by feeling ("feel more of this"). Dhvani connects by hidden meaning ("what is this really about?"). Auchitya connects by architectural role ("see the structure"). Collapsing them into a flat list of relationship types destroys the navigation design. Each dimension must be classified independently per connection. A single connection can carry all four dimensions simultaneously. See § Four Dimensions of Connection for the full design rationale — this section is the load-bearing architectural intent that future implementation sessions must preserve.
- **Cost finding:** Under $700 total (FTR-128 + FTR-165) for the entire 25-book corpus at Bedrock batch pricing. The delta between all-Opus and all-Sonnet for concordance alone is ~$217 one-time.
- **Approach B insight:** Chapter-pair whole-context analysis is comparable in cost to embedding pre-filter but categorically richer — it discovers dhvani/rasa/auchitya connections invisible to embeddings.
