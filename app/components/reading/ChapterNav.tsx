/**
 * ChapterNav — previous/next chapter navigation.
 * Server Component. Uses design system tokens for styling.
 */

interface ChapterNavProps {
  bookSlug: string;
  prev: { id: string; chapterNumber: number; title: string } | null;
  next: { id: string; chapterNumber: number; title: string } | null;
}

export function ChapterNav({ bookSlug, prev, next }: ChapterNavProps) {
  if (!prev && !next) return null;

  return (
    <nav className="chapter-nav cluster" aria-label="Chapter navigation" data-register="functional">
      {prev ? (
        <a href={`/books/${bookSlug}/${prev.chapterNumber}`} className="chapter-nav-link chapter-nav-prev">
          <span className="chapter-nav-direction" aria-hidden="true">&larr;</span>
          <span className="chapter-nav-label">
            <span className="chapter-nav-number">Chapter {prev.chapterNumber}</span>
            <span className="chapter-nav-title">{prev.title}</span>
          </span>
        </a>
      ) : <span />}

      {next ? (
        <a href={`/books/${bookSlug}/${next.chapterNumber}`} className="chapter-nav-link chapter-nav-next">
          <span className="chapter-nav-label">
            <span className="chapter-nav-number">Chapter {next.chapterNumber}</span>
            <span className="chapter-nav-title">{next.title}</span>
          </span>
          <span className="chapter-nav-direction" aria-hidden="true">&rarr;</span>
        </a>
      ) : <span />}
    </nav>
  );
}
