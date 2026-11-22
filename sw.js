/* Manzanares Click — Service Worker demostrativo v1 */
const CACHE = 'manzanares-click-v1';
const APP_FILES = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith('manzanares-click-')).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  if(req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {
      if(response.ok) {
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put('./index.html',copy)));
      }
      return response;
    }).catch(async () => (await caches.match(req)) || (await caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if(response.ok && url.pathname.startsWith(new URL(self.registration.scope).pathname)) {
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(req,copy)));
    }
    return response;
  })));
});
