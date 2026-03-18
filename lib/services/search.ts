/**
 * Hybrid search service: vector + FTS + RRF (FTR-020, FTR-025).
 *
 * Framework-agnostic (PRI-10). Receives a pg.Pool as dependency.
 * Pure hybrid search is the primary mode — no AI in the search path (FTR-027).
 * Optional enhancements: HyDE (M3a-11) and cross-encoder reranking (M3a-12).
 */

import type pg from "pg";
import { RRF_K, SEARCH_RESULTS_LIMIT, RERANK_TOP_N } from "@/lib/config";
import { generateHypotheticalDocument } from "@/lib/services/hyde";
import { rerank } from "@/lib/services/rerank";

// ── Types ────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  slug: string;
  content: string;
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterTitle: string;
  chapterNumber: number;
  pageNumber: number | null;
  sectionHeading: string | null;
  language: string;
  /** RRF combined score (or rerank relevance score when reranked) */
  score: number;
  /** Which search paths contributed to this result */
  sources: ("vector" | "fts" | "hyde")[];
}

export interface SearchOptions {
  query: string;
  language?: string;
  limit?: number;
  /** Optional AI enhancements (FTR-027). Feature-flagged. */
  enhance?: "hyde" | "rerank" | "full";
  /** Skip embedding generation entirely — FTS-only fast path (~100ms). */
  forceFts?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  mode: "hybrid" | "fts_only" | "vector_only" | "enhanced";
  totalResults: number;
  durationMs: number;
  /** When results come from a different language than requested */
  fallbackLanguage?: string;
  /** Which enhancements were active on this search */
  enhancements?: ("hyde" | "rerank")[];
}

// ── Embedding ────────────────────────────────────────────────────

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const EMBEDDING_MODEL = "voyage-4-large";

// In-memory embedding cache. Voyage returns identical vectors for identical input.
// Module-scoped: survives across invocations within the same serverless instance.
// At 1024 floats × 8 bytes ≈ 8KB per entry, 500 entries ≈ 4MB — well within limits.
const EMBEDDING_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const EMBEDDING_CACHE_MAX = 500;
const embeddingCache = new Map<
  string,
  { embedding: number[]; expires: number }
>();

function getCachedEmbedding(key: string): number[] | undefined {
  const entry = embeddingCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    embeddingCache.delete(key);
    return undefined;
  }
  return entry.embedding;
}

/** Clear the embedding cache. Exported for test isolation. */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

function setCachedEmbedding(key: string, embedding: number[]): void {
  // Evict oldest entries if at capacity
  if (embeddingCache.size >= EMBEDDING_CACHE_MAX) {
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey !== undefined) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(key, {
    embedding,
    expires: Date.now() + EMBEDDING_CACHE_TTL_MS,
  });
}

async function getEmbedding(
  text: string,
  inputType: "query" | "document",
): Promise<number[] | null> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) return null;

  const cacheKey = `${inputType}:${text}`;
  const cached = getCachedEmbedding(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(VOYAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: [text],
        input_type: inputType,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      data: { embedding: number[] }[];
    };
    const embedding = data.data[0].embedding;
    setCachedEmbedding(cacheKey, embedding);
    return embedding;
  } catch {
    return null;
  }
}

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  return getEmbedding(query, "query");
}

async function getDocumentEmbedding(text: string): Promise<number[] | null> {
  return getEmbedding(text, "document");
}

// ── Search ───────────────────────────────────────────────────────

/**
 * Hybrid search: vector similarity + full-text search + RRF fusion.
 *
 * Primary mode: pure hybrid (vector + FTS + RRF). No AI in the search path.
 * Enhanced mode (feature-flagged): HyDE and/or cross-encoder reranking.
 */
export async function search(
  pool: pg.Pool,
  options: SearchOptions,
): Promise<SearchResponse> {
  const start = Date.now();
  const {
    query,
    language = "en",
    limit = SEARCH_RESULTS_LIMIT,
    enhance,
    forceFts = false,
  } = options;

  // FTS-only fast path (~100ms) — skips Voyage API entirely.
  // Used by the client's first-phase fetch for instant results.
  if (forceFts) {
    const results = await ftsOnlySearch(pool, query, language, limit);

    // Cross-language fallback (FTR-058)
    let fallbackLanguage: string | undefined;
    if (results.length === 0 && language !== "en") {
      fallbackLanguage = "en";
      const fallbackResults = await ftsOnlySearch(pool, query, "en", limit);
      const durationMs = Date.now() - start;
      logQuery(pool, query, language, fallbackResults.length, "fts_only", durationMs).catch(() => {});
      return {
        results: fallbackResults,
        query,
        mode: "fts_only",
        totalResults: fallbackResults.length,
        durationMs,
        fallbackLanguage,
      };
    }

    const durationMs = Date.now() - start;
    logQuery(pool, query, language, results.length, "fts_only", durationMs).catch(() => {});
    return {
      results,
      query,
      mode: "fts_only",
      totalResults: results.length,
      durationMs,
    };
  }

  const fetchCount = limit * 3; // Over-fetch for RRF fusion

  const wantHyde = enhance === "hyde" || enhance === "full";
  const wantRerank = enhance === "rerank" || enhance === "full";
  const activeEnhancements: ("hyde" | "rerank")[] = [];

  // Attempt to get query embedding for vector search
  const queryEmbedding = await getQueryEmbedding(query);
  const hasVectorSearch = queryEmbedding !== null;

  // HyDE: generate hypothetical document and embed in document-space (M3a-11)
  let hydeEmbedding: number[] | null = null;
  if (wantHyde && hasVectorSearch) {
    const hypothetical = await generateHypotheticalDocument(query, language);
    if (hypothetical) {
      hydeEmbedding = await getDocumentEmbedding(hypothetical);
      if (hydeEmbedding) activeEnhancements.push("hyde");
    }
  }

  let mode: SearchResponse["mode"];
  let results: SearchResult[];

  if (hasVectorSearch) {
    mode = "hybrid";
    results = await hybridSearch(
      pool,
      query,
      queryEmbedding,
      hydeEmbedding,
      language,
      fetchCount,
      limit,
    );
  } else {
    mode = "fts_only";
    results = await ftsOnlySearch(pool, query, language, limit);
  }

  // Cross-language fallback: if non-English search returns no results,
  // fall back to English results (M1b-3, FTR-058)
  let fallbackLanguage: string | undefined;
  if (results.length === 0 && language !== "en") {
    fallbackLanguage = "en";
    if (hasVectorSearch) {
      results = await hybridSearch(
        pool,
        query,
        queryEmbedding,
        hydeEmbedding,
        "en",
        fetchCount,
        limit,
      );
    } else {
      results = await ftsOnlySearch(pool, query, "en", limit);
    }
  }

  // Cross-encoder reranking (M3a-12, FTR-027)
  if (wantRerank && results.length > 0) {
    const reranked = await rerank(
      query,
      results.map((r) => ({ id: r.id, content: r.content })),
      RERANK_TOP_N,
    );

    if (reranked) {
      activeEnhancements.push("rerank");
      // Reorder results by reranker relevance scores
      results = reranked.map((rr) => ({
        ...results[rr.index],
        score: rr.relevance_score,
      }));
    }
  }

  if (activeEnhancements.length > 0) mode = "enhanced";

  const durationMs = Date.now() - start;

  // Log query (anonymized, FTR-032)
  logQuery(pool, query, language, results.length, mode, durationMs).catch(
    () => {},
  );

  return {
    results,
    query,
    mode,
    totalResults: results.length,
    durationMs,
    fallbackLanguage,
    ...(activeEnhancements.length > 0 && { enhancements: activeEnhancements }),
  };
}

async function hybridSearch(
  pool: pg.Pool,
  query: string,
  queryEmbedding: number[],
  hydeEmbedding: number[] | null,
  language: string,
  fetchCount: number,
  limit: number,
): Promise<SearchResult[]> {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // When HyDE is active, run three-path RRF: query vector + HyDE vector + FTS
  if (hydeEmbedding) {
    return threePathHybridSearch(
      pool,
      query,
      embeddingStr,
      `[${hydeEmbedding.join(",")}]`,
      language,
      fetchCount,
      limit,
    );
  }

  // Standard two-path: query vector + FTS (FTR-020, FTR-021 § Hybrid Search)
  const { rows } = await pool.query(
    `
    WITH vector_results AS (
      SELECT bc.id,
        1 - (bc.embedding <=> $1::vector) AS similarity,
        ROW_NUMBER() OVER (ORDER BY bc.embedding <=> $1::vector) AS rank
      FROM book_chunks bc
      WHERE bc.language = $2
        AND bc.embedding IS NOT NULL
      ORDER BY bc.embedding <=> $1::vector
      LIMIT $3
    ),
    fts_results AS (
      SELECT bc.id,
        ts_rank_cd(bc.search_vector, plainto_tsquery('simple', $4)) AS fts_score,
        ROW_NUMBER() OVER (ORDER BY ts_rank_cd(bc.search_vector, plainto_tsquery('simple', $4)) DESC) AS rank
      FROM book_chunks bc
      WHERE bc.language = $2
        AND bc.search_vector @@ plainto_tsquery('simple', $4)
      ORDER BY fts_score DESC
      LIMIT $3
    ),
    rrf AS (
      SELECT
        COALESCE(v.id, f.id) AS id,
        (COALESCE(1.0 / ($5 + v.rank), 0) +
         COALESCE(1.0 / ($5 + f.rank), 0)) AS rrf_score,
        v.id IS NOT NULL AS from_vector,
        f.id IS NOT NULL AS from_fts
      FROM vector_results v
      FULL OUTER JOIN fts_results f ON v.id = f.id
    )
    SELECT
      rrf.id,
      rrf.rrf_score,
      rrf.from_vector,
      rrf.from_fts,
      bc.slug,
      bc.content,
      bc.page_number,
      bc.section_heading,
      bc.language,
      b.id AS book_id,
      b.slug AS book_slug,
      b.title AS book_title,
      b.author AS book_author,
      c.title AS chapter_title,
      c.chapter_number
    FROM rrf
    JOIN book_chunks bc ON bc.id = rrf.id
    JOIN books b ON b.id = bc.book_id
    JOIN chapters c ON c.id = bc.chapter_id
    ORDER BY rrf.rrf_score DESC
    LIMIT $6
    `,
    [embeddingStr, language, fetchCount, query, RRF_K, limit],
  );

  return rows.map(mapRow);
}

/**
 * Three-path RRF: query vector + HyDE document vector + FTS.
 * The HyDE vector searches in document-space (FTR-027 § HyDE).
 */
async function threePathHybridSearch(
  pool: pg.Pool,
  query: string,
  queryEmbeddingStr: string,
  hydeEmbeddingStr: string,
  language: string,
  fetchCount: number,
  limit: number,
): Promise<SearchResult[]> {
  const { rows } = await pool.query(
    `
    WITH query_vector_results AS (
      SELECT bc.id,
        ROW_NUMBER() OVER (ORDER BY bc.embedding <=> $1::vector) AS rank
      FROM book_chunks bc
      WHERE bc.language = $3
        AND bc.embedding IS NOT NULL
      ORDER BY bc.embedding <=> $1::vector
      LIMIT $4
    ),
    hyde_vector_results AS (
      SELECT bc.id,
        ROW_NUMBER() OVER (ORDER BY bc.embedding <=> $2::vector) AS rank
      FROM book_chunks bc
      WHERE bc.language = $3
        AND bc.embedding IS NOT NULL
      ORDER BY bc.embedding <=> $2::vector
      LIMIT $4
    ),
    fts_results AS (
      SELECT bc.id,
        ts_rank_cd(bc.search_vector, plainto_tsquery('simple', $5)) AS fts_score,
        ROW_NUMBER() OVER (ORDER BY ts_rank_cd(bc.search_vector, plainto_tsquery('simple', $5)) DESC) AS rank
      FROM book_chunks bc
      WHERE bc.language = $3
        AND bc.search_vector @@ plainto_tsquery('simple', $5)
      ORDER BY fts_score DESC
      LIMIT $4
    ),
    all_ids AS (
      SELECT id FROM query_vector_results
      UNION SELECT id FROM hyde_vector_results
      UNION SELECT id FROM fts_results
    ),
    rrf AS (
      SELECT
        a.id,
        (COALESCE(1.0 / ($6 + qv.rank), 0) +
         COALESCE(1.0 / ($6 + hv.rank), 0) +
         COALESCE(1.0 / ($6 + f.rank), 0)) AS rrf_score,
        qv.id IS NOT NULL AS from_vector,
        hv.id IS NOT NULL AS from_hyde,
        f.id IS NOT NULL AS from_fts
      FROM all_ids a
      LEFT JOIN query_vector_results qv ON a.id = qv.id
      LEFT JOIN hyde_vector_results hv ON a.id = hv.id
      LEFT JOIN fts_results f ON a.id = f.id
    )
    SELECT
      rrf.id,
      rrf.rrf_score,
      rrf.from_vector,
      rrf.from_hyde,
      rrf.from_fts,
      bc.slug,
      bc.content,
      bc.page_number,
      bc.section_heading,
      bc.language,
      b.id AS book_id,
      b.slug AS book_slug,
      b.title AS book_title,
      b.author AS book_author,
      c.title AS chapter_title,
      c.chapter_number
    FROM rrf
    JOIN book_chunks bc ON bc.id = rrf.id
    JOIN books b ON b.id = bc.book_id
    JOIN chapters c ON c.id = bc.chapter_id
    ORDER BY rrf.rrf_score DESC
    LIMIT $7
    `,
    [queryEmbeddingStr, hydeEmbeddingStr, language, fetchCount, query, RRF_K, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    content: row.content,
    bookId: row.book_id,
    bookSlug: row.book_slug,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    chapterTitle: row.chapter_title,
    chapterNumber: row.chapter_number,
    pageNumber: row.page_number,
    sectionHeading: row.section_heading,
    language: row.language,
    score: parseFloat(row.rrf_score),
    sources: [
      ...(row.from_vector ? (["vector"] as const) : []),
      ...(row.from_hyde ? (["hyde"] as const) : []),
      ...(row.from_fts ? (["fts"] as const) : []),
    ],
  }));
}

async function ftsOnlySearch(
  pool: pg.Pool,
  query: string,
  language: string,
  limit: number,
): Promise<SearchResult[]> {
  const { rows } = await pool.query(
    `
    SELECT
      bc.id,
      bc.slug,
      bc.content,
      bc.page_number,
      bc.section_heading,
      bc.language,
      b.id AS book_id,
      b.slug AS book_slug,
      b.title AS book_title,
      b.author AS book_author,
      c.title AS chapter_title,
      c.chapter_number,
      ts_rank_cd(bc.search_vector, plainto_tsquery('simple', $1)) AS score
    FROM book_chunks bc
    JOIN books b ON b.id = bc.book_id
    JOIN chapters c ON c.id = bc.chapter_id
    WHERE bc.language = $2
      AND bc.search_vector @@ plainto_tsquery('simple', $1)
    ORDER BY score DESC
    LIMIT $3
    `,
    [query, language, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    content: row.content,
    bookId: row.book_id,
    bookSlug: row.book_slug,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    chapterTitle: row.chapter_title,
    chapterNumber: row.chapter_number,
    pageNumber: row.page_number,
    sectionHeading: row.section_heading,
    language: row.language,
    score: parseFloat(row.score),
    sources: ["fts"] as ("vector" | "fts" | "hyde")[],
  }));
}

// ── Helpers ──────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): SearchResult {
  return {
    id: row.id as string,
    slug: row.slug as string,
    content: row.content as string,
    bookId: row.book_id as string,
    bookSlug: row.book_slug as string,
    bookTitle: row.book_title as string,
    bookAuthor: row.book_author as string,
    chapterTitle: row.chapter_title as string,
    chapterNumber: row.chapter_number as number,
    pageNumber: row.page_number as number | null,
    sectionHeading: row.section_heading as string | null,
    language: row.language as string,
    score: parseFloat(row.rrf_score as string),
    sources: [
      ...(row.from_vector ? (["vector"] as const) : []),
      ...(row.from_fts ? (["fts"] as const) : []),
    ],
  };
}

// ── Query Logging (FTR-032) ──────────────────────────────────────

async function logQuery(
  pool: pg.Pool,
  query: string,
  language: string,
  resultsCount: number,
  mode: string,
  durationMs: number,
): Promise<void> {
  await pool.query(
    `INSERT INTO search_queries (query_text, results_count, search_mode, language, duration_ms)
     VALUES ($1, $2, $3, $4, $5)`,
    [query, resultsCount, mode, language, durationMs],
  );
}
