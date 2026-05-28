// Service Worker with network-first strategy for app shell
// Ensures fresh deploys reach users without manual cache clearing

const CACHE_VERSION = 'v12';
const BUILD_ID = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const CACHE_NAME = `nypd-sgt-${CACHE_VERSION}-${BUILD_ID}`;

// App shell resources - network-first
const APP_SHELL = [
  './',
  './index.html',
  './data.js',
  './manifest.json',
];

// Static assets - stale-while-revalidate
const STATIC_ASSETS_CACHE = `nypd-sgt-static-${CACHE_VERSION}`;

// ─────────────────────────────────────────────
// Install - skip waiting immediately
// ─────────────────────────────────────────────
self.addEventListener('install', event => {
  // Skip waiting so new SW activates immediately
  self.skipWaiting();

  // Pre-cache app shell (but always fetch fresh on first request)
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ─────────────────────────────────────────────
// Activate - clean up old caches and claim clients
// ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Delete all old caches that don't match current version
      caches.keys().then(keys => {
        return Promise.all(
          keys
            .filter(key => {
              // Keep current cache and static assets cache
              if (key === CACHE_NAME || key === STATIC_ASSETS_CACHE) return false;
              // Delete everything else (old versions)
              return key.startsWith('nypd-sgt-');
            })
            .map(key => caches.delete(key))
        );
      }),
      // Take control of all clients immediately
      self.clients.claim(),
    ])
  );
});

// ─────────────────────────────────────────────
// Fetch - strategy by resource type
// ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // App shell (HTML, data.js, manifest.json): Network-first
  if (
    request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('data.js') ||
    url.pathname.endsWith('manifest.json')
  ) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Static assets (CSS, JS, fonts, images): Stale-while-revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_ASSETS_CACHE));
    return;
  }

  // Everything else: Network-first with cache fallback
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ─────────────────────────────────────────────
// Network-First Strategy
// Try network, fall back to cache on failure
// ─────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  try {
    // Try the network first
    const networkResponse = await fetch(request);

    // If successful, cache the response and return it
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // No cache available, return offline fallback for navigation requests
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }

    // Return error response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// ─────────────────────────────────────────────
// Stale-While-Revalidate Strategy
// Return cache immediately, update in background
// ─────────────────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always fetch from network in background
  const networkFetch = fetch(request)
    .then(async networkResponse => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, return cached response if available
      return cachedResponse;
    });

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || networkFetch;
}
