/**
 * Spanish search quality evaluation — M1b-2 (FTR-037)
 *
 * ~15 Spanish queries with expected passages. Same methodology as M1a-8
 * (search-quality.ts) adapted for Spanish corpus.
 *
 * Difficulty categories weighted toward Direct and Conceptual given
 * single-book corpus. Threshold: >= 80% Recall@3 (M1b gate).
 *
 * Usage:
 *   npx tsx scripts/eval/search-quality-es.ts
 *
 * Requires: NEON_DATABASE_URL, VOYAGE_API_KEY
 */

import pg from "pg";
import { search } from "../../lib/services/search";

// ── Test Cases ──────────────────────────────────────────────────

interface TestCase {
  query: string;
  category: "direct" | "conceptual" | "thematic" | "navigational" | "comparative" | "implicit";
  /** Keywords expected in at least one top-3 result */
  expectedKeywords: string[];
  /** Expected chapter numbers in top-5 results */
  expectedChapters?: number[];
  maxLatencyMs?: number;
}

const TEST_CASES: TestCase[] = [
  // Direct (person/entity search)
  {
    query: "Babaji",
    category: "direct",
    expectedKeywords: ["Babaji"],
    expectedChapters: [33, 34, 36],
  },
  {
    query: "Lahiri Mahasaya",
    category: "direct",
    expectedKeywords: ["Lahiri"],
    expectedChapters: [33, 34, 35],
  },
  {
    query: "Sri Yukteswar",
    category: "direct",
    expectedKeywords: ["Yukteswar"],
    expectedChapters: [10, 12, 42, 43],
  },
  {
    query: "Mahatma Gandhi",
    category: "direct",
    expectedKeywords: ["Gandhi"],
    expectedChapters: [44],
  },

  // Conceptual (spiritual concepts in Spanish)
  {
    query: "conciencia cósmica",
    category: "conceptual",
    expectedKeywords: ["conciencia", "cósmica"],
    expectedChapters: [14],
  },
  {
    query: "Kriya Yoga",
    category: "conceptual",
    expectedKeywords: ["Kriya", "Yoga"],
    expectedChapters: [26],
  },
  {
    query: "karma y reencarnación",
    category: "conceptual",
    expectedKeywords: ["karma"],
  },
  {
    query: "meditación",
    category: "conceptual",
    expectedKeywords: ["meditación", "meditar"],
  },

  // Thematic (broader themes)
  {
    query: "amor de Dios",
    category: "thematic",
    expectedKeywords: ["amor", "Dios"],
  },
  {
    query: "milagros de los santos",
    category: "thematic",
    expectedKeywords: ["milagro", "santo"],
  },
  {
    query: "muerte y vida después de la muerte",
    category: "thematic",
    expectedKeywords: ["muerte"],
    expectedChapters: [2, 43],
  },

  // Navigational (specific events/chapters)
  {
    query: "fundación escuela Ranchi",
    category: "navigational",
    expectedKeywords: ["Ranchi"],
    expectedChapters: [27],
  },
  {
    query: "viaje a América",
    category: "navigational",
    expectedKeywords: ["América"],
    expectedChapters: [37],
  },

  // Implicit (sentiment/atmosphere)
  {
    query: "paz interior y felicidad",
    category: "implicit",
    expectedKeywords: ["paz", "felicidad"],
  },
  {
    query: "la gracia del gurú",
    category: "implicit",
    expectedKeywords: ["gracia", "gurú"],
  },
];

// ── Evaluation ──────────────────────────────────────────────────

interface TestResult {
  query: string;
  category: string;
  mode: string;
  totalResults: number;
  durationMs: number;
  keywordHit: boolean;
  chapterHit: boolean | null;
  latencyOk: boolean;
  topSources: string[];
  passed: boolean;
}

async function evaluateQuery(
  pool: pg.Pool,
  tc: TestCase,
): Promise<TestResult> {
  const response = await search(pool, {
    query: tc.query,
    language: "es",
    limit: 10,
  });

  const top3Content = response.results
    .slice(0, 3)
    .map((r) => r.content.toLowerCase())
    .join(" ");

  const keywordHit = tc.expectedKeywords.some((kw) =>
    top3Content.includes(kw.toLowerCase()),
  );

  let chapterHit: boolean | null = null;
  if (tc.expectedChapters) {
    const top5Chapters = response.results
      .slice(0, 5)
      .map((r) => r.chapterNumber);
    chapterHit = tc.expectedChapters.some((ch) => top5Chapters.includes(ch));
  }

  const maxLatency = tc.maxLatencyMs ?? 2000;
  const latencyOk = response.durationMs <= maxLatency;

  const topSources = [
    ...new Set(response.results.slice(0, 3).flatMap((r) => r.sources)),
  ];

  const passed =
    keywordHit && (chapterHit === null || chapterHit) && latencyOk;

  return {
    query: tc.query,
    category: tc.category,
    mode: response.mode,
    totalResults: response.totalResults,
    durationMs: response.durationMs,
    keywordHit,
    chapterHit,
    latencyOk,
    topSources,
    passed,
  };
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL not set.");
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: dbUrl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  console.log("Search Quality Evaluation — M1b-2 (Spanish)\n");
  console.log("=".repeat(70));

  const results: TestResult[] = [];
  let passCount = 0;

  for (const tc of TEST_CASES) {
    const result = await evaluateQuery(pool, tc);
    results.push(result);
    if (result.passed) passCount++;

    const status = result.passed ? "PASS" : "FAIL";
    const icon = result.passed ? "+" : "-";
    console.log(`\n[${icon}] ${status}: "${result.query}" (${result.category})`);
    console.log(
      `    Mode: ${result.mode} | Results: ${result.totalResults} | Time: ${result.durationMs}ms`,
    );
    console.log(
      `    Keywords: ${result.keywordHit ? "found" : "MISSING"} | Chapters: ${result.chapterHit === null ? "n/a" : result.chapterHit ? "found" : "MISSING"} | Latency: ${result.latencyOk ? "ok" : "SLOW"}`,
    );
    console.log(`    Top sources: ${result.topSources.join(", ")}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log(
    `\nSummary: ${passCount}/${results.length} passed (${((passCount / results.length) * 100).toFixed(0)}%)`,
  );

  // Category breakdown
  const categories = new Map<string, { pass: number; total: number }>();
  for (const r of results) {
    const cat = categories.get(r.category) || { pass: 0, total: 0 };
    cat.total++;
    if (r.passed) cat.pass++;
    categories.set(r.category, cat);
  }
  console.log("\nPer-category:");
  for (const [cat, stats] of categories) {
    console.log(
      `  ${cat}: ${stats.pass}/${stats.total} (${((stats.pass / stats.total) * 100).toFixed(0)}%)`,
    );
  }

  // Mode distribution
  const modes = results.reduce(
    (acc, r) => {
      acc[r.mode] = (acc[r.mode] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log(`\nModes: ${JSON.stringify(modes)}`);

  // Latency stats
  const latencies = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  console.log(
    `Latency: avg=${avg.toFixed(0)}ms, p50=${p50}ms, p95=${p95}ms`,
  );

  // Source coverage
  const allSources = new Set(results.flatMap((r) => r.topSources));
  console.log(`Source types in top-3: ${[...allSources].join(", ")}`);

  // M1b gate: >= 80%
  const passRate = (passCount / results.length) * 100;
  console.log(`\nM1b gate: ${passRate.toFixed(0)}% (threshold: 80%)`);

  await pool.end();

  if (passRate < 80) {
    console.log(`\nFAIL: Below 80% threshold.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Evaluation failed:", err);
  process.exit(1);
});
