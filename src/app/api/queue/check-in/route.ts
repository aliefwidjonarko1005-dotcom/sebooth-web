import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { broadcastQueueUpdate } from "@/app/api/queue/stream/[eventId]/route";

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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );
    return { supabase, user: (await supabase.auth.getUser()).data.user };
}

export async function POST(req: NextRequest) {
    const { supabase, user } = await getAuthUser();
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, eventId } = await req.json();

    if (!ticketId || !eventId) {
        return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    // Verify the ticket belongs to the user
    const { data: ticket, error: fetchError } = await supabase
        .from("queue_tickets")
        .select("id, status, user_id, is_checked_in")
        .eq("id", ticketId)
        .single();

    if (fetchError || !ticket) {
        return NextResponse.json({ success: false, error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    if (ticket.user_id !== user.id) {
        return NextResponse.json({ success: false, error: "Tiket ini bukan milik Anda" }, { status: 403 });
    }

    if (ticket.is_checked_in) {
        return NextResponse.json({ success: true, message: "Sudah check-in" });
    }

    // Update is_checked_in
    const updates: any = { is_checked_in: true };

    // If already called, checking in extends the expiration time back to 5 minutes
    if (ticket.status === "called") {
        updates.expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    }

    const { error: updateError } = await supabase
        .from("queue_tickets")
        .update(updates)
        .eq("id", ticketId);

    if (updateError) {
        return NextResponse.json({ success: false, error: "Gagal check-in" }, { status: 500 });
    }

    // Broadcast the update
    try {
        const freshStatus = await fetchQueueStatus(eventId);
        broadcastQueueUpdate(eventId, freshStatus);
    } catch (e) {
        console.error("Failed to broadcast queue update after check-in:", e);
    }

    return NextResponse.json({ success: true });
}
