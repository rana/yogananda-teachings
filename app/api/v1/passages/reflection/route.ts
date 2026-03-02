/**
 * Reflection passage API — /api/v1/passages/reflection
 *
 * Returns a random contemplative passage for the Quiet Corner.
 * Shorter than the general random passage — suited for quiet reflection
 * (PRI-08: calm technology). Verbatim text (PRI-01) with full attribution (PRI-02).
 *
 * Query params:
 *   language — language filter (default: "en")
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getReflectionPassage } from "@/lib/services/passages";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const language = request.nextUrl.searchParams.get("language") || "en";

  try {
    const passage = await getReflectionPassage(pool, language);

    if (!passage) {
      return NextResponse.json(
        { error: "No reflections available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: passage.id,
        content: passage.content,
        citation: {
          bookId: passage.bookId,
          book: passage.bookTitle,
          author: passage.bookAuthor,
          chapter: passage.chapterTitle,
          chapterNumber: passage.chapterNumber,
          page: passage.pageNumber,
        },
        language: passage.language,
      },
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    logger.error("Reflection passage error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to fetch reflection" },
      { status: 500 },
    );
  }
}
