/**
 * ChapterNav — previous/next chapter navigation.
 * Server Component. Crimson navigational voice — matches the
 * sticky progress bar's visual language (SVG chevrons, small-caps).
 */

interface ChapterNavProps {
  bookSlug: string;
  prev: { id: string; chapterNumber: number; title: string } | null;
  next: { id: string; chapterNumber: number; title: string } | null;
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

export function ChapterNav({ bookSlug, prev, next }: ChapterNavProps) {
  if (!prev && !next) return null;

  return (
    <nav className="chapter-nav" aria-label="Chapter navigation" data-register="functional">
      {prev ? (
        <a href={`/books/${bookSlug}/${prev.chapterNumber}`} className="chapter-nav-link chapter-nav-prev">
          <span className="chapter-nav-direction" aria-hidden="true"><ChevronLeft /></span>
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
          <span className="chapter-nav-direction" aria-hidden="true"><ChevronRight /></span>
        </a>
      ) : <span />}
    </nav>
  );
}
