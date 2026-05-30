// pwa/service-worker.js
const CACHE_NAME = 'talkmate-cache-v3'; // ভার্সন চেইঞ্জ করলাম
const ASSETS_TO_CACHE = [
    '/offline/offline.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[PWA] Caching Assets...');
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => 
                    fetch(url).then(response => {
                        if (response.ok) return cache.put(url, response);
                    })
                )
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline/offline.html');
            })
        );
    }
});

// নতুন আপডেট জোর করে চালু করার কমান্ড
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
