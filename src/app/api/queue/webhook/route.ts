import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { broadcastQueueUpdate } from "@/app/api/queue/stream/[eventId]/route";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";

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
        .select("id, queue_number, status")
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

        // If sessionId provided, also link back on the sessions table
        if (sessionId) {
            await supabase
                .from("sessions")
                .update({ queue_ticket_id: ticket.id })
                .eq("id", sessionId);
        }

        // Find next waiting ticket number for response info
        const { data: nextTicket } = await supabase
            .from("queue_tickets")
            .select("queue_number")
            .eq("event_id", eventId)
            .eq("status", "waiting")
            .order("queue_number", { ascending: true })
            .limit(1)
            .maybeSingle();

        nextTicketNumber = nextTicket?.queue_number ?? null;

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
                    // Rolling update of avg (simple weighted average)
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

    return NextResponse.json({
        success: true,
        ticketId: ticket.id,
        updatedStatus: webhookEvent === "session_started" ? "in_session" : "completed",
        nextTicketNumber,
    });
}
