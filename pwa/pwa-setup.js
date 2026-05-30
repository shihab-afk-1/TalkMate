// pwa/pwa-setup.js
let deferredPrompt;
let waitingWorker; // নতুন আপডেট আসা ওয়ার্কার স্টোর করার জন্য

// 1. Install Prompt Logic
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
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

// 2. Service Worker Registration & Update Logic
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/OneSignalSDKWorker.js').then((registration) => {
            console.log('[PWA] ServiceWorker registered');

            // যদি আগে থেকেই কোনো আপডেট অপেক্ষায় থাকে
            if (registration.waiting) {
                waitingWorker = registration.waiting;
                showUpdateModal();
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        waitingWorker = newWorker;
                        showUpdateModal();
                    }
                });
            });
        }).catch((err) => console.log('[PWA] SW Error:', err));

        // যখন Service Worker আপডেট হয়ে যাবে, তখন শুধু একবার পেজ রিলোড হবে
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

function showUpdateModal() {
    const updateModal = document.getElementById('pwa-update-modal');
    if (updateModal) updateModal.classList.remove('hidden');
}

// 3. Update Button Click Logic
window.updatePWA = () => {
    if (waitingWorker) {
        // Service Worker-কে কমান্ড পাঠানো হচ্ছে আপডেট নিয়ে নেওয়ার জন্য
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
        window.location.reload();
    }
};
