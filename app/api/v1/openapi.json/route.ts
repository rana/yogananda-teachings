/**
 * OpenAPI specification — M2a-23 (ADR-081, ADR-110).
 *
 * Machine-readable API documentation at /api/v1/openapi.json.
 * Hand-authored from route handler types. Auto-generation
 * may replace this in a future milestone.
 */

import { NextResponse } from "next/server";
import { PORTAL } from "@/lib/config/srf-links";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "SRF Teachings Portal API",
    version: "1.0.0",
    description:
      "Public API for accessing Paramahansa Yogananda's published teachings. All content is verbatim — no AI-generated text. Full attribution on every result.",
    contact: { url: PORTAL.canonical },
    license: {
      name: "Content: All Rights Reserved (Self-Realization Fellowship)",
      url: `${PORTAL.canonical}/en/legal`,
    },
  },
  servers: [{ url: `${PORTAL.canonical}/api/v1` }],
  paths: {
    "/health": {
      get: {
        operationId: "getHealth",
        summary: "System health check",
        tags: ["System"],
        responses: {
          "200": {
            description: "System healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "503": { description: "System down" },
        },
      },
    },
    "/books": {
      get: {
        operationId: "listBooks",
        summary: "List available books",
        tags: ["Books"],
        parameters: [
          {
            name: "language",
            in: "query",
            schema: { type: "string", example: "en" },
            description: "Filter by language code",
          },
          {
            name: "updated_since",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Return books updated after this timestamp (ISO 8601)",
          },
          {
            name: "created_since",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Return books created after this timestamp (ISO 8601)",
          },
        ],
        responses: {
          "200": {
            description: "Book list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Book" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/books/{bookId}/chapters/{chapter}": {
      get: {
        operationId: "getChapter",
        summary: "Get full chapter content with navigation",
        tags: ["Books"],
        parameters: [
          {
            name: "bookId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "chapter",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Chapter content with prev/next navigation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/ChapterContent" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid chapter number" },
          "404": { description: "Chapter not found" },
        },
      },
    },
    "/search": {
      get: {
        operationId: "search",
        summary: "Search Yogananda's teachings",
        description:
          "Hybrid search (vector + BM25 + RRF) returning ranked verbatim passages with full citations. No AI-generated content.",
        tags: ["Search"],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 500 },
            description: "Search query",
          },
          {
            name: "language",
            in: "query",
            schema: { type: "string", default: "en" },
            description: "Language code (defaults to en)",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20, maximum: 50 },
            description: "Maximum results to return",
          },
        ],
        responses: {
          "200": {
            description: "Search results with metadata",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchResponse" },
              },
            },
          },
          "400": { description: "Missing or invalid query" },
          "429": {
            description: "Rate limit exceeded",
            headers: {
              "Retry-After": {
                schema: { type: "integer" },
                description: "Seconds until rate limit resets",
              },
            },
          },
        },
      },
    },
    "/search/suggest": {
      get: {
        operationId: "searchSuggest",
        summary: "Search suggestions with fuzzy matching",
        tags: ["Search"],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 2 },
            description: "Prefix to match (minimum 2 characters)",
          },
          {
            name: "language",
            in: "query",
            schema: { type: "string", default: "en" },
          },
        ],
        responses: {
          "200": {
            description: "Suggestion list (max 5)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { type: "string" },
                      maxItems: 5,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/search/crisis": {
      get: {
        operationId: "crisisDetection",
        summary: "Crisis query detection",
        description:
          "Checks if a query contains crisis indicators. Returns helpline information when detected. Does not suppress search results.",
        tags: ["Search"],
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Query to check",
          },
          {
            name: "language",
            in: "query",
            schema: { type: "string", default: "en" },
          },
        ],
        responses: {
          "200": {
            description: "Crisis detection result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CrisisResponse" },
              },
            },
          },
        },
      },
    },
    "/passages/random": {
      get: {
        operationId: "randomPassage",
        summary: "Random passage for Today's Wisdom",
        tags: ["Passages"],
        parameters: [
          {
            name: "language",
            in: "query",
            schema: { type: "string", default: "en" },
          },
        ],
        responses: {
          "200": {
            description: "Random passage with citation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Passage" },
                  },
                },
              },
            },
          },
          "404": { description: "No passages available" },
        },
      },
    },
  },
  components: {
    schemas: {
      Book: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          author: { type: "string" },
          language: { type: "string" },
          publicationYear: { type: "integer", nullable: true },
          coverImageUrl: { type: "string", nullable: true },
          bookstoreUrl: { type: "string", nullable: true },
        },
      },
      ChapterContent: {
        type: "object",
        properties: {
          chapter: {
            type: "object",
            properties: {
              id: { type: "string" },
              chapterNumber: { type: "integer" },
              title: { type: "string" },
            },
          },
          book: { $ref: "#/components/schemas/Book" },
          paragraphs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                content: { type: "string" },
                pageNumber: { type: "integer", nullable: true },
              },
            },
          },
          prevChapter: {
            type: "object",
            nullable: true,
            properties: {
              chapterNumber: { type: "integer" },
              title: { type: "string" },
            },
          },
          nextChapter: {
            type: "object",
            nullable: true,
            properties: {
              chapterNumber: { type: "integer" },
              title: { type: "string" },
            },
          },
        },
      },
      SearchResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Passage" },
          },
          meta: {
            type: "object",
            properties: {
              query: { type: "string" },
              mode: { type: "string" },
              language: { type: "string" },
              totalResults: { type: "integer" },
              durationMs: { type: "number" },
              fallbackLanguage: { type: "string", nullable: true },
            },
          },
        },
      },
      Passage: {
        type: "object",
        properties: {
          id: { type: "string" },
          content: { type: "string" },
          citation: {
            type: "object",
            properties: {
              bookId: { type: "string" },
              book: { type: "string" },
              author: { type: "string" },
              chapter: { type: "string" },
              chapterNumber: { type: "integer" },
              page: { type: "integer", nullable: true },
            },
          },
          language: { type: "string" },
          score: { type: "number", nullable: true },
        },
      },
      CrisisResponse: {
        type: "object",
        properties: {
          detected: { type: "boolean" },
          helpline: {
            type: "object",
            nullable: true,
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              text: { type: "string" },
              url: { type: "string" },
            },
          },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["up", "degraded", "down"] },
          version: { type: "string" },
          checks: {
            type: "object",
            properties: {
              database: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  latencyMs: { type: "number" },
                },
              },
              search: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  chunkCount: { type: "integer" },
                },
              },
              books: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  count: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
