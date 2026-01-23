// sw.js (GitHub Pages / static)
const CACHE_NAME = "learning-journal-githubpages-v1";


const BASE_PATH = "/learningjournalpwa";

// Cache only static files that actually exist in your repo root
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/about.html`,
  `${BASE_PATH}/projects.html`,
  `${BASE_PATH}/journal.html`,
  `${BASE_PATH}/tracker.html`,
  `${BASE_PATH}/project1.html`,
  `${BASE_PATH}/project2.html`,
  `${BASE_PATH}/project3.html`,
  `${BASE_PATH}/project4.html`,

  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/storage.js`,
  `${BASE_PATH}/browser.js`,
  `${BASE_PATH}/reflections.js`,
  `${BASE_PATH}/thirdparty.js`,
  `${BASE_PATH}/tracker.js`,

  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`,

  // data file (static)
  `${BASE_PATH}/reflections.json`,
];

// Install: pre-cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // cache.addAll fails if ANY file 404s, so we add safely one-by-one
      await Promise.all(
        STATIC_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (res.ok) await cache.put(url, res);
          } catch {
            // ignore missing files
          }
        })
      );
    })
  );

  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only same-origin
  if (url.origin !== self.location.origin) return;

  // Only GET
  if (event.request.method !== "GET") return;

  // Data file
  if (url.pathname === `${BASE_PATH}/reflections.json`) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Page navigation
  if (event.request.mode === "navigate") {
    event.respondWith(
      cacheFirst(event.request).catch(() => caches.match(`${BASE_PATH}/index.html`))
    );
    return;
  }

  // Static files
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    return (
      cached ||
      new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}
