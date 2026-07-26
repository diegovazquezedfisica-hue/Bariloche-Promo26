// ============================================
// SERVICE WORKER - Promo 26' Bariloche
// Estrategia: network-first (siempre intenta traer la versión
// más nueva; si no hay conexión, usa la última guardada en caché)
// ============================================
const CACHE_NAME = 'bariloche26-v2';
const APP_SHELL = [
  './',
  './index.html',
  './egresados.html',
  './deposito.html',
  './habitaciones.html',
  './contrato.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './foto-grupal.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Las llamadas a la API (Worker/Apps Script) siempre van a la red, nunca a caché
  if (event.request.url.includes('workers.dev') || event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
