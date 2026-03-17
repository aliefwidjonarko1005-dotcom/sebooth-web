"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function About() {
    return (
        <section id="about" className="py-32 bg-[#F9F9F9]">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    {/* Left: Text Content - Teaser Style */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-2">
                            <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase">Our Story</span>
                            <h2 className="text-4xl md:text-6xl font-bold font-sebooth text-[#1A1A1A] tracking-tight leading-none">
                                From Engineering <br /> to Aesthetics.
                            </h2>
                        </div>

                        <div className="space-y-6 text-lg text-[#1A1A1A]/80 leading-relaxed max-w-md">
                            <p>
                                Berawal dari proyek passion kecil, <strong>sebooth.</strong> berevolusi menjadi layanan photobooth terdepan di Semarang.
                            </p>
                            <Link
                                href="/about"
                                className="inline-flex items-center gap-2 font-bold text-[#0F3D2E] hover:gap-3 transition-all group"
                            >
                                Read Our Full Story <ArrowRight className="w-5 h-5 group-hover:text-[#1A1A1A]" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right: Visual - 4:5 Aspect Ratio */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative h-[500px] w-full bg-[#E5E5E5] flex items-center justify-center overflow-hidden"
                    >
                        {/* Abstract Image or "Zero-Lag System" illustration placeholder */}
                        <div className="text-[#1A1A1A]/20 font-bold text-center p-8 border border-[#1A1A1A]/10 w-[80%] h-[80%] flex items-center justify-center flex-col gap-4">
                            <span>[Image: Technical Illustration]</span>
                            <span className="text-sm font-normal">"Zero-Lag System"</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
