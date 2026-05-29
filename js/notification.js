import { sendPushNotification } from './notification-api.js';
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const db = getDatabase();
const APP_URL = "https://talkmate-two.vercel.app";

// Helper: Get User's OneSignal ID from Firebase
async function getUserOneSignalId(uid) {
    const snap = await get(ref(db, `users/${uid}/onesignalId`));
    return snap.exists() ? snap.val() : null;
}

// 1. Chat Message Notification
export async function notifyNewMessage(targetUid, senderName, messageText, chatId) {
    const osId = await getUserOneSignalId(targetUid);
    if (osId) {
        const url = `${APP_URL}?chatId=${targetUid}`; // Click url opens chat
        await sendPushNotification([osId], senderName, messageText, url, { type: 'chat', chatId });
    }
}

// 2. Post Like Notification
export async function notifyPostLike(targetUid, likerName, postId) {
    const osId = await getUserOneSignalId(targetUid);
    if (osId) {
        const url = `${APP_URL}?postId=${postId}`;
        await sendPushNotification([osId], "New Like ❤️", `${likerName} liked your post.`, url, { type: 'like', postId });
    }
}

// 3. Comment Notification
export async function notifyPostComment(targetUid, commenterName, commentText, postId) {
    const osId = await getUserOneSignalId(targetUid);
    if (osId) {
        const url = `${APP_URL}?postId=${postId}`;
        await sendPushNotification([osId], `${commenterName} commented`, `"${commentText}"`, url, { type: 'comment', postId });
    }
}

// 4. Follow Notification
export async function notifyNewFollower(targetUid, followerName, followerUid) {
    const osId = await getUserOneSignalId(targetUid);
    if (osId) {
        const url = `${APP_URL}?profileId=${followerUid}`;
        await sendPushNotification([osId], "New Follower 👤", `${followerName} started following you.`, url, { type: 'follow', profileId: followerUid });
    }
}

// 5. Incoming Call Notification
export async function notifyIncomingCall(targetUid, callerName, callType) {
    const osId = await getUserOneSignalId(targetUid);
    if (osId) {
        const callText = callType === 'video' ? 'Incoming Video Call 📹' : 'Incoming Audio Call 📞';
        await sendPushNotification([osId], callerName, callText, APP_URL, { type: 'call' });
    }
}
