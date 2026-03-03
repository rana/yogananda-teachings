// @vitest-environment jsdom

/**
 * ContextualQuiet component tests — M2b-7 (ADR-072, DES-009).
 *
 * Verifies contextual quiet corner: activation when dwell is active,
 * timer flow, Escape exit, bookmark, and completion state.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `reader.${key}`,
}));

const mockAddPassageBookmark = vi.fn();

vi.mock("@/lib/services/bookmarks", () => ({
  addPassageBookmark: (...args: unknown[]) => mockAddPassageBookmark(...args),
}));

// Mock meditative sounds module
vi.mock("@/lib/sounds", () => ({
  singingBowl: vi.fn(),
  templeBell: vi.fn(),
}));

// ── Import after mocks ───────────────────────────────────────────

import { ContextualQuiet } from "../ContextualQuiet";

// ── Helpers ──────────────────────────────────────────────────────

const defaultProps = {
  bookId: "book-123",
  bookTitle: "Autobiography of a Yogi",
  chapterNumber: 1,
  chapterTitle: "My Parents and Early Life",
};

function setupArticleWithDwell() {
  const main = document.createElement("main");
  const article = document.createElement("article");
  for (let i = 0; i < 3; i++) {
    const p = document.createElement("p");
    p.setAttribute("data-paragraph", String(i));
    p.id = `p-${i}`;
    p.textContent = `Paragraph ${i} content for testing`;
    article.appendChild(p);
  }
  main.appendChild(article);
  document.body.appendChild(main);
  return { main, article };
}

function activateDwell(article: HTMLElement, paragraphIndex = 1) {
  article.setAttribute("data-dwell-active", "");
  const para = article.querySelector(`[data-paragraph="${paragraphIndex}"]`);
  if (para) {
    para.setAttribute("data-dwell-target", "");
  }
}

function deactivateDwell(article: HTMLElement) {
  article.removeAttribute("data-dwell-active");
  article.querySelectorAll("[data-dwell-target]").forEach((p) => {
    p.removeAttribute("data-dwell-target");
  });
}

// ── Tests ─────────────────────────────────────────────────────────

describe("ContextualQuiet", () => {
  let main: HTMLElement;
  let article: HTMLElement;

  beforeEach(() => {
    mockAddPassageBookmark.mockReset();
    const dom = setupArticleWithDwell();
    main = dom.main;
    article = dom.article;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders nothing when dwell mode is not active", () => {
    render(<ContextualQuiet {...defaultProps} />);
    expect(screen.queryByTestId("pause-with-this")).toBeNull();
    expect(screen.queryByTestId("contextual-quiet")).toBeNull();
  });

  it("shows 'Pause with this' button when dwell mode is active", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    // MutationObserver fires asynchronously — wait for it
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const btn = screen.getByTestId("pause-with-this");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-label", "reader.pauseWithThis");
  });

  it("enters quiet mode on button click", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const btn = screen.getByTestId("pause-with-this");
    act(() => {
      fireEvent.click(btn);
    });

    expect(main.getAttribute("data-mode")).toBe("quiet");
    expect(screen.getByTestId("contextual-quiet")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows timer options in quiet mode", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    // Three timer buttons should be visible
    expect(screen.getByText("1 min")).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
  });

  it("starts timer on timer option click and shows countdown", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    // Click the 1-minute timer
    act(() => {
      fireEvent.click(screen.getByText("1 min"));
    });

    // Timer should display — starting from 1:00 then ticking to 0:59
    expect(screen.getByRole("timer")).toBeInTheDocument();

    // Advance by 2 seconds
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2100));
    });

    // Should show a countdown (less than 1:00)
    const timerText = screen.getByRole("timer").textContent;
    expect(timerText).toMatch(/0:5[0-9]/);
  });

  it("exits quiet mode on Escape key", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    expect(main.getAttribute("data-mode")).toBe("quiet");

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(main.hasAttribute("data-mode")).toBe(false);
    expect(screen.queryByTestId("contextual-quiet")).toBeNull();
  });

  it("shows completion state with bookmark and return options", async () => {
    vi.useFakeTimers();

    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    // Wait for MutationObserver
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    // Start a 1-minute timer
    act(() => {
      fireEvent.click(screen.getByText("1 min"));
    });

    // Advance through the entire timer (60 seconds + buffer)
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    // Completion state should show bookmark and return buttons
    expect(screen.getByTestId("quiet-complete")).toBeInTheDocument();
    expect(screen.getByTestId("quiet-bookmark")).toBeInTheDocument();
    expect(screen.getByTestId("quiet-return")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("calls addPassageBookmark when bookmark button clicked", async () => {
    vi.useFakeTimers();

    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article, 1);
    });

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    // Start timer
    act(() => {
      fireEvent.click(screen.getByText("1 min"));
    });

    // Complete timer
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    // Click bookmark
    act(() => {
      fireEvent.click(screen.getByTestId("quiet-bookmark"));
    });

    expect(mockAddPassageBookmark).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: "book-123",
        bookTitle: "Autobiography of a Yogi",
        chapterNumber: 1,
        chapterTitle: "My Parents and Early Life",
      }),
    );

    vi.useRealTimers();
  });

  it("returns to reading when return button is clicked after completion", async () => {
    vi.useFakeTimers();

    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    act(() => {
      fireEvent.click(screen.getByText("1 min"));
    });

    act(() => {
      vi.advanceTimersByTime(61000);
    });

    // Click return to reading
    act(() => {
      fireEvent.click(screen.getByTestId("quiet-return"));
    });

    expect(main.hasAttribute("data-mode")).toBe(false);
    expect(screen.queryByTestId("contextual-quiet")).toBeNull();

    vi.useRealTimers();
  });

  it("has role=dialog on the quiet mode overlay", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => {
      fireEvent.click(screen.getByTestId("pause-with-this"));
    });

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-label", "reader.pauseWithThis");
  });

  it("has 44x44px minimum touch targets on all interactive buttons", async () => {
    render(<ContextualQuiet {...defaultProps} />);

    act(() => {
      activateDwell(article);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // "Pause with this" button
    const pauseBtn = screen.getByTestId("pause-with-this");
    expect(pauseBtn.className).toContain("min-h-[44px]");
    expect(pauseBtn.className).toContain("min-w-[44px]");

    // Enter quiet mode to check timer buttons
    act(() => {
      fireEvent.click(pauseBtn);
    });

    const timerButtons = screen.getAllByRole("button");
    timerButtons.forEach((btn) => {
      expect(btn.className).toContain("min-h-[44px]");
      expect(btn.className).toContain("min-w-[44px]");
    });
  });
});
