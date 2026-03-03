"use client";

/**
 * Related Teachings — M3c-3 (ADR-050, DES-006).
 *
 * The golden thread: surfaces cross-chapter connections as you read.
 * Desktop: sticky side panel that updates as you settle into a passage.
 * Mobile: golden thread left-accents on paragraphs, bottom sheet on tap.
 *
 * Design principles:
 * - Settle, don't scan (1.2s debounce — spiritual design choice, not performance)
 * - Silence when appropriate (empty state is intentional white space)
 * - The technology disappears (batch-prefetched, zero client-side fetching)
 * - Surprise over similarity (contextual labels honor the spirit)
 *
 * Golden thread accents are CSS-only (server-rendered via page.tsx).
 * This component adds: settled-paragraph marking (desktop), tap handling
 * (mobile), side panel transitions, and bottom sheet interaction.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { sendResonance } from "@/lib/resonance-beacon";
import { pushThreadPosition } from "@/lib/thread-memory";
import {
  SETTLED_PARAGRAPH_DEBOUNCE_MS,
  FOCUS_ZONE_ROOT_MARGIN,
} from "@/lib/config";
import type { RelatedPassage, ThreadSuggestion } from "@/lib/services/relations";

// ── Types ────────────────────────────────────────────────────────

interface RelatedTeachingsProps {
  /** Pre-fetched relations: map of chunk ID → related passages */
  relations: Record<string, RelatedPassage[]>;
  /** Chapter-level thread suggestions */
  thread: ThreadSuggestion[];
  /** Ordered chunk IDs matching paragraph DOM order (data-paragraph={i}) */
  paragraphChunkIds: string[];
  bookSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  locale: string;
}

// ── Settled Paragraph Hook ──────────────────────────────────────

/**
 * Intersection Observer with focus zone + debounce.
 * Determines which paragraph the reader has "settled into" —
 * the one that's been in the middle 30% of the viewport for 1.2s.
 */
function useSettledParagraph(): number | null {
  const [settled, setSettled] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const candidateRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most prominent paragraph in the focus zone
        let bestIdx: number | null = null;
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const idx = parseInt(el.dataset.paragraph || "-1", 10);
          if (idx < 0) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }

        if (bestIdx !== null && bestIdx !== candidateRef.current) {
          candidateRef.current = bestIdx;

          // Clear previous timer — reader moved on
          if (timerRef.current) clearTimeout(timerRef.current);

          // Start the settle timer: 1.2s of stillness
          timerRef.current = setTimeout(() => {
            setSettled(bestIdx);
          }, SETTLED_PARAGRAPH_DEBOUNCE_MS);
        }
      },
      {
        // Focus zone: middle 30% of viewport
        rootMargin: FOCUS_ZONE_ROOT_MARGIN,
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      },
    );

    // Observe all paragraph elements
    const paragraphs = document.querySelectorAll("[data-paragraph]");
    paragraphs.forEach((p) => observer.observe(p));

    // Listen for dwell mode override — immediate update, no debounce
    const handleDwell = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.paragraphIndex != null) {
        if (timerRef.current) clearTimeout(timerRef.current);
        candidateRef.current = detail.paragraphIndex;
        setSettled(detail.paragraphIndex);
      }
    };
    document.addEventListener("srf:dwell-toggle", handleDwell);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("srf:dwell-toggle", handleDwell);
    };
  }, []);

  return settled;
}

// ── Passage Card ────────────────────────────────────────────────

function PassageCard({
  passage,
  locale,
  currentContext,
}: {
  passage: RelatedPassage;
  locale: string;
  /** Current reading position — pushed to thread stack on "Read" click */
  currentContext: {
    bookSlug: string;
    chapterNumber: number;
    chapterTitle: string;
    settledChunkId: string | null;
  };
}) {
  const t = useTranslations("reader");
  const [navigating, setNavigating] = useState(false);

  // Truncate content for display
  const displayContent =
    passage.content.length > 160
      ? passage.content.slice(0, 157) + "\u2026"
      : passage.content;

  const handleReadClick = useCallback(() => {
    setNavigating(true);
    sendResonance(passage.id, "traverse");
    // Push current position to thread stack so the seeker can return
    if (currentContext.settledChunkId) {
      pushThreadPosition({
        bookSlug: currentContext.bookSlug,
        chapterNumber: currentContext.chapterNumber,
        chapterTitle: currentContext.chapterTitle,
        chunkId: currentContext.settledChunkId,
      });
    }
  }, [passage.id, currentContext]);

  return (
    <div className={`group rounded-lg border p-3 transition-all duration-200 ${navigating ? 'border-srf-gold/50 bg-srf-gold/5' : 'border-srf-navy/8 bg-(--theme-surface) hover:border-srf-gold/30'}`}>
      {/* Contextual label — the soul of Related Teachings */}
      {passage.relationLabel && (
        <p className="mb-1.5 text-xs font-medium text-srf-gold/80 italic">
          {passage.relationLabel}
        </p>
      )}

      {/* Verbatim quote */}
      <blockquote className="mb-2 text-sm leading-relaxed text-srf-navy/80">
        &ldquo;{displayContent}&rdquo;
      </blockquote>

      {/* Citation + Read link */}
      <footer className="flex items-center gap-1.5 text-xs text-srf-navy/45">
        <span>Ch. {passage.chapterNumber}</span>
        {passage.pageNumber && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>p. {passage.pageNumber}</span>
          </>
        )}
        <NextLink
          href={`/${locale}/books/${passage.bookSlug}/${passage.chapterNumber}#passage-${passage.id}`}
          className={`ml-auto transition-colors min-h-11 inline-flex items-center ${navigating ? 'text-srf-gold font-medium' : 'text-srf-gold/70 hover:text-srf-gold'}`}
          onClick={handleReadClick}
        >
          {navigating ? t("threadOpening") : t("threadRead")}
        </NextLink>
      </footer>
    </div>
  );
}

// ── Side Panel (Desktop) ────────────────────────────────────────

function SidePanel({
  passages,
  thread,
  sourceText,
  locale,
  currentContext,
}: {
  passages: RelatedPassage[];
  thread: ThreadSuggestion[];
  sourceText: string | null;
  locale: string;
  currentContext: {
    bookSlug: string;
    chapterNumber: number;
    chapterTitle: string;
    settledChunkId: string | null;
  };
}) {
  const t = useTranslations("reader");

  if (passages.length === 0 && thread.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-srf-navy/25 italic whitespace-pre-line">
          {t("settlePrompt")}
        </p>
      </div>
    );
  }

  // Source reference — which paragraph the relations are for
  const truncatedSource = sourceText
    ? sourceText.length > 80
      ? sourceText.slice(0, 77) + "\u2026"
      : sourceText
    : null;

  return (
    <div className="space-y-4">
      {/* Source reference */}
      {truncatedSource && (
        <p className="text-xs text-srf-navy/35 leading-relaxed">
          <span className="font-medium text-srf-navy/50">{t("relatedTo")}</span>{" "}
          &ldquo;{truncatedSource}&rdquo;
        </p>
      )}

      {/* Related passage cards */}
      <div className="space-y-3">
        {passages.map((passage) => (
          <PassageCard key={passage.id} passage={passage} locale={locale} currentContext={currentContext} />
        ))}
      </div>

      {/* Continue the Thread — chapter-level connections */}
      {thread.length > 0 && (
        <div className="border-t border-srf-navy/8 pt-4">
          <h4 className="mb-0.5 text-xs font-semibold tracking-wide text-srf-navy/40 uppercase">
            {t("continueThread")}
          </h4>
          <p className="mb-2 text-[11px] leading-snug text-srf-navy/30">
            {t("threadDesc")}
          </p>
          <ul className="space-y-1.5">
            {thread.map((ts) => (
              <li key={`${ts.bookSlug}-${ts.chapterNumber}`}>
                <NextLink
                  href={`/${locale}/books/${ts.bookSlug}/${ts.chapterNumber}`}
                  className="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-sm text-srf-navy/60 transition-colors hover:bg-srf-gold/5 hover:text-srf-navy min-h-11"
                >
                  <span
                    className="shrink-0 text-xs text-srf-gold/50"
                    title={t("threadSharedThemes", { count: ts.connectionCount })}
                    aria-label={t("threadSharedThemes", { count: ts.connectionCount })}
                  >
                    {ts.connectionCount}
                  </span>
                  <span className="line-clamp-2">
                    Ch. {ts.chapterNumber}: {ts.chapterTitle}
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Bottom Sheet (Mobile/Tablet) ────────────────────────────────

function BottomSheet({
  isOpen,
  onClose,
  ariaLabel,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — animated fade */}
      <div
        className="thread-backdrop-enter fixed inset-0 z-40 bg-srf-navy/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet — animated slide up */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="thread-sheet-enter fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-srf-gold/20 bg-(--theme-surface) px-4 pb-8 pt-3 shadow-lg"
      >
        {/* Drag handle visual */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-srf-navy/15" />
        <h3 className="mb-3 text-sm font-semibold text-srf-navy/60">
          {ariaLabel}
        </h3>
        {children}
      </div>
    </>
  );
}

// ── Thread Tap Zone (Mobile/Tablet) ─────────────────────────────

/**
 * Event delegation for mobile/tablet paragraph taps.
 * Replaces the old ThreadIndicators (floating fixed-position dots).
 *
 * The golden thread left-accents are CSS-only (server-rendered via
 * .golden-thread-passage class in page.tsx). This component adds the
 * tap interaction: tapping the left ~40px zone of an accented paragraph
 * opens the bottom sheet.
 *
 * Zero scroll listeners. Zero getBoundingClientRect(). Zero fixed positioning.
 */
function ThreadTapZone({
  onTap,
}: {
  onTap: (paragraphIndex: number) => void;
}) {
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  useEffect(() => {
    // Only attach on touch devices (mobile/tablet)
    const mql = window.matchMedia("(max-width: 1023px)");
    if (!mql.matches) return;

    const handleClick = (e: MouseEvent) => {
      // Walk up from target to find an accented paragraph
      const target = (e.target as HTMLElement).closest(
        "[data-has-thread]",
      ) as HTMLElement | null;
      if (!target) return;

      // Only trigger on the left margin zone (near the golden thread accent)
      const rect = target.getBoundingClientRect();
      const xInElement = e.clientX - rect.left;
      if (xInElement > 40) return;

      const idx = parseInt(target.dataset.paragraph || "-1", 10);
      if (idx < 0) return;

      e.preventDefault();
      onTapRef.current(idx);
    };

    document.addEventListener("click", handleClick);

    const handleChange = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        document.removeEventListener("click", handleClick);
      }
    };
    mql.addEventListener("change", handleChange);

    return () => {
      document.removeEventListener("click", handleClick);
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  return null; // Pure behavior — no DOM
}

// ── Main Component ──────────────────────────────────────────────

export function RelatedTeachings({
  relations,
  thread,
  paragraphChunkIds,
  bookSlug,
  chapterNumber,
  chapterTitle,
  locale,
}: RelatedTeachingsProps) {
  const t = useTranslations("reader");
  const settledIdx = useSettledParagraph();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIdx, setSheetIdx] = useState<number | null>(null);
  const prevSettledRef = useRef<number | null>(null);

  // Get the chunk ID and text for the settled paragraph
  const settledChunkId =
    settledIdx !== null ? paragraphChunkIds[settledIdx] : null;
  const settledPassages = settledChunkId ? relations[settledChunkId] ?? [] : [];

  // Get source text from the DOM for the "Related to:" reference
  const [sourceText, setSourceText] = useState<string | null>(null);
  useEffect(() => {
    if (settledIdx === null) {
      setSourceText(null);
      return;
    }
    const el = document.querySelector(
      `[data-paragraph="${settledIdx}"]`,
    );
    if (el) {
      setSourceText(el.textContent?.slice(0, 100) ?? null);
    }
  }, [settledIdx]);

  // Mark the settled paragraph on desktop — visual connection to side panel.
  // Adds/removes data-thread-active which CSS strengthens the gold accent.
  useEffect(() => {
    // Clear previous
    if (prevSettledRef.current !== null) {
      const prev = document.querySelector(
        `[data-paragraph="${prevSettledRef.current}"]`,
      );
      if (prev) delete (prev as HTMLElement).dataset.threadActive;
    }
    // Set current
    if (settledIdx !== null) {
      const el = document.querySelector(
        `[data-paragraph="${settledIdx}"]`,
      );
      if (el) (el as HTMLElement).dataset.threadActive = "";
    }
    prevSettledRef.current = settledIdx;
  }, [settledIdx]);

  // Bottom sheet: get passages for the tapped paragraph
  const sheetChunkId =
    sheetIdx !== null ? paragraphChunkIds[sheetIdx] : null;
  const sheetPassages = sheetChunkId ? relations[sheetChunkId] ?? [] : [];

  const handleIndicatorTap = useCallback((idx: number) => {
    setSheetIdx(idx);
    setSheetOpen(true);
  }, []);

  // If no relations exist at all, render nothing (silence is a feature)
  const hasAnyRelations =
    Object.keys(relations).length > 0 || thread.length > 0;

  // Current reading context for thread memory
  const currentContext = {
    bookSlug,
    chapterNumber,
    chapterTitle,
    settledChunkId,
  };

  return (
    <>
      {/* Desktop side panel — visible at lg: */}
      <aside
        className="hidden lg:block lg:w-72 lg:shrink-0 lg:self-start lg:sticky lg:top-8 lg:py-8"
        data-no-focus
        data-no-present
        aria-label={t("relatedTeachings")}
      >
        <h3 className="mb-4 text-xs font-semibold tracking-wide text-srf-navy/40 uppercase">
          {t("relatedTeachings")}
        </h3>
        {/* Key change triggers CSS fade animation on content swap */}
        <div key={settledChunkId ?? "empty"} className="thread-panel-fade">
          <SidePanel
            passages={settledPassages}
            thread={hasAnyRelations ? thread : []}
            sourceText={sourceText}
            locale={locale}
            currentContext={currentContext}
          />
        </div>
      </aside>

      {/* Mobile/tablet: tap zone + bottom sheet */}
      {hasAnyRelations && (
        <>
          <ThreadTapZone onTap={handleIndicatorTap} />
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            ariaLabel={t("relatedTeachings")}
          >
            <SidePanel
              passages={sheetPassages}
              thread={thread}
              sourceText={null}
              locale={locale}
              currentContext={currentContext}
            />
          </BottomSheet>
        </>
      )}
    </>
  );
}
