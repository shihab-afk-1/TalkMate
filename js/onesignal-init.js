import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

export function initializeOneSignal(currentUser) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
            appId: "7d310531-7d95-43ce-9d22-f79ec00629dc", // তোমার আসল App ID
            safari_web_id: "web.onesignal.auto.1cc5c601-0ab1-487a-96d1-0b685be1e018", // তোমার Safari ID
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
        });

        const db = getDatabase();

        // 1. OneSignal এর সাথে ইউজারের UID কানেক্ট করা (v16 এর Best Practice)
        if (currentUser) {
            OneSignal.login(currentUser.uid);
        }

        OneSignal.Slidedown.promptPush();

        function saveSubscriptionToFirebase(subId) {
            if (!currentUser || !subId) return;
            update(ref(db, `users/${currentUser.uid}`), {
                onesignalId: subId
            }).then(() => console.log("OneSignal ID Saved:", subId))
              .catch(e => console.error("Firebase save error:", e));
        }

        // 2. Initial Check (ইউজার আগে থেকেই পারমিশন দিয়ে রাখলে)
        const currentId = OneSignal.User.PushSubscription.id;
        if (OneSignal.User.PushSubscription.optedIn && currentId) {
            saveSubscriptionToFirebase(currentId);
        }

        // 3. Listen for changes (নতুন পারমিশন দিলে বা রিভোক করলে)
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
            if (event.current.optedIn && event.current.id) {
                // নতুন সাবস্ক্রিপশন ID ফায়ারবেসে সেভ হবে
                saveSubscriptionToFirebase(event.current.id);
            } else if (!event.current.optedIn) {
                // ইউজার নোটিফিকেশন অফ করে দিলে ফায়ারবেস থেকে মুছে ফেলবে
                update(ref(db, `users/${currentUser.uid}`), { onesignalId: null });
            }
        });

        // 4. Handle Notification Click
        OneSignal.Notifications.addEventListener('click', (event) => {
            const notificationData = event.notification.additionalData;
            const actionId = event.result.actionId; 
            
            if (notificationData) {
                let redirectUrl = "https://talkmate-two.vercel.app";

                if (actionId === "reply" && notificationData.chatId) {
                    redirectUrl = `${redirectUrl}/?chatId=${notificationData.chatId}`;
                } else if (actionId === "mark_read" || actionId === "decline") {
                    return; // অ্যাপ খুলবে না, শুধু নোটিফিকেশন সরে যাবে
                } else if (actionId === "accept" && notificationData.callId) {
                    redirectUrl = `${redirectUrl}/?callId=${notificationData.callId}&action=accept`;
                } else if (actionId === "view_post" && notificationData.postId) {
                    redirectUrl = `${redirectUrl}/?postId=${notificationData.postId}`;
                } else if (actionId === "view_profile" && notificationData.profileId) {
                    redirectUrl = `${redirectUrl}/?profileId=${notificationData.profileId}`;
                } else {
                    // Default click
                    if (notificationData.chatId) redirectUrl = `${redirectUrl}/?chatId=${notificationData.chatId}`;
                    else if (notificationData.postId) redirectUrl = `${redirectUrl}/?postId=${notificationData.postId}`;
                    else if (notificationData.profileId) redirectUrl = `${redirectUrl}/?profileId=${notificationData.profileId}`;
                    else if (notificationData.callId) redirectUrl = `${redirectUrl}/?callId=${notificationData.callId}`;
                }
                window.open(redirectUrl, "_self");
            }
        });
    });
}
