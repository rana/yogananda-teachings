/**
 * Motif — botanical glyph renderer.
 *
 * Server component. Renders an SVG glyph via CSS mask-image technique.
 * The SVG provides the shape; CSS background-color provides the fill.
 * This allows pure CSS theming without JavaScript or inline SVG.
 *
 * Three semantic roles (from css/motifs.css):
 *   - divider: Section break (24px, decorative opacity)
 *   - breath:  Lighter pause (16px, ambient opacity)
 *   - close:   Chapter ending (16px, decorative opacity)
 *
 * Five color voices (from motifs/srf/glyphs.json):
 *   - sacred:   gold — spiritual radiance
 *   - growth:   olive — living nature
 *   - devotion: navy — meditative depth
 *   - warmth:   orange — renunciant warmth
 *   - crimson:  red — auspicious power
 *
 * Accessibility: aria-hidden (decorative), never animated (PRI-08).
 * Calm technology: max one motif per content section.
 */

type MotifRole = "divider" | "breath" | "close";
type MotifVoice = "sacred" | "growth" | "devotion" | "warmth" | "crimson";

/** Banner glyphs for dividers (wide aspect ratio). */
const DIVIDER_GLYPH = "lotus-07";
/** Balanced square glyph for breaths and closes. */
const BALANCED_GLYPH = "lotus-15";

interface MotifProps {
  role: MotifRole;
  voice?: MotifVoice;
  glyph?: string;
  className?: string;
}

export function Motif({
  role,
  voice = "sacred",
  glyph,
  className = "",
}: MotifProps) {
  const resolvedGlyph = glyph || (role === "divider" ? DIVIDER_GLYPH : BALANCED_GLYPH);

  const roleClass = `motif-${role}`;
  const voiceClass = `motif-${voice}`;
  const glyphClass = `motif-${resolvedGlyph}`;

  return (
    <div
      className={`motif ${glyphClass} ${roleClass} ${voiceClass} ${className}`.trim()}
      aria-hidden="true"
      role="separator"
    />
  );
}
