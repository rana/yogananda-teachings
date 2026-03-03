/**
 * Named constants per ADR-123.
 *
 * Every parameter documents: value, rationale, evaluation trigger.
 * Parameters are tunable defaults, not architectural commitments.
 */

// ── Search ──────────────────────────────────────────────────────

/** Reciprocal Rank Fusion constant. Higher values favor lower-ranked results. */
export const RRF_K = 60; // Standard RRF default. Evaluate after M1a-8 search quality test.

/** Maximum search results returned. */
export const SEARCH_RESULTS_LIMIT = 20; // Sufficient for top-3 evaluation. Revisit at M1a-8.

/** Min FTS results before skipping hybrid (vector) search. */
export const HYBRID_UPGRADE_THRESHOLD = 5;
// Below 5 FTS results, fire hybrid for semantic recall. At 5+, FTS is sufficient.
// Saves Voyage API calls (~200-500ms + cost) on common keyword queries.
// Evaluate: compare search quality metrics with/without hybrid at this threshold.

/** Timeout for hybrid search upgrade (ms). */
export const HYBRID_UPGRADE_TIMEOUT_MS = 4000;
// If Voyage or hybrid SQL hangs, don't leak resources. Seeker already has FTS results.
// 4s is generous — normal hybrid completes in ~350ms warm. Evaluate: lower if Voyage is reliable.

// ── Chunking ────────────────────────────────────────────────────

/** Minimum chunk size in tokens. */
export const CHUNK_MIN_TOKENS = 100; // ADR-048. Short paragraphs stay whole.

/** Maximum chunk size in tokens. */
export const CHUNK_MAX_TOKENS = 500; // ADR-048. Long paragraphs may split.

// ── Embeddings ──────────────────────────────────────────────────

/** Voyage embedding model. */
export const EMBEDDING_MODEL = "voyage-3-large"; // ADR-118. 1024 dimensions.

/** Embedding dimensions. */
export const EMBEDDING_DIMENSIONS = 1024; // voyage-3-large output size.

// ── Passages ────────────────────────────────────────────────────

// ── HyDE — Hypothetical Document Embedding (M2b-12, ADR-119) ────

/** Bedrock model for HyDE generation. Haiku for speed + cost. */
export const HYDE_BEDROCK_MODEL = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
// Evaluate: switch to open-source (Mistral via Bedrock) when quality comparable.

/** Max tokens for hypothetical document generation. */
export const HYDE_MAX_TOKENS = 200; // ADR-119: 100-200 token passage.

// ── Rerank — Cross-Encoder Reranking (M2b-13, ADR-119) ──────────

/** Cohere reranking model. Multilingual-native. */
export const RERANK_MODEL = "rerank-v3.5"; // Evaluate: BGE-reranker-v2 (self-hosted) at scale.

/** Number of top results after reranking. */
export const RERANK_TOP_N = 10; // ADR-119: cross-encoder returns top 10.

// ── Passages ────────────────────────────────────────────────────

/** Minimum passage length for Today's Wisdom display (characters). */
export const PASSAGE_MIN_LENGTH = 80; // Below this, passages lack context. Evaluate at M2a.

/** Maximum passage length for Today's Wisdom display (characters). */
export const PASSAGE_MAX_LENGTH = 600; // Comfortable single-screen reading. Evaluate at M2a.

/** Maximum passage length for Quiet Corner reflections (characters). */
export const REFLECTION_MAX_LENGTH = 500; // Shorter for contemplative focus. Evaluate at M2a.

// ── Related Teachings (M3c, ADR-050) ──────────────────────────

/** Maximum pre-computed relations stored per chunk. */
export const RELATIONS_PER_CHUNK = 30;
// Top 30 nearest neighbors per chunk. Top 5 displayed in side panel.
// Evaluate: decrease if storage grows; increase if diversity suffers.

/** Relations displayed in side panel. */
export const RELATIONS_DISPLAY_LIMIT = 5;
// Show 5 most relevant. Evaluate: test with seekers — too many is noise.

/** Minimum similarity score for a relation to be stored. */
export const RELATIONS_MIN_SIMILARITY = 0.3;
// Below 0.3 cosine similarity, relations are noise. Evaluate at M3c-5.

/** Settled paragraph debounce time (ms). */
export const SETTLED_PARAGRAPH_DEBOUNCE_MS = 1200;
// 1.2 seconds of stillness before side panel updates. Calm technology (PRI-08).
// Shorter = more responsive but interrupts reading. Evaluate with user testing.

/** Intersection Observer focus zone root margin. */
export const FOCUS_ZONE_ROOT_MARGIN = "-35% 0px -35% 0px";
// Middle 30% of viewport is the "focus zone". Paragraphs in this zone
// are candidates for settled paragraph. Evaluate: wider = more sensitive.

/** Side panel width (Tailwind class). */
export const SIDE_PANEL_WIDTH_CLASS = "w-72";
// 288px — wide enough for a meaningful quote, narrow enough to not crowd reading.

/** Thread breadcrumb max depth. */
export const THREAD_MAX_DEPTH = 10;
// Maximum positions in the "Following the Thread" back stack.
// Session-only, no persistence. Evaluate: too deep = lost in the labyrinth.

// ── Suggestions (ADR-049, ADR-120) ───────────────────────────────

/** Debounce: first keystroke after focus fires immediately. */
export const SUGGEST_DEBOUNCE_FIRST_MS = 0;
// Instant response to first input creates perceived speed. Evaluate: never change this.

/** Debounce: subsequent keystrokes. */
export const SUGGEST_DEBOUNCE_MS = 100;
// 100ms balances responsiveness with avoiding excess API calls. Evaluate: 150ms if API overloaded.

/** Debounce on slow connections (2G). */
export const SUGGEST_DEBOUNCE_SLOW_MS = 200;
// Extends debounce to avoid wasting connectivity windows. Evaluate: if Network Info API unreliable.

/** Max suggestions on desktop (≥768px). */
export const SUGGEST_MAX_DESKTOP = 8;
// Enough to scan; not enough to overwhelm. Evaluate: reduce if suggestions are very long.

/** Max suggestions on mobile (<768px). */
export const SUGGEST_MAX_MOBILE = 5;
// Constrained by viewport + 44×44px touch targets. Evaluate: test on small Android devices.

/** Min Tier A results before Tier B fuzzy fires. */
export const SUGGEST_FUZZY_THRESHOLD = 3;
// Below 3 prefix matches, async pg_trgm fires for misspelling recovery. Evaluate: at 200+ suggestions.

/** Min chars before pg_trgm kicks in (Tier B). */
export const SUGGEST_FUZZY_MIN_CHARS = 3;
// Trigram similarity needs ≥3 chars for meaningful results. Evaluate: never change this.

// ── Resonance — Passage Resonance Instrumentation (M3a-7, ADR-052) ──

/** Rate limit window for resonance increments (ms). */
export const RESONANCE_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
// 1 increment per IP per hour per chunk per type. DELTA-compliant (PRI-09).
// Evaluate: lower if counters grow too slowly; raise if abuse detected.

/** Top resonating passages limit for editorial view. */
export const RESONANCE_TOP_LIMIT = 50;
// Default editorial view. Evaluate: increase when corpus grows past 10K chunks.

// ── Contentful ─────────────────────────────────────────────────

/** Delay between Contentful Management API calls (ms). */
export const CONTENTFUL_API_DELAY_MS = 150;
// Contentful rate limit: 7 req/s. 150ms ≈ 6.7/s with headroom.
// Evaluate: increase if hitting 429s; decrease if import is too slow.

/** Contentful environment identifier. */
export const CONTENTFUL_ENVIRONMENT = "master";
// Default environment. Evaluate: use feature environments for branch testing.

