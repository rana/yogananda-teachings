/**
 * Contextual Quiet Corner — M2b-7 (ADR-072, DES-009).
 *
 * "Pause with this" integration into the chapter reader's dwell mode.
 * When a paragraph is focused via dwell, shows a button to enter an
 * in-place contemplation experience with timer and singing bowl audio.
 *
 * 44x44px minimum touch targets (PRI-07).
 * DELTA-compliant: no tracking, no analytics (PRI-09).
 * Calm technology: the portal waits, it does not interrupt (PRI-08).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { addPassageBookmark } from "@/lib/services/bookmarks";
import { singingBowl, templeBell } from "@/lib/sounds";

// ── Constants ──────────────────────────────────────────────────────

const TIMER_OPTIONS = [
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
] as const;

// ── Types ──────────────────────────────────────────────────────────

interface ContextualQuietProps {
  /** Book metadata for passage bookmark (PRI-02: full attribution) */
  bookId: string;
  bookSlug?: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
}

// ── Component ──────────────────────────────────────────────────────

export function ContextualQuiet({
  bookId,
  bookSlug,
  bookTitle,
  chapterNumber,
  chapterTitle,
}: ContextualQuietProps) {
  const t = useTranslations("reader");

  const [dwellActive, setDwellActive] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetTextRef = useRef<string>("");
  const targetIdRef = useRef<string>("");

  // ── Observe dwell mode activation ──────────────────────────────

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const observer = new MutationObserver(() => {
      const isActive = article.hasAttribute("data-dwell-active");
      setDwellActive(isActive);

      if (isActive) {
        const target = article.querySelector("[data-dwell-target]");
        if (target) {
          targetTextRef.current = target.textContent || "";
          targetIdRef.current = target.id || "";
        }
      }
      // Quiet mode manages its own lifecycle — dwell deactivation
      // should not force-exit quiet mode (the user chose to pause).
    });

    observer.observe(article, {
      attributes: true,
      attributeFilter: ["data-dwell-active"],
      subtree: true,
    });

    // Check initial state
    if (article.hasAttribute("data-dwell-active")) {
      setDwellActive(true);
      const target = article.querySelector("[data-dwell-target]");
      if (target) {
        targetTextRef.current = target.textContent || "";
        targetIdRef.current = target.id || "";
      }
    }

    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer cleanup ──────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Escape key exits quiet mode ────────────────────────────────

  useEffect(() => {
    if (!quietMode) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        exitQuietMode();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quietMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Enter quiet mode ───────────────────────────────────────────

  const enterQuietMode = useCallback(() => {
    const main = document.querySelector("main");
    if (main) {
      main.setAttribute("data-mode", "quiet");
    }
    setQuietMode(true);
    setTimerActive(false);
    setTimerComplete(false);
    setBookmarked(false);
    // Cleanly transition out of dwell — quiet mode takes over
    window.dispatchEvent(new CustomEvent("srf:dwell-exit"));
  }, []);

  // ── Exit quiet mode ────────────────────────────────────────────

  const exitQuietMode = useCallback(() => {
    const main = document.querySelector("main");
    if (main) {
      main.removeAttribute("data-mode");
    }
    setQuietMode(false);
    setTimerActive(false);
    setTimerComplete(false);
    setSecondsRemaining(0);
    setBookmarked(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Start timer ────────────────────────────────────────────────

  const startTimer = useCallback((seconds: number) => {
    setTimerActive(true);
    setTimerComplete(false);
    setSecondsRemaining(seconds);

    // Singing bowl at start — warm, shimmering
    singingBowl();

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Temple bell at end — clear, hopeful
          templeBell();
          setTimerActive(false);
          setTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Bookmark passage ───────────────────────────────────────────

  const bookmarkPassage = useCallback(() => {
    addPassageBookmark({
      passageId: targetIdRef.current || `p-${Date.now()}`,
      content: targetTextRef.current,
      bookId,
      bookSlug,
      bookTitle,
      chapterNumber,
      chapterTitle,
      pageNumber: null,
    });
    setBookmarked(true);
  }, [bookId, bookSlug, bookTitle, chapterNumber, chapterTitle]);

  // ── Dismiss dwell mode (dispatches event to DwellMode) ─────────

  const dismissDwell = useCallback(() => {
    window.dispatchEvent(new CustomEvent("srf:dwell-exit"));
  }, []);

  // ── Format timer ───────────────────────────────────────────────

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Render ─────────────────────────────────────────────────────

  // Show nothing when dwell is not active
  if (!dwellActive && !quietMode) {
    return null;
  }

  // In quiet mode: show the timer UI overlay
  if (quietMode) {
    return (
      <div
        role="dialog"
        aria-label={t("pauseWithThis")}
        data-testid="contextual-quiet"
        data-dwell-ui
        className={`fixed inset-0 z-40 flex items-center justify-center px-4${timerActive ? " cursor-pointer" : ""}`}
        style={{ background: "var(--color-warm-cream)" }}
        onClick={timerActive ? exitQuietMode : (e) => e.stopPropagation()}
        onTouchEnd={timerActive ? () => exitQuietMode() : (e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-xl text-center">
          {/* The dwelled passage as affirmation */}
          <blockquote className="text-lg leading-relaxed text-srf-navy md:text-xl md:leading-relaxed">
            &ldquo;{targetTextRef.current.trim()}&rdquo;
          </blockquote>

          {/* Timer section */}
          {timerActive ? (
            <div
              className="mt-12 p-4"
              role="timer"
              aria-live="off"
              aria-label={formatTime(secondsRemaining)}
            >
              <p
                className="font-sans text-3xl tabular-nums text-srf-navy/30"
                aria-label={`${Math.floor(secondsRemaining / 60)} minutes ${secondsRemaining % 60} seconds remaining`}
              >
                {formatTime(secondsRemaining)}
              </p>
              <p className="mt-3 text-xs text-srf-navy/20">{t("quietTapToEnd")}</p>
            </div>
          ) : timerComplete ? (
            <div
              className="mt-12 space-y-4"
              role="status"
              aria-live="polite"
              data-testid="quiet-complete"
            >
              <div className="flex justify-center gap-3">
                <button
                  onClick={bookmarkPassage}
                  disabled={bookmarked}
                  className="min-h-[44px] min-w-[44px] rounded-lg border border-srf-navy/10 px-4 py-2 text-sm text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy disabled:opacity-40"
                  data-testid="quiet-bookmark"
                >
                  {bookmarked ? "\u2713" : t("quietBookmark")}
                </button>
                <button
                  onClick={exitQuietMode}
                  className="min-h-[44px] min-w-[44px] rounded-lg border border-srf-navy/10 px-4 py-2 text-sm text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy"
                  data-testid="quiet-return"
                >
                  {t("quietReturn")}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-12 space-y-4">
              <div className="flex justify-center gap-3">
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.seconds}
                    onClick={() => startTimer(opt.seconds)}
                    className="min-h-[44px] min-w-[44px] rounded-lg border border-srf-navy/10 px-4 py-2 text-sm text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Screen reader announcement for mode */}
        <div aria-live="polite" className="sr-only" data-testid="quiet-announcer">
          {timerComplete ? t("quietReturn") : ""}
        </div>
      </div>
    );
  }

  // Dwell active but not in quiet mode: show the "Pause with this" button + dismiss
  return (
    <div
      className="fixed inset-x-0 bottom-8 z-30 flex items-center justify-center gap-3"
      data-testid="pause-with-this-container"
      data-dwell-ui
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <button
        onClick={enterQuietMode}
        className="min-h-[44px] min-w-[44px] rounded-full border border-srf-gold/30 bg-warm-cream px-5 py-2.5 text-sm text-srf-navy/70 shadow-sm transition-colors hover:border-srf-gold/60 hover:text-srf-navy"
        aria-label={t("pauseWithThis")}
        data-testid="pause-with-this"
      >
        <span aria-hidden="true" className="me-1.5">
          &#9673;
        </span>
        {t("pauseWithThis")}
      </button>
      <button
        onClick={dismissDwell}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-srf-navy/10 bg-warm-cream text-srf-navy/40 shadow-sm transition-colors hover:border-srf-navy/30 hover:text-srf-navy/70"
        aria-label={t("dwellExit")}
        data-testid="dwell-dismiss"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          data-ui
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

