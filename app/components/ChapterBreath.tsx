/**
 * "Breath Between Chapters" — DES-012.
 *
 * When navigating between chapters via prev/next:
 * 1. A 1.2-second pause — only the chapter title visible.
 * 2. Chapter content fades in over 400ms.
 *
 * Deep links and search results skip the breath entirely.
 * prefers-reduced-motion skips it.
 *
 * Detection: ChapterNavLink sets a sessionStorage flag
 * before navigation. This component reads and clears it.
 *
 * "This is silence, not waiting."
 */

"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "srf-chapter-breath";
const BREATH_DURATION = 1200; // ms — the silence
const FADE_DURATION = 400; // ms — the reveal

interface ChapterBreathProps {
  chapterNumber: number;
  chapterTitle: string;
  children: React.ReactNode;
}

export function ChapterBreath({
  chapterNumber,
  chapterTitle,
  children,
}: ChapterBreathProps) {
  const [phase, setPhase] = useState<"breath" | "fade" | "done">("done");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check if this was a prev/next navigation
    const shouldBreathe = sessionStorage.getItem(STORAGE_KEY) === "true";
    sessionStorage.removeItem(STORAGE_KEY);

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!shouldBreathe || prefersReduced) {
      setPhase("done");
      return;
    }

    // Start the breath
    setPhase("breath");

    timerRef.current = setTimeout(() => {
      setPhase("fade");
      timerRef.current = setTimeout(() => {
        setPhase("done");
      }, FADE_DURATION);
    }, BREATH_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === "done") {
    return <>{children}</>;
  }

  return (
    <>
      {/* Title-only breath — centered on warm background */}
      {phase === "breath" && (
        <div
          className="flex min-h-[60vh] items-center justify-center px-4"
          role="status"
          aria-label="Loading chapter"
        >
          <h2 className="font-display text-xl text-(--theme-text) opacity-80">
            <span className="me-2 opacity-40">{chapterNumber}.</span>
            {chapterTitle}
          </h2>
        </div>
      )}

      {/* Fade-in phase — content appears */}
      {phase === "fade" && (
        <div
          className="animate-[chapterFadeIn_400ms_ease-out_both]"
        >
          {children}
        </div>
      )}
    </>
  );
}

// ── Navigation helper ────────────────────────────────────────────

/** Set the breath flag before navigating. Use on prev/next links. */
export function markChapterBreath() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // sessionStorage unavailable — skip silently
  }
}
