/**
 * POST /api/v1/passages/:id/resonance — M3a-7 (ADR-052).
 *
 * Increment anonymous passage resonance counters.
 * DELTA-compliant: no user identification, no session tracking.
 * Rate-limited: 1 increment per IP per hour per chunk per type.
 *
 * Body: { "type": "share" | "dwell" | "traverse" | "skip" }
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  incrementResonance,
  checkResonanceRateLimit,
  type ResonanceType,
} from "@/lib/services/resonance";
import { logger } from "@/lib/logger";

const VALID_TYPES: ResonanceType[] = ["share", "dwell", "traverse", "skip"];

export async function POST(
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

  let body: { type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const type = body.type as ResonanceType;
  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  // Rate limit: 1 increment per IP per hour per chunk per type
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkResonanceRateLimit(ip, id, type)) {
    return NextResponse.json(
      { status: "rate_limited" },
      { status: 429 },
    );
  }

  try {
    await incrementResonance(pool, id, type);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    logger.error("Resonance increment error", {
      chunkId: id,
      type,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to record resonance" },
      { status: 500 },
    );
  }
}
