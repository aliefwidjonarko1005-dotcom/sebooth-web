"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ResolvedFrameEvent } from "@/data/frameEvents";
import { frameImage, photoDisplayUrl } from "@/data/frameEvents";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, whatsappUrl } from "@/config/social";
import { FrameSlider, type FrameSliderHandle } from "./FrameSlider";
import s from "./eventFrames.module.css";

export function EventFramesClient({ event }: { event: ResolvedFrameEvent }) {
    const { frames } = event;
    const n = frames.length;
    const [active, setActive] = useState(0);
    const pageRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<FrameSliderHandle>(null);
    const viewerRef = useRef<HTMLElement>(null);

    const go = useCallback(
        (to: number) => sliderRef.current?.goTo(((to % n) + n) % n),
        [n]
    );

    // Deep link: ?frame=<id> opens on that frame
    useEffect(() => {
        // Only hide not-yet-revealed parts once the script that reveals them is running
        pageRef.current?.classList.add(s.js);
        const id = new URLSearchParams(window.location.search).get("frame");
        const at = id ? frames.findIndex((f) => f.id === id) : -1;
        if (at > 0) sliderRef.current?.goTo(at, true);
    }, [frames]);

    useEffect(() => {
        const url = new URL(window.location.href);
        if (active === 0) url.searchParams.delete("frame");
        else url.searchParams.set("frame", frames[active].id);
        window.history.replaceState(window.history.state, "", url);
    }, [active, frames]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            const tag = (e.target as HTMLElement | null)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            if (e.key === "ArrowRight") {
                e.preventDefault();
                go(active + 1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(active - 1);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go, active]);

    // Index tiles and the footer rise in as they reach the screen
    useEffect(() => {
        const items = document.querySelectorAll<HTMLElement>(`.${s.reveal}`);
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add(s.shown);
                    io.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -8% 0px" }
        );
        items.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    function pickFromIndex(i: number) {
        // Two smooth scrolls at once (page up, pager sideways) stall each other in Chrome,
        // so the pager jumps to the frame and only the page glides back up to it
        sliderRef.current?.goTo(i, true);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        viewerRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }

    const frame = frames[active];
    const cols = Math.min(4, Math.max(2, n));
    const year = new Date().getFullYear();

    return (
        <div ref={pageRef} className={s.page}>
            <section ref={viewerRef} className={s.viewer} aria-roledescription="carousel" aria-label={`Frame ${event.name}`}>
                <header className={`${s.wrap} ${s.bar}`}>
                    <Link href="/" aria-label="Sebooth, ke beranda">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/logo/sebooth-navy.svg" alt="Sebooth" width={76} height={32} />
                    </Link>
                    <Link href="/frames" className={s.barLink}>
                        Semua frame
                    </Link>
                </header>

                <div className={`${s.wrap} ${s.intro}`}>
                    <h1 className={s.rise}>{event.name}</h1>
                    <p className={`${s.lede} ${s.rise}`} style={{ "--delay": "80ms" } as React.CSSProperties}>
                        {n} desain frame photostrip di booth Sebooth acara ini. Geser untuk lihat satu per satu.
                    </p>
                    {(event.date || event.venue) && (
                        <p className={`${s.when} ${s.rise}`} style={{ "--delay": "140ms" } as React.CSSProperties}>
                            {[event.date, event.venue].filter(Boolean).join(" · ")}
                        </p>
                    )}
                </div>

                <div className={s.rise} style={{ "--delay": "180ms" } as React.CSSProperties}>
                    <FrameSlider ref={sliderRef} frames={frames} onActiveChange={setActive} />
                </div>

                <div className={`${s.wrap} ${s.details}`}>
                    <div className={s.caption} aria-live="polite">
                        <h2 key={`t-${active}`} className={s.captionIn}>
                            {frame.title}
                        </h2>
                        {frame.subtitle && (
                            <p key={`s-${active}`} className={s.captionIn}>
                                {frame.subtitle}
                            </p>
                        )}
                    </div>

                    {n > 1 && (
                        <div className={s.controls}>
                            <div className={s.progress} aria-hidden="true">
                                {frames.map((f, i) => (
                                    <span key={f.id} className={i === active ? s.progressOn : undefined} />
                                ))}
                            </div>
                            <span className={s.count}>
                                {active + 1} / {n}
                            </span>
                            <button type="button" className={`${s.btn} ${s.btnPrev}`} onClick={() => go(active - 1)} aria-label="Frame sebelumnya">
                                <ArrowLeft aria-hidden="true" />
                            </button>
                            <button type="button" className={`${s.btn} ${s.btnNext}`} onClick={() => go(active + 1)} aria-label="Frame berikutnya">
                                <ArrowRight aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className={`${s.wrap} ${s.index}`} aria-labelledby="all-frames">
                <h2 id="all-frames" className={s.reveal}>
                    Semua frame acara ini
                </h2>
                <ul className={s.grid} style={{ "--cols": cols } as React.CSSProperties}>
                    {frames.map((f, i) => (
                        <li key={f.id} className={s.reveal} style={{ "--delay": `${(i % cols) * 70}ms` } as React.CSSProperties}>
                            <button
                                type="button"
                                className={s.tile}
                                onClick={() => pickFromIndex(i)}
                                aria-current={i === active ? "true" : undefined}
                                aria-label={`Tampilkan frame ${f.title}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className={s.tilePhoto} src={frameImage(f.image_url, "thumb")} alt="" width={600} height={471} loading="lazy" />
                                <span className={s.tileTitle}>{f.title}</span>
                                <span className={s.tileMeta}>{i === active ? "Sedang dilihat" : f.category}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {event.photos.length > 0 && (
                <section className={`${s.wrap} ${s.photos}`} aria-labelledby="event-photos">
                    <h2 id="event-photos" className={s.reveal}>
                        Hasil foto di acara ini
                    </h2>
                    <ul className={s.photoGrid}>
                        {event.photos.map((src, i) => (
                            <li key={src} className={s.reveal} style={{ "--delay": `${(i % 2) * 70}ms` } as React.CSSProperties}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photoDisplayUrl(src, 480)} alt={`Hasil foto Sebooth di ${event.name}`} loading="lazy" />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className={s.footer}>
                <div className={`${s.wrap} ${s.footerInner} ${s.reveal}`}>
                    <div>
                        <h2>Ketemu di booth</h2>
                        <p>
                            Pilih frame favoritmu di layar booth saat sesi foto. Cetakannya langsung keluar, dan softfile-nya bisa
                            kamu ambil lewat QR dari booth.
                        </p>
                    </div>
                    <ul className={s.links}>
                        <li>
                            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                                Instagram @{INSTAGRAM_HANDLE}
                            </a>
                        </li>
                        <li>
                            <a
                                href={whatsappUrl(`Halo Sebooth, saya lihat frame ${event.name} dan mau tanya sewa photobooth.`)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Sewa Sebooth untuk acaramu
                            </a>
                        </li>
                        <li>
                            <Link href="/frames">Semua desain frame Sebooth</Link>
                        </li>
                    </ul>
                </div>
                <p className={`${s.wrap} ${s.imprint}`}>© {year} Sebooth Photobooth · Semarang</p>
            </footer>
        </div>
    );
}
