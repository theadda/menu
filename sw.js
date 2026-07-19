const C = 'adda-menu-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate' || req.destination === 'document') {
    // page: network-first -> menu updates appear immediately; cache is the offline fallback
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(C).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
    );
  } else {
    // assets (fonts etc.): cache-first
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(C).then(c => c.put(req, copy));
        return res;
      }))
    );
  }
});
