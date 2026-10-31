import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/apiSecurity";
import { cleanText, errorResponse, requireSuperAdmin, slugify, writeSiteContent } from "@/lib/siteContentAdmin";
import {
    SLUG_PATTERN,
    archiveItemUrl,
    listArchiveItems,
    listFrameCatalogue,
    listFrameEvents,
    type FrameEvent,
} from "@/data/frameEvents";

export const dynamic = "force-dynamic";

/** Everything the /admin/frame-events editor and the profile "show on website" sheet need. */
export async function GET() {
    const ctx = await requireSuperAdmin();
    if (ctx instanceof NextResponse) return ctx;
    const { contentMap } = ctx;
    const archive = listArchiveItems(contentMap).map((i) => ({ ...i, src: archiveItemUrl(i) }));
    return NextResponse.json(
        { events: listFrameEvents(contentMap), catalogue: listFrameCatalogue(contentMap), archive },
        { headers: { "Cache-Control": "no-store" } }
    );
}

type Body =
    | { action: "save"; originalSlug?: string; event: Partial<FrameEvent> }
    | { action: "delete"; slug: string };

export async function POST(req: Request) {
    const limited = rateLimit(req, "admin-frame-events", 60, 60_000);
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

    const events = listFrameEvents(contentMap);
    let next: FrameEvent[];

    if (body.action === "delete") {
        next = events.filter((e) => e.slug !== body.slug);
    } else if (body.action === "save") {
        const name = cleanText(body.event?.name, 80);
        const slug = slugify(cleanText(body.event?.slug, 60) || name);
        if (!name || !SLUG_PATTERN.test(slug)) {
            return NextResponse.json({ error: "Nama acara wajib diisi." }, { status: 400 });
        }
        const known = new Set(listFrameCatalogue(contentMap).map((f) => f.id));
        const frameIds = Array.from(new Set((body.event?.frameIds ?? []).filter((id) => typeof id === "string" && known.has(id))));
        if (frameIds.length === 0) {
            return NextResponse.json({ error: "Pilih minimal satu frame." }, { status: 400 });
        }
        const original = body.originalSlug ?? slug;
        if (slug !== original && events.some((e) => e.slug === slug)) {
            return NextResponse.json({ error: "Alamat acara ini sudah dipakai acara lain." }, { status: 409 });
        }
        const saved: FrameEvent = {
            slug,
            name,
            date: cleanText(body.event?.date, 80) || undefined,
            venue: cleanText(body.event?.venue, 80) || undefined,
            frameIds,
        };
        const at = events.findIndex((e) => e.slug === original);
        next = at >= 0 ? events.map((e, i) => (i === at ? saved : e)) : [saved, ...events];
    } else {
        return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    }

    try {
        await writeSiteContent(db, "frame_events", "items", next);
    } catch (err) {
        return errorResponse(err, "Gagal menyimpan acara");
    }
    revalidatePath("/frames/event", "layout");
    return NextResponse.json({ events: next });
}
