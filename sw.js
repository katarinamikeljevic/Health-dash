const CACHE = 'health-dash-v5';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Always fetch fresh from network, no caching of app files
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
