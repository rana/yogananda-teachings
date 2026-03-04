"use client";

/**
 * ReadingImmersion — Phase 2 reading surface enhancements.
 *
 * Client island for chapter pages. Activates three sahṛdaya features:
 *
 *   1. Scroll position indicator — 2px gold bar, ambient attention.
 *   2. Keyboard paragraph navigation — j/k moves focus, gold highlight.
 *   3. Dwell contemplation — 1.2s settled dims surroundings, holds focus.
 *
 * All visual treatment lives in the design system (reading-surface.css).
 * This component is pure behavior — the only DOM output is the scroll
 * indicator div. Everything else is data attributes and class toggles.
 *
 * Calm technology: respects prefers-reduced-motion (disables dwell).
 * No decorative animation. All state changes serve the reader's focus.
 *
 * CSS dependencies: .scroll-indicator, [data-paragraph].kb-focus,
 * [data-dwell-active], [data-dwell-target] — all in reading-surface.css.
 */

import { useEffect, useRef } from "react";

export function ReadingImmersion() {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const paragraphs = article.querySelectorAll<HTMLElement>(
      "[data-paragraph]",
    );
    if (paragraphs.length === 0) return;

    let currentIndex = -1;
    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let dwellActive = false;

    // Respect reduced-motion: disable dwell (opacity transitions)
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ── Scroll indicator ────────────────────────────────────────
    // CSS handles appearance (.scroll-indicator in reading-surface.css).
    // We update inline-size as a percentage; CSS transitions smooth it.

    const indicator = indicatorRef.current;

    function updateScrollProgress() {
      if (!indicator) return;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      indicator.style.inlineSize = `${progress * 100}%`;
    }

    // ── Dwell contemplation ─────────────────────────────────────
    // After 1200ms of scroll stillness (--reading-settled-debounce),
    // find the paragraph nearest the viewport's focus zone (35% from
    // top) and dim everything else. The portal waits, then responds.

    function startDwellTimer() {
      clearDwellTimer();
      if (reducedMotion) return;

      dwellTimer = setTimeout(() => {
        const focusZone = window.innerHeight * 0.35;
        let closest = -1;
        let closestDist = Infinity;

        paragraphs.forEach((p, i) => {
          const rect = p.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          const dist = Math.abs(mid - focusZone);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });

        // Only activate when a paragraph is well within the focus zone
        if (closest >= 0 && closestDist < window.innerHeight * 0.25) {
          activateDwell(closest);
        }
      }, 1200);
    }

    function clearDwellTimer() {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
        dwellTimer = null;
      }
    }

    function activateDwell(index: number) {
      dwellActive = true;
      article!.setAttribute("data-dwell-active", "");
      paragraphs.forEach((p, i) => {
        if (i === index) {
          p.setAttribute("data-dwell-target", "");
        } else {
          p.removeAttribute("data-dwell-target");
        }
      });
    }

    function deactivateDwell() {
      if (!dwellActive) return;
      dwellActive = false;
      article!.removeAttribute("data-dwell-active");
      paragraphs.forEach((p) => p.removeAttribute("data-dwell-target"));
    }

    // ── Keyboard paragraph navigation ───────────────────────────
    // j/k moves focus between paragraphs. The gold highlight (.kb-focus)
    // and smooth scroll create a reading rhythm the seeker controls.

    function moveFocus(delta: number) {
      deactivateDwell();

      const next = Math.max(
        0,
        Math.min(paragraphs.length - 1, currentIndex + delta),
      );
      // Already at boundary — don't re-scroll
      if (next === currentIndex && currentIndex >= 0) return;

      // Clear previous
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
      }

      currentIndex = next;
      paragraphs[currentIndex].classList.add("kb-focus");
      paragraphs[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in form elements
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case "j":
          e.preventDefault();
          moveFocus(1);
          break;
        case "k":
          e.preventDefault();
          moveFocus(-1);
          break;
        case "Escape":
          if (dwellActive) deactivateDwell();
          if (currentIndex >= 0) {
            paragraphs[currentIndex].classList.remove("kb-focus");
            currentIndex = -1;
          }
          break;
      }
    }

    // ── Scroll handler ──────────────────────────────────────────
    // Updates progress bar and resets dwell timer on every scroll.

    function handleScroll() {
      updateScrollProgress();
      deactivateDwell();
      startDwellTimer();
    }

    // ── Click to exit dwell ─────────────────────────────────────
    function handleClick() {
      if (dwellActive) deactivateDwell();
    }

    // ── Attach ──────────────────────────────────────────────────
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    article.addEventListener("click", handleClick);

    // Initial state
    updateScrollProgress();
    startDwellTimer();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      article.removeEventListener("click", handleClick);
      clearDwellTimer();
      deactivateDwell();
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
      }
    };
  }, []);

  return (
    <div
      ref={indicatorRef}
      className="scroll-indicator"
      aria-hidden="true"
      style={{ inlineSize: "0%" }}
    />
  );
}
