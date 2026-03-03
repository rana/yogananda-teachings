/**
 * Tests for ReadingJourney component — invisible side-effect component.
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ReadingJourney } from "../ReadingJourney";

const mockSetLastRead = vi.fn();
const mockMarkChapterVisited = vi.fn();

vi.mock("@/lib/reading-journey", () => ({
  setLastRead: (...args: unknown[]) => mockSetLastRead(...args),
}));

vi.mock("@/lib/visited-chapters", () => ({
  markChapterVisited: (...args: unknown[]) => mockMarkChapterVisited(...args),
}));

const props = {
  bookSlug: "autobiography-en",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterNumber: 14,
  chapterTitle: "An Experience in Cosmic Consciousness",
};

describe("ReadingJourney", () => {
  it("renders nothing (no UI)", () => {
    const { container } = render(<ReadingJourney {...props} />);
    expect(container.innerHTML).toBe("");
  });

  it("calls setLastRead on mount", () => {
    render(<ReadingJourney {...props} />);
    expect(mockSetLastRead).toHaveBeenCalledWith({
      bookSlug: "autobiography-en",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 14,
      chapterTitle: "An Experience in Cosmic Consciousness",
    });
  });

  it("calls markChapterVisited on mount", () => {
    render(<ReadingJourney {...props} />);
    expect(mockMarkChapterVisited).toHaveBeenCalledWith(
      "autobiography-en",
      14,
    );
  });

  it("re-records when chapter changes", () => {
    const { rerender } = render(<ReadingJourney {...props} />);
    mockSetLastRead.mockClear();
    mockMarkChapterVisited.mockClear();

    rerender(<ReadingJourney {...props} chapterNumber={15} chapterTitle="The Cauliflower Robbery" />);
    expect(mockSetLastRead).toHaveBeenCalledWith(
      expect.objectContaining({ chapterNumber: 15 }),
    );
    expect(mockMarkChapterVisited).toHaveBeenCalledWith(
      "autobiography-en",
      15,
    );
  });
});
