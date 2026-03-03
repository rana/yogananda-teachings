"use client";

/**
 * New Book Badge — M3a-8.
 *
 * Shows a subtle "New" label next to books that were added
 * since the seeker's last visit to the Books page.
 */

import { useState, useEffect } from "react";
import { getNewBookIds } from "@/lib/new-books";

interface NewBookBadgeProps {
  bookId: string;
  allBookIds: string[];
}

export function NewBookBadge({ bookId, allBookIds }: NewBookBadgeProps) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const newIds = getNewBookIds(allBookIds);
    setIsNew(newIds.has(bookId));
  }, [bookId, allBookIds]);

  if (!isNew) return null;

  return (
    <span className="inline-block rounded-full bg-srf-gold/20 px-2 py-0.5 text-xs font-medium text-srf-gold">
      New
    </span>
  );
}
