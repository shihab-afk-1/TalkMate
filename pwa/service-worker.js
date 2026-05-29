// pwa/service-worker.js
const CACHE_NAME = 'talkmate-cache-v1';
const ASSETS_TO_CACHE = [
    '/offline/offline.html',
    // আপনার লোগোগুলো ক্যাশ করে রাখবেন
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install Event - Caching Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[PWA] Caching Offline Assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force update
});

// Activate Event - Cleaning old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[PWA] Clearing Old Cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Serve offline page if no internet
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline/offline.html');
            })
        );
    }
});
