import { createClient } from "@supabase/supabase-js";
import type { QueueTicket } from "@/types/database";

function createQueueClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * Fetch active queue tickets for a specific user.
 * Returns tickets that are currently waiting, called, or in_session.
 * Includes joined event data.
 */
export async function fetchUserActiveTickets(userId: string): Promise<QueueTicket[]> {
    const supabase = createQueueClient();

    const { data, error } = await supabase
        .from("queue_tickets")
        .select("*, queue_events(*)")
        .eq("user_id", userId)
        .in("status", ["waiting", "called", "in_session"])
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[fetchUserActiveTickets] Error:", error);
        return [];
    }

    return data ?? [];
}

/**
 * Fetch recent completed tickets for a user (last 10).
 */
export async function fetchUserRecentTickets(userId: string): Promise<QueueTicket[]> {
    const supabase = createQueueClient();

    const { data, error } = await supabase
        .from("queue_tickets")
        .select("*, queue_events(*)")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("[fetchUserRecentTickets] Error:", error);
        return [];
    }

    return data ?? [];
}
