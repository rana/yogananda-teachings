/**
 * Relations service unit tests — M3c-2 (FTR-030).
 *
 * Tests the relations service layer with a mock pg.Pool.
 * Verifies SQL parameterization, response mapping, and empty-state handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRelatedPassages,
  getChapterRelations,
} from "../relations";

// ── Mock pool helper ─────────────────────────────────────────────

function mockPool(responses: { rows: Record<string, unknown>[] }[]) {
  let callIdx = 0;
  return {
    query: vi.fn().mockImplementation(() => {
      const response = responses[callIdx] ?? { rows: [] };
      callIdx++;
      return Promise.resolve(response);
    }),
  } as unknown as import("pg").Pool;
}

function singleMockPool(rows: Record<string, unknown>[]) {
  return mockPool([{ rows }]);
}

// ── getRelatedPassages ───────────────────────────────────────────

describe("getRelatedPassages", () => {
  it("returns related passages for a chunk", async () => {
    const pool = singleMockPool([
      {
        id: "chunk-2",
        content: "God is approachable.",
        bookId: "book-1",
        bookSlug: "autobiography-of-a-yogi",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "Paramahansa Yogananda",
        chapterTitle: "Years in My Master's Hermitage",
        chapterNumber: 12,
        pageNumber: 98,
        similarity: 0.85,
        rank: 1,
        relationType: "thematic_echo",
        relationLabel: "Yogananda returns to this theme of divine accessibility",
      },
    ]);

    const passages = await getRelatedPassages(pool, "chunk-1");
    expect(passages).toHaveLength(1);
    expect(passages[0].id).toBe("chunk-2");
    expect(passages[0].bookTitle).toBe("Autobiography of a Yogi");
    expect(passages[0].similarity).toBe(0.85);
    expect(passages[0].relationLabel).toContain("divine accessibility");
  });

  it("returns empty array when no relations exist", async () => {
    const pool = singleMockPool([]);
    const passages = await getRelatedPassages(pool, "no-relations");
    expect(passages).toEqual([]);
  });

  it("passes similarity threshold and limit as parameters", async () => {
    const pool = singleMockPool([]);
    await getRelatedPassages(pool, "chunk-1", 10);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("cr.similarity >= $2"),
      expect.arrayContaining(["chunk-1", expect.any(Number), 10]),
    );
  });

  it("uses default limit from config", async () => {
    const pool = singleMockPool([]);
    await getRelatedPassages(pool, "chunk-1");
    // RELATIONS_DISPLAY_LIMIT = 5
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["chunk-1", expect.any(Number), 5]),
    );
  });
});

// ── getChapterRelations ──────────────────────────────────────────

describe("getChapterRelations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty result when chapter has no chunks", async () => {
    const pool = mockPool([{ rows: [] }]);
    const result = await getChapterRelations(pool, "book-1", 1);
    expect(result).toEqual({ paragraphs: {}, thread: [] });
    // Should only make one query (chunk IDs)
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("groups relations by source chunk ID", async () => {
    const pool = mockPool([
      // 1st query: chunk IDs
      { rows: [{ id: "c1" }, { id: "c2" }] },
      // 2nd query: relations
      {
        rows: [
          {
            sourceChunkId: "c1",
            id: "r1",
            content: "Related passage 1",
            bookId: "book-a",
            bookSlug: "book-a",
            bookTitle: "Book A",
            bookAuthor: "Author A",
            chapterTitle: "Ch 5",
            chapterNumber: 5,
            pageNumber: 42,
            similarity: 0.8,
            rank: 1,
            relationType: null,
            relationLabel: null,
          },
          {
            sourceChunkId: "c1",
            id: "r2",
            content: "Related passage 2",
            bookId: "book-b",
            bookSlug: "book-b",
            bookTitle: "Book B",
            bookAuthor: "Author B",
            chapterTitle: "Ch 3",
            chapterNumber: 3,
            pageNumber: null,
            similarity: 0.7,
            rank: 2,
            relationType: "thematic_echo",
            relationLabel: "Echoes this teaching",
          },
          {
            sourceChunkId: "c2",
            id: "r3",
            content: "Related passage 3",
            bookId: "book-a",
            bookSlug: "book-a",
            bookTitle: "Book A",
            bookAuthor: "Author A",
            chapterTitle: "Ch 8",
            chapterNumber: 8,
            pageNumber: 100,
            similarity: 0.9,
            rank: 1,
            relationType: null,
            relationLabel: null,
          },
        ],
      },
      // 3rd query: thread suggestions
      { rows: [] },
    ]);

    const result = await getChapterRelations(pool, "book-1", 1);
    expect(Object.keys(result.paragraphs)).toEqual(["c1", "c2"]);
    expect(result.paragraphs["c1"]).toHaveLength(2);
    expect(result.paragraphs["c2"]).toHaveLength(1);
    expect(result.paragraphs["c1"][0].id).toBe("r1");
    expect(result.paragraphs["c1"][1].relationLabel).toBe("Echoes this teaching");
    expect(result.paragraphs["c2"][0].similarity).toBe(0.9);
  });

  it("returns thread suggestions ordered by connection count", async () => {
    const pool = mockPool([
      { rows: [{ id: "c1" }] },
      { rows: [] },
      {
        rows: [
          {
            chapterNumber: 12,
            chapterTitle: "Years in My Master's Hermitage",
            bookTitle: "Autobiography of a Yogi",
            bookId: "book-1",
            bookSlug: "autobiography-of-a-yogi",
            connectionCount: 8,
            label: null,
          },
          {
            chapterNumber: 33,
            chapterTitle: "Babaji, the Yogi-Christ of Modern India",
            bookTitle: "Autobiography of a Yogi",
            bookId: "book-1",
            bookSlug: "autobiography-of-a-yogi",
            connectionCount: 5,
            label: "The deathless guru appears across chapters",
          },
        ],
      },
    ]);

    const result = await getChapterRelations(pool, "book-1", 1);
    expect(result.thread).toHaveLength(2);
    expect(result.thread[0].connectionCount).toBe(8);
    expect(result.thread[0].chapterNumber).toBe(12);
    expect(result.thread[1].label).toContain("deathless guru");
  });

  it("passes chunk IDs array to batch query", async () => {
    const pool = mockPool([
      { rows: [{ id: "c1" }, { id: "c2" }, { id: "c3" }] },
      { rows: [] },
      { rows: [] },
    ]);

    await getChapterRelations(pool, "book-1", 5);

    // Second query should use ANY($1) with the chunk IDs array
    expect(pool.query).toHaveBeenCalledTimes(3);
    const secondCall = (pool.query as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(secondCall[0]).toContain("ANY($1)");
    expect(secondCall[1][0]).toEqual(["c1", "c2", "c3"]);
  });

  it("excludes current chapter from thread suggestions", async () => {
    const pool = mockPool([
      { rows: [{ id: "c1" }] },
      { rows: [] },
      { rows: [] },
    ]);

    await getChapterRelations(pool, "book-1", 7);

    // Thread query should exclude chapter 7
    const thirdCall = (pool.query as ReturnType<typeof vi.fn>).mock.calls[2];
    expect(thirdCall[0]).toContain("chapter_number != $3");
    expect(thirdCall[1][2]).toBe(7);
  });
});
