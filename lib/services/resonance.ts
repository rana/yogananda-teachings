/**
 * Passage resonance instrumentation — M3a-7 (FTR-031).
 *
 * Anonymous, aggregated counters for editorial insight.
 * DELTA-compliant (PRI-09): no user identification, no session
 * tracking, no timestamps per event, no behavioral profiling.
 *
 * Rate-limited: 1 increment per IP per hour per chunk per type.
 * IPs are held in memory only — never stored to database.
 *
 * Framework-agnostic (PRI-10). Receives pool as dependency.
 */

import type { Pool } from "pg";

// ── Types ─────────────────────────────────────────────────────────

export type ResonanceType = "share" | "dwell" | "traverse" | "skip";

export interface ResonanceResult {
  allowed: boolean;
  type: ResonanceType;
  chunkId: string;
}

export interface ResonanceCounts {
  chunkId: string;
  shareCount: number;
  dwellCount: number;
  traversalCount: number;
  skipCount: number;
  totalResonance: number;
}

export interface TopResonatingPassage extends ResonanceCounts {
  content: string;
  bookTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  pageNumber: number | null;
  language: string;
}

// ── Rate limiting (in-memory, DELTA-compliant) ────────────────────

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const rateWindows = new Map<string, number>(); // key → expiry timestamp

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of rateWindows) {
    if (now > expiry) rateWindows.delete(key);
  }
}, 10 * 60 * 1000);

/**
 * Check if this IP can increment this chunk's resonance counter.
 * Returns true if allowed (not rate-limited).
 */
export function checkResonanceRateLimit(
  ip: string,
  chunkId: string,
  type: ResonanceType,
): boolean {
  const key = `resonance:${ip}:${chunkId}:${type}`;
  const now = Date.now();

  const expiry = rateWindows.get(key);
  if (expiry && now < expiry) {
    return false; // Rate-limited
  }

  rateWindows.set(key, now + RATE_WINDOW_MS);
  return true;
}

// ── Database operations ───────────────────────────────────────────

const COLUMN_MAP: Record<ResonanceType, string> = {
  share: "share_count",
  dwell: "dwell_count",
  traverse: "traversal_count",
  skip: "skip_count",
};

/**
 * Increment a resonance counter for a passage.
 * Uses upsert — creates the row if it doesn't exist yet.
 */
export async function incrementResonance(
  pool: Pool,
  chunkId: string,
  type: ResonanceType,
): Promise<void> {
  const column = COLUMN_MAP[type];

  await pool.query(
    `INSERT INTO passage_resonance (chunk_id, ${column})
     VALUES ($1, 1)
     ON CONFLICT (chunk_id) DO UPDATE
     SET ${column} = passage_resonance.${column} + 1`,
    [chunkId],
  );
}

/**
 * Get resonance counts for a single passage.
 */
export async function getResonance(
  pool: Pool,
  chunkId: string,
): Promise<ResonanceCounts | null> {
  const { rows } = await pool.query(
    `SELECT chunk_id,
            share_count,
            dwell_count,
            traversal_count,
            skip_count,
            (share_count + dwell_count + traversal_count) AS total_resonance
     FROM passage_resonance
     WHERE chunk_id = $1`,
    [chunkId],
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    chunkId: row.chunk_id,
    shareCount: row.share_count,
    dwellCount: row.dwell_count,
    traversalCount: row.traversal_count,
    skipCount: row.skip_count,
    totalResonance: row.total_resonance,
  };
}

/**
 * Get top-resonating passages for editorial view.
 * Orders by total resonance (share + dwell + traversal).
 * Skip count is excluded from total — it's a separate editorial signal.
 */
export async function getTopResonating(
  pool: Pool,
  limit: number = 20,
): Promise<TopResonatingPassage[]> {
  const { rows } = await pool.query(
    `SELECT pr.chunk_id,
            pr.share_count,
            pr.dwell_count,
            pr.traversal_count,
            pr.skip_count,
            (pr.share_count + pr.dwell_count + pr.traversal_count) AS total_resonance,
            bc.content,
            b.title AS book_title,
            c.title AS chapter_title,
            c.chapter_number,
            bc.page_number,
            bc.language
     FROM passage_resonance pr
     JOIN book_chunks bc ON bc.id = pr.chunk_id
     JOIN chapters c ON c.book_id = bc.book_id AND c.chapter_number = bc.chapter_number
     JOIN books b ON b.id = bc.book_id
     WHERE (pr.share_count + pr.dwell_count + pr.traversal_count) > 0
     ORDER BY (pr.share_count + pr.dwell_count + pr.traversal_count) DESC
     LIMIT $1`,
    [limit],
  );

  return rows.map((row) => ({
    chunkId: row.chunk_id,
    shareCount: row.share_count,
    dwellCount: row.dwell_count,
    traversalCount: row.traversal_count,
    skipCount: row.skip_count,
    totalResonance: row.total_resonance,
    content: row.content,
    bookTitle: row.book_title,
    chapterTitle: row.chapter_title,
    chapterNumber: row.chapter_number,
    pageNumber: row.page_number,
    language: row.language,
  }));
}
