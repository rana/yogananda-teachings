/**
 * Rich text renderer — PRI-01 verbatim fidelity.
 *
 * Renders paragraph text with formatting spans (italic, bold, small-caps,
 * superscript) and links footnote markers to chapter notes. Server Component
 * — zero JS. Footnote links are pure HTML anchors (PRI-05 progressive
 * enhancement, PRI-07 accessibility).
 *
 * Drop cap: when `dropCap` is true, the first actual letter (skipping any
 * leading superscript markers) is wrapped in a .drop-cap span. This avoids
 * the CSS ::first-letter pseudo-element grabbing footnote numbers.
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

/** Check if text is purely digit-like (footnote marker artifact). */
function isDigitOnly(text: string): boolean {
  return /^[\d⁰¹²³⁴⁵⁶⁷⁸⁹]+$/.test(text.trim());
}

interface RichTextProps {
  text: string;
  formatting: FormattingSpan[];
  footnotes?: Footnote[];
  /** Render first letter as an explicit drop cap (for chapter-opening paragraphs). */
  dropCap?: boolean;
}

/**
 * Split text into segments by formatting span boundaries, then render
 * each segment with the appropriate HTML wrapper.
 */
export function RichText({ text, formatting, footnotes, dropCap }: RichTextProps) {
  if (!formatting || formatting.length === 0) {
    // Plain text path — no formatting spans
    if (dropCap && text.length > 0) {
      return <>{renderDropCap(text)}</>;
    }
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
  const segments: React.ReactNode[] = [];
  let dropCapApplied = false;

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
      // Orphaned digit superscript in a chapter that has footnotes — likely an
      // extraction artifact (page number, unmatched marker). Suppress it.
      // When footnotes is empty/undefined, keep digit superscripts (E=mc²).
      if (isDigitOnly(segText) && footnotes && footnotes.length > 0) continue;
      // Legitimate superscript — render normally
      segments.push(<sup key={i}>{normalizeSuperscript(segText)}</sup>);
    } else if (style === "italic") {
      segments.push(applyDropCap(<em key={i}>{segText}</em>, segText, i));
    } else if (style === "bold") {
      segments.push(applyDropCap(<strong key={i}>{segText}</strong>, segText, i));
    } else if (style === "bold-italic") {
      segments.push(applyDropCap(<strong key={i}><em>{segText}</em></strong>, segText, i));
    } else if (style === "small-caps") {
      segments.push(applyDropCap(<span key={i} className="small-caps">{segText}</span>, segText, i));
    } else {
      // Plain text segment
      if (dropCap && !dropCapApplied) {
        dropCapApplied = true;
        segments.push(<span key={i}>{renderDropCap(segText)}</span>);
      } else {
        segments.push(<span key={i}>{segText}</span>);
      }
    }
  }

  return <>{segments}</>;

  /** Wrap the first letter of a plain text string in a drop-cap span. */
  function renderDropCap(str: string): React.ReactNode {
    // Find first actual letter (skip whitespace, digits, punctuation)
    const match = str.match(/^(\s*)([\p{L}])(.*)/su);
    if (!match) return str;
    const [, leading, letter, rest] = match;
    return (
      <>
        {leading}
        <span className="drop-cap" aria-hidden="true">{letter}</span>
        {/* Screen readers get the full text naturally; drop-cap is visual only */}
        <span className="sr-only">{letter}</span>
        {rest}
      </>
    );
  }

  /** For styled segments: apply drop cap to the first one if needed. */
  function applyDropCap(
    element: React.ReactElement,
    segText: string,
    key: number,
  ): React.ReactNode {
    if (!dropCap || dropCapApplied || !segText.trim()) return element;
    // Don't apply drop cap inside styled spans (italic chapter subtitles etc.)
    // — drop cap should only be on the first plain text letter
    return element;
  }
}
