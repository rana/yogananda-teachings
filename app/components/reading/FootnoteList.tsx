/**
 * FootnoteList — chapter footnotes rendered as an ordered list.
 * Server Component. DPUB-ARIA roles for accessibility.
 */

import type { Footnote } from "@/lib/services/books";
import { Surface } from "@/app/components/design/Surface";

interface FootnoteListProps {
  footnotes: Footnote[];
}

export function FootnoteList({ footnotes }: FootnoteListProps) {
  return (
    <Surface as="aside" register="instructional" className="footnote-list">
      <h2>Notes</h2>
      <ol role="doc-endnotes">
        {footnotes.map((fn) => (
          <li key={fn.marker} id={`fn-${fn.marker}`} role="doc-endnote" className="footnote-item">
            <span className="footnote-marker">{fn.marker}.</span>
            <span>
              {fn.text}
              {" "}
              <a href={`#fnref-${fn.marker}`} role="doc-backlink" aria-label={`Back to reference ${fn.marker}`} className="footnote-backlink">
                ↩
              </a>
            </span>
          </li>
        ))}
      </ol>
    </Surface>
  );
}
