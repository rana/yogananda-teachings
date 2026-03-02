/**
 * Search suggestions API — /api/v1/search/suggest (M1c-8)
 *
 * Tier B: pg_trgm fuzzy fallback for misspellings and transliterated input.
 * Query params:
 *   q        — prefix to match (required, min 2 chars)
 *   language — language filter (default: "en")
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSuggestions } from "@/lib/services/suggestions";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const prefix = request.nextUrl.searchParams.get("q") || "";
  const language = request.nextUrl.searchParams.get("language") || "en";

  if (prefix.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const suggestions = await getSuggestions(pool, prefix, language, 5);
    return NextResponse.json(
      { data: suggestions },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (err) {
    logger.error("Suggestions error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ data: [] });
  }
}
