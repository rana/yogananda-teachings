"use client";

/**
 * Quiet Corner client component — M2a-3, M2a-14 (ADR-072).
 *
 * Affirmation display with optional timer and audio cues.
 * Self-contained: minimal chrome, no nav clutter.
 * Timer completion: chime → 3s stillness → crossfade to parting passage.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { singingBowl, templeBell } from "@/lib/sounds";
import type { DailyPassage } from "@/lib/services/passages";

const TIMER_OPTIONS = [
  { label: "timer1", seconds: 60 },
  { label: "timer5", seconds: 300 },
  { label: "timer15", seconds: 900 },
] as const;

interface Props {
  passage: DailyPassage | null;
}

export function QuietCornerClient({ passage: initial }: Props) {
  const t = useTranslations("quiet");
  const [passage, setPassage] = useState(initial);
  const [timerActive, setTimerActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Escape key stops active timer
  useEffect(() => {
    if (!timerActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTimerActive(false);
        setSecondsRemaining(0);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [timerActive]);

  const startTimer = useCallback((seconds: number) => {
    setTimerActive(true);
    setTimerComplete(false);
    setSecondsRemaining(seconds);

    // Singing bowl at start (M2a-14) — warm, shimmering
    singingBowl();

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
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

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTimerActive(false);
    setSecondsRemaining(0);
  }, []);

  const fetchAnother = useCallback(async () => {
    setLoading(true);
    setTimerComplete(false);
    try {
      const res = await fetch("/api/v1/passages/reflection");
      if (res.ok) {
        const json = await res.json();
        setPassage({
          id: json.data.id,
          slug: json.data.slug ?? json.data.id,
          content: json.data.content,
          bookId: json.data.citation.bookId,
          bookSlug: json.data.citation.bookSlug ?? json.data.citation.bookId,
          bookTitle: json.data.citation.book,
          bookAuthor: json.data.citation.author,
          chapterTitle: json.data.citation.chapter,
          chapterNumber: json.data.citation.chapterNumber,
          pageNumber: json.data.citation.page,
          language: json.data.language,
        });
      }
    } catch {
      // Keep current passage
    } finally {
      setLoading(false);
    }
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (!passage) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center">
        <p className="text-srf-navy/40 italic">No reflections available yet.</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center px-4"
      data-mode={timerActive ? "quiet" : undefined}
    >
      <div className="mx-auto max-w-xl text-center">
        {/* Title — fades when timer active */}
        {!timerActive && (
          <h1 className="mb-8 font-display text-lg text-srf-navy/40">
            {t("heading")}
          </h1>
        )}

        {/* Affirmation */}
        <blockquote className="text-lg leading-relaxed text-srf-navy md:text-xl md:leading-relaxed">
          &ldquo;{passage.content.trim()}&rdquo;
        </blockquote>

        {/* Attribution (PRI-02) — links to book chapter for context */}
        <footer className="mt-4 text-sm text-srf-navy/50">
          <cite className="not-italic">
            — {passage.bookAuthor},{" "}
            <Link
              href={`/books/${passage.bookSlug}/${passage.chapterNumber}`}
              className="underline decoration-srf-navy/20 underline-offset-2 transition-colors hover:text-srf-navy hover:decoration-srf-gold/40"
            >
              <em>{passage.bookTitle}</em>
              {passage.pageNumber && `, p. ${passage.pageNumber}`}
            </Link>
          </cite>
        </footer>

        {/* Timer */}
        {timerActive ? (
          <button
            onClick={stopTimer}
            className="mt-12 cursor-pointer border-none bg-transparent p-4"
            role="timer"
            aria-live="off"
            aria-label={t("timerRunning")}
          >
            <p className="font-sans text-3xl tabular-nums text-srf-navy/30" aria-label={`${Math.floor(secondsRemaining / 60)} minutes ${secondsRemaining % 60} seconds remaining`}>
              {formatTime(secondsRemaining)}
            </p>
            <p className="mt-3 text-xs text-srf-navy/20">{t("tapToEnd")}</p>
          </button>
        ) : timerComplete ? (
          <div className="mt-12 space-y-4" role="status" aria-live="polite">
            <p className="text-sm text-srf-gold">{t("timerComplete")}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchAnother}
                disabled={loading}
                className="min-h-11 rounded-lg border border-srf-navy/10 px-4 py-2 text-sm text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy"
              >
                {loading ? "..." : t("showAnother")}
              </button>
              <Link
                href="/"
                className="min-h-11 inline-flex items-center rounded-lg border border-srf-navy/10 px-4 py-2 text-sm text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy"
              >
                {t("backToPortal")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-4">
            <p className="text-xs text-srf-navy/30">{t("subtitle")}</p>
            <div className="flex justify-center gap-3">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.seconds}
                  onClick={() => startTimer(opt.seconds)}
                  className="min-h-11 rounded-lg border border-srf-navy/10 px-4 py-2 text-sm text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy"
                >
                  {t(opt.label)}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAnother}
              disabled={loading}
              className="min-h-11 text-sm text-srf-navy/40 hover:text-srf-navy/60"
            >
              {loading ? "..." : t("showAnother")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

