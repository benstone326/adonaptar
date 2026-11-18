// Relatív útvonalak: az app a GitHub Pages /adonaptar/ alútvonalán fut.
// Hálózat először, cache csak offline tartaléknak — így az adóparaméterek
// frissítése azonnal eljut a felhasználóhoz.
const CACHE = 'adonaptar-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.svg', './icon-512.svg', './favicon-32.png', './favicon-16.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
  );
});
