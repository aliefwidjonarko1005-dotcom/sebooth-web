import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/apiSecurity";
import { kioskAuth } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/queue/generate-session-token
 * Called by the desktop photobooth application to generate a QR token
 * for users to scan with their phones.
 * 
 * The QR code displayed on the photobooth screen encodes a URL:
 * {SITE_URL}/api/queue/scan/{token}
 * 
 * Token format: base64url(session_id:event_id:timestamp)
 * Token is valid for 10 minutes.
 * 
 * Request body:
 * {
 *   session_id: string,   // The photobooth session ID
 *   event_id: string      // The queue event ID
 * }
 */
export async function POST(req: NextRequest) {
    const limited = rateLimit(req, "kiosk-session-token", 120, 60_000);
    if (limited) return limited;

    // Fails closed: the shared QUEUE_WEBHOOK_SECRET, or a request signed by an approved booth (Booth Guard)
    const auth = await kioskAuth(req, "/api/queue/generate-session-token");
    if (auth instanceof Response) return auth;
    const { session_id: sessionId, event_id: eventId } = auth.body;

    if (!sessionId || !eventId) {
        return auth.respond({ success: false, error: "Missing required fields: session_id, event_id" }, 400);
    }

    const timestamp = Date.now();
    const tokenData = `${sessionId}:${eventId}:${timestamp}`;
    const token = Buffer.from(tokenData).toString("base64url");

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sebooth.com";
    const qrUrl = `${baseUrl}/api/queue/scan/${token}`;

    return auth.respond({
        success: true,
        token,
        qrUrl,
        expiresAt: new Date(timestamp + 10 * 60 * 1000).toISOString(),
    });
}
