## Research Request: Modern Autosuggestion Architecture for a Bounded Multilingual Sacred Text Corpus (2026)

### Project Context

I am building a free, world-class online teachings portal that makes Paramahansa Yogananda's published books (Self-Realization Fellowship and Yogoda Satsanga Society of India) freely accessible worldwide. Late 2026 launch. The portal is a search-and-reading experience — not a chatbot, not a generative AI tool. The AI is a librarian: it finds and ranks verbatim published text, never generates or paraphrases content.

**Corpus profile:**
- Current: 2 books, 2,681 text chunks, 2 languages (English, Spanish)
- Near-term (2027): ~25 books across 10 languages
- Full vision (2028+): 100–300 corpus items including ~25 books, 100 years of Self-Realization Magazine archives (quarterly since 1925, ~400 issues), Inner Culture magazine archives, audio lecture transcriptions, and video talk transcriptions — across 10 languages (English, Spanish, German, French, Italian, Portuguese, Japanese, Thai, Hindi, Bengali)
- Estimated suggestion dictionary at full scale: 30,000–50,000 entries per language
- The corpus is finite, fully known at ingestion time, and every suggestion can *guarantee* results exist — fundamentally different from Google/Bing autocomplete

**Tech stack:**
- Next.js 15 on Vercel (CDN, Edge Functions, serverless)
- Neon PostgreSQL 18 with pgvector, pg_search (ParadeDB BM25), pg_trgm
- Voyage AI voyage-4-large embeddings (1024-dim, 26 languages, unified cross-lingual space) — evaluating migration to Voyage 4 large (MoE architecture, shared embedding space, Matryoshka dimension reduction)
- Claude via AWS Bedrock for index-time enrichment only — never in the search or suggestion hot path
- Vercel CDN for static assets, Vercel Edge Functions available
- PWA with Service Worker caching and offline fallback
- No Redis, no Algolia, no Typesense, no ElasticSearch

**Privacy constraint (non-negotiable, architectural):**
- Zero user identification, zero session tracking, zero behavioral profiling
- No collaborative filtering, no "popular searches," no query-frequency-based ranking — even anonymized
- Suggestion intelligence must be derived entirely from corpus content and editorial curation
- This is a theological commitment (DELTA framework), not a cost optimization

**Audience:**
- Global: seekers in rural Bihar on 2G and seekers in Los Angeles on fiber
- ~70% of Hindi/Spanish audience is mobile-first
- Voice input significant in India (30%+ of Google searches are voice-initiated)
- 10 languages including 4 non-Latin scripts: Devanagari (Hindi), Bengali, Japanese, Thai
- Low-literacy seekers are part of the audience, not an edge case

**Current autosuggestion design:**
Pre-computed suggestion dictionary stored as static JSON files partitioned by two-character prefix, served from Vercel CDN (<10ms). Client-side prefix matching with weight-based ranking. Async fuzzy fallback via PostgreSQL pg_trgm (40–80ms). Vocabulary bridge maps modern terms ("mindfulness", "anxiety") to Yogananda's terminology ("concentration", "restlessness") in the suggestion dropdown *before* query submission. Six suggestion types ranked by intent precision: scoped queries ("Yogananda on meditation"), named entities, domain concepts, Sanskrit terms with definitions, editorially promoted queries, curated questions. ARIA combobox pattern (WAI-ARIA 1.2). Adaptive debounce (0ms first keystroke, 100ms subsequent, 200ms on 2G).

---

### Research Topics

For each topic below, I need: (a) named products, libraries, or papers with version numbers and dates, (b) production-readiness assessment (experimental / early-adopter / mature), (c) specific applicability to a bounded sacred-text corpus of 30K–50K suggestion entries per language, (d) examples from comparable projects if they exist (religious text search, library search, museum collections, academic corpus search, digital humanities). **Do not provide background explanations of what autosuggestion is. Go directly to the frontier.**

#### 1. Client-Side Search Indices for Bounded Corpora

Evaluate Pagefind, MiniSearch, FlexSearch, Orama, and Stork for in-browser autosuggestion over a 30K–50K entry dictionary.

Specific questions:
- What is the compressed index size for 50,000 entries with metadata (type, weight, display text, 150-char preview snippet)?
- Initialization time on low-end Android (2GB RAM, Snapdragon 400-series, Chrome)?
- Query latency for prefix match, fuzzy match, and weighted ranking?
- Do any of these handle multi-script input natively (Latin, Devanagari, Bengali, Thai, CJK)?
- Can they replace both static JSON prefix files AND server-side pg_trgm fuzzy fallback with a single client-side solution?
- What are the failure modes on 2G connections (index download time, memory pressure)?
- Are any of these used in production for multilingual suggestion/autocomplete specifically (not just site search)?

#### 2. Snippet Previews in Suggestion Dropdowns

Modern command palettes (Raycast, Spotlight, VS Code Command Palette, Arc Browser, Notion, Linear) show content previews alongside suggestions. I want to show a representative passage from the teachings alongside each suggestion — turning the dropdown from navigation into a micro-reading experience.

Specific questions:
- What are the 2025–2026 UX patterns for preview panes in autocomplete/combobox dropdowns?
- How do these patterns adapt on mobile (viewport <768px, virtual keyboard consuming half the screen)?
- What ARIA patterns support preview content associated with combobox options? Does `aria-describedby` on `role="option"` work across NVDA, VoiceOver, TalkBack in 2026?
- Performance: does rendering 120-character preview text on each arrow-key navigation cause perceptible jank?
- Are there production examples of autocomplete with rich previews in search (not command palette) contexts?
- How does preview content interact with high-contrast mode and forced-colors mode?

#### 3. Semantic Autosuggestion Without Server Roundtrips

I want to enable "type 'I feel lost' → suggest 'spiritual seeking', 'divine guidance', 'the soul's journey'" using pre-computed embedding vectors, without any server-side AI call during the suggestion interaction.

The approach: store quantized Voyage embedding vectors (256-dim, int8) alongside each suggestion entry. On broadband connections, load the suggestion vector index. Use a single Vercel Edge Function to embed the query text via Voyage voyage-4-lite, return the vector to the client. Client-side cosine similarity surfaces semantically relevant suggestions.

Specific questions:
- Is client-side cosine similarity over 50,000 x 256-dim int8 vectors fast enough for real-time suggestions (<50ms) on mid-range mobile?
- What JavaScript libraries or WebAssembly modules handle quantized vector similarity efficiently in-browser (2026 state of the art)?
- Alternative: could ONNX Runtime Web or Transformers.js run a tiny embedding model (5–20MB) entirely client-side, eliminating the Edge Function roundtrip? What models, what latency, what mobile compatibility?
- What is the WebNN API adoption status in 2026? Is it usable for this?
- At what index size does client-side vector search become impractical on mobile?
- Are there production examples of client-side semantic search/suggestion (not server-side RAG)?

#### 4. Voice Input and Dictation-Aware Suggestion UX

In India, 30%+ of mobile searches use voice input (Google Voice Typing, Gboard dictation). Voice input arrives as complete words or phrases, not character-by-character keystrokes. Our current design assumes typed input with adaptive debounce.

Specific questions:
- How do major search UIs (Google, YouTube, Bing, DuckDuckGo mobile) handle the transition from voice input to suggestion display in 2026?
- Is there a reliable browser API or heuristic to detect that input arrived via dictation vs. typing? (`inputType` values in `InputEvent`, input velocity detection, Speech Recognition API state?)
- What suggestion UX patterns work for phrase-at-a-time input (the entire query appears at once)?
- How does voice input interact with IME composition events on Android?
- Are there accessibility implications of voice-input-aware suggestion behavior?
- For low-literacy users who rely on voice input, what does an audio-first suggestion experience look like? Any production examples of voice-in/voice-out suggestion loops?

#### 5. IME Composition Handling in Autosuggestion

The portal serves Hindi (Devanagari via Google Indic Keyboard, Gboard transliteration), Bengali (Avro phonetic), Japanese (IME with candidate selection), and Thai (no word boundaries). All use Input Method Editors that compose characters before committing.

Specific questions:
- What breaks when a suggestion dropdown fires during IME composition? Documented bugs in Chrome, Firefox, Safari (2025–2026)?
- What is the correct pattern for suppressing suggestions during `compositionstart` to `compositionend`?
- How do Google Search, Apple Spotlight, Notion, and Linear handle IME + autocomplete interaction in 2026?
- For Devanagari specifically: when a Hindi seeker types "sam" in Gboard transliteration mode, the IME shows candidates — how should the suggestion dropdown coexist with the IME candidate list?
- For Thai and Japanese: what tokenization/segmentation approach works for prefix matching in languages without word boundaries?
- Are there ARIA guidelines specific to combobox behavior during IME composition?

#### 6. Edge-Computed Suggestions

Vercel Edge Functions (V8 isolates, <1ms cold start, 128MB memory) as an alternative or complement to static files.

Specific questions:
- Could a Vercel Edge Function hold a 50,000-entry suggestion dictionary in memory and serve prefix + fuzzy + bridge lookups in a single <10ms invocation?
- What are the actual Vercel Edge Runtime limitations in 2026? Memory ceiling, execution time limit, no Node.js API restrictions that matter for this use case?
- Compare latency: static JSON (browser-cached after first load, 0ms subsequent) vs. Edge Function (network roundtrip on every keystroke, but <10ms from edge). Which is better for an adaptive-debounce suggestion flow?
- Could an Edge Function serve as the semantic suggestion layer — holding the quantized vector index and computing cosine similarity at the edge?
- What data structures (trie, DAWG, compressed prefix tree) are practical within V8 isolate memory constraints for 50K multilingual entries?

#### 7. Offline-First Suggestion Architecture for PWA

The portal is a PWA with Service Worker caching. The suggestion dictionary is 5–10MB per language at full corpus scale.

Specific questions:
- What are 2026 best practices for Service Worker pre-caching of structured suggestion data?
- Cache API vs. IndexedDB for suggestion dictionaries — which performs better for prefix-based lookups?
- Cache invalidation strategies when the dictionary updates after new book ingestion (versioned URLs, stale-while-revalidate, delta updates)?
- At what payload size does Service Worker pre-caching become counterproductive on mobile (competing with critical resources)?
- Are there production PWAs that implement offline autosuggestion over datasets of this size?
- How does the Background Sync API or Periodic Background Sync interact with suggestion data freshness?

#### 8. Faceted/Filtered Suggestions with Inline Chips

The corpus has natural facets: author (Yogananda, Sri Yukteswar, Daya Mata), book (25+ titles), content type (book chapter, magazine article, lecture transcript), language, theme.

Specific questions:
- What are 2025–2026 interaction patterns for inline filter tokens in search suggestions? (GitHub's `repo:`, Notion's `in:`, Slack's `from:`, Linear's `project:`)
- How do these patterns handle keyboard navigation? (Tab into filter, arrow through values, return to query text)
- ARIA patterns for combobox with embedded filter chips?
- On mobile, how do filter chips coexist with the virtual keyboard and a suggestion dropdown?
- For a spiritual text corpus, what facets are most useful at the suggestion layer vs. the search results layer?
- Are there examples of faceted autocomplete in library catalog search or academic database search (JSTOR, Google Scholar, WorldCat)?

#### 9. Accessibility Advances Beyond ARIA Combobox 1.2

The portal implements the WAI-ARIA 1.2 combobox pattern with `role="combobox"`, `role="listbox"`, `aria-activedescendant`, and keyboard navigation.

Specific questions:
- What has changed in ARIA combobox best practices between 2024 and 2026? New patterns, deprecations, browser implementation improvements?
- How do NVDA, VoiceOver, and TalkBack handle multi-type suggestions (our six types) with distinct announcements in 2026? What breaks, what works?
- Screen reader behavior with preview panes or description text associated with combobox options — what is reliably announced?
- Live region strategies for dynamically updating suggestion counts and content — `aria-live="polite"` vs. `aria-live="assertive"` vs. role-based announcements?
- Touch screen reader interaction (VoiceOver on iOS, TalkBack on Android) with suggestion dropdowns — swipe navigation patterns, double-tap selection, rotor behavior?
- Any production implementations handling Sanskrit terms with transliteration and definitions inline in accessible combobox options?

#### 10. Cross-Lingual Suggestion Bridging

Our embedding model (Voyage) operates in a unified cross-lingual space. A Hindi seeker typing "ध्यान" (dhyana/meditation) and an English seeker typing "meditation" produce vectors in the same semantic neighborhood.

Specific questions:
- Are there production search UIs that surface suggestions in Language B when the user types in Language A — not via translation, but via semantic similarity in a shared embedding space?
- What UX patterns make cross-lingual suggestions comprehensible rather than confusing? (Show the foreign suggestion with an inline translation? Show it only when same-language results are sparse?)
- How does cross-lingual suggestion interact with the browser's `lang` attribute and screen reader language switching?
- For Hindi/English specifically: Romanized Hindi input ("dhyan") matching Devanagari suggestions ("ध्यान") and English suggestions ("meditation") — what are the transliteration-aware autocomplete patterns?
- Any examples from multilingual digital libraries (Europeana, Digital Public Library of America, World Digital Library)?

#### 11. The SRF/YSS Published Corpus

This is not a technology question — it is a content landscape question that directly determines the autosuggestion architecture's scale parameters.

Specific questions:
- What is the complete list of books published by Self-Realization Fellowship (SRF) attributed to Paramahansa Yogananda? Include all editions and formats (hardcover, paperback, ebook, audiobook).
- What additional books has SRF published by other authors (Sri Daya Mata, Sri Mrinalini Mata, Rajarsi Janakananda, Brother Anandamoy, other monastics)?
- How many total languages does SRF publish in? Which books are available in which languages?
- What is Self-Realization Magazine? When did it start publishing? How many total issues exist? Is there a digital archive? What was its predecessor (Inner Culture magazine)?
- What does Yogoda Satsanga Society of India (YSS) publish independently from SRF? How many titles? Which Indian languages (Hindi, Bengali, Tamil, Telugu, Kannada, etc.)? Are YSS publications the same texts as SRF publications, or are there YSS-original works?
- Does SRF or YSS have audio recordings of Paramahansa Yogananda's voice? Lecture recordings? How many hours of audio content exist?
- Does SRF produce video content (documentaries, talks, lectures)? How much exists?
- What is the estimated total word count of the complete SRF + YSS published text corpus across all languages?
- Are there other SRF/YSS content types not listed above (study guides, lesson commentaries, correspondence, newsletters)?

---

### Output Format

**Do not write an introductory essay about autosuggestion or search UX history.** Start directly with findings.

For each of the 11 topics, provide:

1. **State of the art** — Named tools, libraries, APIs, or papers with versions and dates. Link to source if possible.
2. **Production readiness** — Experimental / Early adopter / Mature. With evidence.
3. **Recommendation for this project** — Specific to a bounded 30K–50K entry multilingual sacred text suggestion dictionary. What to adopt, what to skip, what to watch.
4. **Comparable examples** — Production implementations from religious text portals, library search, museum collections, digital humanities, or academic corpus search. If none exist, say so.

For Topic 11 (corpus landscape), provide a structured inventory: tables of books by author with languages, magazine publication history, audio/video estimates, total corpus size estimate.

**Prioritize specificity over comprehensiveness.** A benchmark number on a specific device is worth more than a paragraph of qualitative assessment. A named production implementation is worth more than a theoretical analysis. A "this doesn't exist yet" is worth more than speculation presented as fact.
