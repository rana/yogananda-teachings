/**
 * Tests for thread-memory.ts — session-scoped breadcrumb stack.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  pushThreadPosition,
  popThreadPosition,
  peekThreadPosition,
  getThreadDepth,
  getThreadStack,
  clearThreadStack,
} from "../thread-memory";

vi.mock("../config", () => ({
  THREAD_MAX_DEPTH: 3,
}));

const pos = (n: number) => ({
  bookSlug: `book-${n}`,
  chapterNumber: n,
  chunkId: `chunk-${n}`,
  chapterTitle: `Chapter ${n}`,
});

describe("thread-memory", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("starts with an empty stack", () => {
    expect(getThreadDepth()).toBe(0);
    expect(getThreadStack()).toEqual([]);
    expect(peekThreadPosition()).toBeNull();
    expect(popThreadPosition()).toBeNull();
  });

  it("pushes and peeks without removing", () => {
    pushThreadPosition(pos(1));
    expect(getThreadDepth()).toBe(1);
    expect(peekThreadPosition()).toEqual(pos(1));
    // peek doesn't remove
    expect(getThreadDepth()).toBe(1);
  });

  it("pops in LIFO order", () => {
    pushThreadPosition(pos(1));
    pushThreadPosition(pos(2));
    expect(popThreadPosition()).toEqual(pos(2));
    expect(popThreadPosition()).toEqual(pos(1));
    expect(popThreadPosition()).toBeNull();
  });

  it("trims to THREAD_MAX_DEPTH (mocked to 3)", () => {
    pushThreadPosition(pos(1));
    pushThreadPosition(pos(2));
    pushThreadPosition(pos(3));
    pushThreadPosition(pos(4));
    // oldest (pos(1)) should be trimmed
    expect(getThreadDepth()).toBe(3);
    expect(getThreadStack()).toEqual([pos(2), pos(3), pos(4)]);
  });

  it("clearThreadStack empties everything", () => {
    pushThreadPosition(pos(1));
    pushThreadPosition(pos(2));
    clearThreadStack();
    expect(getThreadDepth()).toBe(0);
    expect(peekThreadPosition()).toBeNull();
  });

  it("survives corrupted sessionStorage", () => {
    sessionStorage.setItem("srf-thread-stack", "not-json{{{");
    expect(getThreadStack()).toEqual([]);
    expect(peekThreadPosition()).toBeNull();
    // Push still works after corruption
    pushThreadPosition(pos(1));
    expect(peekThreadPosition()).toEqual(pos(1));
  });

  it("handles sessionStorage errors gracefully", () => {
    const original = sessionStorage.getItem.bind(sessionStorage);
    sessionStorage.getItem = () => {
      throw new Error("quota exceeded");
    };
    expect(getThreadStack()).toEqual([]);
    expect(popThreadPosition()).toBeNull();
    sessionStorage.getItem = original;
  });
});
