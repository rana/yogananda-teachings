// @vitest-environment jsdom

/**
 * DwellMode component tests — M2b-1 (DES-009).
 *
 * Verifies dwell activation/deactivation, Escape exit,
 * data attribute management, and screen reader announcements.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `reader.${key}`,
}));

// ── Import after mocks ───────────────────────────────────────────

import { DwellMode } from "../DwellMode";

// ── Helpers ──────────────────────────────────────────────────────

function setupArticle(paragraphCount = 3) {
  const article = document.createElement("article");
  for (let i = 0; i < paragraphCount; i++) {
    const p = document.createElement("p");
    p.setAttribute("data-paragraph", String(i));
    p.textContent = `Paragraph ${i}`;
    article.appendChild(p);
  }
  document.body.appendChild(article);
  return article;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("DwellMode", () => {
  let article: HTMLElement;

  beforeEach(() => {
    article = setupArticle(3);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the screen reader announcer", () => {
    render(<DwellMode />);
    const announcer = screen.getByTestId("dwell-announcer");
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute("aria-live", "polite");
  });

  it("activates dwell on mobile long-press (touchstart + wait)", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='1']")!;

    // Simulate touch start
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    // Wait for long-press threshold (500ms)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);
    const targetPara = article.querySelector("[data-dwell-target]");
    expect(targetPara).not.toBeNull();
    expect(targetPara?.getAttribute("data-paragraph")).toBe("1");
  });

  it("does not activate if touch is released before threshold", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='0']")!;

    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    // Release before 500ms
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    act(() => {
      fireEvent.touchEnd(para);
    });

    // Wait a bit more to confirm it didn't activate
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
  });

  it("does not activate if touch moves", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='0']")!;

    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    // Move before threshold
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    act(() => {
      fireEvent.touchMove(para, {
        touches: [{ clientX: 10, clientY: 10 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
  });

  it("exits dwell mode on click/tap of the target paragraph", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='1']")!;

    // Activate via long-press
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);

    // Wait for the click exit handler to register (100ms delay)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    // Click the target paragraph itself
    act(() => {
      fireEvent.click(para);
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
    expect(article.querySelector("[data-dwell-target]")).toBeNull();
  });

  it("exits dwell mode on click of a button inside a paragraph", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='0']")!;

    // Add a button inside the paragraph (like SharePassage does)
    const btn = document.createElement("button");
    btn.textContent = "Share";
    para.appendChild(btn);

    // Activate via long-press
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);

    // Wait for the click exit handler to register
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    // Click the button inside the paragraph — should still exit dwell
    act(() => {
      fireEvent.click(btn);
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
  });

  it("does not exit dwell mode when clicking a link (footnote)", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='2']")!;

    // Add a footnote link inside the paragraph
    const link = document.createElement("a");
    link.href = "#fn-1";
    link.textContent = "1";
    para.appendChild(link);

    // Activate via long-press
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);

    // Wait for the click exit handler to register
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    // Click the footnote link — should NOT exit dwell
    act(() => {
      fireEvent.click(link);
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);
  });

  it("exits dwell mode on Escape key", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='2']")!;

    // Activate via long-press
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);

    // Press Escape
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
    expect(article.querySelector("[data-dwell-target]")).toBeNull();
  });

  it("sets data-dwell-target on the correct paragraph", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='2']")!;

    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    // Only paragraph 2 should be the target
    const targets = article.querySelectorAll("[data-dwell-target]");
    expect(targets).toHaveLength(1);
    expect(targets[0].getAttribute("data-paragraph")).toBe("2");

    // Other paragraphs should NOT have the attribute
    expect(
      article
        .querySelector("[data-paragraph='0']")
        ?.hasAttribute("data-dwell-target"),
    ).toBe(false);
    expect(
      article
        .querySelector("[data-paragraph='1']")
        ?.hasAttribute("data-dwell-target"),
    ).toBe(false);
  });

  it("exits dwell mode on srf:dwell-exit custom event", async () => {
    render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='1']")!;

    // Activate via long-press
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);

    // Dispatch srf:dwell-exit (from dismiss button in ContextualQuiet)
    act(() => {
      window.dispatchEvent(new CustomEvent("srf:dwell-exit"));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
    expect(article.querySelector("[data-dwell-target]")).toBeNull();
  });

  it("cleans up data attributes on unmount", async () => {
    const { unmount } = render(<DwellMode />);
    const para = article.querySelector("[data-paragraph='1']")!;

    // Activate
    act(() => {
      fireEvent.touchStart(para, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(article.hasAttribute("data-dwell-active")).toBe(true);

    // Unmount
    unmount();

    expect(article.hasAttribute("data-dwell-active")).toBe(false);
    expect(article.querySelector("[data-dwell-target]")).toBeNull();
  });
});
