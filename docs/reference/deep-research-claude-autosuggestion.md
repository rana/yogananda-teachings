# Autosuggestion Architecture for a Multilingual Sacred Text Corpus

> Claude deep research report, March 2026. Covers the same 11 topics as the Gemini deep research prompt (`docs/reference/deep-research-prompt-autosuggestion.md`). See the Gemini report at `docs/reference/deep-research-gemini-autosuggestion.md` for comparison.

---

**MiniSearch with a pre-computed semantic concept map, served via Serwist-cached static JSON and backed by Dexie.js/IndexedDB, represents the most production-viable architecture for this portal.** The research across all 11 topics reveals a consistent pattern: client-side search on static, pre-processed data decisively outperforms edge-computed or server-dependent alternatives for a bounded 30K–50K entry corpus. Several components the project envisions — cross-lingual suggestion bridging, faceted autosuggestion, client-side semantic search — would be genuinely novel in the digital library and religious text search spaces, with no known production precedents. The SRF/YSS published corpus spans **~11.4 million English words across ~35–40 book titles in 50+ languages**, providing a well-defined bounded corpus that fits comfortably within client-side constraints.

---

## Topic 1: MiniSearch dominates client-side search for bounded dictionaries

Five libraries were evaluated for in-browser autosuggestion over 30K–50K entries. The field narrows quickly.

**MiniSearch v7.2.0** (September 2025) is the clear winner. Its purpose-built `autoSuggest()` API, radix tree internals, and combined prefix + Levenshtein fuzzy search make it the only library that can replace **both** static JSON prefix files and server-side pg_trgm fuzzy fallback. At ~8KB minzipped with zero dependencies, it has the smallest footprint. BM25 ranking with field boosting and `boostDocument` callbacks provide the weighted ranking the project needs. Serialized index for 50K entries with metadata: **~800KB–1.5MB gzipped per language**. Loading a pre-built index on a Snapdragon 400 device takes ~1–3 seconds (JSON parse + radix tree rebuild). Query latency for prefix search is sub-millisecond; fuzzy search runs in 5–50ms depending on term length and fuzziness threshold.

**FlexSearch v0.8.2** (May 2025) offers the fastest raw prefix search and built-in Web Worker support but lacks true edit-distance fuzzy search — its phonetic encoders (soundex) don't work for non-Latin scripts. It has never reached v1.0. **Orama v3.1.18** has strong ecosystem backing (Docusaurus integration, corporate funding) but autocomplete isn't a first-class feature, and its Japanese/Mandarin tokenizers are WASM-based and explicitly "discouraged for browser use" by Orama's own documentation. **Pagefind v1.4.0** is fundamentally wrong for this use case — designed for full-text page search with chunked loading that adds per-keystroke network latency. **Stork is abandoned** (author announced wind-down in 2023).

Multi-script support is the critical differentiator. No library handles Thai natively — Thai has no word boundaries and requires dictionary-based segmentation. For a **suggestion dictionary** (not full-text search), this is mitigated: entries are pre-segmented at build time, and the client matches user input against pre-defined strings. `Intl.Segmenter` (Baseline since April 2024, all major browsers) handles Thai, Japanese, Hindi, and Bengali word segmentation natively, eliminating the need for external tokenization libraries. MiniSearch's custom tokenizer API integrates cleanly with `Intl.Segmenter`.

| Library | Version | Replaces prefix JSON? | Replaces pg_trgm? | CJK/Thai | Status |
|---|---|---|---|---|---|
| **MiniSearch** | 7.2.0 | Yes — autoSuggest() | Yes — Levenshtein | Custom tokenizer needed | Active, MIT |
| FlexSearch | 0.8.2 | Yes | No — no edit-distance | Latin-centric encoders | Never v1.0 |
| Orama | 3.1.18 | Partial | Partial | WASM tokenizers, browser discouraged | Active, VC-backed |
| Pagefind | 1.4.0 | No — wrong model | No | CJK partial, Thai none | Active |
| Stork | 1.6.0 | N/A | N/A | None | Abandoned |

The **2G failure mode** is the most serious concern. Downloading a 1.5MB gzipped index at 20–30KB/s takes 50–75 seconds. The recommended mitigation: progressive enhancement with server-side pg_trgm as fallback until the client-side index is cached via Service Worker. No production implementations of multilingual sacred text autocomplete using any of these libraries were found — the closest analogue is VitePress using MiniSearch for documentation search.

---

## Topic 2: Snippet previews need a two-column desktop, tray-based mobile split

Modern command palettes split into two clear patterns. **Raycast and macOS Spotlight** use a two-column layout — suggestion list on the left, rich preview pane on the right — that updates live during arrow-key navigation. **VS Code, Linear, Notion, and Vercel's ⌘K** use single-column lists with inline metadata per row but no separate preview pane. For a sacred text portal where **150-character passage snippets provide critical context**, the Raycast-style two-column pattern on desktop is the right choice.

Performance is a non-issue. Rendering 120–150 character text snippets on arrow-key navigation is trivially fast — DOM text node updates are effectively free. Virtual scrolling is unnecessary for suggestion lists under 50 items. The bottleneck is fetching preview data, which is solved by **including snippet text in the search index response** at build time rather than lazy-loading per suggestion. React.memo on option components ensures only the newly-focused and previously-focused items re-render.

**Mobile demands a fundamentally different pattern.** Adobe's React Aria team (July 2021 blog post, still the gold-standard reference) discovered that combobox popovers are deeply broken on iOS VoiceOver — portalled listboxes are unreachable via swipe navigation, and blur events from swiping close the listbox entirely. Their solution: on mobile, replace the combobox with a **button that opens a full-screen tray** (bottom sheet) containing the actual search input and scrollable results. The tray uses `VisualViewport` API to dynamically adjust height when the virtual keyboard appears. No production mobile implementation shows a live two-column preview at <768px. All collapse to single-column with inline snippets.

For **high-contrast mode**, Microsoft's `-ms-high-contrast` is fully deprecated as of Edge 138 (June 2025). Use `@media (forced-colors: active)` exclusively. Box-shadow disappears in forced-colors mode, so preview pane separation needs explicit borders using system color keywords (`Highlight`, `HighlightText`, `ButtonFace`). Safari doesn't support `forced-colors` — it uses `prefers-contrast: more` instead.

**The `cmdk` library** (by Rauno Freiberg, used by Vercel, Linear) is the standard React primitive for command-palette UIs and composes well with React Aria for accessibility. The recommended stack: `cmdk` + React Aria ComboBox + `@floating-ui/react` for positioning + Tailwind CSS for styling.

---

## Topic 3: A semantic concept map beats brute-force vector search for mobile

Full client-side semantic search — "type 'I feel lost' → suggest 'spiritual seeking'" — is technically feasible but architecturally suboptimal. The practical path is a **pre-computed semantic concept map** that reduces 50K vectors to ~200–500 cluster centroids.

The raw math: 50K entries × 256-dim int8 vectors = **~12.8MB**. Brute-force cosine similarity over this takes ~12ms on desktop but **~60–120ms on a Snapdragon 400** — too slow for responsive autosuggestion. With an HNSW (Hierarchical Navigable Small World) index via **USearch v2.21.3** (November 2025, 12K+ GitHub stars, WASM build available), search touches only ~0.01% of vectors and runs in **<5ms even on low-end mobile**. But the total download (vectors + HNSW graph + query embedding model) balloons to ~35–45MB.

**Model2Vec** is the game-changer for client-side query embedding. It distills sentence transformers into static token embeddings — inference becomes a dictionary lookup + mean pooling, running **500× faster** than MiniLM (~25,000 sentences/second). The `potion-base-8M` model is ~8–10MB with 256-dim output. The `potion-multilingual-128M` (May 2025, 101 languages) covers Hindi, Bengali, Japanese, and Thai but at 128MB may be too large for mobile — a custom distillation targeting only 10 languages would shrink this significantly. **WebNN is not production-ready** (Origin Trial only in Chrome 146 Beta, February 2026; no Firefox or Safari implementation).

The recommended architecture:

- **Build time:** Embed all 50K suggestions per language using Voyage AI multilingual. Cluster into ~200–500 semantic concepts via k-means. Store centroid embeddings + top suggestions per concept.
- **Ship to client:** A JSON concept map (~1–2MB) mapping concept centroids to suggestion lists.
- **Runtime:** Model2Vec static embedding of user query (~1ms) → cosine similarity against 500 centroids (sub-millisecond) → return top concept's suggestions.
- **Total latency: <5ms. Total download: <2MB. Works on any device.**

No production website currently does client-side semantic autosuggestion at 50K+ scale. Bible semantic search implementations (FAISS + paraphrase-MiniLM for ~31K verses) validate that sentence transformer embeddings work well for spiritual/religious content, but all are server-side. **Voy** (tantaraio, v0.6.3) is explicitly pre-1.0, uses k-d trees that degrade at 256 dimensions, and is not by the FlexSearch author despite some confusion.

---

## Topic 4: Voice input requires a modal flow, not inline dictation

In India, **40% of rural users** rely on voice search due to literacy barriers (Nielsen 2023), and 65% of all Indian users use voice search for multilingual ease (IAMAI 2023). Every major search engine — Google, YouTube, Bing — treats voice as a **modal, separate phase**: tapping the microphone opens a full-screen overlay, suggestions appear only after the transcript is committed. No suggestions update during active dictation.

The Web Speech Recognition API has **~88.5% global browser coverage** (Chrome prefixed since v25, Safari since 14.1, Samsung Internet), but Firefox has it disabled by default (Bug 650295, still open) and Edge hadn't shipped it as of early 2026. Chrome Android routes through Android's `android.speech` API with potential on-device recognition on newer versions. For OS-level voice input via Gboard's microphone button, the web page receives **no reliable API signal** distinguishing voice from keyboard. The best heuristic is **input velocity** — voice produces many characters in a single `input` event. There is no standardized `insertFromDictation` inputType in Input Events Level 2; Safari emits it non-standardly, but this is not cross-browser.

For **low-literacy users in India**, JioPhone (KaiOS, 100M+ devices, ~$20) has a dedicated hardware button for Google Assistant. Google invested $22M in KaiOS specifically for voice-first Indian users. No production voice-in/voice-out suggestion loops for search were found — all implementations follow voice-in → text-results out. Voice search in Indian language apps (Flipkart, JioSaavn) exists but is poorly documented technically.

**Recommendation:** Implement a modal voice flow with a prominent microphone icon. Use the Web Speech API directly when available for reliable voice detection. Fall back to input velocity heuristics (>5 characters in a single input event = likely voice/paste). Skip debounce for voice-detected input. Show interim results as grayed-out preview text during recognition.

---

## Topic 5: IME composition handling has a treacherous Android edge case

The standard composition suppression pattern — track `isComposing` via `compositionstart`/`compositionend`, suppress suggestion updates during composition — is well-established but hides critical cross-browser divergences.

**Chrome and Safari fire `compositionend` BEFORE the final `input` event** (where `isComposing` is still `true`). Firefox fires `input` with `isComposing: false` after `compositionend`. This means you **must** handle suggestion updates in the `compositionend` handler, not rely solely on `input` events. This divergence is actively debated at w3c/uievents#202.

The **Android Gboard bombshell**: Gboard uses Android IME APIs for ALL text entry, including regular English typing. Chrome 65+ fires `compositionstart`/`compositionupdate` for standard Gboard input. This means naive `isComposing` suppression would suppress suggestions for ALL typing on Android Chrome. The saving grace: Gboard ends composition on space, so suggestions naturally update per word rather than per character — which is actually desirable for autosuggestion UX.

**Hindi Gboard transliteration** uses standard composition events. Typing "aatm" shows romanized text with an underline; Gboard's suggestion bar shows Devanagari candidates (आत्म, आत्मा). On `compositionend`, the final Devanagari text is committed. The dual suggestion conflict — Gboard's transliteration bar above keyboard vs. web autocomplete below input — is resolved by suppressing web suggestions during composition and showing them only after committal.

For **Thai and Japanese tokenization**, `Intl.Segmenter` is now Baseline (all major browsers since April 2024). It correctly segments Thai (`"th"` locale), Japanese, Hindi, and Bengali without external libraries:

```javascript
const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
// Correctly segments Thai: "สวัสดีครับ" → ["สวัสดี", "ครับ"]
```

React's synthetic `onChange` fires during composition for controlled inputs. React does NOT expose `isComposing` on synthetic keyboard events — you must use `event.nativeEvent.isComposing` (React issue #13104, still open). The recommended React pattern combines `onCompositionStart`/`onCompositionEnd` state tracking with the native event check.

**ARIA during composition:** No WAI-ARIA guidance exists for IME + combobox. Best practice: suppress `aria-live` region updates during composition to avoid announcing intermediate text, use `aria-busy="true"` on the listbox, and do not update `aria-activedescendant` (arrow keys belong to the IME, not the suggestion list).

---

## Topic 6: Edge Functions cannot hold suggestion dictionaries

Vercel Edge Functions are architecturally unsuitable for autosuggestion over a 50K-entry dictionary. The **compressed bundle size limit (2MB Pro, 4MB Enterprise)** is the fatal constraint — it includes code, dependencies, AND data. A single language's suggestion dictionary at 2–8MB uncompressed exceeds this limit. The 128MB memory limit could theoretically hold the data in a V8 isolate, but there is no mechanism to load data larger than the bundle.

Even ignoring bundle limits, latency comparison eliminates the rationale:

| Approach | Total latency |
|---|---|
| Static JSON (browser-cached) + client-side search | **1–5ms** |
| Static JSON (CDN first-load) + client-side search | **6–25ms** |
| Edge Function (warm) | **15–40ms** |
| Edge Function (cold) | **60–80ms** |

OpenStatus.dev benchmarks show Edge Functions at **106ms P50 globally**. For pure autosuggestion with static dictionaries, static JSON + client-side search is strictly faster and cheaper. Edge Config maxes out at 512KB (Enterprise) — orders of magnitude too small. Vercel KV was sunset in December 2024, migrated to Upstash Redis.

For **semantic vector search at the edge**, 50K × 256-dim int8 = 12.8MB raw data alone exceeds the 4MB Enterprise bundle limit by 3×. Alternatives like **Upstash Vector** or **Cloudflare Vectorize** are purpose-built for edge vector search but add network roundtrip latency and per-query costs.

**No production autocomplete systems running purely on edge functions were found.** Algolia, Typesense, and Meilisearch use dedicated in-memory servers with CDN-cached API responses — never V8 isolates. Vercel is now recommending migration from Edge to Node.js runtime for "improved performance and reliability" under their Fluid Compute architecture.

**Verdict:** Edge Functions are the wrong tool for this use case. Use static JSON on CDN with client-side MiniSearch.

---

## Topic 7: Serwist, StaleWhileRevalidate, and Dexie.js form the offline stack

For a 5–10MB per-language suggestion dictionary, the offline architecture layers three storage tiers with **Serwist** (the successor to `next-pwa`, recommended by Next.js official docs) orchestrating caching.

**Cache API** stores the raw dictionary JSON files with content-hash URLs (`/data/suggestions-en-[hash].json`) for efficient download and versioning. **IndexedDB via Dexie.js** provides native prefix queries using `IDBKeyRange.bound(prefix, prefix + '\uffff')` — running in ~1–3ms for 50K entries, far faster than loading and scanning full files. An **in-memory sorted array** built from IndexedDB on app load enables sub-millisecond lookups.

The recommended Serwist configuration: **do not precache dictionaries** during Service Worker install (this blocks installation and wastes bandwidth for unneeded languages). Use **runtime caching with StaleWhileRevalidate** — serve the cached dictionary immediately, check for updates in the background, and download new versions if content hashes differ. Delta/incremental updates have no widely-adopted production pattern; at 2–3MB compressed per language with monthly updates, full re-download is more practical.

**iOS Safari is the hostile platform.** The Cache API has a **50MB hard limit** per partition on mobile Safari, and all script-writable storage faces **7-day eviction** if the PWA isn't accessed. For home screen-installed PWAs, quotas are more generous and eviction less aggressive. The mitigation strategy: encourage installation, default to single-language download, re-cache critical data on every app launch, and use `navigator.storage.persist()` on Chrome/Android (not supported on Safari).

**Periodic Background Sync** is Chrome/Android-only (since v80), requires PWA installation, and has browser-controlled frequency. Since dictionaries change infrequently, StaleWhileRevalidate on app launch is simpler and cross-browser. One-shot Background Sync has broader support for retrying failed downloads.

Mobile data cost in India is ~₹10/GB (~$0.12/GB), making a 5MB download negligible in cost (~₹0.05). But on 2G connections in rural India, 5MB takes 20–40 seconds. Offer a "lite" dictionary (top 10K entries, ~1–2MB) vs. "full" dictionary with explicit user consent for the larger download.

Production precedent: **MessianicChords.com** documents a PWA with offline search implemented via IndexedDB-backed cache for chord charts, confirming the pattern works in practice.

---

## Topic 8: Faceted autosuggestion would be a first-of-kind in digital libraries

GitHub (`repo:`, `author:`), Slack (`from:`, `in:`), and Gmail provide the mature interaction patterns for typed filter syntax. The hybrid approach — allowing both typed syntax (`book:autobiography meditation`) AND click-to-add chips that convert typed qualifiers into visual pills — is the 2025 consensus pattern. For this corpus, natural facets map to: `book:`, `author:`, `type:` (quote/concept/chapter/glossary), `lang:`, `theme:` (meditation/devotion/karma/self-realization).

**Keyboard navigation** follows the roving tabindex pattern documented in React Aria's TagGroup (using an ARIA `grid` pattern, not `listbox`). Arrow keys navigate between chips; Backspace at cursor position 0 deletes the last chip; Tab exits the chip group entirely. Downshift v7+ `useMultipleSelection` hook manages the stateful logic for ARIA 1.2-compliant chip navigation.

On mobile, a horizontal scrollable chip bar between input and dropdown (2 visible chips + "+N" overflow) preserves the critical screen real estate. Full-screen search mode with input at top is essential when virtual keyboard consumes 40–50% of the viewport. Baymard research recommends limiting mobile suggestions to 6–8 items to avoid choice paralysis.

**No major library catalog — JSTOR, Google Scholar, WorldCat, Library of Congress, HathiTrust — currently implements faceted suggestions at the autocomplete layer.** All use faceted filtering only on search results. Developer tools (GitHub, Slack, Stripe) are the only production models for suggestion-level filtering. This portal would pioneer faceted autosuggestion in the digital library space. The recommendation for the corpus: show content type as metadata on each suggestion (`[Quote]`, `[Concept]`, `[Chapter]`), with optional typed filter syntax for power users.

---

## Topic 9: React Aria is the only production-grade accessible combobox for this complexity

ARIA 1.2 established the current combobox pattern: `role="combobox"` on the `<input>` element, `aria-controls` (replacing `aria-owns`), `aria-activedescendant` for virtual focus. **ARIA 1.3** (in development) introduces `aria-description` and `aria-details` but neither is production-ready — WebAIM's May 2025 testing found `aria-details` has "no way to access the details element directly" across screen readers, and `aria-description` only works reliably in NVDA and iOS VoiceOver.

For **preview pane announcements**, the dual strategy is: `aria-describedby` on each `role="option"` for screen readers that read descriptions on focus, PLUS an `aria-live="polite"` region that updates with preview content when the active descendant changes. React Aria's ComboBox uses this exact approach, with the refinement of **conditionally announcing only on Apple devices** (to avoid double-announcement with NVDA/JAWS, which handle `aria-activedescendant` natively).

**Multi-type suggestion announcements** (mixing book titles, chapters, concepts, quotes) have three options ranked by cross-screen-reader reliability: prefixing accessible names with type labels ("Book: Autobiography of a Yogi") is most reliable; `aria-describedby` referencing hidden type elements works well; grouped sections with `role="group"` break VoiceOver (documented React Aria bug where VoiceOver doesn't announce focused items inside groups).

For **Sanskrit/Pali terms with transliteration**, use `lang` attributes on block-level wrappers (`lang="hi"` for Hindi, `lang="sa"` for Sanskrit) but **do not use script subtags** (`lang="sa-Latn"` causes failures). Leave Latin-script transliterations in the page language — applying `lang="sa"` to romanized "Paramahansa" causes screen readers to attempt a Sanskrit voice most users don't have installed. TalkBack handles language switching best; NVDA and VoiceOver macOS don't reliably switch voices for inline `lang` attributes. Always supplement non-Latin suggestions with romanization/translation.

**React Aria** (Adobe) is recommended as the accessibility foundation for its documented cross-screen-reader test matrix, mobile tray pattern with VisualViewport handling, section support, label + description slots, live announcer, and RTL/i18n built in.

---

## Topic 10: Cross-lingual suggestion bridging is genuinely novel

**No production search interface currently surfaces suggestions in Language B when typing in Language A.** Google Search doesn't do it. Europeana's cross-lingual work operates at the results layer via query translation. Algolia supports per-language indices but no cross-lingual bridging. This portal would be a genuine innovation.

The architecture using **Voyage AI's unified multilingual embedding space** is technically sound. At index time: embed all suggestions across all languages, pre-compute cross-lingual semantic neighbors (top-K nearest neighbors per entry across all languages), and cluster suggestions into ~200–500 semantic groups where "Soul/Atman/आत्मा/আত্মা/魂" map to the same cluster. At query time: embed the query, search across all language indices simultaneously, apply a 2× boost for the user's primary language, and de-duplicate by semantic cluster.

**Voyage-multilingual-2** (1024-dim, 32K context) is specifically optimized for multilingual retrieval and outperforms OpenAI v3 large by **5.6%** on multilingual benchmarks. Voyage-3-large and voyage-4-large support Matryoshka dimensionality reduction (512/256-dim) and int8/binary quantization.

For **Hindi/English romanized input** ("atma" → आत्मा + "Atman" + "soul"), index-time enrichment is critical: store original script text, ITRANS romanization, common informal romanizations, English translation, and phonetic keys for each entry. **IndicXlit** (AI4Bharat, ~11M parameters, 21 Indic languages) provides state-of-the-art transliteration trained on 26 million word pairs. The FIRE2014 shared task documented that romanized Hindi queries can have **~30 spelling variations per word**, making language-model-based ranking essential.

Screen reader language switching across a multilingual dropdown requires `lang` attributes on each option element. JAWS + Firefox provides the best support for inline language switching. VoiceOver macOS and NVDA do **not** support on-the-fly voice switching — they read everything in the page language. Always include English romanization/translation alongside non-Latin suggestions as a universal fallback.

---

## Topic 11: The SRF/YSS corpus is a well-bounded ~11.4 million English words

### Published books

| Category | Titles | Est. English words |
|---|---|---|
| Yogananda major works (Autobiography, Second Coming, Bhagavad Gita, Rubaiyat) | 4 | ~1,130,000 |
| Collected Talks series (4 volumes incl. new *Solving the Mystery of Life*) | 4 | ~550,000 |
| Inspirational/devotional titles | ~15 | ~340,000 |
| How-to-Live booklet series | 13 | ~60,000 (largely extracted) |
| Other authors (Daya Mata, Gyanamata, Rajarsi) | ~8–10 | ~200,000 |
| **Total books** | **~35–40** | **~2,280,000** |

### Periodicals and lessons

Self-Realization Magazine was founded November 1925 (celebrating its 100th anniversary in 2025), evolving through several names — *East-West*, *Inner Culture*, *Self-Realization* — with an estimated **~430 total issues** through 2026, now published as annual print + online library. The YSS magazine adds ~200+ issues. Combined magazine word count: **~7.9 million words**. SRF Lessons span 18 Basic Series, ~90 Supplement, and Kriya Yoga lessons (~760,000+ words).

### Languages and audio

The Autobiography of a Yogi is published in **50+ languages**, with 13 Indian languages via YSS (Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Nepali, Odia, Punjabi, Sanskrit, Tamil, Telugu, Urdu). The core catalog is available in ~20–25 languages. Audio includes **~18 hours** for the Ben Kingsley-narrated Autobiography audiobook, the Collector's Series of Yogananda's own voice (estimated 10–20+ hours of restored recordings), and 7+ chant albums on major streaming platforms. Total commercially available audio: **~40–60+ hours**.

### Scale parameters for the search portal

The grand total English corpus (books + lessons + magazines + online content) reaches **~11.4 million words**. The rough multilingual total is **~50–60 million words** given uneven translation coverage. For the suggestion dictionary, the 30K–50K entries per language target aligns well: a 2-million-word English book corpus yields roughly 30K–50K meaningful searchable concepts, terms, quotes, and passages after deduplication and curation. This is comparable to the Bible (~31K verses, a validated scale for semantic search) and well within client-side search library capacity.

**Content access tiers:** Published books are publicly purchasable. SRF Lessons are members-only (application + subscription). Magazine archives require subscription ($22/year). Kriya Yoga materials are restricted to initiated Kriyabans. The search portal should scope to publicly available published books unless SRF grants access to broader content.

---

## Conclusion: what this research changes

Three findings reframe the project's architecture. First, **edge computing is a dead end** for autosuggestion — Vercel's 2–4MB bundle limit and 15–100ms round-trip latency make it strictly inferior to cached static JSON for every metric that matters. Second, **client-side semantic search is viable but only through a concept-map indirection** — the 200–500 cluster approach delivers <5ms latency in <2MB versus the 35–45MB required for full HNSW vector search. Third, **several planned features are genuinely unprecedented**: no library catalog does faceted autosuggestion, no search engine does cross-lingual suggestion bridging, and no religious text portal does client-side semantic autosuggestion. These are real innovations, not reinventions.

The technology stack that emerges: **MiniSearch** for lexical prefix + fuzzy search, **a pre-computed semantic concept map** (Voyage embeddings + k-means at build time, Model2Vec for client-side query embedding) for semantic suggestion, **Serwist** + StaleWhileRevalidate + Dexie.js for offline caching, **React Aria ComboBox** with tray pattern for accessible mobile UX, `Intl.Segmenter` for Thai/Japanese/Hindi tokenization, and `compositionstart`/`compositionend` tracking with Android Gboard awareness for IME handling. The critical engineering risk is multilingual Model2Vec distillation — the existing `potion-multilingual-128M` covers all 10 languages but at 128MB is too large for mobile, requiring a custom distillation targeting only the project's languages.

---

## Project Analysis (Claude Opus 4.6, 2026-03-17)

### Where Claude corrects Gemini

| Topic | Gemini said | Claude corrects | Impact on FTR-029 |
|-------|------------|----------------|-------------------|
| Client-side search | FlexSearch for CJK encoders | MiniSearch 7.2.0: smaller, autoSuggest API, real fuzzy. Intl.Segmenter replaces CJK encoders. | Future evaluation: MiniSearch not FlexSearch |
| Voice input | insertFromDictation reliable Chrome 145+ | NOT standardized cross-browser. Safari non-standard only. Velocity heuristic is primary. | FTR-029 voice detection: rebalance — velocity heuristic primary, inputType secondary |
| Edge Functions | Equivocal — "strict bifurcation" | Dead end. 2-4MB bundle limit fatal. KV sunset. 106ms P50. | FTR-029 Tier C (Vercel KV) needs re-evaluation note |
| Offline storage | Cache API over IndexedDB | Dexie.js + IndexedDB for prefix queries (IDBKeyRange.bound) outperforms JSON parse from Cache API | Future direction: IndexedDB for structured lookups, Cache API for raw file storage |
| IME composition | isComposing lock pattern | Android Gboard fires composition for ALL typing. Naive suppression breaks Android. | FTR-029 IME guard needs Android Gboard caveat |
| Corpus size | 8-12M English words | 11.4M English words (more precise) | Scale planning |
| ARIA 1.3 | aria-description recommended | Only NVDA + iOS VoiceOver. aria-describedby remains primary. | FTR-029 accessibility: aria-describedby primary, aria-description progressive enhancement |

### Genuinely novel findings (not in Gemini)

1. **Semantic concept map** — k-means clustering to 200-500 centroids + Model2Vec for client-side embedding. <5ms, <2MB. Fundamentally better than brute-force cosine over 50K vectors.
2. **Android Gboard composition events for all typing** — critical edge case. compositionend handler, not input event, is the reliable trigger.
3. **iOS Safari 50MB + 7-day eviction** — offline caching constraint.
4. **React Aria mobile tray pattern** — full-screen bottom sheet replacing combobox on mobile. Adobe's solution to iOS VoiceOver broken portals.
5. **Serwist + Dexie.js stack** — named, production-viable offline architecture.
6. **No production cross-lingual suggestion bridging exists** — confirmed genuine innovation.
7. **IndicXlit for transliteration** — AI4Bharat, 11M params, 21 Indic languages, 26M word pairs.

### Actions taken

| Finding | Action | Location |
|---------|--------|----------|
| Voice detection rebalancing | Velocity heuristic documented as primary; inputType as secondary | FTR-029 Client Architecture |
| Android Gboard caveat | Added to IME composition guard | FTR-029 Client Architecture |
| compositionend handler priority | Specified as trigger point | FTR-029 Client Architecture |
| aria-describedby primary | Rebalanced: aria-describedby primary, aria-description progressive enhancement | FTR-029 Accessibility |
| Vercel KV sunset | Added note to Tier C | FTR-029 Infrastructure |

### Future directions (not yet in FTR-029)

- **MiniSearch evaluation** — when dictionary exceeds ~5K entries/language, evaluate MiniSearch 7.2.0 vs. static JSON prefix files. MiniSearch can replace both Tier A (prefix files) and Tier B (pg_trgm) in a single client-side solution.
- **Semantic concept map** — pre-computed Voyage clusters + Model2Vec client-side embedding. Evaluate at Arc 3 when bridge coverage gaps are measurable.
- **Serwist + Dexie.js** — offline suggestion architecture. Evaluate when PWA caching is implemented.
- **React Aria ComboBox** — evaluate as accessibility foundation for SearchCombobox.tsx rewrite.
- **IndicXlit** — transliteration for Hindi/Bengali suggestion matching. Milestone 5b.
- **Mobile tray pattern** — full-screen search replacing combobox on mobile. Evaluate for greenfield UX rebuild.

### Overall assessment

The Claude report is more precise, more actionable, and more technically rigorous than the Gemini report. Where they agree, the finding is high-confidence. Where they disagree, Claude is more often correct (MiniSearch over FlexSearch, insertFromDictation not standardized, Android Gboard edge case, Edge Functions definitively dead). The semantic concept map architecture is the single most valuable novel finding across both reports — it makes client-side semantic suggestion viable at <2MB instead of 13MB+.

The two reports together provide strong triangulation: FTR-029's three-tier progressive infrastructure is validated by both. The static JSON + pg_trgm fallback architecture is confirmed as the right starting point. The future path (MiniSearch + concept map + Dexie.js offline) is clearer for having both perspectives.
