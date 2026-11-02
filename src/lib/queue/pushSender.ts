/**
 * Server-side Web Push notification sender.
 * Uses the `web-push` library to send push notifications to subscribed users.
 */

import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
// The admin env var may hold a comma-separated list; a VAPID subject takes one address
const VAPID_SUBJECT = `mailto:${(process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",")[0].trim() || "seboothin@gmail.com"}`;

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
        console.warn("[Push Send] VAPID keys not configured — skipping push. Public:", VAPID_PUBLIC_KEY ? "SET" : "EMPTY", "Private:", VAPID_PRIVATE_KEY ? "SET" : "EMPTY");
        return 0;
    }
    console.info(`[Push Send] Sending to user ${userId}: "${payload.title}"`);

    const supabase = createServiceClient();

    const { data: subscriptions, error } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth_key")
        .eq("user_id", userId);

    if (error) {
        console.error("[Push Send] DB error fetching subscriptions:", error.message);
        return 0;
    }
    if (!subscriptions || subscriptions.length === 0) {
        console.warn(`[Push Send] No subscriptions found for user ${userId}`);
        return 0;
    }
    console.info(`[Push Send] Found ${subscriptions.length} subscription(s) for user ${userId}`);

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

    console.info(`[Push Send] Sent ${sentCount}/${subscriptions.length} push(es) for user ${userId}`);
    return sentCount;
}

/**
 * Warn the people near the front of the line, once per tier. Called after any queue change.
 * Reads the ticket owners itself: the public queue status carries no account ids.
 */
export async function sendProximityPushNotifications(eventId: string): Promise<void> {
    const supabase = createServiceClient();

    const [{ data: event }, { data: waitingTickets }] = await Promise.all([
        supabase.from("queue_events").select("name").eq("id", eventId).single(),
        // All columns on purpose: the push_*_sent flags only exist once queue-privacy.sql has run
        supabase
            .from("queue_tickets")
            .select("*")
            .eq("event_id", eventId)
            .eq("status", "waiting")
            .order("queue_number", { ascending: true }),
    ]);
    if (!event || !waitingTickets) return;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in";

    for (const [index, ticket] of waitingTickets.entries()) {
        if (!ticket.user_id) continue;
        const position = index + 1;

        // Send push for "preparing" tier (1-2 positions away)
        if (position <= 2 && !ticket.push_preparing_sent) {
            await sendPushToUser(ticket.user_id, {
                title: "Bersiap-siap! 🟠",
                body: `Tinggal ${position} sesi lagi sebelum giliranmu di ${event.name}. Segera menuju booth!`,
                url: `${baseUrl}/queue/${eventId}/ticket/${ticket.id}`,
                tag: `preparing-${ticket.id}`,
                vibrate: [200, 100, 200],
            });
            await supabase.from("queue_tickets").update({ push_preparing_sent: true }).eq("id", ticket.id);
        }

        // Send push for "approaching" tier (3-4 positions away)
        if (position >= 3 && position <= 4 && !ticket.push_approaching_sent) {
            await sendPushToUser(ticket.user_id, {
                title: "Antrean Hampir Tiba! 🟡",
                body: `Masih ${position} sesi lagi di ${event.name}. Jangan jauh-jauh ya!`,
                url: `${baseUrl}/queue/${eventId}/ticket/${ticket.id}`,
                tag: `approaching-${ticket.id}`,
                vibrate: [200],
            });
            await supabase.from("queue_tickets").update({ push_approaching_sent: true }).eq("id", ticket.id);
        }
    }
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
