const CACHE_NAME = "kviz-igra-v42";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./questions.js",
  "./manifest.json",
  "./service-worker.js",
  "./pozadina.png",
  "./START.png",
  "./pobijednik.png",
  "./icon-192.png",
  "./icon-512.png",
  "./applause.mp3",
  "./boo.mp3"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const request = event.request;

  if ((request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});