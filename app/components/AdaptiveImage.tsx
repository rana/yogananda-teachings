/**
 * Adaptive image component — M2b-16 (ADR-006, PRI-05).
 *
 * Progressive enhancement wrapper around <img> that adapts to
 * network quality via navigator.connection:
 *   - 2G/slow-2G: lazy load, halved dimensions, blur placeholder, optional lowResSrc
 *   - 3G: lazy load, normal dimensions
 *   - 4G/wifi/unavailable: standard rendering
 *
 * No tracking, no analytics (PRI-09).
 */

"use client";

import { useState, useEffect, type ImgHTMLAttributes } from "react";

type ConnectionQuality = "slow" | "moderate" | "fast";

function getConnectionQuality(): ConnectionQuality {
  if (typeof navigator === "undefined") return "fast";

  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;

  if (!conn?.effectiveType) return "fast";

  switch (conn.effectiveType) {
    case "slow-2g":
    case "2g":
      return "slow";
    case "3g":
      return "moderate";
    default:
      return "fast";
  }
}

interface AdaptiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Optional low-resolution source for slow connections */
  lowResSrc?: string;
}

export function AdaptiveImage({
  lowResSrc,
  width,
  height,
  style,
  ...props
}: AdaptiveImageProps) {
  const [quality, setQuality] = useState<ConnectionQuality>("fast");

  useEffect(() => {
    setQuality(getConnectionQuality());
  }, []);

  const adaptedProps = { ...props };

  if (quality === "slow") {
    adaptedProps.loading = "lazy";
    if (lowResSrc) {
      adaptedProps.src = lowResSrc;
    }
    // Halve dimensions for slow connections
    const adaptedWidth = width ? Math.round(Number(width) / 2) : width;
    const adaptedHeight = height ? Math.round(Number(height) / 2) : height;

    return (
      <img
        {...adaptedProps}
        width={adaptedWidth}
        height={adaptedHeight}
        style={{
          ...style,
          filter: "blur(2px)",
          transition: "filter 300ms ease",
        }}
        onLoad={(e) => {
          // Remove blur once loaded
          (e.target as HTMLImageElement).style.filter = "none";
          props.onLoad?.(e);
        }}
      />
    );
  }

  if (quality === "moderate") {
    adaptedProps.loading = "lazy";
  }

  return (
    <img
      {...adaptedProps}
      width={width}
      height={height}
      style={style}
    />
  );
}
