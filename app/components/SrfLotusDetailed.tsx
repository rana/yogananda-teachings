/**
 * Detailed SRF lotus — decorative element from the SRF member portal.
 *
 * Uses CSS mask-image with a static SVG (18KB, CDN-cached) to keep
 * the JS bundle at zero cost. Color follows currentColor via
 * background-color, making it fully theme-aware.
 *
 * The SVG is preloaded via <link rel="preload"> in layout.tsx to
 * guarantee availability for the Opening Moment threshold.
 *
 * Source: members.yogananda-srf.org, optimized from 128KB → 18KB.
 */

interface Props {
  className?: string;
}

const maskStyle = {
  maskImage: "url(/brand/srf-lotus-detailed.svg)",
  maskSize: "contain",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  maskMode: "alpha",
  WebkitMaskImage: "url(/brand/srf-lotus-detailed.svg)",
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
} as const;

export function SrfLotusDetailed({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      data-ui
      className={className}
      style={{
        ...maskStyle,
        backgroundColor: "currentColor",
        // Preserve the SVG's natural aspect ratio (181:150)
        aspectRatio: "181 / 150",
      }}
    />
  );
}
