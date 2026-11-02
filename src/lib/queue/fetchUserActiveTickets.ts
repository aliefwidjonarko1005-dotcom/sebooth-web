import { LIVE_TICKET_STATUSES, type QueueEvent, type QueueTicket } from "@/types/database";
import { createQueueServerClient } from "./queueAuth";

export type UserLiveTicket = Pick<QueueTicket, "id" | "event_id" | "queue_number" | "status"> & {
    queue_events: Pick<QueueEvent, "name" | "is_active"> | null;
};

/**
 * The numbers a person holds right now, optionally in one event, newest first.
 * Tickets of closed events don't count: they read as cancelled.
 */
export async function fetchUserActiveTickets(userId: string, eventId?: string): Promise<UserLiveTicket[]> {
    const supabase = await createQueueServerClient();

    let query = supabase
        .from("queue_tickets")
        .select("id, event_id, queue_number, status, queue_events(name, is_active)")
        .eq("user_id", userId)
        .in("status", LIVE_TICKET_STATUSES)
        .order("created_at", { ascending: false });
    if (eventId) query = query.eq("event_id", eventId);

    const { data, error } = await query;
    if (error) {
        console.error("[fetchUserActiveTickets] Error:", error);
        return [];
    }

    return ((data ?? []) as unknown as UserLiveTicket[]).filter((ticket) => ticket.queue_events?.is_active);
}
