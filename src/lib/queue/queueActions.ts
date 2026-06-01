"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function createAnonClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

async function createAuthClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        }
    );
}

// ══════════════════════════════════════════════════════
// JOIN QUEUE
// ══════════════════════════════════════════════════════

export async function joinQueue(
    eventId: string,
    displayName: string,
    phoneNumber?: string
): Promise<{ success: boolean; ticketId?: string; queueNumber?: number; error?: string }> {
    const supabase = createAnonClient();
    const authClient = await createAuthClient();

    // Get logged-in user (optional)
    const { data: { user } } = await authClient.auth.getUser();

    // Get next queue number atomically
    const { data: lastTicket } = await supabase
        .from("queue_tickets")
        .select("queue_number")
        .eq("event_id", eventId)
        .order("queue_number", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextNumber = (lastTicket?.queue_number ?? 0) + 1;

    const { data, error } = await supabase
        .from("queue_tickets")
        .insert({
            event_id: eventId,
            queue_number: nextNumber,
            display_name: displayName,
            phone_number: phoneNumber || null,
            user_id: user?.id ?? null,
            status: "waiting",
        })
        .select("id, queue_number")
        .single();

    if (error || !data) {
        return { success: false, error: "Gagal mengambil nomor antrean. Silakan coba lagi." };
    }

    return { success: true, ticketId: data.id, queueNumber: data.queue_number };
}

// ══════════════════════════════════════════════════════
// CANCEL TICKET (by the user themselves)
// ══════════════════════════════════════════════════════

export async function cancelQueueTicket(
    ticketId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAnonClient();

    const { error } = await supabase
        .from("queue_tickets")
        .update({ status: "cancelled" })
        .eq("id", ticketId)
        .in("status", ["waiting"]); // Can only cancel waiting tickets

    if (error) {
        return { success: false, error: "Gagal membatalkan antrean." };
    }
    return { success: true };
}

// ══════════════════════════════════════════════════════
// OPERATOR ACTIONS (admin only)
// ══════════════════════════════════════════════════════

export async function operatorCallNext(
    eventId: string
): Promise<{ success: boolean; calledTicketId?: string; calledNumber?: number; error?: string }> {
    const supabase = createAnonClient();
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // First, expire any previously "called" ticket that wasn't acted on
    await authClient
        .from("queue_tickets")
        .update({ status: "expired" })
        .eq("event_id", eventId)
        .eq("status", "called");

    // Get the next waiting ticket
    const { data: nextTicket } = await authClient
        .from("queue_tickets")
        .select("id, queue_number")
        .eq("event_id", eventId)
        .eq("status", "waiting")
        .order("queue_number", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!nextTicket) {
        return { success: false, error: "Tidak ada antrean yang menunggu." };
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min timeout

    const { error } = await authClient
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

export async function operatorSkipTicket(
    ticketId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAnonClient();
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await authClient
        .from("queue_tickets")
        .update({ status: "expired" })
        .eq("id", ticketId);

    if (error) return { success: false, error: "Gagal skip antrean." };
    return { success: true };
}

export async function operatorCompleteTicket(
    ticketId: string,
    sessionId?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAnonClient();
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await authClient
        .from("queue_tickets")
        .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            session_id: sessionId || null,
        })
        .eq("id", ticketId);

    if (error) return { success: false, error: "Gagal menyelesaikan antrean." };
    return { success: true };
}

export async function operatorResetTicket(
    ticketId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAnonClient();
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await authClient
        .from("queue_tickets")
        .update({
            status: "waiting",
            called_at: null,
            expires_at: null,
        })
        .eq("id", ticketId);

    if (error) return { success: false, error: "Gagal mereset antrean." };
    return { success: true };
}

// ══════════════════════════════════════════════════════
// CREATE / MANAGE QUEUE EVENTS (admin only)
// ══════════════════════════════════════════════════════

export async function createQueueEvent(
    name: string,
    boothName: string,
    avgSessionDurationSec: number = 600
): Promise<{ success: boolean; eventId?: string; error?: string }> {
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized — silakan login dulu." };

    const { data, error } = await authClient
        .from("queue_events")
        .insert({
            name,
            booth_name: boothName,
            avg_session_duration_sec: avgSessionDurationSec,
            is_active: true,
        })
        .select("id")
        .single();

    if (error || !data) {
        console.error("[createQueueEvent] Supabase error:", error);
        return { success: false, error: `DB Error: ${error?.message || "Tabel queue_events mungkin belum dibuat di Supabase."}` };
    }
    return { success: true, eventId: data.id };
}

export async function toggleQueueEventActive(
    eventId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAnonClient();
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await authClient
        .from("queue_events")
        .update({ is_active: isActive })
        .eq("id", eventId);

    if (error) return { success: false, error: "Gagal mengubah status event." };
    return { success: true };
}
