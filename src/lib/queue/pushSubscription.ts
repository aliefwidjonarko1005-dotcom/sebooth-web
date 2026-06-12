/**
 * Web Push Subscription Utilities (Client-side)
 * Handles service worker registration, push subscription, and server sync.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Convert a base64 VAPID key to Uint8Array for the Push API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported and permission is granted.
 */
export function isPushSupported(): boolean {
    return (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
}

/**
 * Get current notification permission status.
 */
export function getPushPermission(): NotificationPermission | "unsupported" {
    if (!isPushSupported()) return "unsupported";
    return Notification.permission;
}

/**
 * Register service worker and subscribe to push notifications.
 * Returns the subscription object or null if failed/denied.
 */
export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!isPushSupported()) {
        console.warn("[Push] Push notifications not supported in this browser");
        return null;
    }

    if (!VAPID_PUBLIC_KEY) {
        console.warn("[Push] VAPID_PUBLIC_KEY not configured — value:", JSON.stringify(VAPID_PUBLIC_KEY));
        return null;
    }

    try {
        // Request permission
        const permission = await Notification.requestPermission();
        console.info("[Push] Permission result:", permission);
        if (permission !== "granted") {
            console.info("[Push] Notification permission denied");
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register("/service-worker.js", {
            scope: "/",
        });
        console.info("[Push] Service worker registered, scope:", registration.scope);

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.info("[Push] Service worker is ready");

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Create new subscription — pass Uint8Array directly (not .buffer)
            const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey.buffer as ArrayBuffer,
            });
            console.info("[Push] New push subscription created");
        } else {
            console.info("[Push] Existing push subscription found");
        }

        // Send subscription to server
        const subJson = subscription.toJSON();
        const response = await fetch("/api/queue/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                endpoint: subJson.endpoint,
                p256dh: subJson.keys?.p256dh,
                auth: subJson.keys?.auth,
            }),
        });

        const result = await response.json();
        if (!result.success) {
            console.error("[Push] Server rejected subscription:", result.error);
            return null;
        }

        console.info("[Push] Successfully subscribed to push notifications");
        return subscription;
    } catch (err) {
        console.error("[Push] Failed to subscribe:", err);
        return null;
    }
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return false;

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return false;

        await subscription.unsubscribe();
        return true;
    } catch (err) {
        console.error("[Push] Failed to unsubscribe:", err);
        return false;
    }
}
