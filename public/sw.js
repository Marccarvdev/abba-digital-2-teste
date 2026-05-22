const CACHE_NAME = 'aprendite-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network first with cache fallback for dynamic JS/CSS assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests or same-origin / specific assets
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip chrome-extension, google analytics, etc.
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Fetch fresh copy in background to keep cache up to date, or fetch if not in cache
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Fallback if network is down
          return cachedResponse;
        });

        // For cached responses, return immediate to be fast! But if empty, wait for fetch
        return cachedResponse || fetchPromise;
      });
    })
  );
});
