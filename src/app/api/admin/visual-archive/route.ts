import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { rateLimit, resolveMediaSource } from "@/lib/apiSecurity";
import { cleanText, errorResponse, requireSuperAdmin, writeSiteContent } from "@/lib/siteContentAdmin";
import { listArchiveItems, listFrameEvents, type ArchiveItem } from "@/data/frameEvents";

export const dynamic = "force-dynamic";

type Body =
    | { action: "add"; url: string; sessionId?: string; mediaId?: string; event?: string; type?: string; eventSlug?: string }
    | { action: "remove"; name: string };

/**
 * Sends a photo from a claimed session to the Visual Archive (site_content gallery.items), optionally
 * tied to a frame event so it also shows on that event's page. Removing takes it off both.
 */
export async function POST(req: Request) {
    const limited = rateLimit(req, "admin-visual-archive", 60, 60_000);
    if (limited) return limited;
    const ctx = await requireSuperAdmin();
    if (ctx instanceof NextResponse) return ctx;
    const { db, contentMap } = ctx;

    let body: Body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
    }

    const items = listArchiveItems(contentMap);
    let next: ArchiveItem[];
    let eventSlug: string | undefined;

    if (body.action === "remove") {
        const removed = items.find((i) => i.name === body.name);
        eventSlug = removed?.event_slug;
        next = items.filter((i) => i.name !== body.name);
    } else if (body.action === "add") {
        // Only media the site already serves (the booth's media bucket, Supabase storage)
        const source = typeof body.url === "string" ? resolveMediaSource(body.url) : null;
        if (!source || source.kind !== "remote") {
            return NextResponse.json({ error: "Foto ini tidak bisa ditambahkan." }, { status: 400 });
        }
        const event = listFrameEvents(contentMap).find((e) => e.slug === body.eventSlug);
        eventSlug = event?.slug;
        const mediaId = cleanText(body.mediaId, 64);
        const name = `archive_${mediaId || Date.now()}`;
        if (items.some((i) => i.name === name || i.url === source.url)) {
            return NextResponse.json({ error: "Foto ini sudah ada di Visual Archive." }, { status: 409 });
        }
        next = [
            ...items,
            {
                name,
                url: source.url,
                event: cleanText(body.event, 80) || event?.name || "Sebooth Event",
                type: cleanText(body.type, 40) || "All",
                event_slug: eventSlug,
                session_id: cleanText(body.sessionId, 64) || undefined,
                media_id: mediaId || undefined,
            },
        ];
    } else {
        return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    }

    try {
        await writeSiteContent(db, "gallery", "items", next);
    } catch (err) {
        return errorResponse(err, "Gagal menyimpan Visual Archive");
    }
    if (eventSlug) revalidatePath(`/frames/event/${eventSlug}`, "page");
    return NextResponse.json({ ok: true, count: next.length });
}
