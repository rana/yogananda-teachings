/**
 * Search API route tests — /api/v1/search, /api/v1/search/suggest, /api/v1/search/crisis.
 *
 * Tests route handlers with mocked service layers.
 * Verifies HTTP status codes, JSON response shapes, headers, and error cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────

// Mock the search service
vi.mock("@/lib/services/search", () => ({
  search: vi.fn(),
}));

// Mock the rate limiter
vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

// Mock the suggestions service
vi.mock("@/lib/services/suggestions", () => ({
  getSuggestions: vi.fn(),
}));

// Mock the crisis service
vi.mock("@/lib/services/crisis", () => ({
  detectCrisis: vi.fn(),
}));

// Mock the db pool (used by suggest route)
vi.mock("@/lib/db", () => ({
  default: { query: vi.fn() },
}));

import { GET as searchGET } from "../search/route";
import { GET as suggestGET } from "../search/suggest/route";
import { GET as crisisGET } from "../search/crisis/route";
import { search } from "@/lib/services/search";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getSuggestions } from "@/lib/services/suggestions";
import { detectCrisis } from "@/lib/services/crisis";

const mockSearch = vi.mocked(search);
const mockRateLimit = vi.mocked(checkRateLimit);
const mockGetSuggestions = vi.mocked(getSuggestions);
const mockDetectCrisis = vi.mocked(detectCrisis);

function makeRequest(url: string, headers?: Record<string, string>): NextRequest {
  const req = new NextRequest(new URL(url, "http://localhost:3000"), {
    headers: headers || {},
  });
  return req;
}

// ── /api/v1/search ──────────────────────────────────────────────

describe("/api/v1/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockReturnValue({
      allowed: true,
      remaining: 14,
      limit: 15,
      resetAt: Date.now() + 60000,
    });
  });

  it("returns 400 when query parameter 'q' is missing", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/search");
    const res = await searchGET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("'q' is required");
  });

  it("returns 400 when query parameter 'q' is empty", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/search?q=");
    const res = await searchGET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("'q' is required");
  });

  it("returns 400 when query parameter 'q' is whitespace only", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/search?q=%20%20%20");
    const res = await searchGET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("'q' is required");
  });

  it("returns 400 when query exceeds 500 characters", async () => {
    const longQuery = "a".repeat(501);
    const req = makeRequest(`http://localhost:3000/api/v1/search?q=${longQuery}`);
    const res = await searchGET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("max 500 characters");
  });

  it("returns 429 when rate limited", async () => {
    const resetAt = Date.now() + 30000;
    mockRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      limit: 15,
      resetAt,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=yoga");
    const res = await searchGET(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Rate limit exceeded");
    expect(res.headers.get("Retry-After")).toBeDefined();
    expect(res.headers.get("X-RateLimit-Limit")).toBe("15");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("returns search results with proper ADR-110 shape", async () => {
    mockSearch.mockResolvedValue({
      results: [
        {
          id: "chunk-1",
          content: "The soul must stretch over the cosmos.",
          bookId: "book-1",
          bookTitle: "Autobiography of a Yogi",
          bookAuthor: "Paramahansa Yogananda",
          chapterTitle: "The Law of Miracles",
          chapterNumber: 30,
          pageNumber: 295,
          sectionHeading: null,
          language: "en",
          score: 0.85,
          sources: ["vector", "fts"],
        },
      ],
      query: "soul cosmos",
      mode: "hybrid",
      totalResults: 1,
      durationMs: 45,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=soul+cosmos");
    const res = await searchGET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toEqual({
      id: "chunk-1",
      content: "The soul must stretch over the cosmos.",
      citation: {
        bookId: "book-1",
        book: "Autobiography of a Yogi",
        author: "Paramahansa Yogananda",
        chapter: "The Law of Miracles",
        chapterNumber: 30,
        page: 295,
      },
      language: "en",
      score: 0.85,
      sources: ["vector", "fts"],
    });
    expect(body.meta.query).toBe("soul cosmos");
    expect(body.meta.mode).toBe("hybrid");
    expect(body.meta.language).toBe("en");
    expect(body.meta.totalResults).toBe(1);
    expect(body.meta.durationMs).toBeDefined();
  });

  it("passes language parameter to search service", async () => {
    mockSearch.mockResolvedValue({
      results: [],
      query: "alma",
      mode: "fts_only",
      totalResults: 0,
      durationMs: 10,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=alma&language=es");
    await searchGET(req);

    expect(mockSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ language: "es", query: "alma" }),
    );
  });

  it("defaults language to 'en'", async () => {
    mockSearch.mockResolvedValue({
      results: [],
      query: "peace",
      mode: "fts_only",
      totalResults: 0,
      durationMs: 5,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=peace");
    await searchGET(req);

    expect(mockSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ language: "en" }),
    );
  });

  it("respects limit parameter clamped between 1 and 50", async () => {
    mockSearch.mockResolvedValue({
      results: [],
      query: "test",
      mode: "fts_only",
      totalResults: 0,
      durationMs: 5,
    });

    // limit=100 should clamp to 50
    const req = makeRequest("http://localhost:3000/api/v1/search?q=test&limit=100");
    await searchGET(req);
    expect(mockSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 50 }),
    );
  });

  it("clamps limit=0 to 1", async () => {
    mockSearch.mockResolvedValue({
      results: [],
      query: "test",
      mode: "fts_only",
      totalResults: 0,
      durationMs: 5,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=test&limit=0");
    await searchGET(req);
    expect(mockSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 1 }),
    );
  });

  it("includes fallbackLanguage in meta when present", async () => {
    mockSearch.mockResolvedValue({
      results: [
        {
          id: "chunk-en",
          content: "English fallback content",
          bookId: "book-1",
          bookTitle: "Autobiography of a Yogi",
          bookAuthor: "Paramahansa Yogananda",
          chapterTitle: "Chapter 1",
          chapterNumber: 1,
          pageNumber: 10,
          sectionHeading: null,
          language: "en",
          score: 0.7,
          sources: ["fts"],
        },
      ],
      query: "yoga",
      mode: "fts_only",
      totalResults: 1,
      durationMs: 15,
      fallbackLanguage: "en",
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=yoga&language=hi");
    const res = await searchGET(req);
    const body = await res.json();
    expect(body.meta.fallbackLanguage).toBe("en");
  });

  it("returns 500 when search service throws", async () => {
    mockSearch.mockRejectedValue(new Error("Database connection failed"));

    const req = makeRequest("http://localhost:3000/api/v1/search?q=yoga");
    const res = await searchGET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Search failed");
  });

  it("trims query whitespace", async () => {
    mockSearch.mockResolvedValue({
      results: [],
      query: "meditation",
      mode: "fts_only",
      totalResults: 0,
      durationMs: 5,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=%20meditation%20");
    await searchGET(req);

    expect(mockSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ query: "meditation" }),
    );
  });

  it("sets edge Cache-Control header on successful responses", async () => {
    mockSearch.mockResolvedValue({
      results: [],
      query: "yoga",
      mode: "fts_only",
      totalResults: 0,
      durationMs: 5,
    });

    const req = makeRequest("http://localhost:3000/api/v1/search?q=yoga");
    const res = await searchGET(req);
    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300",
    );
  });
});

// ── /api/v1/search/suggest ──────────────────────────────────────

describe("/api/v1/search/suggest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty data array when prefix is less than 2 chars", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/search/suggest?q=a");
    const res = await suggestGET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  it("returns empty data array when prefix is missing", async () => {
    const req = makeRequest("http://localhost:3000/api/v1/search/suggest");
    const res = await suggestGET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it("returns suggestions for valid prefix", async () => {
    mockGetSuggestions.mockResolvedValue([
      { text: "My Parents and Early Life", type: "chapter" },
      { text: "My Mother's Death", type: "chapter" },
    ]);

    const req = makeRequest("http://localhost:3000/api/v1/search/suggest?q=My");
    const res = await suggestGET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].text).toBe("My Parents and Early Life");
    expect(body.data[0].type).toBe("chapter");
  });

  it("sets Cache-Control header for cacheable responses", async () => {
    mockGetSuggestions.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/search/suggest?q=yoga");
    const res = await suggestGET(req);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");
  });

  it("passes language parameter to getSuggestions", async () => {
    mockGetSuggestions.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/search/suggest?q=cap&language=es");
    await suggestGET(req);

    expect(mockGetSuggestions).toHaveBeenCalledWith(
      expect.anything(),
      "cap",
      "es",
      5,
    );
  });

  it("defaults language to 'en'", async () => {
    mockGetSuggestions.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/v1/search/suggest?q=yoga");
    await suggestGET(req);

    expect(mockGetSuggestions).toHaveBeenCalledWith(
      expect.anything(),
      "yoga",
      "en",
      5,
    );
  });

  it("returns empty data array on service error (graceful degradation)", async () => {
    mockGetSuggestions.mockRejectedValue(new Error("DB timeout"));

    const req = makeRequest("http://localhost:3000/api/v1/search/suggest?q=yoga");
    const res = await suggestGET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

// ── /api/v1/search/crisis ───────────────────────────────────────

describe("/api/v1/search/crisis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns crisis detection result for a crisis query", async () => {
    mockDetectCrisis.mockReturnValue({
      detected: true,
      helpline: {
        name: "988 Suicide & Crisis Lifeline",
        action: "Call or text 988",
        url: "https://988lifeline.org",
        available: "24/7, free and confidential",
      },
    });

    const req = makeRequest("http://localhost:3000/api/v1/search/crisis?q=want+to+die");
    const res = await crisisGET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.detected).toBe(true);
    expect(body.helpline.name).toContain("988");
    expect(body.helpline.url).toBe("https://988lifeline.org");
  });

  it("returns detected: false for non-crisis query", async () => {
    mockDetectCrisis.mockReturnValue({ detected: false });

    const req = makeRequest("http://localhost:3000/api/v1/search/crisis?q=meditation");
    const res = await crisisGET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.detected).toBe(false);
    expect(body.helpline).toBeUndefined();
  });

  it("passes language parameter to detectCrisis", async () => {
    mockDetectCrisis.mockReturnValue({ detected: false });

    const req = makeRequest("http://localhost:3000/api/v1/search/crisis?q=meditacion&language=es");
    await crisisGET(req);

    expect(mockDetectCrisis).toHaveBeenCalledWith("meditacion", "es");
  });

  it("defaults language to 'en' and query to empty string", async () => {
    mockDetectCrisis.mockReturnValue({ detected: false });

    const req = makeRequest("http://localhost:3000/api/v1/search/crisis");
    await crisisGET(req);

    expect(mockDetectCrisis).toHaveBeenCalledWith("", "en");
  });
});
