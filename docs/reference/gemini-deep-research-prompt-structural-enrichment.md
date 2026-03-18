## Research Request: Structural Enrichment Architecture — Whole-Context AI Understanding of Sacred Texts at Chapter, Book, and Author Scale (2026)

### Project Context

I am building a free, world-class online teachings portal that makes Paramahansa Yogananda's published books (Self-Realization Fellowship and Yogoda Satsanga Society of India) freely accessible worldwide. Late 2026 launch. The portal is a search-and-reading experience with an AI-powered librarian — not a chatbot, not a generative AI tool. The AI finds and ranks verbatim published text; it never generates, paraphrases, or synthesizes content.

**The architectural gap this research addresses:**

The portal's existing enrichment pipeline analyzes each ~500-word passage independently — assigning topic tags, entity labels, emotional quality, depth levels, voice register. The knowledge graph builds bottom-up from these chunk-level entities and relationships. But no artifact captures what an LLM sees when it reads an entire chapter as a coherent arc, an entire book as an argument structure, or an author's complete output as a distinctive voice.

This is the difference between a library that catalogs individual pages and one that understands how books work.

**What we propose to build:**

A three-scale structural enrichment tier using Claude Opus 4.6 (via AWS Bedrock) with native 1M-token context:

1. **Chapter Perspective** (~49 calls per book). Opus reads an entire chapter. Produces: thematic arc, emotional trajectory, turning points, metaphor patterns, structural type, connections to other chapters.

2. **Book Perspective** (~1 call per book). Opus reads the full book in a single context window (~164K words for Autobiography of a Yogi). Produces: argument architecture, movement, structural pattern, key chapters by architectural role, distinctive contribution.

3. **Author Voice Profile** (~1 call per author). Opus reads across all works by an author. Produces: voice characteristics, metaphor preferences, emotional range, characteristic pedagogical moves, distinctive emphasis.

4. **Chapter Resonances** (cross-structural). Structural parallels across chapters in different works — same arc pattern, same thematic movement, same emotional trajectory deployed for a different teaching.

**Critical design constraint: invisible but load-bearing.** All structural enrichment is internal navigation metadata. It is never displayed to seekers as AI-authored content. Seekers experience curated organization; the curation logic is invisible. This is the same pattern as the existing chunk-level enrichment — the AI classifies, the portal navigates. The librarian is invisible; the library is the experience.

**What structural enrichment powers (all invisible to seekers):**
- "Chapters with similar arc" navigation (structural similarity, not just topic overlap)
- Passage discovery weighted by emotional trajectory and book architecture
- "Walk through how Yogananda builds the case for [concept]" ordered by argument structure
- Passages clustered by voice characteristics and metaphor patterns
- Semantic cartography — chapters positioned on meaningful axes (inner practice / outer life, personal / universal) for spatial navigation

**Corpus profile:**
- Current: 2 books (Autobiography of a Yogi in English and Spanish), 2,681 text chunks, ~286K words total
- Near-term (2027): ~25 books across 10 languages
- Full vision (2028+): 100–300 corpus items including ~25 books, 100 years of Self-Realization Magazine archives (~400 issues), audio lecture transcriptions, and video talk transcriptions — across 10 languages
- Autobiography of a Yogi: 49 chapters, ~164K words (English), ~122K words (Spanish)
- Major scriptural commentaries (God Talks With Arjuna, The Second Coming of Christ): >400K words each, >1,000 pages

**Technical constraints:**
- Claude Opus 4.6 on AWS Bedrock, native 1M-token context at standard pricing
- Claude is used only at index time — never in the search hot path, never to generate content
- PostgreSQL (Neon) storage, not a graph database
- Outputs are structured data (JSON/SQL columns), never prose displayed to seekers
- Budget: ~50 Opus calls per book, ~1,250 total for 25 books. Modest cost at batch pricing.

**Distinctive properties of this corpus:**
- Yogananda blends Western autobiographical narrative with Indian philosophical discourse, devotional poetry, and experiential description of meditative states
- Progressive revelation is a core structural pattern — concepts introduced at one level are revisited with deeper understanding later
- The same teaching appears in different structural forms across different works (a concept explained philosophically in one book, narratively in another, experientially in a third)
- The corpus includes multiple author voices (Yogananda, Sri Yukteswar, Daya Mata, Mrinalini Mata) with distinct pedagogical styles
- Sanskrit terminology carries precise technical meaning — "samadhi" and "savikalpa samadhi" and "nirvikalpa samadhi" are not interchangeable

---

### Research Topics

For each topic below, I need: (a) named tools, libraries, papers, or approaches with dates and citations, (b) production-readiness assessment, (c) specific applicability to a bounded multilingual sacred text corpus analyzed by a 1M-context LLM, (d) examples from comparable projects if they exist. **Go directly to the frontier. Do not provide introductory explanations of what narrative structure or text analysis means.**

#### 1. Computational Narratology: Story Arc and Structural Type Detection

The structural enrichment assigns each chapter a "structural type" — currently proposed as: spiral, linear build, frame narrative, progressive revelation. This taxonomy is intuitive, not grounded in literary scholarship.

Specific questions:
- What are the established taxonomies of narrative structure in computational narratology (2024–2026)? Named frameworks, ontologies, or classification systems for how texts are organized — not just for fiction plots but for argumentative, philosophical, pedagogical, and devotional texts.
- Kurt Vonnegut's "shape of stories" has been computationalized (Reagan et al. 2016 onward). What is the 2026 state of the art for automated story arc detection? Are there LLM-based approaches that supersede the earlier sentiment-trajectory methods?
- What structural type taxonomies exist specifically for non-fiction, philosophical, or religious texts? "Spiral" and "progressive revelation" are patterns in wisdom literature — has anyone formalized these?
- Are there computational approaches that distinguish between surface structure (the order events are presented) and deep structure (the pedagogical or argumentative logic that governs the ordering)?
- For a 49-chapter spiritual autobiography that blends narrative, philosophy, humor, devotion, and experiential description — what structural analysis frameworks handle multi-register texts?
- What tools or libraries exist for extracting narrative structure from long-form texts using LLMs (not traditional NLP topic modeling)?

#### 2. Emotional Trajectory Modeling in Long-Form Texts

Each chapter perspective includes an "emotional trajectory" — the sequence of emotional registers through the chapter (e.g., [instructional → narrative → devotional → cosmic → intimate]). This is not sentiment analysis. It is register/mode tracking.

Specific questions:
- What is the 2026 state of the art for modeling emotional or affective trajectories in long texts (not tweet-level sentiment)? Named approaches, datasets, evaluation methods.
- Appraisal theory (Martin & White), Plutchik's wheel, Russell's circumplex — which emotional frameworks have been successfully applied to literary text analysis at chapter-length scale?
- Are there LLM-based approaches to emotional arc extraction that produce structured, enumerable outputs (not just "this text is positive/negative" but "this text moves from X to Y through Z")?
- For spiritual texts specifically: the emotional vocabulary of contemplative literature doesn't map cleanly to standard emotion taxonomies. "Devotion," "cosmic awe," "divine longing," "inner stillness" are not anger/sadness/joy/fear. Has anyone developed emotion taxonomies for religious or contemplative texts?
- What evaluation methodologies exist for validating that a detected emotional trajectory is "correct"? Inter-annotator agreement studies? Expert validation approaches?
- How does emotional trajectory detection handle texts that are deliberately multi-layered — a passage that is simultaneously humorous on the surface and profoundly devotional underneath?

#### 3. Author Voice Profiling and Computational Stylistics

The enrichment tier produces "author voice profiles" — voice characteristics, metaphor preferences, emotional range, characteristic pedagogical moves, distinctive emphasis. This is computational stylometry at the LLM scale.

Specific questions:
- What is the 2026 state of the art in computational stylistics and authorship attribution? Are there approaches that go beyond surface features (word frequency, sentence length) to characterize deep stylistic properties (pedagogical patterns, metaphor systems, argumentative strategies)?
- Has anyone used LLMs (not traditional NLP) for author voice profiling on long-form texts? What prompting strategies produce consistent, useful stylistic descriptions?
- For a corpus with multiple authors who share a tradition (all SRF monastics, all writing about the same teachings) — what approaches distinguish individual voice within shared theological vocabulary?
- Metaphor detection and metaphor system analysis — what's available in 2026? Can LLMs reliably identify recurring metaphor patterns across a body of work (e.g., Yogananda's consistent use of ocean/wave imagery for the relationship between soul and Spirit)?
- Are there production systems that use author voice profiles for navigation or discovery? "Show me passages in Daya Mata's voice" is a different request than "Show me passages by Daya Mata" — voice is about how it reads, not who wrote it.

#### 4. Cross-Text Structural Alignment (Chapter Resonances)

The "chapter resonances" artifact identifies structural parallels across chapters in different works — same arc pattern, same thematic movement, same emotional trajectory deployed for a different teaching. This is structural alignment, not topical similarity.

Specific questions:
- What approaches exist for detecting structural (not topical, not embedding) similarity between texts? Text reuse detection? Structural alignment algorithms? Narrative parallelism detection?
- In biblical scholarship and Quranic studies, "parallel passages" is a foundational concept (synoptic parallels in the Gospels, thematic echoes in the Quran). Has this been computationalized? What tools or datasets exist for cross-text structural comparison in religious corpora?
- For a corpus where the same author teaches the same concept through different structural forms (a philosophical argument in one book, a personal narrative in another, a devotional poem in a third) — what approaches detect this "same teaching, different form" relationship?
- Are there graph-based or embedding-based methods for representing chapter-level structure such that structural similarity (not content similarity) can be computed?
- What is the state of the art for "intertextuality detection" — finding structural relationships between texts that go beyond citation and quotation?

#### 5. Contemplative and Sacred Text Analysis

Most NLP work targets news, fiction, social media, or scientific text. Spiritual texts have distinctive properties that may require specialized approaches.

Specific questions:
- Has anyone published computational analysis of contemplative, mystical, or spiritual texts? Hindu philosophical texts (Upanishads, Bhagavad Gita commentaries)? Buddhist sutras? Sufi poetry (Rumi, Hafiz)? Christian mystical literature (Meister Eckhart, John of the Cross, Teresa of Avila)? Yogananda specifically?
- What is the state of digital humanities work on religious corpora as of 2026? Named projects, databases, analysis tools. Examples: the Digital Mishnah, the Quran Digital Humanities project, Buddhist text analysis, the OpenITI corpus.
- Spiritual texts often use "progressive revelation" — introducing a concept simply, then returning to it with deepening layers across chapters or across an entire corpus. Has this structural pattern been studied computationally? Any detection methods?
- "Experiential description" — where the author describes a meditative or mystical state from the inside — is a distinctive text type that doesn't map to standard genre classifications. Has anyone studied the computational properties of first-person contemplative experience reports?
- How do existing text analysis tools handle Sanskrit terminology embedded in English prose? The technical vocabulary ("samadhi," "pratyahara," "nirvikalpa") carries precise semantic content that English glosses ("superconscious state") only approximate.

#### 6. Indian Literary Theory (Rasa, Dhvani, Auchitya)

The structural type taxonomy in the current design leans Western (frame narrative, linear build). Indian literary theory offers fundamentally different frameworks for understanding how texts work — and Yogananda's writing is deeply rooted in this tradition.

Specific questions:
- **Rasa theory** (Bharata's Natyashastra, Abhinavagupta's elaboration): the nine rasas (shringara, hasya, karuna, raudra, vira, bhayanaka, bibhatsa, adbhuta, shanta) describe the aesthetic experience a text evokes. Has rasa theory been computationalized? Are there automated rasa classification systems for texts?
- **Dhvani** (Anandavardhana): the theory of suggestion — meaning that is not stated but evoked. In Yogananda's writing, the surface narrative often carries an unstated spiritual teaching. Has dhvani or "suggestive meaning" been studied computationally?
- **Auchitya** (propriety/fitness): the principle that every element of a text is appropriate to its context and purpose. As a structural analysis framework, auchitya asks "why is this element here?" — which is precisely what structural enrichment does. Has auchitya been applied to computational text analysis?
- More broadly: are there computational literary analysis frameworks that synthesize Western narratology and Indian literary theory? Or are these entirely separate scholarly traditions in the digital humanities?
- For a portal serving a global audience including Indian seekers deeply familiar with these literary concepts — would structural metadata informed by rasa theory create a meaningfully different (better?) navigation experience than metadata informed only by Western narratological categories?

#### 7. Long-Context LLM Prompting for Structured Document Analysis

The enrichment tier sends entire books (~164K words) to Claude Opus 4.6 in a single 1M-token context window and requests structured JSON output describing chapter arcs, argument architecture, and voice profiles.

Specific questions:
- What are the known failure modes for LLM analysis of very long documents (100K+ tokens)? "Lost in the middle" effects? Attention degradation across the output? Inconsistency between analysis of early chapters vs. late chapters?
- What prompting strategies produce the most consistent, high-quality structured outputs from long-context LLMs in 2026? Chain-of-thought with structured sections? Hierarchical summarization then analysis? Output scaffolding?
- For a task like "read this 49-chapter book and produce a JSON object with structural analysis for each chapter plus a whole-book analysis" — what output formats and chunking strategies prevent degradation in output quality across the response?
- Are there benchmarks or evaluation datasets for long-context document understanding tasks that go beyond retrieval (needle-in-a-haystack) to structural comprehension?
- What is the practical difference between using Opus vs. Sonnet for whole-book structural analysis? Is the cost/quality tradeoff well-characterized for interpretive (not just extractive) long-context tasks?
- Any published work on using extended thinking / chain-of-thought with 1M-context inputs? Does extended thinking help with structural comprehension of very long documents?

#### 8. Museum Curation and Invisible Organization

The deepest design principle of structural enrichment is "invisible but load-bearing" — the metadata is never shown to seekers, but it shapes their entire navigation experience. This is exactly how museum curation works. The visitor doesn't see the curatorial logic; the arrangement *is* the experience.

Specific questions:
- How do world-class museum curators (art museums, natural history museums, cultural heritage institutions) organize exhibitions for discovery? What frameworks describe curatorial logic — thematic, chronological, geographical, phenomenological, emotional?
- Has museum curation theory been applied to digital information architecture? Are there named approaches, papers, or frameworks for "curatorial UX" — organizing digital collections using principles from physical exhibition design?
- The Victoria & Albert Museum, the Rijksmuseum, the Smithsonian, the British Museum — do any of these use computational methods (including AI) to organize their digital collections in ways that go beyond metadata search? Specifically, do they use AI to generate structural metadata that powers navigation without being visible to visitors?
- In library science, "faceted classification" and "reader's advisory" are both forms of invisible structural organization. What is the 2026 state of the art for AI-powered reader's advisory systems — recommending books based on structural/stylistic properties rather than topic/genre?
- Are there production digital libraries or archives that use multi-scale metadata (passage-level + chapter-level + work-level + author-level) to power navigation? How do they prevent the different scales from conflicting?

#### 9. Validation Methodology for Interpretive AI Outputs

There is no ground truth for "the thematic arc of Chapter 15." Structural enrichment produces interpretive outputs — not classifications with a correct answer, but readings that can be more or less useful, coherent, and illuminating. How do you validate this?

Specific questions:
- What evaluation methodologies exist for AI outputs that are interpretive rather than extractive? Literary analysis, art criticism, curatorial decisions — domains where multiple valid interpretations exist.
- Inter-annotator agreement approaches for literary analysis tasks — what agreement levels are considered acceptable? How many annotators? What training?
- Can LLMs evaluate other LLMs' interpretive outputs? If Opus produces a structural reading, can Sonnet validate it? What are the failure modes of LLM-as-judge for interpretive tasks?
- For structural outputs specifically (thematic arc, emotional trajectory, structural type) — what evaluation criteria distinguish "good" from "poor" structural analysis? Internal consistency? Predictive power (can the structural reading predict which passages readers find most meaningful)? Expert endorsement?
- Are there evaluation datasets or benchmarks for literary structural analysis that could serve as baselines?
- Practically: if I generate 49 chapter perspectives for Autobiography of a Yogi, what's the minimum viable validation protocol before using them as navigation metadata?

#### 10. Cross-Language Structural Analysis

Autobiography of a Yogi exists in 50+ languages. The portal currently has English and Spanish. The structural enrichment must work across languages.

Specific questions:
- Is the structural analysis of a book language-dependent or language-independent? Does the thematic arc of Chapter 15 differ between the English and Spanish editions, or is structure a property of the content that transcends language?
- For translated texts specifically: does translating a text change its structural properties? (Word order, emphasis patterns, cultural connotations differ.) Has anyone studied structural preservation/alteration across translations computationally?
- Pragmatic approach: analyze the English edition, then verify structural readings hold for translations. Is this a sound methodology, or does each language require independent structural analysis?
- For author voice profiling: Yogananda wrote in English. His works translated into Hindi sound different — they are not "his voice." How should structural enrichment handle the voice dimension for translated works?
- Are there multilingual digital humanities projects that do structural analysis across parallel translations of the same text?

#### 11. Semantic Coordinate Systems for Text Collections

A downstream consumer of structural enrichment is "semantic cartography" — positioning chapters on meaningful axes (inner practice / outer life, personal / universal) for spatial navigation. Opus assigns coordinates during chapter perspective generation.

Specific questions:
- What precedents exist for creating human-interpretable coordinate systems for text collections? Not UMAP/t-SNE (mathematically derived, semantically opaque) — but deliberately designed axes with semantic meaning.
- Has anyone built spatial navigation interfaces for document collections where the spatial layout is curated (not projected from embeddings)? Digital humanities spatial visualization projects?
- What axis systems have been proposed or used for positioning spiritual or philosophical texts? The proposed axes (inner/outer, personal/universal, introductory/advanced, devotional/intellectual/experiential/narrative) — are there precedents for this kind of meaningful multi-dimensional positioning?
- How do you validate that a coordinate system is useful? User studies? Navigation task completion? Expert evaluation of positioning?
- For a global audience: are the proposed axes culturally neutral, or do they embed Western assumptions about how to organize spiritual knowledge? Would Indian, Japanese, or Thai seekers navigate the same axes?

#### 12. Hierarchical Multi-Scale Document Enrichment Architectures

The full enrichment pipeline operates at four scales: chunk (~500 words), chapter (thousands of words), book (hundreds of thousands of words), author (millions of words across works). Each scale produces metadata that informs the others.

Specific questions:
- What architectures exist for multi-scale document understanding where each level can inform the others? Bottom-up (chunk → chapter → book) vs. top-down (book → chapter → chunk) vs. bidirectional?
- In information extraction and knowledge base construction, are there established patterns for reconciling entity/relationship extractions across different granularity levels?
- The enrichment pipeline currently works bottom-up: chunks are enriched independently, then chapter/book/author perspectives are generated from the assembled text. Should book-level understanding flow *back down* to re-calibrate chunk-level metadata? (Example: a chunk's `passage_role` was classified in isolation; the chapter perspective reveals it's actually the chapter's turning point.) What are the engineering patterns for this?
- For a PostgreSQL-only architecture (no graph database, no document store): what schema patterns work best for storing and querying multi-scale metadata where navigation crosses scales? (e.g., "find the turning point passage in the chapter with the highest emotional range in the book with the strongest progressive-revelation structure")
- Are there cost-optimization strategies for hierarchical LLM enrichment? For example: use Opus for book-level perspective (where whole-book context matters most), Sonnet for chapter-level (where chapter context suffices), Haiku for back-propagation of structural metadata to chunks?

---

### Output Format

**Do not write an introductory essay about text analysis, structural understanding, or AI in the humanities.** Start directly with findings.

For each of the 12 topics, provide:

1. **State of the art** — Named tools, libraries, papers, projects, or approaches with dates and citations. Link to source if possible.
2. **Production readiness** — Experimental / Early adopter / Mature. With evidence.
3. **Recommendation for this project** — Specific to a bounded sacred text corpus analyzed by a 1M-context LLM, producing invisible navigation metadata stored in PostgreSQL. What to adopt, what to skip, what to watch.
4. **Comparable examples** — Production implementations from religious text portals, digital humanities projects, museum/library digital collections, or scholarly text analysis systems. If none exist, say so explicitly.

**Prioritize specificity over comprehensiveness.** A named project analyzing Hindu philosophical texts is worth more than a paragraph about "the potential of NLP for religious studies." A cited evaluation methodology is worth more than a claim that "validation is important." A "this doesn't exist yet" is worth more than speculation presented as fact.

**Special attention to Topic 6 (Indian literary theory).** This is the research topic most likely to contain knowledge that fundamentally changes the design — not just validates it. If rasa theory has been computationalized and applied to text analysis, it could reshape the structural type taxonomy entirely. Dig deep here.
