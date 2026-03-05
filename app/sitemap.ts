/**
 * Dynamic sitemap — M2a-7 (ADR-110).
 *
 * Generates a sitemap from the database at request time.
 * Includes all books, chapters, and static pages for each locale.
 */

import type { MetadataRoute } from "next";
import pool from "@/lib/db";
import { getBooks, getChapters } from "@/lib/services/books";
import { locales } from "@/i18n/config";
import { PORTAL } from "@/lib/config/srf-links";

const BASE_URL = PORTAL.canonical;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();

  // Static pages per locale
  const staticPages = [
    { path: "", freq: "daily" as const, priority: 1.0 },
    { path: "/search", freq: "weekly" as const, priority: 0.9 },
    { path: "/books", freq: "weekly" as const, priority: 0.8 },
    { path: "/quiet", freq: "daily" as const, priority: 0.7 },
    { path: "/browse", freq: "weekly" as const, priority: 0.6 },
    { path: "/privacy", freq: "monthly" as const, priority: 0.3 },
    { path: "/legal", freq: "monthly" as const, priority: 0.3 },
    { path: "/integrity", freq: "monthly" as const, priority: 0.4 },
  ];

  for (const locale of locales) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}${prefix}${page.path}`,
        lastModified: now,
        changeFrequency: page.freq,
        priority: page.priority,
      });
    }
  }

  // Dynamic book + chapter pages
  const books = await getBooks(pool);
  for (const book of books) {
    const chapters = await getChapters(pool, book.id);
    const locale = book.language === "en" ? "" : `/${book.language}`;

    entries.push({
      url: `${BASE_URL}${locale}/books/${book.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    for (const ch of chapters) {
      entries.push({
        url: `${BASE_URL}${locale}/books/${book.slug}/${ch.chapterNumber}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
