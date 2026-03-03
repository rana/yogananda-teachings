/**
 * Tests for NewBookBadge, NewBooksIndicator, and MarkBooksSeen components.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { NewBookBadge } from "../NewBookBadge";
import { NewBooksIndicator } from "../NewBooksIndicator";
import { MarkBooksSeen } from "../MarkBooksSeen";

// Mock new-books module
const mockGetNewBookIds = vi.fn();
const mockHasUnseenBooks = vi.fn();
const mockInitBooksTracker = vi.fn();
const mockMarkBooksSeen = vi.fn();

vi.mock("@/lib/new-books", () => ({
  getNewBookIds: (...args: unknown[]) => mockGetNewBookIds(...args),
  hasUnseenBooks: () => mockHasUnseenBooks(),
  initBooksTracker: () => mockInitBooksTracker(),
  markBooksSeen: (...args: unknown[]) => mockMarkBooksSeen(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetNewBookIds.mockReturnValue(new Set());
  mockHasUnseenBooks.mockReturnValue(false);
});

describe("NewBookBadge", () => {
  it("renders nothing when book is not new", () => {
    mockGetNewBookIds.mockReturnValue(new Set());
    const { container } = render(
      <NewBookBadge bookId="book-1" allBookIds={["book-1", "book-2"]} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders 'New' badge when book is new", () => {
    mockGetNewBookIds.mockReturnValue(new Set(["book-1"]));
    render(
      <NewBookBadge bookId="book-1" allBookIds={["book-1", "book-2"]} />,
    );
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("does not show badge for non-new books even when others are new", () => {
    mockGetNewBookIds.mockReturnValue(new Set(["book-2"]));
    const { container } = render(
      <NewBookBadge bookId="book-1" allBookIds={["book-1", "book-2"]} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("passes allBookIds to getNewBookIds", () => {
    const ids = ["book-1", "book-2", "book-3"];
    render(<NewBookBadge bookId="book-1" allBookIds={ids} />);
    expect(mockGetNewBookIds).toHaveBeenCalledWith(ids);
  });
});

describe("NewBooksIndicator", () => {
  it("renders nothing when no unseen books", () => {
    mockHasUnseenBooks.mockReturnValue(false);
    const { container } = render(<NewBooksIndicator />);
    expect(container.innerHTML).toBe("");
  });

  it("renders gold dot when unseen books exist", () => {
    mockHasUnseenBooks.mockReturnValue(true);
    const { container } = render(<NewBooksIndicator />);
    const dot = container.querySelector("span");
    expect(dot).toBeTruthy();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("initializes the books tracker on mount", () => {
    render(<NewBooksIndicator />);
    expect(mockInitBooksTracker).toHaveBeenCalled();
  });
});

describe("MarkBooksSeen", () => {
  it("renders nothing (no UI)", () => {
    const { container } = render(
      <MarkBooksSeen bookIds={["book-1", "book-2"]} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("calls markBooksSeen after delay", async () => {
    vi.useFakeTimers();
    render(<MarkBooksSeen bookIds={["book-1", "book-2"]} />);
    expect(mockMarkBooksSeen).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(mockMarkBooksSeen).toHaveBeenCalledWith(["book-1", "book-2"]);
    vi.useRealTimers();
  });

  it("cleans up timer on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <MarkBooksSeen bookIds={["book-1"]} />,
    );
    unmount();

    vi.advanceTimersByTime(200);
    expect(mockMarkBooksSeen).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
