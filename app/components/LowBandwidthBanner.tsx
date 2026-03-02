"use client";

/**
 * Low-bandwidth detection banner — M1c-15, M2b-16 (ADR-006 §1, DES-049).
 *
 * When navigator.connection.effectiveType reports 2g/slow-2g,
 * display gentle banner suggesting text-only mode.
 * Progressive enhancement — no-op on browsers without the API.
 * Uses the unified reader preferences service (PRI-10).
 *
 * M2b-16 upgrades:
 *   - localStorage persistence with 30-day expiry (was sessionStorage)
 *   - i18n via next-intl (was hardcoded English)
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getPreference, setPreference } from "@/lib/services/preferences";

const DISMISSED_KEY = "srf-lowbw-dismissed";
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface DismissedState {
  dismissed: boolean;
  timestamp: number;
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;

    const state = JSON.parse(raw) as DismissedState;
    if (!state.dismissed) return false;

    // Check 30-day expiry
    if (Date.now() - state.timestamp > EXPIRY_MS) {
      localStorage.removeItem(DISMISSED_KEY);
      return false;
    }

    return true;
  } catch {
    // Corrupt data — treat as not dismissed
    localStorage.removeItem(DISMISSED_KEY);
    return false;
  }
}

export function LowBandwidthBanner() {
  const t = useTranslations("lowBandwidth");
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed (with 30-day expiry)
    if (isDismissed()) return;
    // Don't show if text-only already enabled
    if (getPreference("text-only-mode")) return;

    // Check connection API (progressive enhancement)
    const conn = (navigator as Navigator & {
      connection?: { effectiveType?: string };
    }).connection;

    if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
      setShow(true);
    }
  }, []);

  const enableTextOnly = useCallback(() => {
    setPreference("text-only-mode", true);
    document.documentElement.classList.add("text-only");
    setShow(false);
  }, []);

  const dismiss = useCallback(() => {
    const state: DismissedState = {
      dismissed: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(state));
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      data-no-print
      className="low-bandwidth-banner border-b border-srf-gold/20 bg-srf-gold/5 px-4 py-3 text-center text-sm text-srf-navy/70"
    >
      <p>
        {t("message")}{" "}
        <button
          onClick={enableTextOnly}
          className="min-h-11 min-w-11 rounded px-1.5 font-medium text-srf-navy underline decoration-srf-gold/40 underline-offset-2"
        >
          {t("enableTextOnly")}
        </button>{" "}
        <button
          onClick={dismiss}
          className="min-h-11 min-w-11 rounded px-1.5 text-srf-navy/40 hover:text-srf-navy/70"
          aria-label={t("dismiss")}
        >
          {t("dismiss")}
        </button>
      </p>
    </div>
  );
}
