import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { broadcastQueueUpdate } from "@/app/api/queue/stream/[eventId]/route";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { sendPushToUser } from "@/lib/queue/pushSender";
import {
    operatorCallNext,
    operatorSkipTicket,
    operatorCompleteTicket,
    operatorResetTicket,
} from "@/lib/queue/queueActions";

export const dynamic = "force-dynamic";

async function getAuthUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Safe to ignore in route handlers
                    }
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * POST /api/queue/operator/action
 * Body: { action: "call_next" | "skip" | "complete" | "reset", eventId?, ticketId?, sessionId? }
 */
export async function POST(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, eventId, ticketId, sessionId } = body;

    let result: { success: boolean; error?: string; [key: string]: unknown };

    switch (action) {
        case "call_next":
            if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
            result = await operatorCallNext(eventId);

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
        await sendProximityPushAfterAction(eventId, freshStatus);
    }

    return NextResponse.json(result);
}

/**
 * Send proximity push notifications after operator actions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendProximityPushAfterAction(eventId: string, status: any) {
    const { waitingTickets, event } = status;
    if (!waitingTickets || !event) return;

    const supabase = createServiceClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in";

    for (const ticket of waitingTickets) {
        if (!ticket.user_id) continue;
        const position = ticket.positionFromFront;

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
