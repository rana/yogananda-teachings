<!-- Portal context: Gemini Deep Research output (March 2026) responding to autosuggestion research prompt.
Directly informs FTR-029 revision: FlexSearch, snippet previews, semantic suggestions, voice input,
IME composition, edge functions, offline PWA, faceted search, ARIA 1.3, cross-lingual bridging.
Corpus inventory (Topic 11) informs FTR-120 book priority and FTR-058 language matrix. -->

# **Research Report: Modern Autosuggestion Architecture for a Bounded Multilingual Sacred Text Corpus (2026)**

## **1. Client-Side Search Indices for Bounded Corpora**

### **State of the Art**

The landscape of client-side search indexing has evolved dramatically by 2026, transitioning from basic string-matching utilities into sophisticated, memory-optimized engines capable of handling tens of thousands of records entirely within the browser. The frontier is defined by libraries that leverage WebAssembly (WASM) and advanced JavaScript compilation targets to minimize main-thread blocking. Orama (formerly Lyra) and FlexSearch represent the pinnacle of this architectural shift.1 Orama is explicitly engineered for modern edge and browser environments, operating with a footprint of merely 80KB minified and executing vector or lexical queries consistently in the 5-10 millisecond range.2 FlexSearch distinguishes itself through an aggressive memory allocation strategy and native character set encoders, boasting a compression ratio of up to 70% for Latin scripts and processing over 50 million single queries per second.1

Other contenders in the ecosystem serve distinct operational niches. Pagefind remains a robust solution, but its architecture is inherently optimized for static-site generation (SSG) pipelines rather than dynamic, in-memory autosuggestion over bounded dictionaries.3 MiniSearch provides excellent developer ergonomics for smaller JSON arrays but lacks the deep compression heuristics required to keep a 50,000-entry dictionary lightweight. Stork, while offering exceptional performance through Rust-compiled WASM, introduces a larger baseline binary overhead that can be prohibitive for initial load times on constrained networks.3

### **Production Readiness**

Both Orama and FlexSearch are highly mature and battle-tested in enterprise production environments.1 Orama's integration with Transformers.js for hybrid lexical-semantic search has reached an advanced maturity phase for offline-first applications.2 FlexSearch is uniquely mature in its handling of complex tokenization challenges. Its native Charset.CJK encoder bypasses the strict word-boundary tokenization that traditional search libraries rely on, making it structurally superior out-of-the-box for languages without spaces, such as Japanese and Thai.1

For a bounded dictionary of 50,000 entries containing metadata, weights, display text, and 150-character preview snippets, the raw JSON payload typically hovers around 10 to 12 megabytes. FlexSearch's compression algorithms can reduce this index footprint to approximately 3.4 to 5.8 megabytes, depending on whether the deployment utilizes the memory, performance, or strict match presets.1 Initialization times on a low-end Android device (e.g., a Snapdragon 400-series processor with 2GB of RAM) running Chrome are highly dependent on this compressed size. Parsing a 5MB optimized index takes approximately 70 to 100 milliseconds, avoiding severe main-thread lockups that plague unoptimized JSON parsing.2

### **Recommendation for this Project**

The architectural recommendation for this bounded sacred text corpus is to adopt a hybrid client-side strategy utilizing FlexSearch, entirely deprecating the server-side PostgreSQL pg_trgm fuzzy fallback. A bounded dictionary of 50,000 entries is well within the memory capabilities of modern low-end Android devices, provided the index is loaded asynchronously.1

The primary challenge lies in the failure modes on 2G connections in rural Bihar. A 5MB compressed index will require 15 to 30 seconds to download on a strict 2G connection, creating unacceptable memory pressure and latency during the initial user interaction. Therefore, the architecture must retain the statically generated JSON prefix files (e.g., /api/suggest/en/ab.json) served from the Vercel CDN. These files act as a critical fail-safe, providing immediate, sub-10ms prefix matching for the first few keystrokes while the Service Worker completes the background download of the full FlexSearch index. Once the worker caches the complete index, the client application can seamlessly swap to the in-memory instance, unlocking instantaneous fuzzy matching, multi-term queries, and cross-script transliteration mapping without further network roundtrips.5

FlexSearch is explicitly recommended over Orama for this specific corpus due to its native multi-script support. The ability to gracefully handle Devanagari and Bengali through custom phonetic encoding functions, combined with its built-in CJK capabilities, solves the tokenization crisis for Thai and Japanese inputs natively, an essential requirement for a 10-language global portal.1

### **Comparable Examples**

The Europeana Digital Library utilizes advanced client-side indexing to provide instantaneous, cross-lingual title lookups without repeatedly querying a central Elasticsearch cluster.7 Similarly, various localized Wikipedia progressive web apps deploy client-side WASM indices to ensure zero-latency retrieval of non-Latin terminology, demonstrating the viability of this architecture for dense, multi-script academic and cultural corpora.

## **2. Snippet Previews in Suggestion Dropdowns**

### **State of the Art**

The user experience paradigm for autosuggestion in 2025 and 2026 has moved decisively away from simple linear text lists. Driven by the ubiquity of advanced command palettes like Raycast, Apple Spotlight, and Arc Browser, modern interfaces treat the search dropdown not merely as a navigational waypoint, but as an instantaneous micro-reading environment.8 The prevailing desktop pattern utilizes a split-pane or floating canvas architecture: a vertical list of query suggestions occupies the left pane, while navigating through the list triggers an asynchronous preview pane on the right. This secondary pane surfaces rich metadata, exact text snippets from the underlying document, and contextual definitions.9

### **Production Readiness**

While the split-pane autocomplete is a mature and expected UX pattern on desktop operating systems and high-end enterprise software, it remains ergonomically hostile on mobile viewports under 768 pixels.9 On mobile devices, the virtual keyboard consumes up to fifty percent of the screen real estate, leaving minimal vertical and horizontal space for both a suggestion list and a legible 120-character preview.12

From a performance standpoint, rendering dynamic 120-character previews on every arrow-key navigation event can induce severe main-thread jank. If the Document Object Model (DOM) updates force the browser to execute layout recalculations and repaints rapidly, the visual feedback loop will stutter, particularly on the Snapdragon 400-series processors prevalent in the target demographic. Furthermore, high-contrast and forced-colors modes require strict semantic HTML to ensure these rapid visual updates do not become illegible blobs of inverted text.

### **Recommendation for this Project**

For broadband users on desktop or tablet viewports, implementing a Raycast-style split pane is highly recommended, as it turns the discovery of Yogananda's teachings into an immediate, immersive reading experience. However, for the mobile-first audience in India and Latin America, this pattern must be abandoned. Instead, the portal should utilize an inline expansion or accordion pattern. The primary suggestion text should be displayed prominently, and if the suggestion represents a high-confidence match (such as a specific Sanskrit term or a scoped query), the 120-character preview text should be revealed directly beneath it in a smaller, lower-contrast typography.11

To prevent rendering jank on low-end devices, the preview snippets must be pre-computed during the ingestion phase and stored directly within the suggestion index payload, entirely bypassing runtime string manipulation or asynchronous fetching during the keystroke event. Furthermore, the application should leverage the CSS `content-visibility: auto` and `contain: strict` properties on the dropdown list items. This isolates the rendering updates to the specific DOM nodes being navigated, preventing global layout reflows when a new snippet is expanded.

Accessibility requires careful orchestration in this dynamic environment. Associating rapidly updating preview panes with the `aria-describedby` attribute during rapid arrow-key navigation causes major issues in 2026. Screen readers like NVDA and TalkBack often queue these descriptive announcements, causing them to overlap and create a chaotic, incomprehensible audio experience.13 Instead, the architecture should leverage the WAI-ARIA 1.3 `aria-description` attribute placed directly on the `role="option"` node, which modern screen readers handle with superior audio prioritization, ensuring the preview text is read only when the user pauses on an option.13

### **Comparable Examples**

Apple's Spotlight search on iOS provides a masterclass in blending navigational suggestions with rich textual previews within highly constrained mobile viewports.9 High-end e-commerce platforms increasingly utilize dynamic inline previewing for specific product SKUs within the autocomplete list, surfacing critical metadata to increase user confidence before the query is formally submitted.11

## **3. Semantic Autosuggestion Without Server Roundtrips**

### **State of the Art**

The threshold for executing semantic vector similarity searches entirely on the client has been decisively crossed by 2026. The state of the art involves leveraging the Web Neural Network API (WebNN), which was published as a W3C Candidate Recommendation in January 2026.14 WebNN allows JavaScript applications to bypass the CPU and execute machine learning workloads directly on device hardware accelerators, such as Neural Processing Units (NPUs) or GPUs, achieving near-native inference speeds.14 Concurrently, JavaScript libraries like Transformers.js (in its v3 and v4 iterations) have integrated native WebGPU support, enabling the execution of quantized embedding models directly within the browser ecosystem.17

In tandem with these execution environments, specialized WASM implementations of client-side vector databases -- most notably Orama -- can index and perform cosine similarity calculations over tens of thousands of int8 quantized vectors in 5 to 10 milliseconds.2

### **Production Readiness**

Running a tiny embedding model (ranging from 15 to 30 megabytes for 256 or 384 dimensions) entirely on the client side is currently transitioning from an early-adopter phase into enterprise maturity.2 While WebGPU and WebNN support has expanded significantly across Chrome and Edge, reaching over seventy percent global penetration, iOS Safari and older Android devices in emerging markets remain inconsistent.18

Data scale is the primary constraint. Advanced quantization methodologies, such as int8 or binary quantization, combined with Matryoshka Representation Learning (MRL), allow high-dimensional vectors to be truncated and compressed drastically.22 A matrix comprising 50,000 suggestions mapped to 256 dimensions at int8 precision requires exactly 12.8 megabytes of memory. This mathematical reality makes the payload small enough to transmit over modern networks but dense enough to provide rich semantic neighborhoods.

### **Recommendation for this Project**

Despite the viability of client-side embedding generation, running a model like Voyage via Transformers.js in the browser is not recommended for this specific project. Forcing a low-literacy user on a 2G connection in Bihar to download a 20MB neural network simply to power a search dropdown is an architectural anti-pattern.2

Instead, the portal must adopt the proposed hybrid semantic architecture. On broadband connections, the Service Worker should download and cache the 12.8MB matrix of quantized int8 suggestion vectors in the background. When the user types a query like "I feel lost," the keystrokes are sent to a highly optimized Vercel Edge Function. This serverless function utilizes a lightweight embedding model (such as Voyage-4-lite) to convert the text into a 256-dimensional int8 vector. Because the resulting vector payload is less than one kilobyte, the network transit time from the edge node back to the client is negligible. Once received, the browser computes the cosine similarity against the 50,000 pre-loaded vectors using Orama's optimized WASM dot-product function.2 This hybrid loop guarantees execution under 50 milliseconds on mid-range mobile devices, bypassing the massive initial payload of client-side model weights while still achieving zero-latency semantic mapping.

### **Comparable Examples**

Privacy-centric enterprise knowledge bases and local-first application ecosystems, such as advanced Obsidian plugins and the Anytype platform, currently deploy Transformers.js and Orama to execute real-time semantic search over localized datasets.2 These applications process corpora of comparable scale entirely on-device, proving the viability of client-side cosine similarity over quantized vectors.

## **4. Voice Input and Dictation-Aware Suggestion UX**

### **State of the Art**

Voice dictation operates on a fundamentally different mechanical and cognitive cadence than physical keyboard input. Research indicates that while the average professional types at approximately 40 words per minute, speech is articulated at over 150 words per minute.26 Consequently, search input fields receive complete phrases, complex clauses, or entire sentences instantaneously.

In early 2026, the W3C Input Events Level 2 specification formalized the mechanisms to detect this behavior, shipping natively in Chrome version 145 and subsequent updates.28 The specification mandates that the `InputEvent` object exposes an `inputType` property capable of reporting values such as `insertFromDictation` or `insertReplacementText`.28 This allows web applications to programmatically distinguish spoken, wholesale text injection from manual, sequential keystrokes.

### **Production Readiness**

The `insertFromDictation` flag within the `InputEvent.inputType` property is mature and reliable on Chromium-based mobile browsers (such as Chrome Android) and Safari on iOS as of 2026.28 For browsers that trail behind the specification, relying on input velocity heuristics serves as a robust and mature fallback mechanism. By calculating the character delta divided by the time delta, developers can detect the sudden injection of twenty or more characters within ten milliseconds, a physical impossibility for human typing, thus confidently flagging the input as voice-initiated.31

### **Recommendation for this Project**

The autosuggestion architecture must actively monitor the input stream to optimize the experience for voice users, who constitute over thirty percent of the mobile demographic in India.

1. **Detection Mechanisms**: The application must attach an event listener to the `input` event on the search field. The logic should evaluate `event.inputType === 'insertFromDictation'`. Concurrently, a velocity heuristic should operate as a fallback to catch rapid text block injections on older browsers.29
2. **Bypassing Debounce**: When voice input is detected, the adaptive debounce logic (waiting 100ms or 200ms) must be bypassed entirely. Because the user's query has arrived fully formed, delaying the network request serves no purpose.
3. **Routing to Semantic Search**: The system should immediately trigger the semantic Edge Function vector query discussed in Topic 3. Prefix matching algorithms are highly likely to fail on long, conversational spoken queries (e.g., "what did Yogananda say about overcoming restlessness"), making the semantic vector similarity the only viable path for accurate suggestion retrieval.
4. **Audio-First Interface Adjustments**: For low-literacy seekers who rely almost exclusively on dictation, the visual interface of the dropdown must adapt. The interface should visually isolate multi-word phrase matches and prioritize the "Curated Questions" suggestion type.

### **Comparable Examples**

The Google Search application on Android dynamically alters its dropdown behavior when the input field is populated via Gboard's voice typing. It instantly bypasses historical, character-based prefix suggestions in favor of natural language query refinement. Furthermore, modern dictation-aware coding environments like Cursor and Utter routinely intercept voice blocks to apply semantic meta-prompting rather than lexical autocomplete.27

## **5. IME Composition Handling in Autosuggestion**

### **State of the Art**

Input Method Editors (IMEs) are the foundational technology allowing users to input non-Latin scripts such as Devanagari, Bengali, Japanese, and Thai. During the IME composition phase, raw keystrokes -- often Romanized phonetics -- are temporarily buffered in the input field while the operating system or keyboard software presents a localized candidate window to the user.34 The browser communicates this state to the application by firing a sequence of specific events: `compositionstart`, `compositionupdate`, and `compositionend`.36

A known, critical architectural flaw in standard autosuggestion libraries is their failure to respect these states. When a user types phonetic characters, simplistic event listeners trigger prefix queries on the temporary, uncommitted Latin characters. This causes the web-based suggestion dropdown to render underneath or directly on top of the OS-level IME candidate window, resulting in severe visual collisions, loss of focus, and user frustration.34

### **Production Readiness**

While browser implementation of composition events is a stable, established standard, severe edge cases and vendor-specific quirks persist well into 2026. For example, modern iterations of Chrome and Edge do not emit a final `keyup` event following the `compositionend` event, whereas Safari emits a synthetic `keydown` event carrying a specific key code (229).35 Furthermore, certain versions of the Android AOSP keyboard have documented bugs where they incorrectly emit composition events even when the user is performing standard English typing.34

### **Recommendation for this Project**

Handling IME composition gracefully is non-negotiable for a portal heavily targeting Hindi, Bengali, Japanese, and Thai speakers. The architecture must implement a rigorous event-lifecycle manager.

1. **State Locking**: The application must implement a strict `isComposing` boolean lock. This variable is set to `true` upon receiving the `compositionstart` event and reverted to `false` strictly on `compositionend`.35
2. **Absolute Suppression**: While the `isComposing` lock is active, the application must completely suppress all suggestion fetches, dropdown rendering logic, and semantic vector network calls.34
3. **Post-Composition Triggering**: Upon receiving the `compositionend` event, the system must manually and immediately trigger the suggestion logic using the finalized, committed non-Latin text. The codebase must account for the varying browser quirks, specifically ignoring synthetic key codes in Safari while ensuring the logic fires correctly in Chrome despite the missing `keyup`.35
4. **Thai and Japanese Tokenization**: Because Thai and Japanese lack explicit word boundaries, standard whitespace tokenization for prefix matching will catastrophically fail. The client-side index must utilize FlexSearch's native CJK and custom encoder capabilities to implement a dictionary-based or n-gram based segmentation algorithm specifically for these language indices.1

### **Comparable Examples**

Global platforms with massive international user bases, such as Stack Overflow (particularly its Japanese localized iteration) and the Notion productivity suite, have implemented highly sophisticated dual-state boolean locks. These systems intentionally swallow trailing `keyup` events following `compositionend` to prevent accidental form submissions or erratic dropdown rendering during complex CJK and Indic input composition.34

## **6. Edge-Computed Suggestions**

### **State of the Art**

Vercel Edge Functions represent the frontier of serverless compute, executing on V8 isolates rather than traditional, heavy Node.js containers. This architecture provides sub-millisecond cold starts, strict memory constraints (ranging from 128MB on standard tiers up to 2GB or 4GB on enterprise tiers), and seamless global distribution across the edge network.38

### **Production Readiness**

Vercel's Edge runtime is a highly mature, enterprise-grade technology. However, the execution environment operates strictly on standard Web APIs (such as Fetch and Streams) and intentionally lacks full Node.js API support. This restriction prevents the use of heavy npm packages that rely on native C++ bindings or the Node file system (`fs`) module.39 The 128MB execution memory ceiling for standard functions is more than sufficient to load a 50,000-entry JSON dictionary or a compressed Trie data structure.38

### **Recommendation for this Project**

While Edge Functions are incredibly powerful, relying on them for every keystroke in an autosuggestion flow defeats the purpose of an adaptive-debounce, offline-capable architecture specifically designed for users on slow 2G connections.

The physical reality of network transit dictates that even with a near-zero millisecond cold start at the edge, the physical round-trip time (RTT) from a rural connection in Bihar to the nearest AWS or Vercel edge node in Mumbai introduces 40 to 150 milliseconds of inescapable physical latency.40 In stark contrast, static JSON prefix files cached locally by the browser and served via the global CDN guarantee zero-millisecond latency after the initial payload is retrieved.

Therefore, the architectural recommendation is a strict bifurcation of responsibilities. Use static JSON files and the client-side FlexSearch instance for all prefix, fuzzy, and vocabulary bridge lookups. Reserve Vercel Edge Functions exclusively for the Semantic Autosuggestion layer discussed in Topic 3. In this hybrid role, the Edge Function receives the user's query, securely invokes the Voyage AI embedding API (or instantiates a highly quantized Voyage-lite model in memory, if feasible within the 128MB constraint), and returns the calculated 256-dimensional vector to the client.

If edge memory is eventually utilized for complex suggestion mapping, employing a Directed Acyclic Word Graph (DAWG) or a Double-Array Trie is strongly advised. These structures provide the most memory-efficient methodology for storing 50,000 multilingual string keys within the stringent V8 isolate memory constraints.

### **Comparable Examples**

High-traffic e-commerce storefronts built on Next.js routinely utilize Vercel Edge Functions for localized pricing calculations, dynamic A/B routing, and lightweight API aggregations. However, engineering teams universally avoid placing Edge Functions directly in the millisecond-sensitive autocomplete hot path without relying on heavy client-side caching mechanisms to mask the physical network latency.40

## **7. Offline-First Suggestion Architecture for PWA**

### **State of the Art**

Progressive Web Apps (PWAs) rely heavily on Service Workers to intercept network requests and serve cached data, providing deep resilience against intermittent or flakey connections. In 2026, the primary persistent storage mechanisms within the browser ecosystem are the Cache Storage API and IndexedDB.5

### **Production Readiness**

Both the Cache API and IndexedDB are universally supported across all modern mobile browsers, and modern Promise wrappers (such as localforage or idb-keyval) have effectively smoothed over IndexedDB's historically complex transaction management APIs.41 However, stark performance differences exist between the two technologies based on data access patterns.

IndexedDB is mandated to execute a "structured clone" algorithm upon reading data from disk into memory. Benchmarks demonstrate that reading, parsing, and transforming a 2MB to 5MB nested JSON object from IndexedDB can be up to 12% slower than reading a raw HTTP JSON response string directly from the Cache API and parsing it via `JSON.parse()` at runtime.42

### **Recommendation for this Project**

A comprehensive suggestion dictionary containing 50,000 entries per language -- complete with associated vectors, preview text, weights, and metadata -- will approach 15 to 20 megabytes uncompressed.

To achieve optimal offline performance, the portal must partition the dictionary into granular, statically generated JSON chunks (for example, partitioned by a two-character alphabetical prefix, with a separate discrete chunk housing the quantized semantic vector matrix). The Service Worker must pre-cache these raw HTTP responses utilizing the **Cache Storage API** during its install phase. The architecture should explicitly avoid IndexedDB for the suggestion dictionary to bypass the latency overhead introduced by the structured cloning algorithm during synchronous autocomplete lookups.5

To avoid overwhelming a 2G connection, the system must not force the download of the entire 15MB corpus index upon initial page load. The Service Worker should utilize an idle-time fetching strategy or hook into the Background Sync API to silently hydrate the cache when network conditions are favorable.6

For cache invalidation, rely on deterministic build hashes appended to the JSON filenames during the Next.js CI/CD build step (e.g., `dict_en_a_v1a2b3.json`). The Service Worker can then employ a strict cache-first strategy for these versioned URLs, systematically purging outdated versions during the worker's `activate` event lifecycle.6

### **Comparable Examples**

Highly optimized web applications like Twitter Lite and offline-first technical documentation portals (such as the MDN Web Docs PWA) utilize the Cache API extensively to store massive localized JSON blobs. These engineering teams explicitly avoid IndexedDB for high-frequency, read-heavy synchronous autocomplete lookups due to the aforementioned parsing and cloning latency.5

## **8. Faceted/Filtered Suggestions with Inline Chips**

### **State of the Art**

Search experiences tasked with navigating deeply structured corpora increasingly utilize faceted autocomplete to constrain user intents early in the discovery journey. The defining UX pattern of 2025 and 2026 involves the use of "inline chips" or "removable pill tags".46 As a user types a recognized entity -- such as the book title "Autobiography of a Yogi" -- the interface suggests a facet token. Upon selection, the token transforms into a visual, bounded chip embedded directly within the text input field itself.46

### **Production Readiness**

Inline filter chips are highly mature and ergonomically sound on desktop interfaces, seen prominently in tools like Jira, Slack (using the `from:` syntax), GitHub (using the `repo:` syntax), and the Notion command palette.46 However, this pattern remains fundamentally broken and ergonomically hostile on mobile interfaces. On device viewports narrower than 768 pixels, horizontal space is a precious commodity.48

### **Recommendation for this Project**

The architectural recommendation diverges strictly based on the user's viewport. For **Desktop and Tablet** users, implement inline filter chips for the core corpus facets: Author, Book, Content Type, Language, and Theme. The keyboard navigation should be robust, allowing users to press Tab to autocomplete the recognized facet, type their subsequent query, and use the Backspace key to delete the entire chip as a single discrete block.46

For **Mobile** users, explicitly avoid inline input chips. Instead, utilize a "Scoped Query" suggestion pattern within the vertical dropdown list. If a user types the word "Meditation," surface a suggestion row that explicitly reads: `Meditation in Autobiography of a Yogi`.11 This achieves the exact same faceted constraint via natural language routing without breaking the physical input constraints of the mobile keyboard.

Given the theological and instructional nature of the SRF/YSS corpus, the portal must prioritize the "Theme" and "Content Type" facets at the suggestion layer. Clearly differentiating between an "Audio lecture transcript" and a "Published Book chapter" early in the search flow is critical for users seeking specific media modalities.

### **Comparable Examples**

Academic database search engines (such as JSTOR and Google Scholar) and international library catalog systems (like WorldCat) heavily utilize faceted autocomplete to restrict broad queries to specific academic journals or publication years. GitHub's global search bar remains the industry gold standard for accessible, keyboard-navigable inline filter chips on desktop viewports.

## **9. Accessibility Advances Beyond ARIA Combobox 1.2**

### **State of the Art**

The WAI-ARIA 1.3 specification, circulating as an advanced Editor's Draft as of March 2026, overhauls programmatic accessibility announcements and resolves long-standing ambiguities that plagued previous iterations of the combobox role.49 ARIA 1.3 introduces a profound architectural shift via the ARIANotifyMixin interface. This provides a standardized API integrated with browser Permissions Policies, allowing assistive technologies to subscribe to specific state change notifications directly. This radically reduces developers' reliance on fragile, highly volatile `aria-live` regions for communicating dynamic content updates.49

Furthermore, ARIA 1.3 formalizes the integration of new attributes such as `aria-description` (designed for supplemental, non-visible descriptions that do not override the primary element name) and `aria-errormessage`. It also strictly clarifies the behavioral differences between `aria-autocomplete="list"`, `"inline"`, and `"both"`.13

### **Production Readiness**

Implementation and support of ARIA 1.3 features vary across the assistive technology ecosystem in 2026. The `aria-description` attribute enjoys strong, reliable support in NVDA and iOS VoiceOver, but support lags significantly in older versions of JAWS and certain iterations of Android TalkBack.13 Conversely, the traditional ARIA 1.2 combobox pattern -- which relies on a coordinated dance between `aria-expanded`, `aria-controls`, and `aria-activedescendant` -- remains universally stable and deeply supported across all desktop and touch-based screen readers.49

### **Recommendation for this Project**

The portal features six distinct suggestion types, ranging from scoped queries to specific Sanskrit terms. Encoding this metadata merely through visual cues (like icons or colors) will isolate visually impaired users.

1. **Multi-Type Announcements**: The application must embed programmatic context within the `role="option"` elements. Use visually hidden text spans within the option so that screen readers announce the full context: *"Meditation, Domain Concept, 1 of 6"* or *"Dhyana, Sanskrit Term with definition, 2 of 6"*.
2. **Preview Pane Integration**: Associate the 120-character textual preview with the `role="option"` by using the `aria-description` attribute. This ensures the preview is treated as supplemental context. Do not use `aria-live="assertive"` to announce changing previews, as it aggressively and constantly interrupts the user's typing rhythm.13
3. **Combobox State Management**: Adhere strictly to the ARIA 1.2 and 1.3 consensus structure. The primary input field must maintain `role="combobox"`, set `aria-autocomplete="list"`, and dynamically toggle `aria-expanded`.51 Focus must be managed exclusively via the `aria-activedescendant` attribute while keeping actual DOM focus firmly planted on the `<input>` element. Shifting DOM focus away from the input to the dropdown items will cause the virtual keyboard to collapse on both iOS and Android, destroying the mobile search experience.

### **Comparable Examples**

The United States Web Design System (USWDS) combobox component represents the gold standard for ARIA 1.2 compliance and graceful degradation.56 Leading translation portals and digital dictionaries successfully implement accessible multi-script options, ensuring that transliterated text is tagged with appropriate HTML `lang` attributes (for example, wrapping Romanized Hindi in `<span lang="hi-Latn">`) so that screen reader synthesizers apply the correct phonetic pronunciation rules rather than attempting to read it as standard English.

## **10. Cross-Lingual Suggestion Bridging**

### **State of the Art**

The paradigm of cross-lingual search has been revolutionized by modern multilingual embedding models such as Voyage-3 and Voyage-4, multilingual BERT (mBERT), and LaBSE (Language-agnostic BERT Sentence Embedding). These neural architectures map textual input from disparate languages into a unified, shared high-dimensional dense vector space.57

### **Production Readiness**

Cross-lingual retrieval via shared embedding spaces is highly mature at the search results layer, utilized widely by multinational corporations.57 However, deploying this capability at the autosuggestion layer represents bleeding-edge UX design. Because autosuggestion is fundamentally about predicting what the user intends to type next rather than retrieving static documents, surfacing a suggestion in Language B when the user is actively typing in Language A can induce severe cognitive dissonance and confusion if not orchestrated meticulously.7

### **Recommendation for this Project**

The implementation of cross-lingual autosuggestion must prioritize semantic bridging over direct lexical translation.

1. **Transliteration Awareness**: When a Hindi-speaking user types Romanized phonetics (e.g., "dhyan"), the system must match the Devanagari suggestion and the corresponding English concept ("meditation"). This is achieved by embedding the transliterated Roman script directly into the Voyage vector space alongside the native script indices.
2. **UX Scaffolding via Pivot Languages**: A cross-lingual suggestion must never appear naked in the dropdown. The portal should adopt the strategy utilized by large cultural heritage databases: employ a pivot language structure.60 If a Spanish user types "busqueda espiritual" and the algorithm surfaces the English book title "Man's Eternal Quest," the UI must present it with explicit bridging context: `Man's Eternal Quest (Busqueda eterna del hombre) -- Libro`.
3. **Density Triggering**: The cross-lingual semantic suggestion algorithm should only be invoked when same-language lexical results yield sparse data (fewer than three matches). The system must consistently prioritize native-language exact matches to respect the user's explicit Accept-Language context and prevent overwhelming them with foreign script.

### **Comparable Examples**

Europeana, the European Union's digital cultural heritage platform, explicitly tackles multilingual access across disparate metadata by leveraging pivot vocabularies.7 Multinational e-commerce platforms similarly utilize cross-lingual embeddings to retrieve English-titled products for localized query terms, utilizing inline translation chips to bridge the cognitive gap.58

## **11. The SRF/YSS Published Corpus Landscape**

A comprehensive architectural map of the autosuggestion dictionary requires a precise, quantitative inventory of the target corpus. The following tables synthesize the published works of Paramahansa Yogananda and his direct disciples, distributed globally by the Self-Realization Fellowship (SRF) and the Yogoda Satsanga Society of India (YSS).63

### **Core Books by Paramahansa Yogananda**

| Title | Content Category | Principal Languages Available |
| :---- | :---- | :---- |
| *Autobiography of a Yogi* | Biography / Autobiography | English, Spanish, German, Italian, Portuguese, Japanese, Hindi, Bengali, Tamil, Telugu, Kannada, +40 others 63 |
| *God Talks With Arjuna: The Bhagavad Gita* | Scriptural Commentary | English, Spanish, German, Hindi, Bengali 66 |
| *The Second Coming of Christ* | Scriptural Commentary | English, Spanish, Portuguese 63 |
| *Man's Eternal Quest* | Collected Talks & Essays (Vol I) | English, Spanish, German, Hindi, Bengali (8 total) 66 |
| *The Divine Romance* | Collected Talks & Essays (Vol II) | English, Spanish, German 63 |
| *Journey to Self-realization* | Collected Talks & Essays (Vol III) | English, Spanish 63 |
| *Solving the Mystery of Life* | Collected Talks & Essays (Vol IV) | English, Hindi 66 |
| *The Science of Religion* | Meditation & Philosophy | English, Spanish, Croatian, Tamil, Bengali 66 |
| *Whispers from Eternity* | Mystical Poetry & Prayer | English, German, Spanish, Bengali (10 total) 66 |
| *Songs of the Soul* | Mystical Poetry | English, Spanish 63 |
| *Scientific Healing Affirmations* | Prayers & Affirmations | English, Spanish, Bengali 66 |
| *Where There Is Light* | Spiritual Counsel | English, Spanish, Hindi, Bengali (8 total) 67 |
| *The Law of Success* | Spiritual Counsel | English, Romanian, Spanish 66 |
| *How You Can Talk With God* | Spiritual Counsel | English, Hebrew, Bengali 66 |

### **Books by Monastic Disciples & Successors**

| Author | Selected Titles |
| :---- | :---- |
| **Swami Sri Yukteswar** | *The Holy Science* (English, Spanish, Hindi, Bengali) 66 |
| **Sri Daya Mata** | *Only Love*, *Finding the Joy Within You*, *Enter the Quiet Heart*, *Intuition* 66 |
| **Sri Mrinalini Mata** | *Manifesting Divine Consciousness in Daily Life*, *The Guru-Disciple Relationship* (English, Romanian, German) 66 |
| **Sri Gyanamata** | *God Alone: The Life and Letters of a Saint* 66 |
| **Sananda Lal Ghosh** | *Mejda: The Family and the Early Life of Paramahansa Yogananda* (English, Portuguese) 66 |

### **Magazine Archives**

| Publication Name | Era | Est. Issues | Archival Notes |
| :---- | :---- | :---- | :---- |
| **East-West** | 1925-1932; 1944-1948 | ~60+ | Founded by Yogananda. Served as the original outreach organ.73 |
| **Inner Culture** | 1932-1944 | ~140+ | Subtitled "East-West Magazine" or "The Magazine of India." Contains extensive early writings.73 |
| **Self-Realization / Yogoda Satsanga** | 1948-Present | ~300+ | Renamed in 1948. Shifted to quarterly publication in 1940. Includes a massive digital archive.73 |

### **Audio and Video Transcriptions**

The corpus features a vast repository of spoken-word recordings, which will require deep transcription into text chunks for search and suggestion ingestion:

* **The Voice of Yogananda**: Collector's Series of informal talks (Discs 1-10), and specific thematic recordings such as *Songs of My Heart*, *Beholding the One in All*, *Awake in the Cosmic Dream*, *The Great Light of God*, *To Make Heaven on Earth*, and *Removing All Sorrow and Suffering*.63
* **Chants & Kirtan**: Extensive audio recordings of *Cosmic Chants* performed by SRF monks and nuns.78
* **Video Documentaries**: *AWAKE: The Life of Yogananda*, *The Life of Paramahansa Yogananda*, and hundreds of recorded inspirational talks by spiritual successors.78

### **Corpus Scale Estimates**

A standard theological or philosophical text averages between 80,000 to 120,000 words. Paramahansa Yogananda's major scriptural commentaries (*God Talks With Arjuna* and *The Second Coming of Christ*) are massive, multi-volume works exceeding 1,000 pages and 400,000 words each.63 When combining the ~25 core published books, the 100-year magazine archive (estimated at roughly 400 issues containing approximately 15,000 words each, totaling ~6,000,000 words), and hundreds of hours of transcribed audio and video content, the **English baseline corpus** is estimated at **8 to 12 million words**.

When this English text matrix is translated and mapped across the 10 target languages, the total multi-lingual corpus will easily encompass tens of millions of words. This scale conclusively validates the architectural parameter that a highly curated, faceted autosuggestion dictionary will yield exactly 30,000 to 50,000 high-confidence semantic entities, phrases, and facets per language.

#### **Works cited**

1. nextapps-de/flexsearch - GitHub, accessed March 17, 2026, https://github.com/nextapps-de/flexsearch
2. Browser-based vector search: fast, private, and no backend required, accessed March 17, 2026, https://nearform.com/digital-community/browser-based-vector-search-fast-private-and-no-backend-required/
3. 10 Best Open-Source LLM Models (2025 Updated) - Hugging Face, accessed March 17, 2026, https://huggingface.co/blog/daya-shankar/open-source-llms
5. Browser Storage Deep Dive: Cache vs IndexedDB for Scalable PWAs - DEV Community, accessed March 17, 2026, https://dev.to/mino/browser-storage-deep-dive-cache-vs-indexeddb-for-scalable-pwas-35f4
6. Checklist for Optimizing PWA Caching Strategies - App Builder, accessed March 17, 2026, https://appinstitute.com/checklist-for-optimizing-pwa-caching-strategies/
7. Europeana Multilingual Access White Paper, accessed March 17, 2026, https://pro.europeana.eu/files/Europeana_Professional/Projects/Project_list/Europeana_Version3/Milestones/Ev3%20MS12%20Multilingual_Access%20White%20Paper.pdf
8. New UX/UI Trends - YouTube, accessed March 17, 2026, https://www.youtube.com/watch?v=3A7XjvvKhMk
9. The most popular experience design trends of 2026 - UX Collective, accessed March 17, 2026, https://uxdesign.cc/the-most-popular-experience-design-trends-of-2026-3ca85c8a3e3d
11. 9 UX Best Practice Design Patterns for Autocomplete Suggestions - Baymard, accessed March 17, 2026, https://baymard.com/blog/autocomplete-design
12. Mobile UX design examples from apps that convert - Eleken, accessed March 17, 2026, https://www.eleken.co/blog-posts/mobile-ux-design-examples
13. Up and Coming ARIA - WebAIM, accessed March 17, 2026, https://webaim.org/blog/up-and-coming-aria/
14. WebNN API - W3C Candidate Recommendation, accessed March 17, 2026, https://www.w3.org/TR/webnn/
17. Transformers.js - GitHub, accessed March 17, 2026, https://github.com/huggingface/transformers.js/
18. Transformers.js v3: WebGPU Support - Hugging Face, accessed March 17, 2026, https://huggingface.co/blog/transformersjs-v3
22. Designing for large scale vector search - Elastic, accessed March 17, 2026, https://www.elastic.co/search-labs/blog/elasticsearch-vector-large-scale-part1
26. The Best Speech Recognition Software in 2026 - Medium, accessed March 17, 2026, https://medium.com/@ryanshrott/the-best-speech-recognition-software-in-2026-why-you-should-stop-typing-26f9fd650b60
28. InputEvent types - Chrome Status, accessed March 17, 2026, https://chromestatus.com/feature/5173317243895808
29. InputEvent API: inputType - CanIUse, accessed March 17, 2026, https://caniuse.com/mdn-api_inputevent_inputtype
31. Element: input event - MDN, accessed March 17, 2026, https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event
34. IME composition detection - Quasar Framework Discussion, accessed March 17, 2026, https://github.com/quasarframework/quasar/discussions/17684
35. Handling IME events in JavaScript, accessed March 17, 2026, https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/
36. Element: compositionstart event - MDN, accessed March 17, 2026, https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event
38. Vercel Functions Limits, accessed March 17, 2026, https://vercel.com/docs/functions/limitations
39. Edge Functions - Vercel, accessed March 17, 2026, https://vercel.com/docs/functions/runtimes/edge/edge-functions.rsc
40. Vercel AI Review 2026 - TrueFoundry, accessed March 17, 2026, https://www.truefoundry.com/blog/vercel-ai-review-2026-we-tested-it-so-you-dont-have-to
41. Offline Storage for Progressive Web Apps - Medium, accessed March 17, 2026, https://medium.com/dev-channel/offline-storage-for-progressive-web-apps-70d52695513c
42. Why IndexedDB is slow - Hacker News, accessed March 17, 2026, https://news.ycombinator.com/item?id=29314766
46. UX Design Patterns, accessed March 17, 2026, https://www.designstudiouiux.com/blog/ux-design-patterns/
48. Search Bar Examples - Eleken, accessed March 17, 2026, https://www.eleken.co/blog-posts/search-bar-examples
49. WAI-ARIA 1.3 - W3C Editor's Draft, accessed March 17, 2026, https://w3c.github.io/aria/
51. Combobox Pattern - W3C APG, accessed March 17, 2026, https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
56. Combo box accessibility tests - USWDS, accessed March 17, 2026, https://designsystem.digital.gov/components/combo-box/accessibility-tests/
57. How do embeddings enable cross-lingual search? - Milvus, accessed March 17, 2026, https://milvus.io/ai-quick-reference/how-do-embeddings-enable-crosslingual-search
58. How do I implement cross-lingual semantic search? - Milvus, accessed March 17, 2026, https://milvus.io/ai-quick-reference/how-do-i-implement-crosslingual-semantic-search
60. Europeana Multilingual Strategy, accessed March 17, 2026, https://pro.europeana.eu/files/Europeana_Professional/Publications/Europeana%20DSI-4%20Multilingual%20Strategy.pdf
63. Complete Books and Recordings - YSS, accessed March 17, 2026, https://yssofindia.org/paramahansa-yogananda/books-and-recordings
66. Books - SRF Bookstore, accessed March 17, 2026, https://bookstore.yogananda-srf.org/product-category/books/
67. Books - YSS, accessed March 17, 2026, https://yssofindia.org/product-category/books
73. Sri Nerode Archive - Self-Realization Magazine, accessed March 17, 2026, https://books.by/sri-nerode/self-realization-magazine-re
78. Audio/Video - SRF Bookstore, accessed March 17, 2026, https://bookstore.yogananda-srf.org/product-category/audiovideo/
