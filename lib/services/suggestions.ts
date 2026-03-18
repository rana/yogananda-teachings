/**
 * Search suggestions — FTR-029.
 *
 * Tier B: pg_trgm fuzzy fallback for misspellings and transliterated input.
 * Queries suggestion_dictionary (populated by generate-suggestion-dictionary.ts).
 * Tier A (static JSON at CDN edge) is in /public/data/suggestions/.
 *
 * Framework-agnostic (PRI-10).
 */

import type pg from "pg";

export interface Suggestion {
  text: string;
  display: string | null;
  type: "scoped" | "entity" | "topic" | "sanskrit" | "editorial" | "curated" | "chapter";
  weight: number;
}

/**
 * Search suggestion_dictionary using ILIKE prefix match + optional pg_trgm fuzzy.
 */
export async function getSuggestions(
  pool: pg.Pool,
  prefix: string,
  language: string = "en",
  limit: number = 10,
): Promise<Suggestion[]> {
  // Phase 1: ILIKE prefix match on suggestion and latin_form
  const { rows } = await pool.query(
    `SELECT suggestion, display_text, suggestion_type, weight
     FROM suggestion_dictionary
     WHERE language = $1
       AND editorial_boost > -1.0
       AND (suggestion ILIKE $2 OR latin_form ILIKE $2)
     ORDER BY weight DESC
     LIMIT $3`,
    [language, `${prefix}%`, limit],
  );

  const results: Suggestion[] = rows.map((r) => ({
    text: r.suggestion,
    display: r.display_text,
    type: r.suggestion_type,
    weight: Number(r.weight),
  }));

  // Phase 2: If sparse and prefix >= 3 chars, try trigram similarity
  if (prefix.length >= 3 && results.length < limit) {
    const remaining = limit - results.length;
    const seen = new Set(results.map((r) => r.text));

    const { rows: fuzzy } = await pool.query(
      `SELECT suggestion, display_text, suggestion_type, weight,
              GREATEST(similarity(suggestion, $1), similarity(COALESCE(latin_form, ''), $1)) AS sim
       FROM suggestion_dictionary
       WHERE language = $2
         AND editorial_boost > -1.0
         AND (similarity(suggestion, $1) > 0.15 OR similarity(COALESCE(latin_form, ''), $1) > 0.15)
         AND suggestion NOT ILIKE $3
         AND (latin_form IS NULL OR latin_form NOT ILIKE $3)
       ORDER BY (weight * 0.5 + GREATEST(similarity(suggestion, $1), similarity(COALESCE(latin_form, ''), $1)) * 0.5) DESC
       LIMIT $4`,
      [prefix, language, `${prefix}%`, remaining],
    );

    for (const r of fuzzy) {
      if (!seen.has(r.suggestion)) {
        results.push({
          text: r.suggestion,
          display: r.display_text,
          type: r.suggestion_type,
          weight: Number(r.weight),
        });
      }
    }
  }

  return results.slice(0, limit);
}
