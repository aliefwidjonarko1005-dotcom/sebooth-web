import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Expire the ticket that is currently "called" (a no-show) and call the next waiting one.
 * Plain server helper, not a server action: callers decide who may run it (an admin in the
 * dashboard, or a kiosk whose called customer did not show up).
 */
export async function callNextTicket(
    supabase: SupabaseClient,
    eventId: string
): Promise<{ success: boolean; calledTicketId?: string; calledNumber?: number; error?: string }> {
    await supabase
        .from("queue_tickets")
        .update({ status: "expired" })
        .eq("event_id", eventId)
        .eq("status", "called");

    const { data: nextTicket } = await supabase
        .from("queue_tickets")
        .select("id, queue_number, is_checked_in")
        .eq("event_id", eventId)
        .eq("status", "waiting")
        .order("queue_number", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!nextTicket) {
        return { success: false, error: "Tidak ada antrean yang menunggu." };
    }

    // Checked-in customers get longer to reach the booth
    const timeoutMins = nextTicket.is_checked_in ? 5 : 1;
    const expiresAt = new Date(Date.now() + timeoutMins * 60 * 1000).toISOString();

    const { error } = await supabase
        .from("queue_tickets")
        .update({
            status: "called",
            called_at: new Date().toISOString(),
            expires_at: expiresAt,
        })
        .eq("id", nextTicket.id);

    if (error) return { success: false, error: "Gagal memanggil antrean berikutnya." };

    return { success: true, calledTicketId: nextTicket.id, calledNumber: nextTicket.queue_number };
}
