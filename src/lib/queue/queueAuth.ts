import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createSessionClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Server Components cannot set cookies. Safe to ignore here.
                    }
                },
            },
        }
    );
}

/** The signed-in user, or null. */
export async function getQueueUser() {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * For server code that has already checked who is asking: private ticket columns and every
 * ticket write go through here, never through the public anon role.
 *
 * Uses the service-role key when the server has one. Without it, this acts as the signed-in user,
 * which stops working once _harness/sql/queue-privacy.sql has been applied.
 */
export async function createQueueServerClient(): Promise<SupabaseClient> {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        );
    }
    return createSessionClient();
}
