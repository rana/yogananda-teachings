/**
 * Keyboard-first reading navigation — M2b-2 (DES-013).
 *
 * Single-key shortcuts for the chapter reader:
 *   j/k — next/previous paragraph
 *   →/← — next/previous chapter
 *   / — focus search bar
 *   ? — help overlay (future)
 *   b — bookmark toggle (future, with dwell mode)
 *
 * Suppressed when input/textarea/select is focused.
 * No visual output — this is a behavior-only component.
 */
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Suppress when typing in form elements
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

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
      }
    },
    [bookId, prevChapter, nextChapter, router],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
