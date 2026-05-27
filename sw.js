// AIGP Study Script — Service Worker v2
// Bump version number to force old cache to be replaced

const CACHE_NAME = 'aigp-study-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: pre-cache all local assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first; fall back to network; fall back to index.html
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // If we get a 404 or other error response, serve index.html instead
        if (!response.ok) {
          return caches.match('./index.html');
        }
        return response;
      }).catch(() => {
        // Network failure — serve index.html from cache
        return caches.match('./index.html');
      });
    })
  );
});
