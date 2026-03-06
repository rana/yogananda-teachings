/**
 * Generate static JSON suggestion files — M1c-8 (FTR-029 Tier A).
 *
 * Extracts ~50 corpus-derived suggestions per language from the database:
 * - Chapter titles
 * - Frequently occurring entities (proper nouns)
 * - Zero-state chips (curated)
 *
 * Output: public/data/suggestions/{language}.json
 *
 * Usage:
 *   npx tsx scripts/generate-suggestions.ts
 *
 * Requires: NEON_DATABASE_URL
 */

import pg from "pg";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ZERO_STATE_CHIPS: Record<string, string[]> = {
  en: [
    "cosmic consciousness",
    "meditation",
    "divine mother",
    "Babaji",
    "Lahiri Mahasaya",
    "Sri Yukteswar",
    "kriya yoga",
    "self-realization",
    "God",
    "love",
    "peace",
    "karma",
    "reincarnation",
    "miracles",
    "healing",
  ],
  es: [
    "conciencia cósmica",
    "meditación",
    "madre divina",
    "Babaji",
    "Lahiri Mahasaya",
    "Sri Yukteswar",
    "Kriya Yoga",
    "autorrealización",
    "Dios",
    "amor",
    "paz",
    "karma",
    "reencarnación",
    "milagros",
  ],
};

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL not set.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: dbUrl, max: 3 });

  // Get available languages
  const { rows: langRows } = await pool.query(
    "SELECT DISTINCT language FROM books ORDER BY language",
  );
  const languages = langRows.map((r) => r.language);

  const outDir = join(process.cwd(), "public", "data", "suggestions");
  mkdirSync(outDir, { recursive: true });

  for (const lang of languages) {
    const suggestions: string[] = [];

    // Chapter titles
    const { rows: chapters } = await pool.query(
      `SELECT DISTINCT c.title
       FROM chapters c
       JOIN books b ON b.id = c.book_id
       WHERE b.language = $1
       ORDER BY c.title
       LIMIT 49`,
      [lang],
    );
    for (const row of chapters) {
      suggestions.push(row.title);
    }

    // Zero-state chips
    const chips = ZERO_STATE_CHIPS[lang] || ZERO_STATE_CHIPS.en;

    const output = {
      language: lang,
      chips,
      suggestions: [...new Set(suggestions)].sort(),
    };

    const filePath = join(outDir, `${lang}.json`);
    writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`${lang}: ${output.suggestions.length} suggestions, ${chips.length} chips → ${filePath}`);
  }

  await pool.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
