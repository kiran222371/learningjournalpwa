const CACHE_NAME = "learning-journal-v2";

const STATIC_ASSETS = [
  "/",                      // homepage route
  "/journal",
  "/about",
  "/projects",
  "/tracker",

  "/static/css/style.css",
  "/static/js/script.js",
  "/static/js/reflections.js",
  "/static/js/tracker.js",
  "/static/manifest.json",

  // App icons (PWA)
  "/static/images/icon-192.png",
  "/static/images/icon-512.png"
];

// Install: pre-cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) =>
          key !== CACHE_NAME ? caches.delete(key) : null
        )
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API (/reflections): network-first
// - Pages & static assets: cache-first with offline fallback
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only same-origin
  if (url.origin !== self.location.origin) return;

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // API calls → network first
  if (url.pathname.startsWith("/reflections")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Page navigation → cache first, fallback to home
  if (event.request.mode === "navigate") {
    event.respondWith(
      cacheFirst(event.request).catch(() => caches.match("/"))
    );
    return;
  }

  // Static assets
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    return (
      cached ||
      new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}
