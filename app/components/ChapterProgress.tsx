"use client";

/**
 * ChapterProgress — subtle visited markers on chapter lists.
 *
 * Client island that reads visited chapters from localStorage
 * and applies CSS classes to chapter list items. The server-rendered
 * chapter list gains a quiet transformation: visited chapters
 * show a gold checkmark.
 *
 * Architecture: rather than wrapping the chapter list (which would
 * prevent server rendering), this component runs alongside it and
 * modifies the DOM directly. Minimal, targeted, ephemeral.
 *
 * DELTA-compliant: reads localStorage, writes nothing (PRI-09).
 */

import { useEffect } from "react";
import { getVisitedChapters } from "@/lib/visited-chapters";

interface ChapterProgressProps {
  bookSlug: string;
}

export function ChapterProgress({ bookSlug }: ChapterProgressProps) {
  useEffect(() => {
    const visited = getVisitedChapters(bookSlug);
    if (visited.size === 0) return;

    // Find all chapter list items and mark visited ones
    const items = document.querySelectorAll<HTMLElement>(".chapter-list-item");
    items.forEach((item) => {
      const numberEl = item.querySelector(".chapter-list-number");
      if (!numberEl) return;
      const num = parseInt(numberEl.textContent || "", 10);
      if (!isNaN(num) && visited.has(num)) {
        item.classList.add("chapter-visited");
      }
    });
  }, [bookSlug]);

  return null;
}
