/**
 * Tests for LibraryView component.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LibraryView } from "../LibraryView";
import type { LibraryBook } from "@/lib/personal-library";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "empty") return "Your library is empty";
    if (key === "emptyHint") return "Start reading any chapter";
    if (key === "browseBooks") return "Browse books";
    if (key === "chaptersVisited")
      return `${values?.count} chapters explored`;
    if (key === "continueChapter")
      return `Ch. ${values?.number}: ${values?.title}`;
    if (key === "progressLabel")
      return `${values?.read} chapters explored`;
    return key;
  },
}));

// Mock i18n navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock personal-library
const mockGetLibrary = vi.fn<() => LibraryBook[]>();
vi.mock("@/lib/personal-library", () => ({
  getLibrary: () => mockGetLibrary(),
}));

// Mock SrfLotus
vi.mock("@/app/components/SrfLotus", () => ({
  SrfLotus: ({ className }: { className?: string }) => (
    <svg data-testid="lotus" className={className} />
  ),
}));

describe("LibraryView", () => {
  beforeEach(() => {
    mockGetLibrary.mockReset();
  });

  it("shows empty state when no library entries", () => {
    mockGetLibrary.mockReturnValue([]);
    render(<LibraryView locale="en" />);
    expect(screen.getByText("Your library is empty")).toBeInTheDocument();
    expect(screen.getByText("Browse books")).toBeInTheDocument();
  });

  it("renders book cards for library entries", () => {
    mockGetLibrary.mockReturnValue([
      {
        bookSlug: "autobiography-en",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "Paramahansa Yogananda",
        visitedChapters: new Set([1, 14, 26]),
        bookmarkCount: 2,
        lastChapter: 14,
        lastChapterTitle: "Cosmic Consciousness",
        lastActiveAt: Date.now(),
      },
    ]);

    render(<LibraryView locale="en" />);
    expect(
      screen.getByText("Autobiography of a Yogi"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Paramahansa Yogananda"),
    ).toBeInTheDocument();
    expect(screen.getByText("3 chapters explored")).toBeInTheDocument();
  });

  it("shows continue reading link when last chapter exists", () => {
    mockGetLibrary.mockReturnValue([
      {
        bookSlug: "autobiography-en",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "Paramahansa Yogananda",
        visitedChapters: new Set([14]),
        bookmarkCount: 0,
        lastChapter: 14,
        lastChapterTitle: "Cosmic Consciousness",
        lastActiveAt: Date.now(),
      },
    ]);

    render(<LibraryView locale="en" />);
    expect(
      screen.getByText("Ch. 14: Cosmic Consciousness"),
    ).toBeInTheDocument();
  });

  it("shows bookmark count badge", () => {
    mockGetLibrary.mockReturnValue([
      {
        bookSlug: "autobiography-en",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "",
        visitedChapters: new Set([1]),
        bookmarkCount: 5,
        lastChapter: null,
        lastChapterTitle: null,
        lastActiveAt: Date.now(),
      },
    ]);

    render(<LibraryView locale="en" />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders multiple books", () => {
    mockGetLibrary.mockReturnValue([
      {
        bookSlug: "autobiography-en",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "Paramahansa Yogananda",
        visitedChapters: new Set([1, 14]),
        bookmarkCount: 0,
        lastChapter: 14,
        lastChapterTitle: "Cosmic Consciousness",
        lastActiveAt: Date.now(),
      },
      {
        bookSlug: "autobiografia-es",
        bookTitle: "Autobiografía de un yogui",
        bookAuthor: "Paramahansa Yogananda",
        visitedChapters: new Set([1]),
        bookmarkCount: 1,
        lastChapter: 1,
        lastChapterTitle: "Mis padres",
        lastActiveAt: Date.now() - 86400000,
      },
    ]);

    render(<LibraryView locale="en" />);
    expect(
      screen.getByText("Autobiography of a Yogi"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Autobiografía de un yogui"),
    ).toBeInTheDocument();
  });

  it("hides chapter count when no chapters visited", () => {
    mockGetLibrary.mockReturnValue([
      {
        bookSlug: "autobiography-en",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "",
        visitedChapters: new Set(),
        bookmarkCount: 1,
        lastChapter: null,
        lastChapterTitle: null,
        lastActiveAt: Date.now(),
      },
    ]);

    render(<LibraryView locale="en" />);
    expect(screen.queryByText(/chapters explored/)).not.toBeInTheDocument();
  });

  it("uses bookSlug as fallback when title is empty", () => {
    mockGetLibrary.mockReturnValue([
      {
        bookSlug: "autobiography-en",
        bookTitle: "",
        bookAuthor: "",
        visitedChapters: new Set([1]),
        bookmarkCount: 0,
        lastChapter: null,
        lastChapterTitle: null,
        lastActiveAt: 0,
      },
    ]);

    render(<LibraryView locale="en" />);
    expect(screen.getByText("autobiography-en")).toBeInTheDocument();
  });
});
