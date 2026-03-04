/**
 * Passage services — random passages for Today's Wisdom and Quiet Corner.
 *
 * Framework-agnostic (PRI-10). Receives a pg.Pool as dependency.
 * All passages are verbatim (PRI-01) with full attribution (PRI-02).
 */

import type pg from "pg";
import {
  PASSAGE_MIN_LENGTH,
  PASSAGE_MAX_LENGTH,
  REFLECTION_MAX_LENGTH,
} from "@/lib/config";

export interface DailyPassage {
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
  language: string;
}

/** Shared SQL for passage queries — joins chunks with full attribution. */
const PASSAGE_SELECT = `
  SELECT
    bc.id,
    bc.slug,
    bc.content,
    bc.page_number,
    bc.language,
    b.id AS book_id,
    b.slug AS book_slug,
    b.title AS book_title,
    b.author AS book_author,
    c.title AS chapter_title,
    c.chapter_number
  FROM book_chunks bc
  JOIN books b ON b.id = bc.book_id
  JOIN chapters c ON c.id = bc.chapter_id`;

/** Map a database row to a DailyPassage. */
function rowToPassage(row: Record<string, unknown>): DailyPassage {
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
    language: row.language as string,
  };
}

/**
 * Get a random passage suitable for "Today's Wisdom" display.
 * Selects from chunks that are substantial enough to be meaningful
 * but not too long for comfortable single-screen reading.
 */
export async function getRandomPassage(
  pool: pg.Pool,
  language: string = "en",
): Promise<DailyPassage | null> {
  const { rows } = await pool.query(
    `${PASSAGE_SELECT}
    WHERE bc.language = $1
      AND length(bc.content) BETWEEN $2 AND $3
      AND bc.content !~ '^\\d{1,3}\\s'
    ORDER BY random()
    LIMIT 1`,
    [language, PASSAGE_MIN_LENGTH, PASSAGE_MAX_LENGTH],
  );

  if (rows.length === 0) return null;
  return rowToPassage(rows[0]);
}

/**
 * Get today's passage — deterministic by day.
 *
 * Every visitor sees the same passage on the same day.
 * The md5 hash of passage ID + current date creates a stable,
 * well-distributed ordering that cycles through all passages
 * over time. A shared daily experience — like a daily reading.
 */
export async function getDailyPassage(
  pool: pg.Pool,
  language: string = "en",
): Promise<DailyPassage | null> {
  const { rows } = await pool.query(
    `${PASSAGE_SELECT}
    WHERE bc.language = $1
      AND length(bc.content) BETWEEN $2 AND $3
      AND bc.content !~ '^\\d{1,3}\\s'
    ORDER BY md5(bc.id::text || CURRENT_DATE::text)
    LIMIT 1`,
    [language, PASSAGE_MIN_LENGTH, PASSAGE_MAX_LENGTH],
  );

  if (rows.length === 0) return null;
  return rowToPassage(rows[0]);
}

/**
 * Get a random passage for Quiet Corner contemplation.
 * Shorter than Today's Wisdom — passages under 500 characters
 * are more suitable for quiet reflection (PRI-08: calm technology).
 */
export async function getReflectionPassage(
  pool: pg.Pool,
  language: string = "en",
): Promise<DailyPassage | null> {
  const { rows } = await pool.query(
    `${PASSAGE_SELECT}
    WHERE bc.language = $1
      AND length(bc.content) BETWEEN $2 AND $3
      AND bc.content !~ '^\\d{1,3}\\s'
    ORDER BY random()
    LIMIT 1`,
    [language, PASSAGE_MIN_LENGTH, REFLECTION_MAX_LENGTH],
  );

  if (rows.length === 0) return null;
  return rowToPassage(rows[0]);
}
