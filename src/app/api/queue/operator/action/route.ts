import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { broadcastQueueUpdate } from "@/app/api/queue/stream/[eventId]/route";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import {
    operatorCallNext,
    operatorSkipTicket,
    operatorCompleteTicket,
    operatorResetTicket,
} from "@/lib/queue/queueActions";

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

/**
 * POST /api/queue/operator/action
 * Body: { action: "call_next" | "skip" | "complete" | "reset", eventId?, ticketId?, sessionId? }
 */
export async function POST(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, eventId, ticketId, sessionId } = body;

    let result: { success: boolean; error?: string; [key: string]: unknown };

    switch (action) {
        case "call_next":
            if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
            result = await operatorCallNext(eventId);
            break;

        case "skip":
            if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
            result = await operatorSkipTicket(ticketId);
            break;

        case "complete":
            if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
            result = await operatorCompleteTicket(ticketId, sessionId);
            break;

        case "reset":
            if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
            result = await operatorResetTicket(ticketId);
            break;

        default:
            return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Broadcast updated state to all SSE clients if we have an eventId
    if (eventId) {
        const freshStatus = await fetchQueueStatus(eventId);
        broadcastQueueUpdate(eventId, freshStatus);
    }

    return NextResponse.json(result);
}
