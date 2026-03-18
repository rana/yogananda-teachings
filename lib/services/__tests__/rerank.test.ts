/**
 * Rerank service tests — M3a-12.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { rerank } from "../rerank";

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const candidates = [
  { id: "chunk-1", content: "God is approachable through meditation." },
  { id: "chunk-2", content: "The guru leads the disciple to enlightenment." },
  { id: "chunk-3", content: "Happiness lies within, not in external possessions." },
];

describe("rerank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.COHERE_API_KEY;
  });

  it("returns null when COHERE_API_KEY is not set", async () => {
    const result = await rerank("meditation", candidates);
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns reranked results with relevance scores", async () => {
    process.env.COHERE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { index: 0, relevance_score: 0.95 },
            { index: 2, relevance_score: 0.72 },
          ],
        }),
    });

    const result = await rerank("meditation", candidates, 2);

    expect(result).toHaveLength(2);
    expect(result![0].index).toBe(0);
    expect(result![0].relevance_score).toBe(0.95);
    expect(result![1].index).toBe(2);

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.cohere.com/v2/rerank",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      }),
    );
  });

  it("returns null when Cohere API returns non-OK", async () => {
    process.env.COHERE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await rerank("meditation", candidates);
    expect(result).toBeNull();
  });

  it("returns null when Cohere API call throws", async () => {
    process.env.COHERE_API_KEY = "test-key";
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await rerank("meditation", candidates);
    expect(result).toBeNull();
  });

  it("returns empty array for empty candidates", async () => {
    process.env.COHERE_API_KEY = "test-key";

    const result = await rerank("meditation", []);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("sends correct model and top_n in request body", async () => {
    process.env.COHERE_API_KEY = "test-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [{ index: 0, relevance_score: 0.9 }] }),
    });

    await rerank("test", candidates, 5);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe("rerank-v3.5");
    expect(body.top_n).toBe(3); // min(5, candidates.length=3)
    expect(body.documents).toHaveLength(3);
  });
});
