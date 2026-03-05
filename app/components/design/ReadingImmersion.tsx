"use client";

/**
 * ReadingImmersion — Phase 2 reading surface enhancements.
 *
 * Client island for chapter pages. Two sahṛdaya features:
 *
 *   1. Dwell mode — click a paragraph to focus it. The paragraph
 *      zooms/expands, everything else recedes. Intentional, explicit.
 *      If the paragraph has related teachings, a small indicator
 *      appears (injected as a DOM element) — click it to open the
 *      Golden Thread panel.
 *
 *   2. Keyboard paragraph navigation — j/k moves focus between
 *      paragraphs. Activates dwell on the target paragraph.
 *
 * Dwell activation:
 *   - Click on a paragraph → dwell on it
 *   - j/k keyboard → dwell on target
 *   - Click same paragraph, click outside, or Escape → exit dwell
 *
 * All visual treatment lives in the design system (reading-surface.css).
 * This component is pure behavior — data attributes and class toggles.
 *
 * Calm technology: respects prefers-reduced-motion.
 * No auto-activation. The reader chooses to dwell.
 *
 * CSS dependencies: [data-paragraph].kb-focus,
 * [data-dwell-active], [data-dwell-target] — all in reading-surface.css.
 */

import { useEffect } from "react";

export function ReadingImmersion() {

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const paragraphs = article.querySelectorAll<HTMLElement>(
      "[data-paragraph]",
    );
    if (paragraphs.length === 0) return;

    let currentIndex = -1;
    let dwellActive = false;
    let dwellIndex = -1;
    let threadIndicator: HTMLButtonElement | null = null;

    // ── Dwell mode ────────────────────────────────────────────────
    // Click a paragraph to focus it. Everything else dims.
    // The reader chooses to dwell — no auto-activation.

    function activateDwell(index: number) {
      // Already dwelling on this paragraph — toggle off
      if (dwellActive && dwellIndex === index) {
        deactivateDwell();
        return;
      }

      dwellActive = true;
      dwellIndex = index;
      article!.setAttribute("data-dwell-active", "");

      paragraphs.forEach((p, i) => {
        if (i === index) {
          p.setAttribute("data-dwell-target", "");
        } else {
          p.removeAttribute("data-dwell-target");
        }
      });

      // Show "Related Teachings" indicator if this paragraph has connections
      showThreadIndicator(index);
    }

    function deactivateDwell() {
      if (!dwellActive) return;
      dwellActive = false;
      dwellIndex = -1;
      article!.removeAttribute("data-dwell-active");
      paragraphs.forEach((p) => p.removeAttribute("data-dwell-target"));
      removeThreadIndicator();

      // Close Golden Thread panel
      window.dispatchEvent(
        new CustomEvent("paragraph:focus", { detail: { index: -1 } }),
      );
    }

    // ── Thread indicator ──────────────────────────────────────────
    // Small button injected into the focused paragraph when it has
    // golden thread connections. Click → opens the panel.

    function showThreadIndicator(index: number) {
      removeThreadIndicator();

      const para = paragraphs[index];
      if (!para.hasAttribute("data-has-thread")) return;

      threadIndicator = document.createElement("button");
      threadIndicator.className = "thread-indicator";
      threadIndicator.setAttribute("aria-label", "Related teachings");
      threadIndicator.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><span>Related teachings</span>`;

      threadIndicator.addEventListener("click", (e) => {
        e.stopPropagation();
        const paraIndex = parseInt(para.getAttribute("data-paragraph") ?? "-1", 10);
        if (paraIndex >= 0) {
          window.dispatchEvent(
            new CustomEvent("paragraph:focus", { detail: { index: paraIndex } }),
          );
        }
      });

      para.style.position = "relative";
      para.appendChild(threadIndicator);
    }

    function removeThreadIndicator() {
      if (threadIndicator && threadIndicator.parentNode) {
        threadIndicator.parentNode.removeChild(threadIndicator);
        threadIndicator = null;
      }
    }

    // ── Keyboard paragraph navigation ───────────────────────────
    // j/k moves focus between paragraphs. Activates dwell on target.

    function moveFocus(delta: number) {
      const next = Math.max(
        0,
        Math.min(paragraphs.length - 1, currentIndex + delta),
      );
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

      // Activate dwell on the navigated paragraph
      activateDwell(currentIndex);
    }

    function handleKeyDown(e: KeyboardEvent) {
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
          deactivateDwell();
          if (currentIndex >= 0) {
            paragraphs[currentIndex].classList.remove("kb-focus");
            currentIndex = -1;
          }
          break;
      }
    }

    // ── Click handler ─────────────────────────────────────────────
    // Click on a paragraph → dwell on it.
    // Click outside paragraphs → exit dwell.

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-paragraph]",
      );

      if (!target) {
        // Clicked outside any paragraph — exit dwell
        if (dwellActive) deactivateDwell();
        return;
      }

      // Stop propagation so GoldenThread's document listener doesn't
      // also fire and auto-open the panel
      e.stopPropagation();

      // Find the index of the clicked paragraph
      const idx = Array.from(paragraphs).indexOf(target);
      if (idx < 0) return;

      // Update keyboard nav index to match
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
      }
      currentIndex = idx;

      activateDwell(idx);
    }

    // ── Attach ──────────────────────────────────────────────────
    window.addEventListener("keydown", handleKeyDown);
    article.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      article.removeEventListener("click", handleClick);
      deactivateDwell();
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
      }
    };
  }, []);

  return null;
}
