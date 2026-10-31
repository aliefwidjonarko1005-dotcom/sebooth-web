import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteContent } from "@/lib/serverSupabase";
import { frameImage, resolveFrameEvent } from "@/data/frameEvents";
import { PrintButton } from "@/components/frames-event/PrintButton";
import s from "@/components/frames-event/qrCard.module.css";

export const revalidate = 60;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in").replace(/\/$/, "");

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
    title: { absolute: "QR frame acara | Sebooth" },
    robots: { index: false, follow: false },
};

/** Printable table card for the booth: the QR guests scan to open /frames/event/[slug]. */
export default async function EventFramesQrPage({ params }: Props) {
    const { slug } = await params;
    const event = resolveFrameEvent(await fetchSiteContent(), slug);
    if (!event) notFound();

    const url = `${SITE_URL}/frames/event/${event.slug}`;
    // Same QR service the queue display uses; SVG keeps it sharp at any print size
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&format=svg&margin=0&ecc=M&data=${encodeURIComponent(url)}`;

    return (
        <div className={s.sheet}>
            <div className={s.toolbar}>
                <PrintButton />
                <a href={`/frames/event/${event.slug}`}>Buka halaman frame</a>
            </div>

            <article className={s.card}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={s.logo} src="/images/logo/sebooth-navy.svg" alt="Sebooth" width={96} height={40} />
                <h1>{event.name}</h1>
                <p className={s.lede}>Pindai untuk lihat {event.frames.length} frame acara ini, lalu pilih favoritmu di booth.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={s.qr} src={qrSrc} alt={`QR ke ${url}`} width={600} height={600} />
                <p className={s.url}>{url.replace(/^https?:\/\//, "")}</p>
                <ul
                    className={s.prints}
                    aria-label="Frame di acara ini"
                    style={{ gridTemplateColumns: `repeat(${Math.min(4, event.frames.length)}, minmax(0, 1fr))` }}
                >
                    {event.frames.slice(0, 4).map((f) => (
                        <li key={f.id}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={frameImage(f.image_url, "thumb")} alt={f.title} width={600} height={471} />
                        </li>
                    ))}
                </ul>
            </article>
        </div>
    );
}
