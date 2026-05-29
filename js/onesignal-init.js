import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

export function initializeOneSignal(currentUser) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
            appId: "YOUR_ONESIGNAL_APP_ID_HERE", // <-- এখানে আপনার OneSignal App ID দিন
            safari_web_id: "web.onesignal.auto.xxxxxx", // <-- (Optional) Safari ID
            notifyButton: { enable: false }, // আমরা কাস্টম Prompt দেখাবো
            allowLocalhostAsSecureOrigin: true,
        });

        // Show Modern Slidedown Prompt
        OneSignal.Slidedown.promptPush();

        // ----------------------------------------------------
        // Save Subscription ID to Firebase when subscribed
        // ----------------------------------------------------
        const db = getDatabase();

        async function saveSubscriptionToFirebase() {
            if (!currentUser) return;
            const subscriptionId = await OneSignal.User.PushSubscription.id;
            if (subscriptionId) {
                await update(ref(db, `users/${currentUser.uid}`), {
                    onesignalId: subscriptionId
                });
                console.log("OneSignal ID Saved to Firebase:", subscriptionId);
            }
        }

        // Check current status
        const isOptedIn = OneSignal.User.PushSubscription.optedIn;
        if (isOptedIn) {
            saveSubscriptionToFirebase();
        }

        // Listen for future subscription changes
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
            if (event.current.optedIn) {
                saveSubscriptionToFirebase();
            }
        });

        // ----------------------------------------------------
        // Handle Notification Click (Foreground)
        // ----------------------------------------------------
        OneSignal.Notifications.addEventListener('click', (event) => {
            const notificationData = event.notification.additionalData;
            if(notificationData) {
                // এখানে আপনি আপনার অ্যাপের নির্দিষ্ট পেজে রিডাইরেক্ট করতে পারেন
                console.log("Notification Clicked Data:", notificationData);
            }
        });
    });
}
