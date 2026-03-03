/**
 * Tests for ChapterProgress and ChapterVisitedDot components.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterProgress, ChapterVisitedDot } from "../ChapterProgress";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "chaptersRead")
      return `${values?.read} of ${values?.total} chapters explored`;
    return key;
  },
}));

// Mock visited-chapters module
const mockGetVisitedChapters = vi.fn();
vi.mock("@/lib/visited-chapters", () => ({
  getVisitedChapters: (...args: unknown[]) => mockGetVisitedChapters(...args),
}));

describe("ChapterProgress", () => {
  beforeEach(() => {
    mockGetVisitedChapters.mockReset();
  });

  it("renders nothing when no chapters visited", () => {
    mockGetVisitedChapters.mockReturnValue(new Set());
    const { container } = render(
      <ChapterProgress bookSlug="auto" totalChapters={49} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows progress bar and count when chapters visited", () => {
    mockGetVisitedChapters.mockReturnValue(new Set([1, 14, 26]));
    render(<ChapterProgress bookSlug="auto" totalChapters={49} />);
    expect(
      screen.getByText("3 of 49 chapters explored"),
    ).toBeInTheDocument();
  });

  it("calculates percentage correctly", () => {
    mockGetVisitedChapters.mockReturnValue(new Set([1, 2, 3, 4, 5]));
    const { container } = render(
      <ChapterProgress bookSlug="auto" totalChapters={10} />,
    );
    // 5/10 = 50%
    const progressBar = container.querySelector("[style]");
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("passes bookSlug to getVisitedChapters", () => {
    mockGetVisitedChapters.mockReturnValue(new Set());
    render(<ChapterProgress bookSlug="autobiografia-es" totalChapters={49} />);
    expect(mockGetVisitedChapters).toHaveBeenCalledWith("autobiografia-es");
  });

  it("rounds percentage to nearest integer", () => {
    // 1/3 = 33.33...% → 33%
    mockGetVisitedChapters.mockReturnValue(new Set([1]));
    const { container } = render(
      <ChapterProgress bookSlug="auto" totalChapters={3} />,
    );
    const progressBar = container.querySelector("[style]");
    expect(progressBar).toHaveStyle({ width: "33%" });
  });

  it("shows 100% when all chapters visited", () => {
    mockGetVisitedChapters.mockReturnValue(new Set([1, 2, 3]));
    const { container } = render(
      <ChapterProgress bookSlug="auto" totalChapters={3} />,
    );
    const progressBar = container.querySelector("[style]");
    expect(progressBar).toHaveStyle({ width: "100%" });
    expect(
      screen.getByText("3 of 3 chapters explored"),
    ).toBeInTheDocument();
  });
});

describe("ChapterVisitedDot", () => {
  beforeEach(() => {
    mockGetVisitedChapters.mockReset();
  });

  it("renders nothing when chapter not visited", () => {
    mockGetVisitedChapters.mockReturnValue(new Set());
    const { container } = render(
      <ChapterVisitedDot bookSlug="auto" chapterNumber={14} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders gold dot when chapter visited", () => {
    mockGetVisitedChapters.mockReturnValue(new Set([14]));
    const { container } = render(
      <ChapterVisitedDot bookSlug="auto" chapterNumber={14} />,
    );
    const dot = container.querySelector("span");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render dot for unvisited chapter in mixed set", () => {
    mockGetVisitedChapters.mockReturnValue(new Set([1, 26]));
    const { container } = render(
      <ChapterVisitedDot bookSlug="auto" chapterNumber={14} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("passes bookSlug to getVisitedChapters", () => {
    mockGetVisitedChapters.mockReturnValue(new Set());
    render(
      <ChapterVisitedDot bookSlug="autobiografia-es" chapterNumber={1} />,
    );
    expect(mockGetVisitedChapters).toHaveBeenCalledWith("autobiografia-es");
  });
});
