# Structural Enrichment Architecture: Whole-Context AI Understanding of Sacred Texts

> Gemini 2.5 Pro Deep Research report, March 2026. Prompt preserved in `docs/reference/gemini-deep-research-prompt-structural-enrichment.md`.

> **Note:** The raw Gemini report (12 topics, 94 citations) was provided as inline document context. The source document `AI for Sacred Text Structural Enrichment.md` contains the full report text with all citations. Key findings per topic are summarized in the analysis below.

---

## Report Summary by Topic

**Topic 1 — Computational Narratology.** Distinguishes fabula (deep pedagogical logic) from syuzhet (surface rhetorical presentation). AI STORIES project (U. Bergen). NarrativeML annotation scheme. StoryPilot validation tool. Recommends bipartite taxonomy separating argumentative architecture from pedagogical delivery. (Refs 1-15)

**Topic 2 — Emotional Trajectory Modeling.** VAD (Valence-Arousal-Dominance) coordinate space for continuous emotion modeling. LongEmotion benchmark (2025/2026) for LLM emotional intelligence over extended contexts. CoEM (Collaborative Emotional Modeling) for context maintenance. EmotionArcs project: 9,000 literary texts mapped. Standard emotion taxonomies (Plutchik, Ekman) inadequate for contemplative literature. (Refs 3-22)

**Topic 3 — Author Voice Profiling.** Fuoli et al. 2025 on metaphor identification: RAG+codebook LLMs competitive with fine-tuned models (F1 0.79). Unconstrained LLMs produce 15-25% conceptually irrelevant metaphor interpretations. "Metaphor-Literal Repository" constraint required. Voice profiles need structured JSON against codebook, not open-ended descriptions. (Refs 23-28)

**Topic 4 — Cross-Text Structural Alignment.** Tesserae project (Latin/Greek intertextual parallels). uBIQUity platform (Christian/Islamic sacred texts). Biblical Hebrew intertextual detection using E5, AlephBERT, LaBSE (2025). Chiasmus detection via neural embeddings. Key insight: compute distances between structured metadata (VAD trajectories, pedagogical classifications), not raw text embeddings, for structural resonance. Dynamic Time Warping for emotional trajectory comparison. (Refs 28-36)

**Topic 5 — Contemplative Text Analysis.** "Doctrinal flattening" risk: AI models trained on secular corpora impose historic-critical methodologies onto sacred texts (ref 39). Database of Religious History (DRH) for early Chinese texts. Anchor prompts with corpus-specific glossary. Add "Contemplative Experience" as a distinct structural category. Never conflate Sanskrit technical terms. (Refs 37-41)

**Topic 6 — Indian Literary Theory (Rasa, Dhvani, Auchitya).** Sandhan et al. 2025 at World Sanskrit Conference: computational linguistics applied to Śikṣāṣṭaka for rasa, dhvani, rīti analysis (ACL Anthology). Navarasa ontology mapped to OWL format for sentiment analysis. Rasa extracts vibhāva (determinants), anubhāva (consequents), vyabhicāribhāva (transitory states). Dhvani separates vācyārtha (literal meaning) from vyaṅgyārtha (suggested spiritual teaching). Auchitya assesses structural fitness. Report claims: "This research fundamentally alters the proposed architectural design." (Refs 42-51)

**Topic 7 — Long-Context LLM Prompting.** Opus 4.6: 1M-token context, 78.3% on MRCR v2. Attention degradation beyond 250K-500K tokens for complex reasoning. AoY at ~220K tokens: safe for single-pass. Commentaries >400K words: need overlapping chunks. Adaptive thinking eliminates static chain-of-thought. Enforce hierarchical JSON schema (define book_architecture before chapters arrays) for top-down synthesis. (Refs 52-62)

**Topic 8 — Museum Curation.** Management Science 2026 study (1.5M museum visits): curatorial geometry dictates engagement, overriding visitor preferences. "Meta-algorithmic curation" for digital archives. Cognitive Load Theory applied to digital heritage. CIDOC-CRM semantic standards. Confirms "invisible but load-bearing" principle. (Refs 63-70)

**Topic 9 — Validation Methodology.** "Rating indeterminacy" — multiple valid interpretations. Perspectivist Modeling: treat disagreement as signal. LLM-as-a-Judge with 3D Paradigm (Decompose, Decouple, Detach). JCLS workflow for evaluating LLM poetry interpretations. Recommends: Opus generates, Sonnet validates, store both with confidence weights. Ultimate validation: downstream navigation utility. (Refs 71-79)

**Topic 10 — Cross-Language Structural Analysis.** Deep structural properties (argument architecture, thematic arcs) are cross-linguistically stable. Voice profiles are language-dependent. Multilingual E5 / LaBSE for cross-lingual metadata mapping. Analyze English master, map to translations via chunk-level embeddings. Voice profiles: recalculate per language or disable for translations. (Refs 28, 80-82)

**Topic 11 — Semantic Coordinate Systems.** "Semantic coordinates analysis" (Zhu et al. 2020): explicit probability-ratio vectors for text positioning. GeoSPARQL for qualitative spatial relations. Recommends culturally-grounded axes: Action/Karma ↔ Contemplation/Jnana, Personal ↔ Universal/Cosmic, Exoteric ↔ Esoteric. (Refs 83-88)

**Topic 12 — Hierarchical Multi-Scale Enrichment.** Hierarchical Contextual Augmentor (HCA): depth-first metadata cascade. WiredBrain framework: PostgreSQL + pgvector for hierarchical RAG. Bidirectional: book-level understanding flows back down to re-weight chunk embeddings. Tiered LLM: Opus for book, Sonnet for chapter (with book context), PostgreSQL for chunk propagation. (Refs 89-94)

---

## Project Analysis (Claude Opus 4.6, 2026-03-17)

**Existing design:** FTR-128 (Structural Enrichment Tier) proposes three-scale enrichment (chapter/book/author) using Claude Opus 4.6 with 1M-token context. Produces structural metadata (thematic arcs, emotional trajectories, turning points, metaphor patterns, structural types, argument architecture, voice profiles, chapter resonances) stored in PostgreSQL. All metadata is invisible navigation infrastructure — never displayed as AI-authored content.

### What the report gets right

1. **Indian literary theory (Topic 6) is the headline finding.** Sandhan et al. 2025 at the World Sanskrit Conference (ACL Anthology) applied computational linguistics to the Śikṣāṣṭaka for rasa, dhvani, and rīti analysis. Navarasa ontology mapped to OWL format exists (ref 49). Three concepts map directly to FTR-128:
   - **Rasa** (aesthetic essence): what the text does to the reader — nine traditional categories + śānta
   - **Dhvani** (suggestion): the unstated spiritual teaching beneath the surface narrative
   - **Auchitya** (propriety): why this structural element is here — its fitness in the architecture
   These are Yogananda's own tradition's categories for exactly what FTR-128 proposes.

2. **Bipartite structural taxonomy (Topic 1).** Fabula (deep structure: pedagogical logic) vs. syuzhet (surface structure: rhetorical presentation) are orthogonal dimensions. A chapter can be an autobiographical anecdote (surface) implementing progressive revelation (deep). FTR-128's single `structural_type` field conflates these.

3. **VAD coordinates for emotional trajectory (Topic 2).** Valence-Arousal-Dominance coordinate arrays enable mathematical comparison (Dynamic Time Warping) for "chapters with similar emotional arc." LongEmotion benchmark (2025/2026) validates LLM emotional intelligence over extended contexts. Makes chapter resonances computable.

4. **Tiered LLM strategy (Topics 7, 12).** Opus for book-level (whole-context matters), Sonnet for chapter-level (chapter text + book architecture context suffices). ~80% cost reduction per book. AoY at ~220K tokens is safe for single-pass Opus; commentaries >400K words need chunking or compaction.

5. **Perspectivist validation (Topic 9).** Treat interpretive disagreement as signal, not noise. Store multiple valid readings with confidence weights. Opus generates, Sonnet validates independently. Ultimate validation: downstream navigation utility. Journal of Computational Literary Studies published a workflow for evaluating LLM poetry interpretations (ref 79).

6. **Cross-language structural stability (Topic 10).** Deep structural properties (argument architecture, thematic arcs) are cross-linguistically stable. Voice profiles are language-dependent. Analyze English master, map to translations.

7. **Museum curation confirmation (Topic 8).** Management Science 2026 study (1.5M museum visits): curatorial geometry dictates engagement, overriding visitor preferences. Validates "invisible but load-bearing" principle.

8. **Cross-text alignment approaches (Topic 4).** Tesserae project (Latin/Greek intertextual parallels), uBIQUity platform (Christian/Islamic sacred texts), Biblical Hebrew intertextual detection. Key insight: compute distances between structured metadata, not raw text embeddings, for structural resonance.

9. **Doctrinal flattening risk (Topic 5).** Named concept from ResearchGate (ref 39): AI models trained on secular corpora impose historic-critical methodologies onto sacred texts. Mitigation: anchor prompts with corpus-specific glossary, never conflate Sanskrit technical terms.

10. **Codebook-driven voice profiling (Topic 3).** Fuoli et al. 2025 on metaphor identification: unconstrained LLMs produce 15-25% conceptually irrelevant interpretations. "Metaphor-Literal Repository" constraint required. Voice profiles must be structured JSON against a codebook, not open-ended descriptions.

### Where we diverge from the report's recommendations

1. **"This research fundamentally alters the proposed architectural design" (Topic 6) is too strong.** Rasa, dhvani, and auchitya *enrich* the design — they don't replace Western narratological categories. Structural type, turning points, and argument architecture remain useful. The right architecture includes both traditions and lets them tension against each other.

2. **VAD mappings for contemplative registers are the report's invention.** "Devotion: Valence High, Arousal High, Dominance Low" is plausible but unempirical. Let Opus assign VAD coordinates during the prototype; evaluate whether resulting trajectories are useful. Don't hardcode mappings.

3. **Some citations are stretched.** "Invisible Museum" (ref 69) is about 3D VR exhibitions, not invisible organizational metadata. LG Guggenheim reference (70) is a single artist award. DRH (41) studies Chinese texts, not Hindu. Comparable Examples sections are thinner than State of the Art.

4. **"Server-Side Compaction API" (Topic 7) needs verification.** Uncertain whether this is a real Anthropic production API or the report conflating it with context management strategies. Practical advice (AoY safe; >400K words needs chunking) is sound regardless.

5. **The report's axis recommendations for semantic cartography (Topic 11) are better than FTR-129's current axes.** Action/Karma ↔ Contemplation/Jnana is more culturally grounded than Inner Practice ↔ Outer Life. But axis selection should emerge from the prototype, not be prescribed in advance.

### Actions taken

| Finding | Action | Location |
|---------|--------|----------|
| Bipartite structural taxonomy | Split `structural_type` into `surface_structure` + `deep_structure` | FTR-128 schema |
| Rasa classification | Added `dominant_rasa` + `rasa_determinants` to chapter schema | FTR-128 schema |
| Dhvani extraction | Added `dhvani` field (suggested meaning beneath surface) | FTR-128 schema |
| Auchitya assessment | Added to `key_chapters` JSONB in book schema | FTR-128 schema |
| Tiered LLM strategy | Specified Opus for book-level, Sonnet for chapter-level | FTR-128 cost model |
| VAD emotional trajectory | Changed TEXT[] to JSONB (VAD coordinate arrays) | FTR-128 schema |
| Cross-language strategy | Added section: English master → translation mapping | FTR-128 spec |
| Perspectivist validation | Added section: Opus generates, Sonnet validates, store both | FTR-128 spec |
| Doctrinal flattening mitigation | Added to prompt design notes | FTR-128 spec |

### Future directions to revisit

- **Semantic cartography axes** — Action/Karma ↔ Contemplation/Jnana vs. Inner/Outer. Evaluate during FTR-128 prototype. Feed results to FTR-129.
- **Dynamic Time Warping for chapter resonances** — implement when emotional trajectory data exists. pgvector cosine similarity on VAD arrays as the simpler starting point.
- **Navarasa ontology integration** — the OWL-formatted ontology (ref 49) could seed the rasa classification codebook for Opus prompts.
- **Bidirectional enrichment** — book-level understanding flowing back down to re-calibrate chunk-level `passage_role`. Evaluate after prototype.

### Overall assessment

This report is significantly more valuable than the autosuggestion report. The autosuggestion report mostly confirmed existing design. This report introduces Indian literary theory as a genuine design-altering input, provides concrete computational precedents (Sandhan et al. 2025, Navarasa ontology), names actionable methodologies (perspectivist validation, DTW for trajectory comparison, codebook-driven profiling), and resolves three of FTR-128's unstated gaps (cross-language strategy, validation methodology, cost optimization through tiered LLMs).

The single most important finding: **Yogananda's own tradition has a 1,000-year-old analytical framework (rasa, dhvani, auchitya) for exactly the kind of structural understanding FTR-128 proposes.** Using only Western narratological categories to analyze an Indian teacher's work is a design blind spot the research prompt was specifically designed to expose. It worked.
