"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Eye as EyeIcon, X } from "lucide-react";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";

interface FrameItem {
    id: string;
    title: string;
    category: string;
    image_url: string;
}

const defaultFrames: FrameItem[] = [
    {
        id: "classic-white",
        title: "Classic White",
        category: "Classic Strip",
        image_url: "/frames/classic-white.png",
    },
    {
        id: "night-edition",
        title: "Night Edition",
        category: "Retro Strip",
        image_url: "/frames/night-edition.png",
    },
    {
        id: "wedding-elegant",
        title: "Wedding Elegant",
        category: "Wedding Collage",
        image_url: "/frames/wedding-elegant.png",
    },
    {
        id: "vintage-mood",
        title: "Vintage Mood",
        category: "Collage",
        image_url: "/frames/vintage-mood.png",
    },
];

const defaultContent = {
    section_title: "FEATURED FRAMES",
    section_tag: "[ 02 — DESIGN ARCHIVE ]",
    items: "",
};

interface FeaturedFramesProps {
    initialData?: Record<string, string>;
}

export function FeaturedFrames({ initialData = {} }: FeaturedFramesProps) {
    const content = { ...defaultContent, ...initialData };
    const frames = parseJsonContent<FrameItem[]>(content.items, defaultFrames);

    const [isHovered, setIsHovered] = useState(false);
    const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
    const [selectedFrame, setSelectedFrame] = useState<FrameItem | null>(null);

    const handleImageLoad = useCallback((frameId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
            setImageRatios(prev => ({ ...prev, [frameId]: img.naturalWidth / img.naturalHeight }));
        }
    }, []);

    if (frames.length === 0) return null;

    // Duplicate frames enough times to guarantee the track overflows any viewport.
    const repeatCount = Math.max(8, Math.ceil(16 / frames.length));
    const singleSet = Array.from({ length: repeatCount }, () => frames).flat();
    const duplicatedFrames = [...singleSet, ...singleSet];

    // Speed: ~3s per card in one set
    const animDuration = singleSet.length * 3;

    const isPaused = isHovered || selectedFrame !== null;

    return (
        <section id="featured-frames" className="py-16 md:py-20 px-6 md:px-20 bg-transparent relative overflow-hidden">
            {/* Background Shimmer/Glow accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Section Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-end pb-3">
                <div className="w-full md:w-auto">
                    <EditableText section="featured_frames" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-text-dark">
                        {content.section_title}
                    </EditableText>
                </div>
                <div className="w-full md:w-auto mt-2 md:mt-0 flex justify-between md:justify-end items-center gap-4">
                    <EditableText section="featured_frames" fieldKey="section_tag" defaultValue={content.section_tag} as="p" className="text-sm font-bold uppercase text-primary">
                        {content.section_tag}
                    </EditableText>
                </div>
            </div>

            {/* Infinite Marquee — image only cards */}
            <div 
                className="relative w-full overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#F9F9F9]/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#F9F9F9]/80 to-transparent z-10 pointer-events-none" />

                {/* Scrolling track */}
                <div 
                    className="flex w-max animate-marquee"
                    style={{
                        "--marquee-duration": `${animDuration}s`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                    } as React.CSSProperties}
                >
                    {duplicatedFrames.map((frame, index) => (
                        <div
                            key={`${frame.id}-${index}`}
                            className="w-[180px] md:w-[250px] shrink-0 mr-6"
                        >
                            <button
                                onClick={() => setSelectedFrame(frame)}
                                className="w-full bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-2 shadow-[0_4px_16px_0_rgba(31,38,135,0.06)] hover:shadow-[0_6px_24px_0_rgba(31,38,135,0.14)] hover:border-white/50 hover:bg-white/25 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                            >
                                {/* Glassmorphism Shine Overlay */}
                                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
                                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer" />
                                </div>

                                {/* Frame Image — no text, image only */}
                                <div 
                                    className="w-full bg-neutral-900/5 rounded-lg overflow-hidden flex items-center justify-center p-1.5 relative group-hover:scale-[1.03] transition-transform duration-300"
                                    style={{ aspectRatio: imageRatios[frame.id] ? `${imageRatios[frame.id]}` : '3/4' }}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] opacity-25" />
                                    
                                    {frame.image_url ? (
                                        <img
                                            src={frame.image_url}
                                            alt={frame.title}
                                            onLoad={(e) => handleImageLoad(frame.id, e)}
                                            className="h-full w-auto object-contain z-10 max-h-full drop-shadow-md select-none pointer-events-none"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/20 text-[#1A1A1A]/30 font-bold uppercase text-[9px]">
                                            No Preview
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Expand Link Button */}
            <div className="mt-10 text-center">
                <Link
                    href="/frames"
                    className="inline-block bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/30 hover:border-white/50 text-text-dark font-black uppercase tracking-wider px-6 py-3 text-sm rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                >
                    LIHAT SEMUA FRAME →
                </Link>
            </div>

            {/* Detail Popup Overlay — appears on card click */}
            {selectedFrame && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedFrame(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    
                    {/* Popup Card */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-4 border-black animate-popup-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedFrame(null)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Frame Image */}
                        <div className="bg-neutral-100 p-6 flex items-center justify-center">
                            <img
                                src={selectedFrame.image_url}
                                alt={selectedFrame.title}
                                className="max-h-[50vh] w-auto object-contain drop-shadow-lg"
                            />
                        </div>

                        {/* Detail Footer */}
                        <div className="p-5 border-t-4 border-black">
                            <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A] mb-1">
                                {selectedFrame.title}
                            </h3>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full mb-4">
                                {selectedFrame.category || "General"}
                            </span>
                            <div className="flex gap-3">
                                <Link
                                    href={`/frames?id=${selectedFrame.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-primary text-white font-bold uppercase text-xs tracking-wider py-3 rounded-lg transition-colors"
                                    onClick={() => setSelectedFrame(null)}
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    Lihat Detail
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
