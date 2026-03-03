"use client";

/**
 * New Books indicator — M3a-8.
 *
 * Renders a subtle 6px gold dot beside the "Books" nav link
 * when new books have been added since the seeker's last visit
 * to the Books page.
 *
 * Initialized on first render — first-time visitors see no dot.
 * The dot appears only after the catalog is updated (version bump).
 *
 * No tracking, no analytics (PRI-08, PRI-09).
 */

import { useState, useEffect } from "react";
import { hasUnseenBooks, initBooksTracker } from "@/lib/new-books";

export function NewBooksIndicator() {
  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    // Initialize tracker for first-time visitors (sets baseline)
    initBooksTracker();
    // Check if there are unseen books
    setShowDot(hasUnseenBooks());
  }, []);

  if (!showDot) return null;

  return (
    <span
      className="absolute -top-0.5 -end-0.5 h-1.5 w-1.5 rounded-full bg-srf-gold"
      aria-hidden="true"
    />
  );
}
