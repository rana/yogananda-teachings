# Beyond cosine similarity: frontier search architecture for sacred text retrieval

**At 50K chunks, the most impactful architectural moves are not the ones you'd expect.** The research across all 12 topics converges on a counterintuitive finding: for a bounded multilingual sacred text corpus of this scale, the highest-ROI investments are (1) metadata-enriched contextual embeddings costing under $100 total, (2) replacing RRF with query-adaptive convex combination fusion, and (3) a strong cross-encoder reranker—not exotic retrieval algorithms. Late interaction (ColBERT) and learned sparse retrieval (SPLADE) now have viable PostgreSQL paths, but their marginal gains over brute-force + reranker at 50K scale are modest. The truly novel opportunity lies in non-topical retrieval dimensions—rasa-space embeddings, register-driven fusion, and readiness-aware delivery—where no production system exists and the portal's rich metadata creates genuine architectural whitespace.

---

## TOPIC 1: Late interaction and multi-vector retrieval

### State of the art (March 2026)

The ColBERT family has matured significantly since ColBERTv2 (NAACL'22, arXiv:2112.01488). The current landscape includes several production-viable models:

**GTE-ModernColBERT-v1** (Alibaba/DAMO, 2025, trained via PyLate) holds the BEIR state-of-the-art among ColBERT models at 150M parameters. **Jina-ColBERT-v2** (arXiv:2408.16672, August 2024) covers **89 languages** with 8192-token context and Matryoshka embeddings at 128/96/64 dimensions—the strongest multilingual ColBERT model available. **LFM2-ColBERT-350M** (Liquid AI, October 2025) uses a novel LFM2 backbone with 32K context, outperforming GTE-ModernColBERT-v1 on multilingual NanoBEIR. For the portal's 10-language requirement including Hindi, Bengali, Japanese, and Thai, Jina-ColBERT-v2 is the clear first choice.

The tooling ecosystem has shifted from Stanford's original colbert-ai library to **PyLate** (LightOn, arXiv:2508.03555), built on the sentence-transformers framework and now the recommended library for new projects. RAGatouille (Answer.AI) remains the popular entry point but has migrated to PyLate as backend. A critical CPU optimization library, **maxsim-cpu** (Mixedbread, 2025), uses SIMD/libxsmm to reduce MaxSim overhead from 50–100ms to **~5ms** for 1,000 documents.

The pivotal research finding for sacred text retrieval: **ColBERT-BPIT achieved MRR@10 = 0.51 on English Qur'an retrieval** (arXiv:2312.02803), directly demonstrating late interaction's advantage for religious text. Token-level matching preserves rare terms like "dharma" and "moksha" as individual contextual vectors rather than compressing them into a single representation. BEIR benchmarks consistently show ColBERT variants outperforming dense models by **5–10 NDCG@10 points** in out-of-domain settings.

### PostgreSQL compatibility: VectorChord changes everything

**VectorChord 0.3** (TensorChord, 2025) is the first PostgreSQL extension with a **native MaxSim operator (`@#`)**. It stores document embeddings as `vector(dim)[]` arrays and supports IVF+RaBitQ indexing for MaxSim searches. Benchmarks show **NDCG@10 of 34.1 on FiQA (57K docs) with 35ms average query latency**—directly comparable to this portal's scale. WARP optimization delivers 18.7× speedup over unoptimized MaxSim.

pgvector itself (v0.8.2) does **not** natively support multi-vector MaxSim. ParadeDB offers no late interaction support. The architectural options are:

- **Option A (VectorChord)**: Store both single-vector and token-level arrays per chunk, use two-stage retrieval (dense ANN → MaxSim rerank). Requires verifying Neon extension support or self-hosting PostgreSQL.
- **Option B (Application-side)**: Store token embeddings in `vector(128)[]` array columns, retrieve top-100 via pgvector, compute MaxSim in Python using maxsim-cpu. At 50K scale, this adds only ~10–20ms.
- **Option C (External)**: Vespa offers the most mature ColBERT support with native compression and production deployment at cord19.vespa.ai (39ms end-to-end including query encoding).

### Storage and latency at 50K scale

| Method | Per-chunk | Total 50K | vs. single-vector |
|---|---|---|---|
| Single-vector 1024d float32 | 4 KB | 0.2 GB | 1× |
| ColBERT uncompressed 128d×128tok | 64 KB | 3.28 GB | 16× |
| ColBERTv2 2-bit residual | 4.5 KB | 230 MB | 1.1× |
| Jina-ColBERT-v2 64d float16 | 16 KB | 819 MB | 4× |

**At 50K scale, even uncompressed ColBERT storage (3.3 GB) is entirely manageable.** Two-stage retrieval (dense first-stage → ColBERT rerank of top-100) runs in **10–40ms total**. Brute-force MaxSim over all 50K chunks completes in ~35ms with VectorChord optimization.

### Specific recommendation

**Add ColBERT as a reranking layer, not a first-stage retriever.** Use Jina-ColBERT-v2 at 64-dim Matryoshka for storage efficiency. Store token embeddings alongside existing Voyage single-vectors. Compute MaxSim on top-100 candidates from existing dense+BM25 retrieval. This adds ~10–20ms latency and ~500MB–1GB storage while significantly improving retrieval for domain-specific vocabulary queries. **Production readiness: early-adopter.** Wait for VectorChord Neon compatibility confirmation before committing to PostgreSQL-native MaxSim.

### Comparable production systems

Vespa's cord19.vespa.ai (COVID research, ColBERT + BM25 hybrid, 39ms latency), Qdrant (native multivector with MAX_SIM), Weaviate (documented ColBERT/ColPali support), DataStax ColBERT Live! All are early-adopter maturity except Vespa which is mature.

---

## TOPIC 2: Learned sparse retrieval (SPLADE)

### State of the art

The SPLADE family from Naver Labs Europe has matured through five generations. The production workhorse remains **SPLADE++ cocondenser-ensembledistil** (SIGIR'22), achieving ~0.50 NDCG@10 on BEIR (vs. ~0.42 for BM25). **Echo-Mistral-SPLADE** (arXiv:2408.11119, 2024) uses a Mistral LLM backbone and claims BEIR SOTA for learned sparse models. Elastic's **ELSER v2** is the only fully production-deployed learned sparse model, available since Elasticsearch 8.11 with ~17% NDCG@10 improvement over BM25 across 12 datasets. Beyond the SPLADE family, other learned sparse approaches include DeepImpact, uniCOIL, TILDEv2, SparseEmbed (Google), and KALE.

The critical advantage for sacred text retrieval is **term expansion**: when "dharma" appears in a passage, SPLADE can activate semantically related terms like "duty," "righteousness," and "path," bridging the vocabulary gap between modern seekers and classical terminology. However, SPLADE's BERT WordPiece tokenizer (30,522 tokens) splits transliterated Sanskrit terms into meaningless subwords, weakening exact matching.

### PostgreSQL compatibility: confirmed viable

**pgvector v0.7.0+ supports sparse vectors natively** via the `sparsevec` type, handling up to 1,000 nonzero elements with HNSW indexing. ParadeDB created **pg_sparse**, a pgvector fork specifically for SPLADE vectors with dimension 30,522. Multiple GitHub repositories demonstrate working SPLADE + pgvector workflows on PostgreSQL 17. All three retrieval paths (Voyage dense + SPLADE sparse + ParadeDB BM25) can coexist in a single Neon PostgreSQL instance.

### Multilingual limitation

**No official multilingual SPLADE model exists.** All Naver models are English-only (bert-base-uncased). Training multilingual SPLADE is 4–8× more expensive due to mBERT/XLM-R vocabulary sizes (120K–250K tokens). **BGE-M3** (BAAI) is the practical alternative—it supports 100+ languages and produces both dense and sparse vectors simultaneously, covering Hindi, Bengali, Japanese, and Thai.

### Specific recommendation

**Add SPLADE as a third retrieval path; do not replace BM25.** BM25 remains irreplaceable for exact Sanskrit term matching ("Bhagavad Gita 2.47"). SPLADE fills the conceptual gap between BM25's lexical exactness and dense retrieval's semantic breadth. For multilingual coverage, use BGE-M3 for sparse+dense outputs across all 10 languages. Domain-adapt via MLM pre-training on the 50K-chunk corpus (hours on single GPU, ~$50–200 in compute). Fine-tuning with as few as 1K–10K query-passage pairs yields meaningful improvements. **Production readiness: early-adopter (English SPLADE), mature (BM25 alternative BGE-M3 sparse).**

---

## TOPIC 3: Hybrid fusion beyond RRF

### RRF's documented failure modes

RRF (Cormack et al., 2009) has specific weaknesses for sacred text retrieval. It is **score-blind**—a document scored 0.99 by dense retrieval and one scored 0.51 receive similar treatment at the same rank. For emotional or metaphorical queries like "my heart is an ocean of sorrow," BM25 matches "heart," "ocean," "sorrow" literally while dense retrieval captures the metaphorical intent, but RRF gives both paths equal voice. RRF's parameter k (typically 60) is **not truly parameter-free**; optimal k varies by domain, and sweeping k from 1–100 causes several-point swings in NDCG@1000. Benham et al. (ADCS 2017) showed a "reasonable number of queries" become ≥10% worse with RRF than a single BM25 baseline.

### Named fusion methods beyond RRF

**Convex Combination (CC)** (Bruch et al., 2022, arXiv:2210.11934) uses a single tunable parameter α and **consistently outperforms RRF** when any labeled data is available, achieving NDCG@1000 of 0.454 vs. 0.425 for RRF on MS MARCO. **Dynamic Alpha Tuning (DAT)** (Hsu et al., March 2025, arXiv:2503.23013) uses an LLM to evaluate top-1 candidates from each retriever and sets α per-query, achieving +2–7.5 percentage point gains on "hybrid-sensitive" queries. **Dynamic Weighted RRF** (Mala et al., February 2025, arXiv:2504.05324) uses query specificity (average tf·idf) to weight BM25 vs. semantic per-query, dramatically reducing hallucination in RAG. **Tensor-based Re-ranking Fusion (TRF)** (arXiv:2508.01405, 2025) uses ColBERT-style MaxSim for re-ranking after initial retrieval, significantly outperforming RRF.

### Query-adaptive fusion with register

Register-driven fusion weights are architecturally straightforward and map directly to the DAT and per-query strategy selection paradigms:

| Register | BM25 | SPLADE | Dense | Rationale |
|---|---|---|---|---|
| Philosophical | 0.30 | 0.35 | 0.35 | Balanced—needs both exact terms and concepts |
| Distressed | 0.10 | 0.20 | 0.70 | Emotional queries need semantic understanding |
| Devotional | 0.15 | 0.25 | 0.60 | Emotional resonance over lexical precision |
| Referential | 0.60 | 0.25 | 0.15 | Exact citations need BM25 |

### Specific recommendation

**Replace RRF with Convex Combination immediately** (α=0.5 as starting point, tune with 66 golden queries). Implement simple query-type heuristics (regex for references, question words, query length) to adjust α dynamically. For 3-path fusion (BM25 + SPLADE + Dense), use weighted RRF with per-path weights driven by register classification. At 50K corpus size, running 3–4 parallel retrievals adds negligible latency. **Production readiness: mature (CC), early-adopter (DAT/dynamic fusion).**

### Comparable production systems

Elasticsearch (RRF + linear combination + ELSER since 8.9), Weaviate (tunable alpha hybrid), Qdrant (Distribution-Based Score Fusion), Redis 8.4 (FT.HYBRID command), Azure AI Search (RRF + semantic reranking).

---

## TOPIC 4: Contextual and enrichment-augmented embeddings

### State of the art

**Anthropic's Contextual Retrieval** (September 2024) established the foundational technique: use an LLM to prepend a 50–100 token contextual explanation to each chunk before embedding. Results: **35% reduction** in top-20 retrieval failure rate for contextual embeddings alone, **67% reduction** when combined with contextual BM25 and reranking. Cost with Claude prompt caching: ~$1.02/million document tokens.

A January 2025 paper, "Utilizing Metadata for Better Retrieval-Augmented Generation" (arXiv:2601.11863), provides **direct evidence that structured metadata prefix embedding works**. Tested on SEC 10-K filings (structurally repetitive documents analogous to sacred texts with shared vocabulary), prefixing and unified embeddings **consistently outperformed plain-text baselines** across multiple retrieval metrics. A second paper (arXiv:2510.24402, October 2025) confirmed: "The most significant performance gains come from embedding chunk metadata directly with text."

### Voyage voyage-4-large and voyage-context-3

**Voyage voyage-4-large** (released January 15, 2026) is the first production Mixture-of-Experts embedding model. It ranks **#1 on RTEB**, surpassing Gemini by 3.87%, Cohere Embed v4 by 8.20%, and OpenAI v3 Large by 14.05%. Specs: 32K context, 1024 default dimensions (Matryoshka 256/512/1024/2048), quantization options (float32/int8/binary), **$0.12/MTok** with 33% batch discount. All Voyage 4 models share a compatible embedding space—index with voyage-4-large, query with voyage-4-lite for cost savings.

**Voyage-context-3** (released July 23, 2025) is a dedicated contextualized chunk embedding model. It captures document context automatically without manual metadata augmentation, outperforming Anthropic's contextual retrieval by **+6.76%** and Jina late chunking by **+23.66%**. However, it captures *document-level context*, not the domain-specific metadata (rasa, dhvani, experiential depth) unique to this portal.

### Multi-faceted embedding: the key architectural innovation

Several named approaches support embedding the same passage multiple times with different metadata emphasis:

**Multi-Head RAG (MRAG)** (Besta et al., 2024, arXiv:2406.05085) leverages multiple transformer attention heads to produce several key vectors, boosting relevance by **up to 20%**. **lib2vec** (ACM 2021) splits text semantically by domain-specific facets (plot, setting, atmosphere, style) and constructs pseudo-documents per facet—**directly applicable** to rasa, dhvani, and depth facets. **QuOTE** (Neeser et al., 2025, arXiv:2502.10976) generates hypothetical questions per chunk at index time, bridging the query-document vocabulary gap. **Superlinked** offers a production framework for multi-faceted embedding with weighted dimensional spaces.

### Recommended architecture for the portal

**Tier 1 (best ROI)**: Generate LLM contextual enrichment per chunk incorporating all 14 metadata fields in natural language format:
> "This passage is from [source text], [tradition] tradition. It expresses [rasa] rasa with [dhvani] resonance at experiential depth [depth]/7. The voice is [voice register]. [passage text]"

Embed with voyage-4-large at $0.12/MTok. **Total one-time cost: ~$54** ($4 embedding + ~$50 LLM enrichment for 50K chunks using Claude Haiku with caching).

**Tier 2 (multi-faceted)**: Create two embedding facets per chunk—topical/contextual (tradition, source, topic emphasis) and experiential/emotional (rasa, dhvani, depth, emotional quality emphasis). Route queries using LLM classification or keyword detection. **Additional cost: ~$4.**

**Tier 3 (vocabulary bridge via HyPE)**: Generate 3 hypothetical questions per chunk in relevant languages at index time, embed as supplementary vectors. Bridges modern query language ("how to deal with suffering") to classical vocabulary ("cessation of dukkha through the noble eightfold path"). **Additional cost: ~$30** ($10–15 LLM generation + ~$18 embedding for 150K additional vectors).

**Production readiness: mature (contextual retrieval), early-adopter (multi-faceted embedding), mature (HyPE).**

---

## TOPIC 5: Domain-adapted embedding models

### Fine-tuning landscape

The embedding fine-tuning ecosystem is rich and accessible. **Qwen3-Embedding-8B** (Alibaba) ranks **#1 on MMTEB** (70.58) with 100+ languages and user-defined instructions. **NVIDIA llama-embed-nemotron-8b** achieved 69.46 on MMTEB (SOTA as of October 2025). Open-source fine-tuning via **Sentence Transformers v3** supports 20+ loss functions with any HuggingFace model. Voyage offers custom fine-tuning through enterprise subscriptions. Google Vertex AI reports **up to 41% quality gains** from supervised tuning.

### 50K chunks is more than sufficient

Google Vertex AI requires a minimum of only **9 queries and 9 documents**. Phil Schmid (HuggingFace) demonstrated **+7.4% NDCG@10 with just 6,300 training samples** in 3 minutes on a consumer GPU. LlamaIndex showed measurable improvement with just **23 synthetic training samples**. The portal's 50K chunks provide ample corpus; the 66 golden queries serve strictly as evaluation data while synthetic training data generated by LLMs (5–10 questions per chunk → 250K–500K training pairs) provides the training signal.

### Instruction-tuned embeddings as zero-shot alternative

**E5-Mistral-7B-instruct**, **GTE-Qwen2-7B-instruct**, and **Qwen3-Embedding** all support user-defined query instructions that can partially substitute for fine-tuning. For sacred text retrieval, different instructions for different query types (e.g., "Retrieve passages expressing compassionate devotional mood" vs. "Retrieve philosophical explanations of this concept") enable zero-shot adaptation. Instructions provide **zero-shot 5–10% improvement**; fine-tuning adds another **5–15% on top**.

### Specific recommendation

**Start with instruction-tuned Qwen3-Embedding or voyage-4-large with metadata-enriched passages (Topic 4 approach). Fine-tune only if evaluation shows persistent gaps.** If fine-tuning, use the recipe: (1) generate 5 synthetic questions per chunk via Claude → 250K training pairs, (2) mine hard negatives from top-50 nearest non-relevant chunks per query, (3) fine-tune BGE-M3 or Qwen3-Embedding-0.6B with MNR loss + Sentence Transformers. Total compute cost: **<$10, training time <1 hour** on single GPU. For multilingual fine-tuning, include cross-lingual pairs from the 18,540 known translation alignments and general multilingual data (10–20% of training mix) to prevent catastrophic forgetting. No named "sacred text embedding" fine-tuning project exists, but domain adaptation on Early Modern English (arXiv:1904.02817) and Sefaria's BEREL model for Rabbinic Hebrew confirm the approach works for specialized literary/religious text. **Production readiness: mature.**

---

## TOPIC 6: Cross-encoder and LLM-based reranking

### 2026 reranker landscape

The reranker field has consolidated around several tiers. **Zerank-1** (ZeroEntropy, 4B params) holds the highest ELO on the Agentset benchmark. **Voyage rerank-2.5** ($0.05/MTok) offers the best speed/quality balance for production API use. **Contextual AI Reranker v2** (1B/2B/6B, open-sourced, March 2025) is the **first instruction-following reranker**, supporting instructions like "Prioritize devotional passages over philosophical analysis"—directly enabling register-aware reranking. **Cohere Rerank 3.5** ($2.00/1K searches) and **BGE-reranker-v2-m3** (278M params, Apache 2.0, self-hostable) round out the top tier.

A critical benchmark finding: **gte-reranker-modernbert-base at 149M parameters matches nemotron-rerank-1b at 1.2B parameters** (AIMultiple benchmark on 145K Amazon reviews). Model size does not determine reranker quality.

### LLM-as-reranker: not cost-justified

Cross-encoder rerankers deliver **95% of LLM reranking accuracy at 3× faster speed and 10–50× lower cost**. The EMNLP Findings 2025 paper "How Good are LLM-based Rerankers?" found listwise LLM reranking (RankGPT-style) generalizes best but at ~$5–10/1K queries vs. ~$0.50/1K for Voyage rerank-2.5. LLM reranking makes sense only for offline batch processing or final top-5 refinement where cross-document reasoning matters.

### Multilingual non-Latin script performance

For Hindi, Bengali, Japanese, and Thai: **Cohere Rerank 3.5** and **BGE-reranker-v2-m3** are verified across 100+ languages including non-Latin scripts. Cross-lingual reranking (query in one language, document in another) shows 3–7% degradation vs. monolingual; models trained with cross-lingual objectives (mGTE, BGE-M3) handle this better. **Qwen3-Reranker** (0.6B/4B/8B, Apache 2.0) built on the CJK-strong Qwen3 architecture is a strong option for the portal's Asian language requirements.

### Specific recommendation

**Add Voyage rerank-2.5 immediately** as a reranking layer on top-50 candidates. Expected cost: **~$50–200/month** at moderate query volume. For register-aware reranking, use **Contextual AI Reranker v2** with instructions conditioned on detected query register ("Prioritize contemplative passages at depth 5+" for devotional queries). For the portal's Opus classifications (rasa, depth, register), inject these as additional context in the reranker input: `"[query register: devotional] [preferred rasa: karuna] Query: {query} Passage: {passage}"`. The "retriever sets the ceiling" principle still holds—**no reranker pushed Hit@10 above 88%** in benchmarks because missing documents never appear in candidates. **Production readiness: mature.**

---

## TOPIC 7: Knowledge-graph-enhanced retrieval

### State of the art

**LazyGraphRAG** (Microsoft Research, June 2025) is the breakthrough for cost-sensitive projects. It eliminates upfront LLM summarization by using NLP noun phrase extraction for concepts, reducing indexing cost to **0.1% of full GraphRAG** (1,000× reduction). It outperforms vector RAG, RAPTOR, and GraphRAG DRIFT on local queries at comparable query cost, and matches GraphRAG Global Search quality at **700× lower query cost**. Now integrated into the GraphRAG library on GitHub.

**GFM-RAG** (Luo et al., NeurIPS 2025, ICLR 2026) is the **first graph foundation model for RAG**—8M parameters pre-trained on 60 knowledge graphs with 14M+ triples, achieving zero-shot capability on unseen datasets. This eliminates the minimum graph size problem for the portal's ~500 entities.

**GRIT** (Kulkarni et al., WWW 2025) provides the key architectural pattern: build an entity-entity similarity graph, use graph neighbors to expand retrieval candidates, achieving **up to 6.3% recall improvement** on top of BM25/dense retrieval.

### PostgreSQL-native graph retrieval

**Apache AGE is not currently supported on Neon.** However, PostgreSQL's `WITH RECURSIVE` CTEs are fully supported and sufficient for ~500 entities. The recommended pattern is **pre-computed materialized views** of graph-derived retrieval candidates:

```sql
CREATE MATERIALIZED VIEW graph_candidates AS
WITH RECURSIVE entity_neighbors AS (...)
SELECT seed_entity, array_agg(DISTINCT chunk_id) as candidate_chunks
FROM entity_neighbors JOIN entity_chunks ...
GROUP BY seed_entity;
```

This gives **O(1) lookup** of graph-expanded candidates at query time. For hierarchical relationships (lineages, progressions), PostgreSQL's `ltree` extension provides materialized path queries with GiST indexing—Neon-compatible.

### Specific recommendation

**Phase 1**: Curate a domain ontology with ~500 entities and typed relationships (TEACHES, COMMENTS_ON, EQUIVALENT_TO, PRECEDES, BELONGS_TO_TRADITION). Build in PostgreSQL relational tables with recursive CTEs. Pre-compute graph candidates as materialized views. Add graph expansion as a third/fourth retrieval path in fusion.

**Phase 2**: Run LazyGraphRAG on the corpus for global thematic query capability—near-zero indexing cost. Test GFM-RAG's pre-trained model for zero-shot multi-hop retrieval.

At ~500 entities, **curated graph structure massively outperforms automated extraction**. Semi-automatic with LLM + human review is optimal. Do not train custom GNNs (too small, will overfit). Do not add Neo4j (PostgreSQL CTEs suffice at this scale). **Production readiness: mature (PostgreSQL CTEs + materialized views), early-adopter (LazyGraphRAG), experimental (GFM-RAG).**

### Comparable production systems

Sefaria's interlinked text network (1.5M interconnections, 775K monthly users) is the closest analogy—a manually curated knowledge graph with typed edges (commentary, quotation, reference) that dramatically improves discovery. MITRA/Dharmamitra (Buddhist texts) uses graph + vector operations on "dharmic embeddings." Dharma Drum Buddhist College created the largest classical Chinese corpus with TEI structural/semantic markup linking entities.

---

## TOPIC 8: Retrieval by non-topical dimensions

### The genuine research gap

**No existing sacred text search system implements non-topical retrieval dimensions.** Sefaria, SuttaCentral, vedabase.io, 84000, Quran.com—all use primarily topical/keyword search with structural navigation. The proposed portal would be first-of-its-kind in searching by emotion, aesthetic quality, or contemplative depth.

### Emotion-based retrieval: what exists

Research on affective information retrieval exists but is scattered. **EmoSense-Rec** (2025) models dynamic affective states with a "contextual emotion-attention layer." **EARS** (Leung et al., 2023, arXiv:2305.04796) uses GPT to detect affective features, eliminating need for emotion-tagged datasets. **Emotion-Aware Embedding Fusion** (MDPI 2025) uses FAISS for retrieval of emotion-aware embeddings from psychotherapy transcripts. The PO-EMO dataset (Haider et al., LREC 2020) annotates aesthetic emotions in poetry—the closest Western analog to rasa-based text annotation. However, **no production system applies the music recommendation dimensional paradigm to sacred text retrieval.**

### Spotify's architecture as the template

Spotify's dimensional model (valence, energy, danceability, acousticness, tempo, speechiness) maps directly to sacred text dimensions:

| Spotify dimension | Sacred text analog | Implementation |
|---|---|---|
| Valence (0–1) | Rasa (karuna→shanta spectrum) | Continuous emotional quality score |
| Energy | Experiential intensity | Depth scale 1–7 |
| Acousticness | Voice register | philosophical/devotional/instructional |
| Tempo | Contemplative pacing | Passage density and complexity |

Spotify's **Text2Tracks** (April 2025) generates track IDs directly from natural language prompts using Semantic IDs built on collaborative filtering embeddings—a **22% improvement** from multi-task training. This pattern could be adapted as "Text2Teachings": a fine-tuned model generating passage Semantic IDs from spiritual queries.

### Building rasa-space embeddings

No model produces "rasa-space embeddings" directly, but the path is clear through disentangled representation learning. **FDMER** (ACM Multimedia 2022) learns common and private feature representations for each modality via modality-specific subspaces. **EDRL-MEA** (arXiv:2510.09072, 2025) extracts class-specific emotional features while preserving shared structures. **SLiCS** (arXiv:2508.20322, 2025) disentangles CLIP embeddings into component vectors for concept-filtered retrieval, achieving **mAP@20 increases of 0.21–0.23**. For computational rasa classification, **Navarasa Sentiment Prediction using mBERT** (IJARCCE 2025) fine-tunes multilingual BERT for classifying text into nine navarasa categories.

The implementation recipe: (1) annotate corpus with primary/secondary rasa scores (LLM-assisted + human review), (2) fine-tune an embedding model with contrastive loss where rasa-similar passages cluster regardless of topic, (3) validate via UMAP projection that clusters form by rasa rather than topic, (4) create separate HNSW indexes for topical and rasa embedding spaces.

### Structured metadata as retrieval filters

At 50K scale, **all metadata filtering approaches work comfortably**. pgvector 0.8.0's iterative index scans solve the over-filtering problem. The recommended pattern combines hard filters (language, tradition) with soft score modifiers: `final_score = α × vector_similarity + β × depth_bonus + γ × rasa_match_score`. **VectorChord 0.4** introduces true pre-filtering support with 3× faster search vs. post-filtering.

### Specific recommendation

**Build a multi-index retrieval system** with separate HNSW indexes for topical embeddings and rasa/experiential embeddings. Store rasa, depth, register, and tradition as structured PostgreSQL columns alongside vectors. Implement a query intent classifier that routes queries to the appropriate retrieval strategy and weights: emotional queries → rasa embedding space + dense-dominant fusion; philosophical queries → topical space + balanced fusion; referential queries → BM25-dominant. For state-sensitive retrieval, allow users to self-declare emotional context or infer from query classification, adjusting which embedding space and filters to prioritize.

**This is the portal's unique architectural opportunity.** No comparable system exists. The 14 metadata fields per passage are the raw material for a search experience that transcends topical retrieval. **Production readiness: research/prototype (rasa-space embeddings), production-ready (metadata filtering), early-adopter (query-adaptive routing).**

---

## TOPIC 9: Cross-lingual retrieval

### The MITRA project: closest parallel

**MITRA** (Nehrdich et al., arXiv:2601.06400, January 2026) built a pipeline for multilingual parallel passage mining across Buddhist texts in Pāli, Sanskrit, Chinese, and Tibetan. It created **1.74 million parallel sentence pairs** and fine-tuned **Gemma 2 MITRA-E** as a domain-specific embedding model using contrastive loss with task-specific prompts, augmented with Gemini 2.0 Flash synthetic data. This is essentially what the portal should build.

### Leveraging 18,540 translation-pair alignments

The portal's translation pairs are its cross-lingual secret weapon. The optimal use: **contrastive fine-tuning** of a multilingual embedding model using translation pairs as positive examples with InfoNCE loss and in-batch negatives + mined hard negatives. A July 2025 study (Amiraz et al.) showed that even a simple **equal-retrieval policy**—forcing half of top-K passages from each language subcorpus—increases cross-lingual Hits@20 from 46% to **65% (+19 points)** for E5 models.

Additional uses for the translation pairs: cross-lingual data augmentation for embedding fine-tuning, synthetic query generation in multiple languages per pair, and a "translation expansion" index where retrieving chunk C automatically surfaces its known translations.

### Sanskrit terminology: transliteration normalization is critical

Sanskrit appears in multiple representations (Devanagari धर्म, IAST dharma, Harvard-Kyoto dharma, ITRANS dharma, simplified romanization) that map to **different regions** of most embedding spaces. The **Vedabase.io** approach is the gold standard: auto-detect transliteration system, normalize to IAST internally, then search. The **Aksharamukha** tool handles 19+ scripts. Build a domain-specific multilingual glossary mapping dharma ↔ धर्म ↔ ダルマ ↔ ธรรม for query-time expansion.

### Non-Latin script failure modes

MIRACL benchmark data confirms: Hindi, Thai, and Swahili are the most challenging languages due to under-representation in mBERT pretraining. **BM25–mDPR hybrid provides the strongest zero-shot baseline** across all MIRACL languages, outperforming individual models on average nDCG@10. For short queries (<3 tokens) in non-Latin scripts, embedding-based retrieval is unreliable—fall back to BM25 with language-specific tokenization. Japanese requires proper segmentation (MeCab/SudachiPy); Thai lacks word boundaries requiring specialized tokenizers; Bengali performs lower than high-resource languages.

### Specific recommendation

**Phase 1**: Use Voyage voyage-4-large (strong multilingual) with ICU tokenization in ParadeDB for BM25. Tag every chunk with language metadata. Use partial HNSW indexes per language for filtered queries.

**Phase 2**: Contrastive fine-tune a multilingual model (BGE-M3 or multilingual-e5-large-instruct) using the 18,540 translation pairs. Follow the MITRA recipe: contrastive loss with task-specific prompts + synthetic data augmentation.

**Phase 3**: Implement transliteration normalization (Aksharamukha), domain-specific multilingual glossary for query expansion, and equal-retrieval policy across languages. **Production readiness: mature (multilingual embeddings), early-adopter (contrastive fine-tuning on parallel pairs).**

---

## TOPIC 10: PostgreSQL-native search infrastructure

### pgvector 0.8.2 (released February 25, 2026)

Key capabilities: **iterative index scans** (0.8.0) solving the filtered query problem; **halfvec** for 50% storage/performance improvement with minimal recall loss; **sparsevec** supporting up to 1,000 nonzero elements with HNSW indexing (enabling SPLADE); **binary quantization** via `binary_quantize()` function (32× reduction but poor recall for ≤1536-dim—not recommended for 1024-dim Voyage vectors); L1/Hamming/Jaccard distances; parallel index builds. Product quantization is **not supported**.

### ParadeDB pg_search v0.22.0 (released March 16, 2026)

Built on Tantivy (Rust-based Lucene alternative) with BM25 scoring, real-time index updates, faceted search, and **10× improved write throughput**. The ICU tokenizer handles all 10 portal languages including Hindi, Bengali, Japanese, and Thai via Unicode text segmentation. Lindera provides optimized Japanese tokenization with ipadic dictionary. No native SPLADE support—use pgvector's sparsevec alongside pg_search's BM25.

### Brute-force feasibility: confirmed

**50K × 1024-dim vectors occupy ~195 MB** (float32) or ~98 MB (halfvec)—fitting comfortably in memory on even Neon's smallest compute. Estimated brute-force sequential scan latency: **~50–150ms** (warm cache, 4 vCPU). With parallel seq scan workers: **~30–80ms**. HNSW delivers **~1–6ms** queries. At this scale, **HNSW is recommended for consistent low-latency but brute-force is entirely viable** for testing, batch operations, or when exact recall is needed.

### Optimal metadata filtering strategy

**Partial HNSW indexes per language** is the optimal strategy for the 10-language corpus. With ~5K vectors per language, each partial index is tiny and provides excellent recall:

```sql
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) 
  WHERE language = 'en';
```

Combined with pgvector 0.8.0's iterative scans and B-tree indexes on filter columns (rasa, depth, register), this enables efficient filtered vector search. Table partitioning by language is an alternative that routes filtered queries automatically.

### Specific recommendation

Use pgvector HNSW with **halfvec(1024) expression indexes** for 50% index size reduction with near-identical recall. Store full-precision vectors in the table, index on cast halfvec. Use ParadeDB pg_search with ICU tokenizer for multilingual BM25. Create partial HNSW indexes per language. Enable iterative scans for filtered queries. Neon supports both pgvector 0.8.x and pg_search. Columnar storage is **not applicable** to vector search workloads. **Production readiness: mature.**

---

## TOPIC 11: Exploratory search and discovery

### Generous interfaces: the design paradigm

**Mitchell Whitelaw's "generous interfaces"** concept (Digital Humanities Quarterly, 2015) argues that "search is ungenerous: it withholds information, and demands a query." Generous interfaces show the whole collection, provide multiple entry points, enable exploration without queries, and reveal internal structure. Developed for digital cultural collections at comparable scales (National Gallery of Australia ~40K works), this paradigm maps directly to the sacred text portal.

The ACM SIGIR CHIIR 2025 paper presents **five design principles for exploratory search interfaces** with heuristic evaluation frameworks—the most current systematic approach. Marchionini's taxonomy (2006) distinguishes Lookup, Learn, and Investigate tasks; most sacred text engagement is Learn/Investigate (exploratory), but traditional search optimizes for Lookup.

### Visual navigation via semantic maps

**Nomic Atlas** (atlas.nomic.ai) is the primary recommendation for visual corpus navigation. It handles datasets from hundreds to tens of millions of points with automatic topic modeling, hierarchical topic depth, semantic search within the map, and filtering by metadata. For datasets under 50K points, it uses UMAP; the portal falls right at this boundary. An "Atlas of Sacred Texts" where 50K chunks appear as a 2D map colored by tradition/rasa/depth, with hierarchical topic labels, would enable genuine serendipitous discovery.

### Sacred text platform discovery patterns

**Sefaria** provides the richest model: Topics feature (5,000+ thematic pages), cross-reference navigation (1.5M interconnections), user-created source sheets (100K+), learning schedules (daily Talmud, weekly Torah portion), and visualization of intertextual relationships. **SuttaCentral** offers parallel text identification across Pāli, Chinese, and Tibetan canons with side-by-side bilingual display. Key patterns: commentary chains, structured reading journeys, topic-based entry, parallel text display, cross-reference networks.

### Specific recommendation

Design a **navigation-first architecture** with search as a secondary path. Build: (1) generous homepage showing collection overview by tradition/theme/rasa, (2) multi-axis faceted navigation including non-standard facets (rasa, depth, register), (3) Nomic Atlas-style semantic map for visual exploration, (4) Sefaria-style cross-reference side panel, (5) curated reading journeys by theme with cross-tradition comparisons, (6) conversational discovery interface that asks clarifying questions and suggests facets without generating content. **Production readiness: mature (faceted browsing), early-adopter (semantic maps), mature (curated journeys).**

---

## TOPIC 12: Search quality evaluation

### Multi-dimensional relevance

Saracevic's foundational framework identifies five relevance dimensions: algorithmic, topical, cognitive, situational, and **affective** (emotional satisfaction). For sacred texts, evaluation must cover: topical relevance, rasa-appropriateness, depth alignment, register match, cross-tradition insight value, and textual authority. The "Criteria-Based LLM Relevance Judgments" approach (Farzi, 2025) scores Exactness, Coverage, Topicality, and Contextual Fit independently and aggregates. A recent systematic review (Peikos et al., 2024, WIREs) confirmed that "topicality and novelty are the foremost factors" with understandability as next priority.

### LLM-as-judge: ARES over RAGAS

**ARES** (Stanford, Saad-Falcon et al., 2023) generates tailored LLM judges for each RAG component, uses fine-tuned DeBERTa judges, and provides **confidence intervals via Prediction-Powered Inference** from only ~150 annotated datapoints. It outperforms RAGAS (Kendall's τ 0.065–0.132 higher) and supports offline execution via vLLM for privacy. GPT-4 achieves **~80% agreement with human evaluators**, matching human-to-human consistency.

### A/B testing without behavioral tracking

The zero-tracking constraint eliminates standard click-through metrics. Alternatives: **Recall-Paired Preference (RPP)** (Google Research, 2022) simulates user subpopulations per query and compares ranked lists directly without behavioral data. **Rated Ranking Evaluator (RRE)** (Sease) provides open-source offline evaluation with version-over-version quality tracking. Expert evaluation panels using comparative judgment (system A vs. B outputs, blinded) and anonymous aggregate satisfaction signals ("Did you find what you were looking for?" without user identifiers) complete the picture.

### Discovery evaluation: beyond precision/recall

For exploratory interfaces, measure **diversity** (Intra-List Diversity across traditions), **novelty** (inverse-frequency within corpus), **serendipity** (relevance × unexpectedness—does it surface relevant passages from unexpected traditions?), and **coverage** (fraction of the 50K chunks ever surfaced). LLM-based serendipity evaluation using multi-LLM ensembles with Likert-scale judgments is an emerging 2025 approach.

### Specific recommendation

Build a four-layer evaluation framework: (1) automated MTEB/BEIR benchmarks + custom 200+ query retrieval benchmark, (2) multi-dimensional LLM judges via ARES calibrated against expert judgments on rasa-match/depth-match/register-match, (3) periodic expert evaluation panels from each tradition, (4) RPP for metric-free system comparison + anonymous aggregate satisfaction signals. **Production readiness: mature (offline evaluation), early-adopter (LLM-as-judge for multi-dimensional relevance).**

---

## Meta-questions: the architecture that emerges

### At 50K chunks, brute-force + reranker may be all you need

The most provocative finding across all 12 topics: **at 50K scale, exact brute-force search (~50–150ms) + a strong cross-encoder reranker achieves recall and ranking quality that complex multi-path retrieval cannot meaningfully exceed.** The math is unambiguous: 50K dot products complete in single-digit milliseconds on modern CPUs. ANN indexes introduce accuracy loss (90–99% recall) that is unnecessary at this scale. The Infinity DB benchmarks showed ColBERT as reranker consistently matched ColBERT as first-stage retriever with vastly simpler infrastructure.

The recommended pipeline: brute-force exact search (top-200 candidates) → cross-encoder reranker (top-10) → metadata score adjustment. This two-stage pipeline matches or beats complex multi-path retrieval at this scale for **topical queries**. The case for additional sophistication rests on **non-topical retrieval dimensions** (rasa, depth, register) where brute-force cosine similarity in a single embedding space genuinely cannot capture the retrieval intent.

### Generative retrieval: not yet

DSI (Tay et al., NeurIPS 2022) and its successors (NCI, DSI-QG, SE-DSI, MERGE) are theoretically attractive for a bounded corpus where all documents are known. A September 2025 survey (Zhang et al., arXiv:2509.22116) found that "despite its theoretical advantages, GR does not universally outperform DR in practice." Only Alipay (LLMGR, SIGIR 2024) has reported production use. The training pipeline complexity far exceeds the benefit over brute-force + reranker at 50K scale. **Not recommended. Production readiness: experimental.**

### Pre-computed results: the 80% solution

For a bounded corpus with predictable query patterns, **80–90% of queries likely map to pre-computable patterns**. Build: theme-passage matrices (top-50 passages for ~500 core themes), entity concordances (passage lists for every named entity/concept), cross-reference tables (top-20 similar passages per chunk = 1M entries from the 50K × 50K matrix), and query-cluster caches. PostgreSQL materialized views are the natural implementation. The remaining 10–20% of novel queries fall through to live retrieval. **This is especially powerful combined with the navigation-first architecture.**

### Navigation may be superior to search

Father Roberto Busa's 1946 Index Thomisticus—literally a sacred text concordance project—established that concordance/navigation tools are the primary mode of scholarly text engagement. For bounded sacred texts, the portal's 14 metadata fields per passage are the skeleton of a four-dimensional concordance (lexical, thematic, structural, relational) that can be entirely pre-computed. Most sacred text engagement is exploratory (Learn/Investigate), but traditional search systems optimize for known-item retrieval (Lookup). A navigation-first architecture with search as fallback may serve seekers better than search-first with navigation as supplement.

### Readiness-aware delivery: deep contemplative tradition roots

Progressive disclosure is fundamental to virtually all wisdom traditions. The Qabbalistic tradition explicitly teaches layered meanings accessible only with sufficient preparation. Buddhist pedagogy organizes teachings as sila → samadhi → paññā. This maps directly to Vygotsky's Zone of Proximal Development and scaffolding theory from education research. The portal's experiential depth (1–7) scale is a ready-made readiness indicator. Implementation: allow users to self-declare familiarity level, surface foundational passages first, and progressively reveal deeper teachings as engagement deepens.

---

## The integrated architecture

The research converges on a layered architecture ordered by impact and implementation complexity:

**Layer 0 (navigation-first foundation)**: Pre-computed concordances, materialized graph candidates, theme-passage matrices, entity concordances. Generous interface homepage. Faceted browsing on all 14 metadata dimensions. Nomic Atlas semantic map. Zero search required for ~50% of interactions.

**Layer 1 (core search, immediate)**: Voyage voyage-4-large embeddings with metadata-enriched contextual prefixes. ParadeDB BM25 with ICU multilingual tokenizer. Convex combination fusion (replacing RRF) with query-adaptive α based on register classification. Voyage rerank-2.5 on top-50 candidates. Partial HNSW indexes per language on pgvector 0.8.2 with halfvec. **Estimated total setup cost: ~$60.**

**Layer 2 (enhanced retrieval, months 2–4)**: SPLADE or BGE-M3 sparse vectors as third retrieval path via pgvector sparsevec. ColBERT reranking via Jina-ColBERT-v2 on top-100 candidates (application-side MaxSim or VectorChord). Contrastive fine-tuning of multilingual embeddings using 18,540 translation pairs. Transliteration normalization layer. Register-driven adaptive fusion weights.

**Layer 3 (novel dimensions, months 4–8)**: Multi-faceted embeddings (topical + experiential/rasa facets). HyPE vocabulary bridge (hypothetical questions per chunk). LazyGraphRAG for global thematic queries. Curated knowledge graph with ~500 entities and pre-computed graph candidates. Instruction-following reranker (Contextual AI Reranker v2) for register-aware results.

**Layer 4 (frontier, months 8+)**: Rasa-space embeddings via contrastive fine-tuning on rasa-annotated corpus. State-sensitive retrieval adjusting for seeker context. Readiness-aware progressive disclosure. Conversational discovery interface. Four-layer evaluation framework with ARES + expert panels + RPP.

The total embedding and enrichment cost for the entire 50K-chunk corpus across all layers is under **$200**. The sophistication ceiling is not cost—it is the quality of the metadata, the curation of the knowledge graph, and the depth of understanding of what seekers actually need when they approach sacred text.