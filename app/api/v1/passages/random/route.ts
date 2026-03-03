/**
 * Random passage API — /api/v1/passages/random
 *
 * Returns a random passage for "Today's Wisdom" / "Show me another".
 * Query params:
 *   language — language filter (default: "en")
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRandomPassage } from "@/lib/services/passages";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const language = request.nextUrl.searchParams.get("language") || "en";

  try {
    const passage = await getRandomPassage(pool, language);

    if (!passage) {
      return NextResponse.json(
        { error: "No passages available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: passage.id,
        slug: passage.slug,
        content: passage.content,
        citation: {
          bookId: passage.bookId,
          bookSlug: passage.bookSlug,
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
    logger.error("Random passage error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to fetch passage" },
      { status: 500 },
    );
  }
}
