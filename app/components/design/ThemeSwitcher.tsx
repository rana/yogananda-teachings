"use client";

/**
 * ThemeSwitcher — atmosphere selector.
 *
 * Each theme is a place: the library at dawn (light), aged manuscript
 * (sepia), ashram earth (earth), meditation room at dusk (dark),
 * deep contemplation (meditate), the warmth of welcome (gathering).
 *
 * Functional register. Calm technology: no decorative animation,
 * no attention-demanding UI. The seeker chooses an atmosphere;
 * the portal responds.
 *
 * Client island — ~1 kB. Full keyboard navigation (roving tabindex).
 */

import { useDesign } from "./DesignProvider";
import { useRef, useState, useEffect, useCallback } from "react";

const SRF_THEMES = [
  { id: "light", label: "Light" },
  { id: "sepia", label: "Sepia" },
  { id: "earth", label: "Earth" },
  { id: "dark", label: "Dark" },
  { id: "meditate", label: "Meditate" },
  { id: "gathering", label: "Gathering" },
] as const;

type ThemeId = (typeof SRF_THEMES)[number]["id"];

export function ThemeSwitcher() {
  const { theme, setTheme } = useDesign();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const currentIndex = SRF_THEMES.findIndex((t) => t.id === theme);

  /* ── Close on outside click ──────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  /* ── Keyboard navigation ─────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;

      const focusedIndex = optionsRef.current.findIndex(
        (el) => el === document.activeElement
      );

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
        case "ArrowRight": {
          e.preventDefault();
          const next = (focusedIndex + 1) % SRF_THEMES.length;
          optionsRef.current[next]?.focus();
          break;
        }
        case "ArrowUp":
        case "ArrowLeft": {
          e.preventDefault();
          const prev =
            (focusedIndex - 1 + SRF_THEMES.length) % SRF_THEMES.length;
          optionsRef.current[prev]?.focus();
          break;
        }
        case "Home": {
          e.preventDefault();
          optionsRef.current[0]?.focus();
          break;
        }
        case "End": {
          e.preventDefault();
          optionsRef.current[SRF_THEMES.length - 1]?.focus();
          break;
        }
      }
    },
    [open]
  );

  /* ── Focus current theme when opening ────────────────────────── */
  useEffect(() => {
    if (open && currentIndex >= 0) {
      // Small delay to let the DOM render
      requestAnimationFrame(() => {
        optionsRef.current[currentIndex]?.focus();
      });
    }
  }, [open, currentIndex]);

  function selectTheme(id: ThemeId) {
    setTheme(id);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="theme-switcher" ref={containerRef}>
      <button
        ref={triggerRef}
        className="theme-switcher-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Theme: ${theme}. Change theme.`}
      >
        <span className="theme-swatch" data-theme-preview={theme} />
      </button>

      {open && (
        <div
          className="theme-switcher-menu"
          role="listbox"
          aria-label="Choose atmosphere"
          onKeyDown={handleKeyDown}
        >
          {SRF_THEMES.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                optionsRef.current[i] = el;
              }}
              role="option"
              aria-selected={theme === t.id}
              className={`theme-switcher-option${theme === t.id ? " active" : ""}`}
              tabIndex={theme === t.id ? 0 : -1}
              onClick={() => selectTheme(t.id)}
            >
              <span className="theme-swatch" data-theme-preview={t.id} />
              <span className="theme-switcher-label">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
