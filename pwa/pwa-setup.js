let deferredPrompt;

// 1. Listen for Install Prompt Event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // পেজ লোড হওয়ার ৩ সেকেন্ড পর শুধু Install পপআপ আসবে
    setTimeout(() => {
        const installModal = document.getElementById('pwa-install-modal');
        if (installModal) {
            installModal.classList.remove('hidden');
        }
    }, 3000);
});

window.installPWA = async () => {
    const installModal = document.getElementById('pwa-install-modal');
    if (installModal) installModal.classList.add('hidden');
    
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Install outcome: ${outcome}`);
        deferredPrompt = null;
    }
};

window.dismissInstallPWA = () => {
    const installModal = document.getElementById('pwa-install-modal');
    if (installModal) installModal.classList.add('hidden');
};

// 2. Simple Service Worker Registration (No Update Popup Logic)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/OneSignalSDKWorker.js')
        .then((registration) => {
            console.log('[PWA] ServiceWorker registered seamlessly.');
            // ব্যাকগ্রাউন্ডে অটোমেটিকভাবে আপডেট চেক করবে
            registration.update();
        }).catch((err) => console.log('[PWA] SW Error:', err));
    });
}
