// @vitest-environment jsdom

/**
 * RelatedTeachings tests — M3c-3 (ADR-050).
 *
 * Verifies side panel rendering, empty state, passage cards,
 * thread navigation, accessibility, and mobile bottom sheet.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RelatedTeachings } from "../RelatedTeachings";
import type { RelatedPassage, ThreadSuggestion } from "@/lib/services/relations";

// ── Mock next-intl ──────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const map: Record<string, string | ((v: Record<string, unknown>) => string)> = {
      relatedTeachings: "Related Teachings",
      relatedTo: "Related to:",
      settlePrompt: "Settle into a passage\nto discover connections",
      continueThread: "Continue the Thread",
      threadDesc: "Chapters where these ideas continue",
      threadSharedThemes: (v: Record<string, unknown>) =>
        `${v.count} shared ${Number(v.count) === 1 ? "theme" : "themes"}`,
      threadOpening: "Opening\u2026",
      threadRead: "Read",
    };
    const val = map[key];
    if (typeof val === "function") return val(values ?? {});
    return val ?? key;
  },
}));

// ── Mock next/link ───────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ── Test data ────────────────────────────────────────────────────

const mockPassage: RelatedPassage = {
  id: "chunk-related-1",
  content: "God is approachable. God is not a cosmic dictator.",
  bookId: "book-1",
  bookSlug: "autobiography-of-a-yogi",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterTitle: "Years in My Master's Hermitage",
  chapterNumber: 12,
  pageNumber: 98,
  similarity: 0.85,
  rank: 1,
  relationType: "thematic_echo",
  relationLabel: "Yogananda returns to this theme of divine accessibility",
};

const mockPassage2: RelatedPassage = {
  id: "chunk-related-2",
  content: "The deeper the self-realization of a man, the more he influences the whole universe.",
  bookId: "book-1",
  bookSlug: "autobiography-of-a-yogi",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterTitle: "The Science of Kriya Yoga",
  chapterNumber: 26,
  pageNumber: 253,
  similarity: 0.72,
  rank: 2,
  relationType: null,
  relationLabel: null,
};

const mockThread: ThreadSuggestion = {
  chapterNumber: 33,
  chapterTitle: "Babaji, the Yogi-Christ of Modern India",
  bookTitle: "Autobiography of a Yogi",
  bookId: "book-1",
  bookSlug: "autobiography-of-a-yogi",
  connectionCount: 5,
  label: null,
};

const defaultProps = {
  relations: { "chunk-1": [mockPassage, mockPassage2] } as Record<string, RelatedPassage[]>,
  thread: [mockThread],
  paragraphChunkIds: ["chunk-1", "chunk-2", "chunk-3"],
  bookSlug: "autobiography-of-a-yogi",
  chapterNumber: 1,
  chapterTitle: "My Parents and Early Life",
  locale: "en",
};

// ── Helpers ──────────────────────────────────────────────────────

function renderWithParagraphs(props = defaultProps) {
  // Create paragraph DOM elements so IntersectionObserver has targets
  const container = document.createElement("div");
  for (let i = 0; i < 3; i++) {
    const p = document.createElement("p");
    p.setAttribute("data-paragraph", String(i));
    p.textContent = `Paragraph ${i} content for testing.`;
    container.appendChild(p);
  }
  document.body.appendChild(container);

  const result = render(<RelatedTeachings {...props} />);
  return { ...result, cleanup: () => document.body.removeChild(container) };
}

// ── Tests ────────────────────────────────────────────────────────

describe("RelatedTeachings", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock IntersectionObserver as a class constructor
    global.IntersectionObserver = class MockIntersectionObserver
      implements IntersectionObserver
    {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: readonly number[] = [];
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn().mockReturnValue([]);
      constructor(
        _callback: IntersectionObserverCallback,
        _options?: IntersectionObserverInit,
      ) {}
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the desktop side panel with aria-label", () => {
    const { cleanup } = renderWithParagraphs();
    const aside = screen.getByRole("complementary", { name: "Related Teachings" });
    expect(aside).toBeDefined();
    cleanup();
  });

  it("renders 'Related Teachings' heading in desktop panel", () => {
    const { cleanup } = renderWithParagraphs();
    const headings = screen.getAllByText("Related Teachings");
    expect(headings.length).toBeGreaterThanOrEqual(1);
    cleanup();
  });

  it("shows empty state message when no relations and no thread", () => {
    const emptyAllProps = {
      ...defaultProps,
      relations: {},
      thread: [],
    };
    const { cleanup } = renderWithParagraphs(emptyAllProps);
    expect(screen.getByText(/Settle into a passage/)).toBeDefined();
    cleanup();
  });

  it("renders nothing visible when relations are empty", () => {
    const emptyProps = {
      ...defaultProps,
      relations: {},
      thread: [],
    };
    const { cleanup } = renderWithParagraphs(emptyProps);
    // Side panel should still exist (desktop) but no indicators or bottom sheet
    const aside = screen.getByRole("complementary", { name: "Related Teachings" });
    expect(aside).toBeDefined();
    cleanup();
  });

  it("renders thread suggestions with connection counts", () => {
    // Simulate settled paragraph by triggering the dwell event
    const { cleanup } = renderWithParagraphs();

    act(() => {
      document.dispatchEvent(
        new CustomEvent("srf:dwell-toggle", {
          detail: { paragraphIndex: 0 },
        }),
      );
    });

    // Thread section should appear with "Continue the Thread" heading
    expect(screen.getByText("Continue the Thread")).toBeDefined();

    // Thread item with chapter info
    expect(screen.getByText(/Babaji, the Yogi-Christ/)).toBeDefined();

    // Connection count
    expect(screen.getByText("5")).toBeDefined();

    cleanup();
  });

  it("renders passage cards when a paragraph settles via dwell event", () => {
    const { cleanup } = renderWithParagraphs();

    act(() => {
      document.dispatchEvent(
        new CustomEvent("srf:dwell-toggle", {
          detail: { paragraphIndex: 0 },
        }),
      );
    });

    // Should show the contextual label
    expect(screen.getByText(/divine accessibility/)).toBeDefined();

    // Should show chapter citations
    expect(screen.getByText("Ch. 12")).toBeDefined();
    expect(screen.getByText("p. 98")).toBeDefined();

    cleanup();
  });

  it("hides side panel on mobile (lg:hidden/lg:block classes)", () => {
    const { cleanup } = renderWithParagraphs();
    const aside = screen.getByRole("complementary", { name: "Related Teachings" });
    expect(aside.className).toContain("hidden");
    expect(aside.className).toContain("lg:block");
    cleanup();
  });

  it("marks side panel with data-no-focus and data-no-present", () => {
    const { cleanup } = renderWithParagraphs();
    const aside = screen.getByRole("complementary", { name: "Related Teachings" });
    expect(aside.hasAttribute("data-no-focus")).toBe(true);
    expect(aside.hasAttribute("data-no-present")).toBe(true);
    cleanup();
  });

  it("renders thread links with correct href", () => {
    const { cleanup } = renderWithParagraphs();

    act(() => {
      document.dispatchEvent(
        new CustomEvent("srf:dwell-toggle", {
          detail: { paragraphIndex: 0 },
        }),
      );
    });

    const threadLink = screen.getByText(/Babaji, the Yogi-Christ/).closest("a");
    expect(threadLink?.getAttribute("href")).toBe("/en/books/autobiography-of-a-yogi/33");

    cleanup();
  });
});
