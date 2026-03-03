/**
 * Rich text renderer — PRI-01 verbatim fidelity.
 *
 * Renders paragraph text with formatting spans (italic, bold, small-caps,
 * superscript) and links footnote markers to chapter notes. Server Component
 * — zero JS. Footnote links are pure HTML anchors (PRI-05 progressive
 * enhancement, PRI-07 accessibility).
 *
 * DPUB-ARIA: superscript footnote markers use role="doc-noteref".
 */

import type { FormattingSpan, Footnote } from "@/lib/services/books";

/** Normalize Unicode superscript digits (¹²³) to plain digits (123). */
function normalizeSuperscript(text: string): string {
  return text
    .replace(/⁰/g, "0").replace(/¹/g, "1").replace(/²/g, "2")
    .replace(/³/g, "3").replace(/⁴/g, "4").replace(/⁵/g, "5")
    .replace(/⁶/g, "6").replace(/⁷/g, "7").replace(/⁸/g, "8")
    .replace(/⁹/g, "9");
}

interface RichTextProps {
  text: string;
  formatting: FormattingSpan[];
  footnotes?: Footnote[];
}

/**
 * Split text into segments by formatting span boundaries, then render
 * each segment with the appropriate HTML wrapper.
 */
export function RichText({ text, formatting, footnotes }: RichTextProps) {
  if (!formatting || formatting.length === 0) {
    return <>{text}</>;
  }

  // Build sorted breakpoints from all span boundaries
  const points = new Set<number>();
  points.add(0);
  points.add(text.length);
  for (const span of formatting) {
    if (span.start >= 0 && span.start <= text.length) points.add(span.start);
    if (span.end >= 0 && span.end <= text.length) points.add(span.end);
  }
  const sorted = [...points].sort((a, b) => a - b);

  // Build segments with their associated style
  const segments: React.ReactElement[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const segText = text.slice(start, end);
    if (!segText) continue;

    // Find which formatting span covers this segment
    const span = formatting.find((s) => s.start <= start && s.end >= end);
    const style = span?.style || null;

    if (style === "superscript") {
      // Check if this superscript is a footnote marker
      const normalized = normalizeSuperscript(segText).trim();
      const footnote = footnotes?.find(
        (fn) => fn.marker === normalized || normalizeSuperscript(fn.marker) === normalized,
      );
      if (footnote) {
        segments.push(
          <sup key={i} id={`fnref-${normalized}`} className="footnote-ref">
            <a href={`#fn-${normalized}`} role="doc-noteref" aria-label={`Footnote ${normalized}`}>
              {normalized}
            </a>
          </sup>,
        );
        continue;
      }
      // Non-footnote superscript
      segments.push(<sup key={i}>{normalizeSuperscript(segText)}</sup>);
    } else if (style === "italic") {
      segments.push(<em key={i}>{segText}</em>);
    } else if (style === "bold") {
      segments.push(<strong key={i}>{segText}</strong>);
    } else if (style === "bold-italic") {
      segments.push(<strong key={i}><em>{segText}</em></strong>);
    } else if (style === "small-caps") {
      segments.push(<span key={i} className="small-caps">{segText}</span>);
    } else {
      segments.push(<span key={i}>{segText}</span>);
    }
  }

  return <>{segments}</>;
}
