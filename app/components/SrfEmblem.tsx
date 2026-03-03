/**
 * SRF Emblem — tri-lotus with star.
 *
 * The official SRF emblem: three lotus petals with a five-pointed
 * star in a circle, three sepals, and stem. Uses currentColor for
 * theme adaptation — the star is negative space (evenodd fill rule),
 * revealing the background through the symbol.
 *
 * Based on the SRF tri-lotus star as seen on yogananda.org,
 * app/icon.png, and official SRF materials.
 */

interface Props {
  className?: string;
  /** Size shorthand — applies w-N h-N classes */
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function SrfEmblem({ className, size = "md" }: Props) {
  return (
    <svg
      viewBox="0 0 80 100"
      fill="currentColor"
      className={className ?? sizes[size]}
      aria-hidden="true"
      data-ui
    >
      {/* Center petal — tall, pointed, rising from the circle */}
      <path d="M33,46 C31,34 34,16 40,3 C46,16 49,34 47,46 Z" />

      {/* Left petal — curves outward to the upper-left */}
      <path d="M30,42 C20,34 6,26 4,34 C2,42 16,58 30,58 Z" />

      {/* Right petal — mirror of left */}
      <path d="M50,42 C60,34 74,26 76,34 C78,42 64,58 50,58 Z" />

      {/* Circle with star cutout (evenodd creates negative-space star) */}
      <path
        fillRule="evenodd"
        d="M40,36 A12,12,0,1,1,40,60 A12,12,0,1,1,40,36 Z
           M40,38.5 L42.35,44.76 L49.04,45.06 L43.8,49.24 L45.58,55.69 L40,52 L34.42,55.69 L36.2,49.24 L30.96,45.06 L37.65,44.76 Z"
      />

      {/* Left sepal */}
      <path d="M34,60 C28,66 22,76 26,80 C30,74 34,68 38,62 Z" />

      {/* Right sepal */}
      <path d="M46,60 C52,66 58,76 54,80 C50,74 46,68 42,62 Z" />

      {/* Stem */}
      <path d="M39,68 L40,94 L41,68 Z" />
    </svg>
  );
}
