// Function to trigger Vercel Backend API
export async function sendPushNotification(targetOneSignalIds, title, message, clickUrl, customData) {
    if (!targetOneSignalIds || targetOneSignalIds.length === 0) return;

    try {
        const response = await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetIds: targetOneSignalIds,
                title: title,
                message: message,
                url: clickUrl,
                data: customData
            })
        });
        const data = await response.json();
        console.log("Push Result:", data);
    } catch (error) {
        console.error("Failed to send push notification:", error);
    }
}
