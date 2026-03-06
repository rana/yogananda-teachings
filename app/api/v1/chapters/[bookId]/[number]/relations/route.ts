/**
 * GET /api/v1/chapters/:bookId/:number/relations — M3c-2 (FTR-030, FTR-015).
 *
 * Batch prefetch tier: all paragraph relations for an entire chapter
 * in a single response. This is the core data source for the reading
 * session side panel — pre-computed, zero latency, the technology disappears.
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getChapterRelations } from "@/lib/services/relations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string; number: string }> },
) {
  const { bookId, number } = await params;
  const chapterNumber = parseInt(number, 10);

  if (!bookId || isNaN(chapterNumber) || chapterNumber < 1) {
    return NextResponse.json(
      { error: "Invalid book ID or chapter number" },
      { status: 400 },
    );
  }

  const relations = await getChapterRelations(pool, bookId, chapterNumber);

  return NextResponse.json({
    data: relations.paragraphs,
    thread: relations.thread,
    meta: {
      bookId,
      chapterNumber,
      paragraphCount: Object.keys(relations.paragraphs).length,
      threadCount: relations.thread.length,
    },
  });
}
