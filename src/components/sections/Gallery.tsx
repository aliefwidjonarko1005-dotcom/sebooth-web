"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";

const shadowCycle = ["hard-shadow-black", "hard-shadow-blue", "hard-shadow-orange"];

interface GalleryItem {
    id: number;
    name: string;
    url: string;
    event: string;
    type: string;
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

    const heightCycle = ["h-80", "h-[500px]", "h-96", "h-[400px]", "h-72", "h-[450px]"];

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

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
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
                        className="break-inside-avoid"
                    >
                        <div
                            className={cn(
                                "w-full border-2 border-black relative group cursor-pointer transition-all overflow-hidden",
                                "grayscale hover:grayscale-0",
                                heightCycle[index % heightCycle.length],
                                shadowCycle[index % shadowCycle.length]
                            )}
                        >
                            {/* Real Image */}
                            <Image
                                src={item.url}
                                alt={item.event}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                <h3 className="text-white font-black text-xl uppercase mb-1">
                                    {item.event}
                                </h3>
                                <p className="text-white/70 text-sm font-bold uppercase tracking-wide">
                                    {item.type}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
