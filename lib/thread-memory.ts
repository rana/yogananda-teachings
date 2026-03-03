/**
 * Thread Memory — "Following the Thread" breadcrumb stack.
 *
 * When a seeker follows a golden thread link between chapters,
 * their reading position is pushed to a sessionStorage stack.
 * A quiet "Return" affordance lets them retrace their path,
 * arriving at the exact paragraph via Passage Arrival.
 *
 * Session-only. No persistence, no tracking. PRI-08, PRI-09.
 * Max depth: THREAD_MAX_DEPTH positions (config.ts).
 */

import { THREAD_MAX_DEPTH } from "./config";

const STORAGE_KEY = "srf-thread-stack";

export interface ThreadPosition {
  bookSlug: string;
  chapterNumber: number;
  /** Chunk ID of the paragraph the seeker was reading */
  chunkId: string;
  /** Chapter title for display in the return bar */
  chapterTitle: string;
}

/**
 * Push the current reading position onto the thread stack.
 * Called before navigating to a related teaching.
 */
export function pushThreadPosition(position: ThreadPosition): void {
  if (typeof window === "undefined") return;
  try {
    const stack = getThreadStack();
    stack.push(position);
    // Trim to max depth (keep most recent)
    const trimmed = stack.slice(-THREAD_MAX_DEPTH);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Pop the most recent position from the thread stack.
 * Returns null if the stack is empty.
 */
export function popThreadPosition(): ThreadPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const stack = getThreadStack();
    if (stack.length === 0) return null;
    const position = stack.pop()!;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
    return position;
  } catch {
    return null;
  }
}

/**
 * Peek at the top of the thread stack without removing it.
 */
export function peekThreadPosition(): ThreadPosition | null {
  if (typeof window === "undefined") return null;
  const stack = getThreadStack();
  return stack.length > 0 ? stack[stack.length - 1] : null;
}

/**
 * Get the current thread depth (number of positions on the stack).
 */
export function getThreadDepth(): number {
  return getThreadStack().length;
}

/**
 * Get the full thread stack.
 */
export function getThreadStack(): ThreadPosition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ThreadPosition[];
  } catch {
    return [];
  }
}

/**
 * Clear the entire thread stack.
 */
export function clearThreadStack(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage unavailable
  }
}
