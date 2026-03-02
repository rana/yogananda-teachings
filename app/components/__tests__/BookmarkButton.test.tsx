// @vitest-environment jsdom

/**
 * BookmarkButton component tests — M2b-3 (ADR-066).
 *
 * Verifies rendering, toggle behavior, accessibility attributes,
 * and touch target sizing.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockToggleChapterBookmark = vi.fn();
const mockIsChapterBookmarked = vi.fn();
const mockSubscribe = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

vi.mock("@/lib/services/bookmarks", () => ({
  isChapterBookmarked: (...args: unknown[]) =>
    mockIsChapterBookmarked(...args),
  toggleChapterBookmark: (...args: unknown[]) =>
    mockToggleChapterBookmark(...args),
  subscribe: (listener: () => void) => mockSubscribe(listener),
}));

// ── Import after mocks ───────────────────────────────────────────

import { BookmarkButton } from "../BookmarkButton";

// ── Helpers ──────────────────────────────────────────────────────

const defaultProps = {
  bookId: "book-001",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterNumber: 12,
  chapterTitle: "Years in My Master's Hermitage",
};

// ── Tests ─────────────────────────────────────────────────────────

describe("BookmarkButton", () => {
  beforeEach(() => {
    mockIsChapterBookmarked.mockReset();
    mockToggleChapterBookmark.mockReset();
    mockSubscribe.mockReset();
    mockIsChapterBookmarked.mockReturnValue(false);
    mockToggleChapterBookmark.mockReturnValue(true);
    mockSubscribe.mockReturnValue(vi.fn()); // return unsubscribe fn
  });

  it("renders a button", () => {
    render(<BookmarkButton {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows 'bookmark chapter' label when not bookmarked", () => {
    mockIsChapterBookmarked.mockReturnValue(false);
    render(<BookmarkButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "bookmarks.bookmarkChapter",
    );
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("shows 'remove bookmark' label when bookmarked", () => {
    mockIsChapterBookmarked.mockReturnValue(true);
    render(<BookmarkButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "bookmarks.removeChapterBookmark",
    );
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls toggleChapterBookmark on click", () => {
    render(<BookmarkButton {...defaultProps} />);

    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(mockToggleChapterBookmark).toHaveBeenCalledWith({
      bookId: "book-001",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 12,
      chapterTitle: "Years in My Master's Hermitage",
    });
  });

  it("checks initial bookmark state with correct args", () => {
    render(<BookmarkButton {...defaultProps} />);

    expect(mockIsChapterBookmarked).toHaveBeenCalledWith("book-001", 12);
  });

  it("subscribes to bookmark changes on mount", () => {
    render(<BookmarkButton {...defaultProps} />);
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(typeof mockSubscribe.mock.calls[0][0]).toBe("function");
  });

  it("has minimum 44x44px touch target via min-h and min-w classes", () => {
    render(<BookmarkButton {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("min-h-[44px]");
    expect(button.className).toContain("min-w-[44px]");
  });

  it("contains an SVG lotus icon", () => {
    render(<BookmarkButton {...defaultProps} />);
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
