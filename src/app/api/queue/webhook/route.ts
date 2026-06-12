import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { broadcastQueueUpdate } from "@/app/api/queue/stream/[eventId]/route";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { sendPushToUser } from "@/lib/queue/pushSender";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.QUEUE_WEBHOOK_SECRET;

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * POST /api/queue/webhook
 * Called by the desktop photobooth application when a session starts or completes.
 * 
 * Request body:
 * {
 *   event: "session_started" | "session_completed",
 *   event_id: string,           // queue_events.id
 *   ticket_number: number,      // queue_number
 *   session_id?: string         // sessions.id (only for session_completed)
 * }
 */
export async function POST(req: NextRequest) {
    // Validate webhook secret
    const secret = req.headers.get("x-webhook-secret");
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { event: webhookEvent, event_id: eventId, ticket_number: ticketNumber, session_id: sessionId } = body;

    if (!webhookEvent || !eventId || !ticketNumber) {
        return NextResponse.json(
            { success: false, error: "Missing required fields: event, event_id, ticket_number" },
            { status: 400 }
        );
    }

    const supabase = createServiceClient();

    // Find the target ticket
    const { data: ticket, error: findError } = await supabase
        .from("queue_tickets")
        .select("id, queue_number, status, user_id")
        .eq("event_id", eventId)
        .eq("queue_number", ticketNumber)
        .maybeSingle();

    if (findError || !ticket) {
        return NextResponse.json(
            { success: false, error: `Ticket #${ticketNumber} not found in event ${eventId}` },
            { status: 404 }
        );
    }

    let updateData: Record<string, unknown> = {};
    let nextTicketNumber: number | null = null;

    if (webhookEvent === "session_started") {
        updateData = {
            status: "in_session",
            called_at: ticket.status === "in_session" ? undefined : new Date().toISOString(),
        };
    } else if (webhookEvent === "session_completed") {
        updateData = {
            status: "completed",
            completed_at: new Date().toISOString(),
            session_id: sessionId || null,
        };

        // If sessionId provided, auto-claim to user account
        if (sessionId && ticket.user_id) {
            await supabase
                .from("sessions")
                .update({
                    queue_ticket_id: ticket.id,
                    user_id: ticket.user_id,
                    is_claimed: true,
                })
                .eq("id", sessionId);

            // Send push notification: "Foto sudah siap!"
            await sendPushToUser(ticket.user_id, {
                title: "Foto Kamu Sudah Siap! 📸",
                body: "Sesi fotomu sudah selesai. Lihat hasilnya di profil kamu!",
                url: "/profile",
                tag: "photo-ready",
                vibrate: [200, 100, 200, 100, 200],
                requireInteraction: true,
            });
        } else if (sessionId) {
            // No user_id on ticket, just link ticket
            await supabase
                .from("sessions")
                .update({ queue_ticket_id: ticket.id })
                .eq("id", sessionId);
        }

        // ══════════════════════════════════════════════
        // AUTO-ADVANCE: Call the next waiting ticket
        // ══════════════════════════════════════════════
        const { data: nextTicket } = await supabase
            .from("queue_tickets")
            .select("id, queue_number, user_id, display_name")
            .eq("event_id", eventId)
            .eq("status", "waiting")
            .order("queue_number", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (nextTicket) {
            // Auto-call the next ticket
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            await supabase
                .from("queue_tickets")
                .update({
                    status: "called",
                    called_at: new Date().toISOString(),
                    expires_at: expiresAt,
                })
                .eq("id", nextTicket.id);

            nextTicketNumber = nextTicket.queue_number;

            // Send urgent push notification to the called user
            if (nextTicket.user_id) {
                const eventData = (await supabase.from("queue_events").select("name, booth_name").eq("id", eventId).single()).data;
                await sendPushToUser(nextTicket.user_id, {
                    title: "GILIRAN KAMU! 🔴",
                    body: `Segera menuju booth ${eventData?.booth_name || "Sebooth"}! Nomor antrean #${String(nextTicket.queue_number).padStart(3, "0")}`,
                    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in"}/queue/${eventId}/ticket/${nextTicket.id}`,
                    tag: `your-turn-${nextTicket.id}`,
                    vibrate: [200, 100, 200, 100, 200],
                    requireInteraction: true,
                });
            }
        }

        // Update event's avg_session_duration if we have timing data
        if (ticket.status === "in_session") {
            const { data: updatedTicket } = await supabase
                .from("queue_tickets")
                .select("called_at")
                .eq("id", ticket.id)
                .single();

            if (updatedTicket?.called_at) {
                const durationSec = Math.round(
                    (Date.now() - new Date(updatedTicket.called_at).getTime()) / 1000
                );
                if (durationSec > 60 && durationSec < 7200) {
                    const { data: ev } = await supabase
                        .from("queue_events")
                        .select("avg_session_duration_sec")
                        .eq("id", eventId)
                        .single();

                    if (ev) {
                        const newAvg = Math.round((ev.avg_session_duration_sec * 0.7) + (durationSec * 0.3));
                        await supabase
                            .from("queue_events")
                            .update({ avg_session_duration_sec: newAvg })
                            .eq("id", eventId);
                    }
                }
            }
        }
    } else {
        return NextResponse.json(
            { success: false, error: `Unknown webhook event: ${webhookEvent}` },
            { status: 400 }
        );
    }

    // Apply the update
    const { error: updateError } = await supabase
        .from("queue_tickets")
        .update(updateData)
        .eq("id", ticket.id);

    if (updateError) {
        return NextResponse.json(
            { success: false, error: "Failed to update ticket status" },
            { status: 500 }
        );
    }

    // Broadcast updated state to all SSE clients
    const freshStatus = await fetchQueueStatus(eventId);
    broadcastQueueUpdate(eventId, freshStatus);

    // Send push notifications to users whose proximity tier changed
    await sendProximityPushNotifications(eventId, freshStatus);

    return NextResponse.json({
        success: true,
        ticketId: ticket.id,
        updatedStatus: webhookEvent === "session_started" ? "in_session" : "completed",
        nextTicketNumber,
        autoCalledNext: webhookEvent === "session_completed" && nextTicketNumber !== null,
    });
}

/**
 * Send push notifications to users whose proximity tier warrants notification.
 * Triggered after any queue state change.
 */
async function sendProximityPushNotifications(
    eventId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: any
) {
    const { waitingTickets, event } = status;
    if (!waitingTickets || !event) return;

    const supabase = createServiceClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in";

    for (const ticket of waitingTickets) {
        if (!ticket.user_id) continue;

        const position = ticket.positionFromFront;

        // Send push for "preparing" tier (1-2 positions away)
        if (position <= 2 && !ticket.push_preparing_sent) {
            await sendPushToUser(ticket.user_id, {
                title: "Bersiap-siap! 🟠",
                body: `Tinggal ${position} sesi lagi sebelum giliranmu di ${event.name}. Segera menuju booth!`,
                url: `${baseUrl}/queue/${eventId}/ticket/${ticket.id}`,
                tag: `preparing-${ticket.id}`,
                vibrate: [200, 100, 200],
            });

            await supabase.from("queue_tickets")
                .update({ push_preparing_sent: true })
                .eq("id", ticket.id);
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

            await supabase.from("queue_tickets")
                .update({ push_approaching_sent: true })
                .eq("id", ticket.id);
        }
    }
}
