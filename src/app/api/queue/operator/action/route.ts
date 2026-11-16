import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/apiSecurity";
import { broadcastQueueUpdate } from "@/lib/queue/broadcast";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { sendPushToUser, sendProximityPushNotifications } from "@/lib/queue/pushSender";
import {
    operatorSkipTicket,
    operatorCompleteTicket,
    operatorResetTicket,
} from "@/lib/queue/queueActions";
import { callNextTicket } from "@/lib/queue/callNext";
import { createQueueServerClient } from "@/lib/queue/queueAuth";
import { kioskAuth } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

const PATH = "/api/queue/operator/action";

/**
 * POST /api/queue/operator/action
 * Body: { action: "call_next" | "skip" | "complete" | "reset", eventId?, ticketId?, sessionId? }
 * Admins (web dashboard) may run every action. A kiosk may only run call_next: its QueueDisplay calls
 * it when the called customer does not show up. Kiosks authenticate with the shared webhook secret or,
 * with Booth Guard, a request signed by an approved booth (answered with a server-signed response).
 */
export async function POST(req: NextRequest) {
    if (await getAdminUser()) return handle(await req.json());

    const auth = await kioskAuth(req, PATH);
    if (auth instanceof Response) return auth;
    if (auth.body.action !== "call_next") return auth.respond({ success: false, error: "Forbidden" }, 403);
    const res = await handle(auth.body);
    return auth.respond(await res.json(), res.status);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handle(body: Record<string, any>): Promise<NextResponse> {
    const { action, eventId, ticketId, sessionId } = body;

    let result: { success: boolean; error?: string; [key: string]: unknown };

    switch (action) {
        case "call_next":
            if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
            result = await callNextTicket(await createQueueServerClient(), eventId);

            // Send push notification to the called user
            if (result.success && result.calledTicketId) {
                const supabase = createServiceClient();
                const { data: calledTicket } = await supabase
                    .from("queue_tickets")
                    .select("user_id, queue_number")
                    .eq("id", result.calledTicketId)
                    .single();

                if (calledTicket?.user_id) {
                    const { data: eventData } = await supabase
                        .from("queue_events")
                        .select("name, booth_name")
                        .eq("id", eventId)
                        .single();

                    await sendPushToUser(calledTicket.user_id, {
                        title: "GILIRAN KAMU! 🔴",
                        body: `Segera menuju booth ${eventData?.booth_name || "Sebooth"}! Nomor antrean #${String(calledTicket.queue_number).padStart(3, "0")}`,
                        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in"}/queue/${eventId}/ticket/${result.calledTicketId}`,
                        tag: `your-turn-${result.calledTicketId}`,
                        vibrate: [200, 100, 200, 100, 200],
                        requireInteraction: true,
                    });
                }
            }
            break;

        case "skip":
            if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
            result = await operatorSkipTicket(ticketId);
            break;

        case "complete":
            if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
            result = await operatorCompleteTicket(ticketId, sessionId);
            break;

        case "reset":
            if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
            result = await operatorResetTicket(ticketId);
            break;

        default:
            return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Broadcast updated state + send proximity push notifications
    if (eventId) {
        const freshStatus = await fetchQueueStatus(eventId);
        broadcastQueueUpdate(eventId, freshStatus);

        // Send proximity push to users whose tier changed
        await sendProximityPushNotifications(eventId);
    }

    return NextResponse.json(result);
}
