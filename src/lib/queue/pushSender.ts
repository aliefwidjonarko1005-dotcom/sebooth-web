/**
 * Server-side Web Push notification sender.
 * Uses the `web-push` library to send push notifications to subscribed users.
 */

import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = `mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAILS || "seboothin@gmail.com"}`;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export interface PushPayload {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    vibrate?: number[];
    requireInteraction?: boolean;
}

/**
 * Send a push notification to a specific user.
 * Fetches all their subscriptions and sends to each.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn("[Push Send] VAPID keys not configured — skipping push");
        return 0;
    }

    const supabase = createServiceClient();

    const { data: subscriptions, error } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth_key")
        .eq("user_id", userId);

    if (error || !subscriptions || subscriptions.length === 0) {
        return 0;
    }

    let sentCount = 0;
    const expiredIds: string[] = [];

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth_key,
                    },
                },
                JSON.stringify(payload)
            );
            sentCount++;
        } catch (err: unknown) {
            const statusCode = (err as { statusCode?: number })?.statusCode;
            if (statusCode === 410 || statusCode === 404) {
                // Subscription expired, mark for deletion
                expiredIds.push(sub.id);
            } else {
                console.error(`[Push Send] Failed for endpoint ${sub.endpoint}:`, err);
            }
        }
    }

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
        await supabase
            .from("push_subscriptions")
            .delete()
            .in("id", expiredIds);
    }

    return sentCount;
}

/**
 * Send push notifications to multiple users at once.
 */
export async function sendPushToUsers(
    userIds: string[],
    payload: PushPayload
): Promise<number> {
    let totalSent = 0;
    for (const userId of userIds) {
        totalSent += await sendPushToUser(userId, payload);
    }
    return totalSent;
}
