/**
 * Chapter navigation link — sets the breath flag before navigation.
 *
 * Wraps next-intl Link to enable the "Breath Between Chapters" (DES-012)
 * transition. Only prev/next chapter links use this component.
 */

"use client";

import { Link } from "@/i18n/navigation";
import { markChapterBreath } from "./ChapterBreath";

interface ChapterNavLinkProps {
  href: string;
  rel: "prev" | "next";
  className?: string;
  children: React.ReactNode;
}

export function ChapterNavLink({
  href,
  rel,
  className,
  children,
}: ChapterNavLinkProps) {
  return (
    <Link
      href={href}
      rel={rel}
      className={className}
      onClick={markChapterBreath}
    >
      {children}
    </Link>
  );
}
