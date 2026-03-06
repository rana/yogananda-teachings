/**
 * Content integrity API — M2a-15 (FTR-123).
 *
 * Returns SHA-256 hashes per chapter for a given book.
 * Enables external verification of content integrity.
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const { bookId } = await params;

    // Verify book exists
    const bookResult = await pool.query(
      "SELECT id, title, author, language FROM books WHERE id = $1",
      [bookId],
    );

    if (bookResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 },
      );
    }

    const book = bookResult.rows[0];

    // Compute SHA-256 per chapter from concatenated chunk content
    const { rows } = await pool.query(
      `SELECT c.chapter_number, c.title,
              encode(sha256(string_agg(bc.content, '' ORDER BY bc.paragraph_index)::bytea), 'hex') as content_hash,
              count(bc.id)::int as chunk_count
       FROM chapters c
       LEFT JOIN book_chunks bc ON bc.chapter_id = c.id
       WHERE c.book_id = $1
       GROUP BY c.id, c.chapter_number, c.title, c.sort_order
       ORDER BY c.sort_order`,
      [bookId],
    );

    return NextResponse.json({
      data: {
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          language: book.language,
        },
        chapters: rows.map((r) => ({
          chapterNumber: r.chapter_number,
          title: r.title,
          contentHash: r.content_hash || null,
          chunkCount: r.chunk_count,
        })),
        algorithm: "sha256",
        method: "SHA-256 of concatenated chunk content ordered by paragraph_index",
      },
    }, {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    logger.error("Integrity API error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to compute integrity hashes" },
      { status: 500 },
    );
  }
}
