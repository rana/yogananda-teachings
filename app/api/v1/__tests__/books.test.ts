/**
 * Books API route tests — /api/v1/books, chapters, integrity.
 *
 * Tests route handlers with mocked service layers and db pool.
 * Verifies HTTP status codes, JSON response shapes, headers, and error cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────

const mockQuery = vi.fn();

vi.mock("@/lib/db", () => ({
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

vi.mock("@/lib/services/books", () => ({
  getBooks: vi.fn(),
  getChapters: vi.fn(),
  getChapterContent: vi.fn(),
}));

import { GET as booksGET } from "../books/route";
import { GET as chapterGET } from "../books/[bookId]/chapters/[chapter]/route";
import { GET as integrityGET } from "../books/[bookId]/integrity/route";
import { getBooks, getChapters, getChapterContent } from "@/lib/services/books";

const mockGetBooks = vi.mocked(getBooks);
const mockGetChapters = vi.mocked(getChapters);
const mockGetChapterContent = vi.mocked(getChapterContent);

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

// ── /api/v1/books ───────────────────────────────────────────────

describe("/api/v1/books", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all books without filters", async () => {
    mockGetBooks.mockResolvedValue([
      {
        id: "book-1",
        title: "Autobiography of a Yogi",
        author: "Paramahansa Yogananda",
        language: "en",
        publicationYear: 1946,
        coverImageUrl: null,
        bookstoreUrl: null,
      },
      {
        id: "book-2",
        title: "Autobiografia de un yogui",
        author: "Paramahansa Yogananda",
        language: "es",
        publicationYear: 1946,
        coverImageUrl: null,
        bookstoreUrl: null,
      },
    ]);

    const req = makeRequest("http://localhost:3000/api/v1/books");
    const res = await booksGET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].title).toBe("Autobiography of a Yogi");
  });

  it("filters by language parameter", async () => {
    mockGetBooks.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/books?language=es");
    await booksGET(req);

    expect(mockGetBooks).toHaveBeenCalledWith(
      expect.anything(),
      "es",
      expect.objectContaining({ updatedSince: null, createdSince: null }),
    );
  });

  it("returns chapters when id parameter is provided", async () => {
    mockGetChapters.mockResolvedValue([
      {
        id: "ch-1",
        bookId: "book-1",
        chapterNumber: 1,
        title: "My Parents and Early Life",
        sortOrder: 1,
      },
      {
        id: "ch-2",
        bookId: "book-1",
        chapterNumber: 2,
        title: "My Mother's Death and the Mystic Amulet",
        sortOrder: 2,
      },
    ]);

    const req = makeRequest("http://localhost:3000/api/v1/books?id=book-1");
    const res = await booksGET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].title).toBe("My Parents and Early Life");
  });

  it("passes timestamp filters to getBooks", async () => {
    mockGetBooks.mockResolvedValue([]);

    const req = makeRequest(
      "http://localhost:3000/api/v1/books?updated_since=2026-01-01T00:00:00Z&created_since=2025-06-01T00:00:00Z",
    );
    await booksGET(req);

    expect(mockGetBooks).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      expect.objectContaining({
        updatedSince: "2026-01-01T00:00:00Z",
        createdSince: "2025-06-01T00:00:00Z",
      }),
    );
  });

  it("passes timestamp filters to getChapters", async () => {
    mockGetChapters.mockResolvedValue([]);

    const req = makeRequest(
      "http://localhost:3000/api/v1/books?id=book-1&updated_since=2026-03-01T00:00:00Z",
    );
    await booksGET(req);

    expect(mockGetChapters).toHaveBeenCalledWith(
      expect.anything(),
      "book-1",
      expect.objectContaining({ updatedSince: "2026-03-01T00:00:00Z" }),
    );
  });

  it("returns 500 on service error", async () => {
    mockGetBooks.mockRejectedValue(new Error("Connection refused"));

    const req = makeRequest("http://localhost:3000/api/v1/books");
    const res = await booksGET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch books");
  });
});

// ── /api/v1/books/:bookId/chapters/:chapter ─────────────────────

describe("/api/v1/books/:bookId/chapters/:chapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns chapter content with full structure", async () => {
    mockGetChapterContent.mockResolvedValue({
      chapter: {
        id: "ch-1",
        bookId: "book-1",
        chapterNumber: 1,
        title: "My Parents and Early Life",
        sortOrder: 1,
      },
      book: {
        id: "book-1",
        title: "Autobiography of a Yogi",
        author: "Paramahansa Yogananda",
        language: "en",
        publicationYear: 1946,
        coverImageUrl: null,
        bookstoreUrl: null,
      },
      paragraphs: [
        {
          id: "p-1",
          content: "The characteristic features of Indian culture...",
          formatting: [],
          pageNumber: 1,
          paragraphIndex: 0,
        },
      ],
      footnotes: [],
      prevChapter: null,
      nextChapter: { id: "ch-2", chapterNumber: 2, title: "My Mother's Death" },
    });

    const req = makeRequest("http://localhost:3000/api/v1/books/book-1/chapters/1");
    const params = Promise.resolve({ bookId: "book-1", chapter: "1" });
    const res = await chapterGET(req, { params });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.chapter.title).toBe("My Parents and Early Life");
    expect(body.data.book.title).toBe("Autobiography of a Yogi");
    expect(body.data.paragraphs).toHaveLength(1);
    expect(body.data.prevChapter).toBeNull();
    expect(body.data.nextChapter.chapterNumber).toBe(2);
  });

  it("returns 400 for non-numeric chapter", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/books/book-1/chapters/abc");
    const params = Promise.resolve({ bookId: "book-1", chapter: "abc" });
    const res = await chapterGET(req, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid chapter number");
  });

  it("returns 400 for chapter number 0", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/books/book-1/chapters/0");
    const params = Promise.resolve({ bookId: "book-1", chapter: "0" });
    const res = await chapterGET(req, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid chapter number");
  });

  it("returns 400 for negative chapter number", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/books/book-1/chapters/-1");
    const params = Promise.resolve({ bookId: "book-1", chapter: "-1" });
    const res = await chapterGET(req, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid chapter number");
  });

  it("returns 404 when chapter not found", async () => {
    mockGetChapterContent.mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/v1/books/book-1/chapters/999");
    const params = Promise.resolve({ bookId: "book-1", chapter: "999" });
    const res = await chapterGET(req, { params });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Chapter not found");
  });

  it("returns 500 on service error", async () => {
    mockGetChapterContent.mockRejectedValue(new Error("Query timeout"));

    const req = makeRequest("http://localhost:3000/api/v1/books/book-1/chapters/1");
    const params = Promise.resolve({ bookId: "book-1", chapter: "1" });
    const res = await chapterGET(req, { params });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch chapter");
  });
});

// ── /api/v1/books/:bookId/integrity ─────────────────────────────

describe("/api/v1/books/:bookId/integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns integrity hashes for a book", async () => {
    // First call: book lookup
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "book-1",
          title: "Autobiography of a Yogi",
          author: "Paramahansa Yogananda",
          language: "en",
        },
      ],
    });
    // Second call: chapter hashes
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          chapter_number: 1,
          title: "My Parents and Early Life",
          content_hash: "abc123def456",
          chunk_count: 32,
        },
        {
          chapter_number: 2,
          title: "My Mother's Death",
          content_hash: "789xyz012",
          chunk_count: 28,
        },
      ],
    });

    const req = new Request("http://localhost:3000/api/v1/books/book-1/integrity");
    const params = Promise.resolve({ bookId: "book-1" });
    const res = await integrityGET(req, { params });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.book.id).toBe("book-1");
    expect(body.data.book.title).toBe("Autobiography of a Yogi");
    expect(body.data.chapters).toHaveLength(2);
    expect(body.data.chapters[0].contentHash).toBe("abc123def456");
    expect(body.data.chapters[0].chunkCount).toBe(32);
    expect(body.data.algorithm).toBe("sha256");
    expect(body.data.method).toContain("SHA-256");

    // Should have Cache-Control header for immutable content
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400");
  });

  it("returns 404 when book not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req = new Request("http://localhost:3000/api/v1/books/nonexistent/integrity");
    const params = Promise.resolve({ bookId: "nonexistent" });
    const res = await integrityGET(req, { params });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Book not found");
  });

  it("handles chapters with null content hash", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: "book-1", title: "Test Book", author: "Author", language: "en" }],
    });
    mockQuery.mockResolvedValueOnce({
      rows: [
        { chapter_number: 1, title: "Empty Chapter", content_hash: null, chunk_count: 0 },
      ],
    });

    const req = new Request("http://localhost:3000/api/v1/books/book-1/integrity");
    const params = Promise.resolve({ bookId: "book-1" });
    const res = await integrityGET(req, { params });
    const body = await res.json();
    expect(body.data.chapters[0].contentHash).toBeNull();
    expect(body.data.chapters[0].chunkCount).toBe(0);
  });

  it("returns 500 on database error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("Connection lost"));

    const req = new Request("http://localhost:3000/api/v1/books/book-1/integrity");
    const params = Promise.resolve({ bookId: "book-1" });
    const res = await integrityGET(req, { params });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to compute integrity hashes");
  });
});
