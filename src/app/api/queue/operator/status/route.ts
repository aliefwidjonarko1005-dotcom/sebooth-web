import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/apiSecurity";
import { createQueueServerClient } from "@/lib/queue/queueAuth";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { LIVE_TICKET_STATUSES, type PublicQueueTicket } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/queue/operator/status?eventId=...
 * The public queue status plus what only operators need: ticket ids to act on, phone numbers to call.
 */
export async function GET(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) {
        return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    const supabase = await createQueueServerClient();
    const [status, { data: privateColumns, error }] = await Promise.all([
        fetchQueueStatus(eventId),
        supabase
            .from("queue_tickets")
            .select("id, queue_number, phone_number")
            .eq("event_id", eventId)
            .in("status", LIVE_TICKET_STATUSES),
    ]);
    if (error) {
        return NextResponse.json({ error: "Gagal memuat antrean." }, { status: 500 });
    }

    const withPrivateColumns = <T extends PublicQueueTicket>(ticket: T) => {
        const match = privateColumns?.find((row) => row.queue_number === ticket.queue_number);
        return { ...ticket, id: match?.id, phone_number: match?.phone_number ?? null };
    };

    return NextResponse.json({
        ...status,
        currentTicket: status.currentTicket && withPrivateColumns(status.currentTicket),
        waitingTickets: status.waitingTickets.map(withPrivateColumns),
    });
}
