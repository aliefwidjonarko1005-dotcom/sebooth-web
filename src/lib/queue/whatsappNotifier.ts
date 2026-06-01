/**
 * WhatsApp Notification Helper
 * Sends WA messages via Fonnte API (https://fonnte.com)
 * 
 * To configure: Set FONNTE_API_KEY in .env.local
 * Fallback: If no provider configured, notifications are silently skipped (logged only).
 */

const FONNTE_API_URL = "https://api.fonnte.com/send";
const WA_NOTIFY_POSITION = 2; // Notify user when they are N positions from front

export interface WaNotificationPayload {
    ticketId: string;
    phone: string;
    displayName: string;
    queueNumber: number;
    eventName: string;
    positionFromFront: number;
    estimatedWaitMin: number;
    ticketUrl: string;
}

/**
 * Send a WhatsApp notification via Fonnte.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendWaNotification(payload: WaNotificationPayload): Promise<boolean> {
    const apiKey = process.env.FONNTE_API_KEY;

    if (!apiKey) {
        console.warn("[WA Notifier] FONNTE_API_KEY not configured — skipping WA notification");
        return false;
    }

    const message = buildMessage(payload);
    const phone = normalizePhone(payload.phone);

    try {
        const response = await fetch(FONNTE_API_URL, {
            method: "POST",
            headers: {
                Authorization: apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                target: phone,
                message,
                countryCode: "62", // Indonesia
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[WA Notifier] Failed to send:", errText);
            return false;
        }

        const result = await response.json();
        if (result.status === false) {
            console.error("[WA Notifier] API error:", result);
            return false;
        }

        console.log(`[WA Notifier] Sent to ${phone} (ticket #${payload.queueNumber})`);
        return true;
    } catch (err) {
        console.error("[WA Notifier] Network error:", err);
        return false;
    }
}

/**
 * Check if a ticket should receive a WA notification based on position.
 * Triggers when user is at WA_NOTIFY_POSITION from the front.
 */
export function shouldNotify(positionFromFront: number): boolean {
    return positionFromFront === WA_NOTIFY_POSITION;
}

/**
 * Mark a ticket as WA-notified in the database.
 */
export async function markTicketNotified(ticketId: string): Promise<void> {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase
        .from("queue_tickets")
        .update({ wa_notified: true })
        .eq("id", ticketId);
}

// ── Helpers ──

function buildMessage(p: WaNotificationPayload): string {
    return `Halo *${p.displayName}*! 🎉

Nomor antrean kamu *#${p.queueNumber}* di Sebooth ${p.eventName} hampir tiba!

📍 Posisi kamu: *ke-${p.positionFromFront} dari depan* — segera bersiap ya!
⏱️ Estimasi waktu: *~${p.estimatedWaitMin} menit lagi*

Pantau antrean real-time di:
🔗 ${p.ticketUrl}

Ditunggu ya! 📸✨`;
}

function normalizePhone(phone: string): string {
    // Remove spaces and dashes
    let normalized = phone.replace(/[\s\-().+]/g, "");
    // Convert leading 0 to 62 (Indonesia)
    if (normalized.startsWith("0")) {
        normalized = "62" + normalized.slice(1);
    }
    return normalized;
}
