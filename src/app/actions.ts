"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Revalidates the homepage and all public pages that depend on site_content.
 * Called after admin edits content via the inline editor or CMS panel.
 */
export async function revalidateSiteContent() {
    // Homepage (all sections)
    revalidatePath("/", "page");
    // About page (may reference site_content)
    revalidatePath("/about", "page");
    // Partnership page
    revalidatePath("/partnership", "page");
    // News detail pages
    revalidatePath("/news/[id]", "page");
}

/**
 * Revalidates a specific page path.
 * Useful for targeted cache invalidation.
 */
export async function revalidateSpecificPage(path: string) {
    revalidatePath(path, "page");
}

/**
 * Atomically claim a session for the currently authenticated user.
 * Runs securely on the server.
 */
export async function claimSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Atomic claim with WHERE is_claimed = false
    const { data, error } = await supabase
        .from("sessions")
        .update({ user_id: user.id, is_claimed: true })
        .eq("id", sessionId)
        .eq("is_claimed", false)
        .select()
        .single();

    if (error || !data) {
        return { success: false, error: "Gagal mengklaim sesi ini. Mungkin sesi ini sudah diklaim oleh pengguna lain atau tidak ditemukan." };
    }

    return { success: true };
}
