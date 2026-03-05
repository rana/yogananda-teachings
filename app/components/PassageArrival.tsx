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
 * The glow uses --color-gold from the design system.
 * prefers-reduced-motion: instant scroll, static highlight for 3s.
 * Hash is consumed on mount (cleaned from URL via replaceState).
 */

import { useEffect } from "react";

const ARRIVAL_ATTR = "data-arrival";
const GLOW_DURATION_MS = 3000;

const ARRIVAL_STYLES = `
  @keyframes passage-arrival-glow {
    0%   { background-color: color-mix(in oklch, var(--color-gold), transparent 88%); }
    60%  { background-color: color-mix(in oklch, var(--color-gold), transparent 94%); }
    100% { background-color: transparent; }
  }

  [${ARRIVAL_ATTR}] {
    animation: passage-arrival-glow ${GLOW_DURATION_MS}ms ease-out forwards;
    border-radius: var(--radius-gentle, 4px);
  }

  @media (prefers-reduced-motion: reduce) {
    [${ARRIVAL_ATTR}] {
      animation: none;
      background-color: color-mix(in oklch, var(--color-gold), transparent 92%);
    }
  }
`;

interface PassageArrivalProps {
  paragraphChunkIds: string[];
}

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

    const paragraphIndex = paragraphChunkIds.indexOf(chunkId);
    if (paragraphIndex < 0) return;

    const el = document.querySelector(
      `[data-paragraph="${paragraphIndex}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    // Clean hash — arrival is a one-time event
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url.pathname + url.search);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    el.scrollIntoView({
      behavior: prefersReduced ? "instant" : "smooth",
      block: "center",
    });

    el.setAttribute(ARRIVAL_ATTR, "");

    const timer = setTimeout(() => {
      el.removeAttribute(ARRIVAL_ATTR);
    }, GLOW_DURATION_MS);

    return () => {
      clearTimeout(timer);
      el.removeAttribute(ARRIVAL_ATTR);
    };
  }, [paragraphChunkIds]);

  return <style dangerouslySetInnerHTML={{ __html: ARRIVAL_STYLES }} />;
}
