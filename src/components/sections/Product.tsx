"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const products = [
    {
        id: "standard",
        name: "Standard Booth",
        tagline: "Digital-First Experience",
        description: "Perfect for fast-paced events. Instant sharing, zero waste philosophy.",
        specs: ["Unlimited Digital Shots", "Basic Props Kit", "Instant QR Download", "Online Gallery Access"],
        imagePlaceholder: "Standard Booth Setup"
    },
    {
        id: "deluxe",
        name: "Deluxe Booth",
        tagline: "The Professional Choice",
        description: "High-speed printing meets premium backdrop selection.",
        specs: ["Unlimited Physical Prints", "Premium Backdrop Selection", "DNP RX1 HS High-Speed Printing", "On-site Technical Assistant"],
        imagePlaceholder: "Deluxe Printing Station"
    },
    {
        id: "glamour",
        name: "Glamour Booth",
        tagline: "Studio Elegance",
        description: "The Kardashian-style experience. Black & white filter with beauty lighting.",
        specs: ["Black & White Signature", "High-End Studio Lighting", "Beauty Filter Integration", "Luxury Visuals"],
        imagePlaceholder: "Glamour Studio Lighting"
    },
];

export function Product() {
    const [activeProduct, setActiveProduct] = useState(products[0]);

    return (
        <section id="product" className="bg-[#F9F9F9] border-t border-[#1A1A1A]/10">
            <div className="grid md:grid-cols-2 min-h-[800px]">

                {/* Left: Dynamic Image Display */}
                <div className="relative h-[400px] md:h-auto bg-[#E5E5E5] overflow-hidden border-b md:border-b-0 md:border-r border-[#1A1A1A]/10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProduct.id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center p-12"
                        >
                            {/* Placeholder for Product Image */}
                            <div className="text-center space-y-4">
                                <div className="text-6xl md:text-8xl opacity-10 font-bold tracking-tighter">
                                    {activeProduct.id.toUpperCase()}
                                </div>
                                <div className="text-[#1A1A1A]/40 font-medium border border-[#1A1A1A]/20 px-6 py-3 inline-block">
                                    [Image: {activeProduct.imagePlaceholder}]
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Mobile Label overlay */}
                    <div className="absolute bottom-6 left-6 md:hidden">
                        <span className="bg-[#1A1A1A] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                            Viewing: {activeProduct.name}
                        </span>
                    </div>
                </div>

                {/* Right: Interactive Product List */}
                <div className="flex flex-col">
                    {/* Section Header */}
                    <div className="p-12 md:p-16 border-b border-[#1A1A1A]/10">
                        <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-sebooth text-[#1A1A1A] tracking-tighter leading-none">
                            Curated <br /> Experiences.
                        </h2>
                    </div>

                    {/* Product Menu */}
                    <div className="flex-1 flex flex-col">
                        {products.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => setActiveProduct(product)}
                                className={cn(
                                    "group text-left p-8 md:p-10 border-b border-[#1A1A1A]/10 transition-all duration-300 hover:bg-[#EAEAEA] relative overflow-hidden",
                                    activeProduct.id === product.id ? "bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]" : "text-[#1A1A1A]"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h3 className={cn("text-2xl font-bold mb-1", activeProduct.id === product.id ? "text-white" : "text-[#1A1A1A]")}>
                                            {product.name}
                                        </h3>
                                        <p className={cn("text-sm font-medium uppercase tracking-wide", activeProduct.id === product.id ? "text-[#D4AF37]" : "text-[#0F3D2E]")}>
                                            {product.tagline}
                                        </p>
                                    </div>
                                    <ArrowRight className={cn(
                                        "w-6 h-6 transition-transform duration-300",
                                        activeProduct.id === product.id ? "text-white rotate-0" : "text-[#1A1A1A]/20 -rotate-45 group-hover:rotate-0 group-hover:text-[#1A1A1A]"
                                    )} />
                                </div>

                                {/* Expandable Content for Desktop (always visible if active) */}
                                <div
                                    className={cn(
                                        "space-y-6 overflow-hidden transition-all duration-500 ease-in-out relative z-10",
                                        activeProduct.id === product.id ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0 md:max-h-0 md:opacity-0"
                                    )}
                                >
                                    <p className={cn("leading-relaxed", activeProduct.id === product.id ? "text-white/80" : "text-[#1A1A1A]/70")}>
                                        {product.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-y-2">
                                        {product.specs.map((spec, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Check className={cn("w-4 h-4 mt-0.5 shrink-0", activeProduct.id === product.id ? "text-[#D4AF37]" : "text-[#0F3D2E]")} />
                                                <span className={cn("text-sm font-medium", activeProduct.id === product.id ? "text-white/80" : "text-[#1A1A1A]/70")}>{spec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
