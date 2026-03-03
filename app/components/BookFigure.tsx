/**
 * Book figure — PRI-01 verbatim fidelity, PRI-07 accessibility.
 *
 * Renders a book photograph with its caption inside semantic
 * <figure>/<figcaption> markup. Wraps AdaptiveImage for
 * PRI-05 global-first progressive enhancement.
 *
 * Server Component shell — AdaptiveImage is the only client leaf.
 */

import { AdaptiveImage } from "@/app/components/AdaptiveImage";
import type { ChapterImage } from "@/lib/services/books";

interface BookFigureProps {
  image: ChapterImage;
}

export function BookFigure({ image }: BookFigureProps) {
  return (
    <figure className="book-figure">
      <AdaptiveImage
        src={image.imagePath}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className="book-figure-img"
      />
      {image.caption && (
        <figcaption className="book-caption">{image.caption}</figcaption>
      )}
    </figure>
  );
}
