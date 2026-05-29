import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

export function initializeOneSignal(currentUser) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
            appId: "7d310531-7d95-43ce-9d22-f79ec00629dc", // আপনার আসল App ID
            safari_web_id: "web.onesignal.auto.1cc5c601-0ab1-487a-96d1-0b685be1e018", // আপনার Safari ID
            notifyButton: { enable: false }, // আমরা নিচের Slidedown প্রম্পট ব্যবহার করব, তাই এটা false
            allowLocalhostAsSecureOrigin: true,
        });

        // Show Modern Slidedown Prompt (সুন্দর পারমিশন পপআপ)
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

        // Check current status (ইউজার আগে থেকেই পারমিশন দিয়ে রাখলে সেভ হবে)
        const isOptedIn = OneSignal.User.PushSubscription.optedIn;
        if (isOptedIn) {
            saveSubscriptionToFirebase();
        }

        // Listen for future subscription changes (নতুন পারমিশন দিলে সেভ হবে)
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
            if (event.current.optedIn) {
                saveSubscriptionToFirebase();
            }
        });

        // ----------------------------------------------------
        // Handle Notification Click 
        // ----------------------------------------------------
        OneSignal.Notifications.addEventListener('click', (event) => {
            const notificationData = event.notification.additionalData;
            if(notificationData) {
                console.log("Notification Clicked Data:", notificationData);
            }
        });
    });
}
