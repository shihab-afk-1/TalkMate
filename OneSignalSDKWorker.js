// OneSignal Background Service Worker
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// PWA Service Worker for Offline Caching
importScripts("/pwa/service-worker.js");

// Force Update Command
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
