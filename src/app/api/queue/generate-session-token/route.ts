import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.QUEUE_WEBHOOK_SECRET;

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
    // Validate webhook secret
    const secret = req.headers.get("x-webhook-secret");
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { session_id: sessionId, event_id: eventId } = body;

    if (!sessionId || !eventId) {
        return NextResponse.json(
            { success: false, error: "Missing required fields: session_id, event_id" },
            { status: 400 }
        );
    }

    const timestamp = Date.now();
    const tokenData = `${sessionId}:${eventId}:${timestamp}`;
    const token = Buffer.from(tokenData).toString("base64url");

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sebooth.com";
    const qrUrl = `${baseUrl}/api/queue/scan/${token}`;

    return NextResponse.json({
        success: true,
        token,
        qrUrl,
        expiresAt: new Date(timestamp + 10 * 60 * 1000).toISOString(),
    });
}
