"use client";

/**
 * Resonance watcher — M3a-7 (ADR-052).
 *
 * Listens for dwell activation events and maps paragraph indices to
 * chunk IDs for anonymous resonance counting. Fire-and-forget.
 * DELTA-compliant: no tracking, no session correlation.
 */

import { useEffect } from "react";
import { sendResonance } from "@/lib/resonance-beacon";

interface ResonanceWatcherProps {
  /** Ordered chunk IDs matching paragraph DOM order */
  paragraphChunkIds: string[];
}

export function ResonanceWatcher({ paragraphChunkIds }: ResonanceWatcherProps) {
  useEffect(() => {
    function handleDwellResonance(e: Event) {
      const detail = (e as CustomEvent).detail as { index: number };
      const chunkId = paragraphChunkIds[detail.index];
      if (chunkId) {
        sendResonance(chunkId, "dwell");
      }
    }

    window.addEventListener("srf:dwell-resonance", handleDwellResonance);
    return () =>
      window.removeEventListener("srf:dwell-resonance", handleDwellResonance);
  }, [paragraphChunkIds]);

  return null; // No UI — pure event listener
}
