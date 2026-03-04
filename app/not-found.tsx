/**
 * Global 404 page — catches requests outside locale prefixes.
 *
 * Uses plain HTML (no next-intl context available).
 * Warm, helpful absence.
 */

import Link from "next/link";
import { Motif } from "@/app/components/design/Motif";

export default function GlobalNotFound() {
  return (
    <div className="empty-state">
      <Motif role="breath" voice="sacred" />
      <h1 className="page-title" style={{ marginBlockStart: "var(--space-generous)" }}>
        This page could not be found
      </h1>
      <p className="page-subtitle" style={{ maxInlineSize: "28em" }}>
        The path you followed may have changed. The teachings await you at any
        of these places:
      </p>
      <nav
        className="cluster"
        aria-label="Helpful links"
        style={{ marginBlockStart: "var(--space-spacious)" }}
      >
        <Link href="/en" className="btn-secondary">Home</Link>
        <Link href="/en/search" className="btn-secondary">Search</Link>
        <Link href="/en/books" className="btn-secondary">Books</Link>
      </nav>
    </div>
  );
}
