"use client";

/**
 * ChapterProgress — sticky reading position header.
 *
 * Shows book title and chapter number once the reader scrolls past
 * the chapter header. Includes a gold progress bar tracking scroll
 * position through the chapter.
 *
 * Replaces the standalone scroll-indicator from ReadingImmersion.
 * This component owns the progress bar; ReadingImmersion owns
 * dwell + keyboard navigation.
 *
 * CSS: inline styles for the progress bar (2px crimson — FTR-041 §4).
 * Position tracking uses the chapter header's bottom as threshold.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

interface ChapterProgressProps {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  bookSlug: string;
  locale: string;
  prevChapter: number | null;
  nextChapter: number | null;
}

const chevronStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  color: "inherit",
  textDecoration: "none",
  opacity: 0.35,
  fontSize: "0.875rem",
  transition: "opacity 150ms ease",
  flexShrink: 0,
};

export function ChapterProgress({
  bookTitle,
  chapterNumber,
  chapterTitle,
  bookSlug,
  locale,
  prevChapter,
  nextChapter,
}: ChapterProgressProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const siteHeader = document.querySelector<HTMLElement>(".app-header");
    const chapterHeader = document.querySelector<HTMLElement>(".chapter-header");
    if (!chapterHeader) return;

    function update() {
      // Measure site header height (may change on resize)
      if (siteHeader) {
        setHeaderHeight(siteHeader.getBoundingClientRect().height);
      }

      // Show after scrolling past the chapter header
      const chapterBottom = chapterHeader!.getBoundingClientRect().bottom;
      const threshold = siteHeader
        ? siteHeader.getBoundingClientRect().bottom
        : 0;
      setVisible(chapterBottom < threshold);

      // Progress through the page
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setProgress(Math.min(1, Math.max(0, pct)));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="chapter-progress"
      aria-hidden="true"
      data-no-print
      style={{
        position: "fixed",
        top: headerHeight,
        left: 0,
        right: 0,
        zIndex: 99,
        transform: visible ? "translateY(0)" : `translateY(calc(-100% - ${headerHeight}px))`,
        transition: "transform 300ms ease",
        backgroundColor: "var(--color-surface)",
        borderBlockEnd: "1px solid color-mix(in oklch, var(--color-text), transparent 90%)",
      }}
    >
      {/* Book + chapter info with prev/next navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-compact)",
          padding: "var(--space-compact) var(--space-default)",
          maxInlineSize: "var(--reading-measure, 65ch)",
          marginInline: "auto",
          fontSize: "0.75rem",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-ui)",
        }}
      >
        {prevChapter !== null ? (
          <Link
            href={`/books/${bookSlug}/${prevChapter}`}
            aria-label={`Previous chapter (${prevChapter})`}
            style={chevronStyle}
          >
            ‹
          </Link>
        ) : (
          <span style={{ ...chevronStyle, opacity: 0.12 }}>‹</span>
        )}

        <Link
          href={`/books/${bookSlug}`}
          style={{
            color: "inherit",
            textDecoration: "none",
            opacity: 0.6,
          }}
        >
          {bookTitle}
        </Link>
        <span style={{ opacity: 0.3 }}>/</span>
        <span style={{ color: "var(--color-crimson)", fontVariant: "small-caps", letterSpacing: "0.05em" }}>
          Ch. {chapterNumber}
        </span>
        {chapterTitle && (
          <span style={{ color: "var(--color-crimson)", opacity: 0.7 }}>
            {chapterTitle}
          </span>
        )}

        <span style={{ marginInlineStart: "auto" }} />
        {nextChapter !== null ? (
          <Link
            href={`/books/${bookSlug}/${nextChapter}`}
            aria-label={`Next chapter (${nextChapter})`}
            style={chevronStyle}
          >
            ›
          </Link>
        ) : (
          <span style={{ ...chevronStyle, opacity: 0.12 }}>›</span>
        )}
      </div>

      {/* Progress bar */}
      <div
        ref={barRef}
        style={{
          height: "2px",
          backgroundColor: "var(--color-progress, #8B2252)",
          inlineSize: `${progress * 100}%`,
          transition: "inline-size 100ms linear",
        }}
      />
    </div>
  );
}
