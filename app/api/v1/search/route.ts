/**
 * Search API — /api/v1/search
 *
 * Hybrid search: vector + FTS + RRF (ADR-044).
 * Returns ranked verbatim passages with citations (PRI-01, PRI-02).
 * Pure hybrid search is the primary mode (ADR-119).
 * Optional AI enhancements via `enhance` param (M2b-12/13).
 *
 * Query params:
 *   q         — search query (required)
 *   language  — language filter (default: "en")
 *   limit     — max results (default: 20, max: 50)
 *   mode      — optional: "fts" for FTS-only fast path (~100ms vs ~600ms hybrid)
 *   enhance   — optional: "hyde", "rerank", or "full" (both)
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { search, type SearchResponse } from "@/lib/services/search";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { SEARCH_RESULTS_LIMIT } from "@/lib/config";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  // Rate limiting — M1c-6 (ADR-023)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const ua = request.headers.get("user-agent") || "";
  const rateLimit = checkRateLimit(ip, ua);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before searching again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const params = request.nextUrl.searchParams;
  const query = params.get("q");
  const language = params.get("language") || "en";
  const limitParam = params.get("limit");
  const parsed = limitParam !== null ? parseInt(limitParam, 10) : NaN;
  const limit = !isNaN(parsed)
    ? Math.min(Math.max(1, parsed), 50)
    : SEARCH_RESULTS_LIMIT;

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }

  if (query.length > 500) {
    return NextResponse.json(
      { error: "Query too long (max 500 characters)" },
      { status: 400 },
    );
  }

  // Parse mode param — "fts" skips Voyage embedding for fast results (~100ms)
  const modeParam = params.get("mode");
  const forceFts = modeParam === "fts";

  // Parse enhance param — validated to known values only
  const enhanceParam = params.get("enhance");
  const enhance =
    enhanceParam === "hyde" || enhanceParam === "rerank" || enhanceParam === "full"
      ? enhanceParam
      : undefined;

  try {
    const response: SearchResponse = await search(pool, {
      query: query.trim(),
      language,
      limit,
      enhance,
      forceFts,
    });

    // API response shape per DES-019 § API Conventions (ADR-110)
    // Cache identical queries at Vercel edge for 60s; serve stale up to 5min while revalidating.
    // Corpus changes infrequently; seekers searching the same terms benefit from edge caching.
    const body = {
      data: response.results.map((r) => ({
        id: r.id,
        content: r.content,
        citation: {
          bookId: r.bookId,
          book: r.bookTitle,
          author: r.bookAuthor,
          chapter: r.chapterTitle,
          chapterNumber: r.chapterNumber,
          page: r.pageNumber,
        },
        language: r.language,
        score: r.score,
        sources: r.sources,
      })),
      meta: {
        query: response.query,
        mode: response.mode,
        language,
        totalResults: response.totalResults,
        durationMs: response.durationMs,
        ...(response.fallbackLanguage && {
          fallbackLanguage: response.fallbackLanguage,
        }),
        ...(response.enhancements && {
          enhancements: response.enhancements,
        }),
      },
    };
    // Set cache headers — query string is part of the cache key by default
    const resp = NextResponse.json(body);
    resp.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return resp;
  } catch (err) {
    logger.error("Search error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 },
    );
  }
}
