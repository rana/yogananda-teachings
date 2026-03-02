/**
 * Robots.txt — M2a-7.
 *
 * Allows all crawlers, points to sitemap.
 * Blocks API and internal routes.
 */

import type { MetadataRoute } from "next";
import { PORTAL } from "@/lib/config/srf-links";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/ops"],
    },
    sitemap: `${PORTAL.canonical}/sitemap.xml`,
  };
}
