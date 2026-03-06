"use client";

/**
 * ChapterProgress — subtle visited markers on chapter lists.
 *
 * Client island that reads visited chapters from localStorage
 * and applies CSS classes + title attribute to chapter list items.
 * Renders a legend with a clear button when visited chapters exist.
 *
 * Architecture: rather than wrapping the chapter list (which would
 * prevent server rendering), this component runs alongside it and
 * modifies the DOM directly. Minimal, targeted, ephemeral.
 *
 * DELTA-compliant: reads/writes localStorage only (PRI-09).
 */

import { useCallback, useEffect, useState } from "react";
import { clearBookVisited, getVisitedChapters } from "@/lib/visited-chapters";

interface ChapterProgressProps {
  bookSlug: string;
}

export function ChapterProgress({ bookSlug }: ChapterProgressProps) {
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const visited = getVisitedChapters(bookSlug);
    if (visited.size === 0) return;

    setHasVisited(true);

    // Find all chapter list items and mark visited ones
    const items = document.querySelectorAll<HTMLElement>(".chapter-list-item");
    items.forEach((item) => {
      const numberEl = item.querySelector(".chapter-list-number");
      if (!numberEl) return;
      const num = parseInt(numberEl.textContent || "", 10);
      if (!isNaN(num) && visited.has(num)) {
        item.classList.add("chapter-visited");
        item.title = "Previously visited";
      }
    });
  }, [bookSlug]);

  const handleClear = useCallback(() => {
    clearBookVisited(bookSlug);
    // Remove visual markers from DOM
    document.querySelectorAll<HTMLElement>(".chapter-visited").forEach((item) => {
      item.classList.remove("chapter-visited");
      item.removeAttribute("title");
    });
    setHasVisited(false);
  }, [bookSlug]);

  if (!hasVisited) return null;

  return (
    <p className="visited-legend center">
      <span className="visited-legend-swatch" />
      Previously visited
      <button
        type="button"
        className="visited-legend-clear"
        onClick={handleClear}
      >
        Clear
      </button>
    </p>
  );
}
