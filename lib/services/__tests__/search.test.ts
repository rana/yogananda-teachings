/**
 * Search service unit tests — M2a-21, M2b-12, M2b-13.
 *
 * Tests the hybrid search service with mock pg.Pool.
 * Mocks Voyage API, HyDE (Claude Bedrock), and Cohere Rerank.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { search, clearEmbeddingCache } from "../search";

// Mock fetch for Voyage and Cohere API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock HyDE generation
vi.mock("../hyde", () => ({
  generateHypotheticalDocument: vi.fn().mockResolvedValue(null),
}));

// Mock Rerank
vi.mock("../rerank", () => ({
  rerank: vi.fn().mockResolvedValue(null),
}));

import { generateHypotheticalDocument } from "../hyde";
import { rerank } from "../rerank";

const mockHyde = generateHypotheticalDocument as ReturnType<typeof vi.fn>;
const mockRerank = rerank as ReturnType<typeof vi.fn>;

function mockPool(rows: Record<string, unknown>[]) {
  return {
    query: vi.fn().mockResolvedValue({ rows }),
  } as unknown as import("pg").Pool;
}

const sampleRow = {
  id: "chunk-1",
  slug: "god-approachable",
  rrf_score: "0.85",
  from_vector: true,
  from_fts: true,
  content: "God is approachable.",
  page_number: 98,
  section_heading: null,
  language: "en",
  book_id: "book-1",
  book_slug: "autobiography-of-a-yogi",
  book_title: "Autobiography of a Yogi",
  book_author: "Paramahansa Yogananda",
  chapter_title: "Years in My Master's Hermitage",
  chapter_number: 12,
};

describe("search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearEmbeddingCache(); // Prevent cross-test cache leakage
    // Default: Voyage API not available (no API key)
    delete process.env.VOYAGE_API_KEY;
    mockHyde.mockResolvedValue(null);
    mockRerank.mockResolvedValue(null);
  });

  it("returns FTS-only results when VOYAGE_API_KEY is not set", async () => {
    const pool = mockPool([{ ...sampleRow, score: "0.5" }]);

    const result = await search(pool, { query: "God" });

    expect(result.mode).toBe("fts_only");
    expect(result.results).toHaveLength(1);
    expect(result.results[0].content).toBe("God is approachable.");
    expect(result.results[0].bookTitle).toBe("Autobiography of a Yogi");
    expect(result.results[0].chapterNumber).toBe(12);
  });

  it("returns empty results for no matches", async () => {
    const pool = mockPool([]);

    const result = await search(pool, { query: "xyznonexistent" });

    expect(result.results).toHaveLength(0);
    expect(result.totalResults).toBe(0);
  });

  it("includes duration in response", async () => {
    const pool = mockPool([]);

    const result = await search(pool, { query: "test" });

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.durationMs).toBe("number");
  });

  it("falls back to English when non-English search returns no results", async () => {
    let callCount = 0;
    const pool = {
      query: vi.fn().mockImplementation(() => {
        callCount++;
        // First call (Spanish): no results. Second call (English): results.
        // Third call: query logging
        if (callCount === 1) return { rows: [] };
        if (callCount === 2) return { rows: [{ ...sampleRow, score: "0.5" }] };
        return { rows: [] };
      }),
    } as unknown as import("pg").Pool;

    const result = await search(pool, { query: "Dios", language: "es" });

    expect(result.fallbackLanguage).toBe("en");
    expect(result.results).toHaveLength(1);
  });

  it("does not fallback when English search returns no results", async () => {
    const pool = mockPool([]);

    const result = await search(pool, { query: "nonexistent", language: "en" });

    expect(result.fallbackLanguage).toBeUndefined();
  });

  it("uses hybrid mode when Voyage API is available", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: new Array(1024).fill(0.1) }],
        }),
    });

    const pool = mockPool([sampleRow]);

    const result = await search(pool, { query: "meditation" });

    expect(result.mode).toBe("hybrid");
    expect(result.results).toHaveLength(1);
    expect(result.results[0].sources).toContain("vector");
    expect(result.results[0].sources).toContain("fts");
  });

  it("falls back to FTS when Voyage API fails", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({ ok: false });

    const pool = mockPool([{ ...sampleRow, score: "0.5" }]);

    const result = await search(pool, { query: "meditation" });

    expect(result.mode).toBe("fts_only");
  });

  it("respects the limit parameter", async () => {
    const pool = mockPool([{ ...sampleRow, score: "0.5" }]);

    await search(pool, { query: "test", limit: 5 });

    // Verify limit was passed to the query
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([5]),
    );
  });

  // ── HyDE enhancement (M2b-12) ──────────────────────────────────

  it("uses enhanced mode with HyDE when enhance='hyde' and HyDE succeeds", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    // Query embedding (call 1) + HyDE document embedding (call 2)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.2) }] }),
      });

    mockHyde.mockResolvedValueOnce(
      "Meditation is the science of God-realization. Through deep stillness of body and mind...",
    );

    const pool = mockPool([{ ...sampleRow, from_hyde: true }]);

    const result = await search(pool, { query: "meditation", enhance: "hyde" });

    expect(result.mode).toBe("enhanced");
    expect(result.enhancements).toContain("hyde");
    expect(mockHyde).toHaveBeenCalledWith("meditation", "en");
  });

  it("falls back to standard hybrid when HyDE generation fails", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
    });

    mockHyde.mockResolvedValueOnce(null); // HyDE failed

    const pool = mockPool([sampleRow]);

    const result = await search(pool, { query: "meditation", enhance: "hyde" });

    expect(result.mode).toBe("hybrid"); // Not enhanced — HyDE failed
    expect(result.enhancements).toBeUndefined();
  });

  // ── Rerank enhancement (M2b-13) ────────────────────────────────

  it("reranks results when enhance='rerank' and Cohere succeeds", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
    });

    const sampleRow2 = { ...sampleRow, id: "chunk-2", rrf_score: "0.70" };
    const pool = mockPool([sampleRow, sampleRow2]);

    mockRerank.mockResolvedValueOnce([
      { index: 1, relevance_score: 0.98 }, // chunk-2 ranked higher
      { index: 0, relevance_score: 0.82 }, // chunk-1 ranked lower
    ]);

    const result = await search(pool, { query: "meditation", enhance: "rerank" });

    expect(result.mode).toBe("enhanced");
    expect(result.enhancements).toContain("rerank");
    // chunk-2 should now be first (reranker put it first)
    expect(result.results[0].id).toBe("chunk-2");
    expect(result.results[0].score).toBe(0.98);
  });

  it("falls back to RRF scores when Cohere fails", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
    });

    const pool = mockPool([sampleRow]);
    mockRerank.mockResolvedValueOnce(null); // Rerank failed

    const result = await search(pool, { query: "meditation", enhance: "rerank" });

    expect(result.mode).toBe("hybrid"); // Not enhanced — rerank failed
    expect(result.results[0].score).toBe(0.85); // Original RRF score
  });

  // ── Full enhancement (M2b-12 + M2b-13) ────────────────────────

  it("applies both HyDE and Rerank when enhance='full'", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.2) }] }),
      });

    mockHyde.mockResolvedValueOnce("A hypothetical passage about finding inner peace...");
    mockRerank.mockResolvedValueOnce([
      { index: 0, relevance_score: 0.99 },
    ]);

    const pool = mockPool([{ ...sampleRow, from_hyde: true }]);

    const result = await search(pool, { query: "inner peace", enhance: "full" });

    expect(result.mode).toBe("enhanced");
    expect(result.enhancements).toContain("hyde");
    expect(result.enhancements).toContain("rerank");
    expect(result.results[0].score).toBe(0.99);
  });

  // ── Embedding cache (L2 optimization) ────────────────────────────

  it("caches embeddings across identical queries", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    // First call: Voyage API returns embedding
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
    });

    const pool = mockPool([sampleRow]);

    await search(pool, { query: "meditation" });

    // Second call: same query, should use cache — no additional Voyage fetch
    await search(pool, { query: "meditation" });

    // Voyage API called only once (first search), not twice
    const voyageCalls = mockFetch.mock.calls.filter(
      (call) =>
        typeof call[0] === "string" && call[0].includes("voyageai.com"),
    );
    expect(voyageCalls).toHaveLength(1);
  });

  it("embedding cache respects different queries", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ embedding: new Array(1024).fill(0.1) }],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ embedding: new Array(1024).fill(0.2) }],
          }),
      });

    const pool = mockPool([sampleRow]);

    await search(pool, { query: "meditation" });
    await search(pool, { query: "cosmic consciousness" });

    // Two different queries = two Voyage calls
    const voyageCalls = mockFetch.mock.calls.filter(
      (call) =>
        typeof call[0] === "string" && call[0].includes("voyageai.com"),
    );
    expect(voyageCalls).toHaveLength(2);
  });

  it("does not activate enhancements without enhance option", async () => {
    process.env.VOYAGE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: new Array(1024).fill(0.1) }] }),
    });

    const pool = mockPool([sampleRow]);

    const result = await search(pool, { query: "meditation" });

    expect(result.mode).toBe("hybrid");
    expect(result.enhancements).toBeUndefined();
    expect(mockHyde).not.toHaveBeenCalled();
    expect(mockRerank).not.toHaveBeenCalled();
  });
});
