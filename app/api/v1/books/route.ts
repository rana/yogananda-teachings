/**
 * Books API — /api/v1/books — M2a-24 (ADR-110).
 *
 * Lists all books. Query params:
 *   language      — filter by language code (e.g. "en", "es")
 *   id            — return chapters for a specific book
 *   updated_since — ISO 8601 timestamp, returns books/chapters updated after this time
 *   created_since — ISO 8601 timestamp, returns books/chapters created after this time
 *
 * Timestamp filtering enables incremental sync for consumers.
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getBooks, getChapters } from "@/lib/services/books";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("id");
  const language = request.nextUrl.searchParams.get("language") || undefined;
  const updatedSince = request.nextUrl.searchParams.get("updated_since");
  const createdSince = request.nextUrl.searchParams.get("created_since");

  try {
    if (bookId) {
      const chapters = await getChapters(pool, bookId, { updatedSince, createdSince });
      return NextResponse.json({ data: chapters });
    }

    const books = await getBooks(pool, language, { updatedSince, createdSince });
    return NextResponse.json({ data: books });
  } catch (err) {
    logger.error("Books API error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}
