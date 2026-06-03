export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { targetIds, title, message, url, data, icon, largeImage, buttons } = req.body;

    // VERCEL ENVIRONMENT VARIABLES - ড্যাশবোর্ডে এগুলো সেট করা থাকতে হবে!
    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!targetIds || targetIds.length === 0) {
        return res.status(400).json({ error: 'Target Subscription IDs required' });
    }

    const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: targetIds,
        headings: { en: title },
        contents: { en: message },
        url: url || "https://talkmate-two.vercel.app",
        data: data || {},
        priority: 10,
        chrome_web_icon: icon || "https://i.ibb.co/84bCGgy5/Picsart-26-06-03-20-54-28-662.png",
        chrome_web_badge: "https://i.ibb.co/84bCGgy5/Picsart-26-06-03-20-54-28-662.png"
    };

    if (largeImage) payload.chrome_web_image = largeImage;
    if (buttons && buttons.length > 0) payload.web_buttons = buttons;

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.errors) {
            console.error("OneSignal Error:", result.errors);
            return res.status(400).json({ success: false, error: result.errors });
        }

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Fetch API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
