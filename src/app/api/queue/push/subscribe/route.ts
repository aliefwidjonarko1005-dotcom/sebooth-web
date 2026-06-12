import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * POST /api/queue/push/subscribe
 * Save a push subscription for a user.
 * Body: { userId, endpoint, p256dh, auth }
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, endpoint, p256dh, auth } = body;

    if (!userId || !endpoint || !p256dh || !auth) {
        return NextResponse.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
        );
    }

    const supabase = createServiceClient();

    // Upsert: update existing subscription for this user+endpoint, or insert new
    const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
            {
                user_id: userId,
                endpoint,
                p256dh,
                auth_key: auth,
            },
            {
                onConflict: "user_id,endpoint",
            }
        );

    if (error) {
        console.error("[Push Subscribe] DB error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save subscription" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
