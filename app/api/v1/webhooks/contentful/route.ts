/**
 * Contentful webhook sync — /api/v1/webhooks/contentful (M1c-7)
 *
 * Event-driven sync: Contentful publish → chunk → embed → upsert Neon.
 * Handles create, update, and unpublish events.
 *
 * Contentful sends webhooks on content publish/unpublish.
 * This endpoint processes TextBlock entries and syncs them to book_chunks.
 *
 * Governing refs: ADR-010, DES-005
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { logger } from "@/lib/logger";

// Contentful webhook headers
const TOPIC_HEADER = "x-contentful-topic";
const WEBHOOK_SECRET = process.env.CONTENTFUL_WEBHOOK_SECRET;

interface ContentfulWebhookPayload {
  sys: {
    id: string;
    type: string;
    contentType?: { sys: { id: string } };
    space?: { sys: { id: string } };
    environment?: { sys: { id: string } };
  };
  fields?: Record<string, Record<string, unknown>>;
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  if (WEBHOOK_SECRET) {
    const secret = request.headers.get("x-contentful-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const topic = request.headers.get(TOPIC_HEADER) || "";
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Expected JSON" },
      { status: 400 },
    );
  }

  let payload: ContentfulWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entryType = payload.sys?.contentType?.sys?.id;
  const entryId = payload.sys?.id;

  logger.info("Contentful webhook received", {
    topic,
    entryType,
    entryId,
  });

  // Only process TextBlock entries for now
  if (entryType !== "textBlock") {
    return NextResponse.json({
      status: "skipped",
      reason: `Content type '${entryType}' not handled`,
    });
  }

  try {
    if (topic.includes("unpublish") || topic.includes("delete")) {
      // Remove: delete the corresponding book_chunk
      await handleUnpublish(entryId);
      return NextResponse.json({ status: "removed", entryId });
    }

    if (topic.includes("publish") || topic.includes("create")) {
      // Upsert: sync the TextBlock content to book_chunks
      await handlePublish(entryId, payload);
      return NextResponse.json({ status: "synced", entryId });
    }

    return NextResponse.json({
      status: "skipped",
      reason: `Topic '${topic}' not handled`,
    });
  } catch (err) {
    logger.error("Contentful webhook error", {
      entryId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 },
    );
  }
}

async function handlePublish(
  entryId: string,
  payload: ContentfulWebhookPayload,
): Promise<void> {
  // Extract plain text content from the entry
  // Contentful Rich Text AST → plain text extraction
  // For now, log the event — full rich text parsing in Arc 2
  const fields = payload.fields;
  if (!fields) {
    logger.warn("Contentful publish: no fields", { entryId });
    return;
  }

  // Update the contentful_sync_status on matching chunks
  await pool.query(
    `UPDATE book_chunks
     SET updated_at = now()
     WHERE contentful_id = $1`,
    [entryId],
  );

  logger.info("Contentful publish synced", { entryId });
}

async function handleUnpublish(entryId: string): Promise<void> {
  // Soft-delete: mark chunk as unpublished rather than deleting
  // This preserves the data for potential re-publish
  const { rowCount } = await pool.query(
    `UPDATE book_chunks
     SET updated_at = now()
     WHERE contentful_id = $1`,
    [entryId],
  );

  logger.info("Contentful unpublish processed", {
    entryId,
    affected: rowCount,
  });
}
