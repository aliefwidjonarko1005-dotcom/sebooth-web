import { createClient } from "@supabase/supabase-js";
import type { QueueEvent, QueueTicket } from "@/types/database";

function createQueueClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

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
 * Fetch all tickets for an event, ordered by queue_number.
 */
export async function fetchQueueTickets(eventId: string): Promise<QueueTicket[]> {
    const supabase = createQueueClient();
    const { data } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("event_id", eventId)
        .order("queue_number", { ascending: true });
    return data ?? [];
}

/**
 * Fetch a single ticket by ID.
 */
export async function fetchQueueTicketById(ticketId: string): Promise<QueueTicket | null> {
    const supabase = createQueueClient();
    const { data, error } = await supabase
        .from("queue_tickets")
        .select("*, queue_events(*)")
        .eq("id", ticketId)
        .single();
    if (error) return null;
    return data;
}

/**
 * Compute real-time queue status for an event.
 * Returns: currentNumber, waitingTickets, avgDurationSec, and per-ticket estimated wait.
 */
export async function fetchQueueStatus(eventId: string) {
    const supabase = createQueueClient();

    const [eventRes, ticketsRes, completedRes] = await Promise.all([
        supabase.from("queue_events").select("*").eq("id", eventId).single(),
        supabase
            .from("queue_tickets")
            .select("*")
            .eq("event_id", eventId)
            .in("status", ["waiting", "called", "in_session"])
            .order("queue_number", { ascending: true }),
        supabase
            .from("queue_tickets")
            .select("called_at, completed_at")
            .eq("event_id", eventId)
            .eq("status", "completed")
            .not("called_at", "is", null)
            .not("completed_at", "is", null)
            .limit(20),
    ]);

    const event: QueueEvent | null = eventRes.data;
    const activeTickets: QueueTicket[] = ticketsRes.data ?? [];
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
    const currentTicket = inSessionTicket || calledTicket;
    const waitingTickets = activeTickets.filter((t) => t.status === "waiting");

    // Estimate remaining time for the current in-session ticket
    let currentSessionRemainingMs = 0;
    if (currentTicket?.called_at) {
        const elapsedMs = Date.now() - new Date(currentTicket.called_at).getTime();
        const remainingMs = avgDurationSec * 1000 - elapsedMs;
        currentSessionRemainingMs = Math.max(0, remainingMs);
    }

    // Build per-ticket wait estimates
    const ticketsWithEstimates = waitingTickets.map((ticket, index) => {
        const positionFromFront = index; // 0-indexed
        const waitMs = currentSessionRemainingMs + positionFromFront * avgDurationSec * 1000;
        return {
            ...ticket,
            positionFromFront: index + 1,
            estimatedWaitMs: waitMs,
        };
    });

    return {
        event,
        currentTicket,
        waitingTickets: ticketsWithEstimates,
        allActiveTickets: activeTickets,
        avgDurationSec,
        totalWaiting: waitingTickets.length,
        totalCompleted: completedTickets.length,
    };
}
