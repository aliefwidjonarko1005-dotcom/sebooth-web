"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Guide from "@/components/guide/Guide";
import GuideLauncher from "@/components/guide/GuideLauncher";
import { useGuide } from "@/components/guide/useGuide";
import { FRAMES_GUIDE, GUIDE_KEYS } from "@/config/guides";
import { whatsappUrl } from "@/config/social";
import { useModalFocus } from "@/lib/useModalFocus";

import { frameImage } from "@/data/frameEvents";
import { DEFAULT_FRAMES, type FrameItem } from "@/data/frames";

export { DEFAULT_FRAMES, type FrameItem };

interface FramesGalleryClientProps {
    initialFrames: FrameItem[];
}

// A CMS frame may sit under /images/frames/ without a webp copy: fall back to its original once
function useOriginalOnError(original: string) {
    return (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.dataset.fellBack) return;
        img.dataset.fellBack = "1";
        img.src = original;
    };
}

function FrameTile({ frame, id, onOpen }: { frame: FrameItem; id?: string; onOpen: () => void }) {
    const handleError = useOriginalOnError(frame.image_url);
    return (
        <button
            id={id}
            onClick={onOpen}
            className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
            <span className="relative block aspect-[5/4] overflow-hidden rounded-lg bg-white">
                {frame.image_url ? (
                    <Image
                        src={frameImage(frame.image_url, "thumb")}
                        alt={frame.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        onError={handleError}
                        className="object-contain transition-transform duration-500 select-none group-hover:scale-[1.03]"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center text-sm text-slate-600">Belum ada gambar</span>
                )}
            </span>
            <span className="mt-2.5 block font-bayon text-lg leading-tight text-primary uppercase decoration-secondary decoration-2 underline-offset-2 group-hover:underline">
                {frame.title}
            </span>
            <span className="mt-1 block text-sm text-slate-600 capitalize">
                {(frame.category || "General").toLowerCase()}
            </span>
        </button>
    );
}

export function FramesGalleryClient({ initialFrames }: FramesGalleryClientProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeLightboxFrame, setActiveLightboxFrame] = useState<FrameItem | null>(null);
    const guide = useGuide(GUIDE_KEYS.frames, { delay: 2600 });
    const reduceMotion = useReducedMotion();
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeLightbox = useCallback(() => setActiveLightboxFrame(null), []);
    useModalFocus(activeLightboxFrame !== null, dialogRef, closeLightbox);
    const handleLightboxImageError = useOriginalOnError(activeLightboxFrame?.image_url ?? "");

    // Designs uploaded through the CMS come first, then the built-in catalogue (same id: CMS wins)
    const framesToDisplay = useMemo(() => {
        const ids = new Set((initialFrames ?? []).map((f) => f.id));
        return [...(initialFrames ?? []), ...DEFAULT_FRAMES.filter((f) => !ids.has(f.id))];
    }, [initialFrames]);

    // Categories derived from frames
    const categories = ["All", ...Array.from(new Set(framesToDisplay.map(f => f.category || "General").filter(Boolean)))];

    // Filter frames
    const filteredFrames = framesToDisplay.filter((frame) => {
        const matchesSearch = frame.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (frame.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (frame.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || (frame.category || "General") === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Check if query param ?id= exists to auto-open lightbox
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const frame = framesToDisplay.find((f) => f.id === id);
            if (frame) {
                setActiveLightboxFrame(frame);
            }
        }
    }, [searchParams, framesToDisplay]);

    return (
        <div className="min-h-svh pb-24">
            {/* Hero: what this is, then the two ways to narrow it down */}
            <section className="bg-primary px-5 pt-24 pb-10 text-white md:px-10 md:pt-32 md:pb-16">
                <div className="mx-auto max-w-6xl">
                    <h1 className="font-bayon text-[4rem] leading-[0.9] uppercase md:text-[clamp(4rem,10vw,7.5rem)]">
                        Our Design Frames
                    </h1>
                    <p className="mt-5 max-w-[40ch] text-xl leading-snug">
                        Koleksi template frame premium untuk melengkapi momen spesial Anda.
                    </p>

                    {/* Categories run off the screen edge on phones, a cue that the row scrolls */}
                    <div
                        id="guide-frames-categories"
                        className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 scrollbar-none md:mx-0 md:mt-10 md:flex-wrap md:overflow-visible md:px-0"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                aria-pressed={selectedCategory === cat}
                                className={cn(
                                    "min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-sm font-bold whitespace-nowrap capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                                    selectedCategory === cat
                                        ? "bg-secondary text-blue-dark"
                                        : "bg-navy-raised text-white hover:bg-white hover:text-blue-dark"
                                )}
                            >
                                {cat.toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div id="guide-frames-search" className="relative mt-4 md:max-w-sm">
                        <input
                            type="search"
                            aria-label="Cari desain frame"
                            placeholder="Cari desain frame..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 w-full rounded-full bg-white pr-4 pl-11 text-base text-blue-dark outline-none placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        />
                        <Search className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-slate-500" aria-hidden="true" />
                    </div>
                </div>
            </section>

            <section className="px-5 pt-8 md:px-10 md:pt-14">
                <div className="mx-auto max-w-6xl">
                    {filteredFrames.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-xl font-medium text-blue-dark">Tidak ada frame yang cocok.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="mt-5 inline-flex min-h-12 cursor-pointer items-center rounded-full bg-blue-dark px-6 text-base font-bold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-dark"
                            >
                                Reset filter
                            </button>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
                            {filteredFrames.map((frame, idx) => (
                                <li key={frame.id || idx} className="rise-on-scroll">
                                    <FrameTile
                                        frame={frame}
                                        id={idx === 0 ? "guide-frames-first" : undefined}
                                        onOpen={() => setActiveLightboxFrame(frame)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {/* Frame detail: a sheet from the bottom on phones, a centred panel from tablet up */}
            <AnimatePresence>
                {activeLightboxFrame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                        onClick={closeLightbox}
                        className="fixed inset-0 z-[60] flex items-end justify-center bg-blue-dark/80 md:items-center md:p-8"
                    >
                        <motion.div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="frame-dialog-title"
                            initial={reduceMotion ? false : { y: 32 }}
                            animate={{ y: 0 }}
                            exit={reduceMotion ? undefined : { y: 32 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-primary text-white md:max-w-xl md:rounded-2xl"
                        >
                            <button
                                onClick={closeLightbox}
                                aria-label="Tutup preview frame"
                                className="absolute top-2 right-2 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-dark text-white transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
                            >
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>

                            <div className="relative aspect-[5/4] w-full bg-blue-dark">
                                <Image
                                    src={frameImage(activeLightboxFrame.image_url, "modal")}
                                    alt={activeLightboxFrame.title}
                                    fill
                                    unoptimized
                                    priority
                                    sizes="(min-width: 768px) 576px, 100vw"
                                    onError={handleLightboxImageError}
                                    className="object-contain select-none"
                                />
                            </div>

                            <div className="px-5 pt-5 text-[17px] leading-relaxed">
                                <h2 id="frame-dialog-title" className="font-bayon text-[2rem] leading-[1.05] uppercase">
                                    {activeLightboxFrame.title}
                                </h2>
                                <p className="mt-1.5 text-sm text-white/80 capitalize">
                                    {(activeLightboxFrame.category || "General").toLowerCase()}
                                </p>
                                {activeLightboxFrame.subtitle && (
                                    <p className="mt-4 font-bold">{activeLightboxFrame.subtitle}</p>
                                )}
                                {activeLightboxFrame.desc && (
                                    <p className="mt-2">{activeLightboxFrame.desc}</p>
                                )}
                                {activeLightboxFrame.features && activeLightboxFrame.features.length > 0 && (
                                    <ul className="mt-4 list-disc space-y-1 pl-5 marker:text-secondary">
                                        {activeLightboxFrame.features.map((feat, fIdx) => (
                                            <li key={fIdx}>{feat}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Stays in reach however long the description runs */}
                            <div className="sticky bottom-0 mt-5 flex items-center gap-3 bg-primary px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                                <button
                                    onClick={closeLightbox}
                                    className="min-h-14 cursor-pointer px-3 text-[17px] font-bold text-white underline underline-offset-4 transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Tutup
                                </button>
                                <a
                                    id="guide-frames-order"
                                    href={whatsappUrl(`Halo Sebooth, saya berminat dengan template frame "${activeLightboxFrame.title}" untuk acara saya!`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-14 flex-1 items-center justify-center rounded-full bg-secondary px-5 text-center text-[17px] font-bold text-blue-dark transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98]"
                                >
                                    Pesan Frame Ini Via WA
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GuideLauncher onClick={guide.start} className="fixed bottom-5 right-5 z-40" />
            <Guide steps={FRAMES_GUIDE} open={guide.open} onClose={guide.close} storageKey={GUIDE_KEYS.frames} />
        </div>
    );
}
