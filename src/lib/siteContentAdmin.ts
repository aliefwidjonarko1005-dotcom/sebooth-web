import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminStatus } from "@/lib/apiSecurity";
import { fetchSiteContent } from "@/lib/serverSupabase";

/**
 * Super-admin writes to site_content and the public "gallery" bucket.
 *
 * Uses the service-role key when the server has one; otherwise it writes as the signed-in admin,
 * which needs RLS policies on site_content and storage that allow admins to insert and update.
 */
async function writeClient(): Promise<SupabaseClient> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    }
    const cookieStore = await cookies();
    return createServerClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
        },
    });
}

export type SuperAdminContext = { db: SupabaseClient; contentMap: Record<string, Record<string, string>> };

/** Resolves to the write client and current content for a super admin, or to the error response to send. */
export async function requireSuperAdmin(): Promise<SuperAdminContext | NextResponse> {
    const status = await getAdminStatus();
    if (!status) return NextResponse.json({ error: "Masuk sebagai admin dulu." }, { status: 401 });
    if (!status.isSuper) return NextResponse.json({ error: "Hanya super admin yang bisa mengubah ini." }, { status: 403 });
    return { db: await writeClient(), contentMap: await fetchSiteContent() };
}

/** Upserts one site_content value without relying on a unique index over (section, key). */
export async function writeSiteContent(db: SupabaseClient, section: string, key: string, value: unknown) {
    const text = JSON.stringify(value);
    const { data, error } = await db.from("site_content").update({ value: text }).eq("section", section).eq("key", key).select("key");
    if (error) throw new Error(error.message);
    if (data && data.length > 0) return;
    const { error: insertError } = await db.from("site_content").insert({ section, key, value: text });
    if (insertError) throw new Error(insertError.message);
}

export function errorResponse(err: unknown, fallback: string) {
    const message = err instanceof Error ? err.message : fallback;
    console.error(fallback, err);
    return NextResponse.json({ error: `${fallback}: ${message}` }, { status: 500 });
}

/** Keeps a free-text field short and single-line. */
export function cleanText(value: unknown, max: number): string {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}
