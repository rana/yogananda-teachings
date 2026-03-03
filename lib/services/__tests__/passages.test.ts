/**
 * Passage service unit tests — M2a.
 *
 * Tests getRandomPassage and getReflectionPassage with mock pg.Pool.
 * Verifies SQL parameterization, config constants, and response mapping.
 */

import { describe, it, expect, vi } from "vitest";
import { getRandomPassage, getReflectionPassage } from "../passages";
import {
  PASSAGE_MIN_LENGTH,
  PASSAGE_MAX_LENGTH,
  REFLECTION_MAX_LENGTH,
} from "@/lib/config";

function mockPool(rows: Record<string, unknown>[]) {
  return { query: vi.fn().mockResolvedValue({ rows }) } as unknown as import("pg").Pool;
}

const sampleRow = {
  id: "chunk-1",
  slug: "beginning-spiritual-search-driven-great",
  content: "In the beginning of my spiritual search I was driven by a great hunger.",
  page_number: 42,
  language: "en",
  book_id: "book-1",
  book_slug: "autobiography-of-a-yogi",
  book_title: "Autobiography of a Yogi",
  book_author: "Paramahansa Yogananda",
  chapter_title: "My Parents and Early Life",
  chapter_number: 1,
};

describe("getRandomPassage", () => {
  it("returns a passage with full attribution (PRI-02)", async () => {
    const pool = mockPool([sampleRow]);

    const passage = await getRandomPassage(pool, "en");

    expect(passage).not.toBeNull();
    expect(passage!.id).toBe("chunk-1");
    expect(passage!.content).toBe(sampleRow.content);
    expect(passage!.bookId).toBe("book-1");
    expect(passage!.bookTitle).toBe("Autobiography of a Yogi");
    expect(passage!.bookAuthor).toBe("Paramahansa Yogananda");
    expect(passage!.chapterTitle).toBe("My Parents and Early Life");
    expect(passage!.chapterNumber).toBe(1);
    expect(passage!.pageNumber).toBe(42);
    expect(passage!.language).toBe("en");
  });

  it("uses config constants for length bounds", async () => {
    const pool = mockPool([]);

    await getRandomPassage(pool, "en");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("BETWEEN $2 AND $3"),
      ["en", PASSAGE_MIN_LENGTH, PASSAGE_MAX_LENGTH],
    );
  });

  it("filters by language", async () => {
    const pool = mockPool([]);

    await getRandomPassage(pool, "es");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("bc.language = $1"),
      ["es", PASSAGE_MIN_LENGTH, PASSAGE_MAX_LENGTH],
    );
  });

  it("returns null when no passages match", async () => {
    const pool = mockPool([]);

    const passage = await getRandomPassage(pool, "en");

    expect(passage).toBeNull();
  });

  it("defaults to English", async () => {
    const pool = mockPool([]);

    await getRandomPassage(pool);

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      ["en", PASSAGE_MIN_LENGTH, PASSAGE_MAX_LENGTH],
    );
  });
});

describe("getReflectionPassage", () => {
  it("returns a passage with full attribution (PRI-02)", async () => {
    const pool = mockPool([sampleRow]);

    const passage = await getReflectionPassage(pool, "en");

    expect(passage).not.toBeNull();
    expect(passage!.id).toBe("chunk-1");
    expect(passage!.content).toBe(sampleRow.content);
    expect(passage!.bookTitle).toBe("Autobiography of a Yogi");
    expect(passage!.bookAuthor).toBe("Paramahansa Yogananda");
    expect(passage!.chapterTitle).toBe("My Parents and Early Life");
    expect(passage!.chapterNumber).toBe(1);
    expect(passage!.pageNumber).toBe(42);
  });

  it("uses shorter max length for contemplative focus", async () => {
    const pool = mockPool([]);

    await getReflectionPassage(pool, "en");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("BETWEEN $2 AND $3"),
      ["en", PASSAGE_MIN_LENGTH, REFLECTION_MAX_LENGTH],
    );
  });

  it("reflection max is shorter than general passage max", () => {
    expect(REFLECTION_MAX_LENGTH).toBeLessThan(PASSAGE_MAX_LENGTH);
  });

  it("filters by language", async () => {
    const pool = mockPool([]);

    await getReflectionPassage(pool, "es");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("bc.language = $1"),
      ["es", PASSAGE_MIN_LENGTH, REFLECTION_MAX_LENGTH],
    );
  });

  it("returns null when no passages match", async () => {
    const pool = mockPool([]);

    const passage = await getReflectionPassage(pool, "en");

    expect(passage).toBeNull();
  });

  it("defaults to English", async () => {
    const pool = mockPool([]);

    await getReflectionPassage(pool);

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      ["en", PASSAGE_MIN_LENGTH, REFLECTION_MAX_LENGTH],
    );
  });
});
