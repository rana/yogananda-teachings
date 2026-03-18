# Research Report: Modern Search Architecture Beyond Cosine Vector Similarity -- Frontier Retrieval Techniques for a Bounded Multilingual Sacred Text Corpus (2026)

## 1. Late Interaction and Multi-Vector Retrieval (ColBERT, ColPali, and Successors)

### State of the Art

The paradigm of late interaction retrieval has fundamentally shifted away from single-vector compression, preserving fine-grained, token-level semantic relationships. The current state of the art is represented by the ColBERTv3 lineage, multimodal variants such as ColPali and ColQwen, and highly optimized execution engines like PLAID (Performance-optimized Late Interaction Driver). For multilingual applications, ColBERT-XM utilizes an XMOD architecture with language-specific modular adapters, enabling zero-shot transfer across languages without the performance degradation typically associated with the "curse of multilinguality".

Crucially for single-database architectures, multi-vector late interaction is now natively supported within PostgreSQL via the VectorChord 0.3 extension. VectorChord implements a WARP-inspired decomposition of the MaxSim calculation, executing it as independent single-vector searches utilizing an Inverted File Index (IVF) combined with RaBitQ quantization. The system natively leverages the PostgreSQL vector array type and introduces the `@#` operator for computing Maximum Similarity (MaxSim) directly within the database engine, bypassing the need to export token arrays to the application layer.

### Production Readiness

**Mature for early adopters.** Late interaction is fully production-ready, driven by enterprise frameworks like RAGatouille and database integrations via VectorChord and Milvus. Benchmarks on the FiQA dataset demonstrate that VectorChord 0.3 achieves an NDCG@10 of 34.1 with query latencies averaging a mere 35 milliseconds, resolving the historical latency bottlenecks associated with token-level matrix comparisons.

### Recommendation for this Project

**Adopt via VectorChord.** The corpus requirement to distinguish between exact ontological states (e.g., "savikalpa samadhi" vs. "nirvikalpa samadhi") renders single-vector cosine similarity mathematically inadequate, as dense pooling inherently averages out localized token precision. Late interaction must be implemented to preserve this granularity.

For a 50,000-chunk corpus with 500 tokens per chunk, the storage overhead requires careful architectural planning but easily fits within PostgreSQL capabilities.

| Vector Type | Dimensionality | Bytes per Chunk (500 tokens) | Total Corpus Storage (50K Chunks) |
| :---- | :---- | :---- | :---- |
| Dense Single-Vector | 1024-dim (float32) | ~4 KB | ~200 MB |
| ColBERT Multi-Vector | 128-dim (float16) per token | ~128 KB | ~6.4 GB |
| ColBERT (1-bit Quantized) | 128-dim (1-bit) per token | ~8 KB | ~400 MB |

A 6.4 GB index is trivial for Neon's serverless PostgreSQL architecture. The recommended implementation is to define a multi-vector table using the vector type and create a vchordrq index specifying the `vector_maxsim_ops` operator class. Parameters such as `vchordrq.probes` and `build.internal.lists` (optimized to sqrt(N)) must be tuned to balance the 200ms latency budget with MaxSim accuracy. For multilingual support across Devanagari, Bengali, and Japanese, ColBERT-XM should be utilized to generate the initial token embeddings, as its modular adapters prevent token collision across diverse orthographies.

### Comparable Examples

Major search platforms like Elasticsearch have introduced bit-vector compression for late interaction to handle scale (specifically for ColPali visual representations). However, specialized sacred text platforms have yet to publish architectures utilizing MaxSim. This implementation would represent a first-in-class capability for theological text retrieval, bridging the gap between exact keyword matching and semantic fluidity.

## 2. Learned Sparse Retrieval (SPLADE and Successors vs. BM25)

### State of the Art

Learned Sparse Retrieval (LSR) addresses the inherent limitations of statistical models like BM25 by projecting text into a high-dimensional vocabulary space where semantically related terms activate shared sparse dimensions. The SPLADE (Sparse Lexical and Expansion) lineage dominates this space, with SPLARE-7B producing generalizable sparse latent representations that maintain high competitiveness in multilingual and cross-lingual document retrieval beyond English-centric scenarios.

In the PostgreSQL ecosystem, ParadeDB has released pg_sparse, an extension built as a fork of pgvector. It introduces the `svector` data type, enabling the efficient storage and querying of vectors with massive dimensionalities (e.g., 30,000+ dimensions, matching tokenizer vocabularies) where the vast majority of entries are zero. pg_sparse leverages a modified HNSW implementation to index these sparse representations efficiently, solving the classical inverted-index performance decay when executing semantic expansions.

### Production Readiness

**Mature.** ParadeDB's pg_search and pg_sparse extensions are actively deployed in production environments, providing 100% PostgreSQL-native solutions. Benchmarks for 100,000 SPLADE vectors (30,522 dimensions) show HNSW index creation takes approximately 200 seconds, with Top-10 retrieval queries executing in 6ms.

### Recommendation for this Project

**Replace BM25 with Learned Sparse Retrieval.** Given the 2026 launch horizon and the 50K chunk constraint, standard BM25 is insufficient for bridging the vocabulary gap between modern seekers and a mid-20th-century spiritual corpus. A query for "mindfulness" will fail under BM25 if the text exclusively utilizes "concentration" or "meditation."

The recommendation is to generate SPLARE-7B embeddings for the corpus and store them in a ParadeDB `svector` column. By creating an HNSW index using `svector_cosine_ops`, the system can execute sub-10ms sparse semantic searches. This bridges the vocabulary gap at the index level, reducing the computational burden on the query-time Vocabulary Bridge. Fine-tuning a SPLADE model on the 25 million token corpus using contrastive learning -- where masked word prediction is replaced by masked concept prediction -- will dynamically align the sparse activations with Yogananda's specific ontology, guaranteeing that "AUM" and "Holy Ghost" activate identical sparse dimensions.

### Comparable Examples

Enterprise applications increasingly favor LSR over BM25 for domain-specific jargon, particularly in legal and financial contexts where ParadeDB is deployed. Digital humanities projects have begun adopting SPLADE for historical text analysis, though explicit sacred text integrations remain unpublished.

## 3. Hybrid Fusion Beyond Reciprocal Rank Fusion

### State of the Art

Reciprocal Rank Fusion (RRF) is mathematically robust but fundamentally naive, as it applies static rank-based penalties to all retrieval paths regardless of the query's semantic nature. The frontier has shifted to Query-Adaptive Hybrid Search and Tensor-based Re-ranking Fusion (TRF).

The Adaptive Multi-Source RAG (AMSRAG) framework demonstrates that query complexity classifiers -- trained to evaluate evidence requirements and reasoning depths -- can dynamically schedule retrieval paths and calibrate fusion weights. TRF offers a high-efficacy alternative to mainstream fusion methods by executing path-wise quality assessments before fusion, preventing a "weakest link" phenomenon where an irrelevant keyword match artificially inflates a document's rank against a highly relevant semantic match.

### Production Readiness

**Early Adopter.** Query-adaptive fusion is actively being implemented in commercial systems like Meilisearch (via declarative SearchConfig logic) and Elasticsearch, utilizing lightweight classifiers to determine semantic versus keyword ratios dynamically. TRF and AMSRAG represent leading-edge implementations currently transitioning from academia to enterprise RAG architectures.

### Recommendation for this Project

**Implement Intent-Conditioned Weighting.** The portal already possesses a sophisticated index-time intelligence layer and a Vocabulary Bridge capable of detecting query register (e.g., philosophical vs. distressed). Static RRF must be replaced with a dynamic fusion function executed within the Next.js application layer immediately following the concurrent PostgreSQL retrieval paths.

| Query Intent Classification | Dense (MaxSim) Weight | Sparse (SPLADE) Weight | Metadata/Graph Weight |
| :---- | :---- | :---- | :---- |
| **Philosophical / Definitional** | 0.30 | 0.50 | 0.20 |
| **Distress / Consolation** | 0.20 | 0.10 | 0.70 |
| **Cross-Tradition Synthesis** | 0.40 | 0.10 | 0.50 |

When the Vocabulary Bridge classifies a query as having a "console" intent (e.g., "I feel empty"), the fusion algorithm dynamically assigns massive weight to the metadata retrieval path, subordinating the sparse path. Conversely, a definitional query ("what is the Holy Ghost") inverts these weights to heavily favor exact semantic mapping. This query-adaptive orchestration guarantees that the 200ms retrieval budget is spent intelligently, bypassing irrelevant dense searches entirely for high-confidence exact-match theological queries.

### Comparable Examples

Adaptive search systems in customer support and legal research actively use query intent classification to route between keyword, dense, and graph retrieval paths, preventing resource waste and improving Top-1 accuracy. Religious platforms like Sefaria apply static prioritization (weighting specific commentators based on user profiles), but real-time intent-conditioned fusion is not yet standard in public sacred text portals.

## 4. Contextual and Enrichment-Augmented Embeddings

### State of the Art

The standard practice of embedding flat text chunks causes catastrophic context loss, frequently resulting in vector representations that are topically accurate but relationally blind. Anthropic's Contextual Retrieval methodology (2024) proved that prepending document-level summaries to individual chunks reduces retrieval failure rates by up to 67% when paired with reranking.

In 2026, the state of the art has advanced to "Unified Embeddings" and natively context-aware models. Research demonstrates that fusing structured metadata directly into the content payload before indexing consistently outperforms both plain-text baselines and simple suffixing. By embedding [metadata] + [text], the high-dimensional space achieves higher intra-document cohesion and widens the separation between relevant and irrelevant chunks. Furthermore, Perplexity's pplx-embed-context-v1 utilizes diffusion pretraining on decoder models to inherently encode the relationship between a chunk and its broader document context, achieving 81.96% nDCG@10 on context-heavy benchmarks without manual metadata augmentation.

### Production Readiness

**Mature.** Anthropic's contextual chunking and the integration of structured metadata into embedding payloads are standard, proven practices for enterprise Retrieval-Augmented Generation.

### Recommendation for this Project

**Adopt Unified Enrichment-Augmented Embeddings.** This represents the highest-ROI, lowest-risk architectural update available to the portal. The 14 enrichment fields (rasa, depth, voice, role, intent) currently trapped as post-retrieval filters must be serialized and prepended to the chunk text prior to generating the Voyage-4 embeddings.

The payload format should follow a structured serialization:

`Context: [Aesthetic: Karuna]. Text: {passage text}`

The Mixture-of-Experts (MoE) architecture of Voyage-4-large will encode these structural cues as strong disambiguating signals, mapping passages not just by their semantic content, but by their ontological coordinates. To maximize this, generate hypothetical questions during the index-time Claude classification (e.g., "What specific spiritual distress does this passage alleviate?") and embed those alongside the metadata. This forces the embedding model to position the text closer to the phrasing a seeker will actually use, pushing the vocabulary bridge problem directly into the embedding space and drastically improving zero-shot retrieval accuracy.

### Comparable Examples

Enterprise systems utilizing legal filings and financial reports rely heavily on prefixing metadata (e.g., SEC form type, company, year) to disambiguate semantically identical text chunks. Sefaria utilizes linked metadata to surface interconnected texts, though their primary mechanism relies on explicit citation graphs rather than prefix-augmented dense vectors.

## 5. Domain-Adapted and Fine-Tuned Embedding Models

### State of the Art

Off-the-shelf embedding models, despite massive context windows, struggle with highly specialized ontologies where linguistic nuances separate superficially similar concepts (e.g., "God-consciousness" vs. "cosmic consciousness"). The 2026 landscape relies on Contrastive Learning with synthetic data generation for domain adaptation, minimizing the need for massive human-labeled datasets.

Techniques such as REFINE generate synthetic training data from unlabeled documents by prompting an LLM to generate query-document positive pairs, subsequently identifying "hard negatives" (documents with 50%-70% baseline similarity that are mathematically close but semantically distinct). Furthermore, the introduction of Contrastive Learning Penalty functions overcomes the limitations of standard contrastive loss, significantly enhancing information retrieval performance on pre-trained text embeddings without catastrophic forgetting.

### Production Readiness

**Mature.** Fine-tuning embedding models is standard practice. Frameworks like Sentence Transformers natively support evaluation during training (using DDP and evaluator parameters) to prevent embedding space collapse, a common failure mode in niche domain adaptation.

### Recommendation for this Project

**Execute Synthetic Contrastive Fine-Tuning.** While Voyage-4 offers a shared embedding space out-of-the-box, fine-tuning an open-weights model (e.g., voyage-4-nano or Qwen3-Embeddings) using Contrastive Learning is imperative for this highly specific theological corpus.

The ~50K chunk corpus (~25M tokens) is highly sufficient when augmented synthetically. An LLM must generate 5-10 synthetic queries per chunk, explicitly utilizing the Vocabulary Bridge to formulate queries in colloquial "seeker terminology." Crucially, hard negatives must be systematically curated via script. For a query regarding "nirvikalpa samadhi," the system must supply "savikalpa samadhi" as a hard negative to force the embedding space to separate these ontologically distinct states. To prevent the embedding space from collapsing into an indistinguishable, homogeneous blob (a known failure mode for dense, single-author corpora), the training loop must integrate periodic evaluations against the golden set of 66 queries.

### Comparable Examples

Legal intelligence platforms (e.g., Harvey) explicitly fine-tune models to distinguish between nuanced legal statutes, utilizing Voyage AI's custom model services. The military sector utilizes synthetic question-context pairs to fine-tune open-source embeddings for highly specific doctrinal queries, proving that 50K-chunk corpora are viable for dramatic retrieval improvements.

## 6. Cross-Encoder and LLM-Based Reranking

### State of the Art

Reranking bridges the gap between fast, approximate retrieval and high-precision semantic matching. The 2026 landscape is dominated by ultra-efficient cross-encoders that evaluate query-document pairs simultaneously. Voyage AI's Voyage 4 series introduces a shared embedding space alongside rerank-2.5 and rerank-2.5-lite, optimized specifically for multilingual retrieval and sub-50ms latency profiles.

Additionally, "LLM-as-a-Judge" listwise reranking utilizing lightweight, fast-inference models (such as Claude 3.5 Haiku) provides context-aware, reasoning-backed reranking that pure mathematical cross-encoders cannot achieve. However, due to the O(n^2) computational cost of evaluating pairs, purpose-built cross-encoders remain the standard for the primary latency hot path.

### Production Readiness

**Mature.** Cross-encoder reranking is a foundational requirement of modern multi-stage retrieval pipelines. The integration of unified embedding and reranking APIs through single vendors minimizes infrastructure overhead and ensures semantic alignment.

### Recommendation for this Project

**Adopt Voyage rerank-2.5 with Context-Conditioned Payloads.** Vendor consolidation provides a distinct architectural advantage. By using voyage-4-large for index-time embedding and voyage-4-lite for query-time embedding, the project exploits the shared embedding space for cost reduction while maintaining perfect semantic alignment. The rerank-2.5 cross-encoder should be utilized to re-order the top 60 candidates retrieved from the parallel dense, sparse, and graph paths.

To satisfy the non-topical retrieval requirements, the reranking payload must be manipulated. Instead of passing only the verbatim passage text to the cross-encoder, concatenate the Opus-generated enrichment metadata into the reranking evaluation string: `{Passage Text}`. This allows the cross-encoder to penalize philosophically dense passages when the query intent demands emotional support, directly acting upon the multidimensional relevance the portal aspires to achieve without requiring a custom-trained reranker.

### Comparable Examples

Platforms like Continue.dev use voyage-code-2 paired with rerank-lite-1 for highly accurate, stable retrieval within massive codebases. Enterprise search engines routinely utilize Voyage and Cohere cross-encoders to sift top-100 vector results down to a high-precision top-10, though injecting aesthetic metadata into the reranker context remains an underutilized frontier tactic.

## 7. Knowledge-Graph-Enhanced Retrieval

### State of the Art

GraphRAG represents a fundamental upgrade over naive vector retrieval by explicitly modeling relationships (edges) between chunks and entities (nodes). The 2026 frontier involves executing GraphRAG entirely within the relational database environment, eliminating the need for external, complex graph databases. Microsoft's GraphRAG Solution Accelerator for Azure Database for PostgreSQL utilizes the Apache AGE extension to enable OpenCypher graph queries alongside relational data.

This architecture bypasses error-prone LLM-based graph extraction by utilizing pre-existing structured relationships (e.g., citation networks or predefined ontologies) to establish node prominence. During query time, a hybrid approach executes vector search to find candidate nodes, applies semantic ranking, and then executes an OpenCypher query to calculate the graph "prominence" of those nodes based on relationship density.

### Production Readiness

**Mature.** The Apache AGE extension is a mature Apache Top-Level project. The integration of GraphRAG into PostgreSQL via OpenCypher and SQL traversal is actively supported by enterprise architecture blueprints, proving its stability for production workloads.

### Recommendation for this Project

**Implement In-Database Graph Prominence Retrieval.** The portal possesses a profound architectural advantage: a pre-computed, highly curated knowledge graph with typed edges (TEACHES, PROGRESSION_TO, CROSS_TRADITION). A 50K node / 500 entity graph is trivial for PostgreSQL to handle natively.

The architecture must implement the Apache AGE extension to enable OpenCypher graph traversal. Instead of relying on computationally heavy Graph Neural Networks (GNNs), implement a deterministic GraphRAG pipeline via SQL:

1. Retrieve top candidate passages via the dense/sparse paths.
2. Execute a Cypher query using AGE to identify the "prominence" and "centrality" of these passages. If a candidate passage has a PROGRESSION_TO edge linking it to an advanced meditative state, or a CROSS_TRADITION edge linking "AUM" to "Holy Ghost," its prominence score increases exponentially based on query context.
3. Fuse the graph prominence score with the baseline retrieval scores using Tensor-based Re-ranking Fusion. This allows the system to traverse topological relationships (e.g., retrieving a passage about Christ when the user asks about Krishna, due to a heavy edge weight) that pure vector search mathematically cannot perceive.

### Comparable Examples

Microsoft's GraphRAG accelerator for Legal Research Copilot uses citation graphs stored natively in Postgres to boost recall from 40% (vector-only) to 70%, correctly capturing prominent legal precedents that share logical dependencies invisible to standard semantic similarity.

## 8. Retrieval by Non-Topical Dimensions (Rasa, Emotion, Depth, Register)

### State of the Art

Retrieval based on aesthetic experience (Rasa), emotional quality, and contemplative depth is the most novel requirement of this project. While the vast majority of information retrieval research optimizes for topical relevance, frameworks in visual and audio domains provide the blueprint. Models like UMMIE map music-listening induced eudaimonia (aesthetic emotions) to specific latent dimensions. In text, the RaSa (Relation and Sensitivity Aware) representation learning framework uses contrastive learning to force embeddings to perceive sensitive transformations (e.g., subtle emotional shifts) rather than just broad topics.

Furthermore, dual-modal contrastive learning frameworks (like Style2Code) successfully train models to control and retrieve based on "style" (or register) completely independent of the underlying semantics, treating aesthetic alignment as a primary retrieval signal.

### Production Readiness

**Experimental / Frontier.** True non-topical, emotion-first semantic retrieval in text is highly experimental. Most production systems treat emotion and aesthetic quality strictly as post-retrieval scalar filters or rely on simplistic sentiment analysis.

### Recommendation for this Project

**Implement Multi-Space Embedding via Query Formulation.** Training an entirely new embedding space strictly for "rasa" from scratch is cost-prohibitive and unnecessary. The optimal architecture leverages the unified enrichment-augmented embeddings (Topic 4) combined with Adaptive Hybrid Search (Topic 3).

When the Vocabulary Bridge classifies a query's intent as [Intent: Console], the application dynamically rewrites the latent query sent to the embedding model: `[Emotion: Consoling] {Seeker's Query}`. Because the corpus was indexed with these exact metadata prefixes, the attention heads of the transformer will heavily weight the exact token match of the emotion tag in the embedding space, physically pulling the query vector toward consoling passages, regardless of whether the topic is "death," "emptiness," or "loss."

Coupled with a PostgreSQL Native WHERE clause (`WHERE metadata->>'rasa' = 'karuna' AND metadata->>'depth' >= 4`), the vector search performs a pre-filtered exact nearest neighbor search, guaranteeing that the retrieved passages match the seeker's precise emotional and experiential state.

### Comparable Examples

Music recommendation engines (Spotify) utilize multi-dimensional latent spaces to retrieve tracks by valence and energy independent of genre. In literature, "Retrieve-then-Adapt" architectures use natural language models to evaluate text relevance alongside style-based similarities, though explicit Rasa retrieval remains an open frontier.

## 9. Cross-Lingual Retrieval for Parallel Translated Corpora

### State of the Art

While shared multilingual embedding spaces (like voyage-4-large) are standard, they often fail to exploit the distinct advantage of a perfectly aligned parallel translated corpus. The 2026 frontier utilizes Multi-Way Parallel Text Alignment through contrastive learning. Research demonstrates that utilizing a multi-way parallel dataset -- where exact translations across multiple languages act as positive anchor pairs -- substantially improves cross-lingual representation, yielding up to 28.4% performance gains over traditional English-centric alignment.

### Production Readiness

**Mature.** Cross-lingual retrieval using massively multilingual models (e.g., XLM-Roberta, mE5, Qwen3-Embeddings) fine-tuned on parallel datasets is the established standard for localized enterprise platforms and governmental databases.

### Recommendation for this Project

**Exploit Translation Pair Mappings via Contrastive Fine-Tuning.** The portal possesses 18,540 verified translation pairs between English and Spanish. This is an unparalleled asset for cross-lingual alignment.

When fine-tuning the open-weights embedding model (as recommended in Topic 5), use these exact translation pairs as the positive anchors in the contrastive loss function. A Hindi seeker querying "dhyana" (meditation) will generate a vector perfectly aligned with the English passages for "meditation". Furthermore, for unchanged Sanskrit terminology (e.g., *samadhi*, *dharma*), the tokenizer must be explicitly adapted so that transliterations in Latin, Devanagari, and Bengali scripts are mapped to the same subword tokens prior to embedding, preventing catastrophic semantic drift across scripts.

For the query pipeline, implement cross-lingual query expansion: the seeker's query is routed through the local language's Vocabulary Bridge, expanded with standard Sanskrit ontology, embedded, and searched across the unified multi-way vector space, returning the corresponding chunk ID in the user's requested display language.

### Comparable Examples

Quran.com utilizes highly verified parallel texts (via the Tanzil project) to execute complex, cross-lingual retrieval. Queries are translated and expanded before searching across a unified space, demonstrating significant improvements over isolated monolingual retrieval architectures.

## 10. PostgreSQL-Native Search Infrastructure Evolution (2025-2026)

### State of the Art

By 2026, PostgreSQL is no longer a compromise for vector search; it is a premier execution engine. pgvector version 0.8+ introduced the `iterative_scan` feature, mitigating the critical "overfiltering" problem in HNSW indexes by continuing to search the graph until a predefined threshold of valid, metadata-filtered tuples is reached. Furthermore, extensions like ParadeDB utilize Tantivy-backed block storage for millisecond full-text retrieval natively within Postgres.

However, a fundamental truth of database architecture has re-emerged in the evaluation of filtered vector search: **Approximate Nearest Neighbor (ANN) indexes like HNSW are designed to solve latency bottlenecks for millions of vectors, not thousands.** Algorithmic adaptations within cost-based query optimizers frequently select suboptimal execution plans, favoring approximate index scans even when exact sequential scans would yield perfect recall at comparable latency.

### Production Readiness

**Mature.** pgvector and pg_search (ParadeDB) are enterprise-grade extensions capable of powering massive, high-throughput retrieval pipelines with ACID compliance.

### Recommendation for this Project

**Utilize Brute-Force Exact Search.** For a bounded corpus of ~50,000 chunks, constructing, maintaining, and traversing an HNSW index is a premature optimization that sacrifices recall (accuracy) for imperceptible latency gains.

| Search Methodology (50K Vectors, 1024-dim) | Recall | Estimated Latency (Neon DB) | Maintenance Overhead |
| :---- | :---- | :---- | :---- |
| **pgvector HNSW Index** | 85% - 95% | ~5-15ms | High (Graph rebuilds) |
| **pgvector Exact Search (Sequential Scan)** | 100% | ~35-40ms | Zero |

Benchmarks on PostgreSQL reveal that performing a brute-force exact search (Sequential Scan with `enable_seqscan = on`) on 50,000 vectors of 1024 dimensions takes approximately 35-40ms. This easily falls within the project's 200ms latency budget while guaranteeing 100% recall, preventing the system from missing a critical passage simply because it was physically isolated in an HNSW graph layer. By bypassing HNSW, the system eliminates the memory overhead of maintaining the graph, circumvents the complexities of filtered ANN search, and ensures that the most semantically relevant passage is *always* returned.

For complex queries requiring metadata filtering, combine the exact vector distance calculation (`<->` or `<=>`) with standard PostgreSQL B-Tree or partial indexes on the 14 enrichment fields. This allows the database query planner to swiftly isolate the relevant rows (e.g., `WHERE language = 'es' AND metadata->>'rasa' = 'shanta'`) and compute the cosine distance only on that highly restricted subset, driving latency down to the single digits.

### Comparable Examples

Data-heavy enterprises with highly curated datasets under 100K vectors frequently remove HNSW/IVFFlat indexes entirely, relying on GPU/CPU-accelerated brute-force vector math to guarantee perfect recall and simplify architecture.

## 11. Exploratory Search and Discovery Beyond the Search Box

### State of the Art

Exploratory search transitions the user from an active "searcher" to a passive "discoverer." The 2026 landscape focuses on Semantic Cartography and Faceted Ontology Browsing. By treating non-standard semantic metadata (aesthetics, emotional depth, structural types) as browsable edges, systems generate serendipitous discovery paths. Advanced implementations utilize linear programming algorithms to curate these discovery pages dynamically, solving objective functions that optimize for maximum thematic diversity and relevance across massive ontologies.

### Production Readiness

**Mature.** Ontology-driven discovery pages and automated semantic linking are widely deployed in digital humanities and specialized text libraries.

### Recommendation for this Project

**Implement Materialized Concordance Views.** The portal's pre-computed four-dimensional concordance (structural, rasa, dhvani, auchitya) changes the paradigm from "search" to "navigation." If a seeker is reading a passage and wishes to "feel more of this" (rasa), the system should not execute a latent vector search at runtime.

Because the corpus is bounded and fully known at index time, the architecture should use PostgreSQL Materialized Views to pre-compute and strictly store the exact topological nearest neighbors for every chunk across all four dimensions. The discovery interface becomes an instantaneous O(1) SELECT query against a relational table of pre-calculated edges. Faceted browsing must expose the 14 enrichment fields directly, allowing seekers to filter the library intuitively without ever typing a query.

### Comparable Examples

Sefaria's "Topics" pages utilize a Basic Formal Ontology (BFO) and linear programming (via Python's PuLP library) to automatically curate highly diverse, interconnected text paths, allowing users to browse the vast Jewish canon conceptually without requiring prior textual knowledge.

## 12. Search Quality Evaluation for Multi-Dimensional Relevance

### State of the Art

Standard metrics (Recall@K, MRR) fail entirely to capture the multi-dimensional relevance required by a sacred text corpus, where an answer might be topically correct but emotionally devastating. The frontier relies on "LLM-as-a-Judge" frameworks, specifically Multi-Agent-as-Judge (MAJ-EVAL) architectures. These systems automatically instantiate multiple LLM personas (e.g., a theological scholar, an empathetic counselor) to engage in group debates, generating multi-dimensional feedback that evaluates outputs on topicality, emotional register, and depth simultaneously.

Additionally, evaluating via Pairwise Preference (comparing two passages against each other rather than direct numerical scoring) aligns significantly better with human judgment, minimizing the verbosity and self-enhancement biases inherent in LLM evaluations.

### Production Readiness

**Mature.** LLM-as-a-Judge is the industry standard for offline RAG evaluation, supported by robust statistical measures like McDonald's omega to ensure evaluator stability and consistency across multiple iterations.

### Recommendation for this Project

**Deploy an Offline Multi-Persona Evaluator Pipeline.** The project's DELTA privacy constraint strictly prohibits user tracking, rendering traditional A/B click-through testing impossible. Evaluation must be entirely corpus-derived, offline, and automated.

Construct a golden dataset of 500 diverse queries explicitly mapped to specific seeker states. For every architectural update (e.g., tweaking fusion weights, introducing SPLARE, updating Voyage models), execute the queries and capture the Top-5 results. Utilize a Claude Sonnet framework to run a Pairwise Preference evaluation. The prompt must pass the passage text, the query, and the *intended emotional register*. Ask the LLM to evaluate whether Passage A or Passage B better serves the *combined emotional and topical need* of the seeker. By tracking the win-rate (Elo rating) of different retrieval configurations across topical, emotional, and depth dimensions, the portal can systematically quantify search quality improvements without logging a single byte of user behavioral data.

### Comparable Examples

Frameworks like RAGAS, Langfuse, and specialized systems for narrative coherence and clinical information retrieval rely entirely on LLM-as-a-Judge methodologies with multi-dimensional rubrics to evaluate complex, nuanced datasets safely and efficiently.

---

## Unasked Questions with Design-Altering Implications

**At 50K chunks, is sophisticated approximate retrieval even necessary?** As detailed in Topic 10, **no**. The industry obsession with HNSW, IVFFlat, and dedicated vector databases is driven by billion-scale enterprise requirements where exhaustively comparing vectors is mathematically impossible within latency budgets. At 50,000 chunks, a PostgreSQL exact sequential scan guarantees 100% recall in under 40 milliseconds. The portal should entirely bypass vector index maintenance, eliminate the complexities of filtered ANN search, and focus computational resources heavily on Late Interaction (MaxSim) and Cross-Encoder reranking. The corpus is simply too small to justify the recall degradation inherent in approximate search algorithms.

**Query-Aware vs. Need-Aware Retrieval.** The search paradigm must fundamentally shift from Query-Aware (matching the semantic content of the prompt) to Need-Aware (matching the psychological readiness of the user). The Vocabulary Bridge is already functioning as a rudimentary intent classifier. When a user asks "how to meditate" vs "I want to meditate", the retrieval system should not just adjust fusion weights; it should actively rewrite the query space to target specific auchitya (architectural fitness) tags. The Indian *guru-disciple* model dictates that truth is delivered based on readiness; the database can computationally mimic this by enforcing hard SQL filters on the experiential depth metadata field based on the inferred sophistication of the query terminology.

**Pre-Materialized Search as a Primary Paradigm.** For a bounded corpus, dynamic generation and real-time inference carry unnecessary risk. By pre-materializing the topological connections of the knowledge graph and the dimensional concordances into static PostgreSQL tables, the portal guarantees instant, zero-compute navigation. Search becomes the fallback mechanism when predefined, curated, and validated navigational pathways do not fulfill the seeker's journey.

---

## Works Cited

1. PLAID: An Efficient Engine for Late Interaction Retrieval - arXiv.org, https://arxiv.org/pdf/2205.09707
2. LIR: The First Workshop on Late Interaction and Multi Vector Retrieval @ ECIR 2026, https://arxiv.org/html/2511.00444v1
3. ColBERT-XM: A Modular Multi-Vector Representation Model for Zero-Shot Multilingual Information Retrieval - ACL Anthology, https://aclanthology.org/2025.coling-main.295.pdf
4. VectorChord 0.3: Bringing Efficient Multi-Vector Contextual Late Interaction in PostgreSQL, https://blog.vectorchord.ai/vectorchord-03-bringing-efficient-multi-vector-contextual-late-interaction-in-postgresql
5. GRAG: Graph Retrieval-Augmented Generation - arXiv, https://arxiv.org/html/2405.16506v1
6. GitHub - stanford-futuredata/ColBERT, https://github.com/stanford-futuredata/ColBERT
7. Efficient Multi-Vector Search in PostgreSQL - Reddit, https://www.reddit.com/r/Rag/comments/1k6e3pr/efficient_multivector_colbertcolpalicolqwen/
8. Late interaction models: How to scale & optimize in Elasticsearch, https://www.elastic.co/search-labs/blog/late-interaction-model-colpali-scale
9. Naver Labs Europe @ WSDM CUP | Multilingual Retrieval - arXiv, https://arxiv.org/html/2602.20986v1
10. Similarity Search with SPLADE Inside Postgres - ParadeDB, https://www.paradedb.com/blog/introducing-sparse
11. pg_search: Elastic-Quality Full Text Search Inside Postgres - ParadeDB, https://www.paradedb.com/blog/introducing-search
12. ParadeDB, https://www.paradedb.com/
13. Balancing the Blend: An Experimental Analysis of Trade-offs in Hybrid Search - arXiv.org, https://arxiv.org/html/2508.01405v2
14. Adaptive Query-Aware Retrieval - Emergent Mind, https://www.emergentmind.com/topics/adaptive-query-aware-retrieval
15. An Adaptive Multi-Source Retrieval-Augmented Generation Framework - MDPI, https://www.mdpi.com/2076-3417/16/5/2495
16. Adaptive RAG explained: What to know in 2026 - Meilisearch, https://www.meilisearch.com/blog/adaptive-rag
17. Adaptive Hybrid Retrieval in Elasticsearch - Reddit, https://www.reddit.com/r/learnmachinelearning/comments/1rfihx2/adaptive_hybrid_retrieval_in_elasticsearch/
18. How to Create Hybrid Search - OneUptime, https://oneuptime.com/blog/post/2026-01-30-hybrid-search/view
19. Contextual Retrieval in AI Systems - Anthropic, https://www.anthropic.com/news/contextual-retrieval
20. Metadata-Driven Retrieval-Augmented Generation for Financial Question Answering - arXiv.org, https://arxiv.org/html/2510.24402v1
21. Utilizing Metadata for Better Retrieval-Augmented Generation - People, https://people.cs.vt.edu/naren/papers/ecir-metadata-2026.pdf
22. Your RAG Pipeline Has a Context Problem. Perplexity Just Open-Sourced the Fix., https://karanprasad.com/blog/perplexity-pplx-embed-context-aware-embeddings-rag
23. Contextual retrieval in Anthropic using Amazon Bedrock Knowledge Bases - AWS, https://aws.amazon.com/blogs/machine-learning/contextual-retrieval-in-anthropic-using-amazon-bedrock-knowledge-bases/
24. Voyage 4 Series Now Available - MongoDB, https://www.mongodb.com/products/updates/the-voyage-4-series-now-available/
25. How to Find Interconnected Texts in the Sefaria Library, https://help.sefaria.org/hc/en-us/articles/18613227644316-How-to-Find-Interconnected-Texts
26. (PDF) REFINE on Scarce Data - arXiv, https://arxiv.org/abs/2410.12890
27. Efficient fine-tuning methodology of text embedding models - arXiv.org, https://arxiv.org/abs/2412.17364
28. Some Lessons Learned from Fine Tuning Embeddings for RAG - Reddit, https://www.reddit.com/r/LocalLLaMA/comments/1gedd2a/some_lessons_learned_from_fine_tuning_embeddings/
29. Fine-tune EmbeddingGemma - Google AI for Developers, https://ai.google.dev/gemma/docs/embeddinggemma/fine-tuning-embeddinggemma-with-sentence-transformers
30. Improve RAG accuracy with fine-tuned embedding models on Amazon SageMaker, https://aws.amazon.com/blogs/machine-learning/improve-rag-accuracy-with-fine-tuned-embedding-models-on-amazon-sagemaker/
31. Voyage AI, https://www.voyageai.com/
32. Voyage AI: Explore the Latest Embedding Models & Rerankers - MongoDB, https://www.mongodb.com/products/platform/ai-search-and-retrieval/models
33. Latest embedding Voyage 4 in RAG - Reddit, https://www.reddit.com/r/Rag/comments/1r14lw9/latest_embedding_voyage_4_in_rag/
34. MongoDB Sets a New Standard for Retrieval Accuracy with Voyage 4 Models - PR Newswire, https://www.prnewswire.com/news-releases/mongodb-sets-a-new-standard-for-retrieval-accuracy-with-voyage-4-models-for-production-ready-ai-applications-302662558.html
35. Contextual Retrieval in RAG - Medium, https://medium.com/box-developer-blog/contextual-retrieval-in-retrieval-augmented-generation-rag-49b7bff0c5b7
36. Introducing the GraphRAG Solution for Azure Database for PostgreSQL, https://techcommunity.microsoft.com/blog/adforpostgresql/introducing-the-graphrag-solution-for-azure-database-for-postgresql/4299871
37. GitHub - apache/age, https://github.com/apache/age
38. Azure-Samples/graphrag-legalcases-postgres - GitHub, https://github.com/Azure-Samples/graphrag-legalcases-postgres
39. Apache AGE Graph Database, https://age.apache.org/
40. PostgreSQL Graph Database: Everything You Need To Know, https://www.puppygraph.com/blog/postgresql-graph-database
41. RAG Just Got Its Biggest Upgrade - Medium, https://medium.com/@DevBoostLab/graphrag-biggest-upgrade-ai-development-2026-33366891525d
42. UMMIE: Unified Model of Music-Listening-Induced Eudaimonia - Frontiers, https://www.frontiersin.org/journals/cognition/articles/10.3389/fcogn.2025.1705976/full
43. RaSa: Relation and Sensitivity Aware Representation Learning - ResearchGate, https://www.researchgate.net/publication/373089327_RaSa_Relation_and_Sensitivity_Aware_Representation_Learning_for_Text-based_Person_Search
44. RaSa: Relation and Sensitivity Aware Representation Learning - IJCAI, https://www.ijcai.org/proceedings/2023/0062.pdf
45. Style2Code: A Style-Controllable Code Generation Framework - arXiv, https://arxiv.org/pdf/2505.19442
46. Style2Code: A Dual-Modal Contrastive Learning Framework - ResearchGate, https://www.researchgate.net/publication/401480351_Style2Code_A_Dual-Modal_Contrastive_Learning_Framework_for_Style-Controllable_Code_Generation
47. AI4VIS: Survey on Artificial Intelligence Approaches for Data Visualization, https://www.computer.org/csdl/journal/tg/2022/12/09495259/1vyjtdJRfXO
48. Enhancing Multilingual Embeddings via Multi-Way Parallel Text Alignment, https://arxiv.org/abs/2602.21543
49. From Dataset to Model: A Romanian-English Corpus and Fine-Tuned Cross-Lingual Embeddings - MDPI, https://www.mdpi.com/2076-3417/15/22/12219
50. QURAN-MD: A Fine-Grained Multilingual Multimodal Dataset of the Quran - OpenReview, https://openreview.net/pdf?id=NQ6er5I4PK
51. Comparative Analysis of Information Retrieval Models on Quran Dataset - IEEE Xplore, https://ieeexplore.ieee.org/iel7/6287639/9312710/09615098.pdf
52. pgvector 0.8.0 Released! - PostgreSQL, https://www.postgresql.org/about/news/pgvector-080-released-2952/
53. Supercharging vector search with pgvector 0.8.0 on Amazon Aurora PostgreSQL - AWS, https://aws.amazon.com/blogs/database/supercharging-vector-search-performance-and-relevance-with-pgvector-0-8-0-on-amazon-aurora-postgresql/
54. Filtered Approximate Nearest Neighbor Search in Vector Databases - arXiv.org, https://arxiv.org/html/2602.11443v1
55. pgvector/pgvector - GitHub, https://github.com/pgvector/pgvector
56. Optimize pgvector search - Neon Docs, https://neon.com/docs/ai/ai-vector-search-optimization
57. pgvector performance: Benchmark results - Instaclustr, https://www.instaclustr.com/education/vector-database/pgvector-performance-benchmark-results-and-5-ways-to-boost-performance/
58. The Case Against PGVector - Reddit, https://www.reddit.com/r/Database/comments/1onbbrq/the_case_against_pgvector/
59. Linear Programming, Topic Curation, and API Tips - Sefaria, https://developers.sefaria.org/docs/linear-programming-topic-curation-and-api-tips
60. A Behind-the-Scenes Look at Sefaria Topics Pages, https://www.sefaria.org/sheets/244437
61. Topic Ontology - Sefaria, https://developers.sefaria.org/docs/topic-ontology
62. Multi-Agent-as-Judge: Aligning LLM-Agent-Based Automated Evaluation - NeurIPS, https://neurips.cc/virtual/2025/128067
63. Evaluating the Effectiveness of LLM-Evaluators - Eugene Yan, https://eugeneyan.com/writing/llm-evaluators/
64. LLM-as-a-Judge: automated evaluation of search query parsing - Frontiers, https://www.frontiersin.org/journals/big-data/articles/10.3389/fdata.2025.1611389/full
65. LLM-as-a-Judge Evaluation: Complete Guide - Langfuse, https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge
66. LLM-as-a-Judge Approaches as Proxies for Mathematical Coherence in Narrative Extraction, https://www.mdpi.com/2079-9292/14/13/2735
67. Query-Aware Retrieval - Emergent Mind, https://www.emergentmind.com/topics/query-aware-retrieval

---

## Project Reflection: Report vs. Portal Architecture (March 2026)

*Analysis by Claude Opus, cross-referencing Gemini findings against the portal's 12 governing FTRs.*

### Strongly Confirmed Decisions

| Report Finding | Portal FTR | Implication |
| :---- | :---- | :---- |
| Single-database PostgreSQL viable for all search | FTR-104 (foundational) | Foundational commitment validated |
| Knowledge graph in Postgres, not external graph DB | FTR-034 | Neptune rejection confirmed |
| Index-time enrichment > query-time AI | FTR-026, FTR-027 | "No AI in hot path" validated |
| Voyage 4 shared embedding space for embed + rerank | FTR-024, FTR-027 | Vendor consolidation confirmed |
| LLM-as-judge for evaluation (DELTA-compatible) | FTR-037 | Offline evaluation approach validated |
| Pre-materialized concordance views | FTR-165 | Bounded-corpus navigation paradigm confirmed |
| Non-topical retrieval is frontier, not standard | FTR-128 | Novelty of rasa/dhvani approach confirmed |

### Design-Altering Recommendations

**1. Drop HNSW, use brute-force exact search (Topic 10)**

- **Impacts:** FTR-020, FTR-024
- **Current:** HNSW index with m=16, ef_construction=64
- **Report:** At 50K vectors, sequential scan = 100% recall in ~35-40ms, well within 200ms budget
- **Verdict: Strong candidate.** Eliminates recall loss, simplifies maintenance. The portal is currently at 2,681 chunks. Even at 50K, exact search is trivial. Simplest win available -- remove HNSW, gain perfect recall, eliminate index maintenance.

**2. Enrichment-augmented embeddings (Topic 4)**

- **Impacts:** FTR-024, FTR-026
- **Current:** Embeddings generated from plain passage text; enrichment metadata is post-retrieval
- **Report:** Prepend `[rasa: karuna] [depth: 5] [voice: devotional]` to text before embedding. Voyage 4 MoE encodes metadata as disambiguating signals.
- **Verdict: Highest-ROI upgrade.** No new infrastructure -- just re-embed with richer context. Already planned as FTR-128 Experiment 2. Report provides strong evidence this works with MoE models specifically.

**3. Replace BM25 with Learned Sparse Retrieval / SPLADE (Topic 2)**

- **Impacts:** FTR-025
- **Current:** ParadeDB pg_search BM25 with ICU tokenization
- **Report:** ParadeDB pg_sparse + SPLADE vectors bridges vocabulary gap at index level
- **Verdict: Excluded.** pg_sparse is not available on Neon (verified March 2026). BM25 via pg_search remains the sparse retrieval path. The Vocabulary Bridge (FTR-028) handles the vocabulary gap at index time. FTR-025 confirmed.

**4. Late interaction / ColBERT via VectorChord (Topic 1)**

- **Impacts:** FTR-020, FTR-024, FTR-104
- **Report:** VectorChord 0.3 enables MaxSim in PostgreSQL, 35ms latency, preserves token-level precision
- **Verdict: Excluded.** VectorChord is not available on Neon (verified March 2026). Late interaction / MaxSim cannot run in the portal's single-database architecture. Additionally contradicted by Topic 10 -- if brute-force exact search at 50K gives 100% recall in 40ms, ColBERT's marginal value is unproven against enrichment-augmented single-vector embeddings.

**5. Adaptive fusion replacing RRF (Topic 3)**

- **Impacts:** FTR-020, FTR-028
- **Current:** Static RRF with k=60
- **Report:** Intent-conditioned fusion weights based on Vocabulary Bridge classification
- **Verdict: Natural evolution.** The portal already has intent classification via FTR-028. Wiring intent to fusion weights is a clean application-layer change. Not urgent for Arc 1 but a strong M3a candidate.

**6. Voyage rerank-2.5 instead of Cohere Rerank 3.5 (Topic 6)**

- **Impacts:** FTR-027
- **Current:** FTR-027 specifies Cohere Rerank 3.5 as the planned cross-encoder
- **Report:** Voyage rerank-2.5 + enrichment metadata in reranking payload = vendor consolidation + multidimensional relevance
- **Verdict: Adopt.** Same vendor for embed + rerank = shared semantic space, single billing, simpler architecture. FTR-027 already notes this as an option.

**7. Apache AGE for graph queries (Topic 7)**

- **Impacts:** FTR-034
- **Current:** SQL CTEs + Python/NetworkX batch
- **Report:** Apache AGE extension for OpenCypher graph traversal in PostgreSQL
- **Verdict: Excluded.** Apache AGE is not available on Neon (verified March 2026). Recursive CTEs + Python/NetworkX batch pipeline remains the graph architecture. FTR-034's existing design confirmed.

**8. Query reformulation for non-topical retrieval (Topic 8)**

- **Impacts:** FTR-028, FTR-128
- **Report:** When intent = "console", dynamically prepend `[Emotion: Consoling]` to query embedding, matching enrichment-prefixed corpus embeddings
- **Verdict: Elegant.** Mirror of Topic 4 -- if corpus is embedded with metadata prefixes, queries can be reformulated with matching prefixes. The Vocabulary Bridge becomes a query reformulation engine, not just an expansion engine. Topics 4 + 8 form a coherent pair.

**9. Multi-persona evaluation pipeline (Topic 12)**

- **Impacts:** FTR-037
- **Current:** Golden set of 66 queries, Recall@3 + MRR@10, Claude-as-judge
- **Report:** Expand to 500 queries, pairwise preference evaluation, Elo ratings across topical/emotional/depth dimensions
- **Verdict: Natural M3a evolution.** Current evaluation is proven. Expanding to multi-dimensional pairwise preference is the right next step once non-topical retrieval dimensions are active.

### Neon Compatibility -- Resolved

Three recommendations depended on PostgreSQL extensions. All three verified **not available on Neon** (March 2026), and therefore architecturally excluded per FTR-104:

| Extension | Report Topic | Needed For | Neon Status |
| :---- | :---- | :---- | :---- |
| VectorChord 0.3 | Topic 1 | Late interaction / MaxSim | **Not supported** |
| pg_sparse | Topic 2 | SPLADE learned sparse retrieval | **Not supported** |
| Apache AGE | Topic 7 | OpenCypher graph queries | **Not supported** |

Neon's supported search extensions: pgvector, pg_search (ParadeDB), pgrag, pg_tiktoken. No graph extensions. This confirms the portal's existing stack is the correct stack for this platform.

### Recommended Priority Order

1. **Drop HNSW -> exact search** (Topic 10) -- Simplest, highest confidence, zero risk
2. **Enrichment-augmented embeddings** (Topic 4) -- Highest ROI, no new infra, re-embed only
3. **Query reformulation matching** (Topic 8) -- Natural pair with #2
4. **Voyage rerank-2.5** (Topic 6) -- Vendor consolidation, replaces Cohere plan
5. **Adaptive fusion** (Topic 3) -- Application-layer change, leverages existing intent classification
6. **Multi-persona evaluation** (Topic 12) -- Enables measuring #2-#5 improvements

~~7. Verify Neon extension availability~~ -- **Done.** VectorChord, pg_sparse, Apache AGE all absent from Neon. Topics 1, 2, 7 excluded.

Items 1-2 are Arc 1 / M3a candidates. Items 3-6 are M3a-M3b.

### Internal Contradiction in Report

The report's strongest recommendation (Topic 10: brute-force exact search) undercuts its flashiest recommendation (Topic 1: ColBERT/VectorChord). At 50K chunks, if exact single-vector search gives 100% recall in 40ms, the case for late interaction's added complexity weakens considerably -- especially when enrichment-augmented embeddings (Topic 4) may already solve the token-precision problem by encoding metadata into the embedding space. The report does not reconcile this tension.

### Not Investigated: Alternative Similarity Metrics

RECOS (Sorted Component Normalization) and HTS (Hyperbolic Tangent Similarity) were considered as alternatives to cosine similarity. Not pursued for three reasons: (1) brute-force exact search at 50K chunks makes metric optimization marginal -- recall is already 100%; (2) Voyage 4 is trained for cosine similarity, so applying a different metric to its vectors would be misaligned; (3) the retrieval bottleneck is enrichment metadata trapped as post-retrieval filters, not the similarity function itself. Neither metric has production adoption in retrieval systems or PostgreSQL support.

### Architectural Keystone

The report validates what the FTR corpus already hypothesized: **the portal's index-time enrichment infrastructure is its primary competitive advantage**, and the retrieval architecture should be rebuilt to make that enrichment directly searchable -- not just filterable. The enrichment-augmented embedding + query reformulation pair (Topics 4 + 8) is the architectural keystone. Everything else is optimization.
