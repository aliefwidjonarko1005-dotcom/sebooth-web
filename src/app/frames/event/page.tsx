import type { Metadata } from "next";
import Link from "next/link";
import { fetchSiteContent } from "@/lib/serverSupabase";
import { listFrameEvents, resolveFrameEvent } from "@/data/frameEvents";
import s from "@/components/frames-event/qrCard.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
    title: { absolute: "Frame per acara | Sebooth" },
    robots: { index: false, follow: false },
};

/** Staff list: every event with frames, its guest page and its printable QR card. */
export default async function FrameEventsPage() {
    const contentMap = await fetchSiteContent();
    const events = listFrameEvents(contentMap)
        .map((e) => resolveFrameEvent(contentMap, e.slug))
        .filter((e): e is NonNullable<typeof e> => Boolean(e));

    return (
        <div className={s.sheet}>
            <div className={s.list}>
                <h1>Frame per acara</h1>
                <p>
                    Buka QR acara yang sedang berjalan, cetak, lalu taruh di meja booth. Tamu yang memindai akan melihat semua frame acara itu.
                    Super admin bisa menambah acara dan desain di <Link href="/admin/frame-events">Kelola frame acara</Link>.
                </p>
                <ul className={s.rows}>
                    {events.map((e) => (
                        <li key={e.slug} className={s.row}>
                            <div>
                                <strong>{e.name}</strong>
                                <span>{e.frames.length} frame</span>
                            </div>
                            <Link href={`/frames/event/${e.slug}`}>Lihat</Link>
                            <Link href={`/frames/event/${e.slug}/qr`}>Kartu QR</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
