/**
 * Global 404 page — catches requests outside locale prefixes.
 *
 * Uses plain HTML (no next-intl context available).
 * Warm, helpful absence.
 */

import Link from "next/link";
import { Motif } from "@/app/components/design/Motif";
import { getDailyQuote } from "@/lib/quotes";

export default function GlobalNotFound() {
  const quote = getDailyQuote("en");

  return (
    <div className="empty-state">
      <Motif role="breath" voice="sacred" />
      <h1 className="page-title">
        This page could not be found
      </h1>
      <nav aria-label="Helpful links" className="error-nav">
        <Link href="/en" className="btn-secondary">Home</Link>
        <Link href="/en/search" className="btn-secondary">Search</Link>
        <Link href="/en/books" className="btn-secondary">Books</Link>
      </nav>
      <blockquote className="reader-epigraph" style={{ maxInlineSize: "32em" }}>
        {quote.text}
      </blockquote>
      <p className="reader-citation">{quote.source}</p>
    </div>
  );
}
