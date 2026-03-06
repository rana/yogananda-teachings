"use client";

/**
 * ReaderPreferences — accessibility-first reading comfort controls.
 *
 * Font size (normal, large, larger) and line spacing (normal, relaxed,
 * spacious) applied via CSS classes on <html>. The design system's
 * preferences.css does the work; this component just toggles classes.
 *
 * Calm technology: functional register, no decorative animation.
 * Persists to localStorage. Client island — ~1 kB.
 *
 * Source CSS: yogananda-design/css/patterns/preferences.css
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";

type FontSize = "normal" | "large" | "larger";
type LineSpacing = "normal" | "relaxed" | "spacious";

const FONT_OPTIONS: { id: FontSize; label: string }[] = [
  { id: "normal", label: "A" },
  { id: "large", label: "A" },
  { id: "larger", label: "A" },
];

const LINE_OPTIONS: { id: LineSpacing; label: string }[] = [
  { id: "normal", label: "Tight" },
  { id: "relaxed", label: "Relaxed" },
  { id: "spacious", label: "Spacious" },
];

const STORAGE_KEY = "yogananda-reader-prefs";

function loadPrefs(): { fontSize: FontSize; lineSpacing: LineSpacing } {
  if (typeof window === "undefined") return { fontSize: "normal", lineSpacing: "normal" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { fontSize: "normal", lineSpacing: "normal" };
  } catch {
    return { fontSize: "normal", lineSpacing: "normal" };
  }
}

function savePrefs(fontSize: FontSize, lineSpacing: LineSpacing) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize, lineSpacing }));
  } catch {
    /* Storage full — graceful degradation */
  }
}

function applyToDOM(fontSize: FontSize, lineSpacing: LineSpacing) {
  // Scope to .chapter-body only — reader preferences affect only the
  // reading surface, not search results, homepage, or theme pages (FTR-041 §6).
  const target = document.querySelector<HTMLElement>(".chapter-body");
  if (!target) return;
  // Font size
  target.classList.remove("font-large", "font-larger");
  if (fontSize === "large") target.classList.add("font-large");
  if (fontSize === "larger") target.classList.add("font-larger");
  // Line spacing
  target.classList.remove("line-relaxed", "line-spacious");
  if (lineSpacing === "relaxed") target.classList.add("line-relaxed");
  if (lineSpacing === "spacious") target.classList.add("line-spacious");
}

export function ReaderPreferences() {
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>("normal");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Load from storage on mount
  useEffect(() => {
    const prefs = loadPrefs();
    setFontSize(prefs.fontSize);
    setLineSpacing(prefs.lineSpacing);
    applyToDOM(prefs.fontSize, prefs.lineSpacing);
  }, []);

  // Sync changes to DOM and storage
  useEffect(() => {
    applyToDOM(fontSize, lineSpacing);
    savePrefs(fontSize, lineSpacing);
  }, [fontSize, lineSpacing]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    },
    [open],
  );

  return (
    <div className="reader-prefs" ref={containerRef}>
      <button
        ref={triggerRef}
        className="reader-prefs-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Reading preferences"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 5a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H4Z" />
        </svg>
      </button>

      {open && (
        <div
          className="reader-prefs-menu"
          role="dialog"
          aria-label="Reading preferences"
          onKeyDown={handleKeyDown}
        >
          {/* Font size */}
          <fieldset className="reader-prefs-group">
            <legend className="reader-prefs-legend">Text size</legend>
            <div className="reader-prefs-options">
              {FONT_OPTIONS.map((opt, i) => (
                <button
                  key={opt.id}
                  className={`reader-prefs-font-btn${fontSize === opt.id ? " active" : ""}`}
                  onClick={() => setFontSize(opt.id)}
                  aria-pressed={fontSize === opt.id}
                  style={{ fontSize: `${0.75 + i * 0.25}rem` }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Line spacing */}
          <fieldset className="reader-prefs-group">
            <legend className="reader-prefs-legend">Line spacing</legend>
            <div className="reader-prefs-options">
              {LINE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`reader-prefs-line-btn${lineSpacing === opt.id ? " active" : ""}`}
                  onClick={() => setLineSpacing(opt.id)}
                  aria-pressed={lineSpacing === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Language */}
          <fieldset className="reader-prefs-group">
            <legend className="reader-prefs-legend">Language</legend>
            <div className="reader-prefs-options">
              {locales.map((loc) => {
                const current = window.location.pathname.split("/")[1];
                const isActive = current === loc;
                return (
                  <button
                    key={loc}
                    className={`reader-prefs-line-btn${isActive ? " active" : ""}`}
                    onClick={() => {
                      if (isActive) return;
                      const path = window.location.pathname;
                      const newPath = path.replace(/^\/[a-z]{2}(\/|$)/, `/${loc}$1`);
                      window.location.href = newPath || `/${loc}`;
                    }}
                    aria-pressed={isActive}
                  >
                    {localeNames[loc as Locale] || loc}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Reset */}
          <div className="reader-prefs-group" style={{ borderBlockStart: "1px solid color-mix(in oklch, var(--color-text), transparent 90%)", paddingBlockStart: "var(--space-compact)" }}>
            <button
              className="reader-prefs-line-btn"
              onClick={() => {
                try {
                  localStorage.clear();
                  setFontSize("normal");
                  setLineSpacing("normal");
                  applyToDOM("normal", "normal");
                  setOpen(false);
                } catch { /* noop */ }
              }}
              style={{ fontSize: "0.75rem", opacity: 0.6 }}
            >
              Reset all preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
