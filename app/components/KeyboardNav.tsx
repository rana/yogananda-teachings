/**
 * Keyboard-first reading navigation — M2b-2 (DES-013).
 *
 * Single-key shortcuts for the chapter reader:
 *   j/k — next/previous paragraph
 *   →/← — next/previous chapter
 *   / — focus search bar
 *   d — toggle dwell mode on focused paragraph
 *   b — toggle bookmark for current chapter
 *   ? — keyboard help overlay
 *
 * Suppressed when input/textarea/select is focused.
 * No visual output — this is a behavior-only component.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface KeyboardNavProps {
  bookId: string;
  prevChapter: number | null;
  nextChapter: number | null;
  locale: string;
}

export function KeyboardNav({
  bookId,
  prevChapter,
  nextChapter,
  locale,
}: KeyboardNavProps) {
  const router = useRouter();
  const t = useTranslations("reader");
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Suppress when typing in form elements
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

      // Close help on Escape
      if (e.key === "Escape" && showHelp) {
        e.preventDefault();
        setShowHelp(false);
        return;
      }

      switch (e.key) {
        case "j": {
          // Next paragraph
          e.preventDefault();
          const current = document.querySelector("[data-paragraph].kb-focus");
          const allParas = document.querySelectorAll("[data-paragraph]");
          if (allParas.length === 0) return;

          let nextIdx = 0;
          if (current) {
            const currentIdx = Array.from(allParas).indexOf(current);
            nextIdx = Math.min(currentIdx + 1, allParas.length - 1);
            current.classList.remove("kb-focus");
          }
          const target = allParas[nextIdx] as HTMLElement;
          target.classList.add("kb-focus");
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
        case "k": {
          // Previous paragraph
          e.preventDefault();
          const current = document.querySelector("[data-paragraph].kb-focus");
          const allParas = document.querySelectorAll("[data-paragraph]");
          if (allParas.length === 0) return;

          let prevIdx = 0;
          if (current) {
            const currentIdx = Array.from(allParas).indexOf(current);
            prevIdx = Math.max(currentIdx - 1, 0);
            current.classList.remove("kb-focus");
          }
          const target = allParas[prevIdx] as HTMLElement;
          target.classList.add("kb-focus");
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
        case "ArrowRight": {
          if (nextChapter !== null) {
            e.preventDefault();
            router.push(`/books/${bookId}/${nextChapter}`);
          }
          break;
        }
        case "ArrowLeft": {
          if (prevChapter !== null) {
            e.preventDefault();
            router.push(`/books/${bookId}/${prevChapter}`);
          }
          break;
        }
        case "/": {
          e.preventDefault();
          const searchInput = document.querySelector(
            'input[type="search"], input[name="q"]',
          ) as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
          } else {
            router.push("/search");
          }
          break;
        }
        case "d": {
          // Toggle dwell on focused paragraph
          e.preventDefault();
          const focused = document.querySelector("[data-paragraph].kb-focus");
          if (focused) {
            const idx = parseInt(
              focused.getAttribute("data-paragraph") || "0",
              10,
            );
            // Dispatch custom event for DwellMode to listen to
            window.dispatchEvent(
              new CustomEvent("srf:dwell-toggle", { detail: { index: idx } }),
            );
          }
          break;
        }
        case "b": {
          // Toggle bookmark — click the BookmarkButton
          e.preventDefault();
          const btn = document.querySelector(
            '[data-testid="bookmark-button"]',
          ) as HTMLButtonElement | null;
          if (btn) btn.click();
          break;
        }
        case "?": {
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
        }
      }
    },
    [bookId, prevChapter, nextChapter, router, showHelp],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  // Keyboard help overlay
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("keyboardHelp")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-srf-navy/50"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="mx-4 max-w-sm rounded-lg bg-warm-cream p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-display text-lg text-srf-navy">
          {t("keyboardHelp")}
        </h2>
        <dl className="space-y-2 text-sm text-srf-navy">
          {[
            ["j / k", t("keyHelp_paragraph")],
            ["\u2190 / \u2192", t("keyHelp_chapter")],
            ["/", t("keyHelp_search")],
            ["d", t("keyHelp_dwell")],
            ["b", t("keyHelp_bookmark")],
            ["Esc", t("keyHelp_escape")],
            ["?", t("keyHelp_help")],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-end font-mono text-xs text-srf-navy/60">
                {key}
              </dt>
              <dd>{desc}</dd>
            </div>
          ))}
        </dl>
        <button
          onClick={() => setShowHelp(false)}
          className="mt-4 min-h-[44px] w-full rounded-md bg-srf-navy/5 px-4 py-2 text-sm text-srf-navy transition-colors hover:bg-srf-navy/10"
        >
          {t("keyHelp_close")}
        </button>
      </div>
    </div>
  );
}
