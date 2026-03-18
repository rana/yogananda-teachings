## Research Request: Modern Search Architecture Beyond Cosine Vector Similarity — Frontier Retrieval Techniques for a Bounded Multilingual Sacred Text Corpus (2026)

### Project Context

I am building a free, world-class online teachings portal that makes Paramahansa Yogananda's published books (Self-Realization Fellowship and Yogoda Satsanga Society of India) freely accessible worldwide. Late 2026 launch. The portal is a search-and-reading experience — not a chatbot, not a generative AI tool. The AI is a librarian: it finds and ranks verbatim published text, never generates or paraphrases content.

**The architectural question this research addresses:**

The portal's current search uses a standard hybrid retrieval architecture: dense vector similarity (cosine via pgvector HNSW) + sparse keyword retrieval (BM25 via ParadeDB pg_search) + Reciprocal Rank Fusion (RRF). This was state of the art in 2023-2024. By 2026, the retrieval landscape may have evolved significantly.

Meanwhile, the portal has invested extraordinary depth in **index-time intelligence** that the retrieval mechanism cannot fully exploit:
- A five-layer Vocabulary Bridge mapping seeker states and modern vocabulary to Yogananda's terminology, with register awareness ("death" asked philosophically vs. "death" asked in grief)
- Unified enrichment producing 14 structured metadata fields per passage: topic tags, entity labels, emotional quality, experiential depth (1-7 scale of consciousness states), voice register, passage role, cross-references, relationship triples
- Structural enrichment (proposed) at chapter/book/author scale using Indian literary theory: rasa (aesthetic experience evoked), dhvani (hidden meaning beneath the surface), auchitya (architectural fitness)
- Cross-work concordance (proposed) with four orthogonal connection dimensions: structural, rasa, dhvani, auchitya — enabling navigation like "feel more of this" (same rasa) or "what is this story really about?" (hidden-to-surface dhvani)
- A knowledge graph with typed relationships: TEACHES, DESCRIBES_STATE, CROSS_TRADITION, PROGRESSION_TO
- An entity registry with canonical forms, aliases, and Sanskrit normalization

The core tension: **the portal has world-class index-time understanding but standard retrieval**. A seeker typing "I feel empty inside" gets cosine similarity against a single 1024-dim dense vector per passage. The system knows which passages carry karuna (compassion) rasa, which have "meet_first" retrieval intent, which are classified as "consoling" depth signature — but the vector search cannot use this. The enrichment metadata participates only in post-retrieval filtering or ranking, not in the retrieval itself.

**Is this the right design? Or are there retrieval paradigms that would make the index-time intelligence directly searchable?**

**Corpus profile:**
- Current: 2 books (Autobiography of a Yogi in English and Spanish), 2,681 text chunks (~500 words each), ~286K words total
- Near-term (2027): ~25 books across 10 languages, ~50K chunks
- Full vision (2028+): 100-300 corpus items including books, 100 years of magazine archives, audio transcriptions — across 10 languages
- The corpus is bounded, fully known at ingestion time, and relatively small by modern standards
- Content is profoundly multi-layered: a single passage can be simultaneously humorous on the surface, devotional in register, philosophical in argument, and experiential in depth

**Current search architecture:**
- Embedding model: Voyage voyage-4-large (MoE architecture, shared embedding space across model family, Matryoshka dimension reduction, 32K token context, multilingual). Asymmetric encoding: document-type at index, query-type at search. Voyage 4's shared embedding space allows indexing with voyage-4-large and querying with voyage-4-lite for latency/cost optimization.
- Dense vector index: pgvector HNSW with cosine distance (`vector_cosine_ops`), m=16, ef_construction=64
- Sparse index: ParadeDB pg_search BM25 with ICU tokenization
- Fusion: Reciprocal Rank Fusion, k=60, merging top-20 from each path
- Planned additions: HyDE (hypothetical document embedding), cross-encoder reranking (Voyage Rerank or comparable — see Topic 6), graph-augmented retrieval (PATH C via SQL traversal)
- Graceful degradation: five levels from full AI-enhanced to pure database-only search
- Search latency budget: primary mode ~200ms, enhanced mode ~350ms
- All search runs inside a single PostgreSQL database (Neon). No external search services (no Elasticsearch, no Pinecone, no Weaviate). This is architectural — single-database (FTR-104), 10-year design horizon, replaceable components.

**Technical constraints:**
- PostgreSQL (Neon) as the single database — all search must run in Postgres or in the application layer querying Postgres
- Next.js on Vercel — serverless, no persistent processes
- Claude via AWS Bedrock for index-time enrichment only — never in the search hot path
- No external search services (Elasticsearch, Pinecone, Algolia, Typesense) — not for cost, but for architectural simplicity over a 10-year horizon
- Performance budget: < 400ms total search latency from anywhere on Earth, including 2G connections in rural India
- Privacy: zero user tracking, zero behavioral data — all search intelligence must be corpus-derived

**What world-class means for this project:**
- A grieving seeker finds passages that console, not instruct
- A seeker searching "meditation" gets results calibrated to their depth (beginner vs. advanced practitioner)
- Cross-tradition queries ("Christ and Krishna on love") surface Yogananda's own concordances
- The system discovers connections invisible to keyword or topic search — structural parallels, shared hidden meanings, aesthetic resonances
- Search feels like consulting a wise librarian who knows the library intimately — not a database returning ranked results

---

### Research Topics

For each topic below, I need: (a) named tools, libraries, papers, or approaches with dates, version numbers, and citations, (b) production-readiness assessment (experimental / early-adopter / mature), (c) specific applicability to a bounded ~50K-chunk multilingual sacred text corpus running on PostgreSQL, (d) examples from comparable production systems if they exist. **Go directly to the frontier. Do not provide introductory explanations of what vector search or hybrid retrieval means.**

#### 1. Late Interaction and Multi-Vector Retrieval (ColBERT, ColPali, and Successors)

Dense single-vector embeddings compress an entire passage into one 1024-dim point. This necessarily loses token-level precision. For a corpus where "savikalpa samadhi" and "nirvikalpa samadhi" name radically different states of consciousness, and where "divine mother" is a precise theological term (not a metaphor), token-level matching matters.

ColBERT (Khattab & Zaharia 2020) and successors maintain per-token embeddings and compute late interaction (MaxSim) at search time. This preserves the distinction between "samadhi" (generic) and "nirvikalpa samadhi" (specific) that cosine similarity over a single dense vector may blur.

Specific questions:
- What is the 2026 state of the art for late interaction / multi-vector retrieval? ColBERTv2, PLAID, ColPali, others? Named models, papers, and production deployments.
- Can late interaction models run on PostgreSQL? Specifically: does pgvector support storing and querying multi-vector representations per row? What about ParadeDB? Are there PostgreSQL extensions for ColBERT-style MaxSim operations?
- For a ~50K chunk corpus with ~500 tokens per chunk — what is the storage overhead of per-token embeddings vs. single dense vectors? (50K chunks x ~500 tokens x 128-dim vs. 50K x 1024-dim)
- What is the retrieval latency for late interaction on a corpus of this size? Is brute-force MaxSim practical, or is approximate search (PLAID-style) needed?
- Are there multilingual late interaction models? ColBERT was English-first. What handles 10 languages including Hindi (Devanagari), Bengali, Japanese, Thai?
- For domain-specific terminology where precision matters more than recall — how much does late interaction improve over dense single-vector on specialized vocabulary?
- Has anyone applied late interaction to literary, scholarly, or sacred text corpora?

#### 2. Learned Sparse Retrieval (SPLADE and Successors vs. BM25)

BM25 is the portal's sparse retrieval path. It's a statistical model from the 1990s — it doesn't know that "mindfulness" and "concentration" are semantically related in this corpus, or that "AUM" and "Holy Ghost" map to the same concept in Yogananda's framework. It matches terms, not meanings.

SPLADE (Formal et al. 2021) and successors learn sparse representations where semantically related terms activate shared sparse dimensions. A SPLADE model trained on (or fine-tuned for) spiritual text might give "mindfulness" non-zero weight on the same sparse dimension as "concentration" — bridging the vocabulary gap at the index level rather than at query time.

Specific questions:
- What is the 2026 state of the art for learned sparse retrieval? SPLADE, SPLADEv2, SPLADE++, SPLADEv3, Efficient SPLADE, others? Named models and papers.
- How does SPLADE compare to BM25 on domain-specific corpora where terminology is specialized? Benchmarks on legal, medical, or scholarly text — domains with vocabulary gaps similar to spiritual text?
- Can SPLADE run on PostgreSQL? Does ParadeDB or any Postgres extension support learned sparse vector search? Or must it run in the application layer?
- For a multilingual corpus: are there multilingual SPLADE models? How do they handle Sanskrit terminology embedded in English prose?
- What is the cost and difficulty of fine-tuning a SPLADE model on a ~50K chunk specialized corpus? Is the corpus large enough?
- Could learned sparse retrieval replace BM25 entirely, or is it best used as a third retrieval path alongside dense + BM25?
- Storage and latency: what are SPLADE's requirements for a 50K-chunk corpus?

#### 3. Hybrid Fusion Beyond Reciprocal Rank Fusion

RRF is the portal's fusion strategy: `score = sum(1/(k + rank))` across retrieval paths. It's simple, parameter-light (one k constant), and robust. But it treats all retrieval paths as equally trustworthy for all query types. A keyword query like "divine mother" should weight BM25 heavily; a conceptual query like "how to find inner peace" should weight dense vector heavily; an emotional query like "I feel empty" might benefit from a third signal entirely (metadata-based retrieval).

Specific questions:
- What fusion methods exist beyond RRF for multi-path hybrid search (2024-2026)? Convex combination with learned weights? Attention-based fusion? Conditional/adaptive fusion that selects weights based on query characteristics?
- Is there research on query-adaptive fusion — using query classification (the portal already classifies intent: topical/emotional/conceptual/definitional/situational) to dynamically weight retrieval paths?
- For a 2-path system (dense + sparse) evolving to 3-path (+ graph) and potentially 4-path (+ metadata-based): how should fusion scale? Does RRF degrade with more paths?
- Specific to this project: the Vocabulary Bridge already identifies query register (philosophical, distressed, curious, devotional). Could register be a fusion signal — weighting different retrieval paths differently based on the seeker's emotional state?
- What are the failure modes of RRF that might matter for a sacred text corpus? Does RRF exhibit biases that harm emotional or metaphorical queries?
- Are there production systems using adaptive or learned fusion? Named deployments, papers, benchmarks.

#### 4. Contextual and Enrichment-Augmented Embeddings

Anthropic's Contextual Retrieval paper (2024) showed 49-67% reduction in retrieval failures when prepending document context to chunks before embedding. The portal already plans this experiment (FTR-128 Experiment 2). But the portal has far richer context than "document title + summary" — it has 14 enrichment fields, structural metadata, rasa/dhvani classifications, and vocabulary bridge mappings.

The question: **can enrichment metadata be embedded alongside the passage text to make the retrieval itself multi-dimensional?**

Specific questions:
- What is the 2026 state of the art for enrichment-augmented or context-augmented embeddings? Anthropic's approach, document summary indices, hypothetical question generation per chunk, metadata-prepended embeddings — named approaches, papers, production implementations.
- If a passage is embedded as `"[rasa: karuna/compassion] [depth: 5/dhyana] [voice: devotional] [role: consolation] {passage text}"` — does the embedding model meaningfully encode the metadata? Or does it ignore structured prefixes?
- Has anyone experimented with embedding the same passage multiple times with different metadata prepended — one embedding optimized for topical retrieval, another for emotional retrieval, another for structural retrieval? Multi-faceted embedding per chunk.
- For Voyage voyage-4-large specifically: how does it handle structured prefix metadata? Is there research on how Voyage 4 (or similar MoE embedding models) encode vs. ignore non-natural-language prefixes?
- What is the cost of maintaining 2-4 embeddings per chunk (one per retrieval facet) at 50K chunks? Storage, index rebuild time, query latency when searching multiple embedding columns.
- Could hypothetical question generation at index time (generate 3-5 questions this passage answers, embed the questions) improve retrieval for a corpus where seekers' vocabulary diverges from the author's? This is the vocabulary bridge problem pushed into embedding space.
- Are there approaches that fine-tune the embedding model to attend to specific metadata dimensions?

#### 5. Domain-Adapted and Fine-Tuned Embedding Models

FTR-024 identifies domain-adapted embeddings as the "highest-ceiling path to world-class retrieval." A model fine-tuned on Yogananda's corpus would understand that "God-consciousness" and "cosmic consciousness" are near-synonyms, that "the Divine Mother" is a specific aspect of deity not a biological parent, and that "nirvikalpa" is an extreme rarity — more distant from "samadhi" in general than it appears in standard embedding space.

Specific questions:
- What is the 2026 state of the art for fine-tuning embedding models on specialized corpora? Named approaches, papers, tools. Specifically: Sentence Transformers fine-tuning, Voyage's custom model service, Cohere's fine-tuning, OpenAI's fine-tuning, open-source approaches (BGE, E5, GTE).
- For a corpus of ~50K chunks (~25M tokens): is this enough training data for meaningful fine-tuning? What is the minimum viable corpus size? What data augmentation strategies help with small corpora?
- What training data format is needed? Triplets (query, positive, negative)? How would you generate training triplets from a sacred text corpus with a golden evaluation set of ~66 queries?
- Multilingual fine-tuning: can a single fine-tuned model maintain cross-lingual retrieval quality across 10 languages, or does fine-tuning on English degrade Hindi/Spanish/Japanese retrieval?
- Cost and effort: what does fine-tuning cost in 2026 for the major providers? For open-source approaches?
- Has anyone fine-tuned embedding models on literary, scholarly, religious, or philosophical corpora? Named projects, results, lessons learned.
- Is instruction-tuned embedding (where the query includes retrieval instructions like "find consoling passages about grief") a viable alternative to domain fine-tuning? Named models that support this (E5-instruct, GTE-Qwen, others).

#### 6. Cross-Encoder and LLM-Based Reranking (2026 Landscape)

The portal uses Voyage for embeddings (voyage-4-large). Voyage also offers reranking products. Using the same vendor for both embedding and reranking has potential advantages: shared semantic space, unified billing, consistent multilingual quality. The original design specified Cohere Rerank 3.5, but vendor consolidation with Voyage may be preferable. The reranking landscape evolves fast.

Specific questions:
- **Voyage Rerank products:** What reranking models does Voyage AI offer in 2026? Model names, benchmark performance, multilingual quality, pricing. How do they compare to Cohere Rerank 3.5 specifically? Are there advantages to using the same vendor (Voyage) for both embedding and reranking?
- What is the complete 2026 landscape of production cross-encoder rerankers? Voyage Rerank, Cohere Rerank 3.5, Jina Reranker, BGE Reranker, Google's reranker, open-source options. Named models with benchmark comparisons.
- LLM-as-reranker: using Claude Haiku or GPT-4o-mini for pointwise, pairwise, or listwise reranking. What are the 2026 benchmarks vs. purpose-built cross-encoders? Latency? Cost per query?
- For multilingual reranking across 10 languages: which rerankers handle non-Latin scripts well? Hindi/Bengali/Japanese/Thai performance specifically.
- Listwise reranking (ranking all candidates simultaneously rather than scoring pairs) — is this practical at the top-20 candidate scale? Named approaches, latency.
- For a sacred text corpus: the "correct" ranking depends on the seeker's state, not just topical relevance. "I feel empty" should rank consoling passages higher than philosophical ones. Can rerankers be conditioned on query intent/register? Has anyone done register-aware or emotion-aware reranking?
- Self-hosted vs. API: at what query volume does self-hosting an open-source reranker (BGE, Jina) become more cost-effective than Cohere's API? What are the operational requirements?
- Could the portal's own index-time Opus classifications (rasa, depth, voice register, retrieval intent) be used as reranking signals alongside the cross-encoder score?

#### 7. Knowledge-Graph-Enhanced Retrieval

The portal plans graph-augmented retrieval (PATH C) via SQL traversal of entity relationships in PostgreSQL. The graph contains typed edges: TEACHES, DESCRIBES_STATE, CROSS_TRADITION_EQUIVALENT, PROGRESSION_TO, LINEAGE. The question is whether graph structure can be incorporated into the retrieval mechanism itself, not just as a separate retrieval path.

Specific questions:
- What is the 2026 state of the art for graph-enhanced retrieval? GraphRAG (Microsoft), GRIT, KG-augmented dense retrieval, GNN-based retrieval — named approaches, papers, production deployments.
- Can knowledge graph structure be encoded into embedding vectors? Approaches that produce "graph-aware embeddings" where passages connected by typed relationships are closer in vector space — even if their text is topically distant.
- For a small graph (~500 entities, ~50K edge-traversable chunks): is the graph too small for GNN-based approaches to be meaningful? What is the minimum graph size for graph-enhanced retrieval to outperform text-only retrieval?
- The portal's graph includes progression chains (concentration -> meditation -> samadhi) and cross-tradition equivalences (kundalini <-> Holy Ghost). Can these typed, directional relationships improve retrieval in ways that bag-of-words and dense vectors cannot?
- Microsoft's GraphRAG (2024): community detection + summarization. Is this relevant for a small, curated, single-author corpus? Or is it designed for large, heterogeneous document collections?
- For PostgreSQL-native graph traversal: are there approaches to pre-compute graph-informed retrieval candidates (at index time) rather than traversing at query time?
- How does graph-enhanced retrieval interact with multi-path fusion? Is it a separate retrieval path (as currently designed) or should it modify the dense/sparse paths?

#### 8. Retrieval by Non-Topical Dimensions (Rasa, Emotion, Depth, Register)

This is the frontier question most unique to this project. The portal classifies every passage with:
- Experiential depth (1-7 scale from ordinary waking to nirvikalpa samadhi)
- Emotional quality (consoling, inspiring, instructional, devotional, demanding, celebratory)
- Voice register (intimate, cosmic, instructional, devotional, philosophical, humorous)
- Depth signature (bottomless, informational, catalytic, consoling)
- Rasa (aesthetic experience: shanta/peace, karuna/compassion, vira/heroic resolve, adbhuta/wonder, etc.)
- Retrieval intent from the Vocabulary Bridge (meet_first, console, orient, invite)

**Can these non-topical dimensions become primary retrieval signals — not just post-retrieval filters?**

Specific questions:
- Are there retrieval systems that search by emotion, aesthetic quality, or experiential dimension rather than (or in addition to) topic? Named systems, papers, approaches.
- Music recommendation searches by mood, energy, and valence (Spotify's audio features). Has this paradigm been applied to text retrieval? "Find me passages that feel like consolation" as a first-class search operation.
- Could separate embedding spaces be trained for different dimensions — one for topic, one for emotional register, one for contemplative depth? Multi-space retrieval where the query routes to the appropriate space.
- Alternatively: could structured metadata (rasa, depth, register) be used as hard or soft filters on the dense vector search? `WHERE rasa = 'karuna' AND depth >= 4` combined with cosine similarity — how does this perform vs. pure vector search?
- For the Vocabulary Bridge's retrieval intent classification: when the bridge identifies a query as "distress" register with "console" intent, could this directly modify the retrieval strategy (boosting passages with matching emotional quality) rather than just the post-retrieval ranking?
- Has anyone built a search system where the same query retrieves different passages depending on detected emotional state? Not just intent classification routing to different pages — but the retrieval itself being state-sensitive.
- What would "rasa-space embeddings" look like — vectors trained to cluster passages by aesthetic experience rather than topic?

#### 9. Cross-Lingual Retrieval for Parallel Translated Corpora

The portal uses Voyage voyage-4-large's multilingual embedding space. A Hindi seeker typing "meditation" and a Spanish seeker typing "meditacion" should reach the same Yogananda passages (in their respective languages). The corpus contains the *same book* translated into multiple languages — a unique advantage over typical multilingual search.

Specific questions:
- Beyond shared multilingual embedding spaces: what 2026 approaches exist for cross-lingual retrieval in parallel translated corpora? Translation-pair-aware retrieval? Cross-lingual alignment using known parallel passages?
- The portal has translation-pair relations in `chunk_relations` (18,540 translation pairs linking English and Spanish passages). Can these known alignments be used to improve cross-lingual retrieval — e.g., by fine-tuning embeddings to pull translation pairs closer together?
- For Sanskrit terminology that appears across all languages (samadhi, karma, dharma, pranayama): how do multilingual embedding models handle terms that are borrowed unchanged into the target language vs. terms that are translated? Does "samadhi" in Hindi text and "samadhi" in English text produce similar vectors?
- Cross-lingual query expansion: a seeker types in Hindi, the system expands to include English vocabulary bridge terms, searches both Hindi and English indices, returns Hindi results. Is this the right pattern, or are there better approaches?
- For languages with different scripts (Devanagari, Bengali, Thai, Japanese) — what are the failure modes of multilingual embeddings on short queries (2-3 words) in non-Latin scripts?
- Are there production multilingual sacred text search systems? How do they handle cross-lingual retrieval? (e.g., Sefaria handles Hebrew/English/Arabic; Buddhist text databases handle Pali/Sanskrit/English/Chinese/Japanese/Korean/Thai)

#### 10. PostgreSQL-Native Search Infrastructure Evolution (2025-2026)

Everything runs in PostgreSQL on Neon. The portal's architectural commitment to a single database means that search capabilities are bounded by what PostgreSQL can do.

Specific questions:
- **pgvector evolution (2025-2026):** What new capabilities exist in pgvector 0.8+? New distance metrics? New index types beyond HNSW and IVFFlat? Better quantization? Multi-vector support (for ColBERT-style storage)? Sparse vector support?
- **ParadeDB / pg_search evolution:** What's new in ParadeDB's BM25 implementation? Learned sparse vector support? Better multilingual tokenization? Integration with pgvector for hybrid queries?
- **Neon-specific capabilities:** Does Neon offer any search-specific features (vectorized query execution, hardware acceleration, pre-computed index warming)?
- **pg_embedding alternatives:** Are there other PostgreSQL extensions for vector search beyond pgvector? Lantern? pgembedding? How do they compare?
- **Brute-force exact search at 50K scale:** At 50K vectors x 1024 dimensions, is brute-force exact cosine similarity practical (no HNSW, no approximation)? What latency? This would eliminate the recall loss from approximate search.
- **Quantization in PostgreSQL:** Binary quantization, product quantization, scalar quantization for pgvector — what's available in 2026? For a 50K corpus, is quantization needed or is full-precision affordable?
- **Columnar storage for metadata filtering:** When combining vector search with metadata filters (language, rasa, depth), what PostgreSQL techniques optimize this? Partial indexes? Expression indexes? pg_partman?

#### 11. Exploratory Search and Discovery Beyond the Search Box

The portal has a search box. But its seekers often don't know what they're looking for — they're seeking, not searching. The Wanderer's Path (FTR-140), Four Doors (FTR-138), semantic cartography (FTR-129), and the Quiet Index (FTR-066) all gesture toward discovery interfaces that don't start with a query.

Specific questions:
- What is the 2026 state of the art for **exploratory search** — search interfaces designed for users who don't have a specific information need? Named systems, frameworks, research. Especially for literary, cultural, or scholarly collections.
- **Faceted browsing with semantic awareness:** beyond traditional facets (author, date, topic), can the portal's enrichment dimensions (rasa, depth, voice register, structural type) become browsable facets? Are there production systems with non-standard semantic facets?
- **Serendipitous discovery interfaces:** systems that surface unexpected, relevant content without a query — like a librarian who says "You might also be interested in..." Named production implementations for cultural heritage, digital libraries, museum collections.
- **Spatial/visual exploration:** the portal plans semantic cartography (chapters positioned on meaningful axes). What 2026 tools and approaches exist for spatial navigation of text collections? Not UMAP/t-SNE projections (mathematically derived, semantically opaque) — but curated spatial layouts with interpretable axes.
- **Conversation-style discovery:** not a chatbot that generates answers, but an interactive system that helps seekers refine what they're looking for through dialogue — "Are you looking for comfort, understanding, or practice guidance?" Are there production implementations that use structured dialogue for search refinement without generating content?
- **How do production sacred text platforms handle discovery?** Sefaria's "Topics" page, Bible Gateway's reading plans, Quran.com's browsing experience, vedabase.io's tag cloud — what works, what doesn't?

#### 12. Search Quality Evaluation for Multi-Dimensional Relevance

The portal's golden set evaluates Recall@3 and MRR@10 — standard retrieval metrics that measure "did we find a relevant passage?" But "relevant" is one-dimensional. The portal aspires to multi-dimensional relevance: the right passage for this topic AND this emotional register AND this depth level AND this seeker state.

Specific questions:
- What evaluation methodologies exist for **multi-dimensional search relevance** — where topical relevance is necessary but not sufficient? Named frameworks, papers, metrics.
- **Seeker satisfaction vs. passage relevance:** are there evaluation approaches that measure whether the search result *served the seeker's need* rather than just matching the query? Especially for emotional or situational queries ("I feel empty," "my father just died").
- **Register-appropriate retrieval evaluation:** how do you measure whether a search system returns passages at the right emotional register? A philosophically curious query about death should not return the same passages as a grief-stricken query about death — but both are "relevant" to "death." Are there evaluation protocols for this?
- **Graded relevance with multiple dimensions:** beyond binary relevant/not-relevant and even graded high/partial/not-relevant — can evaluation capture "topically relevant but wrong register" vs. "topically relevant and right register"?
- **LLM-as-judge for multi-dimensional evaluation:** can Claude evaluate search results on multiple axes simultaneously (topical relevance, emotional appropriateness, depth calibration, register match)? What prompting strategies produce reliable multi-dimensional judgments?
- **A/B testing without behavioral tracking:** the portal's DELTA privacy constraint prohibits session tracking. How do you evaluate search quality improvements without click-through rates, dwell time, or user satisfaction surveys? Are there purely corpus-based or editorial-based evaluation methods?
- **Evaluation for discovery interfaces:** if the portal moves beyond search-box-and-results toward discovery/exploration interfaces, how do you evaluate their quality? What metrics apply?

---

### Output Format

**Do not write an introductory essay about search architecture, vector similarity, or the evolution of information retrieval.** Start directly with findings.

For each of the 12 topics, provide:

1. **State of the art** -- Named tools, libraries, models, papers, or approaches with dates and citations. Link to source if possible.
2. **Production readiness** -- Experimental / Early adopter / Mature. With evidence.
3. **Recommendation for this project** -- Specific to a bounded ~50K-chunk multilingual sacred text corpus running on PostgreSQL (Neon), with rich index-time enrichment metadata, serving global seekers including mobile-first users on 2G. What to adopt, what to skip, what to watch.
4. **Comparable examples** -- Production implementations from sacred text platforms (Sefaria, Quran.com, Bible Gateway, vedabase.io, Access to Insight), digital humanities projects, library/museum digital collections, or scholarly text search systems. If none exist, say so explicitly.

**Prioritize specificity over comprehensiveness.** A benchmark number on a specific configuration is worth more than a paragraph of qualitative assessment. A named production implementation is worth more than a theoretical analysis. A "this doesn't exist yet" is worth more than speculation presented as fact.

**Special attention to three topics:**

**Topic 1 (Late interaction / ColBERT):** This is the technique most likely to fundamentally change the retrieval paradigm. For a corpus where individual Sanskrit terms carry precise, non-interchangeable spiritual meaning, token-level matching could be the difference between "good search" and "world-class search." The PostgreSQL feasibility question is critical — if ColBERT can't run in Postgres, it's architecturally excluded.

**Topic 8 (Retrieval by non-topical dimensions):** This is the research question most unique to this project. Most search research optimizes for topical relevance. This portal has the metadata infrastructure to search by aesthetic experience, contemplative depth, and emotional register. If there is frontier work on non-topical retrieval, it could reshape the entire search architecture.

**Topic 4 (Enrichment-augmented embeddings):** This is the lowest-cost, highest-probability upgrade path. If prepending enrichment metadata to passages before embedding measurably improves retrieval, it's implementable within the current architecture with no new infrastructure — just re-embedding ~50K chunks with richer context.

### Questions I'm Probably Not Asking

The above topics assume that search (type query, retrieve passages, rank results) is the right paradigm. But:

- **At 50K chunks, is sophisticated retrieval even necessary?** Could brute-force exact search + a very good reranker outperform any approximate search technique? The corpus is tiny by modern standards.
- **Is the fundamental architecture (retrieve-then-rank) optimal, or are there fundamentally different paradigms for bounded corpora?** Generative retrieval (where the model directly generates document identifiers)? Pre-computed answer sets? Complete pre-materialized search results for common query patterns?
- **Should the portal's search optimize for finding what the seeker asked for, or for surfacing what the seeker needs?** These are different. A seeker asking "how to meditate" needs technique instructions routed to SRF Lessons (Practice Bridge). A seeker asking "I want to meditate" needs passages about the beauty and promise of meditation (inspirational). The query is similar; the need is different. Is there research on need-aware (not just query-aware) retrieval?
- **What can we learn from how contemplative traditions approach the act of finding truth in texts?** The Western library science model (classify, index, retrieve) is one paradigm. The Indian guru-disciple model (the teaching finds the student when the student is ready) is another. Is there computational work on "readiness-aware" content delivery?
- **For a corpus with pre-computed four-dimensional concordance (structural, rasa, dhvani, auchitya connections between passages), does navigation become more important than search?** If the passage the seeker is reading already connects to the passage they need via a dhvani bridge, maybe the right design is "navigate from here" rather than "search from scratch."

If any of these unasked questions lead to research with design-altering implications, include them.
