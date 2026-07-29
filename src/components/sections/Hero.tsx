"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EditableText } from "@/components/admin/EditableText";
import { RotatingBadge } from "@/components/ui/RotatingBadge";

interface HeroProps {
    initialData?: Record<string, string>;
}

export function Hero({ initialData = {} }: HeroProps) {
    const heroTitle1 = initialData["title1"] || "SEBOOTH KAN";
    const heroTitle2 = initialData["title2"] || "MOMEN INDAHMU";
    const heroSubtitle = initialData["subtitle"] || "Premium Photobooth Experience for Weddings, Corporate, and Special Events.";

    return (
        <section className="relative w-full min-h-[100svh] lg:min-h-[920px] bg-[#f8f9fa] flex flex-col justify-between items-center px-4 md:px-12 pt-28 pb-16 overflow-hidden select-none">
            {/* Floating Decorative Balls with Sebooth Colors */}
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[-40px] md:left-[5%] w-36 h-36 md:w-56 md:h-56 rounded-full bg-[#eef2ff] border-4 border-[#002366] opacity-80 pointer-events-none z-0"
            />
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[35%] right-[-30px] md:right-[8%] w-44 h-44 md:w-64 md:h-64 rounded-full bg-[#fff0eb] border-4 border-[#ff4500] opacity-75 pointer-events-none z-0"
            />
            <motion.div
                animate={{ y: [0, -25, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[10%] left-[20%] w-24 h-24 md:w-36 md:h-36 rounded-full bg-[#ff4500] opacity-20 pointer-events-none z-0"
            />

            {/* Top Pill Tagline */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="z-10 bg-[#002366] text-white px-6 py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest shadow-md"
            >
                ✦ THE FAVORITE PHOTOBOOTH IN SEMARANG ✦
            </motion.div>

            {/* Center Giant Display Typography */}
            <div className="z-10 w-full max-w-7xl my-auto text-center flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="w-full"
                >
                    <EditableText
                        section="hero"
                        fieldKey="title1"
                        defaultValue={heroTitle1}
                        as="h1"
                        className="h0 text-[#002366] leading-[0.78] tracking-[-0.04em] uppercase block font-bayon"
                    >
                        {heroTitle1}
                    </EditableText>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.25 }}
                    className="w-full"
                >
                    <EditableText
                        section="hero"
                        fieldKey="title2"
                        defaultValue={heroTitle2}
                        as="h1"
                        className="h0 text-[#ff4500] leading-[0.78] tracking-[-0.04em] uppercase block font-bayon mt-1 md:mt-3"
                    >
                        {heroTitle2}
                    </EditableText>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-6 md:mt-8 max-w-xl"
                >
                    <EditableText
                        section="hero"
                        fieldKey="subtitle"
                        defaultValue={heroSubtitle}
                        as="p"
                        className="text-base md:text-xl text-[#002366] font-semibold uppercase tracking-wide leading-snug"
                    >
                        {heroSubtitle}
                    </EditableText>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border-2 border-[#002366]/15 shadow-sm">
                    <span className="w-3 h-3 rounded-full bg-[#ff4500] animate-ping" />
                    <span className="text-xs md:text-sm font-black text-[#002366] uppercase tracking-wider">
                        ⚡ ZERO-LAG PHYSICAL KIOSK SYSTEM
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya."
                        target="_blank"
                    >
                        <RotatingBadge
                            text="SEBOOTH PHOTOBOOTH • BOOK NOW • "
                            btnText="BOOK NOW"
                            bgColor="#ff4500"
                            textColor="#ffffff"
                            size={135}
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}
