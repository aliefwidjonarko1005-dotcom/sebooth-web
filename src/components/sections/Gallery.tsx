"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
                threshold: 0.1, // trigger play when 10% visible
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

const shadowCycle = ["hard-shadow-black", "hard-shadow-blue", "hard-shadow-orange"];

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

export function Gallery({ initialData = {}, initialGalleryImages = [] }: GalleryProps) {
    const content = { ...defaultContent, ...initialData };
    const categories = parseJsonContent<string[]>(content.categories, ["All", "Wedding", "Corporate", "Private", "Cultural"]);

    const [activeCategory, setActiveCategory] = useState("All");

    const filteredItems =
        activeCategory === "All"
            ? initialGalleryImages
            : initialGalleryImages.filter((item) => item.type === activeCategory);

    return (
        <section id="gallery" className="py-24 px-6 md:px-20 bg-white paper-texture">
            {/* Section Header */}
            <div className="mb-12">
                <EditableText section="gallery" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-text-dark mb-8">
                    {content.section_title}
                </EditableText>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "px-6 py-2 border-2 border-black font-black uppercase hard-shadow-black transition-none",
                                activeCategory === category
                                    ? "bg-primary text-white"
                                    : "bg-white text-primary hover:bg-secondary hover:text-white"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Layout (aligned rows like YouTube Shorts desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.length === 0 && (
                    <p className="text-text-dark/40 font-bold uppercase text-center py-16 col-span-full">
                        Belum ada gambar di gallery. Upload melalui Admin Panel.
                    </p>
                )}
                {filteredItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div
                            className={cn(
                                "w-full aspect-[9/16] border-2 border-black relative group cursor-pointer transition-all duration-300 overflow-hidden",
                                "md:grayscale md:hover:grayscale-0 hover:-translate-y-1",
                                shadowCycle[index % shadowCycle.length]
                            )}
                        >
                            {/* Media Type Indicator Badge (Top Right) */}
                            <div className="absolute top-4 right-4 z-20 bg-black/75 backdrop-blur-sm border-2 border-black text-white w-9 h-9 flex items-center justify-center pointer-events-none select-none">
                                {item.mediaType === "video" ? (
                                    <Play className="w-4.5 h-4.5 fill-white text-white" />
                                ) : (
                                    <Camera className="w-4.5 h-4.5 text-white" />
                                )}
                            </div>

                            {/* Image or Video */}
                            {item.mediaType === "video" ? (
                                <GalleryVideoItem src={item.url} />
                            ) : (
                                <Image
                                    src={item.url}
                                    alt={item.event}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            )}

                            {/* Hover/Tap Overlay — always visible on mobile, hover on desktop */}
                            <div className="absolute inset-0 bg-primary/80 md:bg-primary/90 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-6">
                                <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-white font-black text-lg md:text-xl uppercase mb-1">
                                        {item.event}
                                    </h3>
                                    <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-wide">
                                        {item.type}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
