import { parseJsonContent } from "@/lib/useSiteContent";
import { DEFAULT_FRAMES, type FrameItem } from "@/data/frames";

/**
 * An event whose frames guests can browse at /frames/event/[slug] (the QR handed out at the booth).
 *
 * The list lives in site_content (section "frame_events", key "items") and is edited by super admins
 * at /admin/frame-events. Until that row exists, SEED_FRAME_EVENTS below stands in for it.
 * Each event lists catalogue frame ids: the built-in designs plus designs uploaded through the CMS.
 */
export interface FrameEvent {
    slug: string;
    name: string;
    /** Free text shown under the name, e.g. "Sabtu, 8 November 2026" */
    date?: string;
    venue?: string;
    frameIds: string[];
}

/**
 * A photo in the Visual Archive (site_content "gallery" / "items"). Older items name a file in the
 * "gallery" storage bucket; photos sent from a claimed session carry their own media url instead.
 */
export interface ArchiveItem {
    name: string;
    event: string;
    type: string;
    url?: string;
    event_slug?: string;
    session_id?: string;
    media_id?: string;
}

export interface ResolvedFrameEvent {
    slug: string;
    name: string;
    date?: string;
    venue?: string;
    frames: FrameItem[];
    /** Visual Archive photos sent to this event, newest first */
    photos: string[];
}

type ContentMap = Record<string, Record<string, string>>;

// Grouped from the catalogue's own numbering (1.x, 2.x ...), one group per client event.
// Names are read off the frame headers; dates and venues are unknown, so they are left out.
export const SEED_FRAME_EVENTS: FrameEvent[] = [
    { slug: "farewell-bem-undip-2025", name: "Farewell Party BEM UNDIP 2025", frameIds: ["frame-1-1", "frame-1-2"] },
    { slug: "first-gathering-hmti", name: "First Gathering HMTI", frameIds: ["frame-2-1", "frame-2-2"] },
    { slug: "welcoming-party-bem-undip-2026", name: "Welcoming Party BEM UNDIP 2026", frameIds: ["frame-3-1", "frame-3-2"] },
    { slug: "welcoming-party-bem-ft-2026", name: "Welcoming Party BEM FT 2026", frameIds: ["frame-4-1", "frame-4-2"] },
    { slug: "first-gathering-bem-sv-2026", name: "First Gathering BEM SV 2026", frameIds: ["frame-5-1", "frame-5-2", "frame-5-3"] },
    { slug: "lazone-fertilized-6", name: "LAZONE.ID Fertilized 6.0", frameIds: ["frame-6-1", "frame-6-2", "frame-6-3"] },
    { slug: "strivenge", name: "Strivenge", frameIds: ["frame-6-4", "frame-6-5", "frame-6-6"] },
    { slug: "farewell-himaformas", name: "Farewell AT Himaformas", frameIds: ["frame-9-1", "frame-9-2", "frame-9-4"] },
    { slug: "fisipmars-party", name: "Fisipmars Party", frameIds: ["frame-11-1", "frame-11-2", "frame-11-3", "frame-11-4"] },
    { slug: "farewell-girl-up", name: "Farewell Girl Up", frameIds: ["frame-13-1", "frame-13-2"] },
];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isFrameEvent(value: unknown): value is FrameEvent {
    const v = value as FrameEvent;
    return Boolean(v && typeof v.slug === "string" && SLUG_PATTERN.test(v.slug) && typeof v.name === "string" && v.name);
}

/** The saved list once a super admin has edited it, the seeds before that. */
export function listFrameEvents(contentMap: ContentMap): FrameEvent[] {
    const saved = parseJsonContent<unknown>(contentMap["frame_events"]?.["items"], null);
    if (!Array.isArray(saved)) return SEED_FRAME_EVENTS;
    return saved.filter(isFrameEvent).map((e) => ({ ...e, frameIds: Array.isArray(e.frameIds) ? e.frameIds : [] }));
}

/** Built-in designs merged with the ones uploaded through the CMS (CMS first, same id replaces). */
export function listFrameCatalogue(contentMap: ContentMap): FrameItem[] {
    const fromCms = parseJsonContent<unknown>(contentMap["featured_frames"]?.["items"], []);
    const cms = (Array.isArray(fromCms) ? fromCms : []).filter(
        (f): f is FrameItem => Boolean(f && typeof f.id === "string" && typeof f.image_url === "string")
    );
    const ids = new Set(cms.map((f) => f.id));
    return [...cms, ...DEFAULT_FRAMES.filter((f) => !ids.has(f.id))];
}

export function listArchiveItems(contentMap: ContentMap): ArchiveItem[] {
    const items = parseJsonContent<unknown>(contentMap["gallery"]?.["items"], []);
    return (Array.isArray(items) ? items : []).filter((i): i is ArchiveItem => Boolean(i && typeof i.name === "string"));
}

/** Where an archive photo can be loaded from: its own media url, or its file in the gallery bucket. */
export function archiveItemUrl(item: ArchiveItem): string {
    if (item.url) return item.url;
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
    return `${base}/storage/v1/object/public/gallery/${encodeURIComponent(item.name)}`;
}

/** The event with its frames looked up in the live catalogue, or null when the slug is unknown or has no frames. */
export function resolveFrameEvent(contentMap: ContentMap, slug: string): ResolvedFrameEvent | null {
    const event = listFrameEvents(contentMap).find((e) => e.slug === slug);
    if (!event) return null;

    const catalogue = new Map(listFrameCatalogue(contentMap).map((f) => [f.id, f]));
    const frames = event.frameIds.map((id) => catalogue.get(id)).filter((f): f is FrameItem => Boolean(f));
    if (frames.length === 0) return null;

    const photos = listArchiveItems(contentMap)
        .filter((i) => i.event_slug === slug)
        .reverse()
        .map(archiveItemUrl);

    return { slug: event.slug, name: event.name, date: event.date, venue: event.venue, frames, photos };
}

/**
 * Catalogue frames ship as large PNGs with 1200px and 600px webp copies beside them;
 * frames uploaded through the CMS are used as they are.
 */
export function frameImage(url: string, size: "modal" | "thumb"): string {
    const match = url.match(/^\/images\/frames\/([\w.-]+)\.png$/);
    return match ? `/images/frames/${size}/${match[1]}.webp` : url;
}

/** Display copy of a session photo through the resizing proxy (same as the profile gallery). */
export function photoDisplayUrl(url: string, width = 640): string {
    return `/api/image?url=${encodeURIComponent(url)}&w=${width}&q=72`;
}
