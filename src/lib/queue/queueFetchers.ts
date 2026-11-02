import { createClient } from "@supabase/supabase-js";
import type { OwnQueueTicket, PublicQueueStatus, PublicQueueTicket, QueueEvent } from "@/types/database";
import { LIVE_TICKET_STATUSES } from "@/types/database";
import { createQueueServerClient } from "./queueAuth";

function createQueueClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// What the public anon role may read of a ticket. Keep in step with _harness/sql/queue-privacy.sql
const PUBLIC_TICKET_COLUMNS = "queue_number, display_name, status, called_at, is_checked_in";

/**
 * Fetch all active queue events.
 */
export async function fetchActiveQueueEvents(): Promise<QueueEvent[]> {
    const supabase = createQueueClient();
    const { data } = await supabase
        .from("queue_events")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
    return data ?? [];
}

/**
 * Fetch a single queue event by ID.
 */
export async function fetchQueueEventById(eventId: string): Promise<QueueEvent | null> {
    const supabase = createQueueClient();
    const { data, error } = await supabase
        .from("queue_events")
        .select("*")
        .eq("id", eventId)
        .single();
    if (error) return null;
    return data;
}

/**
 * Fetch a single ticket with its private columns. For its owner only: the caller checks user_id.
 */
export async function fetchQueueTicketById(ticketId: string): Promise<OwnQueueTicket | null> {
    const supabase = await createQueueServerClient();
    const { data, error } = await supabase
        .from("queue_tickets")
        .select(`${PUBLIC_TICKET_COLUMNS}, id, event_id, user_id, session_id, queue_events(is_active)`)
        .eq("id", ticketId)
        .single();
    if (error || !data) return null;

    const { queue_events: event, ...ticket } = data as unknown as OwnQueueTicket & { queue_events: { is_active: boolean } | null };

    // Force ticket status to cancelled if the parent event is no longer active
    // This mathematically squashes any "ghost" active status if DB bulk updates failed
    if (event && !event.is_active && LIVE_TICKET_STATUSES.includes(ticket.status)) {
        ticket.status = "cancelled";
    }

    return ticket;
}

/**
 * Compute real-time queue status for an event: who is being served, who is waiting, and the
 * estimated wait per ticket. Anyone can read this, so it only ever carries public columns.
 */
export async function fetchQueueStatus(eventId: string): Promise<PublicQueueStatus> {
    const supabase = createQueueClient();

    const [eventRes, ticketsRes, completedRes] = await Promise.all([
        supabase.from("queue_events").select("*").eq("id", eventId).single(),
        supabase
            .from("queue_tickets")
            .select(PUBLIC_TICKET_COLUMNS)
            .eq("event_id", eventId)
            .in("status", LIVE_TICKET_STATUSES)
            .order("queue_number", { ascending: true }),
        supabase
            .from("queue_tickets")
            .select("called_at, completed_at", { count: "exact" })
            .eq("event_id", eventId)
            .eq("status", "completed")
            .not("called_at", "is", null)
            .not("completed_at", "is", null)
            .limit(20),
    ]);

    const event: QueueEvent | null = eventRes.data;
    // Force empty active tickets if event is inactive to prevent ghost tickets
    const activeTickets: PublicQueueTicket[] = (event && !event.is_active) ? [] : (ticketsRes.data ?? []);
    const completedTickets = completedRes.data ?? [];

    // Calculate rolling average session duration
    let avgDurationSec = event?.avg_session_duration_sec ?? 600;
    if (completedTickets.length > 0) {
        const durations = completedTickets
            .map((t) => {
                const start = new Date(t.called_at!).getTime();
                const end = new Date(t.completed_at!).getTime();
                return (end - start) / 1000;
            })
            .filter((d) => d > 0 && d < 7200); // ignore outliers > 2 hours
        if (durations.length > 0) {
            avgDurationSec = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        }
    }

    const inSessionTicket = activeTickets.find((t) => t.status === "in_session");
    const calledTicket = activeTickets.find((t) => t.status === "called");
    const currentTicket = inSessionTicket || calledTicket || null;
    const waitingTickets = activeTickets.filter((t) => t.status === "waiting");

    // Estimate remaining time for the current in-session ticket
    let currentSessionRemainingMs = 0;
    if (currentTicket?.called_at) {
        const elapsedMs = Date.now() - new Date(currentTicket.called_at).getTime();
        currentSessionRemainingMs = Math.max(0, avgDurationSec * 1000 - elapsedMs);
    }

    // Build per-ticket wait estimates with proximity tier
    const ticketsWithEstimates = waitingTickets.map((ticket, index) => ({
        ...ticket,
        positionFromFront: index + 1, // 1-indexed
        estimatedWaitMs: currentSessionRemainingMs + index * avgDurationSec * 1000,
    }));

    return {
        event,
        currentTicket,
        waitingTickets: ticketsWithEstimates,
        avgDurationSec,
        totalWaiting: waitingTickets.length,
        // The rows are capped at 20 for the rolling average; the count is the real total
        totalCompleted: completedRes.count ?? completedTickets.length,
    };
}
