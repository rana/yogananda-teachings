/**
 * Passages API route tests — /api/v1/passages/random, /api/v1/passages/reflection.
 *
 * Tests route handlers with mocked service layers.
 * Verifies HTTP status codes, JSON response shapes, headers, and error cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
  default: { query: vi.fn() },
}));

vi.mock("@/lib/services/passages", () => ({
  getRandomPassage: vi.fn(),
  getReflectionPassage: vi.fn(),
}));

import { GET as randomGET } from "../passages/random/route";
import { GET as reflectionGET } from "../passages/reflection/route";
import { getRandomPassage, getReflectionPassage } from "@/lib/services/passages";

const mockGetRandomPassage = vi.mocked(getRandomPassage);
const mockGetReflectionPassage = vi.mocked(getReflectionPassage);

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

const samplePassage = {
  id: "chunk-42",
  slug: "season-failure-best-time-sowing",
  content: "The season of failure is the best time for sowing the seeds of success.",
  bookId: "book-1",
  bookSlug: "autobiography-of-a-yogi",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterTitle: "Years in My Master's Hermitage",
  chapterNumber: 12,
  pageNumber: 117,
  language: "en",
};

// ── /api/v1/passages/random ─────────────────────────────────────

describe("/api/v1/passages/random", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a random passage with full citation", async () => {
    mockGetRandomPassage.mockResolvedValue(samplePassage);

    const req = makeRequest("http://localhost:3000/api/v1/passages/random");
    const res = await randomGET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.id).toBe("chunk-42");
    expect(body.data.content).toContain("season of failure");
    expect(body.data.citation).toEqual({
      bookId: "book-1",
      bookSlug: "autobiography-of-a-yogi",
      book: "Autobiography of a Yogi",
      author: "Paramahansa Yogananda",
      chapter: "Years in My Master's Hermitage",
      chapterNumber: 12,
      page: 117,
    });
    expect(body.data.language).toBe("en");
  });

  it("sets Cache-Control: no-store (every request is fresh)", async () => {
    mockGetRandomPassage.mockResolvedValue(samplePassage);

    const req = makeRequest("http://localhost:3000/api/v1/passages/random");
    const res = await randomGET(req);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("passes language parameter to service", async () => {
    mockGetRandomPassage.mockResolvedValue({
      ...samplePassage,
      language: "es",
    });

    const req = makeRequest("http://localhost:3000/api/v1/passages/random?language=es");
    await randomGET(req);

    expect(mockGetRandomPassage).toHaveBeenCalledWith(expect.anything(), "es");
  });

  it("defaults language to 'en'", async () => {
    mockGetRandomPassage.mockResolvedValue(samplePassage);

    const req = makeRequest("http://localhost:3000/api/v1/passages/random");
    await randomGET(req);

    expect(mockGetRandomPassage).toHaveBeenCalledWith(expect.anything(), "en");
  });

  it("returns 404 when no passages available", async () => {
    mockGetRandomPassage.mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/v1/passages/random");
    const res = await randomGET(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("No passages available");
  });

  it("returns 500 on service error", async () => {
    mockGetRandomPassage.mockRejectedValue(new Error("DB down"));

    const req = makeRequest("http://localhost:3000/api/v1/passages/random");
    const res = await randomGET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch passage");
  });
});

// ── /api/v1/passages/reflection ─────────────────────────────────

describe("/api/v1/passages/reflection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a reflection passage with full citation", async () => {
    const reflectionPassage = {
      ...samplePassage,
      id: "chunk-77",
      content: "Be as simple as you can be; you will be astonished to see how uncomplicated and happy your life can become.",
    };
    mockGetReflectionPassage.mockResolvedValue(reflectionPassage);

    const req = makeRequest("http://localhost:3000/api/v1/passages/reflection");
    const res = await reflectionGET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.id).toBe("chunk-77");
    expect(body.data.content).toContain("simple as you can be");
    expect(body.data.citation.book).toBe("Autobiography of a Yogi");
    expect(body.data.citation.author).toBe("Paramahansa Yogananda");
  });

  it("sets Cache-Control: no-store", async () => {
    mockGetReflectionPassage.mockResolvedValue(samplePassage);

    const req = makeRequest("http://localhost:3000/api/v1/passages/reflection");
    const res = await reflectionGET(req);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("passes language parameter to service", async () => {
    mockGetReflectionPassage.mockResolvedValue({
      ...samplePassage,
      language: "es",
    });

    const req = makeRequest("http://localhost:3000/api/v1/passages/reflection?language=es");
    await reflectionGET(req);

    expect(mockGetReflectionPassage).toHaveBeenCalledWith(expect.anything(), "es");
  });

  it("defaults language to 'en'", async () => {
    mockGetReflectionPassage.mockResolvedValue(samplePassage);

    const req = makeRequest("http://localhost:3000/api/v1/passages/reflection");
    await reflectionGET(req);

    expect(mockGetReflectionPassage).toHaveBeenCalledWith(expect.anything(), "en");
  });

  it("returns 404 when no reflections available", async () => {
    mockGetReflectionPassage.mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/v1/passages/reflection");
    const res = await reflectionGET(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("No reflections available");
  });

  it("returns 500 on service error", async () => {
    mockGetReflectionPassage.mockRejectedValue(new Error("Pool exhausted"));

    const req = makeRequest("http://localhost:3000/api/v1/passages/reflection");
    const res = await reflectionGET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch reflection");
  });
});
