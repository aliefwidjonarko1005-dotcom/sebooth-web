import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/apiSecurity";
import { cleanText, errorResponse, requireSuperAdmin, writeSiteContent } from "@/lib/siteContentAdmin";
import { parseJsonContent } from "@/lib/useSiteContent";
import type { FrameItem } from "@/data/frames";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Uploads a frame design (slots still empty) to the public "gallery" bucket and adds it to the
 * catalogue in site_content.featured_frames, where /frames and every event picker can use it.
 */
export async function POST(req: Request) {
    const limited = rateLimit(req, "admin-frame-designs", 20, 60_000);
    if (limited) return limited;
    const ctx = await requireSuperAdmin();
    if (ctx instanceof NextResponse) return ctx;
    const { db, contentMap } = ctx;

    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return NextResponse.json({ error: "Format unggahan tidak valid." }, { status: 400 });
    }
    const file = form.get("file");
    const title = cleanText(form.get("title"), 80);
    const category = cleanText(form.get("category"), 40) || "EVENT";
    if (!(file instanceof File) || !TYPES[file.type]) {
        return NextResponse.json({ error: "Pilih gambar PNG, JPG atau WebP." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Ukuran gambar maksimal 8 MB." }, { status: 400 });
    }
    if (!title) {
        return NextResponse.json({ error: "Nama frame wajib diisi." }, { status: 400 });
    }

    const id = `frame_${Date.now()}`;
    const path = `frames/${id}.${TYPES[file.type]}`;
    const { error: uploadError } = await db.storage
        .from("gallery")
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (uploadError) return errorResponse(uploadError, "Gagal mengunggah gambar");

    const frame: FrameItem = {
        id,
        title: title.toUpperCase(),
        category: category.toUpperCase(),
        image_url: db.storage.from("gallery").getPublicUrl(path).data.publicUrl,
    };
    const current = parseJsonContent<FrameItem[]>(contentMap["featured_frames"]?.["items"], []);
    try {
        await writeSiteContent(db, "featured_frames", "items", [frame, ...(Array.isArray(current) ? current : [])]);
    } catch (err) {
        return errorResponse(err, "Gagal menyimpan frame");
    }
    revalidatePath("/frames", "page");
    return NextResponse.json({ frame });
}
