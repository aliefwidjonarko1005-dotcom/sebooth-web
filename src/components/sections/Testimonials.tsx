"use client";

import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "The print quality is unmatched. It feels like a studio session but instant.",
        author: "Sarah & Dimas",
        role: "Wedding Clients"
    },
    {
        quote: "Sebooth brought a whole new energy to our corporate gala. Very professional team.",
        author: "TechCorp Indonesia",
        role: "Corporate Partner"
    },
    {
        quote: "Simple, fast, and aesthetic. Exactly what we needed for our brand launch.",
        author: "Local Coffee Shop",
        role: "Brand Activation"
    },
];

export function Testimonials() {
    return (
        <section className="py-32 bg-[#F9F9F9] border-t border-[#1A1A1A]/10">
            <div className="container mx-auto px-6">
                <div className="mb-20">
                    <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-sebooth text-[#1A1A1A] tracking-tight">
                        Trusted by Many.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col justify-between"
                        >
                            <blockquote className="text-xl md:text-2xl font-serif italic text-[#1A1A1A]/80 mb-8 leading-relaxed">
                                &quot;{t.quote}&quot;
                            </blockquote>
                            <div>
                                <cite className="not-italic font-bold text-[#1A1A1A] block">{t.author}</cite>
                                <span className="text-sm text-[#1A1A1A]/50 uppercase tracking-wider">{t.role}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
