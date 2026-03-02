// @vitest-environment jsdom

/**
 * ChapterBreath tests — DES-012 chapter transition.
 *
 * Verifies the 1.2s breath pause, fade-in, sessionStorage
 * detection, reduced-motion skip, and deep-link skip.
 */

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock matchMedia for reduced motion ───────────────────────────

let mockReducedMotion = false;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches:
      query === "(prefers-reduced-motion: reduce)" ? mockReducedMotion : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// ── Import ──────────────────────────────────────────────────────

import { ChapterBreath, markChapterBreath } from "../ChapterBreath";

// ── Tests ───────────────────────────────────────────────────────

describe("ChapterBreath", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    mockReducedMotion = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows content immediately when no breath flag is set (deep link)", () => {
    render(
      <ChapterBreath chapterNumber={5} chapterTitle="The Law of Miracles">
        <p>Chapter content here</p>
      </ChapterBreath>,
    );

    expect(screen.getByText("Chapter content here")).toBeInTheDocument();
  });

  it("shows breath pause when sessionStorage flag is set", () => {
    markChapterBreath();

    render(
      <ChapterBreath chapterNumber={5} chapterTitle="The Law of Miracles">
        <p>Chapter content here</p>
      </ChapterBreath>,
    );

    // During breath phase: title visible, content hidden
    expect(screen.getByText(/The Law of Miracles/)).toBeInTheDocument();
    expect(screen.queryByText("Chapter content here")).not.toBeInTheDocument();
  });

  it("shows content after breath + fade duration", () => {
    markChapterBreath();

    render(
      <ChapterBreath chapterNumber={5} chapterTitle="The Law of Miracles">
        <p>Chapter content here</p>
      </ChapterBreath>,
    );

    // After 1.2s breath
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Now in fade phase — content should be present (fading in)
    expect(screen.getByText("Chapter content here")).toBeInTheDocument();

    // After 400ms fade
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Done — content fully visible
    expect(screen.getByText("Chapter content here")).toBeInTheDocument();
  });

  it("skips breath when prefers-reduced-motion is active", () => {
    mockReducedMotion = true;
    markChapterBreath();

    render(
      <ChapterBreath chapterNumber={5} chapterTitle="The Law of Miracles">
        <p>Chapter content here</p>
      </ChapterBreath>,
    );

    // Content immediately visible despite breath flag
    expect(screen.getByText("Chapter content here")).toBeInTheDocument();
  });

  it("clears the sessionStorage flag after reading it", () => {
    markChapterBreath();
    expect(sessionStorage.getItem("srf-chapter-breath")).toBe("true");

    render(
      <ChapterBreath chapterNumber={1} chapterTitle="Test">
        <p>Content</p>
      </ChapterBreath>,
    );

    expect(sessionStorage.getItem("srf-chapter-breath")).toBeNull();
  });

  it("displays chapter number in the breath phase", () => {
    markChapterBreath();

    render(
      <ChapterBreath chapterNumber={7} chapterTitle="The Law of Miracles">
        <p>Content</p>
      </ChapterBreath>,
    );

    expect(screen.getByText("7.")).toBeInTheDocument();
  });

  it("has an accessible role=status on the breath overlay", () => {
    markChapterBreath();

    render(
      <ChapterBreath chapterNumber={5} chapterTitle="The Law of Miracles">
        <p>Content</p>
      </ChapterBreath>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("markChapterBreath", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sets the sessionStorage flag", () => {
    markChapterBreath();
    expect(sessionStorage.getItem("srf-chapter-breath")).toBe("true");
  });
});
