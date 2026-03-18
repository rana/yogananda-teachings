---
ftr: 128
title: "Structural Enrichment Tier — Whole-Context AI Understanding for Navigation"
summary: "Four-phase all-Opus pipeline producing chapter, book, author, and cross-work structural metadata for navigation"
state: proposed
domain: search
governed-by: [PRI-01, PRI-03, PRI-12]
depends-on: [FTR-026, FTR-034, FTR-105]
---

# FTR-128: Structural Enrichment Tier

## Rationale

**Target:** Milestone 3b (alongside graph intelligence activation)
**Dependencies:** Assembled book text (available for AoY en/es). Opus batch access (Bedrock). Chunk enrichment pipeline operational (Milestone 1c).

**The gap.** The enrichment pipeline (FTR-026) analyzes chunks independently — each ~500-word passage is enriched in isolation. The knowledge graph (FTR-034) builds bottom-up from these chunk-level entities and relationships. But structural understanding at chapter, book, and author scale is absent. No artifact captures what Opus sees when it reads an entire chapter as a coherent arc, an entire book as an argument structure, or an author's complete output as a distinctive voice.

This missing tier is the difference between a library that catalogs individual pages and one that understands how books work.

**Design constraint: invisible but load-bearing.** Structural enrichment artifacts are internal metadata powering navigation, presentation, and aggregation. They are never displayed as AI-authored content. Seekers experience curated organization; the curation logic is invisible. This parallels the existing chunk-level enrichment pattern — Opus assigns depth levels, topic tags, and entity labels that power search ranking without seekers seeing the classification. The librarian is invisible; the library is the experience.

This constraint resolves the PRI-01 boundary cleanly: structural readings are navigation metadata (same category as topic tags and depth levels), not generated content. No stakeholder ambiguity.

**What this enables (all invisible to seekers):**
- **Chapter resonance navigation** — "Chapters with similar arc" powered by structural similarity, not just topic overlap
- **Richer Wanderer's Path** (FTR-140) — emotional trajectory and structural type inform passage selection beyond topic and depth
- **Journey mode** — "Walk through how Yogananda builds the case for [concept]" ordered by the book's argument architecture, not chapter sequence
- **Author-informed grouping** — passages clustered by voice characteristics (metaphor patterns, emotional register), not just `WHERE author_id = ?`
- **Semantic positioning** (FTR-129) — chapter coordinates on meaningful axes for spatial navigation
- **Cross-work teaching concordance** (FTR-165) — passage-level connections across books powered by structural metadata, not just embedding similarity

## Specification

### Four-Phase Enrichment Pipeline

All phases use Claude Opus 4.6 via AWS Bedrock. The 17-point GPQA Diamond gap between Opus (91.3%) and Sonnet (74.1%) on PhD-level reasoning directly measures the capability that matters for interpretive analysis of sacred text. Yogananda's chapters are simultaneously humorous, devotional, philosophical, and pedagogically precise — every phase requires the deepest available interpretive capacity. The cost delta between all-Opus and tiered models is ~$1,500–2,000 for the entire corpus (one-time). For a world-class portal on profound reading material, lean deep.

**Phase 1: Chapter Perspectives (context-isolated).**

Opus reads each chapter independently — no book-level context. This produces the chapter's own structural reading, unbiased by whole-book framing. For a book like AoY: ~49 Opus calls.

Produces per chapter: thematic arc, emotional trajectory (VAD coordinate arrays + named contemplative registers), turning points, metaphor patterns, surface structure (syuzhet), deep structure (fabula), dominant rasa with determinants, dhvani (suggested meaning beneath surface), semantic coordinates (FTR-129).

Context isolation matters: Chapter 7 (The Levitating Saint) read in isolation may surface structural features that would be suppressed if Opus already knew the book classifies it as "evidence chapter in a progressive-revelation structure." Independent reading first; contextualized reading second.

**Phase 2: Book Perspective (whole-context).**

Opus reads the full book in a single context window. For AoY (~164K words, ~220K tokens): safe for single-pass with room for extended thinking. For major commentaries (>400K words): two-pass with overlapping chapter groups, then synthesis.

Input: full book text + all Phase 1 chapter perspectives as structured JSON.
Produces: argument architecture, movement (emotional/intellectual trajectory), structural pattern, key chapters by role in architecture (with auchitya — fitness), distinctive contribution, chapter resonances within the work, progressive revelation chains.

**Two-pass defensive architecture.** Even for books that fit in one context window, run two passes as defense against "lost in the middle" degradation (Liu et al. TACL 2024; Du et al. EMNLP 2025 Findings — context length alone degrades performance 13.9–85%). Pass 1: whole-book for architecture and cross-chapter patterns. Pass 2: chapters individually or in small groups for detail verification. The recitation technique (Du et al.): instruct Opus to quote relevant passages before making interpretive claims. Place critical analytical instructions at both start AND end of the prompt.

**Reconciliation step.** After Phase 2, compare Phase 1 (independent chapter readings) with the book-contextualized view. Where they diverge, store both readings. Divergence on multi-layered chapters (multiple valid structural readings) is a feature, not a failure — perspectivist storage.

**Phase 3: Author Voice Profile.**

Opus reads across all works by an author. Produces: voice characteristics, metaphor preferences, emotional range, characteristic pedagogical moves, distinctive emphasis, contrast dimensions with other authors. ~1 Opus call per author.

**Phase 4: Back-Propagation.**

Book-level and chapter-level insights flow back down to update chunk-level metadata. This is the novel step — top-down metadata back-propagation does not exist as a named pattern (Claude Deep Research, March 2026).

For each chunk, Opus receives: the chunk text, its chapter's structural reading, and the book's architecture. Updates: `passage_role` (recalibrated — a chunk classified as "exposition" in isolation may be the chapter's turning point), `chapter_arc_position` (where in the chapter's emotional trajectory), `book_architecture_role` (how this passage serves the book's argument), `inherited_rasa`, `inherited_dhvani`.

This makes chunk-level metadata structurally aware without re-running the chunk enrichment pipeline. Search quality improves because passage metadata now carries structural context.

Use Anthropic's prompt caching ($1.875/MTok cached vs. $15/MTok uncached) — cache the book/chapter context and vary only the chunk instruction. Dramatically reduces Phase 4 costs.

### Cross-Structural Artifact: Chapter Resonances

Structural parallels across chapters in different works — same arc pattern, same thematic movement, same emotional trajectory deployed for a different teaching. Generated during Phase 2 (book perspective) when multiple books exist. These are "this chapter does the same structural work as that chapter" — a relationship invisible to passage-level similarity but load-bearing for navigation.

### Storage Architecture

Enrichment tables parallel to the knowledge graph, not graph nodes. The graph represents *what exists* (entities, passages, relationships). Structural enrichment represents *how to navigate* (arcs, trajectories, voices). Parallel storage, unified query — the navigation layer composes across both at query time without either system needing to understand the other's internals.

```sql
-- Chapter-level structural understanding
CREATE TABLE structural_chapters (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  work_id UUID NOT NULL REFERENCES works(id),
  language TEXT NOT NULL,
  thematic_arc TEXT NOT NULL,            -- Opus's structural reading of the chapter
  emotional_trajectory JSONB NOT NULL,   -- VAD coordinate arrays: [{v, a, d, register, chunk_range}]
  turning_points JSONB NOT NULL,         -- [{chunk_id, description}]
  metaphor_patterns TEXT[],
  surface_structure TEXT NOT NULL,       -- syuzhet: how the chapter presents (autobiographical_anecdote, frame_narrative, scriptural_exegesis, dialogic_instruction, etc.)
  deep_structure TEXT NOT NULL,          -- fabula: underlying pedagogical logic (progressive_revelation, dialectical_synthesis, spiral, linear_build, etc.)
  dominant_rasa TEXT,                    -- Resolution rasa: final aesthetic state of chapter arc (shanta, karuna, vira, adbhuta, dasya, sakhya, vatsalya, madhurya, etc.)
  rasa_vector JSONB,                    -- Probability distribution: {shanta: 0.7, karuna: 0.4, vira: 0.2} — all values > 0.3 threshold
  rasa_determinants JSONB,              -- {vibhava, anubhava, vyabhicaribhava} — what evokes the rasa
  dhvani TEXT,                          -- suggested meaning beneath the surface narrative (vyangya)
  dhvani_depth_tier TEXT,               -- informational | practical_moral | transcendent — Contemplative Reading Depth
  textual_register TEXT,                -- described state: cosmic_noetic | numinous_awe | detachment_equanimity | devotional_longing | dark_night_struggle
  contemplative_signature JSONB,        -- evoked impact probability vector: {consoling: 0.8, catalytic: 0.3, bottomless: 0.5} — values > 0.3
  structural_role TEXT,                 -- six-tag auchitya: foundation | illustration | philosophical_argument | experiential_description | practical_instruction | resolution
  semantic_coordinates JSONB,            -- for FTR-129 cartography
  alternative_readings JSONB,            -- perspectivist: [{reading, confidence, source}] when valid alternatives exist
  enrichment_model TEXT NOT NULL,        -- model ID per FTR-012
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Book-level structural understanding
CREATE TABLE structural_works (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  work_id UUID NOT NULL REFERENCES works(id),
  language TEXT NOT NULL,
  architecture TEXT NOT NULL,            -- how the book builds its argument
  movement TEXT NOT NULL,                -- emotional/intellectual trajectory
  structural_pattern TEXT NOT NULL,      -- spiral, progressive_revelation, biographical_arc, etc.
  key_chapters JSONB NOT NULL,           -- [{chapter_id, role_in_architecture, auchitya}] — auchitya: why this chapter is here (fitness in the architecture)
  distinctive_contribution TEXT NOT NULL, -- what this book does that no other does
  progressive_revelation_chains JSONB,   -- [{concept, introduction_chapter, deepening_chapters}]
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Author voice profiles
CREATE TABLE structural_authors (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  author_id UUID NOT NULL REFERENCES persons(id),
  voice_characteristics TEXT NOT NULL,
  metaphor_preferences TEXT[],
  emotional_range TEXT NOT NULL,
  characteristic_moves TEXT[],           -- pedagogical patterns
  distinctive_emphasis TEXT NOT NULL,
  contrast_dimensions JSONB,             -- [{author_id, dimension, description}]
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cross-work structural parallels
CREATE TABLE chapter_resonances (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  source_chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  target_chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  resonance_type TEXT NOT NULL,          -- structural_parallel, thematic_echo, progressive_deepening
  description TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Back-propagated structural context on chunks
-- (extends existing chunk metadata, not a new table — shown here for clarity)
-- ALTER TABLE text_chunks ADD COLUMN structural_context JSONB;
-- structural_context: {chapter_arc_position, book_architecture_role, inherited_rasa, inherited_dhvani, passage_role_recalibrated}
```

### Cost Model (All-Opus)

One-time per book at ingestion. All phases use Opus 4.6 via Bedrock.

**Per book (AoY-scale, ~49 chapters, ~164K words):**

| Phase | Calls | Input tokens | Output tokens | Cost |
|-------|-------|-------------|---------------|------|
| 1: Chapter perspectives | ~49 | ~5K each | ~2K each | ~$4.50 + $7.35 = ~$12 |
| 2: Book perspective (2-pass) | 2 | ~220K + ~50K | ~10K each | ~$4.05 + $1.50 = ~$6 |
| 2b: Reconciliation | 1 | ~100K | ~5K | ~$1.50 + $0.38 = ~$2 |
| 4: Back-propagation | ~49 | ~3K each (cached) | ~500 each | ~$0.28 + $1.84 = ~$2 |
| **Per book total** | | | | **~$22** |

Author voice profiles: ~1 call per author, ~$3 each.

**Full corpus (~25 books, ~5 authors):**

| Component | Cost |
|-----------|------|
| 25 books × ~$22 | ~$550 |
| 5 author profiles × ~$3 | ~$15 |
| Cross-book chapter resonances (~25 calls) | ~$75 |
| Validation passes (see below) | ~$200 |
| **Total** | **~$840** |

With prompt caching (book text cached across chapter calls within same book): **~$600**.

At Bedrock batch pricing (50% discount for async): **~$300–420**.

This is the cost of a world-class invisible library. One-time. For comparison, the existing chunk-level enrichment pipeline (FTR-026) cost ~$50 for the current corpus.

### Relationship to Existing Proposals

- **FTR-165 (Cross-Work Teaching Concordance):** Passage-level cross-book connections. Depends on FTR-128 structural metadata to distinguish "about the same topic" from "teaches the same thing differently." FTR-128 is the prerequisite; FTR-165 is the consumer.
- **FTR-127 (Passage Depth Signatures):** Chunk-level contemplative quality classification. Structural enrichment operates at chapter/book/author scale. Complementary, not overlapping. Chapter perspectives may calibrate depth signature assignment.
- **FTR-140 (Wanderer's Path):** Consumes structural enrichment to weight passage selection — emotional trajectory and book architecture make "surprise the seeker" richer than topic + depth alone.
- **FTR-126 (Word-Level Graph Navigation):** Vocabulary-level graph traversal. Structural enrichment provides the larger-scale context that vocabulary navigation operates within.
- **FTR-034 (Graph Intelligence):** Graph is bottom-up from chunks. Structural enrichment is top-down from whole works. They meet in the middle — graph edges connect entities, structural artifacts explain how those connections serve the book's architecture. Parallel storage, unified query.
- **FTR-026 (Unified Enrichment):** The `passage_role` field is the breadcrumb — each chunk self-reports its rhetorical function. Phase 4 back-propagation recalibrates these roles with chapter-level context.
- **FTR-030 (Related Teachings):** Currently search-time embedding similarity. FTR-128 enrichment + FTR-165 concordance adds an index-time pre-computed layer of structurally-informed connections.

### Indian Literary Theory Integration

Gemini Deep Research (March 2026) surfaced computational precedents for applying Indian literary theory to text analysis. Claude Deep Research (March 2026) confirmed: rasa classification has been attempted at 66–87% accuracy using classical ML (SVM, Naïve Bayes) on Indian-language poetry (Saini et al., Pune). But **dhvani has never been computationalized** and **auchitya has never been computationalized**. No transformer or LLM-based rasa classification exists. No rasa-based navigation or recommendation system exists anywhere. This project would be the first production system applying Indian literary theory to text navigation.

Key citation: Sandhan et al. 2025 at the World Sanskrit Conference (ACL Anthology) — computational linguistics applied to the Sikshastaka for rasa, dhvani, and riti analysis. PERC corpus (350 English poems by Indian poets, tagged with 9 Navarasa) is the only English-language rasa-annotated dataset.

Three frameworks from Indian literary theory map directly onto structural enrichment, providing categories native to Yogananda's own tradition:

**Rasa** (aesthetic essence). Not what emotions the text describes, but what aesthetic experience it evokes in the reader. The portal adopts a **Nested Aesthetic Taxonomy** merging the classical Navarasa with Rupa Goswami's Bhakti rasa extensions (16th century, *Bhaktirasamrtasindhu*). The classical nine rasas alone lack vocabulary for devotion, divine longing, spiritual surrender, and union — states that saturate Yogananda's corpus.

The taxonomy has two tiers:

| Tier | Rasa | Portal Application |
|------|------|-------------------|
| **Foundational** | *Shanta* (peace/serenity) | Deep stillness, breathless states, philosophical calm |
| | *Adbhuta* (wonder/awe) | Cosmic consciousness, miracles, mystical visions |
| | *Vira* (heroic resolve) | Spiritual determination, yogic discipline, overcoming obstacles |
| | *Karuna* (compassion/grief) | Physical suffering, illusion of death, empathetic consolation |
| **Devotional (Bhakti)** | *Dasya* (reverence/servitude) | Absolute surrender, prayerful submission, guru-disciple devotion |
| | *Sakhya* (intimate companionship) | Dialogues with the Divine as close friend, removing hierarchical distance |
| | *Vatsalya* (parental/child) | Appeals to the Divine Mother for comfort, viewing self as divine child |
| | *Madhurya* (divine love/bliss) | Ecstatic poetry, transcendent bliss (ananda), absolute mystical union |

The remaining classical rasas (*shringara*, *hasya*, *raudra*, *bhayanaka*, *bibhatsa*) are retained in the schema but are secondary for this corpus — they appear in anecdotes and narrative passages but are not the dominant aesthetic registers of sacred teaching text.

**Resolution Rasa.** At chapter level, the dominant rasa is not an average of passage-level rasas — it is the "Resolution Rasa," the final aesthetic state achieved at the end of the narrative arc. This distinction matters for transition navigation (FTR-162): a chapter that traverses grief (*karuna*) and arrives at peace (*shanta*) has a resolution rasa of *shanta*.

**Bhakti rasa justification.** Madhusudana Sarasvati's *Bhaktirasayana* (16th century) integrates Advaita Vedanta with devotional sentiment — the exact synthesis found throughout Yogananda's scriptural commentaries. The guru-disciple dynamic (Dasya), Divine Mother appeals (Vatsalya), and ecstatic union descriptions (Madhurya) are structurally distinct devotional states that a 9-rasa taxonomy collapses into undifferentiated "shanta."

A seeker navigating toward consolation reaches karuna chapters; one seeking inspiration reaches vira chapters; one seeking stillness reaches shanta chapters; one seeking the quality of absolute devotion reaches madhurya passages. Rasa is orthogonal to emotional trajectory — trajectory describes what the text moves through; rasa describes what it does to the reader.

**Dhvani** (suggestion/resonance). The unstated teaching beneath the surface narrative. When Yogananda narrates the Levitating Saint (Ch. 7), the surface is anecdote; the dhvani is a teaching about the relationship between material law and divine consciousness. Dhvani extraction (vacyartha to vyangyartha) produces "the story is about X; the teaching beneath the story is about Y." This is the structural insight most useful for navigation — it's what makes "chapters with similar teaching" different from "chapters about similar topics."

Dhvani maps to a **Contemplative Reading Depth** classification using the three classical layers of meaning, with a cross-tradition parallel to the Christian Four Senses of Scripture (validated computationally by Trepczynski 2023 via BIG-Bench):

| Depth Tier | Hermeneutic Layer (Hindu / Christian) | Navigation Utility |
|------------|---------------------------------------|-------------------|
| **Tier 1: Informational** | *Abhidha* / Literal | Meaning entirely on the surface. Factual queries: dates, places, people. |
| **Tier 2: Practical / Moral** | *Lakshana* / Moral & Allegorical | Narrative or metaphor indicating spiritual disciplines, universal laws, ethics. |
| **Tier 3: Transcendent / Bottomless** | *Vyanjana* / Anagogical | Language pointing toward ineffable mystical truths, soul immortality, non-dual reality. Rewards endless return. |

Tier 3 passages automatically receive the "Bottomless" depth signature (FTR-127). The chain-of-thought detection pipeline: (1) Opus identifies the literal meaning, (2) asks whether the text uses narrative as vehicle for a practical teaching (Tier 2), (3) asks whether the practical teaching itself points toward an ineffable truth that transcends the teaching (Tier 3). Sequential prompting prevents hallucinating allegories in mundane paragraphs — a failure mode where lesser models "find hidden meaning" because the prompt suggested it.

**Auchitya** (propriety/fitness). Why is this chapter *here*? Not what it contains, but what structural work it does in the book's architecture. Applied as a field in `key_chapters` JSONB: each chapter's role includes its auchitya — its fitness for its position in the book's argument.

Kshemendra's *Auchityavicharacharcha* defines 27 categories of structural fitness. Most are micro-linguistic (gender, prefixes, case-endings) and irrelevant to English prose navigation. Six macro-structural categories map directly to progressive revelation in Yogananda's prose, forming the **Six-Tag Structural Role Taxonomy** for passage-level classification:

| Auchitya Category | Portal Tag | Role in Yogananda's Text |
|-------------------|-----------|--------------------------|
| *Prabandhartha* (Whole Meaning) | `foundation` | Establishes thesis, historical setting, or conceptual context |
| *Svabhava* (Nature/Character) | `illustration` | Autobiographical event, parable, or story illustrating the principle |
| *Tattva* (Reality/Truth) | `philosophical_argument` | Dense metaphysical explanation (e.g., vibratory mechanics of karma) |
| *Avastha* (State/Condition) | `experiential_description` | Phenomenological account of the spiritual truth (e.g., sensory experience of samadhi) |
| *Vichara* (Thought/Reflection) | `practical_instruction` | How to apply the truth — yogic methodologies, mental disciplines |
| *Saarasangraha* (Summary) | `resolution` | Concluding synthesis or benediction cementing the text's ultimate rasa |

This taxonomy operationalizes the `passage_role` field already in the enrichment schema. It enables non-topical queries: "Show me *experiential descriptions* of cosmic consciousness across all books" filters out philosophical arguments and introductory premises. It also maps progressive revelation chains: a concept introduced as `foundation`, illustrated via `illustration`, deepened through `philosophical_argument`, and resolved into `practical_instruction`.

**Expansion candidates (evaluate during prototype).** Claude Deep Research (March 2026) recommends ~8 passage-function values, suggesting two additions: **devotional_invocation** (prayers, direct addresses to God/Divine Mother — high frequency in Yogananda's prose, structurally distinct from philosophical argument or experiential description) and **consolation** (passages explicitly meeting suffering — distinct from resolution's synthesizing function). Evaluate during AoY prototype: if annotators consistently want these categories and inter-annotator agreement holds, expand to 8 tags.

These categories are used alongside, not instead of, Western narratological categories (structural type, turning points, argument architecture). The bipartite structural taxonomy (surface_structure + deep_structure) is drawn from computational narratology (fabula/syuzhet distinction). Indian and Western frameworks operate on different dimensions and their tension produces richer navigation metadata than either alone.

### Cross-Language Strategy

Deep structural properties (argument architecture, thematic arcs, turning points) show high cross-lingual stability per multilingual digital humanities research (Iruskieta et al. 2015 for English/Spanish/Basque; Cao et al. 2018–2020 for Spanish/Chinese). Rybicki (2012): when Burrows' Delta is applied to translations, "Delta usually fails to identify the translator and identifies the author of the original instead" — the original author's structural signal survives translation.

The strategy:

1. **Base analysis on the English master.** Run the full four-phase Opus enrichment on the English text.
2. **Map to translations.** Structural metadata (chapter arcs, rasa classifications, dhvani, structural types) is applied to translated editions via chapter-level alignment. No redundant Opus calls per language.
3. **Voice profile exception.** Author voice profiles are language-specific — Yogananda's translated voice is not "his voice." Voice profiles are disabled for translations or independently generated per language if the translation has distinctive literary quality worth characterizing.

This prevents cost multiplication while preserving structural accuracy.

### Validation Methodology

Structural enrichment produces interpretive outputs — no ground truth exists for "the thematic arc of Chapter 15." No gold-standard dataset exists for chapter-level structural analysis of literary or sacred texts (Claude Deep Research, Topic 9).

**Critical correction: "No Free Labels" (arXiv:2503.05061, 2025) demonstrated that LLM judges struggle to grade models when the judge itself cannot answer the question.** The original design (Sonnet validates Opus) carries significant risk for interpretive outputs. Updated approach:

1. **Generation.** Opus produces the structural reading (Phase 1–3).
2. **Independent validation (Opus-as-judge, context-isolated).** A separate Opus call receives the original text and the generated reading. The validator never sees the generator's reasoning — only its output. Evaluates: textual grounding (does the text support this?), internal coherence, interpretive plausibility, terminological precision, alternative readings.
3. **Perspectivist storage.** When valid alternative readings exist, store both in JSONB with confidence weights. Multiple valid interpretations are a feature of multi-layered texts, not a failure. Inter-annotator agreement for interpretive literary analysis: kappa = 0.40–0.60 is acceptable (Artstein & Poesio 2008; arXiv:2601.18061 January 2026). For **contemplative text specifically**, expect the lower end: κ = 0.25–0.45 (spiritual prose carries greater ambiguity than secular literary text). Classifier targets: **macro-F1 ≥ 0.45** full contemplative taxonomy, **F1 ≥ 0.60** core high-frequency states (devotion, peace, awe, teaching).
4. **Downstream utility test.** The ultimate validation: does the metadata produce navigation that feels coherent and illuminating? Prototype with AoY — generate all 49 chapter perspectives + 1 book perspective, then evaluate: Can they power "chapters like this" recommendations? Does the structural reading distinguish chapters in ways topic tags don't? Does navigation feel like "curated library" rather than "AI commentary"?

For the full corpus: Opus validates 30% of chapters (stratified by structural type); regeneration consistency check on 10% of chapters (same input, compare outputs for stability). Estimated validation cost: ~$200 for 25 books.

### Prompt Design Notes

To prevent "doctrinal flattening" (AI models trained on secular corpora imposing historic-critical methodologies onto sacred texts — named concept, ResearchGate ref 39 in Gemini report):

- Anchor all prompts with a corpus-specific glossary of Sanskrit technical terms. Never allow Opus to conflate "savikalpa samadhi" with "nirvikalpa samadhi" or substitute English glosses like "trance."
- Use codebook-driven extraction for voice profiles and rasa classification — structured JSON against explicit categories, not open-ended prose descriptions. Unconstrained LLM metaphor extraction produces 15-25% conceptually irrelevant interpretations (Fuoli et al. 2025).
- Add "Contemplative Experience" as a distinct structural/epistemological category in the prompt — first-person descriptions of meditative states should not be classified as fiction, hallucination, or metaphor.
- For rasa extraction, prompt Opus to identify specific vibhava (what stimulates the aesthetic experience), anubhava (how it manifests), and vyabhicaribhava (transitory states that support it). This grounds the classification in textual evidence.
- **Recitation technique** (Du et al. EMNLP 2025): instruct Opus to quote relevant passages before making interpretive claims. Grounds structural readings in textual evidence rather than pattern-matching.
- **Instruction placement:** Place critical analytical instructions at both start AND end of the prompt. Mitigates attention degradation on long inputs.
- **Multi-persona prompting.** For rasa and contemplative classification, do not prompt Opus for "the definitive" classification. Execute parallel Opus calls from distinct vantage points, then aggregate:
  - *Prompt A (The Structuralist):* "Read as an expert in classical Indian literary theory. Identify the *Auchitya* (structural role) and dominant rasa..."
  - *Prompt B (The Contemplative Scientist):* "Read as a contemplative neuroscience researcher. Identify described cognitive and affective states..."
  - *Prompt C (The Seeker):* "Read as a suffering individual seeking solace. What emotional state does this passage directly evoke?"
  Aggregation: Where all three perspectives agree, high confidence. Where they diverge, store as perspectivist alternatives (the multi-persona disagreement IS the interesting data — it reveals multi-register text).
- **Probability vector storage.** Store rasa and contemplative classifications as soft-max probability distributions, not single labels. If Opus returns `{karuna: 0.7, shanta: 0.4, vira: 0.2}`, store all values above a baseline confidence threshold (>0.3). This handles multi-register simultaneity natively and honors the reality that the most powerful contemplative passages exist in liminal spaces between defined categories. Database column type: JSONB probability vectors.

### Prototype Experiments

The AoY prototype validates the core architecture. Additionally, three experiments address open design questions:

**Experiment 1: Perceptual field priming.** Run 5 chapters through three conditions in context-isolated Opus calls:
- **Bare:** Chapter text + extraction schema only
- **Theory-primed:** Chapter text + 2–3 pages of Indian literary theory (rasa/dhvani/auchitya) definitions + extraction schema
- **Cross-work-primed:** Chapter text + parallel passages from other works on the same theme + extraction schema

Evaluate: Do primed readings surface structural features that bare readings miss? Or do they introduce confirmation artifacts (finding rasas that aren't meaningfully present)? Is the difference meaningful for navigation, or merely different? Cost: ~$100–150 (three Opus calls per chapter, five chapters).

**Experiment 2: Post-enrichment re-embedding.** After structural enrichment, re-embed chunks with structural context prepended (Anthropic's Contextual Retrieval pattern — 49–67% retrieval failure reduction). Test against the golden set (FTR-037): does post-enrichment embedding measurably improve search recall? If yes, it's a free search quality upgrade for pure hybrid search. Cost: ~$5 (Voyage re-embedding for 1,568 English chunks).

**Experiment 3: Multi-book prototype scope.** Include a second book alongside AoY to test cross-work features. Candidate: *Where There Is Light* (short, ~200 pages, dense wisdom passages, structurally different from AoY — aphoristic rather than narrative). Tests: chapter resonances across works, cross-book progressive revelation chains, FTR-165 concordance feasibility. Single-book prototype cannot validate the cross-work dimension.

**Re-evaluate At:** After prototype validation (can run anytime — assembled text available now)
**Decision Required From:** Architecture (prototype results determine scheduling)
**Origin:** Graph navigation exploration — invisible-librarian enrichment pattern at chapter/book/author scale (2026-02-28)

## Notes

- **Origin:** FTR-128
- **Research input (Gemini):** Gemini Deep Research report (March 2026) — 12 topics, 94 citations. Analysis in `docs/reference/gemini-deep-research-structural-enrichment-report.md`. Key design-altering finding: Indian literary theory (rasa, dhvani, auchitya) provides categories native to Yogananda's tradition for exactly the structural understanding this FTR proposes. Schema and validation approach updated accordingly.
- **Research input (Claude):** Claude Deep Research report (March 2026) — 12 topics. Analysis in `docs/reference/claude-deep-research-structural-enrichment-report.md`. Key findings: (1) "No Free Labels" correction — Sonnet-as-judge carries significant risk for interpretive outputs, use Opus-as-judge with context isolation; (2) top-down back-propagation is genuinely novel (no named pattern exists); (3) dhvani and auchitya have never been computationalized — this project would be the first; (4) rasa classification exists only at 66–87% via classical ML, no LLM-based system exists; (5) contemplative emotion taxonomy gap — no computational vocabulary exists for sacred text emotional registers; (6) 17-point GPQA gap justifies Opus for all interpretive phases; (7) "lost in the middle" mitigations — recitation technique, two-pass architecture.
- **Research input (Contemplative Taxonomy):** Gemini Deep Research report (March 2026) — 6 topics, 57 citations. Analysis in `docs/reference/deep-research-report-contemplative-emotion-taxonomy-2026.md`. Key design-altering findings: (1) Bhakti rasa extension — Rupa Goswami's 5 devotional rasas (Dasya, Sakhya, Vatsalya, Madhurya + Shanta) provide granularity the Navarasa lacks for devotional corpus; (2) Six-tag structural role taxonomy filtered from Kshemendra's 27 auchitya categories operationalizes `passage_role`; (3) Contemplative Reading Depth tiers (Abhidha/Lakshana/Vyanjana mapped to Informational/Practical/Transcendent) bridges FTR-127 depth signatures with hermeneutic tradition; (4) Dual-layer taxonomy — described emotion (textual register) vs. evoked emotion (contemplative signature) are independent classification axes; (5) Multi-persona prompting — parallel Opus calls from Structuralist/Neuroscientist/Seeker perspectives with aggregation; (6) Probability vector storage for fuzzy multi-register classification; (7) Critical literature disambiguation — "rasa classification" papers are mostly Rasa NLU chatbot or musical raga, not aesthetic theory; (8) Bifurcated system-facing/user-facing architecture — Sanskrit backend labels, culturally legible frontend terms.
- **Research input (Claude Contemplative Taxonomy):** Claude Deep Research report (March 2026) — 6 topics. Analysis in `docs/reference/claude-deep-research-contemplative-emotion-taxonomy-report.md`. Key absorptions: (1) Realistic κ = 0.25–0.45 for contemplative text annotation (lower than generic literary analysis) with concrete F1 targets; (2) Two structural role expansion candidates: devotional_invocation and consolation (evaluate during prototype); (3) GoEmotions — the dominant NLP taxonomy — explicitly filtered religion, confirming the custom taxonomy is necessary not optional; (4) Persona prompting empirical evidence: Hu & Collier ACL 2024 (small but significant gains), Kim et al. +9.98% accuracy with dual-persona, Atil et al. January 2026 (SVM meta-ensembling outperforms single persona) — validates the multi-persona pattern in § Prompt Design Notes; (5) "Beyond classification" marker for passages irreducible to categories (PRI-03 alignment).
- **Design decisions (March 2026):** All-Opus enrichment (quality over cost optimization for profound reading material). Four-phase pipeline with back-propagation. Context-isolated multi-agent pattern (independent chapter readings before book-contextualized synthesis). Opus-as-judge validation. Multi-book prototype scope. Nested Aesthetic Taxonomy (Navarasa + Bhakti). Six-tag structural role taxonomy. Dual-layer contemplative classification (described + evoked). Probability vector storage for rasa and contemplative signatures.
- **Dependent FTR:** FTR-165 (Cross-Work Teaching Concordance) — passage-level cross-book connections powered by structural metadata.
