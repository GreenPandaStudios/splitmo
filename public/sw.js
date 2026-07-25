// Bump VERSION to retire every previously cached response.
const VERSION = 'v7';
const SHELL_CACHE = `splitmo-shell-${VERSION}`;
const ASSET_CACHE = `splitmo-assets-${VERSION}`;

// Relative so the worker also works when the app is served from a subpath such as /splitmo/.
const SHELL = ['./', './index.html', './manifest.json', './favicon.svg', './pwa-192.png', './pwa-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Hosts vary responses on Origin and Accept-Encoding; without ignoreVary a cached asset that is
// plainly present will not match the offline request that needs it.
const MATCH_OPTS = { ignoreVary: true };

function cacheAndReturn(request, response, cacheName) {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Supabase, exchange rates, fonts and the OCR engine must always go to the network.
  if (url.origin !== self.location.origin) return;

  // Navigations go network-first so a fresh deploy is picked up, with the shell as offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheAndReturn(request, response, SHELL_CACHE))
        .catch(() => caches.match('./index.html', MATCH_OPTS).then((hit) => hit || caches.match('./', MATCH_OPTS)))
    );
    return;
  }

  // Hashed build output is immutable, so serving it from cache is always correct.
  event.respondWith(
    caches.match(request, MATCH_OPTS).then((hit) => {
      if (hit) return hit;
      return fetch(request)
        .then((response) => cacheAndReturn(request, response, ASSET_CACHE))
        .catch(() => hit);
    })
  );
});
