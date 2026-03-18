## Research Request: Discovery and Curation Without Behavioral Data — Amazing Experiences Under DELTA Privacy Constraints (2026)

### Project Context

I am building a free, world-class online teachings portal that makes Paramahansa Yogananda's published books (Self-Realization Fellowship and Yogoda Satsanga Society of India) freely accessible worldwide. Late 2026 launch. The portal is a search-and-reading experience — not a chatbot, not a generative AI tool. The AI is a librarian: it finds and ranks verbatim published text, never generates or paraphrases content.

**The architectural question this research addresses:**

The portal operates under the DELTA privacy framework (Dignity, Embodiment, Love, Transcendence, Agency), which produces privacy protections exceeding any single regulation. The concrete constraints:

- Zero user identification
- Zero session tracking
- Zero behavioral profiling
- Zero cross-device tracking
- No collaborative filtering ("seekers who read this also read...")
- No behavioral recommendations
- No click-through tracking
- No dwell-time analysis
- No reading history stored server-side
- Analytics limited to ~5 anonymized event types (page view, search query, book opened, chapter read, Quiet Corner timer started)
- Curation algorithms derive intelligence from the *corpus*, never from user behavior patterns — even anonymized or aggregated

**Despite these constraints, the portal aspires to discovery experiences that feel curated, personal, and amazing.** Not "good enough given the privacy constraints" — genuinely world-class. The project principle is: "Every interaction should amaze — and honor the spirit of the teachings it presents."

**The discovery features that must work without behavioral data:**

- **Today's Wisdom**: A single passage shown to all seekers worldwide each day. Selected from a curated pool. Must feel like the right passage for today — not random, not algorithmic, not personalized.
- **Wanderer's Path** (FTR-140): "Take me somewhere." Selects a passage weighted by contemplative depth, avoiding recent repetition (tracked in browser localStorage only). The digital equivalent of opening a beloved book to a random page.
- **Four Doors** (FTR-138): Recognition-based emotional entry. "I am searching," "I am struggling," "I want to understand," "I want to practice." Maps emotional states to corpus territory without requiring seekers to know the tradition's vocabulary.
- **Transition Navigation** (FTR-162): Curated passage arcs from one emotional state to another. "Afraid to peaceful," "grieving to accepting." Editorially curated, not algorithmically generated.
- **Reading Threads** (FTR-063): Editorial multi-book reading paths tracing a spiritual theme as a coherent progression across passages from different books.
- **Related Teachings** (FTR-030): Pre-computed passage connections based on embedding similarity + knowledge graph traversal + structural enrichment. "Following the Thread" — navigating from one passage to related passages across the entire library.
- **Quiet Corner**: Breathing timer, contemplative affirmations, and curated passages for stillness. Content selection must feel curated without knowing who's visiting.
- **Theme browsing** (FTR-121/122): Browsable themes (Peace, Courage, Healing, Joy, Purpose, Love, plus situation themes, practice themes, person themes, scripture themes). Each visit shows a different random selection from the theme's tagged passages.
- **Search suggestions** (FTR-029): Autocomplete powered by a corpus-derived dictionary — not query logs, not user history.
- **Passage resonance signals** (FTR-031): Anonymous, aggregated counters (share count, dwell count, relation traversal count per passage). No timestamps, no session correlation. Rate-limited (1 increment per IP per hour). The only behavioral signal in the system — and it's strictly anonymous and aggregated.

**The corpus-derived intelligence available:**
- 14 enrichment fields per passage (topic, entity labels, emotional quality, depth, voice register, passage role, cross-references, relationship triples)
- Structural enrichment at chapter/book level (emotional arcs, narrative patterns, rasa/dhvani/auchitya)
- Cross-work concordance (same teaching appearing in different forms across books)
- Knowledge graph with typed relationships (TEACHES, DESCRIBES_STATE, CROSS_TRADITION, PROGRESSION_TO)
- Vocabulary Bridge mapping seeker vocabulary to corpus vocabulary with register awareness
- Calendar associations (dates linked to passages: Yogananda's life events, spiritual calendar)
- 18,540 verified English-Spanish translation pairs
- Passage depth signatures (bottomless, informational, catalytic, consoling)
- Entity registry with canonical forms and Sanskrit normalization

**The question: how do you build discovery experiences that feel curated by a wise librarian who knows you — when the librarian knows nothing about you, by design?**

---

### Research Topics

For each topic below, I need: (a) named projects, systems, papers, or traditions with dates and citations, (b) specific design patterns with implementation detail, (c) evidence of effectiveness — user studies, A/B tests, qualitative research, (d) applicability to a bounded sacred text corpus (~50K chunks, ~25 books, 10 languages) with rich metadata but zero user data. **Go directly to the substance. Do not provide introductory explanations of recommendation systems, privacy, or discovery.**

#### 1. Library Science — Serendipitous Discovery in Physical and Digital Libraries

Libraries have solved the discovery problem for centuries without tracking patrons. The "browsing effect" — finding what you didn't know you needed by physical proximity — is well-studied. Library classification systems (Dewey, LoC, faceted classification) are technologies for enabling discovery. Librarians themselves are human recommendation systems that work through conversation, not behavioral data.

Specific questions:
- **The browsing effect**: What does library science research say about how physical browsing leads to serendipitous discovery? What are the mechanisms — shelf proximity, visual scanning, cover design, subject headings? Has anyone translated these mechanisms to digital interfaces? Named projects, papers, designs.
- **Classification as discovery**: The portal has a rich classification system (themes, rasas, depth signatures, structural roles). Library classification enables discovery by making relationships visible. What does library science say about optimal classification granularity for discovery (too fine = overwhelming, too coarse = useless)? What is the sweet spot?
- **The librarian's recommendation**: When a librarian recommends a book, they use conversation (not behavioral data) to understand the patron's need, then apply deep knowledge of the collection. The portal's Four Doors and Transition Navigation attempt this pattern. Is there library science research on how librarians make recommendations? What signals do they use? How do they handle ambiguity?
- **Digital library discovery interfaces**: What have digital library projects (Europeana, DPLA, Internet Archive, HathiTrust, Library of Congress Digital Collections) learned about enabling discovery in digital collections without behavioral data? Named design patterns, user studies, lessons learned.
- **Reader's advisory**: The library practice of helping readers find their next book. Reader's advisory uses "appeal factors" — pacing, tone, character-driven vs. plot-driven, mood. The portal's enrichment metadata (rasa, depth, voice register) maps closely to appeal factors. Has reader's advisory been computationalized? Named systems (NoveList is one — are there others?).
- **Faceted discovery vs. recommendation**: Are there studies comparing the effectiveness of faceted browsing (user navigates via filters) vs. active recommendation (system suggests) for discovery in collections? Which serves better when no user history exists?

#### 2. Museum Curation — Guiding Through Emotionally Structured Space

Museums guide visitors through physical space organized by curatorial intelligence — not by visitor tracking. The experience feels curated and personal despite being the same for everyone. The portal's theme browsing, reading threads, and transition navigation are curatorial, not algorithmic.

Specific questions:
- **Curatorial geometry**: How do museum curators structure the visitor's journey? What principles govern sequencing — narrative arc, emotional pacing, contrast and echo, the "palette cleanser" between intense works? Are these principles documented in curatorial studies?
- **The Rijksmuseum Art Explorer**: Previous research reports mention this as a model for invisible metadata powering discovery. What specifically did the Rijksmuseum build? How does it work? What metadata powers it? What did they learn? Are there published design retrospectives?
- **The Met, V&A, Uffizi, MoMA digital experiences**: What have major museum digital platforms learned about enabling discovery in large collections without behavioral data? What design patterns emerged? Named implementations and evaluations.
- **Exhibition design as reading thread design**: The portal's "Reading Threads" (editorially curated multi-passage sequences) are digital exhibitions. What does exhibition design theory say about sequencing works to create a coherent journey? How many items in a sequence before fatigue? How do transitions between items affect the experience?
- **Audio guides and contextual narration**: Museum audio guides provide context without tracking the visitor. The portal's editorial transition notes (in Transition Navigation and Reading Threads) serve a similar function. What makes audio guide narration effective vs. intrusive? How much context enhances vs. overwhelms?
- **"Highlights tour" vs. "deep dive" dual modes**: Many museums offer both a highlights tour (curated greatest hits) and deep exploration (browse the full collection). The portal has analogous modes: Today's Wisdom / Wanderer's Path (highlights) vs. search / browse (deep dive). How do museums balance these? What signals indicate which mode a visitor wants?
- **Surprise and delight in curation**: The best museum experiences produce unexpected connections — seeing a painting next to a sculpture that illuminates both. The portal's cross-work concordance (same teaching in different forms) aims for this. What makes curatorial juxtaposition feel illuminating rather than arbitrary?

#### 3. Content-Only Recommendation — Without Collaborative Filtering

Most recommendation research assumes user data (ratings, clicks, purchase history, session behavior). The portal has none. Content-based recommendation — using item properties alone — is well-studied but usually combined with collaborative filtering. What happens when content properties are the *only* signal?

Specific questions:
- **Pure content-based recommendation systems**: Are there production recommendation systems that use zero user data — only item metadata and content properties? Named systems, papers, benchmarks. How do they perform compared to hybrid systems? What is the quality gap?
- **Appeal factors and mood matching**: NoveList uses "appeal factors" (pacing, tone, mood, style) for book recommendation without tracking readers. The portal's enrichment metadata maps closely to appeal factors. What has NoveList learned? Are there other appeal-factor-based recommendation systems? How effective are they?
- **Diversity in recommendation**: Without user data, the system can't detect when a seeker is bored or repeating. How do content-only systems ensure diversity? Random sampling within categories? Maximizing variety along metadata dimensions? Temporal diversity (avoiding the same theme twice in a row)?
- **Context as implicit signal**: The portal has exactly two implicit signals: time of day (for circadian content selection) and language preference (for language routing). Time of day is the only behavioral signal the portal will ever use — and it's not tracking, it's environmental. Are there recommendation approaches that use environmental context (time, season, location) without tracking individual users?
- **The "cold start" that never ends**: In traditional recommendation, cold start is a temporary problem — you have no data until the user interacts. Under DELTA, cold start is permanent. Every visit is a first visit from the system's perspective. How do you make the 100th visit as good as the 1st without learning anything from the first 99?
- **Editorial curation as recommendation**: The portal relies heavily on editorial curation (reading threads, daily passage selection, guide pathways). Is editorial curation a viable long-term recommendation strategy for a corpus of ~25 books? At what scale does it break? How do editorial publications (literary journals, curated newsletters like The Marginalian / Brain Pickings) sustain recommendation quality over years?
- **Serendipity algorithms**: What algorithms exist for generating serendipitous recommendations — items the user didn't know they wanted? Not "similar to what you liked" (which requires history) but "surprisingly relevant." Named approaches. The portal's Wanderer's Path is explicitly a serendipity engine.

#### 4. Sequencing and Arc Design — Making Journeys from Collections

Multiple portal features require *sequencing* — ordering passages into arcs that feel like journeys. Today's Wisdom has a weekly tonal variety constraint (not two consoling passages in a row). Transition Navigation builds arcs from emotional origin to destination. Reading Threads trace themes across books. These are all sequencing problems.

Specific questions:
- **Playlist curation and sequencing**: Music playlist curators (both human and algorithmic) sequence songs to create emotional arcs. What does the research say about effective sequencing? Energy curves (slow start, build, peak, wind down)? Key relationships? Mood transitions? How does this translate to text passage sequencing?
- **Radio programming theory**: Radio DJs create multi-hour experiences from individual tracks. What principles govern radio sequencing? The "set" concept (grouping related tracks), the "segue" (transitioning between moods), the "bumper" (bridging disparate content). Are these documented?
- **Anthology editing and sequencing**: Literary anthologies sequence poems or stories to create a reading arc. How do anthology editors describe their sequencing logic? Is there published craft writing about anthology construction?
- **Liturgical sequencing**: Religious liturgies sequence readings, prayers, hymns, and silence into a coherent worship experience. This is the closest analog to the portal's reading threads. What liturgical design principles are documented? How do liturgists handle transitions between readings of different emotional registers?
- **Sermon and homily construction**: Preachers sequence scriptural passages within a sermon to build an argument or journey. Homiletics (the study of sermon construction) has centuries of documented theory. What does homiletics say about sequencing passages — especially passages that need to build from one emotional state to another?
- **Optimal sequence length**: How many items before a curated sequence feels too long? Museum exhibitions, playlists, reading lists — what does the research say? The portal's Transition Navigation targets 3-7 passages per arc. Reading Threads may be longer. What is the evidence for these ranges?
- **The role of editorial transitions**: Between passages in a sequence, the portal includes brief editorial notes indicating the passage's role ("Here Yogananda shifts from the philosophical to the personal..."). What makes an inter-item transition note effective? How much commentary enhances vs. disrupts the flow?

#### 5. Anonymous Collective Signals — Wisdom of Crowds Without Surveillance

The portal allows one anonymous signal: passage resonance counters. When a seeker dwells on a passage, shares it, or follows a relation from it, a simple counter increments. No timestamps, no session correlation, no user identity. Just: "10,847 seekers have lingered here."

Specific questions:
- **Anonymous aggregated signals**: Are there production systems that use anonymous, aggregated attention signals (not individual tracking) to improve content surfacing? Not page views (which enable ranking) — genuinely anonymous signals like "N people have done X with this item." Named implementations.
- **The "10,000 people lingered here" effect**: Does displaying anonymous collective attention affect how individuals engage with content? Museum studies on "most popular works" (do people spend more time on works labeled popular)? Library studies on "most borrowed" lists? Wikipedia studies on view counts? What's the evidence?
- **Feedback loops in anonymous signals**: If the portal surfaces passages with high resonance counts, this creates a rich-get-richer dynamic — popular passages become more visible, becoming more popular. How do systems mitigate this without tracking individuals? Random exploration? Temporal decay? Category-balanced surfacing?
- **Signal quality without session data**: A resonance counter can be gamed, bot-inflated, or skewed by a single viral share. Without session data, how do you ensure signal quality? Rate limiting (1 increment per IP per hour) is the portal's current approach. Is this sufficient? What other approaches exist?
- **Resonance vs. popularity**: The portal wants to surface passages that *resonate* (produce contemplative engagement) not passages that are *popular* (viewed by many). These are different. A passage that goes viral on social media may have high share count but low dwell count. A passage that deeply moves seekers may have low share count but high dwell count. How should the portal weight these different signals?
- **Seasonal and temporal patterns**: Without tracking individuals, can the portal detect collective temporal patterns? "Grief-related passages resonate more in winter." "Joy passages resonate more around holidays." Is this signal extractable from anonymous counters? Is it valuable for curation?

#### 6. The "Wise Librarian" Effect — Making Impersonal Feel Personal

The aspiration: discovery that feels like consulting a wise librarian who knows the collection intimately and cares about you — even though the librarian doesn't know you at all. This is a UX and emotional design challenge as much as a technical one.

Specific questions:
- **The phenomenology of "this was chosen for me"**: Is there psychology research on the difference between receiving a recommendation from a human (who chose it with care) vs. an algorithm (which computed it from data) vs. an editorial system (which curated it for everyone but not for you specifically)? What makes the experience feel personal?
- **Tone and voice in recommendation**: The portal uses a warm, ministerial micro-copy voice ("You might begin here..." rather than "Recommended for you"). Does research show that recommendation voice (warm/personal vs. neutral/systematic) affects how users receive recommendations? What tone produces the "wise librarian" effect?
- **The "gift" framing**: A recommendation that feels like a gift is different from one that feels like a search result. What design elements produce the gift quality? Presentation (visual framing, whitespace, typography)? Context (explaining why this passage, not just presenting it)? Timing (presenting one passage, not a list)?
- **Curation transparency**: Should the portal explain *why* a passage was selected for Today's Wisdom or surfaced in a theme? "This passage was chosen because..." Or does explanation break the spell? What do museum curators, playlist curators, and anthology editors say about explaining their choices?
- **Surprise vs. coherence**: The best recommendations surprise you (you wouldn't have found this) while feeling coherent (of course this is right). How do curators balance surprise and coherence? What does the research say about the relationship between novelty and satisfaction in recommendation?
- **The bookshop effect**: Independent bookshops create an experience that feels personally curated through staff picks, thematic displays, and spatial arrangement — even though every customer sees the same shop. What do independent booksellers know about creating "personally curated" experiences in a non-personalized space? Are there documented design principles from the indie bookshop world?
- **Scarcity and selection**: The portal shows one Today's Wisdom passage per day — not a list of "today's top passages." Does presenting a single curated selection (rather than a list of options) increase perceived value? The "paradox of choice" research is relevant here. What does it say specifically about editorial curation in content-rich environments?

---

### Output Format

**Do not write an introductory essay about recommendation systems, privacy, or discovery.** Start directly with findings.

For each of the 6 topics, provide:

1. **What exists** -- Named projects, systems, papers, or design artifacts with dates and citations.
2. **What was learned** -- Specific design insights, user study results, or practitioner experience. "We found that X" or "users reported Y" — evidence, not theory.
3. **Design patterns** -- Concrete, implementable patterns applicable to a privacy-respecting sacred text portal. Not abstract principles — specific patterns: "Show a single selection with brief editorial context, not a ranked list" (with evidence for why).
4. **Recommendation for this project** -- Specific to the portal's features: Today's Wisdom, Wanderer's Path, Four Doors, Transition Navigation, theme browsing, Related Teachings, Quiet Corner. What to adopt, what to avoid, what to test.

**Prioritize practitioner knowledge over academic research.** A museum curator's design retrospective is worth more than a recommendation system paper. An independent bookshop owner's insights are worth more than a framework. A liturgist's sequencing principles are worth more than a computational model of "surprise." Identify and quote practitioners wherever possible.

**Special attention to three topics:**

**Topic 2 (Museum curation):** Museums are the closest existing analog to the portal — they guide visitors through emotionally structured collections without tracking individuals. What they've learned is directly transferable.

**Topic 4 (Sequencing and arc design):** Multiple portal features depend on sequencing passages into journeys. This is a craft with deep history in music, literature, and liturgy. The research should surface the principles — not just "sequencing matters" but "here's how to sequence 5 passages from grief to peace."

**Topic 6 (The "wise librarian" effect):** This is the UX design question that determines whether the portal's discovery features feel amazing or mechanical. The research should surface specific design elements that produce the quality of "personally curated by someone who cares."

### Questions I'm Probably Not Asking

- **Is the DELTA constraint actually an advantage?** If the portal can't track users, it must invest deeply in corpus intelligence and editorial curation. These investments create a discovery experience that is fundamentally different from algorithmic recommendation — and may be *better* for sacred text. A sacred text discovery experience that feels "chosen by someone who cares" may serve seekers more deeply than one that feels "computed from your reading history." Is there research supporting this intuition?
- **Does anonymity change how seekers engage with discovery?** If seekers know they are not being tracked — that the portal truly doesn't know them — does this change how they explore? Do they search for more vulnerable queries ("I feel empty," "I'm afraid of death") when they know no one is watching? Is there privacy research on how anonymity affects information seeking behavior in sensitive domains?
- **Should discovery feel effortful or effortless?** Some traditions (Zen, Sufi) suggest that the search itself is part of the teaching — the seeker's effort in finding is part of what they find. Should the portal make some discovery require effort (browsing, following threads, exploring the graph) rather than presenting everything frictionlessly? Is there research on "productive friction" in discovery interfaces?
- **Is there a discovery dark pattern specific to sacred text?** If the portal gets too good at surfacing "the right passage at the right moment," does it risk creating a form of spiritual dependence — seekers turning to the portal when they should be turning to practice? PRI-04 (Signpost, Not Destination) addresses this, but is there a subtler version of the problem?
- **What would Yogananda think of algorithmic discovery of his teachings?** He wrote books — linear, sequenced, carefully structured. He chose the order of chapters, the sequence of ideas, the build from narrative to philosophy. A portal that lets seekers discover passages out of their authored sequence may violate the author's intent. Or it may fulfill his explicit wish that his teachings reach everyone in whatever form serves them. Is there scholarly thinking about author intent vs. reader freedom in sacred text contexts?
- **Can the corpus itself be the curator?** Rather than editorial curation (humans choose) or algorithmic curation (machines compute), could the corpus's own internal structure serve as the curator? The cross-work concordance, knowledge graph, and structural enrichment reveal connections that exist in the text itself — not imposed by editors or algorithms. Is this a distinct curation paradigm? Has anyone theorized about text-as-its-own-curator?

If any of these unasked questions lead to research with design-altering implications, include them.
