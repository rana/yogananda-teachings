// @vitest-environment jsdom

/**
 * QuietCornerClient component tests — M2a-3, M2a-14 (ADR-072).
 *
 * Verifies passage display, timer lifecycle (start, countdown, completion),
 * data-mode attribute, audio mock, fetch-another flow, and null state.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `quiet.${key}`,
}));

vi.mock("@/i18n/navigation", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ href, children, ...props }: Record<string, any>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock AudioContext for playTone
vi.stubGlobal(
  "AudioContext",
  vi.fn(() => ({
    createOscillator: () => ({
      type: "sine",
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    }),
    createGain: () => ({
      gain: { value: 0, setTargetAtTime: vi.fn() },
      connect: vi.fn(),
    }),
    destination: {},
    currentTime: 0,
    close: vi.fn(),
  })),
);

// ── Import after mocks ───────────────────────────────────────────

import { QuietCornerClient } from "../QuietCornerClient";
import type { DailyPassage } from "@/lib/services/passages";

// ── Helpers ──────────────────────────────────────────────────────

const samplePassage: DailyPassage = {
  id: "chunk-001",
  content: "Live quietly in the moment and see the beauty of all before you.",
  bookId: "autobiography-en",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterTitle: "My Parents and Early Life",
  chapterNumber: 1,
  pageNumber: 42,
  language: "en",
};

const passageWithoutPage: DailyPassage = {
  ...samplePassage,
  pageNumber: null,
};

// ── Tests ─────────────────────────────────────────────────────────

describe("QuietCornerClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── Passage rendering ──────────────────────────────────────────

  it("renders passage content in blockquote", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    const blockquote = screen.getByRole("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote.textContent).toContain(samplePassage.content.trim());
  });

  it("shows null state when no passage is provided", () => {
    render(<QuietCornerClient passage={null} />);

    expect(screen.getByText("No reflections available yet.")).toBeInTheDocument();
    // Timer buttons should not be present
    expect(screen.queryByText("quiet.timer1")).toBeNull();
  });

  it("shows attribution with author, book title, and page number", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    expect(screen.getByText(/Paramahansa Yogananda/)).toBeInTheDocument();
    expect(screen.getByText(/Autobiography of a Yogi/)).toBeInTheDocument();
    expect(screen.getByText(/p\. 42/)).toBeInTheDocument();
  });

  it("omits page number from attribution when pageNumber is null", () => {
    render(<QuietCornerClient passage={passageWithoutPage} />);

    expect(screen.getByText(/Paramahansa Yogananda/)).toBeInTheDocument();
    expect(screen.queryByText(/p\./)).toBeNull();
  });

  // ── Timer options ──────────────────────────────────────────────

  it("shows 3 timer option buttons", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    expect(screen.getByText("quiet.timer1")).toBeInTheDocument();
    expect(screen.getByText("quiet.timer5")).toBeInTheDocument();
    expect(screen.getByText("quiet.timer15")).toBeInTheDocument();
  });

  // ── Timer lifecycle ────────────────────────────────────────────

  it("starting timer shows countdown display", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    const timer = screen.getByRole("timer");
    expect(timer).toBeInTheDocument();
    expect(timer.textContent).toContain("1:00");
  });

  it("timer countdown decrements each second", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    // Advance 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("0:57");
  });

  it("timer completion shows completion state", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    // Advance through the full 60-second timer
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    // Timer should be gone, completion state visible
    expect(screen.queryByRole("timer")).toBeNull();
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(screen.getByText("quiet.timerComplete")).toBeInTheDocument();
    expect(screen.getByText("quiet.showAnother")).toBeInTheDocument();
    expect(screen.getByText("quiet.backToPortal")).toBeInTheDocument();
  });

  // ── data-mode attribute ────────────────────────────────────────

  it("sets data-mode='quiet' on main when timer is active", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer5"));
    });

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("data-mode", "quiet");
  });

  it("removes data-mode when timer completes", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    expect(screen.getByRole("main")).toHaveAttribute("data-mode", "quiet");

    // Complete the timer
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(screen.getByRole("main")).not.toHaveAttribute("data-mode");
  });

  // ── "Show another" fetch ───────────────────────────────────────

  it("'Show another' button fetches a new passage", async () => {
    const newPassage = {
      data: {
        id: "chunk-002",
        content: "The season of failure is the best time for sowing the seeds of success.",
        citation: {
          bookId: "autobiography-en",
          book: "Autobiography of a Yogi",
          author: "Paramahansa Yogananda",
          chapter: "Years in My Master's Hermitage",
          chapterNumber: 12,
          page: 130,
        },
        language: "en",
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(newPassage),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<QuietCornerClient passage={samplePassage} />);

    // Start and complete a timer to reach completion state
    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    act(() => {
      vi.advanceTimersByTime(61000);
    });

    // Click "Show another"
    await act(async () => {
      fireEvent.click(screen.getByText("quiet.showAnother"));
      // Flush microtasks for the fetch promise chain
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/passages/reflection");

    // New passage content should be displayed
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "BLOCKQUOTE" &&
          (el.textContent ?? "").includes("The season of failure"),
      ),
    ).toBeInTheDocument();
  });

  // ── "Show another" in initial state ────────────────────────────

  it("'Show another' button works from the initial (non-timer) state", async () => {
    const newPassage = {
      data: {
        id: "chunk-003",
        content: "You must not let your life run in the ordinary way.",
        citation: {
          bookId: "autobiography-en",
          book: "Autobiography of a Yogi",
          author: "Paramahansa Yogananda",
          chapter: "The Tiger Swami",
          chapterNumber: 5,
          page: 55,
        },
        language: "en",
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(newPassage),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<QuietCornerClient passage={samplePassage} />);

    // The "Show another" button in the initial state (below timer options)
    await act(async () => {
      fireEvent.click(screen.getByText("quiet.showAnother"));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/passages/reflection");
  });

  // ── formatTime ─────────────────────────────────────────────────

  it("formats time correctly for 5 minutes (5:00)", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer5"));
    });

    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("5:00");
  });

  it("formats time correctly for sub-minute values (0:59)", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("0:59");
  });

  it("formats time with zero-padded seconds (e.g., 4:05)", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer5"));
    });

    // Advance 55 seconds: 300 - 55 = 245 seconds = 4:05
    act(() => {
      vi.advanceTimersByTime(55000);
    });

    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("4:05");
  });

  // ── Heading visibility ─────────────────────────────────────────

  it("hides heading when timer is active", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    // Heading visible before timer
    expect(screen.getByText("quiet.heading")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    // Heading hidden during timer
    expect(screen.queryByText("quiet.heading")).toBeNull();
  });

  // ── Audio ──────────────────────────────────────────────────────

  it("creates AudioContext when timer starts (singing bowl)", () => {
    render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    expect(AudioContext).toHaveBeenCalled();
  });

  // ── Cleanup ────────────────────────────────────────────────────

  it("clears interval on unmount", () => {
    const { unmount } = render(<QuietCornerClient passage={samplePassage} />);

    act(() => {
      fireEvent.click(screen.getByText("quiet.timer1"));
    });

    // Should not throw or leak timers
    unmount();

    // Advancing timers after unmount should not cause errors
    act(() => {
      vi.advanceTimersByTime(5000);
    });
  });
});
