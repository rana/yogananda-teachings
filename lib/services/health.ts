/**
 * Health check service — M1c-5 (FTR-082).
 *
 * Framework-agnostic (PRI-10). Receives a pg.Pool as dependency.
 * Checks database connectivity and basic search readiness.
 */

import type pg from "pg";

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  milestone: string;
  timestamp: string;
  checks: {
    database: { status: "ok" | "error"; latencyMs: number; error?: string };
    search: { status: "ok" | "error"; chunksCount: number; embeddingsCount: number };
    books: { count: number; languages: string[] };
  };
}

export async function getHealthStatus(pool: pg.Pool): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();
  const version = process.env.DEPLOY_VERSION || "0.0.0";
  const milestone = "1c";

  // Database check
  let dbStatus: HealthStatus["checks"]["database"];
  const dbStart = Date.now();
  try {
    await pool.query("SELECT 1");
    dbStatus = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (err) {
    dbStatus = {
      status: "error",
      latencyMs: Date.now() - dbStart,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // Search readiness
  let searchStatus: HealthStatus["checks"]["search"] = {
    status: "error",
    chunksCount: 0,
    embeddingsCount: 0,
  };
  try {
    const { rows } = await pool.query(
      `SELECT
        COUNT(*) AS total,
        COUNT(embedding) AS with_embeddings
       FROM book_chunks`,
    );
    const total = parseInt(rows[0].total, 10);
    const embedded = parseInt(rows[0].with_embeddings, 10);
    searchStatus = {
      status: total > 0 ? "ok" : "error",
      chunksCount: total,
      embeddingsCount: embedded,
    };
  } catch {
    // Keep default error status
  }

  // Books check
  let booksStatus: HealthStatus["checks"]["books"] = { count: 0, languages: [] };
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count, array_agg(DISTINCT language) AS languages FROM books`,
    );
    booksStatus = {
      count: parseInt(rows[0].count, 10),
      languages: rows[0].languages || [],
    };
  } catch {
    // Keep default
  }

  const overallStatus =
    dbStatus.status === "error"
      ? "down"
      : searchStatus.status === "error"
        ? "degraded"
        : "ok";

  return {
    status: overallStatus,
    version,
    milestone,
    timestamp,
    checks: {
      database: dbStatus,
      search: searchStatus,
      books: booksStatus,
    },
  };
}
