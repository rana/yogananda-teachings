/**
 * Dwell Passage Contemplation Mode — M2b-1 (DES-009).
 *
 * Long-press (mobile, 500ms) or click a hover-revealed dwell icon (desktop)
 * on any paragraph dims surrounding text to 15% opacity, passage remains vivid.
 * Escape exits. Screen reader announcements on enter/exit.
 * prefers-reduced-motion: instant transitions, no haptic.
 *
 * Desktop: hover over paragraph for 1.5s reveals a small dwell activation icon
 * at inline-start margin (12px circle, gold at 40% opacity).
 *
 * 44x44px minimum touch target on dwell icon (PRI-07).
 * DELTA-compliant: no tracking, no analytics (PRI-09).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

// ── Constants ──────────────────────────────────────────────────────

/** Long-press duration on mobile (ms) */
const LONG_PRESS_MS = 500;

/** Hover duration before dwell icon appears on desktop (ms) */
const HOVER_REVEAL_MS = 1500;

// ── Component ─────────────────────────────────────────────────────

export function DwellMode() {
  const t = useTranslations("reader");

  const [active, setActive] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // Refs for timers
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredParaRef = useRef<HTMLElement | null>(null);

  // ── Activate dwell on a paragraph ────────────────────────────────

  const activateDwell = useCallback((paragraphIndex: number) => {
    setActive(true);
    setTargetIndex(paragraphIndex);
  }, []);

  const deactivateDwell = useCallback(() => {
    setActive(false);
    setTargetIndex(null);
  }, []);

  // ── Apply/remove data attributes on the DOM ──────────────────────

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    if (active) {
      article.setAttribute("data-dwell-active", "");
    } else {
      article.removeAttribute("data-dwell-active");
    }

    // Mark the target paragraph
    const paragraphs = article.querySelectorAll("[data-paragraph]");
    paragraphs.forEach((p) => {
      p.removeAttribute("data-dwell-target");
    });

    if (active && targetIndex !== null && paragraphs[targetIndex]) {
      paragraphs[targetIndex].setAttribute("data-dwell-target", "");
    }

    return () => {
      article.removeAttribute("data-dwell-active");
      paragraphs.forEach((p) => p.removeAttribute("data-dwell-target"));
    };
  }, [active, targetIndex]);

  // ── Escape key exits dwell mode ──────────────────────────────────

  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        deactivateDwell();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, deactivateDwell]);

  // ── Mobile: long-press detection ─────────────────────────────────

  useEffect(() => {
    function getParagraphIndex(el: HTMLElement): number | null {
      const para = el.closest("[data-paragraph]");
      if (!para) return null;
      const attr = para.getAttribute("data-paragraph");
      return attr !== null ? parseInt(attr, 10) : null;
    }

    function handleTouchStart(e: TouchEvent) {
      const target = e.target as HTMLElement;
      const idx = getParagraphIndex(target);
      if (idx === null) return;

      longPressTimerRef.current = setTimeout(() => {
        activateDwell(idx);
      }, LONG_PRESS_MS);
    }

    function handleTouchEnd() {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    function handleTouchMove() {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    const article = document.querySelector("article");
    if (!article) return;

    article.addEventListener("touchstart", handleTouchStart, { passive: true });
    article.addEventListener("touchend", handleTouchEnd, { passive: true });
    article.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      article.removeEventListener("touchstart", handleTouchStart);
      article.removeEventListener("touchend", handleTouchEnd);
      article.removeEventListener("touchmove", handleTouchMove);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, [activateDwell]);

  // ── Desktop: hover to reveal dwell icon, click icon to activate ──

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    // Create the dwell icon element (reusable, moves between paragraphs)
    const dwellIcon = document.createElement("button");
    dwellIcon.className = "dwell-icon";
    dwellIcon.type = "button";
    dwellIcon.setAttribute("aria-label", t("dwell"));
    dwellIcon.style.position = "absolute";
    dwellIcon.style.insetInlineStart = "-2rem";
    dwellIcon.style.insetBlockStart = "50%";
    dwellIcon.style.transform = "translateY(-50%)";
    dwellIcon.style.width = "44px";
    dwellIcon.style.height = "44px";
    dwellIcon.style.borderRadius = "50%";
    dwellIcon.style.border = "none";
    dwellIcon.style.background = "transparent";
    dwellIcon.style.cursor = "pointer";
    dwellIcon.style.display = "flex";
    dwellIcon.style.alignItems = "center";
    dwellIcon.style.justifyContent = "center";
    dwellIcon.style.padding = "0";
    dwellIcon.style.opacity = "0";
    dwellIcon.style.transition = "opacity 200ms";
    dwellIcon.style.zIndex = "10";

    // The visible 12px gold circle inside the 44px touch target
    const innerCircle = document.createElement("span");
    innerCircle.style.width = "12px";
    innerCircle.style.height = "12px";
    innerCircle.style.borderRadius = "50%";
    innerCircle.style.background = "var(--color-srf-gold)";
    innerCircle.style.display = "block";
    innerCircle.setAttribute("aria-hidden", "true");
    dwellIcon.appendChild(innerCircle);

    let iconAttached = false;

    function getParagraphIndex(el: HTMLElement): number | null {
      const para = el.closest("[data-paragraph]");
      if (!para) return null;
      const attr = para.getAttribute("data-paragraph");
      return attr !== null ? parseInt(attr, 10) : null;
    }

    function handleMouseEnter(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.matches("[data-paragraph]")) return;

      hoveredParaRef.current = target;

      hoverTimerRef.current = setTimeout(() => {
        if (hoveredParaRef.current !== target) return;

        // Ensure paragraph has relative positioning for icon placement
        const computedPos = window.getComputedStyle(target).position;
        if (computedPos === "static") {
          target.style.position = "relative";
        }

        target.appendChild(dwellIcon);
        iconAttached = true;
        dwellIcon.style.opacity = "0.4";
      }, HOVER_REVEAL_MS);
    }

    function handleMouseLeave(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.matches("[data-paragraph]")) return;

      if (hoveredParaRef.current === target) {
        hoveredParaRef.current = null;
      }

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }

      if (iconAttached && dwellIcon.parentElement === target) {
        dwellIcon.style.opacity = "0";
        // Delay removal so the fade-out can complete
        setTimeout(() => {
          if (dwellIcon.parentElement === target) {
            target.removeChild(dwellIcon);
            iconAttached = false;
          }
        }, 200);
      }
    }

    function handleIconClick(e: MouseEvent) {
      e.stopPropagation();
      const para = dwellIcon.parentElement;
      if (!para) return;
      const idx = getParagraphIndex(para);
      if (idx !== null) {
        activateDwell(idx);
      }
    }

    // Event delegation on the article for paragraph hover
    const paragraphs = article.querySelectorAll("[data-paragraph]");
    paragraphs.forEach((p) => {
      p.addEventListener("mouseenter", handleMouseEnter as EventListener);
      p.addEventListener("mouseleave", handleMouseLeave as EventListener);
    });

    dwellIcon.addEventListener("click", handleIconClick);

    return () => {
      paragraphs.forEach((p) => {
        p.removeEventListener("mouseenter", handleMouseEnter as EventListener);
        p.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      });
      dwellIcon.removeEventListener("click", handleIconClick);
      if (iconAttached && dwellIcon.parentElement) {
        dwellIcon.parentElement.removeChild(dwellIcon);
      }
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [activateDwell, t]);

  // ── Screen reader announcements ──────────────────────────────────

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-testid="dwell-announcer"
    >
      {active ? t("dwell") : ""}
      {!active && targetIndex !== null ? t("dwellExit") : ""}
    </div>
  );
}
