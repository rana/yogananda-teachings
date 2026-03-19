## Research Request: Contemplative Emotion and Aesthetic Taxonomy — Building the Vocabulary That Doesn't Exist (2026)

### Project Context

I am building a free, world-class online teachings portal that makes Paramahansa Yogananda's published books (Self-Realization Fellowship and Yogoda Satsanga Society of India) freely accessible worldwide. Late 2026 launch. The portal is a search-and-reading experience — not a chatbot, not a generative AI tool. The AI is a librarian: it finds and ranks verbatim published text, never generates or paraphrases content.

**The architectural question this research addresses:**

The portal classifies every passage at ingestion time with structured metadata: topic, emotional quality, experiential depth, voice register, and contemplative depth signature. Multiple proposed features depend on a vocabulary for the *kinds of experience* sacred text evokes:

- **Depth signatures** (FTR-127): classifying passages as bottomless (rewards endless return), informational (answers a question), catalytic (shifts something when ready), or consoling (meets suffering)
- **Structural enrichment** (FTR-128): classifying chapters and books using Indian literary theory — rasa (aesthetic experience evoked), dhvani (hidden meaning beneath the surface), auchitya (architectural fitness/propriety)
- **Cross-work concordance** (FTR-165): connecting the same teaching across books along four dimensions: structural, rasa, dhvani, auchitya
- **Transition navigation** (FTR-162): curated passage arcs from one emotional state to another ("afraid to peaceful," "grieving to accepting")
- **Four Doors** (FTR-138): recognition-based entry points meeting seekers where they are emotionally ("I am searching," "I am struggling," "I want to understand," "I want to practice")
- **Non-topical search retrieval** (FTR-020): searching by emotional register, contemplative depth, or aesthetic quality rather than topic

**The problem: no adequate taxonomy exists.**

Two previous deep research reports independently confirmed this gap:
- Existing emotion taxonomies (Plutchik's 8, Ekman's 6, GoEmotions' 27, NRC Emotion Lexicon) do not include devotion, cosmic awe, divine longing, inner stillness, surrender, reverence, or the specific quality of consolation that sacred text provides
- The navarasa framework (9 aesthetic experiences from Indian literary theory) is promising but has never been computationalized for prose text — only for drama, dance, and music
- Dhvani (suggested meaning) and auchitya (structural fitness) have no computational implementations anywhere
- No contemplative emotion taxonomy has been built for any sacred text corpus
- The contemplative neuroscience literature (Davidson, Lutz, Mind & Life Institute) identifies distinct meditative states but hasn't produced a text-applicable taxonomy

**The portal needs a taxonomy that:**
1. Covers the full range of emotional and aesthetic experiences Yogananda's texts evoke — including states that secular NLP has no vocabulary for
2. Serves both Indian and Western readers — the categories must be culturally legible across traditions
3. Is computationally applicable — Claude Opus must be able to classify passages using this taxonomy reliably
4. Distinguishes between the emotion *described* in a passage and the emotion *evoked* by reading it (these often differ — a passage describing Yogananda's grief at his mother's death evokes compassion and consolation, not grief)
5. Handles multi-register simultaneity — a single passage can be humorous on the surface, devotional in register, philosophical in argument, and experiential in depth simultaneously
6. Is grounded in the tradition's own categories where possible — using rasa rather than importing Western emotion labels that distort

**Corpus characteristics:**
- Yogananda's published works span autobiography, scriptural commentary (Gita, Bible, Rubaiyat), collected talks, affirmations, prayers, and poetry
- Register ranges from intimate personal narrative to cosmic philosophical argument to practical instruction to ecstatic devotion — often within a single chapter
- Sanskrit spiritual vocabulary is embedded throughout English prose (samadhi, karma, dharma, maya, pranayama, kundalini) — these terms carry precise meaning not captured by translation
- Cross-tradition parallels are pervasive — Yogananda systematically bridges Hindu and Christian vocabulary (AUM/Holy Ghost, kundalini/serpent power, samadhi/divine communion)
- The writing is simultaneously accessible to newcomers and profound for advanced practitioners — the same passage genuinely means different things at different levels of spiritual development

---

### Research Topics

For each topic below, I need: (a) named taxonomies, frameworks, papers, or traditions with dates and citations, (b) computational applicability — has this been used in NLP, text classification, or information retrieval? (c) cultural scope — does this work across Indian and Western contexts, or is it tradition-specific? (d) specific applicability to Yogananda's corpus (prose, English with Sanskrit terminology, multi-register, accessible-to-advanced range). **Go directly to the substance. Do not provide introductory explanations of emotion classification or literary theory.**

#### 1. Indian Literary Theory — Rasa Beyond the Navarasa

The navarasa (nine aesthetic experiences: shringara/love, hasya/humor, karuna/compassion, raudra/fury, vira/heroic, bhayanaka/fear, bibhatsa/disgust, adbhuta/wonder, shanta/peace) provide the portal's primary aesthetic vocabulary. Two previous research reports identified rasa as the most promising framework. But:

Specific questions:
- **Rasa computational implementations**: The Claude research report cites SVM-based rasa classification at 66-87% accuracy. What are the specific studies? What texts were classified? What features were used? What were the failure modes? Are there more recent (2024-2026) implementations using LLMs?
- **Rasa in prose vs. drama**: Classical rasa theory was developed for drama (Bharata's Natyashastra) and poetry (Anandavardhana's Dhvanyaloka). Yogananda's texts are primarily prose. How does rasa theory apply to prose? Are there scholarly treatments of rasa in non-dramatic, non-poetic text? Specifically in spiritual prose or philosophical argument?
- **Rasa distribution in sacred text**: If you classify the *Autobiography of a Yogi*'s 49 chapters by dominant rasa, what distribution would you expect? Is shanta (peace/serenity) dominant? How does vira (heroic resolve) manifest in spiritual autobiography? Is adbhuta (wonder/amazement) the most common rasa for passages describing mystical experience?
- **Rasa at multiple granularities**: A chapter may have a dominant rasa (shanta) while individual passages carry different rasas (karuna in a grief scene, vira in a determination scene, adbhuta in a vision scene). How should rasa be classified at chunk, chapter, and book level? Is the chapter's rasa the "resolution" rasa (where the arc ends), the dominant rasa, or something else?
- **Beyond the nine**: Are there extended rasa frameworks beyond the canonical nine? The shanta rasa was itself a late addition (not in Bharata's original eight). Are there scholarly proposals for additional rasas relevant to spiritual text — such as a "devotional" rasa (bhakti rasa), a "transcendent" rasa, or an "instructional" rasa?
- **Rasa as retrieval dimension**: If a seeker's query carries emotional valence ("I feel afraid" → bhayanaka context, seeking shanta or vira resolution), can rasa be a first-class retrieval signal? Has anyone built a search or recommendation system using rasa categories?

#### 2. Dhvani — The Layers of Meaning

Anandavardhana's *Dhvanyaloka* (9th century) defines three layers of meaning: abhidha (literal/denotative), lakshana (indicated/secondary), and vyanjana (suggested/evoked). In Yogananda's writing, a story about his childhood dog dying is literally about a pet's death (abhidha), indicates the universality of loss (lakshana), and suggests the soul's immortality and the illusion of death (vyanjana). The suggested meaning is the "real" teaching — the surface narrative is the vehicle.

Specific questions:
- **Has dhvani been computationalized?** The Claude research report states "dhvani has never been computationalized" — is this still true? Are there any NLP papers, even theoretical, that attempt to formalize the abhidha/lakshana/vyanjana distinction computationally?
- **Dhvani detection in practice**: For a human reader trained in dhvani theory, how do they identify the vyanjana (suggested meaning) of a passage? What textual signals indicate that a passage has meaning beyond its surface? Could these signals be described precisely enough for an LLM to detect them?
- **Dhvani in Yogananda specifically**: Yogananda's writing is notable for embedding profound spiritual teachings in accessible narratives. The *Autobiography of a Yogi* chapter about the "Cauliflower Robbery" is literally about a childhood prank, but suggests deeper teachings about karma, honesty, and the guru-disciple relationship. Are there scholarly analyses of how Yogananda uses narrative as vehicle for suggestion?
- **Dhvani as navigation**: If passages are classified by their dhvani depth (surface only → surface + indicated → surface + indicated + suggested), this creates a "reading depth" axis. A first-time reader might prefer passages with clear surface meaning; an advanced reader might seek passages with rich vyanjana. Is this a valid navigation dimension? Has it been used in any literary or pedagogical system?
- **Dhvani across traditions**: The Christian tradition has analogous concepts — typological reading (Old Testament events as "types" of New Testament events), the four senses of Scripture (literal, allegorical, moral, anagogical). Are there scholarly comparisons between dhvani and Christian hermeneutical layers? Could a unified framework serve both traditions — given that Yogananda explicitly bridges Hindu and Christian interpretation?
- **Dhvani and LLMs**: Can Claude Opus, given a passage and its chapter context, reliably identify suggested meaning that goes beyond the literal? Is this the kind of task where the 17-point GPQA gap between Opus and Sonnet matters? What prompting strategies would help an LLM detect vyanjana?

#### 3. Auchitya — Structural Fitness and Propriety

Kshemendra's *Auchityavicharacharcha* (11th century) defines 27 categories of structural fitness — how well each element of a text serves its context. This is not "quality" (good/bad) but "fit" (does this passage serve its role in the larger structure?). For the portal, auchitya could classify how each passage serves the book's architecture: this passage is a necessary foundation (the reader needs this before what follows), this passage is the climax (everything has built to this), this passage is a coda (reflecting on what came before).

Specific questions:
- **Has auchitya been computationalized?** The Claude research report states it hasn't. Has any computational work emerged since March 2026? Any theoretical proposals?
- **Kshemendra's 27 categories**: What are the specific 27 categories of auchitya? Which ones apply to prose spiritual text (as opposed to drama or poetry)? A complete list with definitions and applicability assessment would be enormously valuable.
- **Auchitya as architectural metadata**: If each passage is classified by its architectural role (foundation, development, climax, resolution, digression, illustration, transition), this creates navigable book architecture. "Show me the climactic passages of Chapter 15" or "Show me where this concept is first introduced." Has anyone used structural role classification for text navigation?
- **Auchitya in Western literary theory**: Does Western narrative theory have equivalent concepts? Barthes' "nuclei" and "catalysts" (cardinal vs. supplementary narrative functions)? Propp's narrative functions? The five-act structure? How do these compare to auchitya's more granular categories?
- **Auchitya and progressive revelation**: Yogananda's writing often introduces a concept simply, then returns to it with greater depth across chapters or books. Auchitya could classify the role of each presentation: "first introduction," "deepening," "practical application," "experiential description," "resolution." Has anyone formalized progressive revelation as an auchitya-adjacent concept?

#### 4. Contemplative Emotion Taxonomy — What Doesn't Exist Yet

The portal needs to classify the emotional quality of passages in ways that existing emotion lexicons cannot. "Joy" in GoEmotions is not the same as the joy Yogananda describes when consciousness merges with the Infinite. "Awe" in Keltner's framework approaches but doesn't reach the specific quality of encountering divine presence in text.

Specific questions:
- **William James' taxonomy** (*Varieties of Religious Experience*, 1902): James identified noetic quality, ineffability, transiency, and passivity as marks of mystical experience. He also cataloged specific states: cosmic consciousness, conversion experience, mystical union, saintliness. Has anyone operationalized James' categories for text classification? Could they serve as a contemplative emotion taxonomy?
- **Dacher Keltner's self-transcendent emotions**: Keltner has studied awe, compassion, gratitude, elevation, and admiration as a distinct emotional cluster. How has this work been computationalized? Are there NLP resources (lexicons, classifiers) for self-transcendent emotions? How well do they cover the specific states Yogananda's texts evoke?
- **Contemplative neuroscience states**: Richie Davidson, Antoine Lutz, and the Mind & Life Institute have identified neurologically distinct meditative states: focused attention, open monitoring, loving-kindness, non-dual awareness. If these are neurologically distinct, they should be taxonomically distinct. Has anyone mapped these to textual descriptions?
- **Rudolf Otto's "numinous"**: *Das Heilige* (1917) defines the numinous — the experience of the holy — as mysterium tremendum et fascinans (mystery that terrifies and attracts). Is there computational work on detecting numinous quality in text?
- **Christian mystical states**: John of the Cross (dark night of the soul, spiritual betrothal, spiritual marriage), Teresa of Avila (seven mansions/dwelling places), Meister Eckhart (Gelassenheit/detachment, Durchbruch/breakthrough). These are precisely described contemplative states from the Western mystical tradition. Has anyone computationalized them? They're relevant because Yogananda explicitly bridges Hindu and Christian mysticism.
- **Yogananda's own vocabulary**: Yogananda uses specific terms for specific states: divine joy (ananda), cosmic consciousness, superconsciousness, Christ consciousness, God-contact, soul perception, bliss, divine love, inner peace. These form a de facto contemplative taxonomy already present in the corpus. Has anyone extracted and organized this vocabulary systematically?
- **The "described vs. evoked" distinction**: A passage *describing* cosmic consciousness evokes *wonder* (adbhuta rasa) in the reader. A passage *describing* a death evokes *compassion* (karuna rasa). The emotion in the text and the emotion in the reader are different. How should the taxonomy handle this? Dual classification (text emotion + reader emotion)? Which matters more for retrieval?
- **Multi-state simultaneity**: A single passage can evoke peace, awe, longing, and gratitude simultaneously. How should a taxonomy handle this? Weighted multi-label? Primary + secondary + tertiary? Are there emotion classification systems that handle genuine simultaneity rather than forcing single-label?

#### 5. Cross-Cultural Legibility — Indian and Western Together

The portal serves Indian and Western readers with the same taxonomy. Rasa theory is native to Indian readers but unfamiliar to Western readers. Western emotion labels are familiar to Western readers but may distort when applied to Indian contemplative text. The taxonomy needs to be grounded in the tradition's own categories (rasa, dhvani) while remaining legible to seekers who have never heard these terms.

Specific questions:
- **Cross-cultural emotion research**: Are there studies comparing how Indian and Western readers categorize emotions in spiritual text? Do they agree on which passages are "consoling" or "inspiring"? Or do cultural frameworks produce different categorizations?
- **Bilingual category mapping**: For a taxonomy used in both English and Hindi interfaces, how should categories be presented? English labels with Sanskrit parentheticals? Hindi labels with English explanations? User-selectable vocabulary? What do multilingual digital projects (Sefaria, Quran.com, CBETA) do with culturally-specific categories?
- **The "universals" question**: Are there contemplative states that appear across all traditions and could serve as universal anchors? "Peace" (shanta/shalom/salaam/nibbana) seems universal. "Devotion" (bhakti) may be tradition-specific. Which categories are genuinely cross-cultural, and which require cultural context?
- **Avoiding doctrinal flattening**: The Gemini research report warns about "imposing secular methodologies on sacred texts." How do you use categories from one tradition (Indian rasa) without distorting the text's meaning for readers from another tradition? Is there scholarly guidance on cross-cultural sacred text categorization?
- **User-facing vs. system-facing taxonomy**: Should the seeker-facing vocabulary differ from the system-facing taxonomy? Perhaps the system classifies using rasa (precise, tradition-grounded) but presents using English labels (peace, courage, wonder) in English-language interfaces and rasa terms in Hindi interfaces. Is this dual-vocabulary approach used in other multilingual systems?

#### 6. Computational Applicability — Can an LLM Classify This?

All of the above is useless if Claude Opus cannot reliably classify passages. The portal's enrichment pipeline runs Opus at ingestion time over chapter-length context (15,000-30,000 words). Each passage receives structured metadata output.

Specific questions:
- **LLM performance on aesthetic/emotional text classification**: What benchmarks exist for LLMs classifying literary or sacred text by emotional quality, aesthetic experience, or contemplative depth? Not sentiment analysis (positive/negative) — finer-grained aesthetic classification.
- **Rasa classification via LLM**: Has anyone prompted GPT-4, Claude, Gemini, or similar to classify text by rasa? What accuracy did they achieve? What prompting strategies worked? What failure modes appeared?
- **Suggested meaning detection**: Can LLMs reliably identify dhvani (suggested meaning beyond the literal)? This requires reading the text *and* understanding what it implies beyond what it says — a task where the Opus/Sonnet quality gap likely matters. Any studies on LLM ability to detect implied or suggested meaning in literary text?
- **Inter-annotator agreement benchmarks**: For contemplative emotion classification, what level of agreement between human annotators is realistic? The Claude research report suggests kappa = 0.40-0.60 for interpretive domains. Is this also the ceiling for LLM-human agreement? If human experts disagree, should the system store multiple valid classifications (perspectivist approach)?
- **Prompting strategies for contemplative classification**: What prompting patterns help LLMs engage with text as sacred/contemplative rather than merely literary? Does instructing the model to "read as a devotee" vs. "read as a scholar" vs. "read as a newcomer" produce different and valid classifications?
- **Validation without ground truth**: There is no annotated corpus of Yogananda's texts classified by rasa, dhvani, or contemplative state. How do you validate a taxonomy applied for the first time? Cross-annotator agreement with domain experts? Downstream utility testing (do the classifications improve search results)? Reader satisfaction assessment?

---

### Output Format

**Do not write an introductory essay about emotion classification, literary theory, or computational aesthetics.** Start directly with findings.

For each of the 6 topics, provide:

1. **What exists** -- Named taxonomies, frameworks, papers, lexicons, or implementations with dates and citations. Be specific: model names, accuracy numbers, corpus sizes, languages.
2. **What's been computationalized** -- Which frameworks have working NLP implementations? At what accuracy? On what text types?
3. **What's missing** -- Specific gaps: states not covered, traditions not addressed, text types not tested.
4. **Recommendation for this project** -- A specific taxonomy design recommendation for classifying Yogananda's corpus. Categories, hierarchy, multi-label strategy, cross-cultural presentation. What to adopt, what to create, what to defer.

**Prioritize specificity over comprehensiveness.** An accuracy number on a specific rasa classifier is worth more than a paragraph about rasa theory. A named contemplative state from James or Keltner with a description of how it manifests in text is worth more than a taxonomy diagram. A "this has never been done" is worth more than speculation presented as precedent.

**Special attention to three topics:**

**Topic 1 (Rasa beyond navarasa):** The portal's primary aesthetic vocabulary. The gap between "rasa theory exists" and "rasa classification works on English spiritual prose" must be closed — or acknowledged as requiring original work.

**Topic 4 (Contemplative emotion taxonomy):** This is the research most likely to produce genuinely novel output. If the research confirms that no adequate taxonomy exists, the portal must build one — and the research should provide enough foundation material (from James, Keltner, contemplative neuroscience, mystical tradition descriptions) to guide that construction.

**Topic 2 (Dhvani):** The most architecturally significant category. If dhvani can be computationalized — even approximately — it unlocks the portal's most distinctive navigation dimension: surfacing the hidden teaching beneath the surface narrative. If it cannot, the portal needs to know that too.

### Questions I'm Probably Not Asking

- **Is a single taxonomy the right approach?** Maybe the portal needs multiple overlapping taxonomies — rasa for aesthetic experience, a contemplative state taxonomy for spiritual depth, a reader-need taxonomy for search retrieval, and a structural role taxonomy for navigation. Rather than one unified taxonomy, these could coexist as independent classification dimensions.
- **Should the taxonomy be fixed or evolving?** As more books are ingested and more passages classified, will the taxonomy need to grow? Should it be designed as extensible from the start? Or does a fixed vocabulary (the nine rasas, the four depth signatures) provide more value through consistency?
- **Is precision the right goal?** Maybe approximate, fuzzy classification is better than precise classification for contemplative text. "This passage is *somewhere between* shanta and karuna" may be more honest than "this passage is karuna." How do other systems handle classification uncertainty in aesthetic domains?
- **What would Yogananda's own taxonomy be?** He was a systematic teacher with precise vocabulary. Would he categorize his own passages differently than any of the frameworks discussed here? His own vocabulary (divine joy, cosmic consciousness, soul perception, etc.) may be the most authentic taxonomy — but it lacks the cross-tradition legibility the portal needs.
- **Does classification violate the spirit of the text?** Tagging a passage as "karuna rasa, 5/7 depth, consoling" reduces a potentially transformative encounter to metadata. Is there a risk that the taxonomy — designed to serve navigation — becomes a filter that pre-determines how seekers encounter the text? Does the Wanderer's Path (random discovery weighted by depth) serve seekers better precisely because it doesn't let them filter by category?
- **What about the states between states?** The most powerful passages may be those that produce states the taxonomy can't name — liminal, transitional, uncategorizable experiences. Does a taxonomy inherently miss what matters most? How do other classification systems handle the uncategorizable?

If any of these unasked questions lead to research with design-altering implications, include them.
