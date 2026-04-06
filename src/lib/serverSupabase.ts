import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for use in Server Components.
 * This is separate from the browser client (which uses @supabase/ssr for auth cookies).
 * Used for reading public data like site_content in Server Components.
 */
export const createServerContentClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

// ═══════════════════════════════════════════════════════
// SERVER-SIDE DATA FETCHING FUNCTIONS
// Centralized fetchers for ISR + Server Components
// ═══════════════════════════════════════════════════════

/**
 * Fetch all site_content and build a nested map: { section: { key: value } }
 */
export async function fetchSiteContent(): Promise<Record<string, Record<string, string>>> {
    const supabase = createServerContentClient();
    const { data } = await supabase.from("site_content").select("section, key, value");

    const contentMap: Record<string, Record<string, string>> = {};
    if (data) {
        data.forEach((item: { section: string; key: string; value: string | null }) => {
            if (!contentMap[item.section]) contentMap[item.section] = {};
            if (item.value) {
                contentMap[item.section][item.key] = item.value;
            }
        });
    }
    return contentMap;
}

/**
 * Fetch gallery images from Supabase storage bucket.
 * Returns array of { name, url, event, type } for the Gallery section.
 */
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv"];

function isVideoFile(filename: string): boolean {
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext);
}

export async function fetchGalleryImages(
    metadataItems: { name: string; event: string; type: string }[]
): Promise<{ id: number; name: string; url: string; event: string; type: string; mediaType: "image" | "video" }[]> {
    const supabase = createServerContentClient();
    const { data } = await supabase.storage
        .from("gallery")
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (!data) return [];

    return data
        .filter((f) => !f.name.startsWith("."))
        .map((f, i) => {
            const meta = metadataItems.find((m) => m.name === f.name);
            return {
                id: i + 1,
                name: f.name,
                url: supabase.storage.from("gallery").getPublicUrl(f.name).data.publicUrl,
                event: meta?.event || f.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
                type: meta?.type || "All",
                mediaType: isVideoFile(f.name) ? "video" as const : "image" as const,
            };
        });
}

/**
 * Fetch published Instagram posts ordered by display_order.
 */
export async function fetchInstagramPosts(): Promise<{ id: string; instagram_url: string }[]> {
    const supabase = createServerContentClient();
    const { data } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("display_order");

    return data ?? [];
}

/**
 * Fetch published news items, limited to latest 6.
 */
export async function fetchNews(): Promise<{
    id: string;
    title: string;
    body: string;
    image_url: string;
    created_at: string;
}[]> {
    const supabase = createServerContentClient();
    const { data } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);

    return data ?? [];
}

/**
 * Fetch section visibility settings from site_content.
 * Returns a map like { hero: true, about: false, ... }
 */
export async function fetchSectionVisibility(): Promise<Record<string, boolean>> {
    const supabase = createServerContentClient();
    const { data } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("section", "settings")
        .ilike("key", "section_%_visible");

    const visibility: Record<string, boolean> = {};
    if (data) {
        data.forEach((item: { key: string; value: string | null }) => {
            const sectionName = item.key.replace(/section_(.*)_visible/, "$1");
            visibility[sectionName] = item.value === "true";
        });
    }
    return visibility;
}

/**
 * Fetch a single photobooth session by ID, including its media.
 * Used by /access/[id] Server Component for SSR data fetching.
 */
export async function fetchSessionById(id: string) {
    const supabase = createServerContentClient();
    const { data, error } = await supabase
        .from("sessions")
        .select("*, media(*)")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

/**
 * Fetch CMS content for the About page.
 * Returns key-value map from site_content where section = 'about_page'.
 */
export async function fetchAboutPageContent(): Promise<Record<string, string>> {
    const supabase = createServerContentClient();
    const { data } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("section", "about_page");

    const content: Record<string, string> = {};
    if (data) {
        data.forEach((item: { key: string; value: string | null }) => {
            if (item.value) content[item.key] = item.value;
        });
    }
    return content;
}

/**
 * Fetch CMS content for the Partnership page.
 * Returns key-value map from site_content where section = 'partnership_page'.
 */
export async function fetchPartnershipPageContent(): Promise<Record<string, string>> {
    const supabase = createServerContentClient();
    const { data } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("section", "partnership_page");

    const content: Record<string, string> = {};
    if (data) {
        data.forEach((item: { key: string; value: string | null }) => {
            if (item.value) content[item.key] = item.value;
        });
    }
    return content;
}

/**
 * Fetch a single news item by ID for the news detail page.
 */
export async function fetchNewsById(id: string) {
    const supabase = createServerContentClient();
    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}
