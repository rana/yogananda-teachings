/**
 * Scroll position indicator — M2b-5.
 *
 * 2px gold line at top of viewport showing reading progress.
 * Not a percentage or countdown — spatial awareness, not progress tracking (PRI-08).
 */
"use client";

import { useEffect, useRef } from "react";

export function ScrollIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        bar!.style.inlineSize = "0%";
        return;
      }
      const pct = Math.min(100, (scrollTop / docHeight) * 100);
      bar!.style.inlineSize = `${pct}%`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="scroll-indicator"
      role="presentation"
      aria-hidden="true"
    />
  );
}
