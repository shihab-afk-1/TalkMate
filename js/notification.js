import { sendPushNotification } from './notification-api.js';
import { getDatabase, ref, get, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const APP_URL = "https://talkmate-two.vercel.app";
const DEFAULT_LOGO = `${APP_URL}/icons/icon-192x192.png`;

// Helper: Get OneSignal ID
async function getUserOneSignalId(uid) {
    const db = getDatabase();
    const snap = await get(ref(db, `users/${uid}/onesignalId`));
    return snap.exists() ? snap.val() : null;
}

// Helper: Save to Firebase notifications/{uid}/{notificationId}
async function saveNotificationToFirebase(targetUid, type, title, message, senderId, actionUrl, image) {
    try {
        const db = getDatabase();
        await push(ref(db, `notifications/${targetUid}`), {
            type, title, message, senderId, targetId: targetUid,
            actionUrl, image: image || DEFAULT_LOGO,
            read: false, timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Firebase notification save error (Ignored):", error);
        // ফায়ারবেস এরর দিলেও পুশ নোটিফিকেশন পাঠানো যেন বন্ধ না হয়, তাই try-catch দেওয়া হলো।
    }
}

// 1. New Message
export async function notifyNewMessage(targetUid, senderName, senderId, senderPhoto, chatId) {
    const title = "New Message";
    const message = `${senderName} sent you a message.\nTap to reply instantly.`;
    const url = `${APP_URL}/?chatId=${chatId}`;
    const buttons = [
        {"id": "reply", "text": "Reply", "icon": "https://img.icons8.com/ios-filled/50/000000/reply-arrow.png"},
        {"id": "mark_read", "text": "Mark Read", "icon": "https://img.icons8.com/ios-filled/50/000000/checkmark.png"}
    ];
    
    await saveNotificationToFirebase(targetUid, "message", title, message, senderId, url, senderPhoto);
    const osId = await getUserOneSignalId(targetUid);
    if (osId) await sendPushNotification([osId], title, message, url, { type: 'chat', chatId }, senderPhoto, null, buttons);
}

// 2. New Like
export async function notifyPostLike(targetUid, likerName, likerId, likerPhoto, postId, postThumbnail) {
    const title = "New Like";
    const message = `${likerName} liked your post.\nTap to view.`;
    const url = `${APP_URL}/?postId=${postId}`;
    const buttons = [{"id": "view_post", "text": "View Post"}];

    await saveNotificationToFirebase(targetUid, "like", title, message, likerId, url, likerPhoto);
    const osId = await getUserOneSignalId(targetUid);
    if (osId) await sendPushNotification([osId], title, message, url, { type: 'like', postId }, likerPhoto, postThumbnail, buttons);
}

// 3. New Comment
export async function notifyPostComment(targetUid, commenterName, commenterId, commenterPhoto, postId) {
    const title = "New Comment";
    const message = `${commenterName} commented on your post.\nTap to view the discussion.`;
    const url = `${APP_URL}/?postId=${postId}`;
    const buttons = [{"id": "view_post", "text": "View Post"}];

    await saveNotificationToFirebase(targetUid, "comment", title, message, commenterId, url, commenterPhoto);
    const osId = await getUserOneSignalId(targetUid);
    if (osId) await sendPushNotification([osId], title, message, url, { type: 'comment', postId }, commenterPhoto, null, buttons);
}

// 4. New Follower
export async function notifyNewFollower(targetUid, followerName, followerId, followerPhoto) {
    const title = "New Follower";
    const message = `${followerName} started following you.\nTap to view profile.`;
    const url = `${APP_URL}/?profileId=${followerId}`;
    const buttons = [{"id": "view_profile", "text": "View Profile"}];

    await saveNotificationToFirebase(targetUid, "follow", title, message, followerId, url, followerPhoto);
    const osId = await getUserOneSignalId(targetUid);
    if (osId) await sendPushNotification([osId], title, message, url, { type: 'follow', profileId: followerId }, followerPhoto, null, buttons);
}

// 5. Incoming Call
export async function notifyIncomingCall(targetUid, callerName, callerId, callerPhoto, callType, callId) {
    const title = "Incoming Call";
    const message = `${callerName} is calling you.\nTap to answer.`;
    const url = `${APP_URL}/?callId=${callId}`;
    const buttons = [
        {"id": "accept", "text": "Accept", "icon": "https://img.icons8.com/ios-filled/50/4CAF50/phone.png"},
        {"id": "decline", "text": "Decline", "icon": "https://img.icons8.com/ios-filled/50/F44336/end-call.png"}
    ];

    const osId = await getUserOneSignalId(targetUid);
    // কল নোটিফিকেশন আমরা ডাটাবেসে সেভ করবো না কারণ এটা রিয়েলটাইম
    if (osId) await sendPushNotification([osId], title, message, url, { type: 'call', callId, action: 'incoming' }, callerPhoto, null, buttons);
}

// 6. Missed Call
export async function notifyMissedCall(targetUid, callerName, callerId, callerPhoto) {
    const title = "Missed Call";
    const message = `You missed a call from ${callerName}.\nTap to call back.`;
    const url = `${APP_URL}`; // Call history can be opened by default or via a specific param
    const buttons = [{"id": "call_back", "text": "Call Back"}];

    await saveNotificationToFirebase(targetUid, "missed_call", title, message, callerId, url, callerPhoto);
    const osId = await getUserOneSignalId(targetUid);
    if (osId) await sendPushNotification([osId], title, message, url, { type: 'missed_call' }, callerPhoto, null, buttons);
}
