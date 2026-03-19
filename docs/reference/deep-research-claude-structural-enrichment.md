# Structural enrichment architecture for sacred texts: 12-topic research survey

**The field has mature components but no integrated system matching this project's architecture.** Across all 12 research areas, the pattern is consistent: individual building blocks exist (text reuse detection, discourse parsing, tiered LLM routing, hierarchical PostgreSQL schemas), but their synthesis for multi-scale sacred text enrichment with invisible navigation metadata is genuinely novel. The most critical gaps are the absence of computational frameworks for non-Western literary theory (rasa, dhvani), the nonexistence of top-down metadata back-propagation as a named pattern, and the complete lack of emotion taxonomies for contemplative texts. The strongest existing foundations are eRST for discourse structure, RAPTOR for hierarchical document understanding, Anthropic's Contextual Retrieval for chunk enrichment, and PostgreSQL's ltree+JSONB for multi-scale storage.

---

## Topic 1: Computational narratology remains Western-fiction-centric

**State of the art.** The field's most advanced framework is **eRST (Enhanced Rhetorical Structure Theory)** by Zeldes et al. (2024–2025, *Computational Linguistics* 51(1):23–72), which extends classical RST with secondary edges and 40+ signal types, applied to the GUM corpus across 16 genres. **NarrativeML** by Inderjeet Mani (Springer 2025/2026 updated edition) provides XML-based narrative annotation grounded in Genette's narratological theory. For automated arc detection, the lineage runs from **Reagan et al. (2016, *EPJ Data Science* 5:31)** — six sentiment-based archetypal arcs from 1,327 Project Gutenberg texts — through **Christ et al. (2024, Findings of ACL)** who fine-tuned DeBERTaV3 for continuous valence/arousal prediction (CCC .82 valence, .71 arousal), to **Balestri (2025, arXiv:2503.04817)** who built a multi-agent LLM system achieving 89.3% precision on narrative arc extraction from TV series. **Nikolaidis et al. (2024–2025)** applied Greimas's actantial model with LLMs to extract six actant roles and create narrative-structured text embeddings. The January 2026 **Interactive Narrative Analytics** framework (Keith, *IEEE Access*) defines the emerging synthesis of computational extraction with visual analytics.

LLM-based approaches have **not fully superseded** sentiment-trajectory methods but are shifting the paradigm toward richer extraction (characters, events, causal links, framing). The **Syuzhet R package** (Jockers, v1.0.7, updated November 2025) remains the most widely used production tool for sentiment-based arc extraction.

**Critical gap: No computational taxonomy exists for philosophical, pedagogical, or devotional text structures.** "Spiral," "progressive revelation," and "dialectical progression" as computationally detectable patterns in wisdom literature — **this doesn't exist yet**. Boyd et al. (2020, *Science Advances*) showed non-fiction texts have distinct structural signatures, but no one has formalized these into a taxonomy. No framework handles multi-register texts (narrative + philosophy + humor + devotion simultaneously).

**Production readiness:** Discourse parsing (eRST) is production-ready for annotation. Arc detection tools are research-grade except Syuzhet (production, but sentiment-only). No production system extracts structural types from non-fiction long-form texts.

**Recommendation for this project:** Use Claude Opus to perform structural type classification directly via prompting, drawing on RST relation types as vocabulary. Define your own taxonomy of structural types for Yogananda's texts (spiral, progressive revelation, dialectical, narrative-exemplar, etc.) and use the LLM to classify chapters against it. This is more practical than adapting any existing tool. Validate using the eRST framework's relation vocabulary for grounding structural claims.

**Comparable projects:** KITAB project (Aga Khan University) uses passim for text reuse detection across OpenITI's 2-billion-word Arabic corpus — the closest large-scale structural analysis of religious texts, though focused on reuse rather than structural types.

---

## Topic 2: Emotional trajectory modeling lacks contemplative emotion vocabulary

**State of the art.** The progression from dictionary-based to transformer-based emotional trajectory modeling is well-documented but incomplete. **Reagan et al.'s six arcs (2016)** remain the dominant reference taxonomy. **Christ et al. (2024, Findings of ACL)** achieved the first supervised transformer-based emotional trajectory prediction using DeBERTaV3 on children's stories. **EmotionLens (2025)** provides interactive visualization of circumplex emotion space in literary works using the **NRC-VAD lexicon** (Mohammad, 2018; 20,007 words with valence/arousal/dominance scores). Emerging trajectory-level metrics include **BEL, ETV, and ECP** (Tan et al., November 2025).

For theoretical foundations, **Troiano, Klinger et al. (2023, *Computational Linguistics* 49(1):1–72)** created the first corpus annotated with appraisal dimensions based on Scherer's component model, demonstrating that appraisal dimensions can predict downstream emotion categories. **GoEmotions** (Demszky et al., 2020) provides 27 emotion labels including admiration, awe, and gratitude — the closest large-scale corpus to contemplative emotions. The Martin & White Appraisal Framework from Systemic Functional Linguistics **has not been computationally implemented** for literary texts.

**Critical gap: No emotion taxonomy exists for religious/contemplative texts.** Devotion, cosmic awe, divine longing, inner stillness, surrender, reverence — none appear in any computational emotion taxonomy. Standard sets (Ekman's 6, Plutchik's 8, GoEmotions' 27) lack these categories entirely. Keltner & Haidt (2003) defined awe via perceived vastness and need for accommodation, and Stellar et al. (2021) proposed a taxonomy of 11 positive emotions including "self-transcendent emotions," but neither has been computationalized for text analysis. **LLM-based emotional arc extraction producing structured outputs (movement from X to Y through Z) does not exist as a named system.** Multi-layered text handling (simultaneously humorous and devotional) also does not exist.

**Production readiness:** Syuzhet is production-ready but limited to sentiment valence. NRC-VAD lexicon is production-ready for dimensional emotion scoring. Everything else is research-grade.

**Recommendation for this project:** Create a custom contemplative emotion taxonomy (perhaps 15–20 categories: devotion, longing, awe, inner stillness, cosmic wonder, divine humor, surrender, etc.) informed by both GoEmotions' empirical categories and rasa theory's nine rasas. Use Opus to classify emotional trajectories against this taxonomy, producing structured JSON outputs describing emotional arcs per chapter. This custom taxonomy is your most distinctive contribution — no one has built one.

**Comparable projects:** None for sacred texts. The closest is NLP analysis of psychedelic experience reports using a custom "mystical language dictionary" with LIWC (Cox et al., 2021), which found mystical language correlated with experience intensity.

---

## Topic 3: Author voice profiling tools exist but not for sacred text navigation

**State of the art.** The **Stylo R package** (Eder, Rybicki, Kestemont; v0.7.5, April 2024) remains the most widely used computational stylistics tool, supporting Burrows' Delta variants, PCA, SVM, and the Imposters method. **JGAAP** (Juola, Duquesne University) is usable but aging. For LLM-based profiling, **Mythos** (UMass, ACL/AACL 2025) introduces a two-stage "Author Writing Sheet" system — the first framework for LLM-based author voice profiling using contrastive analysis against LLM-generated average text. **VADES** uses Variational Information Bottleneck to create interpretable author embedding spaces where stylistic similarity corresponds to spatial proximity.

For metaphor detection, **Fuoli et al. (September 2025, arXiv:2509.24866)** produced the landmark evaluation of LLMs for full-text metaphor identification, achieving **median F1 = 0.79** via fine-tuning — substantially higher than prior sentence-level work. **EmoBi** (ACL 2025) advanced hyperbole and metaphor detection with bidirectional dynamic interaction (+28.1% F1 improvement). **MetaNet** (ICSI/Berkeley, 2014–2016) detects conceptual metaphors using frame semantics at scale (500M-word corpus in 6 hours). **Wmatrix5** (Lancaster University) provides production-ready semantic annotation for Critical Metaphor Analysis.

For authorship attribution in religious texts specifically, a 2025 *PLOS ONE* paper used the **Higher Criticism statistical method** to distinguish D, DtrH, and P sources in the Hebrew Bible despite shared theological vocabulary. Stylometric analysis has been applied to the Book of Mormon (Holmes, 1992; Roper et al., 2012) and Pauline epistles, successfully detecting "wordprints" within shared religious registers.

**Production readiness:** Stylo is production-ready. Metaphor detection via LLMs (Fuoli et al.) is near-production. Author voice profiling via LLMs (Mythos) is research-grade. **No production system uses author voice profiles for navigation/discovery** — NoveList (EBSCO) uses human-assigned "appeal factors" but not computational stylistic profiles.

**Recommendation for this project:** Use Opus to generate an "Author Voice Profile" for Yogananda following the Mythos pattern — analyze distinctive stylistic features (humor patterns, metaphor systems, register shifts, Sanskrit vocabulary integration) across the corpus. Store as metadata to enable "find chapters where Yogananda's voice is most [humorous/devotional/philosophical]." Track recurring metaphor patterns using the Fuoli et al. approach with Opus. This voice profile becomes a navigation axis.

---

## Topic 4: Cross-text structural alignment has tools but not for "same teaching, different form"

**State of the art.** Three production-ready text reuse detection systems exist: **passim** (David Smith, Northeastern; Scala/Spark, GitHub: dasmiq/passim) handles billions of comparisons using shingled n-grams and Smith-Waterman alignment; **TRACER** (Büchler et al., Leipzig/Göttingen, 2014) provides a configurable pipeline tested on Aquinas's *Summa contra Gentiles*; and **textreuse** (R package, Li & Mullen, rOpenSci, 2024) implements minhash/LSH for candidate detection. For classical intertextuality, **Tesserae** (Coffee, Forstall, Scheirer; University at Buffalo) detects parallels in Latin/Greek poetry using lemma identity and word frequency. **SPhilBERTa** (Heidelberg NLP, 2023–2024) enables cross-lingual intertextual detection across Ancient Greek, Latin, and English.

Beyond quotation-level detection, **Burns et al. (NAACL 2021)** profiled intertextuality in Latin literature using word embeddings compared against Tesserae. **Manjavacas et al. (2020)** used distributional semantics on the Patrologia Latina to study biblical intertexts along two axes: degree of literality and thematic embedding, using multi-level Bayesian models.

**Critical gap:** "Same teaching, different form" detection — identifying where an author presents equivalent content in different structural formats across works — **does not exist as a named system.** Sentence-level paraphrase detection (SBERT, MRPC benchmark) operates at too fine a granularity. Chapter-level structural similarity computation also lacks purpose-built tools. The synoptic Gospel parallel tradition remains manually curated (Aland's *Synopsis*); no computational system discovers synoptic parallels automatically.

**Production readiness:** passim, TRACER, textreuse, and Tesserae are all production-ready for text reuse at the string/token level. Structural similarity beyond lexical reuse is research-grade at best.

**Recommendation for this project:** Use a two-layer approach: (1) passim or SBERT for surface-level passage similarity across Yogananda's works, then (2) Opus for chapter-level structural comparison, prompted to identify "same teaching, different form" relationships. Store these as typed edges in your PostgreSQL schema (relationship_type: "parallel_teaching," "elaboration," "restatement_in_narrative," etc.). This chapter-resonance graph is high-value invisible navigation metadata.

---

## Topic 5: Sacred text digital humanities is rich in corpora but thin in structural analysis

**State of the art.** Major digital religious corpora exist and are production-ready: **OpenITI** (Romanov, Savant, Miller; 10,202 texts, ~2 billion Arabic words, CTS-compliant URNs), **KITAB** (Savant et al., Aga Khan University; uses passim for text reuse across OpenITI), **Quranic Arabic Corpus** (Dukes & Atwell, Leeds; 77,430 morphologically annotated words), **Digital Mishnah** (Lapin, Maryland; TEI-encoded critical edition), **SARIT** (Wujastyk & Mahoney; TEI-encoded Sanskrit texts), **Digital Corpus of Sanskrit** (Hellwig, Heidelberg; ~4.8M manually tagged words), **CBETA** (150M+ Chinese Buddhist characters in XML), **TACL** (Radich & Norrish; n-gram analysis for Buddhist text borrowings), and **SuttaCentral** (cross-tradition early Buddhist texts in 20+ languages).

For Hindu/Vedic computational analysis, **Chandra et al. (2022, *PLOS ONE*)** applied BERTopic to Easwaran's translations of 12 Upanishads and Bhagavad Gita, finding 73% mean cosine similarity between topics. A **2025 transformer-enabled diachronic analysis** of Vedic Sanskrit (arXiv:2512.05364) achieved low calibration error (ECE=0.043) using weakly-supervised transformer ensembles. **ByT5-Sanskrit** (EMNLP 2024 Findings) provides a unified byte-level model achieving SOTA on Sanskrit NLP tasks.

**Critical gaps:** Computational analysis of Sufi poetry, Christian mystical texts, and Yogananda specifically **does not exist.** "Progressive revelation" as a computationally detectable structural pattern **has not been studied.** NLP analysis of first-person contemplative experience reports **does not exist** (only psychedelic experience reports have been analyzed). Handling Sanskrit terminology in English prose has no purpose-built solution, though ByT5-Sanskrit and the **LEVOS** framework (2024) for Sanskrit-augmented technical lexicons are adjacent.

**Production readiness:** Corpus infrastructure is mature (OpenITI, CBETA, SARIT, DCS). Computational analysis of sacred texts is almost entirely research-grade.

**Recommendation for this project:** Your project would be among the first computational structural analyses of any single contemplative author's corpus. Leverage the SARIT/DCS infrastructure for Sanskrit term identification. Build a custom terminology preservation layer that tags Sanskrit terms embedded in Yogananda's English prose (atman, Brahman, samadhi, etc.) and links them to SARIT/DCS definitions. The "progressive revelation" detection across Yogananda's works — mapping how concepts are introduced simply, then deepened across books — is a genuinely novel contribution.

---

## Topic 6: Indian literary theory (rasa, dhvani, auchitya) is barely computationalized

**State of the art.** Rasa theory has been used as a classification label set in **multiple NLP experiments with moderate accuracy (66–87%)**, primarily for Indian-language poetry. The leading researcher is **Jatinderkumar R. Saini** (Symbiosis Institute, Pune), who has published rasa-based classifiers for Hindi, Punjabi (Kāvi corpus: 948 poems, SVM 70% accuracy), Gujarati (~87.6% with deep learning), and Marathi poetry. **Prakash, Singh & Saha (2022, *ETRI Journal*)** produced the first rasa-based classification of Hindi poetry using domain-specific Word2Vec+SVM on 945 poems. The **PERC corpus** (350 English poems by Indian poets, tagged with 9 Navarasa) is the only English-language rasa-annotated dataset. All work uses classical ML (SVM, Naïve Bayes); **no transformer or LLM-based rasa classification exists.**

The sole theoretical bridge between Indian literary theory and computational science is **K. Gopinath's "Towards a Computational Theory of Rasa"** (IISc Bangalore; chapter in *Western Indology on Rasa*, Infinity Foundation India, ~2020–2024), which proposes atomic units and communication models for rasa using CS abstractions but includes no implementation.

**Dhvani (suggestive meaning) has never been computationalized.** Despite extensive searching, no paper, tool, or system implements Anandavardhana's framework for detecting literal (abhidha), indicated (lakshana), and suggested (vyanjana) meaning layers. **Auchitya (propriety) has never been computationalized** either — Kshemendra's 27 categories of fitness have no computational formalization.

For computational Sanskrit poetics, the **International Sanskrit Computational Linguistics Symposium** (founded 2007 by Huet/INRIA and Kulkarni/Hyderabad; 8th edition March 2026 at IIT Roorkee) has produced tools for **anuprāsa** (alliteration) identification (Barbadikar & Kulkarni, ISCLS 2024), **yamaka** (word repetition; 2023), **upamā** (simile) detection including LLM-based classification (Jadhav et al., 2023/2025), and multiple meter identification tools. **These focus on formal/acoustic features, not semantic-aesthetic analysis (rasa, dhvani).**

**No rasa-based recommendation system, metadata schema, or navigation system exists anywhere.** No empirical evidence exists that rasa-informed metadata creates meaningfully different navigation for Indian seekers.

**Production readiness:** Zero. All rasa classification work is academic with no released code, API, or deployable package. Computational Sanskrit poetics tools (anuprāsa, meter identification) are working research tools.

**Recommendation for this project:** This is your highest-value differentiator. Build a rasa-informed metadata layer using Opus, mapping chapters to dominant and secondary rasas (śānta/peace, adbhuta/wonder, karuṇa/compassion, vīra/heroic courage, śṛṅgāra/divine love-devotion, hāsya/humor). Create a parallel dhvani-informed layer identifying where Yogananda uses suggestion rather than direct statement. Because no computational implementation exists, your LLM-based approach would be the first production system applying rasa theory to text navigation. The key question — whether this creates meaningfully different navigation — is testable through user studies comparing rasa-based vs. Western-only category navigation with Indian and Western readers.

---

## Topic 7: Long-context LLM analysis has known failure modes with practical mitigations

**State of the art.** The foundational **"Lost in the Middle"** paper (Liu et al., *TACL* 2024, 12:157–173) documented the U-shaped performance curve where information in the middle of long contexts suffers >30% accuracy degradation. This has been **partially but not fully resolved**: **Ms-PoE** (NeurIPS 2024) improves middle-position accuracy by 20–40% via positional encoding rescaling; agentic RAG approaches dynamically reformulate queries to sidestep the problem.

More critically, **Du et al. (EMNLP 2025 Findings)** demonstrated that **context length alone hurts performance** — even with perfect retrieval, performance degrades 13.9–85% as input length increases, independent of distraction. Their mitigation: prompt the model to recite retrieved evidence before reasoning. **"Context Rot"** (Hong, Troynikov & Huber, Chroma Research, July 2025) evaluated 18 LLMs including Claude 4, finding performance grows increasingly unreliable with input length even on simple tasks, and noting Claude Opus 4 occasionally produces empty outputs with stop_reason="refusal" on very long inputs.

For benchmarks beyond retrieval: **RULER** (Hsieh et al., NVIDIA, COLM 2024) tests 13 tasks including multi-hop tracing and aggregation. **NoLiMa** (Modarressi et al., Adobe, ICML 2025) removes lexical cues and tests latent associative reasoning — at 32K tokens, 11/13 models drop below 50% of baseline. **HELMET** (Princeton/Intel, ICLR 2025) evaluates 59 models across 7 application-centric categories and found **NIAH does not predict downstream performance**. **A benchmark specifically for structural comprehension of literary texts does not exist.**

**Opus 4.6 vs. Sonnet 4.6:** The critical gap is on **GPQA Diamond** (PhD-level reasoning): Opus scores **91.3%** vs. Sonnet's **74.1%** — a 17-point chasm directly relevant to interpretive sacred text analysis. On **MRCR v2** (1M token, 8-needle), Opus achieves **76%** vs. predecessors' 18.5%. Pricing: Opus is 5x more expensive ($15/$75 vs. $3/$15 per MTok input/output, doubled above 200K).

For extended thinking: Opus 4.6 supports **adaptive thinking** with effort levels (low/medium/high/max) and up to **128K output tokens**. **LongBench v2** showed reasoning models outperform direct-answer models by 7+ points on long-context tasks.

**Production readiness:** Long-context capability is production-ready but requires architectural mitigation. Extended thinking is production-ready on Opus 4.6.

**Recommendation for this project:** Accept that middle-chapter analysis quality may be lower and mitigate with a two-pass approach: Pass 1 reads the entire book with Opus (extended thinking at "high" effort) for book-level structural analysis; Pass 2 processes chapters individually or in small groups for chapter-level detail. Use the **recitation technique** from Du et al. — instruct Opus to quote relevant passages before making interpretive claims. Place critical analytical instructions at both start AND end of the prompt. Budget **$15–30 per book** for Opus analysis (1M input + substantial output/thinking tokens). The 17-point GPQA gap justifies Opus over Sonnet for all interpretive tasks.

---

## Topic 8: Museum curation theory offers frameworks but digital implementation lags

**State of the art.** The most rigorous curatorial logic framework is the **Dimensions of Curation Competing Values Model** (Villeneuve & Love, 2021, *Curator*), which maps three axes: interpretive focus (object-centered ↔ audience-centered), curatorial power (lone ↔ collaborative), and curatorial intent, producing 8 exhibition types. **Beatrice von Bismarck's four core concepts** — curatoriality, constellation, transposition, hospitality — provide a more theoretical framework. Standard exhibition typologies include chronological, thematic, phenomenological (Schorch 2013), and emotional/affective approaches.

For museum AI: **Rijksmuseum's Art Explorer** (November 2024) combines Elasticsearch, Neo4j graph database, and Linked Open Data for 800K artworks with AI-driven evocative search. **Harvard Art Museums' AI Explorer** runs **5 simultaneous computer vision services** generating **71.5 million machine tags** across 394,510 images. The **Smithsonian Open Access Initiative** provides 2.8M+ images with metadata on AWS. The **V&A** uses LLMs to formulate API queries on behalf of users, converting search terms to controlled vocabulary (Getty AAT).

For reader's advisory: **NoveList** (EBSCO) is the dominant production system using **appeal factors** — structural/stylistic properties (pacing, tone, characterization, writing style) beyond genre — for book recommendation. Joyce Saricks codified these factors; Nancy Pearl's "Four Doorways" framework (Story, Character, Setting, Language) is foundational. **Marlowe** (Authors A.I.) provides commercial AI-powered fiction analysis for plot arcs, pacing, and character development. **No fully automated reader's advisory system based on NLP-extracted structural features exists in production.**

For digital libraries: **Europeana** (45M+ objects, EDM metadata model using Dublin Core + SKOS + OAI-ORE), **DPLA** (7M+ items, MAP based on EDM), and **HathiTrust** (17M+ volumes) all use multi-scale metadata for navigation with semantic enrichment (NER, geonames linking).

**Production readiness:** Rijksmuseum and Harvard AI Explorer are production-deployed. NoveList is production. Europeana/DPLA/HathiTrust are production. Formalized "curatorial UX" as a methodology does not exist as a named framework.

**Recommendation for this project:** Adopt NoveList's appeal factors framework as a starting vocabulary for structural metadata (adapt "pacing," "tone," "characterization" for sacred texts). The Rijksmuseum model — AI-generated metadata powering a curated navigation layer, with AI content positioned as "inspiration" separate from authoritative data — is the best production precedent for invisible structural metadata. Design your PostgreSQL metadata as enabling "Art Explorer for sacred texts" — evocative, structural navigation that never shows users the underlying classifications.

---

## Topic 9: Validation of interpretive AI outputs requires custom protocols

**State of the art.** **No established framework exists for evaluating interpretive literary/structural analysis by LLMs.** The closest work is **GAATA** (Jayawardene & Ewing, 2025, *Sage Journals*), a methodology for GenAI-augmented thematic analysis using a four-prompt pipeline where one AI generates codes and another validates them. For LLM-as-judge: **MT-Bench** (Zheng et al., NeurIPS 2023) achieved ~80% agreement with human preferences. **G-Eval** (Liu et al., EMNLP 2023) uses chain-of-thought evaluation reaching 0.514 Spearman correlation with humans. **Prometheus 2** (Kim et al., EMNLP 2024) provides an open-source evaluator supporting custom score rubrics (Apache 2.0, GitHub: prometheus-eval/prometheus-eval). **FLASK** (ICLR 2024 Spotlight) defines 12 fine-grained skills including "Insightfulness" and "Comprehension."

**Critical finding on Sonnet-evaluating-Opus:** "No Free Labels" (arXiv:2503.05061, 2025) demonstrated that **LLM judges struggle to grade models when the judge itself cannot answer the question.** "Limits to Scalable Evaluation at the Frontier" (arXiv:2410.13341, 2024) proved sample size savings exceeding 2x are rare. **Using Sonnet to validate Opus interpretive outputs carries significant risk** — use Opus-class models as judges or restrict Sonnet to verifiable dimensions only.

For inter-annotator agreement: Artstein & Poesio (2008, *Computational Linguistics*) established that subjective tasks typically achieve κ ≈ 0.70. For interpretive literary analysis, **κ = 0.40–0.60 should be considered acceptable.** A January 2026 paper (arXiv:2601.18061) found that expert disagreement in interpretive domains stems from **framework differences, not misunderstanding** — multiple valid readings coexist.

**No gold-standard dataset exists for chapter-level structural analysis of literary or sacred texts.**

**Production readiness:** G-Eval and Prometheus 2 are production-ready for custom rubric evaluation. Prodigy (Explosion AI) provides production-ready annotation with built-in IAA metrics.

**Recommendation for this project:** Implement a six-phase minimum viable validation protocol: (1) Define a 4–6 dimension rubric (textual grounding, internal coherence, interpretive plausibility, analytical depth, completeness, terminological precision) using 5-point Likert scales; (2) Recruit 3 domain experts for calibration on 5 pilot chapters targeting α ≥ 0.60; (3) Full expert evaluation of 30% of chapters stratified by type/difficulty; (4) G-Eval with Opus-class judge for remaining chapters, run 3x for self-consistency; (5) Expert review of flagged chapters + random 10% spot-check; (6) Regeneration consistency check on 10 chapters. Estimated cost: 40–60 expert hours + ~$100 LLM evaluation costs over 6–8 weeks.

---

## Topic 10: Structural analysis largely survives translation; voice profiling does not

**State of the art.** Cross-lingual RST parsing on the **GUM corpus** (Zeldes, 2017; Russian parallel annotation 2024) demonstrates **substantial structural similarity between English and Russian**, with differences primarily at sentence-level segmentation. **Iruskieta et al. (2015)** confirmed this for English/Spanish/Basque, and **Cao et al. (2018–2020)** for Spanish/Chinese: higher-level rhetorical structure is largely preserved across translations; differences concentrate at the EDU (Elementary Discourse Unit) level.

**Rybicki's critical finding (2012):** When Burrows' Delta is applied to translations, "except for some few highly adaptive translations, Delta usually fails to identify the translator and identifies the author of the original instead." This means **the original author's structural/stylistic signal survives translation.** However, Abbass et al. (*PLOS ONE*, 2019) achieved 83% accuracy identifying translator style via network motifs, confirming translators do leave measurable signatures.

For multilingual parallel corpora: **taggedPBC** (Ring, 2025–2026) provides POS-tagged parallel Bible data from **1,940+ languages**. **OPUS** (Tiedemann, 2012) aggregates 100M+ sentence pairs across 50+ languages. **InterCorp** provides 28-language parallel texts. **No project specifically performs cross-lingual structural analysis of parallel translations** at the chapter/book level.

**Production readiness:** Cross-lingual sentence embeddings (LASER, mBERT, XLM-R) are production-ready. Cross-lingual RST parsing is research-grade. Translator voice detection is research-grade.

**Recommendation for this project:** Analyze English originals first — this is Yogananda's actual voice. For translations, verify structural patterns (chapter organization, thematic arcs, pedagogical sequences) hold using Rybicki's finding that macro-structure survives translation. **Do not apply voice profiling to translations** — these reflect translator voice, not Yogananda's. For structural metadata in translations, inherit book/chapter-level structure from English analysis, then run independent per-language analysis for language-specific features (metaphor expression, cultural adaptation, register). This hybrid approach avoids redundant analysis while respecting translation realities.

---

## Topic 11: Semantic coordinate systems have theory but no production implementation

**State of the art.** The foundational theory is **Gärdenfors' Conceptual Spaces** (*The Geometry of Thought*, MIT Press, 2000; *The Geometry of Meaning*, 2014), which proposes concepts as convex regions in multi-dimensional quality spaces with perceivable quality dimensions. This is exactly the "deliberately designed meaningful axes" approach, but it has been operationalized only in limited domains. **Autoencoder-based Conceptual Space learning** (arXiv:2401.16569, 2024) demonstrates learning interpretable dimensions with semantic regularization. **NNSE (Non-Negative Sparse Embeddings)** (Murphy 2012; Fyshe et al., CMU, 2012–2015) creates vector spaces where dimensions group semantically coherent words.

For spatial document navigation, historical systems include **Scatter/Gather** (Xerox PARC, 1992; user studies showed more coherent mental models), **Data Mountain** (Microsoft Research, 1998; faster information retrieval vs. non-spatial interfaces), and recent **ACM SUI 2025** work demonstrating spatial interfaces significantly reduce completion time and cognitive workload. **Litmaps**, **VOSviewer** (Leiden), and **Connected Papers** are production spatial navigation tools for academic literature but use citation graphs, not interpretable coordinate axes.

**Critical gap: No axis system for positioning philosophical/spiritual texts exists.** No published framework proposes specific coordinate dimensions (inner/outer, personal/universal, etc.) for sacred or philosophical text collections. The **Inglehart-Welzel World Cultural Map** (two axes from World Values Survey factor analysis) provides a model for meaningful axes applied to cultures but not texts. Research universally demonstrates **cultural bias in classification dimensions** — a 2024 *PNAS Nexus* study showed all GPT models exhibit values resembling English-speaking Protestant European countries.

**Production readiness:** Gärdenfors' framework is theoretically mature but has no production implementation for text navigation. Spatial visualization tools (VOSviewer, Litmaps) are production-ready but use graph-based, not coordinate-based, organization.

**Recommendation for this project:** Design 4–6 interpretable axes grounded in the corpus itself rather than imposed a priori. Candidate axes drawn from both Western and Indian frameworks might include: (1) **Teaching mode** (direct instruction ↔ narrative/experiential), (2) **Rasa orientation** (devotional/śānta ↔ energetic/vīra), (3) **Scope** (personal/practical ↔ cosmic/metaphysical), (4) **Accessibility** (beginner-friendly ↔ advanced practitioner), (5) **Register** (humorous/light ↔ formal/scriptural). Have Opus score each chapter on each axis as continuous values (0.0–1.0). Validate axes through user studies comparing navigation effectiveness with and without coordinate positioning. Explicitly test for cultural neutrality by including both Indian and Western readers.

---

## Topic 12: The hierarchical multi-scale architecture is novel but components exist

**State of the art.** **RAPTOR** (Sarthi et al., Stanford, ICLR 2024; arXiv:2401.18059) is the closest existing architecture — it recursively embeds, clusters, and summarizes text chunks bottom-up using UMAP+GMM, constructing a tree with multiple summarization levels. Achieved 20% absolute accuracy improvement on QuALITY with GPT-4. Open-source (MIT license). However, RAPTOR builds summaries upward but **does not push insights back down** to leaf chunks.

**Anthropic's Contextual Retrieval** (September 2024) is the closest pattern to top-down enrichment: it prepends chunk-specific explanatory context using the full document, reducing retrieval failures by **49–67%**. Implemented by AWS Bedrock, Unstructured.io, and Milvus. But it is single-level (document→chunk) and enriches before embedding, not as post-extraction back-propagation.

For tiered LLM cost optimization: **FrugalGPT** (Chen, Zaharia, Zou; Stanford, May 2023; arXiv:2305.05176) introduced three strategies including LLM Cascade, matching GPT-4 with **up to 98% cost reduction**. **RouteLLM** (UC Berkeley/LMSYS, June 2024; open-source) learns routers from preference data, reducing costs 45–85%. **Cascade Routing** (ETH Zurich, ICML 2025; open-source at github.com/eth-sri/cascade-routing) provides provably optimal combined routing+cascading strategies.

For PostgreSQL: **ltree** (Sigaev & Bartunov; bundled with PostgreSQL) provides materialized path data types for hierarchical structures with GiST indexing. Combined with **JSONB** (core since 9.4) for semi-structured metadata and **pgvector** for embeddings, this enables a single-database solution. **Recursive CTEs** handle tree traversal; materialized views enable cross-scale aggregation.

Production multi-scale document processing platforms include **LlamaIndex** (HierarchicalNodeParser + AutoMergingRetriever), **Unstructured.io**, **Dify.ai**, and **NVIDIA Nemotron RAG Blueprint**. **LlamaIndex's Haystack MetadataEnricher** uses LLMs with Pydantic models for automatic metadata enrichment before chunking.

**Critical gaps.** Three elements do not exist as named patterns:

- **Top-down metadata back-propagation** (book-level insights systematically pushed to chunk metadata via LLM)
- **Cross-granularity entity reconciliation** (harmonizing entities extracted by different LLM tiers at different document scales)
- **Integrated multi-scale enrichment with tiered LLMs** (the full pipeline combining RAPTOR-style hierarchy + FrugalGPT-style tiering + Contextual Retrieval-style enrichment)

**Production readiness:** Individual components (ltree, JSONB, pgvector, LlamaIndex hierarchical parsing, prompt caching) are all production-ready. The integrated architecture is genuinely novel.

**Recommendation for this project:** Implement a four-phase enrichment pipeline:

- **Phase 1 (Haiku, $0.25/MTok):** Chunk-level extraction — entities, Sanskrit terms, basic emotional tone, surface features. High-volume, parallelizable.
- **Phase 2 (Sonnet, $3/MTok):** Chapter-level analysis — emotional arc, structural type, teaching mode, voice register, rasa classification. Input: full chapter + Phase 1 chunk summaries.
- **Phase 3 (Opus, $15/MTok):** Book-level analysis — progressive revelation patterns, cross-chapter resonances, metaphor systems, overarching thematic structure. Input: full book (or chapter summaries if book exceeds comfortable context). Extended thinking at "high" effort.
- **Phase 4 (Haiku, $0.25/MTok):** Back-propagation — for each chunk, UPDATE with inherited metadata: book_themes, chapter_arc_position, corpus_teaching_connections. This is the novel step.

Use the PostgreSQL schema pattern with ltree paths (`yogananda.autobiography.ch12.chunk_003`), JSONB for both `enrichment` (scale-specific) and `inherited_metadata` (back-propagated), and pgvector for embeddings. Leverage Anthropic's **prompt caching** ($1.02/MTok cached) to dramatically reduce Phase 4 costs by caching the book/chapter context and varying only the chunk instruction. Estimated total cost per book: **$30–80** depending on length and Opus thinking token usage.

---

## Synthesis: what this project is actually building

Across all 12 topics, a consistent picture emerges. **This project sits at an intersection that no existing system occupies.** The closest analogues are KITAB (structural analysis of a large religious corpus) and Rijksmuseum's Art Explorer (AI-generated metadata powering invisible navigation for a curated collection), but neither combines multi-scale LLM enrichment, rasa-informed metadata, contemplative emotion taxonomies, and hierarchical back-propagation.

The highest-value novel contributions are: (1) the **contemplative emotion taxonomy** — no computational emotion vocabulary exists for sacred texts; (2) the **rasa-informed metadata layer** — no computational system has ever applied Indian literary theory to text navigation; (3) the **top-down back-propagation pattern** — pushing book-level insights to chunk metadata is architecturally novel; and (4) the **structural type taxonomy for wisdom literature** — "spiral," "progressive revelation," and pedagogical structures have never been computationally formalized.

The strongest foundations to build on are: eRST for discourse structure vocabulary, RAPTOR + Contextual Retrieval for hierarchical processing patterns, FrugalGPT/RouteLLM for tiered cost optimization, PostgreSQL ltree+JSONB+pgvector for storage, G-Eval/Prometheus 2 for validation, and NoveList's appeal factors as a starting vocabulary for structural navigation metadata. The 17-point GPQA gap between Opus and Sonnet justifies Opus for all interpretive tasks in a corpus of this scale.