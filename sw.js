const CACHE = 'katarina-v1';
const URLS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(URLS))
  );
  // Don't skipWaiting — wait for user to approve update
});

self.addEventListener('activate', e => {
  // Delete old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle same-origin GET requests for the main document
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(response => {
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        }).catch(() => cached);

        // Return cached immediately (offline-first), update cache in background
        return cached || networkFetch;
      })
    )
  );
});

// Listen for skip-waiting message from the page
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
