/**
 * Related Teachings service — M3c-1/M3c-2 (ADR-050).
 *
 * Framework-agnostic (PRI-10). Receives a pg.Pool as dependency.
 * Queries pre-computed chunk_relations for passage connections.
 * The golden thread: making a monk's lifetime of reading connections
 * available to every seeker.
 */

import type pg from "pg";
import {
  RELATIONS_DISPLAY_LIMIT,
  RELATIONS_MIN_SIMILARITY,
} from "@/lib/config";

// ── Types ────────────────────────────────────────────────────────

export interface RelatedPassage {
  id: string;
  /** Truncated to ~200 chars for prefetch; full content via passage API */
  content: string;
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterTitle: string;
  chapterNumber: number;
  pageNumber: number | null;
  similarity: number;
  rank: number;
  relationType: string | null;
  /** Claude-generated contextual label, e.g. "Yogananda returns to this theme..." */
  relationLabel: string | null;
}

export interface ThreadSuggestion {
  chapterNumber: number;
  chapterTitle: string;
  bookTitle: string;
  bookId: string;
  bookSlug: string;
  connectionCount: number;
  label: string | null;
}

export interface ChapterRelations {
  /** Map of source chunk ID → related passages */
  paragraphs: Record<string, RelatedPassage[]>;
  /** Chapter-level "Continue the Thread" suggestions */
  thread: ThreadSuggestion[];
}

// ── Queries ──────────────────────────────────────────────────────

/**
 * Get related passages for a single chunk (on-demand tier).
 */
export async function getRelatedPassages(
  pool: pg.Pool,
  chunkId: string,
  limit: number = RELATIONS_DISPLAY_LIMIT,
): Promise<RelatedPassage[]> {
  const { rows } = await pool.query(
    `SELECT
      bc.id,
      LEFT(bc.content, 200) as content,
      b.id::text as "bookId",
      b.slug as "bookSlug",
      b.title as "bookTitle",
      b.author as "bookAuthor",
      c.title as "chapterTitle",
      c.chapter_number as "chapterNumber",
      bc.page_number as "pageNumber",
      cr.similarity,
      ROW_NUMBER() OVER (ORDER BY cr.similarity DESC) as rank,
      cr.relation_type as "relationType",
      cr.relation_label as "relationLabel"
    FROM chunk_relations cr
    JOIN book_chunks bc ON bc.id = cr.target_chunk_id
    JOIN chapters c ON c.id = bc.chapter_id
    JOIN books b ON b.id = bc.book_id
    WHERE cr.source_chunk_id = $1
      AND cr.similarity >= $2
      AND COALESCE(cr.relation_type, '') NOT IN ('translation', 'same_chapter')
    ORDER BY cr.similarity DESC
    LIMIT $3`,
    [chunkId, RELATIONS_MIN_SIMILARITY, limit],
  );
  return rows;
}

/**
 * Batch prefetch: all paragraph relations for an entire chapter.
 *
 * Single round-trip to the database. Returns a map of source chunk ID →
 * related passages, plus chapter-level thread suggestions.
 * This is the core M3c deliverable — it enables the reading session
 * side panel with zero client-side fetching.
 */
export async function getChapterRelations(
  pool: pg.Pool,
  bookId: string,
  chapterNumber: number,
  language?: string,
  limit: number = RELATIONS_DISPLAY_LIMIT,
): Promise<ChapterRelations> {
  // Get all chunk IDs for this chapter
  const { rows: chunkRows } = await pool.query(
    `SELECT bc.id
     FROM book_chunks bc
     JOIN chapters c ON c.id = bc.chapter_id
     WHERE c.book_id = $1
       AND c.chapter_number = $2
     ORDER BY bc.paragraph_index`,
    [bookId, chapterNumber],
  );

  if (chunkRows.length === 0) {
    return { paragraphs: {}, thread: [] };
  }

  const chunkIds = chunkRows.map((r: { id: string }) => r.id);

  // Batch query: top N relations for each chunk in the chapter.
  // Re-rank after filtering out translations and same-chapter relations,
  // since stored ranks were computed before type classification.
  const { rows } = await pool.query(
    `WITH filtered AS (
      SELECT
        cr.source_chunk_id,
        cr.target_chunk_id,
        cr.similarity,
        cr.relation_type,
        cr.relation_label,
        ROW_NUMBER() OVER (
          PARTITION BY cr.source_chunk_id ORDER BY cr.similarity DESC
        ) as display_rank
      FROM chunk_relations cr
      WHERE cr.source_chunk_id = ANY($1)
        AND cr.similarity >= $2
        AND COALESCE(cr.relation_type, '') NOT IN ('translation', 'same_chapter')
    )
    SELECT
      f.source_chunk_id as "sourceChunkId",
      bc.id,
      LEFT(bc.content, 200) as content,
      b.id::text as "bookId",
      b.slug as "bookSlug",
      b.title as "bookTitle",
      b.author as "bookAuthor",
      ch.title as "chapterTitle",
      ch.chapter_number as "chapterNumber",
      bc.page_number as "pageNumber",
      f.similarity,
      f.display_rank as rank,
      f.relation_type as "relationType",
      f.relation_label as "relationLabel"
    FROM filtered f
    JOIN book_chunks bc ON bc.id = f.target_chunk_id
    JOIN chapters ch ON ch.id = bc.chapter_id
    JOIN books b ON b.id = bc.book_id
    WHERE f.display_rank <= $3
      ${language ? "AND b.language = $4" : ""}
    ORDER BY f.source_chunk_id, f.display_rank`,
    language
      ? [chunkIds, RELATIONS_MIN_SIMILARITY, limit, language]
      : [chunkIds, RELATIONS_MIN_SIMILARITY, limit],
  );

  // Group by source chunk
  const paragraphs: Record<string, RelatedPassage[]> = {};
  for (const row of rows) {
    const sourceId = row.sourceChunkId as string;
    if (!paragraphs[sourceId]) {
      paragraphs[sourceId] = [];
    }
    paragraphs[sourceId].push({
      id: row.id,
      content: row.content,
      bookId: row.bookId,
      bookSlug: row.bookSlug,
      bookTitle: row.bookTitle,
      bookAuthor: row.bookAuthor,
      chapterTitle: row.chapterTitle,
      chapterNumber: row.chapterNumber,
      pageNumber: row.pageNumber,
      similarity: row.similarity,
      rank: row.rank,
      relationType: row.relationType,
      relationLabel: row.relationLabel,
    });
  }

  // Thread: aggregate chapter-level connections for "Continue the Thread"
  const { rows: threadRows } = await pool.query(
    `SELECT
      ch.chapter_number as "chapterNumber",
      ch.title as "chapterTitle",
      b.title as "bookTitle",
      b.id::text as "bookId",
      b.slug as "bookSlug",
      COUNT(*)::int as "connectionCount",
      (array_agg(cr.relation_label)
        FILTER (WHERE cr.relation_label IS NOT NULL))[1] as label
    FROM chunk_relations cr
    JOIN book_chunks bc ON bc.id = cr.target_chunk_id
    JOIN chapters ch ON ch.id = bc.chapter_id
    JOIN books b ON b.id = bc.book_id
    WHERE cr.source_chunk_id = ANY($1)
      AND cr.similarity >= $2
      AND ch.chapter_number != $3
      AND COALESCE(cr.relation_type, '') NOT IN ('translation', 'same_chapter')
      ${language ? "AND b.language = $4" : ""}
    GROUP BY ch.chapter_number, ch.title, b.title, b.id, b.slug
    ORDER BY COUNT(*) DESC
    LIMIT 5`,
    language
      ? [chunkIds, RELATIONS_MIN_SIMILARITY, chapterNumber, language]
      : [chunkIds, RELATIONS_MIN_SIMILARITY, chapterNumber],
  );

  return { paragraphs, thread: threadRows };
}
