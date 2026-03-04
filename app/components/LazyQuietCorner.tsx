"use client";

/**
 * Lazy-loaded QuietCornerClient wrapper — defers timer/audio JS
 * to reduce First Load JS on the quiet page (PRI-07: <120KB budget).
 *
 * A centered skeleton prevents layout shift while the component loads.
 */

import dynamic from "next/dynamic";
import type { DailyPassage } from "@/lib/services/passages";

const QuietCornerClient = dynamic(
  () =>
    import("@/app/components/QuietCornerClient").then(
      (mod) => mod.QuietCornerClient,
    ),
  {
    ssr: false,
    loading: () => (
      <main id="main-content" className="quiet-layout">
        <div className="quiet-content">
          <div className="pulse" style={{ blockSize: "1.75rem", inlineSize: "10rem", marginInline: "auto", marginBlockEnd: "var(--space-generous)", borderRadius: "4px" }} />
          <div className="stack-tight">
            <div className="pulse" style={{ blockSize: "1.5rem", borderRadius: "4px" }} />
            <div className="pulse" style={{ blockSize: "1.5rem", borderRadius: "4px" }} />
            <div className="pulse" style={{ blockSize: "1.5rem", inlineSize: "75%", marginInline: "auto", borderRadius: "4px" }} />
          </div>
        </div>
      </main>
    ),
  },
);

interface Props {
  passage: DailyPassage | null;
}

export function LazyQuietCorner({ passage }: Props) {
  return <QuietCornerClient passage={passage} />;
}
