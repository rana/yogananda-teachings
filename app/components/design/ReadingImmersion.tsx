"use client";

/**
 * ReadingImmersion — reading surface interaction layer.
 *
 * Client island for chapter pages. Two interaction levels:
 *
 *   1. Paragraph focus — click/tap a paragraph to show a subtle
 *      left accent bar and warm background. Light attention.
 *
 *   2. Zoom Paragraph — double-click, long-press (500ms), zoom icon,
 *      or Enter/Space on a focused paragraph to zoom it. Everything
 *      else dims. If the paragraph has related teachings, a thread
 *      indicator appears. Scroll exits zoom.
 *
 * Keyboard paragraph navigation — j/k moves focus between paragraphs.
 *
 * All visual treatment lives in CSS (reading-surface.css + globals.css).
 * This component is pure behavior — data attributes and class toggles.
 *
 * Calm technology: respects prefers-reduced-motion.
 * No auto-activation. The reader chooses to engage.
 *
 * CSS dependencies: [data-paragraph].focused, [data-paragraph].kb-focus,
 * [data-zoom-active], [data-zoom-target] — in reading-surface.css / globals.css.
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
    let zoomActive = false;
    let zoomIndex = -1;
    let threadIndicator: HTMLButtonElement | null = null;
    let zoomIcon: HTMLButtonElement | null = null;
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;

    // ── Paragraph focus ──────────────────────────────────────────
    // Light attention: left bar + warm background.

    function focusParagraph(index: number) {
      // Clear previous focus
      paragraphs.forEach((p) => p.classList.remove("focused"));

      if (index >= 0 && index < paragraphs.length) {
        paragraphs[index].classList.add("focused");
        showZoomIcon(index);
      } else {
        removeZoomIcon();
      }
    }

    // ── Zoom icon ────────────────────────────────────────────────
    // Small expand icon in top-right of focused paragraph.

    function showZoomIcon(index: number) {
      removeZoomIcon();
      const para = paragraphs[index];

      zoomIcon = document.createElement("button");
      zoomIcon.className = "zoom-icon";
      zoomIcon.setAttribute("aria-label", "Zoom paragraph");
      zoomIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

      zoomIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        activateZoom(index);
      });

      para.style.position = "relative";
      para.appendChild(zoomIcon);
    }

    function removeZoomIcon() {
      if (zoomIcon && zoomIcon.parentNode) {
        zoomIcon.parentNode.removeChild(zoomIcon);
        zoomIcon = null;
      }
    }

    // ── Zoom Paragraph ───────────────────────────────────────────
    // Deep contemplation: everything else dims, paragraph comes forward.

    function activateZoom(index: number) {
      // Already zoomed on this paragraph — toggle off
      if (zoomActive && zoomIndex === index) {
        deactivateZoom();
        return;
      }

      zoomActive = true;
      zoomIndex = index;
      article!.setAttribute("data-zoom-active", "");

      paragraphs.forEach((p, i) => {
        if (i === index) {
          p.setAttribute("data-zoom-target", "");
        } else {
          p.removeAttribute("data-zoom-target");
        }
      });

      // Haptic feedback (calm: minimal pulse)
      if (navigator.vibrate) {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!mq.matches) navigator.vibrate(10);
      }

      // Show "Related Teachings" indicator if this paragraph has connections
      showThreadIndicator(index);
    }

    function deactivateZoom() {
      if (!zoomActive) return;
      zoomActive = false;
      zoomIndex = -1;
      article!.removeAttribute("data-zoom-active");
      paragraphs.forEach((p) => p.removeAttribute("data-zoom-target"));
      removeThreadIndicator();

      // Close Golden Thread panel
      window.dispatchEvent(
        new CustomEvent("paragraph:focus", { detail: { index: -1 } }),
      );
    }

    // ── Thread indicator ──────────────────────────────────────────
    // Small button injected into the zoomed paragraph when it has
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
    // j/k moves focus between paragraphs.

    function moveFocus(delta: number) {
      const next = Math.max(
        0,
        Math.min(paragraphs.length - 1, currentIndex + delta),
      );
      if (next === currentIndex && currentIndex >= 0) return;

      // Clear previous keyboard focus
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
      }

      currentIndex = next;
      paragraphs[currentIndex].classList.add("kb-focus");
      paragraphs[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Set paragraph focus (light level)
      focusParagraph(currentIndex);
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
        case "Enter":
        case " ":
          // Zoom the focused paragraph (if one is focused via j/k)
          if (currentIndex >= 0) {
            e.preventDefault();
            activateZoom(currentIndex);
          }
          break;
        case "Escape":
          if (zoomActive) {
            e.preventDefault();
            deactivateZoom();
          } else if (currentIndex >= 0) {
            e.preventDefault();
            paragraphs[currentIndex].classList.remove("kb-focus");
            paragraphs[currentIndex].classList.remove("focused");
            removeZoomIcon();
            currentIndex = -1;
          }
          break;
      }
    }

    // ── Click handler ─────────────────────────────────────────────
    // Single click → focus (light). Double-click → zoom (deep).
    // Click outside → exit focus/zoom.

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-paragraph]",
      );

      if (!target) {
        // Clicked outside any paragraph — exit zoom and focus
        if (zoomActive) deactivateZoom();
        focusParagraph(-1);
        return;
      }

      // Stop propagation so GoldenThread's document listener doesn't
      // also fire and auto-open the panel
      e.stopPropagation();

      const idx = Array.from(paragraphs).indexOf(target);
      if (idx < 0) return;

      // Update keyboard nav index to match
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
      }
      currentIndex = idx;

      // Single click = focus (light level)
      focusParagraph(idx);
    }

    // ── Double-click handler ──────────────────────────────────────
    // Double-click on a paragraph → zoom it.

    function handleDblClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-paragraph]",
      );
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      const idx = Array.from(paragraphs).indexOf(target);
      if (idx < 0) return;

      activateZoom(idx);
    }

    // ── Long-press handler (mobile) ───────────────────────────────
    // 500ms press on a paragraph → zoom it.

    function handlePointerDown(e: PointerEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-paragraph]",
      );
      if (!target) return;

      const idx = Array.from(paragraphs).indexOf(target);
      if (idx < 0) return;

      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        activateZoom(idx);
      }, 500);
    }

    function cancelLongPress() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    // ── Scroll exits zoom ─────────────────────────────────────────
    function handleScroll() {
      if (zoomActive) deactivateZoom();
    }

    // ── Attach ──────────────────────────────────────────────────
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    article.addEventListener("click", handleClick);
    article.addEventListener("dblclick", handleDblClick);
    article.addEventListener("pointerdown", handlePointerDown);
    article.addEventListener("pointerup", cancelLongPress);
    article.addEventListener("pointermove", cancelLongPress);
    article.addEventListener("pointercancel", cancelLongPress);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      article.removeEventListener("click", handleClick);
      article.removeEventListener("dblclick", handleDblClick);
      article.removeEventListener("pointerdown", handlePointerDown);
      article.removeEventListener("pointerup", cancelLongPress);
      article.removeEventListener("pointermove", cancelLongPress);
      article.removeEventListener("pointercancel", cancelLongPress);
      cancelLongPress();
      deactivateZoom();
      if (currentIndex >= 0) {
        paragraphs[currentIndex].classList.remove("kb-focus");
        paragraphs[currentIndex].classList.remove("focused");
      }
    };
  }, []);

  return null;
}
