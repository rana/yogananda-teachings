/**
 * HyDE service tests — M3a-11.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateHypotheticalDocument, _resetClient } from "../hyde";

// Mock the Bedrock SDK
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/bedrock-sdk", () => {
  class MockBedrock {
    messages = { create: mockCreate };
  }
  return { default: MockBedrock };
});

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe("generateHypotheticalDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetClient();
    delete process.env.AWS_REGION;
    mockCreate.mockReset();
  });

  it("returns null when AWS_REGION is not set", async () => {
    const result = await generateHypotheticalDocument("What is meditation?");
    expect(result).toBeNull();
  });

  it("generates a hypothetical passage when Bedrock is available", async () => {
    process.env.AWS_REGION = "us-east-1";
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "Meditation is the science of God-realization. It is the most practical science in the world. Most people would want to meditate if they understood its value and experienced its beneficial effects.",
        },
      ],
    });

    const result = await generateHypotheticalDocument("What is meditation?");

    expect(result).toContain("Meditation is the science");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: 200,
        messages: [{ role: "user", content: "What is meditation?" }],
      }),
    );
  });

  it("uses Spanish system prompt for es language", async () => {
    process.env.AWS_REGION = "us-east-1";
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "La meditación es la ciencia de la autorrealización. Es la ciencia más práctica del mundo entero.",
        },
      ],
    });

    const result = await generateHypotheticalDocument("¿Qué es la meditación?", "es");

    expect(result).toContain("meditación");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("bibliotecario fiel"),
      }),
    );
  });

  it("returns null when generation produces too-short text", async () => {
    process.env.AWS_REGION = "us-east-1";
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Short." }],
    });

    const result = await generateHypotheticalDocument("test query");
    expect(result).toBeNull();
  });

  it("returns null when Bedrock call fails", async () => {
    process.env.AWS_REGION = "us-east-1";
    mockCreate.mockRejectedValueOnce(new Error("Bedrock timeout"));

    const result = await generateHypotheticalDocument("test query");
    expect(result).toBeNull();
  });

  it("returns null when response has no text blocks", async () => {
    process.env.AWS_REGION = "us-east-1";
    mockCreate.mockResolvedValueOnce({ content: [] });

    const result = await generateHypotheticalDocument("test query");
    expect(result).toBeNull();
  });
});
