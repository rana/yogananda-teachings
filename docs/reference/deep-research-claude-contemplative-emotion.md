# Building a contemplative emotion taxonomy for sacred prose

**No computational system exists that classifies sacred or spiritual text by contemplative emotional quality** — not for rasa, not for dhvani, not for mystical states, not for any tradition. This is the central finding of this research. The field of NLP has developed sophisticated multi-label emotion classifiers, but every major taxonomy (GoEmotions, Ekman, Plutchik, Russell's circumplex) was built for secular, conversational text and explicitly excludes the emotional and aesthetic registers most central to contemplative prose. The tools exist in adjacent fields — ML-based rasa classification of poetry achieves 70–80% accuracy, multi-label classifiers handle co-occurring emotions, perspectivist annotation frameworks accommodate legitimate disagreement — but nobody has assembled them for this purpose. Indian aesthetic theory, particularly rasa and dhvani, provides the most philosophically sophisticated framework available for this project, yet these concepts have **zero** computational implementations beyond basic poetry classification. What follows is a detailed accounting of what exists, what doesn't, and what to build.

---

## Topic 1: Rasa classification — nascent ML, no LLMs, no prose

### What exists

Machine learning rasa classification is a small but real subfield, dominated by a handful of Indian researchers working on regional-language poetry:

**Saini & Kaur (2020)** built "Kāvi," an annotated corpus of **948 Punjabi poems** across all 9 navarasa categories (*Procedia Computer Science*, Vol. 167, pp. 1220–1229). Their SVM classifier achieved **70.02% accuracy** using poetic features (orthographic, phonemic) alongside TF-IDF. Inter-annotator agreement was **Fleiss' κ = 0.78** (substantial) with 3 annotators — notably high for aesthetic classification, likely aided by the formal conventions of Punjabi poetry. Earlier work by the same team on 240 poems across 4 categories yielded 58.79% (SVM).

**Prakash et al. (2022)** classified **945 Hindi poems** into 4 rasa categories using SVM with domain-specific Word2Vec embeddings trained on 37,717 poems (*ETRI Journal*, Vol. 44(3)). Domain-specific embeddings substantially outperformed generic Wikipedia Word2Vec, but the 4-category scheme (based on Acharya Ramchandra Shukla's typology) is arguably thematic rather than true rasa classification.

**A BERT-based approach (~2025)** applied transformers to ~1,600 English poems across 8 navarasa-mapped emotion categories, achieving **F1 = 0.80 and accuracy = 0.80** — the highest reported figure, though the English emotion-to-rasa mapping is debatable. **Mehta & Rajyagor (2021)** reported 85–90% on 300+ Gujarati poems using deep learning (unverified; cited in a 2025 review). **Pal & Patel (2020)** achieved only ~64% (Naïve Bayes) on a very small corpus of 55 Hindi poems across all 9 rasas.

The **66–87% accuracy range** cited in the user's question is consistent with the composite literature: 64% at the low end (small corpus, all 9 rasas, NB), 80–90% at the high end (larger corpora, transformers or deep learning, sometimes reduced categories).

### What hasn't been done

**No LLM-based rasa classification exists.** Despite the proliferation of Indic language models (Indic-Gemma "Navarasa 2.0" from Telugu-LLM-Labs, BharatBench, PARIKSHA at EMNLP 2024), none target literary rasa classification. The "Navarasa" model name is a branding choice, not a capability. Zero papers use GPT-4, Claude, or Gemini for rasa detection.

**Rasa classification of prose is essentially untouched.** The sole exception is **Sreejith et al. (2017)**, who built a navarasa OWL ontology mapping English emotion keywords to 9 rasas and applied it via keyword-counting to a single English short story (*Indian Journal of Science and Technology*, Vol. 10(24)). This is keyword-matching, not ML, on a single text.

**No multi-granularity classification** (chunk → chapter → book) has been attempted. All existing work operates at the poem level: one poem, one label. The classical concept that a work has a *dominant* rasa with *subordinate* rasas naturally maps to a multi-level scheme, but this hasn't been implemented.

**No rasa-based search or recommendation system exists.** Sandhan et al. (2023/2025) mention "personalized recommendations for readers" as motivation but cite only general poetry recommenders.

### Extended rasa frameworks

The canonical trajectory: **Bharata Muni** (~200 BCE–200 CE) defined 8 rasas. **Abhinavagupta** (950–1020 CE) championed **shānta** (peace/tranquility) as the 9th, calling it "the string of a jeweled necklace" on which other rasas hang. **Vātsalya** (parental love) was later added as a 10th. **Bhakti** (devotion) was long considered "only a minor feeling fit for stothras" — too limited for a full rasa.

The most significant extension is **Rupa Goswami's *Bhakti-rasāmṛta-sindhu*** (16th century), which radically reframed rasa theory for devotional literature: **5 primary bhakti-rasas** (shānta/neutrality, dāsya/servitude, sakhya/friendship, vātsalya/parental affection, mādhurya/conjugal love) plus **7 secondary rasas** (the classical set minus shānta), totaling 12 rasas with 33 vyabhicāri bhāvas (transitory emotions) and 8 sāttvika bhāvas (psychophysical states). This framework was designed precisely for devotional literature and the devotee-God relationship — making it **directly relevant to Yogananda's works** — yet it has never been computationally operationalized.

Sheldon Pollock's *A Rasa Reader* (Columbia University Press, 2016) is the definitive modern scholarly anthology tracking these transformations.

### Recommendation for this project

Use a **two-tier rasa scheme**: the 9 navarasa as a primary layer (leveraging existing computational precedent), supplemented by Rupa Goswami's 5 bhakti-rasas as a devotional sub-taxonomy. Implement at two granularities minimum: passage-level dominant rasa with confidence scores, and work-level rasa arc (sequence of dominant rasas across passages). Given that BERT-based approaches already reach F1 = 0.80 on English poetry, a fine-tuned transformer or prompted LLM should be viable for Yogananda's English prose, though the prose-to-poetry domain shift is uncharted territory and will require empirical validation.

---

## Topic 2: Dhvani has not been computationalized — at all

### The theory

Ānandavardhana's *Dhvanyāloka* (9th century) posits three functional layers of meaning: **abhidhā** (literal/denotative), **lakṣaṇā** (indicated/secondary — activated when literal meaning fails or is inadequate), and **vyañjanā** (suggested/evoked — meaning that resonates beyond what is stated). Three categories of suggested meaning exist: **vastudhvani** (suggestion of a fact), **alaṅkāradhvani** (suggestion of a figure of speech), and **rasadhvani** (suggestion of aesthetic emotion — the highest form). Abhinavagupta refined this: dhvani is "not any and every sort of suggestion, but only that sort which yields rasa."

### Textual signals for vyañjanā

Trained readers (sahṛdaya — "those with heart/sensitivity") identify vyañjanā through specific markers: **context override** (when literal meaning becomes subsidiary), **incompatibility triggers** (when primary meaning fails, forcing interpretive escalation), **novelty and concealment** (S. Kuppuswami Sastri: "something is concealed for a moment, tending to increase the degree of charm"), and the **quest-and-conquest dynamic** (the reader actively participates in meaning-making). The strongest indicator is whether the passage evokes rasa — if it does, vyañjanā is operating.

### Computational status

**Zero NLP implementations exist.** Despite extensive searching across computational linguistics venues, no paper formalizes the abhidhā-lakṣaṇā-vyañjanā triad computationally. Sanskrit NLP work (Pāṇinian grammar for morpho-syntactic processing, sandhi splitting, Word2Vec for Sanskrit) addresses surface-level linguistic processing, not semantic layering. Western computational pragmatics (implicature detection, metaphor identification) addresses analogous phenomena but never references or formalizes dhvani theory.

### Cross-tradition comparison: dhvani and the four senses of Scripture

A key paper exists: **"Christian Devotional Poetry and Sanskrit Hermeneutics"** (*International Journal of Asian Christianity*, Vol. 1, Issue 1, pp. 64–90, 2018, Brill). This explicitly applies dhvani as a hermeneutical tool for reading 17th-century English devotional poetry and notes that Vatican II's *Dei Verbum* uses *personare* ("to sound through") — a concept close to dhvani's "resonance."

The structural parallel:

| Dhvani layer | Christian sense | Function |
|---|---|---|
| Abhidhā (literal) | Literal/Historical | Surface meaning |
| Lakṣaṇā (indicated) | Allegorical/Typological | Secondary meaning via displacement |
| Vyañjanā (suggested) | Moral (Tropological) | Meaning evoked in the reader |
| Rasadhvani (aesthetic emotion) | Anagogical (spiritual/eschatological) | Transformative encounter |

**Important caveat**: These are structural parallels, not equivalences. Dhvani emerges from aesthetic theory (how poetry works); the Quadriga emerges from theology (how Scripture is read). Dhvani describes layers of **meaning production** (sequential escalation); the four senses are parallel **interpretive lenses** applied simultaneously.

### Can LLMs detect implied meaning?

Mixed results. **Holyoak et al. (2024)** found GPT-4 outperformed college students on interpreting novel literary metaphors from Serbian poetry (*Metaphor and Symbol*, Taylor & Francis). **Tian et al. (2024, NAACL)** achieved F1 = 0.8259 for metaphor identification using scaffolding prompts guided by Conceptual Metaphor Theory. But **Sravanthi et al. (2024, NAACL)** found a **~15% human-LLM gap** on presupposition tasks in their Pragmatics Understanding Benchmark. A *Scientific Reports* (2024) study found LLMs performed "at or below chance levels" on detecting manner implicatures. **Yamauchi et al. (2025)** found GPT-4 shows "systematic divergence" from human representations despite surface-level agreement on figurative language.

The pattern: LLMs handle **explicit metaphor and simile** reasonably well but struggle with **subtle pragmatic inference, cultural implicature, and multi-layered suggestion** — precisely the domain of vyañjanā.

### Recommendation for this project

Do not attempt to automate dhvani detection directly. Instead, implement dhvani as a **human-annotated metadata layer** with three values (literal, indicated, suggested) plus a "meaning-density" score. Use LLMs as first-pass filters to flag passages likely to carry suggested meaning (via metaphor detection and anomalous semantic density), then route flagged passages to human annotators trained in dhvani theory. This hybrid approach leverages LLM strength (surface-level figurative language detection) while acknowledging its weakness (deep semantic suggestion).

---

## Topic 3: Auchitya — 27 categories, zero computation

### The framework

Kshemendra's *AuchityavichāracharchĀ* (11th century, Kashmir) identifies **27 types of propriety** (auchitya) that a literary composition must observe. No computational work exists — not even a theoretical proposal.

The 27 categories cluster into four groups relevant to this project:

**Linguistic** (applicable to any prose): pada (word choice), vākya (sentence construction), kriyā (verb appropriateness), viśeṣaṇa (modifier fitness), karaka (grammatical case), liṅga (gender), vachana (number), upasarga (prefix), nipāta (particle).

**Aesthetic**: guṇa (literary qualities), alaṅkāra (figures of speech), rasa (sentiment appropriateness).

**Contextual** (highly relevant to spiritual prose): kāla (temporal appropriateness), desha (spatial fitness), kula (social context), vrata (tradition alignment), **tattva** (philosophical truthfulness), **sattva** (character consistency), **abhiprāya** (motive/intention), **svabhāva** (natural temperament), **sāra saṅgraha** (essential properties), **vichāra** (intellectual fitness), **avasthā** (state/condition appropriateness).

**Ceremonial**: nāma (naming), āśīrvāda (blessings/invocations), pratibhā (creative genius), prabandhartha (overall compositional coherence).

For Yogananda's prose, the most operative categories are **tattva** (is this passage philosophically truthful?), **avasthā** (is this passage appropriate to the reader's spiritual state?), **abhiprāya** (what is the authorial intention — to teach, to inspire, to console?), **vichāra** (what is the intellectual mode — analytical, devotional, narrative?), and **prabandhartha** (how does this passage function within the larger work?).

### Western equivalents have richer computational histories

**Propp's 31 narrative functions** have been computationalized extensively: **Finlayson (MIT, 2012–2017)** built deeply annotated corpora of Russian folktales with multi-level annotation enabling ML of Proppian structure. **Gervás et al. (2013–2025)** used Proppian morphology for story generation across multiple papers. A **Python library (PROPP)** by Bourgois & Poibeau (2025) exists on GitHub for French literary text analysis.

**Barthes' nuclei/catalysts** have been less computationalized but are well-theorized: nuclei are "real hinge-points" (deleting one alters the story); catalysts "fill the blanks"; indices carry implicit connotation; informants provide explicit facts.

The key difference: Propp and Barthes classify **structural roles** (what does this element do?), while auchitya classifies **dimensions of fitness** (is this element appropriate here?). Auchitya is fundamentally **evaluative**, the Western frameworks are **descriptive**.

### Progressive revelation

The concept that spiritual texts gradually unfold deeper teachings maps to several auchitya categories: kāla-auchitya (temporal propriety), avasthā-auchitya (readiness-calibrated teaching), and prabandhartha-auchitya (compositional arc). **No computational treatment exists.** This could be modeled as: topic evolution (tracking concept development), complexity metrics (measuring increasing conceptual depth), and prerequisite detection (which teachings presuppose which others).

### Recommendation for this project

Adapt auchitya's contextual categories into a **passage-function facet** with ~8 values: teaching/instruction, narrative/story, devotional invocation, philosophical argument, experiential description, consolation/encouragement, warning/admonition, and blessing/benediction. This captures the **abhiprāya** (intention) and **avasthā** (situational fitness) dimensions most relevant to a reading portal. Label this facet "passage mode" or "authorial intention" rather than using the Sanskrit term, per dual-vocabulary principles.

---

## Topic 4: Twenty-three contemplative states that no NLP taxonomy captures

### What has been partially operationalized

**Yaden et al. (2017)** came closest to operationalizing William James for text analysis. In "The Noetic Quality: A Multimethod Exploratory Study" (*Psychology of Consciousness*, 4(1), 54–62), 701 participants' written descriptions of mystical experiences were analyzed using LIWC. Key finding: "more real" experiences (69% of participants rated mystical experiences as more real than usual reality) correlated with more language of **connection and certainty** ("love," "all," "everything") and **fewer first-person pronouns and tentative language** ("I," "me," "think," "probably"). This provides **linguistic markers** for noetic quality — but it's word-counting on self-reports, not a classifier for literary/sacred text.

**Ji & Raney (2020)** published the **Self-Transcendent Emotion Dictionary (STED)** (*PLOS ONE*): a **351-word lexicon** covering awe, admiration, elevation, gratitude, inspiration, and hope, validated against ~4,000 human-coded *New York Times* articles. Designed for LIWC-style bag-of-words analysis. Limitation acknowledged by authors: "cannot account for rhetorical techniques" — purely word-counting, not contextual. Never validated on sacred text.

**The MEQ30/MEQ43** (Mystical Experience Questionnaire, Barrett et al. 2015) confirms James's categories factor-analytically: Sacred Unity, Noetic Quality, Time-Space Transcendence, Ineffable & Paradoxical. But this is a self-report instrument, not a text classifier.

**EmoBank** (Buechel & Hahn, 2017/2022) provides **10,000 English sentences with bi-perspectival annotation** — writer's emotion vs. reader's emotion — in Valence-Arousal-Dominance format. This addresses the "described vs. evoked" distinction but only for general secular text.

**Haider et al. (2020)** annotated poetry with **9 aesthetic emotions** (joy, sadness, uneasiness, vitality, suspense, awe/sublime, humor, annoyance, nostalgia) derived from Schindler et al.'s (2017) aesthetic emotion factors. This is the closest existing work to contemplative text emotion taxonomy — it includes "awe/sublime" — but lacks any specifically sacred states.

### What has not been operationalized at all

**Rudolf Otto's numinous** (mysterium tremendum et fascinans, 1917): zero computational detection. No lexicon, no classifier, no annotated corpus. The paradoxical nature (simultaneously terrifying AND fascinating) makes it unsuitable for simple sentiment approaches. Complete gap.

**Christian mystical states** (John of the Cross's dark night, Teresa of Ávila's seven mansions, Eckhart's Gelassenheit): zero NLP or text mining work found. Thousands of phenomenologically rich texts exist that could serve as training data, but nobody has attempted classification.

**Contemplative neuroscience categories** (Davidson/Lutz: focused attention, open monitoring, loving-kindness, non-dual awareness): mapped exclusively to brain signals (EEG/fMRI), **never to text**. Weng et al. achieved ~83% accuracy classifying meditation states from fMRI. But no text-based analogue exists.

### The 23 states missing from all NLP taxonomies

GoEmotions (Demszky et al., ACL 2020) — the dominant NLP emotion taxonomy — has **27 categories derived from Reddit comments with religion words explicitly filtered out**. The following contemplative states are absent from GoEmotions AND every other published NLP taxonomy:

Reverence/veneration, **devotion (bhakti)**, surrender to divine will, **bliss/ecstasy (ānanda)** — qualitatively distinct from "joy," numinous experience, **ineffability**, noetic quality (conviction of knowing), cosmic consciousness/unity, mystical union (*unio mystica*), **non-dual awareness**, equanimity (*upekkhā*), **longing/yearning for the divine** (*Sehnsucht*, spiritual *eros*), desolation (spiritual dryness/dark night), consolation (divine comfort), contrition/compunction (distinct from "remorse"), creature-feeling (awareness of finitude before the sacred), elevation (moral uplift), self-transcendence/ego dissolution, **peace that surpasses understanding** (distinct from "relief"), detachment/Gelassenheit, holy dread (distinct from ordinary fear), and kenosis (self-emptying).

Plaza-del-Arco et al. (2024, LREC) confirmed in "Emotion Analysis in NLP: Trends, Gaps and Roadmap" that NLP over-relies on Ekman's 6 basic emotions — designed to explain universal facial expressions, not to provide comprehensive emotion coverage — with "no interdisciplinary engagement" from positive psychology, contemplative science, or philosophy of religion.

### The described-vs-evoked problem

Sacred text has a **triple function** that no existing framework captures: it (1) **describes** spiritual states, (2) **attempts to evoke** spiritual states in the reader, and (3) may serve as a vehicle for **direct spiritual transmission** — a performative category with no NLP analogue. EmoBank's bi-perspectival approach (writer's emotion vs. reader's emotion) handles the first two, but the third — text as transformative encounter — has no computational model.

### Recommendation for this project

Build a **purpose-specific contemplative emotion taxonomy** of ~15–20 states organized in 3 tiers:

**Core states** (high frequency in Yogananda's prose, reliable classification): devotion/bhakti, peace/shānta, bliss/ānanda, awe/wonder, compassion/karuṇā, divine love/mādhurya, longing/yearning, gratitude.

**Extended states** (moderate frequency, lower classification confidence): surrender, consolation, noetic insight, cosmic consciousness, holy dread/reverential fear, equanimity, desolation/dark night.

**Rare/complex states** (infrequent, requires expert annotation): non-dual awareness, mystical union, ineffability, kenosis/self-emptying.

Classify each passage with **dual perspective tags**: "describes [state]" and "evokes [state]," each with confidence scores. Use multi-label classification — passages routinely express multiple simultaneous states (e.g., "devotion + longing + awe" at different intensities).

---

## Topic 5: Every sacred text project preserves its own categories

### Cross-cultural emotion research

The foundational problem is stark: **Indian and Western emotion categories are fundamentally non-equivalent.** The Stanford Encyclopedia of Philosophy entry on emotion in classical Indian philosophy states: "The Western categories of 'cognition' and 'emotion' do not have equivalents in classical Indian philosophy." Rasa is not "emotion" — it is a superposition of transitory, dominant, and temperamental emotional states experienced aesthetically by a prepared reader (sahṛdaya). **Kathuria, Kapadia & Friedlmeier (2023)** in "Emotion Socialization in the Indian Cultural Context" (*Online Readings in Psychology and Culture*) note that empirical research has "solely focused on Western emotion conceptualizations" and call for incorporating rasa theory.

**Mukhopadhyay & Miyapuram (2022)** used EEG to classify brain responses to 9 rasas via Bollywood film clips (*Brain Informatics*). Random Forest classifiers achieved differentiation, but bhayānaka (fear) and bībhatsa (disgust) showed high similarity — suggesting these two rasas may map onto a shared "unpleasant" dimension in Western circumplex models, while other rasas (particularly shānta and adbhuta) have no clean Western mapping.

### How existing digital sacred text projects handle categories

**Sefaria** (Jewish texts, 775,000 monthly users): uses MongoDB with hierarchical categories mirroring Jewish internal taxonomy (Tanakh, Talmud, Midrash, Halakhah, Kabbalah, Liturgy, Philosophy, Chasidut, Musar). Crucially, intertextual connections are first-class data objects. No emotion metadata.

**CBETA** (Chinese Buddhist texts): TEI P5 XML encoding, ~4,620 texts organized by traditional Taishō canon structure. Classification follows Buddhist canonical divisions (sūtra, vinaya, abhidharma, commentaries). No theme-based or emotional metadata.

**Quran.com and related projects**: structural metadata (surah, ayah, juz, hizb) is well-standardized. Thematic classification is contested — various computational approaches exist (TF-IDF + Word2Vec topic classification, LDA topic modeling) but no universally accepted schema. No emotion classification.

The universal pattern: **all three projects privilege tradition-internal organizational logic over generic cross-tradition categories.** None use emotion or aesthetic metadata natively.

### The perennialism debate constrains design

The question of universal contemplative states (peace/shānta/shalom/salām/nibbāna) is far from settled. **Ralph Hood's M-Scale** provides psychometric support for a "common core" of mystical experience across traditions. But **Steven Katz** argues "there are NO pure (unmediated) experiences" — all mystical experiences are culturally constructed. Current scholarly consensus, per the Stanford Encyclopedia of Philosophy: the perennial position "is largely dismissed by scholars" but retains popularity. **Kenneth Rose (2016)** advocates a softer "perennial phenomenology" based on common experiential features rather than doctrinal claims.

The implication for taxonomy design: phenomenological overlap can be acknowledged (a mapping layer connecting shānta → shalom → salām → nibbāna) without asserting doctrinal equivalence.

### Recommendation for this project

Implement a **dual-vocabulary architecture**: a system-facing taxonomy using precise analytical terms (e.g., "devotional_absorption_high_intensity") mapped to multiple user-facing vocabularies (Sanskrit terms for Indian-tradition users, English contemplative terms for general users, potentially tradition-specific terms for cross-tradition search). Sefaria's approach — technical MongoDB schema underneath, culturally appropriate labels for users — is the precedent. The culturally-aware NLP taxonomy from MIT Press (*TACL*, 2024) provides a framework for maintaining cultural specificity: capture culture in both the data and the labels.

---

## Topic 6: LLMs can probably do this at moderate accuracy

### Current capability for literary/aesthetic classification

No dedicated benchmark exists for sacred text aesthetic classification. The closest: the **Literary Theme Ontology Benchmark (2025)** achieved best F1 of **0.50** on 644 TV episode summaries annotated with 2,977 hierarchically organized literary themes (*Journal of Open Humanities Data*). **EmoLLMs** (Li et al., 2024, arXiv 2401.08508) — the first open-source instruction-following LLMs for affective analysis — outperformed ChatGPT and GPT-4 on most affective tasks using a 234K-sample training set. The comprehensive survey by arXiv 2508.07959 (2025), covering 200+ papers on subjective language understanding, found GPT-4 "roughly at human level on sentiment, emotion intensity, and political stance classification, but sarcasm detection remained a stumbling block."

### Realistic inter-annotator agreement

For contemplative text annotation, expect **κ = 0.25–0.45** (fair to moderate). For comparison: 3-class sentiment analysis achieves κ = 0.60–0.80; fine-grained emotion (6–8 classes) achieves κ = 0.30–0.60; sarcasm detection often falls below κ = 0.35. **Saini & Kaur (2020)** achieved κ = 0.78 for 9-category rasa annotation of Punjabi poetry — encouragingly high, likely because formal poetic conventions constrain interpretation. Spiritual prose, with its greater ambiguity and experiential depth, will show lower agreement.

This means classifier performance should be evaluated against the **ceiling set by human agreement**, not against a theoretical 100%. A classifier achieving κ = 0.35–0.40 agreement with human annotators may be performing near the achievable ceiling.

### Persona prompting is directly applicable

**Hu & Collier (ACL 2024)** found persona prompting yields small but significant improvements for subjective NLP tasks, though when persona variables explain less than R² = 0.10 of target variance, gains are unlikely. **Kim et al. (2024)** achieved **+9.98% average accuracy** combining persona and neutral prompts in a "Jekyll & Hyde" framework across 12 reasoning datasets. **Atil et al. (January 2026)** showed that aggregating multiple persona-conditioned prompts via SVM meta-ensembling outperformed any single persona on subjective classification.

A **"read as devotee" vs. "read as scholar" dual-prompt approach** is well-supported by this evidence. The prediction: devotee-perspective prompting will increase identification of bhakti rasa, shānta, and experiential states; scholar-perspective will favor analytical categories like "teaching" or "philosophical argument." An ensemble of both perspectives, aggregated via a meta-classifier, should outperform either alone.

### Validation without ground truth

The **perspectivist turn in NLP** directly addresses this challenge. **Basile et al. (2021, AAAI)** proposed a spectrum from "gold standard" (single aggregated label) to "diamond standard" (preserving all individual annotator labels). **Xu & Jurgens (2025)** synthesized modeling approaches that explicitly treat disagreement as signal, not noise. **Davani et al. (*TACL*, 2022)** showed multi-annotator models "better preserve minority perspectives usually sidelined by majority votes." The practical framework:

- Preserve annotator-level labels (diamond standard)
- Evaluate against the distribution of human judgments, not majority vote
- Use soft metrics (cross-entropy with soft labels)
- Test **downstream utility**: does the classification improve the user's ability to find passages that serve their contemplative needs?

### Recommendation for this project

Use a **prompted LLM pipeline** (GPT-4-class or fine-tuned open model) with dual persona prompting (devotee + scholar), outputting per-category probability scores across the contemplative emotion taxonomy. Validate against a small expert-annotated corpus (200–500 passages, 3–5 annotators per passage including both scholar and practitioner perspectives). Target **macro-F1 ≥ 0.45** for the full taxonomy and **F1 ≥ 0.60** for core high-frequency states (devotion, peace, awe, teaching). Accept that some states (non-dual awareness, mystical union) may be classifiable only by human experts.

---

## The unasked questions that will determine success

### Multiple overlapping taxonomies beat a single unified one

The evidence is unambiguous. **Ranganathan's faceted classification** (foundational in library science) demonstrated that hierarchical single-taxonomy schemes are "too limiting and finite" for multi-aspect content. For this project, the recommended architecture is **4–5 orthogonal facets** applied independently to each passage:

- **Contemplative emotion** (the ~15–20 state taxonomy above, multi-label with confidence scores)
- **Dominant rasa** (9 navarasa + optional bhakti sub-classification)
- **Passage mode** (teaching, narrative, devotional, philosophical, experiential, consolation, warning, blessing)
- **Meaning density** (literal-dominant, metaphor-rich, suggested/vyañjanā — a dhvani-inspired scale)
- **Contemplative depth** (introductory, intermediate, advanced — mapping to progressive revelation)

Each facet is simpler and shallower than a single unified taxonomy would be. Users can filter by any combination. The system can surface passages matching "devotion + awe + experiential + high meaning-density + advanced" — a query impossible with a flat taxonomy.

### Start fixed, then evolve

GoEmotions' development process is the gold standard: start with a principled taxonomy derived from expert knowledge (56 candidate categories), pilot-annotate, then iteratively remove low-agreement categories and add frequently-suggested ones. The final 27 categories emerged from data, not just theory. For this project: **design version 1.0 from rasa theory, contemplative phenomenology, and close reading of Yogananda's prose; annotate 500 passages; evaluate inter-annotator agreement per category; prune low-agreement categories; add categories that annotators consistently want but lack; release version 2.0.** Plan for 2–3 revision cycles.

### Fuzzy classification is essential, not optional

The evidence strongly favors **soft/probabilistic classification** for subjective aesthetic content. The **TERMS model (2022)** uses Gaussian Mixture Models to parameterize emotion distributions, acknowledging that "users may perceive different emotions from the same text." **Calvo & Kim (2013)** found dimensional (continuous) models outperform discrete categorical models for emotion in text. **Appraisal theory approaches** (Troiano et al., *Computational Linguistics*, MIT Press, 2023) show that modeling *why* an emotion is felt (cognitive appraisal dimensions) is more expressive than basic categorization.

For contemplative text specifically: a passage of Yogananda describing samādhi might register as 0.8 bliss + 0.6 peace + 0.4 cosmic consciousness + 0.3 ineffability. Forcing a single label would lose most of the information. Every passage should carry a **probability vector across all taxonomy categories**.

### Classification does risk reducing transformative encounters to metadata

This is a real concern, not a theoretical one. **"Modeling the Sacred: Considerations when Using Religious Texts in NLP" (arXiv, 2024)** found that sacred texts in NLP "have generally been treated as just data, overlooking their sacred dimensions, their cultural significance, and their histories." Over 60% of papers using sacred texts were published 2019–2023, indicating accelerating instrumentalization. **Rockwell & Berendt** remind us that all data is "capta" — captured, not given — a constructed representation. **"Sensing Sacred Texts" (Watts, ed., Equinox)** explicitly asks how digital media challenges the material, embodied, sensory dimension of sacred text engagement.

The mitigation: design classification explicitly as a **finding aid** that points toward transformative encounters, not as a substitute. The portal should present metadata as an invitation — "passages readers describe as evoking deep peace" — not as a definitive label. Consider including a "beyond classification" marker for passages that multiple annotators flag as irreducible to categories. The taxonomy should acknowledge its own limits.

---

## Conclusion: what this research changes

This project sits at the intersection of three well-developed but completely disconnected fields: Indian aesthetic theory (rasa, dhvani, auchitya — rich philosophical frameworks, zero computation), contemplative science (sophisticated phenomenological categories, mapped only to brain signals), and NLP emotion classification (powerful multi-label classifiers, blind to everything contemplative). The core opportunity is not technical but conceptual: **bridging these fields for the first time**.

The most important design decision is not which classifier to use but **which taxonomy to build**. The 23 contemplative states missing from all existing NLP taxonomies represent not just a gap but a statement about what computational culture has valued and what it has ignored. Building this taxonomy — grounded in rasa theory, informed by contemplative phenomenology, validated against the actual text of a spiritual master — would be a genuine contribution to computational humanities, not merely a product feature.

Three findings should shape what comes next. First, **rasa theory is more ready for computation than anyone has attempted** — the BERT-based 80% accuracy on English poetry emotion suggests a fine-tuned model on well-annotated Yogananda passages could achieve workable performance for core states. Second, **dhvani (layers of meaning) is the hardest problem and the most valuable** — LLMs cannot reliably detect suggested meaning, but even a crude meaning-density score would transform the search experience. Third, **the perspectivist annotation framework solves the "no ground truth" problem** — rather than forcing consensus on what a passage "means," preserve the distribution of interpretations. A passage that 3 of 5 annotators label "devotion" and 2 label "longing" is not noisy data; it is accurate data about a passage that holds both.