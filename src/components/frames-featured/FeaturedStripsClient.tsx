"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { featuredStripSrc, type FeaturedStrip } from "@/data/featuredStrips";
import { whatsappUrl } from "@/config/social";
import { useModalFocus } from "@/lib/useModalFocus";

export function FeaturedStripsClient({ strips }: { strips: FeaturedStrip[] }) {
    const [open, setOpen] = useState<number | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(null), []);
    useModalFocus(open !== null, dialogRef, close);

    // Newest month first, in the order the data already has
    const months = useMemo(() => {
        const groups: { label: string; items: { strip: FeaturedStrip; index: number }[] }[] = [];
        strips.forEach((strip, index) => {
            const last = groups[groups.length - 1];
            if (last?.label === strip.label) last.items.push({ strip, index });
            else groups.push({ label: strip.label, items: [{ strip, index }] });
        });
        return groups;
    }, [strips]);

    const n = strips.length;
    const step = useCallback((by: number) => setOpen((i) => (i === null ? i : (i + by + n) % n)), [n]);

    useEffect(() => {
        if (open === null) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "ArrowRight") step(1);
            else if (e.key === "ArrowLeft") step(-1);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, step]);

    const current = open === null ? null : strips[open];

    return (
        <div className="min-h-svh bg-[#f8f9fa] pb-24 text-primary">
            <section className="bg-primary px-5 pt-24 pb-10 text-white md:px-10 md:pt-32 md:pb-14">
                <div className="mx-auto max-w-6xl">
                    <h1 className="font-bayon text-[min(15vw,4rem)] leading-[0.9] uppercase md:text-[clamp(4rem,9vw,7rem)]">
                        All Featured Frame
                    </h1>
                    <p className="mt-5 max-w-[42ch] text-lg leading-snug md:text-xl">
                        {n > 0
                            ? `${n} desain frame yang pernah dicetak Sebooth, satu cetakan asli per desain. Ketuk untuk lihat lebih besar.`
                            : "Koleksi cetakan sedang disiapkan. Sementara itu, lihat katalog frame kami."}
                    </p>
                    <Link
                        href="/frames"
                        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-white px-5 text-base font-bold text-primary transition-colors hover:bg-secondary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        Katalog frame
                    </Link>
                </div>
            </section>

            {months.map((month) => (
                <section key={month.label} className="mx-auto max-w-6xl px-4 pt-10 md:px-10" aria-labelledby={`m-${month.items[0].strip.month}`}>
                    <div className="flex items-baseline justify-between gap-4 px-1">
                        <h2 id={`m-${month.items[0].strip.month}`} className="font-bayon text-3xl uppercase md:text-4xl">
                            {month.label}
                        </h2>
                        <span className="text-[15px] text-slate-600 tabular-nums">{month.items.length} desain</span>
                    </div>
                    <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:gap-4 lg:grid-cols-6">
                        {month.items.map(({ strip, index }) => (
                            <li key={strip.id}>
                                <button
                                    type="button"
                                    onClick={() => setOpen(index)}
                                    aria-label={`Lihat frame ${strip.event ?? "Sebooth"}, dicetak ${strip.label}`}
                                    className="group block w-full cursor-pointer overflow-hidden rounded-lg bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={featuredStripSrc(strip.id, "thumb")}
                                        alt=""
                                        width={240}
                                        height={720}
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        className="block aspect-[1/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </button>
                                {strip.event && <p className="mt-1.5 truncate px-0.5 text-sm font-semibold">{strip.event}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}

            {current && open !== null && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-blue-dark/90 p-4"
                    onClick={close}
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Frame ${current.event ?? current.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-full max-h-[880px] w-full max-w-md flex-col items-center gap-3 text-white"
                    >
                        <div className="flex w-full items-center justify-between gap-3">
                            <p className="min-w-0 text-[15px] leading-tight">
                                <span className="block truncate font-bold">{current.event ?? "Frame Sebooth"}</span>
                                <span className="text-white/80">Dicetak sejak {current.label}</span>
                            </p>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Tutup"
                                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="relative min-h-0 w-full flex-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                key={current.id}
                                src={featuredStripSrc(current.id, "full")}
                                alt={`Cetakan photostrip Sebooth${current.event ? ` di ${current.event}` : ""}`}
                                draggable={false}
                                className="absolute inset-0 h-full w-full object-contain select-none"
                            />
                        </div>

                        <div className="flex w-full items-center gap-3">
                            <button
                                type="button"
                                onClick={() => step(-1)}
                                aria-label="Frame sebelumnya"
                                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <a
                                href={whatsappUrl("Halo Sebooth, saya lihat All Featured Frame dan mau bikin frame custom untuk acara saya!")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-secondary px-4 text-center text-base font-bold text-white transition-colors hover:bg-orange-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Bikin frame seperti ini
                            </a>
                            <button
                                type="button"
                                onClick={() => step(1)}
                                aria-label="Frame berikutnya"
                                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
