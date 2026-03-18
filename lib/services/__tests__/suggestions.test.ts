/**
 * Suggestions service unit tests — FTR-029.
 *
 * Tests the suggestion_dictionary query service with mock pg.Pool.
 */

import { describe, it, expect, vi } from "vitest";
import { getSuggestions } from "../suggestions";

function mockPool(queryResponses: Record<string, unknown>[][]) {
  let callIndex = 0;
  return {
    query: vi.fn().mockImplementation(() => {
      const rows = queryResponses[callIndex] || [];
      callIndex++;
      return Promise.resolve({ rows });
    }),
  } as unknown as import("pg").Pool;
}

describe("getSuggestions", () => {
  it("returns matching suggestions from suggestion_dictionary", async () => {
    const pool = mockPool([
      [{ suggestion: "meditation", display_text: null, suggestion_type: "topic", weight: 0.5 }],
    ]);

    const results = await getSuggestions(pool, "med");
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      text: "meditation",
      display: null,
      type: "topic",
      weight: 0.5,
    });
  });

  it("uses ILIKE prefix match on suggestion and latin_form", async () => {
    const pool = mockPool([[]]);
    await getSuggestions(pool, "yo", "en");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("ILIKE"),
      ["en", "yo%", 10],
    );
  });

  it("tries trigram similarity for 3+ char prefixes with sparse results", async () => {
    const pool = mockPool([
      [], // No ILIKE matches
      [{ suggestion: "meditation", display_text: null, suggestion_type: "topic", weight: 0.5, sim: 0.25 }],
    ]);

    const results = await getSuggestions(pool, "mdt", "en");
    expect(results).toHaveLength(1);
    expect(results[0].text).toBe("meditation");
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("skips trigram for short prefixes", async () => {
    const pool = mockPool([[]]);
    await getSuggestions(pool, "yo");
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("respects the limit parameter", async () => {
    const pool = mockPool([
      [
        { suggestion: "meditation", display_text: null, suggestion_type: "topic", weight: 0.5 },
        { suggestion: "mental discipline", display_text: null, suggestion_type: "topic", weight: 0.3 },
        { suggestion: "metaphysics", display_text: null, suggestion_type: "topic", weight: 0.2 },
      ],
    ]);

    const results = await getSuggestions(pool, "me", "en", 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("defaults to English language", async () => {
    const pool = mockPool([[]]);
    await getSuggestions(pool, "test");
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["en"]),
    );
  });

  it("excludes suppressed entries (editorial_boost > -1.0)", async () => {
    const pool = mockPool([[]]);
    await getSuggestions(pool, "ch", "en");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("editorial_boost > -1.0"),
      expect.any(Array),
    );
  });

  it("returns display field for Sanskrit terms", async () => {
    const pool = mockPool([
      [{ suggestion: "samadhi", display_text: "Samādhi — superconscious state", suggestion_type: "sanskrit", weight: 0.4 }],
    ]);

    const results = await getSuggestions(pool, "sam");
    expect(results[0].display).toBe("Samādhi — superconscious state");
    expect(results[0].type).toBe("sanskrit");
  });

  it("deduplicates across ILIKE and trigram phases", async () => {
    const pool = mockPool([
      [{ suggestion: "meditation", display_text: null, suggestion_type: "topic", weight: 0.5 }],
      [{ suggestion: "meditation", display_text: null, suggestion_type: "topic", weight: 0.5, sim: 0.3 }],
    ]);

    const results = await getSuggestions(pool, "medit", "en", 10);
    const meditations = results.filter((r) => r.text === "meditation");
    expect(meditations).toHaveLength(1);
  });
});
