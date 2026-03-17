"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "Do you travel outside of Semarang?",
        answer: "Yes, we cover events across Central Java and can travel nationwide for special requests. Additional transport fees may apply."
    },
    {
        question: "How much space do you need?",
        answer: "Our standard setup requires a 3x3 meter space to ensure the best experience for your guests and optimal lighting conditions."
    },
    {
        question: "Can we customize the photo frame design?",
        answer: "Absolutely. All our packages include a custom frame design tailored to your event theme or brand identity."
    },
    {
        question: "Do you provide digital copies?",
        answer: "Yes! Guests can download photos instantly via QR code, and we provide a full online gallery link after the event."
    },
];

export function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section className="py-32 bg-[#F9F9F9] border-t border-[#1A1A1A]/10">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20">

                <div>
                    <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">FAQ</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-sebooth text-[#1A1A1A] mb-8 tracking-tight">
                        Common Questions.
                    </h2>
                    <p className="text-[#1A1A1A]/60 text-lg">
                        Everything you need to know about booking Sebooth for your next event.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-[#1A1A1A]/10 last:border-0 pb-4">
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className="w-full flex items-center justify-between py-4 text-left group"
                            >
                                <span className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#0F3D2E] transition-colors">{faq.question}</span>
                                {activeIndex === i ? <Minus className="w-5 h-5 text-[#D4AF37]" /> : <Plus className="w-5 h-5 text-[#1A1A1A]/40 group-hover:text-[#1A1A1A]" />}
                            </button>
                            <AnimatePresence>
                                {activeIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pb-8 text-[#1A1A1A]/70 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
