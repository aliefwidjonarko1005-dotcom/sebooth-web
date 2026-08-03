"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";
import { Play, Camera } from "lucide-react";

interface GalleryVideoItemProps {
    src: string;
}

function GalleryVideoItem({ src }: GalleryVideoItemProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold: 0.1,
            }
        );

        observer.observe(video);
        return () => {
            observer.unobserve(video);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isIntersecting) {
            video.play().catch(() => {
                // Ignore autoplay block errors
            });
        } else {
            video.pause();
        }
    }, [isIntersecting]);

    return (
        <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover"
        />
    );
}

interface GalleryItem {
    id: number;
    name: string;
    url: string;
    event: string;
    type: string;
    mediaType?: "image" | "video";
}

const defaultContent = {
    section_title: "VISUAL ARCHIVE",
    categories: '["All", "Wedding", "Corporate", "Private", "Cultural"]',
    items: "",
};

interface GalleryProps {
    initialData?: Record<string, string>;
    initialGalleryImages?: GalleryItem[];
}

function GalleryItemCard({ item, index }: { item: GalleryItem; index: number }) {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
        >
            <div className="w-full aspect-[9/16] rounded-2xl border-2 border-[#002366]/20 relative group cursor-pointer transition-all duration-300 overflow-hidden bg-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1">
                {/* Media Type Indicator Badge (Top Right) */}
                <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-white/30 text-white w-9 h-9 rounded-full flex items-center justify-center pointer-events-none select-none">
                    {item.mediaType === "video" ? (
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    ) : (
                        <Camera className="w-4 h-4 text-white" />
                    )}
                </div>

                {/* Image or Video with Automatic Fallback to Native HTML <img> on Error */}
                {item.mediaType === "video" ? (
                    <GalleryVideoItem src={item.url} />
                ) : imgError ? (
                    <img
                        src={item.url}
                        alt={item.event}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <NextImage
                        src={item.url}
                        alt={item.event}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        quality={80}
                        onError={() => setImgError(true)}
                    />
                )}

                {/* Sleek Bottom Gradient Overlay (Photo remains 100% visible, not covered by solid box) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-12 flex flex-col justify-end pointer-events-none">
                    <h3 className="text-white font-black text-lg md:text-xl uppercase font-bayon leading-tight tracking-tight">
                        {item.event}
                    </h3>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                        {item.type}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export function Gallery({ initialData = {}, initialGalleryImages = [] }: GalleryProps) {
    const content = { ...defaultContent, ...initialData };
    const categories = parseJsonContent<string[]>(content.categories, ["All", "Wedding", "Corporate", "Private", "Cultural"]);

    const [activeCategory, setActiveCategory] = useState("All");

    const filteredItems =
        activeCategory === "All"
            ? initialGalleryImages
            : initialGalleryImages.filter((item) => item.type === activeCategory);

    return (
        <section id="gallery" className="py-24 px-6 md:px-20 bg-transparent relative overflow-hidden select-none">
            {/* Section Header */}
            <div className="mb-12 text-center md:text-left max-w-7xl mx-auto">
                <span className="text-[#002366] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/90 px-5 py-2 rounded-full border border-[#002366]/15 inline-block mb-3 shadow-sm">
                    ✦ EVENT GALLERY ARCHIVE ✦
                </span>
                <EditableText section="gallery" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="h2 text-[#002366] font-bayon uppercase leading-none mb-6">
                    {content.section_title}
                </EditableText>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm",
                                activeCategory === category
                                    ? "bg-[#002366] text-white shadow-md"
                                    : "bg-white text-[#002366] hover:bg-[#002366]/10 border border-[#002366]/15"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.length === 0 && (
                    <p className="text-[#002366]/50 font-bold uppercase text-center py-16 col-span-full">
                        Belum ada foto di gallery. Upload melalui Admin Panel.
                    </p>
                )}
                {filteredItems.map((item, index) => (
                    <GalleryItemCard key={item.id || index} item={item} index={index} />
                ))}
            </div>
        </section>
    );
}
