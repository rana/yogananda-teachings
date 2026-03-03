/**
 * Web App Manifest — M2b stretch (ADR-012).
 *
 * Makes the portal installable as a PWA.
 * Service Worker (public/sw.js) handles offline caching.
 * Display: standalone — no browser chrome.
 * Theme: SRF Navy (#1a2744), background: Warm Cream (#FAF8F5).
 */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SRF Teachings Portal",
    short_name: "Teachings",
    description:
      "Paramahansa Yogananda's published teachings — freely accessible worldwide",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#1a2744",
    orientation: "any",
    categories: ["books", "education"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
