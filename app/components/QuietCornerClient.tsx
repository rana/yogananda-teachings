"use client";

/**
 * Quiet Corner client component — M2a-3, M2a-14 (ADR-072).
 *
 * Affirmation display with optional timer and audio cues.
 * Self-contained: minimal chrome, no nav clutter.
 * Timer completion: chime -> 3s stillness -> crossfade to parting passage.
 *
 * Uses DesignProvider's setMode("quiet") when timer is active —
 * the design system's CSS hides header/footer/nav for full immersion.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { singingBowl, templeBell } from "@/lib/sounds";
import { useDesign } from "@/app/components/design/DesignProvider";
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
  const { setMode } = useDesign();
  const [passage, setPassage] = useState(initial);
  const [timerActive, setTimerActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timer and mode on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setMode("normal");
    };
  }, [setMode]);

  // Sync quiet mode with DesignProvider
  useEffect(() => {
    setMode(timerActive ? "quiet" : "normal");
  }, [timerActive, setMode]);

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
      <div className="quiet-layout">
        <p style={{ color: "var(--color-text-secondary)", opacity: 0.4, fontStyle: "italic" }}>
          No reflections available yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="quiet-layout"
      style={timerActive ? { cursor: "pointer" } : undefined}
      onClick={timerActive ? stopTimer : undefined}
    >
      <div className="quiet-content">
        {/* Title — hidden when timer active */}
        {!timerActive && (
          <h1 style={{
            marginBlockEnd: "var(--space-generous)",
            fontFamily: "var(--font-display)",
            fontSize: "1.125rem",
            color: "var(--color-text-secondary)",
            opacity: 0.4,
          }}>
            {t("heading")}
          </h1>
        )}

        {/* Affirmation */}
        <blockquote className="passage-quote" style={{ fontSize: "1.125rem" }}>
          &ldquo;{passage.content.trim()}&rdquo;
        </blockquote>

        {/* Attribution (PRI-02) — links to book chapter for context */}
        <footer className="passage-citation" style={{ marginBlockStart: "var(--space-default)" }}>
          <cite style={{ fontStyle: "normal" }}>
            — {passage.bookAuthor},{" "}
            <Link href={`/books/${passage.bookSlug}/${passage.chapterNumber}`}>
              <em>{passage.bookTitle}</em>
              {passage.pageNumber && `, p. ${passage.pageNumber}`}
            </Link>
          </cite>
        </footer>

        {/* Timer */}
        {timerActive ? (
          <div
            style={{ marginBlockStart: "var(--space-spacious)", padding: "var(--space-default)" }}
            role="timer"
            aria-live="off"
            aria-label={t("timerRunning")}
          >
            <p
              className="quiet-timer-display"
              aria-label={`${Math.floor(secondsRemaining / 60)} minutes ${secondsRemaining % 60} seconds remaining`}
            >
              {formatTime(secondsRemaining)}
            </p>
            <p style={{
              marginBlockStart: "var(--space-compact)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              opacity: 0.2,
            }}>
              {t("tapToEnd")}
            </p>
          </div>
        ) : timerComplete ? (
          <div
            className="stack-tight"
            role="status"
            aria-live="polite"
            style={{ marginBlockStart: "var(--space-spacious)" }}
          >
            <p style={{ fontSize: "0.875rem", color: "var(--color-gold)" }}>{t("timerComplete")}</p>
            <div className="cluster" style={{ justifyContent: "center" }}>
              <button onClick={fetchAnother} disabled={loading} className="btn-secondary">
                {loading ? "..." : t("showAnother")}
              </button>
              <Link href="/" className="btn-secondary">
                {t("backToPortal")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="stack-tight" style={{ marginBlockStart: "var(--space-spacious)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", opacity: 0.3 }}>
              {t("subtitle")}
            </p>
            <div className="cluster" style={{ justifyContent: "center" }}>
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.seconds}
                  onClick={() => startTimer(opt.seconds)}
                  className="btn-secondary"
                >
                  {t(opt.label)}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAnother}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                opacity: 0.4,
                cursor: "pointer",
              }}
            >
              {loading ? "..." : t("showAnother")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
