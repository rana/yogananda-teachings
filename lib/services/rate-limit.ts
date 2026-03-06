/**
 * Application-level rate limiting — M1c-6 (FTR-097).
 *
 * In-memory sliding window rate limiter. Two tiers:
 * - Crawler bots: 120 req/min (FTR-059)
 * - Anonymous users: 15 searches/min per IP
 *
 * Framework-agnostic (PRI-10). Vercel Firewall rules provide
 * the first layer; this is the second layer.
 */

interface RateWindow {
  count: number;
  resetAt: number;
}

const windows = new Map<string, RateWindow>();
const WINDOW_MS = 60_000; // 1 minute

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of windows) {
    if (now > window.resetAt) windows.delete(key);
  }
}, 60_000);

const KNOWN_BOTS = [
  "googlebot",
  "bingbot",
  "gptbot",
  "perplexitybot",
  "claudebot",
  "anthropic-ai",
  "ccbot",
  "bytespider",
];

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

/**
 * Check rate limit for an IP + user agent combination.
 */
export function checkRateLimit(
  ip: string,
  userAgent: string = "",
): RateLimitResult {
  const ua = userAgent.toLowerCase();
  const isBot = KNOWN_BOTS.some((bot) => ua.includes(bot));
  const limit = isBot ? 120 : 15;

  const key = `${ip}:${isBot ? "bot" : "user"}`;
  const now = Date.now();

  let window = windows.get(key);
  if (!window || now > window.resetAt) {
    window = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(key, window);
  }

  window.count++;
  const allowed = window.count <= limit;
  const remaining = Math.max(0, limit - window.count);

  return { allowed, remaining, limit, resetAt: window.resetAt };
}
