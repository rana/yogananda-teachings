"use client";

/**
 * Passage Arrival — the search-to-reading moment.
 *
 * When a seeker arrives from search results or the golden thread,
 * this component:
 * 1. Reads the passage chunk ID from the URL hash (#passage-{chunkId})
 * 2. Maps the chunk ID to a paragraph index
 * 3. Smoothly scrolls to center the paragraph in the viewport
 * 4. Applies a transient gold glow that fades over 3 seconds
 *
 * The glow is warm, not attention-grabbing — like sunlight landing
 * on the passage through a window. Then it fades, and you're reading.
 *
 * Constraints:
 * - prefers-reduced-motion: instant scroll, static highlight for 3s
 * - Hash is consumed on mount (cleaned from URL via replaceState)
 * - No tracking, no analytics (PRI-08, PRI-09)
 *
 * "Here. This is what called to you."
 */

import { useEffect } from "react";

const ARRIVAL_ATTR = "data-arrival";
const GLOW_DURATION_MS = 3000;

/** CSS for the arrival glow — injected once. */
const ARRIVAL_STYLES = `
  @keyframes passage-arrival-glow {
    0%   { background-color: rgba(220, 189, 35, 0.12); }
    60%  { background-color: rgba(220, 189, 35, 0.06); }
    100% { background-color: transparent; }
  }

  [${ARRIVAL_ATTR}] {
    animation: passage-arrival-glow ${GLOW_DURATION_MS}ms ease-out forwards;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    [${ARRIVAL_ATTR}] {
      animation: none;
      background-color: rgba(220, 189, 35, 0.08);
    }
  }
`;

interface PassageArrivalProps {
  /** Ordered chunk IDs matching paragraph DOM order */
  paragraphChunkIds: string[];
}

/**
 * Parse a passage chunk ID from the URL hash.
 * Format: #passage-{chunkId}
 */
function parsePassageHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#passage-")) return null;
  return decodeURIComponent(hash.slice("#passage-".length));
}

export function PassageArrival({ paragraphChunkIds }: PassageArrivalProps) {
  useEffect(() => {
    const chunkId = parsePassageHash();
    if (!chunkId) return;

    // Map chunk ID to paragraph index
    const paragraphIndex = paragraphChunkIds.indexOf(chunkId);
    if (paragraphIndex < 0) return;

    // Find the paragraph element
    const el = document.querySelector(
      `[data-paragraph="${paragraphIndex}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    // Clean the hash from the URL — the arrival is a one-time event
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url.pathname + url.search);

    // Scroll to center the paragraph in the viewport
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    el.scrollIntoView({
      behavior: prefersReduced ? "instant" : "smooth",
      block: "center",
    });

    // Apply the arrival glow
    el.setAttribute(ARRIVAL_ATTR, "");

    // Remove glow after animation completes
    const timer = setTimeout(() => {
      el.removeAttribute(ARRIVAL_ATTR);
    }, GLOW_DURATION_MS);

    return () => {
      clearTimeout(timer);
      el.removeAttribute(ARRIVAL_ATTR);
    };
  }, [paragraphChunkIds]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ARRIVAL_STYLES }} />
    </>
  );
}
