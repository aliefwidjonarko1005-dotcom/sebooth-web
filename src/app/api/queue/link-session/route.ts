import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { broadcastQueueUpdate } from "@/app/api/queue/stream/[eventId]/route";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";

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
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * POST /api/queue/link-session
 * Called when user scans QR code from the photobooth screen.
 * Links the photobooth session to the user's account.
 * 
 * Body: { sessionToken: string }
 * 
 * The sessionToken encodes: session_id:event_id:timestamp (base64)
 * Token is valid for 10 minutes.
 */
export async function POST(req: NextRequest) {
    // Validate auth
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json(
            { success: false, error: "Unauthorized — kamu harus login." },
            { status: 401 }
        );
    }

    const body = await req.json();
    const { sessionToken } = body;

    if (!sessionToken) {
        return NextResponse.json(
            { success: false, error: "sessionToken wajib diisi." },
            { status: 400 }
        );
    }

    // Decode token
    let sessionId: string;
    let eventId: string;
    let tokenTimestamp: number;

    try {
        const decoded = Buffer.from(sessionToken, "base64url").toString("utf-8");
        const parts = decoded.split(":");
        if (parts.length < 3) throw new Error("Invalid token format");

        sessionId = parts[0];
        eventId = parts[1];
        tokenTimestamp = parseInt(parts[2], 10);

        // Validate token age (10 minutes max)
        const ageMs = Date.now() - tokenTimestamp;
        if (ageMs > 10 * 60 * 1000) {
            return NextResponse.json(
                { success: false, error: "QR code sudah kadaluarsa. Minta QR baru di mesin booth." },
                { status: 400 }
            );
        }
        if (ageMs < 0) {
            return NextResponse.json(
                { success: false, error: "QR code tidak valid." },
                { status: 400 }
            );
        }
    } catch {
        return NextResponse.json(
            { success: false, error: "QR code tidak valid." },
            { status: 400 }
        );
    }

    const supabase = createServiceClient();

    // Find user's active ticket for this event
    const { data: ticket, error: ticketError } = await supabase
        .from("queue_tickets")
        .select("id, queue_number, status")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .in("status", ["called", "waiting"])
        .order("queue_number", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (ticketError || !ticket) {
        return NextResponse.json(
            { success: false, error: "Tidak ditemukan tiket antrean aktif untuk event ini." },
            { status: 404 }
        );
    }

    // Update ticket: link to session and mark as in_session
    const { error: updateTicketError } = await supabase
        .from("queue_tickets")
        .update({
            status: "in_session",
            session_id: sessionId,
            called_at: ticket.status === "called" ? undefined : new Date().toISOString(),
        })
        .eq("id", ticket.id);

    if (updateTicketError) {
        return NextResponse.json(
            { success: false, error: "Gagal menghubungkan sesi." },
            { status: 500 }
        );
    }

    // Update session: link to user
    await supabase
        .from("sessions")
        .update({
            user_id: user.id,
            queue_ticket_id: ticket.id,
        })
        .eq("id", sessionId);

    // Broadcast updated state to SSE clients
    const freshStatus = await fetchQueueStatus(eventId);
    broadcastQueueUpdate(eventId, freshStatus);

    return NextResponse.json({
        success: true,
        ticketId: ticket.id,
        sessionId,
        message: "Sesi berhasil dihubungkan! Selamat berfoto 📸",
    });
}
