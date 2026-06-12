import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { joinQueue } from "@/lib/queue/queueActions";
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
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function POST(req: NextRequest) {
    // Validate authentication
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json(
            { success: false, error: "Kamu harus login terlebih dahulu untuk mengambil antrean." },
            { status: 401 }
        );
    }

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
        return NextResponse.json(
            { success: false, error: "eventId wajib diisi." },
            { status: 400 }
        );
    }

    // Get user data from metadata
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const phoneNumber = user.user_metadata?.phone_number || null;

    const result = await joinQueue(eventId, displayName, phoneNumber, user.id);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Broadcast updated state to SSE clients
    try {
        const freshStatus = await fetchQueueStatus(eventId);
        broadcastQueueUpdate(eventId, freshStatus);
    } catch (e) {
        console.error("Failed to broadcast queue update:", e);
    }

    return NextResponse.json({
        success: true,
        ticketId: result.ticketId,
        queueNumber: result.queueNumber,
    });
}
