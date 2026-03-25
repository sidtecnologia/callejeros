try {
  importScripts('/sp-push-worker-fb.js');
} catch (e) { }

const CACHE_NAME = 'callejeros-cache-v1.0.0'
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => null))
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
        return null;
      })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        try {
          const resClone = res.clone();
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => { });
          }
        } catch (e) { }
        return res;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : { title: 'Nuevo mensaje', body: 'Tienes una nueva notificación' };
  } catch (e) {
    payload = { title: 'Notificación', body: event.data ? event.data.text() : 'Tienes una nueva notificación' };
  }

  const title = payload.title || 'Comida Rápida';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/img/favicon.png',
    badge: payload.badge || '/img/favicon.png',
    data: payload.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
