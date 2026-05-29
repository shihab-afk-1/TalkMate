// Vercel Serverless Function for Secure OneSignal API Calls
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { targetIds, title, message, url, data } = req.body;

    // আপনার OneSignal Credentials (Vercel Environment Variables থেকে আসবে)
    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!targetIds || targetIds.length === 0) {
        return res.status(400).json({ error: 'Target Subscription IDs required' });
    }

    const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: targetIds, // OneSignal Player IDs
        headings: { en: title },
        contents: { en: message },
        url: url || "https://talkmate-two.vercel.app", // Click URL
        data: data || {}, // Custom data mapping
    };

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
        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Push Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
