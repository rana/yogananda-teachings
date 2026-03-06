/**
 * OG quote image generation — M2a-6 (FTR-048, FTR-132).
 *
 * Generates 1200×630 open graph images for passage sharing.
 * Warm cream background, Merriweather-style serif, lotus mark,
 * SRF copyright. Used by passage detail pages for rich previews.
 *
 * Usage: /api/og?text=...&author=...&book=...&chapter=...
 */

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const text = searchParams.get("text") || "";
  const author = searchParams.get("author") || "Paramahansa Yogananda";
  const book = searchParams.get("book") || "";
  const chapter = searchParams.get("chapter") || "";

  // Truncate text for image (max ~280 chars looks good)
  const displayText =
    text.length > 280 ? text.slice(0, 277) + "..." : text;

  const citation = [author, book, chapter].filter(Boolean).join(" — ");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FAF8F5",
          padding: "60px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top decorative line */}
        <div
          style={{
            width: "60px",
            height: "2px",
            backgroundColor: "#dcbd23",
            marginBottom: "40px",
          }}
        />

        {/* Quote text */}
        <div
          style={{
            fontSize: displayText.length > 200 ? 24 : displayText.length > 100 ? 28 : 32,
            lineHeight: 1.6,
            color: "#1a2744",
            textAlign: "center",
            maxWidth: "900px",
            display: "flex",
          }}
        >
          &ldquo;{displayText}&rdquo;
        </div>

        {/* Citation */}
        <div
          style={{
            fontSize: 16,
            color: "#1a2744",
            opacity: 0.5,
            marginTop: "32px",
            display: "flex",
          }}
        >
          — {citation}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#dcbd23", fontSize: "16px" }}>❁</span>
          <span
            style={{
              fontSize: "12px",
              color: "#1a2744",
              opacity: 0.3,
              letterSpacing: "0.05em",
            }}
          >
            SRF Teachings Portal
          </span>
        </div>

        {/* Copyright */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "40px",
            fontSize: "10px",
            color: "#1a2744",
            opacity: 0.2,
            display: "flex",
          }}
        >
          © Self-Realization Fellowship
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
