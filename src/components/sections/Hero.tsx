"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-end pb-20 overflow-hidden bg-[#F9F9F9]">
            {/* Visual: Full-width cinematic video loop placeholder */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/10 z-10" />
                {/* Placeholder for video */}
                <div className="w-full h-full bg-stone-300 flex items-center justify-center text-[#1A1A1A]/20">
                    [Cinematic Video Loop / High-Res Photo Placeholder]
                </div>
            </div>

            <div className="container relative z-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl"
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold font-sebooth tracking-tighter text-[#1A1A1A] mb-6 leading-[0.9]"
                    >
                        Capture Every Moment, <br />
                        Create Infinite Memories.
                    </motion.h1>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-12">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-lg md:text-xl text-[#1A1A1A] max-w-xl font-medium"
                        >
                            Premium Photobooth Experience for Weddings, Corporate, and Private Parties. <br />
                            <span className="opacity-60">Powered by Industrial Efficiency.</span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <Link
                                href="#contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0F3D2E] hover:bg-[#195240] text-white font-bold text-lg transition-colors"
                            >
                                Book Your Experience <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
