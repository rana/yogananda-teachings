/**
 * Tests for ThreadReturnBar — golden thread return breadcrumb.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock thread-memory
const mockPeek = vi.fn();
const mockPop = vi.fn();
const mockGetDepth = vi.fn();

vi.mock("@/lib/thread-memory", () => ({
  peekThreadPosition: () => mockPeek(),
  popThreadPosition: () => mockPop(),
  getThreadDepth: () => mockGetDepth(),
}));

import { ThreadReturnBar } from "../ThreadReturnBar";

describe("ThreadReturnBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when thread stack is empty", () => {
    mockPeek.mockReturnValue(null);
    mockGetDepth.mockReturnValue(0);
    const { container } = render(<ThreadReturnBar locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders return link when stack has a position", () => {
    mockPeek.mockReturnValue({
      bookSlug: "auto-yogi",
      chapterNumber: 14,
      chunkId: "chunk-42",
      chapterTitle: "An Experience in Cosmic Consciousness",
    });
    mockGetDepth.mockReturnValue(1);
    render(<ThreadReturnBar locale="en" />);
    expect(
      screen.getByText(/Return to Ch\. 14: An Experience in Cosmic Consciousness/),
    ).toBeInTheDocument();
  });

  it("navigates with passage hash on click", () => {
    mockPeek.mockReturnValue({
      bookSlug: "auto-yogi",
      chapterNumber: 14,
      chunkId: "chunk-42",
      chapterTitle: "Test Chapter",
    });
    mockGetDepth.mockReturnValue(1);
    mockPop.mockReturnValue({
      bookSlug: "auto-yogi",
      chapterNumber: 14,
      chunkId: "chunk-42",
      chapterTitle: "Test Chapter",
    });
    render(<ThreadReturnBar locale="en" />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockPop).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith(
      "/en/books/auto-yogi/14#passage-chunk-42",
    );
  });

  it("renders depth dots capped at 5", () => {
    mockPeek.mockReturnValue({
      bookSlug: "b",
      chapterNumber: 1,
      chunkId: "c",
      chapterTitle: "T",
    });
    mockGetDepth.mockReturnValue(8);
    const { container } = render(<ThreadReturnBar locale="es" />);
    // Should render exactly 5 dots (capped), not 8
    const dots = container.querySelectorAll(".rounded-full.bg-srf-gold\\/40");
    expect(dots).toHaveLength(5);
  });

  it("includes data-no-focus and data-no-present for reader modes", () => {
    mockPeek.mockReturnValue({
      bookSlug: "b",
      chapterNumber: 1,
      chunkId: "c",
      chapterTitle: "T",
    });
    mockGetDepth.mockReturnValue(1);
    const { container } = render(<ThreadReturnBar locale="en" />);
    const bar = container.firstElementChild!;
    expect(bar.hasAttribute("data-no-focus")).toBe(true);
    expect(bar.hasAttribute("data-no-present")).toBe(true);
  });

  it("does nothing when pop returns null", () => {
    mockPeek.mockReturnValue({
      bookSlug: "b",
      chapterNumber: 1,
      chunkId: "c",
      chapterTitle: "T",
    });
    mockGetDepth.mockReturnValue(1);
    mockPop.mockReturnValue(null);
    render(<ThreadReturnBar locale="en" />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
