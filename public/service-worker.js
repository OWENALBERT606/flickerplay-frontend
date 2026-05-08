const CACHE_NAME = "flickerplay-v1";
const OFFLINE_URL = "/offline.html";

// Static assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Install: precache static assets ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: cache-first for static, network-first for pages ───────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── NEVER cache video streams or R2 storage ──
  // These must always fetch fresh from the origin
  if (
    url.pathname.includes("/videos/") ||
    url.hostname.includes("r2.cloudflarestorage") ||
    url.hostname.includes("r2.dev") ||
    url.pathname.match(/\.(mp4|mkv|avi|mov|webm|m3u8|ts)$/i)
  ) {
    // Pass through — no caching
    return;
  }

  // ── Skip non-GET requests ──
  if (request.method !== "GET") return;

  // ── Skip chrome-extension and non-http(s) ──
  if (!url.protocol.startsWith("http")) return;

  // ── Skip API calls — always network ──
  if (url.pathname.startsWith("/api/")) return;

  // ── Static assets (JS, CSS, images, fonts) — cache-first ──
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf)$/i) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Navigation requests — network-first, offline fallback ──
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // ── Everything else — network with cache fallback ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
