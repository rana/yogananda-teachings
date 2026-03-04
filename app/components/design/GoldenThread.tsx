"use client";

/**
 * GoldenThread — cross-chapter connection panel.
 *
 * When a reader taps/clicks a threaded paragraph (one with
 * .golden-thread-passage), this component reveals related teachings
 * from other chapters. The coherence of the teaching becomes visible.
 *
 * Desktop (≥1024px): side panel slides in beside the reading column.
 * Mobile: bottom sheet slides up from below.
 *
 * All relations data is SSR'd — zero client-side fetching. The panel
 * opens instantly because the data is already in the page.
 *
 * Animation classes from design system (reading-surface.css):
 *   .thread-panel-fade, .thread-sheet-enter, .thread-backdrop-enter
 *
 * Calm technology: no auto-open, no tracking, no gamification.
 * The reader chooses to explore connections — we respond.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { RelatedPassage, ThreadSuggestion } from "@/lib/services/relations";

interface GoldenThreadProps {
  /** Map of paragraph index → related passages (SSR'd) */
  paragraphs: Record<number, RelatedPassage[]>;
  /** Chapter-level thread suggestions */
  thread: ThreadSuggestion[];
  /** Locale for link construction */
  locale: string;
}

export function GoldenThread({ paragraphs, thread, locale }: GoldenThreadProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close and clean up
  const close = useCallback(() => {
    setActiveIndex(null);
    document
      .querySelectorAll("[data-thread-active]")
      .forEach((el) => el.removeAttribute("data-thread-active"));
  }, []);

  // Listen for clicks on threaded paragraphs
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-has-thread]",
      );
      if (!target) return;

      const index = parseInt(
        target.getAttribute("data-paragraph") ?? "-1",
        10,
      );
      if (index < 0 || !paragraphs[index]) return;

      // Toggle: click same paragraph closes, different opens
      setActiveIndex((prev) => {
        const next = prev === index ? null : index;

        // Update data-thread-active on paragraphs
        document
          .querySelectorAll("[data-thread-active]")
          .forEach((el) => el.removeAttribute("data-thread-active"));
        if (next !== null) {
          target.setAttribute("data-thread-active", "");
        }

        return next;
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [paragraphs]);

  // Escape closes the panel
  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, close]);

  // Focus trap: shift focus to panel on open
  useEffect(() => {
    if (activeIndex === null) return;
    const target = isMobile ? sheetRef.current : panelRef.current;
    if (target) {
      // Small delay to allow animation to start
      requestAnimationFrame(() => target.focus());
    }
  }, [activeIndex, isMobile]);

  if (activeIndex === null) return null;

  const related = paragraphs[activeIndex] ?? [];
  if (related.length === 0) return null;

  // Mobile: bottom sheet with backdrop
  if (isMobile) {
    return (
      <>
        <div
          className="thread-backdrop thread-backdrop-enter"
          onClick={close}
          aria-hidden="true"
        />
        <div
          ref={sheetRef}
          className="thread-sheet thread-sheet-enter"
          role="dialog"
          aria-label="Related teachings"
          tabIndex={-1}
        >
          <div className="thread-sheet-handle" aria-hidden="true" />
          <ThreadContent
            passages={related}
            thread={thread}
            locale={locale}
            onClose={close}
          />
        </div>
      </>
    );
  }

  // Desktop: side panel
  return (
    <aside
      ref={panelRef}
      className="thread-panel thread-panel-fade"
      role="complementary"
      aria-label="Related teachings"
      tabIndex={-1}
    >
      <ThreadContent
        passages={related}
        thread={thread}
        locale={locale}
        onClose={close}
      />
    </aside>
  );
}

/** Inner content — shared between panel and sheet layouts. */
function ThreadContent({
  passages,
  thread,
  locale,
  onClose,
}: {
  passages: RelatedPassage[];
  thread: ThreadSuggestion[];
  locale: string;
  onClose: () => void;
}) {
  return (
    <div className="thread-content">
      <div className="thread-header">
        <h3 className="thread-heading">Related Teachings</h3>
        <button
          className="thread-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="thread-passages">
        {passages.map((p) => (
          <a
            key={p.id}
            href={`/${locale}/books/${p.bookSlug}/${p.chapterNumber}`}
            className="thread-passage"
          >
            {p.relationLabel && (
              <p className="thread-label">{p.relationLabel}</p>
            )}
            <blockquote className="thread-quote">
              &ldquo;{p.content}&rdquo;
            </blockquote>
            <cite className="thread-cite">
              {p.bookTitle}, Ch. {p.chapterNumber}
              {p.chapterTitle && `: ${p.chapterTitle}`}
            </cite>
          </a>
        ))}
      </div>

      {/* Chapter-level thread suggestions */}
      {thread.length > 0 && (
        <div className="thread-suggestions">
          <p className="thread-subheading">Continue the Thread</p>
          {thread.map((s) => (
            <a
              key={`${s.bookSlug}-${s.chapterNumber}`}
              href={`/${locale}/books/${s.bookSlug}/${s.chapterNumber}`}
              className="thread-suggestion"
            >
              <span className="thread-suggestion-title">
                {s.bookTitle}, Ch. {s.chapterNumber}: {s.chapterTitle}
              </span>
              {s.label && (
                <span className="thread-suggestion-label">{s.label}</span>
              )}
              <span className="thread-suggestion-count">
                {s.connectionCount} connection{s.connectionCount !== 1 ? "s" : ""}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
