// @vitest-environment jsdom

/**
 * KeyboardNav tests — M2b-2 (DES-013).
 *
 * Verifies: paragraph navigation (j/k), chapter navigation (arrows),
 * search shortcut (/), dwell toggle (d), bookmark toggle (b),
 * help overlay (?), form element suppression.
 */

import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `reader.${key}`,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Import after mocks ───────────────────────────────────────────

import { KeyboardNav } from "../KeyboardNav";

// ── Helpers ─────────────────────────────────────────────────────

function setupParagraphs(count: number) {
  document.body.innerHTML = Array.from(
    { length: count },
    (_, i) =>
      `<div data-paragraph="${i}" id="p-${i}">Paragraph ${i}</div>`,
  ).join("");
}

function pressKey(key: string, target?: HTMLElement) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  (target || window).dispatchEvent(event);
}

// ── Setup ─────────────────────────────────────────────────────────

beforeEach(() => {
  mockPush.mockClear();
  document.body.innerHTML = "";
  // Mock scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────

describe("KeyboardNav", () => {
  const defaultProps = {
    bookId: "autobiography",
    prevChapter: 2,
    nextChapter: 4,
    locale: "en",
  };

  it("renders nothing when help is not shown", () => {
    const { container } = render(<KeyboardNav {...defaultProps} />);
    expect(container.innerHTML).toBe("");
  });

  describe("paragraph navigation", () => {
    it("j key focuses the first paragraph", () => {
      setupParagraphs(3);
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("j"));

      const p0 = document.querySelector('[data-paragraph="0"]');
      expect(p0?.classList.contains("kb-focus")).toBe(true);
    });

    it("j then k moves focus back", () => {
      setupParagraphs(3);
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("j")); // focus p0
      act(() => pressKey("j")); // focus p1
      act(() => pressKey("k")); // back to p0

      const p0 = document.querySelector('[data-paragraph="0"]');
      const p1 = document.querySelector('[data-paragraph="1"]');
      expect(p0?.classList.contains("kb-focus")).toBe(true);
      expect(p1?.classList.contains("kb-focus")).toBe(false);
    });

    it("j does not go past the last paragraph", () => {
      setupParagraphs(2);
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("j")); // p0
      act(() => pressKey("j")); // p1
      act(() => pressKey("j")); // still p1

      const p1 = document.querySelector('[data-paragraph="1"]');
      expect(p1?.classList.contains("kb-focus")).toBe(true);
    });
  });

  describe("chapter navigation", () => {
    it("ArrowRight navigates to next chapter", () => {
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("ArrowRight"));

      expect(mockPush).toHaveBeenCalledWith("/books/autobiography/4");
    });

    it("ArrowLeft navigates to previous chapter", () => {
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("ArrowLeft"));

      expect(mockPush).toHaveBeenCalledWith("/books/autobiography/2");
    });

    it("ArrowRight does nothing when no next chapter", () => {
      render(
        <KeyboardNav {...defaultProps} nextChapter={null} />,
      );

      act(() => pressKey("ArrowRight"));

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("search shortcut", () => {
    it("/ navigates to search when no search input exists", () => {
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("/"));

      expect(mockPush).toHaveBeenCalledWith("/search");
    });

    it("/ focuses search input when it exists", () => {
      const input = document.createElement("input");
      input.type = "search";
      document.body.appendChild(input);
      const focusSpy = vi.spyOn(input, "focus");

      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("/"));

      expect(focusSpy).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("dwell shortcut", () => {
    it("d dispatches srf:dwell-toggle when paragraph is focused", () => {
      setupParagraphs(3);
      render(<KeyboardNav {...defaultProps} />);

      const listener = vi.fn();
      window.addEventListener("srf:dwell-toggle", listener);

      // First focus a paragraph
      act(() => pressKey("j"));
      act(() => pressKey("d"));

      expect(listener).toHaveBeenCalledTimes(1);
      const detail = (listener.mock.calls[0][0] as CustomEvent).detail;
      expect(detail).toEqual({ index: 0 });

      window.removeEventListener("srf:dwell-toggle", listener);
    });

    it("d does nothing when no paragraph is focused", () => {
      render(<KeyboardNav {...defaultProps} />);

      const listener = vi.fn();
      window.addEventListener("srf:dwell-toggle", listener);

      act(() => pressKey("d"));

      expect(listener).not.toHaveBeenCalled();

      window.removeEventListener("srf:dwell-toggle", listener);
    });
  });

  describe("bookmark shortcut", () => {
    it("b clicks the bookmark button", () => {
      const btn = document.createElement("button");
      btn.setAttribute("data-testid", "bookmark-button");
      document.body.appendChild(btn);
      const clickSpy = vi.spyOn(btn, "click");

      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("b"));

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("help overlay", () => {
    it("? toggles the keyboard help dialog", () => {
      render(<KeyboardNav {...defaultProps} />);

      // No dialog initially
      expect(screen.queryByRole("dialog")).toBeNull();

      // Press ? to show
      act(() => pressKey("?"));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText("reader.keyboardHelp"),
      ).toBeInTheDocument();
    });

    it("Escape closes the help dialog", () => {
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("?"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      act(() => pressKey("Escape"));
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("clicking the close button closes the dialog", () => {
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("?"));

      const closeBtn = screen.getByText("reader.keyHelp_close");
      fireEvent.click(closeBtn);

      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("clicking the backdrop closes the dialog", () => {
      render(<KeyboardNav {...defaultProps} />);

      act(() => pressKey("?"));

      const dialog = screen.getByRole("dialog");
      fireEvent.click(dialog);

      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("form element suppression", () => {
    it("does not trigger shortcuts when typing in an input", () => {
      render(<KeyboardNav {...defaultProps} />);

      const input = document.createElement("input");
      document.body.appendChild(input);

      const event = new KeyboardEvent("keydown", {
        key: "j",
        bubbles: true,
      });
      Object.defineProperty(event, "target", { value: input });
      window.dispatchEvent(event);

      // No paragraph should be focused
      const focused = document.querySelector("[data-paragraph].kb-focus");
      expect(focused).toBeNull();
    });
  });
});
