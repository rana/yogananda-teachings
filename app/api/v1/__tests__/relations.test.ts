/**
 * Relations API route tests — M3c-2 (FTR-030, FTR-015).
 *
 * Tests /api/v1/passages/:id/related and /api/v1/chapters/:bookId/:number/relations.
 * Verifies HTTP status codes, JSON response shapes, and error cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
  default: { query: vi.fn() },
}));

vi.mock("@/lib/services/relations", () => ({
  getRelatedPassages: vi.fn(),
  getChapterRelations: vi.fn(),
}));

import { GET as passageRelatedGET } from "../passages/[id]/related/route";
import { GET as chapterRelationsGET } from "../chapters/[bookId]/[number]/relations/route";
import { getRelatedPassages, getChapterRelations } from "@/lib/services/relations";

const mockGetRelatedPassages = vi.mocked(getRelatedPassages);
const mockGetChapterRelations = vi.mocked(getChapterRelations);

// ── Helpers ──────────────────────────────────────────────────────

function makeRequest(url: string): Request {
  return new Request(url);
}

// ── /api/v1/passages/:id/related ────────────────────────────────

describe("/api/v1/passages/:id/related", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns related passages for a valid chunk ID", async () => {
    mockGetRelatedPassages.mockResolvedValue([
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
        relationLabel: "Theme of divine accessibility",
      },
    ]);

    const req = makeRequest("http://localhost:3000/api/v1/passages/chunk-12345678/related");
    const params = Promise.resolve({ id: "chunk-12345678" });
    const res = await passageRelatedGET(req, { params });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("chunk-2");
    expect(body.meta.passageId).toBe("chunk-12345678");
    expect(body.meta.totalResults).toBe(1);
  });

  it("returns 400 for invalid passage ID", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/passages/short/related");
    const params = Promise.resolve({ id: "short" });
    const res = await passageRelatedGET(req, { params });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid passage ID");
  });

  it("returns 400 for empty passage ID", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/passages//related");
    const params = Promise.resolve({ id: "" });
    const res = await passageRelatedGET(req, { params });

    expect(res.status).toBe(400);
  });

  it("respects limit query parameter", async () => {
    mockGetRelatedPassages.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/passages/chunk-12345678/related?limit=10");
    const params = Promise.resolve({ id: "chunk-12345678" });
    await passageRelatedGET(req, { params });

    expect(mockGetRelatedPassages).toHaveBeenCalledWith(
      expect.anything(),
      "chunk-12345678",
      10,
    );
  });

  it("caps limit at 30", async () => {
    mockGetRelatedPassages.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/passages/chunk-12345678/related?limit=100");
    const params = Promise.resolve({ id: "chunk-12345678" });
    await passageRelatedGET(req, { params });

    expect(mockGetRelatedPassages).toHaveBeenCalledWith(
      expect.anything(),
      "chunk-12345678",
      30,
    );
  });

  it("returns empty data array when no relations exist", async () => {
    mockGetRelatedPassages.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/passages/chunk-12345678/related");
    const params = Promise.resolve({ id: "chunk-12345678" });
    const res = await passageRelatedGET(req, { params });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.totalResults).toBe(0);
  });
});

// ── /api/v1/chapters/:bookId/:number/relations ──────────────────

describe("/api/v1/chapters/:bookId/:number/relations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns chapter relations with correct response shape", async () => {
    mockGetChapterRelations.mockResolvedValue({
      paragraphs: {
        "c1": [
          {
            id: "r1",
            content: "Related passage",
            bookId: "book-a",
            bookSlug: "book-a",
            bookTitle: "Book A",
            bookAuthor: "Author A",
            chapterTitle: "Chapter 5",
            chapterNumber: 5,
            pageNumber: 42,
            similarity: 0.8,
            rank: 1,
            relationType: null,
            relationLabel: null,
          },
        ],
      },
      thread: [
        {
          chapterNumber: 12,
          chapterTitle: "Years in My Master's Hermitage",
          bookTitle: "Autobiography of a Yogi",
          bookId: "book-1",
          bookSlug: "autobiography-of-a-yogi",
          connectionCount: 8,
          label: null,
        },
      ],
    });

    const req = makeRequest("http://localhost:3000/api/v1/chapters/book-1/1/relations");
    const params = Promise.resolve({ bookId: "book-1", number: "1" });
    const res = await chapterRelationsGET(req, { params });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveProperty("c1");
    expect(body.thread).toHaveLength(1);
    expect(body.meta.bookId).toBe("book-1");
    expect(body.meta.chapterNumber).toBe(1);
    expect(body.meta.paragraphCount).toBe(1);
    expect(body.meta.threadCount).toBe(1);
  });

  it("returns 400 for invalid chapter number", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/chapters/book-1/abc/relations");
    const params = Promise.resolve({ bookId: "book-1", number: "abc" });
    const res = await chapterRelationsGET(req, { params });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid");
  });

  it("returns 400 for chapter number less than 1", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/chapters/book-1/0/relations");
    const params = Promise.resolve({ bookId: "book-1", number: "0" });
    const res = await chapterRelationsGET(req, { params });

    expect(res.status).toBe(400);
  });

  it("returns 400 for empty book ID", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/chapters//1/relations");
    const params = Promise.resolve({ bookId: "", number: "1" });
    const res = await chapterRelationsGET(req, { params });

    expect(res.status).toBe(400);
  });

  it("returns empty result when chapter has no relations", async () => {
    mockGetChapterRelations.mockResolvedValue({
      paragraphs: {},
      thread: [],
    });

    const req = makeRequest("http://localhost:3000/api/v1/chapters/book-1/99/relations");
    const params = Promise.resolve({ bookId: "book-1", number: "99" });
    const res = await chapterRelationsGET(req, { params });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({});
    expect(body.thread).toEqual([]);
    expect(body.meta.paragraphCount).toBe(0);
  });
});
