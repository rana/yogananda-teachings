// @vitest-environment jsdom

/**
 * PartingWord component tests — M2b-9 (DES-014).
 *
 * Verifies:
 * - Passage rendering with text and attribution
 * - Different dates produce different passages
 * - Same date produces deterministic output (SSR-safe)
 * - All passages have required fields
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() =>
    Promise.resolve((key: string) => `partingWord.${key}`),
  ),
}));

// ── Import after mocks ───────────────────────────────────────────

import {
  PartingWord,
  PARTING_WORDS,
  getPartingWordIndex,
} from "../PartingWord";

// ── Pure function tests ──────────────────────────────────────────

describe("getPartingWordIndex", () => {
  it("returns an index within the PARTING_WORDS range", () => {
    const index = getPartingWordIndex("2026-03-02");
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(PARTING_WORDS.length);
  });

  it("is deterministic — same date always returns same index", () => {
    const date = "2026-06-15";
    const first = getPartingWordIndex(date);
    const second = getPartingWordIndex(date);
    const third = getPartingWordIndex(date);
    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it("different dates produce different indices", () => {
    // Test across a range of dates — at least some must differ
    const indices = new Set<number>();
    for (let day = 1; day <= 30; day++) {
      const dateStr = `2026-03-${String(day).padStart(2, "0")}`;
      indices.add(getPartingWordIndex(dateStr));
    }
    // With 16 passages and 30 dates, we expect multiple distinct indices
    expect(indices.size).toBeGreaterThan(1);
  });
});

// ── Passage pool validation ──────────────────────────────────────

describe("PARTING_WORDS pool", () => {
  it("contains at least 15 passages", () => {
    expect(PARTING_WORDS.length).toBeGreaterThanOrEqual(15);
  });

  it("every passage has text, author, and source", () => {
    for (const passage of PARTING_WORDS) {
      expect(passage.text).toBeTruthy();
      expect(passage.author).toBeTruthy();
      expect(passage.source).toBeTruthy();
    }
  });

  it("every passage is attributed to Paramahansa Yogananda", () => {
    for (const passage of PARTING_WORDS) {
      expect(passage.author).toBe("Paramahansa Yogananda");
    }
  });

  it("every passage cites Autobiography of a Yogi", () => {
    for (const passage of PARTING_WORDS) {
      expect(passage.source).toBe("Autobiography of a Yogi");
    }
  });
});

// ── Component rendering tests ────────────────────────────────────

describe("PartingWord component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-02T12:00:00Z"));
  });

  it("renders a passage with text and attribution", async () => {
    const Component = await PartingWord({ locale: "en" });
    render(Component);

    // Should render the label
    expect(screen.getByText("partingWord.label")).toBeInTheDocument();

    // Should render attribution with author name
    expect(
      screen.getByText(/Paramahansa Yogananda/),
    ).toBeInTheDocument();

    // Should render the source in a <cite> element
    const cite = screen.getByText("Autobiography of a Yogi");
    expect(cite.tagName).toBe("CITE");
  });

  it("renders within an aside element with aria-label", async () => {
    const Component = await PartingWord({ locale: "en" });
    const { container } = render(Component);

    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.getAttribute("aria-label")).toBe("partingWord.label");
  });

  it("renders passage text in a blockquote", async () => {
    const Component = await PartingWord({ locale: "en" });
    const { container } = render(Component);

    const blockquote = container.querySelector("blockquote");
    expect(blockquote).not.toBeNull();
  });

  it("output is deterministic for the same date", async () => {
    const Component1 = await PartingWord({ locale: "en" });
    const { container: c1 } = render(Component1);
    const text1 = c1.querySelector("blockquote")?.textContent;

    const Component2 = await PartingWord({ locale: "en" });
    const { container: c2 } = render(Component2);
    const text2 = c2.querySelector("blockquote")?.textContent;

    expect(text1).toBe(text2);
  });

  it("is marked data-no-print for print stylesheet exclusion", async () => {
    const Component = await PartingWord({ locale: "en" });
    const { container } = render(Component);

    const aside = container.querySelector("aside");
    expect(aside!.hasAttribute("data-no-print")).toBe(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
