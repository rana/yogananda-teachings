/**
 * Chapter footnotes section — PRI-01 verbatim fidelity.
 *
 * Renders footnotes at the end of the chapter with bidirectional links:
 * marker in text → note definition, back-arrow → marker location.
 * Server Component — zero JS. Pure HTML anchors.
 *
 * DPUB-ARIA: section uses role="doc-endnotes", back-links use role="doc-backlink".
 * Print stylesheet always shows this section (seekers print at cybercafés, PRI-05).
 */

import type { Footnote } from "@/lib/services/books";

/** Normalize Unicode superscript digits to plain digits for matching. */
function normalizeMarker(marker: string): string {
  return marker
    .replace(/⁰/g, "0").replace(/¹/g, "1").replace(/²/g, "2")
    .replace(/³/g, "3").replace(/⁴/g, "4").replace(/⁵/g, "5")
    .replace(/⁶/g, "6").replace(/⁷/g, "7").replace(/⁸/g, "8")
    .replace(/⁹/g, "9")
    .trim();
}

/** Strip leading marker number from footnote text (e.g., "1 Spiritual teacher..." → "Spiritual teacher..."). */
function stripLeadingMarker(text: string): string {
  return text.replace(/^\d+\s*/, "").trim();
}

interface ChapterNotesProps {
  footnotes: Footnote[];
}

export function ChapterNotes({ footnotes }: ChapterNotesProps) {
  if (!footnotes || footnotes.length === 0) return null;

  return (
    <aside
      role="doc-endnotes"
      aria-label="Chapter notes"
      className="chapter-notes mx-auto max-w-[38rem] px-4 pb-8"
    >
      <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide uppercase text-srf-navy/40">
        Notes
      </h2>
      <ol className="list-decimal space-y-3 ps-6 text-sm leading-relaxed text-srf-navy/70">
        {footnotes.map((fn, i) => {
          const marker = normalizeMarker(fn.marker) || String(i + 1);
          return (
            <li key={marker} id={`fn-${marker}`} value={parseInt(marker, 10) || i + 1}>
              <p>
                {stripLeadingMarker(fn.text)}{" "}
                <a
                  href={`#fnref-${marker}`}
                  role="doc-backlink"
                  aria-label={`Back to text, note ${marker}`}
                  className="footnote-backlink"
                >
                  ↩
                </a>
              </p>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
