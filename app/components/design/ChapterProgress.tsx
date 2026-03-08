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

interface ChapterRef {
  number: number;
  title: string;
}

interface ChapterProgressProps {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  bookSlug: string;
  locale: string;
  prevChapter: ChapterRef | null;
  nextChapter: ChapterRef | null;
}

const chevronStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.75rem",
  height: "2.75rem",
  color: "inherit",
  textDecoration: "none",
  opacity: 0.4,
  borderRadius: "var(--radius-pill, 9999px)",
  transition: "opacity 150ms ease, background-color 150ms ease",
  flexShrink: 0,
};

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

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
      {/* Chevrons flank the two-row center block, vertically centered */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          maxInlineSize: "var(--reading-measure, 65ch)",
          marginInline: "auto",
          padding: "var(--space-compact) var(--space-default)",
          fontFamily: "var(--font-ui)",
          color: "var(--color-text-secondary)",
        }}
      >
        {/* Prev chevron */}
        {prevChapter !== null ? (
          <Link
            href={`/books/${bookSlug}/${prevChapter.number}`}
            className="chapter-progress-chevron"
            aria-label={`Previous: Chapter ${prevChapter.number} — ${prevChapter.title}`}
            title={`Ch. ${prevChapter.number}: ${prevChapter.title}`}
            style={chevronStyle}
          >
            <ChevronLeft />
          </Link>
        ) : (
          <span style={{ ...chevronStyle, visibility: "hidden" }} />
        )}

        {/* Center: book title + chapter identity */}
        <div style={{ flex: 1, minInlineSize: 0, textAlign: "center" }}>
          {/* Book title */}
          <div
            style={{
              fontSize: "0.75rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Link
              href={`/books/${bookSlug}`}
              title="Table of Contents"
              style={{
                color: "inherit",
                textDecoration: "none",
                opacity: 0.6,
              }}
            >
              {bookTitle}
            </Link>
          </div>

          {/* Chapter number + title */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0.4em",
              fontSize: "0.6875rem",
              marginBlockStart: "2px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                color: "var(--color-crimson)",
                fontVariant: "small-caps",
                letterSpacing: "0.05em",
                flexShrink: 0,
              }}
            >
              Ch. {chapterNumber}
            </span>
            {chapterTitle && (
              <span
                style={{
                  color: "var(--color-crimson)",
                  opacity: 0.7,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chapterTitle}
              </span>
            )}
          </div>
        </div>

        {/* Next chevron */}
        {nextChapter !== null ? (
          <Link
            href={`/books/${bookSlug}/${nextChapter.number}`}
            className="chapter-progress-chevron"
            aria-label={`Next: Chapter ${nextChapter.number} — ${nextChapter.title}`}
            title={`Ch. ${nextChapter.number}: ${nextChapter.title}`}
            style={chevronStyle}
          >
            <ChevronRight />
          </Link>
        ) : (
          <span style={{ ...chevronStyle, visibility: "hidden" }} />
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
