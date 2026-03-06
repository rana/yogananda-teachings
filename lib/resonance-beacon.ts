/**
 * Client-side resonance beacon — M3a-7 (FTR-031).
 *
 * Fire-and-forget POST to /api/v1/passages/:id/resonance.
 * Uses `navigator.sendBeacon` where available for page-unload safety,
 * falls back to background `fetch`. Never blocks the UI thread.
 *
 * DELTA-compliant (PRI-09): fire once per event, no retry, no queuing.
 */

import type { ResonanceType } from "@/lib/services/resonance";

/**
 * Send a resonance signal for a passage. Non-blocking, fire-and-forget.
 */
export function sendResonance(chunkId: string, type: ResonanceType): void {
  if (!chunkId) return;

  const url = `/api/v1/passages/${encodeURIComponent(chunkId)}/resonance`;
  const body = JSON.stringify({ type });

  // Prefer sendBeacon — survives page navigations
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(url, blob);
    return;
  }

  // Fallback: background fetch, ignore result
  if (typeof fetch !== "undefined") {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Silent failure — resonance is non-critical
    });
  }
}
