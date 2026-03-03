/**
 * GET /api/v1/passages/:id/related — M3c-2 (ADR-050, ADR-011).
 *
 * On-demand tier: related passages for a single chunk.
 * Used by the mobile bottom sheet when tapping a golden thread indicator.
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRelatedPassages } from "@/lib/services/relations";
import { RELATIONS_DISPLAY_LIMIT } from "@/lib/config";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || id.length < 10) {
    return NextResponse.json(
      { error: "Invalid passage ID" },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || String(RELATIONS_DISPLAY_LIMIT), 10),
    30,
  );

  const related = await getRelatedPassages(pool, id, limit);

  return NextResponse.json({
    data: related,
    meta: {
      passageId: id,
      totalResults: related.length,
    },
  });
}
