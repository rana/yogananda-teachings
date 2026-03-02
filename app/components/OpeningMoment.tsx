/**
 * Opening Moment — DES-007: Portal Threshold.
 *
 * On first visit per browser session, the homepage displays a brief
 * lotus threshold before content appears:
 * - Warm cream background with SRF lotus SVG (~40px, gold at 30% opacity)
 * - After 800ms, lotus fades out over 400ms while content fades in
 * - Total: ~1.2 seconds. No text, no logo, no loading message. Just a breath.
 *
 * Constraints:
 * - First visit only per session (sessionStorage)
 * - prefers-reduced-motion: threshold skipped entirely
 * - Only on homepage — deep links bypass
 *
 * DELTA-compliant: sessionStorage only, no tracking (PRI-09).
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { SrfLotus } from "./SrfLotus";

const SESSION_KEY = "srf-threshold-shown";

export function OpeningMoment({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"check" | "threshold" | "fading" | "done">("check");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip if reduced motion preferred
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setPhase("done");
      return;
    }

    // Skip if already shown this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setPhase("done");
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage unavailable — skip threshold
      setPhase("done");
      return;
    }

    // Show threshold
    setPhase("threshold");

    // After 800ms, start fade
    timerRef.current = setTimeout(() => {
      setPhase("fading");
      // After 400ms fade, reveal content
      timerRef.current = setTimeout(() => {
        setPhase("done");
      }, 400);
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // During check phase, render nothing (prevents flash)
  if (phase === "check") {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  // Once done, render content normally
  if (phase === "done") {
    return <>{children}</>;
  }

  // Threshold or fading phase
  return (
    <>
      {/* Lotus threshold overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--theme-bg)",
          opacity: phase === "fading" ? 0 : 1,
          transition: "opacity 400ms ease-out",
          pointerEvents: "none",
        }}
      >
        <SrfLotus className="w-10 h-10 text-srf-gold opacity-30" />
      </div>
      {/* Content behind the overlay, fading in */}
      <div
        style={{
          opacity: phase === "fading" ? 1 : 0,
          transition: "opacity 400ms ease-in",
        }}
      >
        {children}
      </div>
    </>
  );
}
