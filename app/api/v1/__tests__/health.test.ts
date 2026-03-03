/**
 * Health & webhook API route tests — /api/v1/health, /api/v1/webhooks/contentful.
 *
 * Tests route handlers with mocked service layers and db pool.
 * Verifies HTTP status codes, JSON response shapes, headers, and error cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────

const mockQuery = vi.fn();

vi.mock("@/lib/db", () => ({
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

vi.mock("@/lib/services/health", () => ({
  getHealthStatus: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { GET as healthGET } from "../health/route";
import { POST as webhookPOST } from "../webhooks/contentful/route";
import { richTextToPlainText } from "@/lib/contentful";
import { getHealthStatus } from "@/lib/services/health";

const mockGetHealthStatus = vi.mocked(getHealthStatus);

// ── /api/v1/health ──────────────────────────────────────────────

describe("/api/v1/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with full health status when healthy", async () => {
    mockGetHealthStatus.mockResolvedValue({
      status: "ok",
      version: "1.0.0",
      milestone: "1c",
      timestamp: "2026-03-02T00:00:00.000Z",
      checks: {
        database: { status: "ok", latencyMs: 5 },
        search: { status: "ok", chunksCount: 2681, embeddingsCount: 2681 },
        books: { count: 2, languages: ["en", "es"] },
      },
    });

    const res = await healthGET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.version).toBe("1.0.0");
    expect(body.milestone).toBe("1c");
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.search.chunksCount).toBe(2681);
    expect(body.checks.books.count).toBe(2);
    expect(body.checks.books.languages).toEqual(["en", "es"]);
  });

  it("returns 200 with degraded status when search is down", async () => {
    mockGetHealthStatus.mockResolvedValue({
      status: "degraded",
      version: "1.0.0",
      milestone: "1c",
      timestamp: "2026-03-02T00:00:00.000Z",
      checks: {
        database: { status: "ok", latencyMs: 3 },
        search: { status: "error", chunksCount: 0, embeddingsCount: 0 },
        books: { count: 0, languages: [] },
      },
    });

    const res = await healthGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("degraded");
  });

  it("returns 503 when database is down", async () => {
    mockGetHealthStatus.mockResolvedValue({
      status: "down",
      version: "1.0.0",
      milestone: "1c",
      timestamp: "2026-03-02T00:00:00.000Z",
      checks: {
        database: { status: "error", latencyMs: 5000, error: "Connection refused" },
        search: { status: "error", chunksCount: 0, embeddingsCount: 0 },
        books: { count: 0, languages: [] },
      },
    });

    const res = await healthGET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("down");
    expect(body.checks.database.error).toBe("Connection refused");
  });

  it("sets Cache-Control: no-store", async () => {
    mockGetHealthStatus.mockResolvedValue({
      status: "ok",
      version: "1.0.0",
      milestone: "1c",
      timestamp: "2026-03-02T00:00:00.000Z",
      checks: {
        database: { status: "ok", latencyMs: 2 },
        search: { status: "ok", chunksCount: 100, embeddingsCount: 100 },
        books: { count: 1, languages: ["en"] },
      },
    });

    const res = await healthGET();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

// ── /api/v1/webhooks/contentful ─────────────────────────────────

describe("/api/v1/webhooks/contentful", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the webhook secret env so most tests don't need to set it
    delete process.env.CONTENTFUL_WEBHOOK_SECRET;
  });

  function makeWebhookRequest(
    body: Record<string, unknown>,
    headers?: Record<string, string>,
  ): NextRequest {
    const defaultHeaders: Record<string, string> = {
      "content-type": "application/json",
      "x-contentful-topic": "ContentManagement.Entry.publish",
      ...headers,
    };
    return new NextRequest(
      new URL("http://localhost:3000/api/v1/webhooks/contentful"),
      {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(body),
      },
    );
  }

  /** Rich Text AST document for testing */
  const richTextContent = {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value: "The characteristic features of ",
            marks: [],
            data: {},
          },
          {
            nodeType: "text",
            value: "Indian culture",
            marks: [{ type: "italic" }],
            data: {},
          },
          {
            nodeType: "text",
            value: " have long been a search for ultimate verities.",
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };

  const textBlockPayload = {
    sys: {
      id: "entry-123",
      type: "Entry",
      contentType: { sys: { id: "textBlock" } },
      space: { sys: { id: "space-1" } },
    },
    fields: {
      content: { "en-US": richTextContent },
    },
  };

  it("processes a textBlock publish event with Rich Text content", async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });

    const req = makeWebhookRequest(textBlockPayload);
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("synced");
    expect(body.entryId).toBe("entry-123");

    // Verify the UPDATE query received plain text extracted from Rich Text
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE book_chunks"),
      expect.arrayContaining([
        "The characteristic features of Indian culture have long been a search for ultimate verities.",
        "entry-123",
      ]),
    );
  });

  it("processes a textBlock unpublish event", async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });

    const req = makeWebhookRequest(textBlockPayload, {
      "content-type": "application/json",
      "x-contentful-topic": "ContentManagement.Entry.unpublish",
    });
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("removed");
    expect(body.entryId).toBe("entry-123");
  });

  it("skips non-textBlock content types", async () => {
    const nonTextBlock = {
      sys: {
        id: "entry-456",
        type: "Entry",
        contentType: { sys: { id: "chapter" } },
      },
      fields: {},
    };

    const req = makeWebhookRequest(nonTextBlock);
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("skipped");
    expect(body.reason).toContain("chapter");
  });

  it("skips unhandled topic types", async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });

    const req = makeWebhookRequest(textBlockPayload, {
      "content-type": "application/json",
      "x-contentful-topic": "ContentManagement.Entry.archive",
    });
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("skipped");
    expect(body.reason).toContain("archive");
  });

  it("returns 400 for non-JSON content type", async () => {
    const req = new NextRequest(
      new URL("http://localhost:3000/api/v1/webhooks/contentful"),
      {
        method: "POST",
        headers: {
          "content-type": "text/plain",
          "x-contentful-topic": "ContentManagement.Entry.publish",
        },
        body: "not json",
      },
    );
    const res = await webhookPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Expected JSON");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest(
      new URL("http://localhost:3000/api/v1/webhooks/contentful"),
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-contentful-topic": "ContentManagement.Entry.publish",
        },
        body: "{ invalid json",
      },
    );
    const res = await webhookPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON");
  });

  it("returns 500 when database query fails during publish", async () => {
    mockQuery.mockRejectedValue(new Error("Connection pool exhausted"));

    const req = makeWebhookRequest(textBlockPayload);
    const res = await webhookPOST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Sync failed");
  });

  it("handles publish event with missing fields gracefully", async () => {
    const noFields = {
      sys: {
        id: "entry-789",
        type: "Entry",
        contentType: { sys: { id: "textBlock" } },
      },
    };

    const req = makeWebhookRequest(noFields);
    const res = await webhookPOST(req);
    // Should succeed — handlePublish logs a warning for missing fields but does not throw
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("synced");
  });

  it("handles delete topic by processing as unpublish", async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });

    const req = makeWebhookRequest(textBlockPayload, {
      "content-type": "application/json",
      "x-contentful-topic": "ContentManagement.Entry.delete",
    });
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("removed");
  });

  it("handles create topic by processing as publish", async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });

    const req = makeWebhookRequest(textBlockPayload, {
      "content-type": "application/json",
      "x-contentful-topic": "ContentManagement.Entry.create",
    });
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("synced");
  });

  it("handles publish with no content field gracefully", async () => {
    const noContent = {
      sys: {
        id: "entry-no-content",
        type: "Entry",
        contentType: { sys: { id: "textBlock" } },
      },
      fields: {
        pageNumber: { "en-US": 42 },
      },
    };

    const req = makeWebhookRequest(noContent);
    const res = await webhookPOST(req);
    expect(res.status).toBe(200);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

// ── richTextToPlainText unit tests ──────────────────────────────

describe("richTextToPlainText", () => {
  it("extracts plain text from a single paragraph", () => {
    const doc = {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "Hello world", marks: [], data: {} },
          ],
        },
      ],
    };
    expect(richTextToPlainText(doc)).toBe("Hello world");
  });

  it("joins multiple paragraphs with double newlines", () => {
    const doc = {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "First paragraph.", marks: [], data: {} },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "Second paragraph.", marks: [], data: {} },
          ],
        },
      ],
    };
    expect(richTextToPlainText(doc)).toBe(
      "First paragraph.\n\nSecond paragraph.",
    );
  });

  it("strips formatting marks and concatenates text nodes", () => {
    const doc = {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "normal ", marks: [], data: {} },
            {
              nodeType: "text",
              value: "bold",
              marks: [{ type: "bold" }],
              data: {},
            },
            { nodeType: "text", value: " text", marks: [], data: {} },
          ],
        },
      ],
    };
    expect(richTextToPlainText(doc)).toBe("normal bold text");
  });

  it("returns empty string for null/undefined input", () => {
    expect(richTextToPlainText(null as never)).toBe("");
    expect(richTextToPlainText(undefined as never)).toBe("");
  });

  it("skips empty paragraphs", () => {
    const doc = {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "Content", marks: [], data: {} },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "  ", marks: [], data: {} },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", value: "More content", marks: [], data: {} },
          ],
        },
      ],
    };
    expect(richTextToPlainText(doc)).toBe("Content\n\nMore content");
  });
});
