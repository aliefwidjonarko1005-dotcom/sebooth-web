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
        console.error("[Push Subscribe] Missing fields:", { userId: !!userId, endpoint: !!endpoint, p256dh: !!p256dh, auth: !!auth });
        return NextResponse.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
        );
    }

    const supabase = createServiceClient();

    // Try upsert first (requires unique constraint on user_id+endpoint)
    const { error: upsertError } = await supabase
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

    if (upsertError) {
        console.error("[Push Subscribe] Upsert error:", upsertError.message, upsertError.code);

        // Fallback: If upsert fails (e.g., no unique constraint), try delete+insert
        if (upsertError.code === "42P10" || upsertError.code === "23505" || upsertError.message?.includes("unique")) {
            // Delete existing and re-insert
            await supabase
                .from("push_subscriptions")
                .delete()
                .eq("user_id", userId)
                .eq("endpoint", endpoint);

            const { error: insertError } = await supabase
                .from("push_subscriptions")
                .insert({
                    user_id: userId,
                    endpoint,
                    p256dh,
                    auth_key: auth,
                });

            if (insertError) {
                console.error("[Push Subscribe] Insert fallback error:", insertError.message);
                return NextResponse.json(
                    { success: false, error: `Failed to save subscription: ${insertError.message}` },
                    { status: 500 }
                );
            }
        } else {
            // Try plain insert as final fallback
            const { error: insertError } = await supabase
                .from("push_subscriptions")
                .insert({
                    user_id: userId,
                    endpoint,
                    p256dh,
                    auth_key: auth,
                });

            if (insertError) {
                console.error("[Push Subscribe] Insert error:", insertError.message);
                return NextResponse.json(
                    { success: false, error: `Failed to save subscription: ${insertError.message}` },
                    { status: 500 }
                );
            }
        }
    }

    console.info("[Push Subscribe] Subscription saved for user:", userId);
    return NextResponse.json({ success: true });
}
