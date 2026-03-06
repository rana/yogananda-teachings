/**
 * Resonance API route tests — POST /api/v1/passages/:id/resonance.
 *
 * M3a-7 (FTR-031). Tests route handler with mocked service layer.
 * Verifies HTTP status codes, JSON shapes, rate limiting, and validation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
  default: { query: vi.fn() },
}));

vi.mock("@/lib/services/resonance", () => ({
  incrementResonance: vi.fn(),
  checkResonanceRateLimit: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { POST } from "../passages/[id]/resonance/route";
import {
  incrementResonance,
  checkResonanceRateLimit,
} from "@/lib/services/resonance";

const mockIncrement = vi.mocked(incrementResonance);
const mockRateLimit = vi.mocked(checkResonanceRateLimit);

function makeRequest(
  id: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Request {
  return new Request(`http://localhost:3000/api/v1/passages/${id}/resonance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ── Tests ────────────────────────────────────────────────────────

describe("POST /api/v1/passages/:id/resonance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockReturnValue(true);
    mockIncrement.mockResolvedValue(undefined);
  });

  it("increments share count and returns ok", async () => {
    const req = makeRequest("chunk-12345678", { type: "share" });
    const res = await POST(req, makeParams("chunk-12345678"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(mockIncrement).toHaveBeenCalledWith(
      expect.anything(),
      "chunk-12345678",
      "share",
    );
  });

  it("increments dwell count", async () => {
    const req = makeRequest("chunk-12345678", { type: "dwell" });
    await POST(req, makeParams("chunk-12345678"));
    expect(mockIncrement).toHaveBeenCalledWith(
      expect.anything(),
      "chunk-12345678",
      "dwell",
    );
  });

  it("increments traverse count", async () => {
    const req = makeRequest("chunk-12345678", { type: "traverse" });
    await POST(req, makeParams("chunk-12345678"));
    expect(mockIncrement).toHaveBeenCalledWith(
      expect.anything(),
      "chunk-12345678",
      "traverse",
    );
  });

  it("increments skip count", async () => {
    const req = makeRequest("chunk-12345678", { type: "skip" });
    await POST(req, makeParams("chunk-12345678"));
    expect(mockIncrement).toHaveBeenCalledWith(
      expect.anything(),
      "chunk-12345678",
      "skip",
    );
  });

  it("returns 400 for invalid passage ID", async () => {
    const req = makeRequest("short", { type: "share" });
    const res = await POST(req, makeParams("short"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid passage ID");
    expect(mockIncrement).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid type", async () => {
    const req = makeRequest("chunk-12345678", { type: "invalid" });
    const res = await POST(req, makeParams("chunk-12345678"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid type");
    expect(mockIncrement).not.toHaveBeenCalled();
  });

  it("returns 400 for missing type", async () => {
    const req = makeRequest("chunk-12345678", {});
    const res = await POST(req, makeParams("chunk-12345678"));

    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON body", async () => {
    const req = new Request(
      "http://localhost:3000/api/v1/passages/chunk-12345678/resonance",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      },
    );
    const res = await POST(req, makeParams("chunk-12345678"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request body");
  });

  it("returns 429 when rate-limited", async () => {
    mockRateLimit.mockReturnValue(false);

    const req = makeRequest("chunk-12345678", { type: "share" });
    const res = await POST(req, makeParams("chunk-12345678"));

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.status).toBe("rate_limited");
    expect(mockIncrement).not.toHaveBeenCalled();
  });

  it("extracts IP from x-forwarded-for header", async () => {
    const req = makeRequest("chunk-12345678", { type: "share" }, {
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    await POST(req, makeParams("chunk-12345678"));

    expect(mockRateLimit).toHaveBeenCalledWith("1.2.3.4", "chunk-12345678", "share");
  });

  it("returns 500 on database error", async () => {
    mockIncrement.mockRejectedValue(new Error("DB connection failed"));

    const req = makeRequest("chunk-12345678", { type: "share" });
    const res = await POST(req, makeParams("chunk-12345678"));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to record resonance");
  });
});
