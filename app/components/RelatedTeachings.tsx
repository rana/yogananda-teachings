"use client";

/**
 * Related Teachings — M3c-3 (ADR-050, DES-006).
 *
 * The golden thread: surfaces cross-chapter connections as you read.
 * Desktop: sticky side panel that updates as you settle into a passage.
 * Mobile: golden lotus indicators in paragraph margins, bottom sheet on tap.
 *
 * Design principles:
 * - Settle, don't scan (1.2s debounce — spiritual design choice, not performance)
 * - Silence when appropriate (empty state is intentional white space)
 * - The technology disappears (batch-prefetched, zero client-side fetching)
 * - Surprise over similarity (contextual labels honor the spirit)
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import {
  SETTLED_PARAGRAPH_DEBOUNCE_MS,
  FOCUS_ZONE_ROOT_MARGIN,
  THREAD_MAX_DEPTH,
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
  bookId: string;
  chapterNumber: number;
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

// ── Thread Navigation Hook ──────────────────────────────────────

interface ThreadPosition {
  bookId: string;
  chapterNumber: number;
  scrollY: number;
}

function useThreadNavigation() {
  const [stack, setStack] = useState<ThreadPosition[]>([]);

  const push = useCallback(
    (pos: ThreadPosition) => {
      setStack((prev) => [...prev.slice(-THREAD_MAX_DEPTH + 1), pos]);
    },
    [],
  );

  const pop = useCallback(() => {
    const last = stack[stack.length - 1];
    setStack((prev) => prev.slice(0, -1));
    return last ?? null;
  }, [stack]);

  return { stack, push, pop, depth: stack.length };
}

// ── Passage Card ────────────────────────────────────────────────

function PassageCard({
  passage,
  locale,
}: {
  passage: RelatedPassage;
  locale: string;
}) {
  // Truncate content for display
  const displayContent =
    passage.content.length > 160
      ? passage.content.slice(0, 157) + "\u2026"
      : passage.content;

  return (
    <div className="group rounded-lg border border-srf-navy/8 bg-(--theme-surface) p-3 transition-colors hover:border-srf-gold/30">
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

      {/* Citation */}
      <footer className="flex items-center gap-1.5 text-xs text-srf-navy/45">
        <span>Ch. {passage.chapterNumber}</span>
        {passage.pageNumber && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>p. {passage.pageNumber}</span>
          </>
        )}
        <NextLink
          href={`/${locale}/books/${passage.bookTitle}/${passage.chapterNumber}`}
          className="ml-auto text-srf-gold/70 transition-colors hover:text-srf-gold min-h-[44px] inline-flex items-center"
        >
          Read
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
}: {
  passages: RelatedPassage[];
  thread: ThreadSuggestion[];
  sourceText: string | null;
  locale: string;
}) {
  if (passages.length === 0 && thread.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-srf-navy/25 italic">
          Settle into a passage
          <br />
          to discover connections
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
          <span className="font-medium text-srf-navy/50">Related to:</span>{" "}
          &ldquo;{truncatedSource}&rdquo;
        </p>
      )}

      {/* Related passage cards */}
      <div className="space-y-3">
        {passages.map((passage) => (
          <PassageCard key={passage.id} passage={passage} locale={locale} />
        ))}
      </div>

      {/* Continue the Thread — chapter-level connections */}
      {thread.length > 0 && (
        <div className="border-t border-srf-navy/8 pt-4">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-srf-navy/40 uppercase">
            Continue the Thread
          </h4>
          <ul className="space-y-1.5">
            {thread.map((t) => (
              <li key={`${t.bookId}-${t.chapterNumber}`}>
                <NextLink
                  href={`/${locale}/books/${t.bookId}/${t.chapterNumber}`}
                  className="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-sm text-srf-navy/60 transition-colors hover:bg-srf-gold/5 hover:text-srf-navy min-h-[44px]"
                >
                  <span className="shrink-0 text-xs text-srf-gold/50">
                    {t.connectionCount}
                  </span>
                  <span className="line-clamp-2">
                    Ch. {t.chapterNumber}: {t.chapterTitle}
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
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-srf-navy/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Related Teachings"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-srf-gold/20 bg-(--theme-surface) px-4 pb-8 pt-3 shadow-lg"
      >
        {/* Drag handle visual */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-srf-navy/15" />
        <h3 className="mb-3 text-sm font-semibold text-srf-navy/60">
          Related Teachings
        </h3>
        {children}
      </div>
    </>
  );
}

// ── Golden Thread Indicators ────────────────────────────────────

/**
 * Renders golden lotus bud indicators in the paragraph margin
 * for paragraphs that have related teachings.
 * Visible on mobile/tablet only (hidden on desktop where side panel shows).
 */
function ThreadIndicators({
  paragraphChunkIds,
  relations,
  onTap,
}: {
  paragraphChunkIds: string[];
  relations: Record<string, RelatedPassage[]>;
  onTap: (paragraphIndex: number) => void;
}) {
  const [positions, setPositions] = useState<
    { index: number; top: number }[]
  >([]);

  useEffect(() => {
    const update = () => {
      const newPositions: { index: number; top: number }[] = [];
      paragraphChunkIds.forEach((chunkId, i) => {
        if (!relations[chunkId] || relations[chunkId].length === 0) return;
        const el = document.querySelector(`[data-paragraph="${i}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        newPositions.push({
          index: i,
          top: rect.top + window.scrollY + 4, // 4px from top of paragraph
        });
      });
      setPositions(newPositions);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [paragraphChunkIds, relations]);

  if (positions.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-10 lg:hidden" aria-hidden="true">
      {positions.map((pos) => (
        <button
          key={pos.index}
          type="button"
          onClick={() => onTap(pos.index)}
          className="pointer-events-auto absolute left-1 h-6 w-6 rounded-full"
          style={{ top: pos.top }}
          aria-label={`Related teachings for paragraph ${pos.index + 1}`}
        >
          {/* Golden lotus bud — 8px circle */}
          <span className="block mx-auto h-2 w-2 rounded-full bg-srf-gold/60 transition-transform hover:scale-150" />
        </button>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function RelatedTeachings({
  relations,
  thread,
  paragraphChunkIds,
  bookId,
  chapterNumber,
  locale,
}: RelatedTeachingsProps) {
  const settledIdx = useSettledParagraph();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIdx, setSheetIdx] = useState<number | null>(null);
  const _threadNav = useThreadNavigation();

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

  return (
    <>
      {/* Desktop side panel — visible at lg: */}
      <aside
        className="hidden lg:block lg:w-72 lg:shrink-0 lg:self-start lg:sticky lg:top-8 lg:py-8"
        data-no-focus
        data-no-present
        aria-label="Related Teachings"
      >
        <h3 className="mb-4 text-xs font-semibold tracking-wide text-srf-navy/40 uppercase">
          Related Teachings
        </h3>
        <SidePanel
          passages={settledPassages}
          thread={hasAnyRelations ? thread : []}
          sourceText={sourceText}
          locale={locale}
        />
      </aside>

      {/* Mobile/tablet: golden thread indicators + bottom sheet */}
      {hasAnyRelations && (
        <>
          <ThreadIndicators
            paragraphChunkIds={paragraphChunkIds}
            relations={relations}
            onTap={handleIndicatorTap}
          />
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
          >
            <SidePanel
              passages={sheetPassages}
              thread={thread}
              sourceText={null}
              locale={locale}
            />
          </BottomSheet>
        </>
      )}
    </>
  );
}
