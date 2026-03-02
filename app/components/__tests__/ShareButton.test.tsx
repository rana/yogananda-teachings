// @vitest-environment jsdom

/**
 * ShareButton component tests — M2a-6 (DES-006).
 *
 * Verifies Web Share API usage, clipboard fallback,
 * "copied" state, and citation formatting (PRI-02).
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

// ── Import after mocks ───────────────────────────────────────────

import { ShareButton } from "../ShareButton";

// ── Helpers ──────────────────────────────────────────────────────

const citationProps = {
  passage: "The season of failure is the best time for sowing the seeds of success.",
  citation: {
    author: "Paramahansa Yogananda",
    book: "Autobiography of a Yogi",
    chapter: "Years in My Master's Hermitage",
    chapterNumber: 12,
    page: 142,
  },
};

const simpleProps = {
  url: "https://example.com/passage/123",
  text: "A wonderful quote",
  title: "Passage Title",
};

// ── Tests ─────────────────────────────────────────────────────────

describe("ShareButton", () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Remove navigator.share by default — tests that need it will set it up
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "share", {
      value: originalNavigator.share,
      writable: true,
      configurable: true,
    });
  });

  it("renders a button with share label", () => {
    render(<ShareButton {...citationProps} />);
    const button = screen.getByRole("button", { name: "share.button" });
    expect(button).toBeInTheDocument();
  });

  it("calls navigator.share when available (with citation props)", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...citationProps} />);
    const button = screen.getByRole("button", { name: "share.button" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockShare).toHaveBeenCalledTimes(1);
    const shareArg = mockShare.mock.calls[0][0];
    expect(shareArg.title).toBe("Autobiography of a Yogi — Years in My Master's Hermitage");
    expect(shareArg.text).toContain("Paramahansa Yogananda");
    expect(shareArg.text).toContain(citationProps.passage);
    expect(shareArg.text).toContain("p. 142");
  });

  it("falls back to clipboard.writeText when share unavailable", async () => {
    render(<ShareButton {...citationProps} />);
    const button = screen.getByRole("button", { name: "share.button" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    const clipboardText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(clipboardText).toContain(citationProps.passage);
    expect(clipboardText).toContain("Paramahansa Yogananda");
  });

  it("shows 'copied' state after clipboard copy", async () => {
    vi.useFakeTimers();

    render(<ShareButton {...citationProps} />);
    const button = screen.getByRole("button", { name: "share.button" });

    // Initially shows share label
    expect(button.textContent).toContain("share.button");

    await act(async () => {
      fireEvent.click(button);
    });

    // Shows copied state
    expect(button.textContent).toContain("share.copied");

    // Returns to normal after timeout
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button.textContent).toContain("share.button");

    vi.useRealTimers();
  });

  it("formats citation text correctly (author, book, chapter, page)", async () => {
    render(<ShareButton {...citationProps} />);
    const button = screen.getByRole("button", { name: "share.button" });

    await act(async () => {
      fireEvent.click(button);
    });

    const clipboardText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0];
    // Citation format: "passage"\n\n— author, book, Ch. N: chapter, p. page
    expect(clipboardText).toContain(`"${citationProps.passage}"`);
    expect(clipboardText).toContain("— Paramahansa Yogananda");
    expect(clipboardText).toContain("Autobiography of a Yogi");
    expect(clipboardText).toContain("Ch. 12: Years in My Master's Hermitage");
    expect(clipboardText).toContain("p. 142");
  });

  it("uses simple text/title/url when no citation provided", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...simpleProps} />);
    const button = screen.getByRole("button", { name: "share.button" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockShare).toHaveBeenCalledWith({
      title: "Passage Title",
      text: "A wonderful quote",
      url: "https://example.com/passage/123",
    });
  });
});
