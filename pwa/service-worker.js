const CACHE_NAME = 'talkmate-cache-v4';
const ASSETS_TO_CACHE = [
    '/offline/offline.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// অটোমেটিক ইন্সটল এবং আপডেট
self.addEventListener('install', (event) => {
    self.skipWaiting(); // কোনো পারমিশন ছাড়াই আপডেট নিয়ে নেবে
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => fetch(url).then(response => {
                    if (response.ok) return cache.put(url, response);
                }))
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
    self.clients.claim(); // সাথে সাথে নতুন আপডেট চালু করবে
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
