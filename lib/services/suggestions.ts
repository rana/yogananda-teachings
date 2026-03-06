/**
 * Search suggestions — M1c-8 (FTR-029).
 *
 * Tier B: pg_trgm fuzzy fallback for misspellings and transliterated input.
 * Tier A (static JSON at CDN edge) is in /public/data/suggestions/.
 *
 * Framework-agnostic (PRI-10).
 */

import type pg from "pg";

export interface Suggestion {
  text: string;
  type: "chapter" | "entity" | "topic";
}

/**
 * Fuzzy search suggestions using pg_trgm similarity.
 * Returns matching chapter titles and known entities.
 */
export async function getSuggestions(
  pool: pg.Pool,
  prefix: string,
  language: string = "en",
  limit: number = 5,
): Promise<Suggestion[]> {
  const results: Suggestion[] = [];

  // Chapter title matches
  const { rows: chapters } = await pool.query(
    `SELECT DISTINCT c.title
     FROM chapters c
     JOIN books b ON b.id = c.book_id
     WHERE b.language = $1
       AND c.title ILIKE $2
     ORDER BY c.title
     LIMIT $3`,
    [language, `%${prefix}%`, limit],
  );
  for (const row of chapters) {
    results.push({ text: row.title, type: "chapter" });
  }

  // If prefix is 3+ chars, also try trigram similarity
  if (prefix.length >= 3 && results.length < limit) {
    const remaining = limit - results.length;
    const { rows: fuzzy } = await pool.query(
      `SELECT DISTINCT c.title,
              similarity(c.title, $1) AS sim
       FROM chapters c
       JOIN books b ON b.id = c.book_id
       WHERE b.language = $2
         AND similarity(c.title, $1) > 0.15
         AND c.title NOT ILIKE $3
       ORDER BY sim DESC
       LIMIT $4`,
      [prefix, language, `%${prefix}%`, remaining],
    );
    for (const row of fuzzy) {
      results.push({ text: row.title, type: "chapter" });
    }
  }

  return results.slice(0, limit);
}
