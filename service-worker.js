// Service Worker for GoBuy PWA
const CACHE_NAME = "gobuy-v1.0.1";
const RUNTIME_CACHE = "gobuy-runtime";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/css/app.css",
  "/js/state.js",
  "/js/products.js",
  "/js/render.js",
  "/js/filters.js",
  "/js/cart.js",
  "/js/modals.js",
  "/js/events.js",
  "/js/utils.js",
  "/js/premium-features.js",
  "/js/pwa.js",
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching core assets");
        // Cache files one by one, skip failures
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached response, return it
      if (cachedResponse) {
        // But also fetch and update cache in background
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, response);
            });
          }
        });
        return cachedResponse;
      }

      // No cached response, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache for next time
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          // If both network and cache fail, return offline page
          console.warn("Fetch failed for:", event.request.url, error);
          return caches.match("/offline.html").then((response) => {
            if (response) return response;
            // Return a minimal response if offline page isn't cached
            return new Response("Offline - no cached version available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ "Content-Type": "text/plain" }),
            });
          });
        });
    })
  );
});

// Message event - handle commands from main thread
self.addEventListener("message", (event) => {
  if (event.data.type === "CHECK_UPDATE") {
    // Check for updates
    self.registration.update();
  }

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Background sync (for offline actions)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-actions") {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_OFFLINE_DATA",
    });
  });
}

console.log("🔧 Service Worker loaded");
