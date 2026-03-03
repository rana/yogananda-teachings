/**
 * Reader settings popover — M2a-11.
 *
 * Unified reader preferences: text-only mode, color theme, font size, language.
 * Replaces standalone LanguageSwitcher in Header and TextOnlyToggle in Footer.
 * Uses the preferences service (PRI-10: zero framework imports in /lib/services/).
 * WCAG 2.1 AA: focus trap, Escape close, aria-modal, 44px touch targets (PRI-07).
 * DELTA-compliant: all preferences stay on-device in localStorage (PRI-09).
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeNames } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import {
  getPreference,
  setPreference,
  type FontSize,
  type ColorTheme,
  type LineSpacing,
} from "@/lib/services/preferences";

// ── Font size CSS class mapping ───────────────────────────────────

const FONT_SIZE_CLASSES: Record<FontSize, string | null> = {
  default: null,
  large: "font-large",
  larger: "font-larger",
};

const LINE_SPACING_CLASSES: Record<LineSpacing, string | null> = {
  default: null,
  relaxed: "line-relaxed",
  spacious: "line-spacious",
};

/** Apply the font-size class to <html>, removing any previous one. */
function applyFontSizeClass(size: FontSize): void {
  const html = document.documentElement;
  // Remove all font-size classes first
  for (const cls of Object.values(FONT_SIZE_CLASSES)) {
    if (cls) html.classList.remove(cls);
  }
  // Add the new one (if not default)
  const cls = FONT_SIZE_CLASSES[size];
  if (cls) html.classList.add(cls);
}

/** Apply the line-spacing class to <html>, removing any previous one. */
function applyLineSpacingClass(spacing: LineSpacing): void {
  const html = document.documentElement;
  for (const cls of Object.values(LINE_SPACING_CLASSES)) {
    if (cls) html.classList.remove(cls);
  }
  const cls = LINE_SPACING_CLASSES[spacing];
  if (cls) html.classList.add(cls);
}

export function ReaderSettings() {
  const t = useTranslations("settings");
  const t2 = useTranslations("reader");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("default");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("auto");
  const [lineSpacing, setLineSpacingState] = useState<LineSpacing>("default");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Load persisted preferences on mount ───────────────────────

  useEffect(() => {
    const storedTextOnly = getPreference("text-only-mode");
    const storedFontSize = getPreference("font-size");
    const storedTheme = getPreference("color-theme");
    const storedSpacing = getPreference("line-spacing");

    setTextOnly(storedTextOnly);
    setFontSize(storedFontSize);
    setColorThemeState(storedTheme);
    setLineSpacingState(storedSpacing);

    // Apply classes that may have been set before this component mounted
    if (storedTextOnly) {
      document.documentElement.classList.add("text-only");
    }
    applyFontSizeClass(storedFontSize);
    applyLineSpacingClass(storedSpacing);
  }, []);

  // ── Click-outside handler ─────────────────────────────────────

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Keyboard handler (Escape + focus trap) ────────────────────

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      // Focus trap within the panel
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // ── Focus first element on open ───────────────────────────────

  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [open]);

  // ── Handlers ──────────────────────────────────────────────────

  const toggleTextOnly = useCallback(() => {
    const next = !textOnly;
    setTextOnly(next);
    setPreference("text-only-mode", next);
    if (next) {
      document.documentElement.classList.add("text-only");
    } else {
      document.documentElement.classList.remove("text-only");
    }
  }, [textOnly]);

  const changeFontSize = useCallback((size: FontSize) => {
    setFontSize(size);
    setPreference("font-size", size);
    applyFontSizeClass(size);
  }, []);

  const changeColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    setPreference("color-theme", theme);
  }, []);

  const changeLineSpacing = useCallback((spacing: LineSpacing) => {
    setLineSpacingState(spacing);
    setPreference("line-spacing", spacing);
    applyLineSpacingClass(spacing);
  }, []);

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      router.replace(pathname, { locale: newLocale });
    },
    [router, pathname]
  );

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // ── Font size options ─────────────────────────────────────────

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: "default", label: t("fontDefault") },
    { value: "large", label: t("fontLarge") },
    { value: "larger", label: t("fontLarger") },
  ];

  // ── Line spacing options ──────────────────────────────────────

  const lineSpacingOptions: { value: LineSpacing; label: string }[] = [
    { value: "default", label: t("spacingDefault") },
    { value: "relaxed", label: t("spacingRelaxed") },
    { value: "spacious", label: t("spacingSpacious") },
  ];

  // ── Color theme options ───────────────────────────────────────

  const colorThemeOptions: { value: ColorTheme; label: string }[] = [
    { value: "auto", label: t2("theme_auto") },
    { value: "light", label: t2("theme_light") },
    { value: "sepia", label: t2("theme_sepia") },
    { value: "dark", label: t2("theme_dark") },
    { value: "meditate", label: t2("theme_meditate") },
  ];

  return (
    <div className="relative">
      {/* Trigger button — 44×44px minimum touch target (PRI-07) */}
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-srf-navy/60 transition-colors hover:text-srf-navy"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("label")}
      >
        {/* Gear icon — minimal, calm (PRI-08) */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="2.5" />
          <path d="M13.3 10.2a1.1 1.1 0 0 0 .2 1.2l.04.04a1.33 1.33 0 1 1-1.88 1.88l-.04-.04a1.1 1.1 0 0 0-1.2-.22 1.1 1.1 0 0 0-.67 1.01v.11a1.33 1.33 0 1 1-2.67 0v-.06a1.1 1.1 0 0 0-.72-1.01 1.1 1.1 0 0 0-1.2.22l-.04.04a1.33 1.33 0 1 1-1.88-1.88l.04-.04a1.1 1.1 0 0 0 .22-1.2 1.1 1.1 0 0 0-1.01-.67h-.11a1.33 1.33 0 1 1 0-2.67h.06a1.1 1.1 0 0 0 1.01-.72 1.1 1.1 0 0 0-.22-1.2l-.04-.04A1.33 1.33 0 1 1 5.1 3.26l.04.04a1.1 1.1 0 0 0 1.2.22h.05a1.1 1.1 0 0 0 .67-1.01v-.11a1.33 1.33 0 1 1 2.67 0v.06a1.1 1.1 0 0 0 .67 1.01 1.1 1.1 0 0 0 1.2-.22l.04-.04a1.33 1.33 0 1 1 1.88 1.88l-.04.04a1.1 1.1 0 0 0-.22 1.2v.05a1.1 1.1 0 0 0 1.01.67h.11a1.33 1.33 0 0 1 0 2.67h-.06a1.1 1.1 0 0 0-1.01.67Z" />
        </svg>
      </button>

      {/* Popover panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("label")}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-srf-navy/10 bg-warm-cream p-4 shadow-lg"
        >
          {/* ── Text-only mode ──────────────────────────────────── */}
          <div className="mb-4">
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-medium text-srf-navy">
                  {t("textOnly")}
                </span>
                <span className="block text-xs text-srf-navy/50">
                  {t("textOnlyDescription")}
                </span>
              </div>
              <button
                role="switch"
                aria-checked={textOnly}
                onClick={toggleTextOnly}
                className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors ${
                  textOnly ? "bg-srf-gold" : "bg-srf-navy/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    textOnly ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* ── Color theme ─────────────────────────────────────── */}
          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-medium text-srf-navy">
              {t2("colorTheme")}
            </legend>
            <div className="flex flex-wrap gap-1">
              {colorThemeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeColorTheme(option.value)}
                  className={`min-h-[44px] flex-1 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    colorTheme === option.value
                      ? "bg-srf-navy text-warm-cream"
                      : "bg-srf-navy/5 text-srf-navy/60 hover:bg-srf-navy/10 hover:text-srf-navy"
                  }`}
                  aria-pressed={colorTheme === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ── Font size ───────────────────────────────────────── */}
          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-medium text-srf-navy">
              {t("fontSize")}
            </legend>
            <div className="flex gap-1">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeFontSize(option.value)}
                  className={`min-h-[44px] flex-1 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    fontSize === option.value
                      ? "bg-srf-navy text-warm-cream"
                      : "bg-srf-navy/5 text-srf-navy/60 hover:bg-srf-navy/10 hover:text-srf-navy"
                  }`}
                  aria-pressed={fontSize === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ── Line spacing ───────────────────────────────────────── */}
          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-medium text-srf-navy">
              {t("lineSpacing")}
            </legend>
            <div className="flex gap-1">
              {lineSpacingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeLineSpacing(option.value)}
                  className={`min-h-[44px] flex-1 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    lineSpacing === option.value
                      ? "bg-srf-navy text-warm-cream"
                      : "bg-srf-navy/5 text-srf-navy/60 hover:bg-srf-navy/10 hover:text-srf-navy"
                  }`}
                  aria-pressed={lineSpacing === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ── Language ─────────────────────────────────────────── */}
          <div className="mb-4">
            <label
              htmlFor="reader-language"
              className="mb-2 block text-sm font-medium text-srf-navy"
            >
              {t("language")}
            </label>
            <select
              id="reader-language"
              value={locale}
              onChange={(e) => switchLocale(e.target.value as Locale)}
              className="min-h-[44px] w-full cursor-pointer rounded-md border border-srf-navy/10 bg-transparent px-3 py-2 text-sm text-srf-navy focus:border-srf-gold focus:outline-none"
            >
              {locales.map((loc) => (
                <option key={loc} value={loc}>
                  {localeNames[loc]}
                </option>
              ))}
            </select>
          </div>

          {/* ── Keyboard shortcuts ────────────────────────────────── */}
          <div className="border-t border-srf-navy/10 pt-3">
            <p className="mb-2 text-sm font-medium text-srf-navy">
              {t2("keyboardHelp")}
            </p>
            <p className="mb-2 text-[11px] text-srf-navy/40">
              {t("keyboardNote")}
            </p>
            <dl className="space-y-1 text-xs text-srf-navy/70">
              {[
                ["j / k", t2("keyHelp_paragraph")],
                ["\u2190 / \u2192", t2("keyHelp_chapter")],
                ["/", t2("keyHelp_search")],
                ["d", t2("keyHelp_dwell")],
                ["b", t2("keyHelp_bookmark")],
                ["Esc", t2("keyHelp_escape")],
                ["?", t2("keyHelp_help")],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-baseline gap-2">
                  <dt className="w-12 shrink-0 text-end font-mono text-[10px] text-srf-navy/40">
                    {key}
                  </dt>
                  <dd>{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
