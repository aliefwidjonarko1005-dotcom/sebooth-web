"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EditableText } from "@/components/admin/EditableText";

interface HeroProps {
    initialData?: Record<string, string>;
}

export function Hero({ initialData = {} }: HeroProps) {
    const heroTitle = initialData["title"] || "Capture Every Moment, Create";
    const heroAccent = initialData["accent"] || "Infinite Memories.";
    const heroSubtitle = initialData["subtitle"] || "Premium Photobooth Experience for Weddings, Corporate, and Private Parties. Powered by Zero-Lag System.";
    const heroCta = initialData["cta_text"] || "Pesan Sekarang";

    return (
        <section className="relative w-full min-h-[100svh] md:min-h-[850px] bg-primary flex flex-col justify-center items-start px-6 md:px-20 overflow-hidden">
            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-5xl z-10"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8"
                >
                    <EditableText section="hero" fieldKey="title" defaultValue={heroTitle} as="span" className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                        {heroTitle}
                    </EditableText>
                    <br />
                    <span className="text-secondary scribble-underline italic relative inline-block marker-font normal-case">
                        <EditableText section="hero" fieldKey="accent" defaultValue={heroAccent} as="span" className="text-secondary italic marker-font normal-case">
                            {heroAccent}
                        </EditableText>
                        <div className="scribble-arrow -right-32 top-0 hidden lg:block"></div>
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <EditableText section="hero" fieldKey="subtitle" defaultValue={heroSubtitle} as="p" className="text-xl md:text-2xl text-white font-medium max-w-2xl mb-12 uppercase">
                        {heroSubtitle}
                    </EditableText>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-6"
                >
                    <Link
                        href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya."
                        target="_blank"
                        className="bg-secondary text-white text-xl font-black uppercase px-10 py-5 border-2 border-black hover:-translate-y-1 hover:-translate-x-1 active:translate-0 transition-all duration-200 ease-out hard-shadow-black text-center"
                    >
                        <EditableText section="hero" fieldKey="cta_text" defaultValue={heroCta} as="span" className="text-white text-xl font-black uppercase">
                            {heroCta}
                        </EditableText>
                    </Link>
                    <Link
                        href="/#gallery"
                        className="bg-white text-primary text-xl font-black uppercase px-10 py-5 border-2 border-black hover:-translate-y-1 hover:-translate-x-1 active:translate-0 transition-all duration-200 ease-out hard-shadow-orange text-center"
                    >
                        Lihat Portofolio
                    </Link>
                </motion.div>
            </motion.div>

            {/* Background Watermark */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none select-none">
                <span className="text-[20rem] font-black text-white leading-none">SE.</span>
            </div>
        </section>
    );
}
