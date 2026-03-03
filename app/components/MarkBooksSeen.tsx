"use client";

/**
 * Mark Books Seen — M3a-8.
 *
 * Invisible client component that marks the current book catalog
 * as "seen" when the Books page loads. Clears the nav gold dot
 * and establishes the baseline for "New" badges.
 *
 * No UI — pure side effect.
 */

import { useEffect } from "react";
import { markBooksSeen, getNewBookIds } from "@/lib/new-books";

interface MarkBooksSeenProps {
  bookIds: string[];
}

export function MarkBooksSeen({ bookIds }: MarkBooksSeenProps) {
  useEffect(() => {
    // Mark after a brief delay so "New" badges render before clearing
    const timer = setTimeout(() => {
      markBooksSeen(bookIds);
    }, 100);
    return () => clearTimeout(timer);
  }, [bookIds]);

  return null;
}

/**
 * Hook to get new book IDs for badge rendering.
 * Must be called in a client component.
 */
export { getNewBookIds };
