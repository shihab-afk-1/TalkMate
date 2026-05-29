let deferredPrompt;

// 1. Listen for Install Prompt Event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    
    // Show our custom modern Install UI
    const installModal = document.getElementById('pwa-install-modal');
    if (installModal) {
        installModal.classList.remove('hidden');
    }
});

// 2. Install Button Click Handler
window.installPWA = async () => {
    const installModal = document.getElementById('pwa-install-modal');
    if (installModal) installModal.classList.add('hidden');
    
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User installation outcome: ${outcome}`);
        deferredPrompt = null;
    }
};

window.dismissInstallPWA = () => {
    const installModal = document.getElementById('pwa-install-modal');
    if (installModal) installModal.classList.add('hidden');
};

// 3. Register Service Worker and Handle Updates
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/OneSignalSDKWorker.js').then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

            // Update Available Logic
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New update available! Show Update UI
                        const updateModal = document.getElementById('pwa-update-modal');
                        if (updateModal) updateModal.classList.remove('hidden');
                    }
                });
            });
        }).catch((err) => {
            console.error('[PWA] ServiceWorker registration failed:', err);
        });
    });
}

// 4. Update Button Click Handler
window.updatePWA = () => {
    // Reload page to apply new service worker updates
    window.location.reload();
};
