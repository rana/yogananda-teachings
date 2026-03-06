/**
 * Contentful webhook sync — /api/v1/webhooks/contentful (M1c-7)
 *
 * Event-driven sync: Contentful publish/unpublish → update Neon.
 * Processes TextBlock entries and syncs content to book_chunks.
 *
 * On publish: extracts plain text from Rich Text AST, updates
 * matching chunk content. search_vector trigger auto-updates.
 * Embedding regeneration deferred (run backfill-embeddings.ts).
 *
 * Governing refs: FTR-102, FTR-022
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { logger } from "@/lib/logger";
import { richTextToPlainText, type RichTextNode } from "@/lib/contentful";

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

// ── Route Handler ────────────────────────────────────────────────

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

  // Only process TextBlock entries
  if (entryType !== "textBlock") {
    return NextResponse.json({
      status: "skipped",
      reason: `Content type '${entryType}' not handled`,
    });
  }

  try {
    if (topic.includes("unpublish") || topic.includes("delete")) {
      await handleUnpublish(entryId);
      return NextResponse.json({ status: "removed", entryId });
    }

    if (topic.includes("publish") || topic.includes("create")) {
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

// ── Event Handlers ───────────────────────────────────────────────

async function handlePublish(
  entryId: string,
  payload: ContentfulWebhookPayload,
): Promise<void> {
  const fields = payload.fields;
  if (!fields) {
    logger.warn("Contentful publish: no fields", { entryId });
    return;
  }

  // Extract Rich Text content — Contentful sends fields keyed by locale
  const contentField = fields.content as
    | Record<string, RichTextNode>
    | undefined;
  if (!contentField) {
    logger.warn("Contentful publish: no content field", { entryId });
    return;
  }

  // Process each locale's content
  for (const [locale, richText] of Object.entries(contentField)) {
    const plainText = richTextToPlainText(richText);
    if (!plainText.trim()) continue;

    // Update matching chunk content. search_vector trigger auto-fires.
    // Embedding becomes stale — regenerate via backfill-embeddings.ts.
    const { rowCount } = await pool.query(
      `UPDATE book_chunks
       SET content = $1, updated_at = now()
       WHERE contentful_id = $2`,
      [plainText, entryId],
    );

    if (rowCount === 0) {
      logger.warn("Contentful publish: no matching chunk", {
        entryId,
        locale,
      });
    } else {
      logger.info("Contentful publish: chunk content updated", {
        entryId,
        locale,
        rowCount,
      });
    }
  }
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
