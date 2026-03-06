/**
 * next-intl middleware — M2a-9, M2a-17 (FTR-058).
 *
 * Detects locale from URL path prefix, Accept-Language header,
 * or stored preference. Default English omits prefix.
 * API routes and static files are excluded.
 */

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, static files, and Next.js internals
  matcher: [
    "/",
    "/(en|es)/:path*",
    "/((?!api|_next|_vercel|sw\\.js|.*\\..*).*)",
  ],
};
