"use client";

/**
 * SitePreferences — unified site settings panel in the header.
 *
 * Three sections:
 *   Language  — locale navigation (URL-based, not localStorage)
 *   Atmosphere — SRF (6) + YSS (5) theme swatches
 *   Your Data — "Start fresh" clears all localStorage
 *
 * Replaces the standalone ThemeSwitcher. Calm technology:
 * functional register, no decorative animation, no attention hooks.
 * Client island — ~3 kB. Full keyboard navigation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDesign } from "./DesignProvider";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { clearAllData } from "@/lib/services/storage-clear";

/* ── Theme definitions ─────────────────────────────────────────── */

const ALL_THEMES = [
  { id: "light", label: "Light", org: "srf" },
  { id: "sepia", label: "Sepia", org: "srf" },
  { id: "earth", label: "Earth", org: "srf" },
  { id: "dark", label: "Dark", org: "srf" },
  { id: "meditate", label: "Meditate", org: "srf" },
  { id: "gathering", label: "Gathering", org: "srf" },
  { id: "ashram", label: "Ashram", org: "yss" },
  { id: "sandstone", label: "Sandstone", org: "yss" },
  { id: "night", label: "Night", org: "yss" },
  { id: "devotion", label: "Devotion", org: "yss" },
] as const;

type ThemeId = (typeof ALL_THEMES)[number]["id"];

export function SitePreferences() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const { org, theme, setOrg, setTheme } = useDesign();

  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* ── Close on outside click ──────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setConfirmClear(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  /* ── Close on Escape ─────────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        setConfirmClear(false);
        triggerRef.current?.focus();
      }
    },
    [open],
  );

  /* ── Theme selection ─────────────────────────────────────────── */
  function selectTheme(id: ThemeId) {
    const entry = ALL_THEMES.find((t) => t.id === id);
    if (entry && org !== entry.org) {
      setOrg(entry.org);
    }
    setTheme(id);
  }

  /* ── Clear all data ──────────────────────────────────────────── */
  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearAllData();
    setConfirmClear(false);
    setOpen(false);
    window.location.reload();
  }

  /* ── Language path builder ───────────────────────────────────── */
  function localePath(targetLocale: Locale): string {
    if (typeof window === "undefined") return `/${targetLocale}`;
    const path = window.location.pathname;
    // Strip current locale prefix if present
    const stripped = path.replace(/^\/(en|es)(\/|$)/, "/");
    const clean = stripped === "" ? "/" : stripped;
    if (targetLocale === "en") return clean;
    return `/${targetLocale}${clean === "/" ? "" : clean}`;
  }

  return (
    <div className="site-prefs" ref={containerRef}>
      <button
        ref={triggerRef}
        className="site-prefs-trigger"
        onClick={() => {
          setOpen((prev) => !prev);
          setConfirmClear(false);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("label")}
      >
        {/* Settings gear — 18x18, stroke 1.5, matches codebase SVG style */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          className="site-prefs-panel"
          role="dialog"
          aria-label={t("label")}
          onKeyDown={handleKeyDown}
        >
          {/* ── Language ──────────────────────────────────────── */}
          <fieldset className="site-prefs-section">
            <legend className="site-prefs-legend">{t("language")}</legend>
            <div className="site-prefs-languages">
              {locales.map((loc) => (
                <a
                  key={loc}
                  href={localePath(loc)}
                  className={`site-prefs-lang${locale === loc ? " active" : ""}`}
                  aria-current={locale === loc ? "true" : undefined}
                >
                  {localeNames[loc]}
                </a>
              ))}
            </div>
          </fieldset>

          {/* ── Atmosphere ────────────────────────────────────── */}
          <fieldset className="site-prefs-section">
            <legend className="site-prefs-legend">
              {t("atmosphere")}
            </legend>
            <div className="site-prefs-swatches">
              {ALL_THEMES.map((th) => (
                <button
                  key={th.id}
                  className={`site-prefs-swatch-btn${theme === th.id ? " active" : ""}`}
                  onClick={() => selectTheme(th.id)}
                  aria-pressed={theme === th.id}
                  aria-label={th.label}
                  title={th.label}
                >
                  <span
                    className="theme-swatch"
                    data-theme-preview={th.id}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          {/* ── Your Data ─────────────────────────────────────── */}
          <fieldset className="site-prefs-section site-prefs-data">
            <legend className="site-prefs-legend">{t("yourData")}</legend>
            <p className="site-prefs-note">{t("yourDataNote")}</p>
            <button
              className={`site-prefs-clear${confirmClear ? " confirm" : ""}`}
              onClick={handleClear}
            >
              {confirmClear ? t("confirmPrompt") : t("startFresh")}
            </button>
          </fieldset>
        </div>
      )}
    </div>
  );
}
