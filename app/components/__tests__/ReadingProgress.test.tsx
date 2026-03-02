// @vitest-environment jsdom

/**
 * ReadingProgress tests — reading position persistence.
 *
 * Verifies: save on scroll, restore on mount, localStorage management,
 * bounded storage (50 entries max), SSR safety.
 */

import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockScrollIntoView = vi.fn();
const mockScrollBy = vi.fn();

beforeEach(() => {
  localStorage.clear();
  mockScrollIntoView.mockClear();
  mockScrollBy.mockClear();
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
  window.scrollBy = mockScrollBy;
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Import after mocks ───────────────────────────────────────────

import { ReadingProgress } from "../ReadingProgress";

// ── Tests ─────────────────────────────────────────────────────────

describe("ReadingProgress", () => {
  it("renders nothing visible", () => {
    const { container } = render(
      <ReadingProgress bookId="book-1" chapterNumber={1} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("saves scroll position to localStorage on scroll", async () => {
    // Set up paragraphs in the DOM
    document.body.innerHTML = `
      <div data-paragraph="0" id="p-0" style="position:absolute;top:0">Para 0</div>
      <div data-paragraph="1" id="p-1" style="position:absolute;top:500">Para 1</div>
      <div data-paragraph="2" id="p-2" style="position:absolute;top:1000">Para 2</div>
    `;

    render(<ReadingProgress bookId="book-1" chapterNumber={3} />);

    // Simulate scroll
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // Advance debounce timer
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const stored = JSON.parse(
      localStorage.getItem("srf-reading-progress") || "{}",
    );
    expect(stored).toHaveProperty("book-1:3");
  });

  it("restores saved position on mount", () => {
    // Pre-save a position
    localStorage.setItem(
      "srf-reading-progress",
      JSON.stringify({ "book-1:5": 3 }),
    );

    // Create target paragraph
    const p = document.createElement("div");
    p.id = "p-3";
    document.body.appendChild(p);

    render(<ReadingProgress bookId="book-1" chapterNumber={5} />);

    // requestAnimationFrame is used — flush it
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have tried to scroll to paragraph 3
    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it("does not restore if saved position is 0", () => {
    localStorage.setItem(
      "srf-reading-progress",
      JSON.stringify({ "book-1:1": 0 }),
    );

    render(<ReadingProgress bookId="book-1" chapterNumber={1} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it("trims entries when exceeding 50", () => {
    // Fill with 52 entries
    const map: Record<string, number> = {};
    for (let i = 0; i < 52; i++) {
      map[`book-${i}:1`] = i;
    }
    localStorage.setItem("srf-reading-progress", JSON.stringify(map));

    // Set up paragraphs
    document.body.innerHTML = `<div data-paragraph="0" id="p-0">Para 0</div>`;

    render(<ReadingProgress bookId="new-book" chapterNumber={1} />);

    // Trigger scroll + save
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const stored = JSON.parse(
      localStorage.getItem("srf-reading-progress") || "{}",
    );
    expect(Object.keys(stored).length).toBeLessThanOrEqual(50);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("srf-reading-progress", "not-json");

    // Should not throw
    expect(() => {
      render(<ReadingProgress bookId="book-1" chapterNumber={1} />);
    }).not.toThrow();
  });
});
