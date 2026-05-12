const CACHE_NAME = "stationexus-v1";
const urlsToCache = ["/", "/book", "/login", "/manifest.json"];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()), // take control immediately
  );
});

self.addEventListener("fetch", (event) => {
  // Don't intercept non-GET or browser-extension requests
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request.clone())
        .then((response) => {
          // Only cache valid same-origin responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback — always return a Response
          if (event.request.destination === "document") {
            return caches
              .match("/offline.html")
              .then(
                (r) =>
                  r ||
                  new Response("Offline", {
                    status: 503,
                    headers: { "Content-Type": "text/plain" },
                  }),
              );
          }
          // For non-document requests (images, etc.), return empty 503
          return new Response("", { status: 503 });
        });
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  console.log("Background sync triggered");
}
