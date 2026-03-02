// @vitest-environment jsdom

/**
 * TodaysWisdom component tests — M2a-1.
 *
 * Verifies passage rendering, null state, attribution (PRI-02),
 * "Show me another" fetch behavior, loading state, and error resilience.
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
  useLocale: () => "en",
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

// ── Import after mocks ───────────────────────────────────────────

import { TodaysWisdom } from "../TodaysWisdom";
import type { DailyPassage } from "@/lib/services/passages";

// ── Helpers ──────────────────────────────────────────────────────

const samplePassage: DailyPassage = {
  id: "passage-001",
  content: "The season of failure is the best time for sowing the seeds of success.",
  bookId: "autobiography-of-a-yogi",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterTitle: "Years in My Master's Hermitage",
  chapterNumber: 12,
  pageNumber: 142,
  language: "en",
};

const fetchedResponse = {
  data: {
    id: "passage-002",
    content: "Live quietly in the moment and see the beauty of all before you.",
    citation: {
      bookId: "autobiography-of-a-yogi",
      book: "Autobiography of a Yogi",
      author: "Paramahansa Yogananda",
      chapter: "The Tiger Swami",
      chapterNumber: 7,
      page: 68,
    },
    language: "en",
  },
};

// ── Tests ─────────────────────────────────────────────────────────

describe("TodaysWisdom", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders passage content in a blockquote", () => {
    render(<TodaysWisdom passage={samplePassage} />);
    const blockquote = screen.getByRole("blockquote");
    expect(blockquote.textContent).toContain(samplePassage.content);
  });

  it("shows null state when no passage provided", () => {
    render(<TodaysWisdom passage={null} />);
    expect(screen.getByText("No passages available yet.")).toBeInTheDocument();
    expect(screen.queryByRole("blockquote")).toBeNull();
  });

  it("shows attribution with author, book title, and page number", () => {
    render(<TodaysWisdom passage={samplePassage} />);
    const footer = document.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toContain("Paramahansa Yogananda");
    expect(footer!.textContent).toContain("Autobiography of a Yogi");
    expect(footer!.textContent).toContain("p. 142");
  });

  it("'Show me another' button calls fetch API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fetchedResponse),
    });
    global.fetch = mockFetch;

    render(<TodaysWisdom passage={samplePassage} />);
    const button = screen.getByRole("button", { name: "home.showAnother" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/passages/random");
  });

  it("updates passage on successful fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fetchedResponse),
    });
    global.fetch = mockFetch;

    render(<TodaysWisdom passage={samplePassage} />);
    const button = screen.getByRole("button", { name: "home.showAnother" });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      const blockquote = screen.getByRole("blockquote");
      expect(blockquote.textContent).toContain(fetchedResponse.data.content);
    });
  });

  it("keeps current passage on fetch error", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    global.fetch = mockFetch;

    render(<TodaysWisdom passage={samplePassage} />);
    const button = screen.getByRole("button", { name: "home.showAnother" });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      const blockquote = screen.getByRole("blockquote");
      expect(blockquote.textContent).toContain(samplePassage.content);
    });
  });

  it("button shows loading state during fetch", async () => {
    let resolvePromise: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockFetch = vi.fn().mockReturnValue(fetchPromise);
    global.fetch = mockFetch;

    render(<TodaysWisdom passage={samplePassage} />);
    const button = screen.getByRole("button", { name: "home.showAnother" });

    act(() => {
      fireEvent.click(button);
    });

    // Button should show loading text and be disabled
    await waitFor(() => {
      expect(button.textContent).toBe("...");
      expect(button).toBeDisabled();
    });

    // Resolve the fetch to clean up
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve(fetchedResponse),
      });
    });

    // Button should return to normal
    await waitFor(() => {
      expect(button.textContent).toBe("home.showAnother");
      expect(button).not.toBeDisabled();
    });
  });
});
