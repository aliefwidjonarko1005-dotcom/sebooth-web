"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const galleryItems = [
    { id: 1, event: "Gala Night 2024", type: "Corporate", size: "md:col-span-1 md:row-span-1" },
    { id: 2, event: "Sarah & John", type: "Wedding", size: "md:col-span-1 md:row-span-2" }, // Tall
    { id: 3, event: "Tech Summit", type: "Corporate", size: "md:col-span-2 md:row-span-1" }, // Wide
    { id: 4, event: "Sweet 17: Bella", type: "Private", size: "md:col-span-1 md:row-span-1" },
    { id: 5, event: "Product Launch", type: "Corporate", size: "md:col-span-1 md:row-span-1" },
    { id: 6, event: "Summer Fest", type: "Cultural", size: "md:col-span-2 md:row-span-1" }, // Wide
];

const categories = ["All", "Wedding", "Corporate", "Private", "Cultural"];

export function Gallery() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredItems = activeCategory === "All"
        ? galleryItems
        : galleryItems.filter(item => item.type === activeCategory);

    return (
        <section id="gallery" className="py-32 bg-[#F9F9F9]">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">Visual Archive</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight">
                            Captured Moments.
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={cn(
                                    "text-sm font-medium px-4 py-2 transition-colors border",
                                    activeCategory === category
                                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                        : "bg-transparent text-[#1A1A1A]/60 border-transparent hover:border-[#1A1A1A]/20"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-2">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={cn("relative group bg-[#E5E5E5] overflow-hidden", item.size)}
                        >
                            {/* Image Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center text-[#1A1A1A]/10 text-2xl font-bold uppercase">
                                {item.type}
                            </div>

                            {/* Minimalist Overlay */}
                            <div className="absolute inset-0 bg-[#0F3D2E]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-lg mb-1">{item.event}</h3>
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wide">{item.type}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
