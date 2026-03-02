/**
 * Chapter Content API — /api/v1/books/:bookId/chapters/:chapter
 *
 * Returns full chapter content with navigation (prev/next).
 * Chapter param is the chapter number (1-indexed).
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getChapterContent } from "@/lib/services/books";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string; chapter: string }> },
) {
  const { bookId, chapter } = await params;
  const chapterNumber = parseInt(chapter, 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    return NextResponse.json(
      { error: "Invalid chapter number" },
      { status: 400 },
    );
  }

  try {
    const content = await getChapterContent(pool, bookId, chapterNumber);

    if (!content) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: content });
  } catch (err) {
    logger.error("Chapter content error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 },
    );
  }
}
