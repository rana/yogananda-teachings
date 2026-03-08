/**
 * Attribution — author and book credit. Always visible (PRI-02).
 * Server Component.
 */

import type { Book } from "@/lib/services/books";

interface AttributionProps {
  book: Book;
}

export function Attribution({ book }: AttributionProps) {
  return (
    <div className="attribution" data-register="ambient">
      <span className="attribution-author">{book.author}</span>
    </div>
  );
}
