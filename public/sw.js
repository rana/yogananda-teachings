/**
 * Service Worker — M2a-12 (FTR-006 §4), M2b-6.
 *
 * Extended from M1c-14 minimal worker.
 * - Pre-caches all page routes + self-hosted fonts
 * - Network-first for navigations, cache-first for fonts
 * - Offline fallback to cached shell
 * - Last-read chapter caching: stores the most recently read chapter
 *   so it can be served offline when connectivity drops (M2b-6, FTR-006)
 */

const CACHE_NAME = "srf-shell-v3";
const FONT_CACHE = "srf-fonts-v1";
const LAST_READ_CACHE = "srf-last-read-v1";

const OFFLINE_URL = "/offline.html";

const SHELL_URLS = [
  "/",
  "/search",
  "/books",
  "/quiet",
  "/browse",
  "/privacy",
  "/legal",
  "/integrity",
  "/bookmarks",
  "/es",
  "/es/search",
  "/es/books",
  "/es/quiet",
  "/es/browse",
  "/es/bookmarks",
  OFFLINE_URL,
];

// Install: pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

// Activate: clean old caches (preserve font + last-read caches across versions)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              key !== FONT_CACHE &&
              key !== LAST_READ_CACHE,
          )
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// Fetch: strategy varies by resource type
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Skip API routes — always network
  if (url.pathname.startsWith("/api/")) return;

  // Fonts: cache-first (immutable, self-hosted)
  if (url.pathname.startsWith("/fonts/")) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        }),
      ),
    );
    return;
  }

  // Chapter pages: network-first with last-read caching (M2b-6).
  // Stores only the single most recently read chapter — when offline,
  // the seeker can re-read that chapter. Pattern matches
  // /{locale}/books/{bookId}/{chapterNumber} (e.g. /en/books/abc-123/5).
  const chapterPattern = /^\/[a-z]{2}\/books\/[^/]+\/\d+$/;
  if (chapterPattern.test(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            // Replace entire last-read cache with this single chapter
            caches.open(LAST_READ_CACHE).then((cache) => {
              cache.keys().then((keys) => {
                for (const key of keys) {
                  cache.delete(key);
                }
                cache.put(event.request, clone);
              });
            });
          }
          return response;
        })
        .catch(() =>
          caches
            .open(LAST_READ_CACHE)
            .then((cache) => cache.match(event.request))
            .then(
              (cached) =>
                cached ||
                caches.match(event.request).then((c) => c || caches.match(OFFLINE_URL)),
            ),
        ),
    );
    return;
  }

  // Everything else: network-first, fall back to cache, then offline page
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then(
            (cached) =>
              cached ||
              caches.match("/") ||
              (event.request.mode === "navigate"
                ? caches.match(OFFLINE_URL)
                : undefined),
          ),
      ),
  );
});
