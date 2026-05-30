export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { targetIds, title, message, url, data, icon, largeImage, buttons } = req.body;

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!targetIds || targetIds.length === 0) {
        return res.status(400).json({ error: 'Target Subscription IDs required' });
    }

    // Basic Payload
    const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: targetIds,
        headings: { en: title },
        contents: { en: message },
        url: url || "https://talkmate-two.vercel.app",
        data: data || {},
        priority: 10
    };

    // Safely add branding and rich media if they exist
    if (icon) {
        payload.chrome_web_icon = icon;
    } else {
        payload.chrome_web_icon = "https://talkmate-two.vercel.app/icons/icon-192x192.png";
    }

    payload.chrome_web_badge = "https://talkmate-two.vercel.app/icons/maskable-icon.png";

    if (largeImage) {
        payload.chrome_web_image = largeImage;
    }

    // Safely add buttons only if array has items
    if (buttons && buttons.length > 0) {
        payload.web_buttons = buttons;
    }

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        // Return error if OneSignal rejects the payload
        if (result.errors) {
            console.error("OneSignal Payload Error:", result.errors);
            return res.status(400).json({ success: false, error: result.errors });
        }

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Push API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
