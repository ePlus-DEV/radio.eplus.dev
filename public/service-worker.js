/* ePlus OnAir PWA: only the offline explanation is cached.
 * Live audio, manifests, station catalogs, HTML, search JSON and scripts
 * always use their normal network path. In particular, DO NOT cache HLS.
 */
const OFFLINE_SCOPE_KEY = encodeURIComponent(new URL(self.registration.scope).pathname);
const OFFLINE_CACHE_PREFIX = 'onair-offline-shell-' + OFFLINE_SCOPE_KEY + '-v';
const OFFLINE_CACHE_NAME = OFFLINE_CACHE_PREFIX + '1';
const OFFLINE_URL = new URL('offline.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE_NAME).then(cache =>
      cache.add(new Request(OFFLINE_URL, { cache: 'reload' })),
    ),
  );
  // Deliberately do not skipWaiting: never take over an active radio session.
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(OFFLINE_CACHE_PREFIX) && key !== OFFLINE_CACHE_NAME)
        .map(key => caches.delete(key)),
    )),
  );
  // No clients.claim: an existing player keeps its current lifecycle.
});

self.addEventListener('fetch', event => {
  // This is NOT an offline radio / generic static-asset cache. Non-navigation
  // requests (audio, HLS playlists/segments, station JSON and JS) pass through.
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const offline = await caches.match(OFFLINE_URL);
      return offline || Response.error();
    }),
  );
});
