"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";
import { EditableArrayItemText } from "@/components/admin/EditableArrayItemText";
import { motion, AnimatePresence } from "framer-motion";

const shadowCycle = ["hard-shadow-black", "hard-shadow-blue", "hard-shadow-orange", "hard-shadow-black"];
const hoverShadows = [
    "md:hover:shadow-[8px_8px_0px_0px_#000000]",
    "md:hover:shadow-[8px_8px_0px_0px_#002366]",
    "md:hover:shadow-[8px_8px_0px_0px_#ff4500]",
    "md:hover:shadow-[8px_8px_0px_0px_#000000]"
];

interface FaqItem {
    question: string;
    answer: string;
}

const defaultFaqs: FaqItem[] = [
    {
        question: "Travel outside Semarang?",
        answer: "Yes, we cover events across Central Java and can travel nationwide for special requests. Additional transport fees may apply.",
    },
    {
        question: "Space needed?",
        answer: "Our standard setup requires a 3x3 meter space to ensure the best experience for your guests and optimal lighting conditions.",
    },
    {
        question: "Custom frame design?",
        answer: "Absolutely. All our packages include a custom frame design tailored to your event theme or brand identity.",
    },
    {
        question: "Digital copies?",
        answer: "Yes! Guests can download photos instantly via QR code, and we provide a full online gallery link after the event.",
    },
];

const defaultContent = {
    section_title: "COMMON QUESTIONS",
    items: "",
};

interface FAQProps {
    initialData?: Record<string, string>;
}

export function FAQ({ initialData = {} }: FAQProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const content = { ...defaultContent, ...initialData };
    const faqs = parseJsonContent<FaqItem[]>(content.items, defaultFaqs);

    return (
        <section className="py-24 px-6 md:px-20 bg-transparent paper-texture border-t-8 border-black">
            {/* Section Header */}
            <div className="mb-16 text-center">
                <EditableText section="faq" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-text-dark text-center w-full">
                    {content.section_title}
                </EditableText>
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-4xl mx-auto space-y-4">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={`bg-white border-2 border-black ${shadowCycle[i % shadowCycle.length]} ${hoverShadows[i % hoverShadows.length]} md:hover:-translate-y-1 md:hover:-translate-x-1 transition-[transform,box-shadow] duration-200 ease-out cursor-pointer`}
                        onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                    >
                        {/* Question Row */}
                        <div
                            className={`p-6 flex items-center justify-center relative transition-colors duration-300 ease-out ${
                                activeIndex === i
                                    ? "bg-primary text-white border-b-4 border-black"
                                    : "bg-white text-text-dark hover:bg-primary/5 hover:text-primary border-b-4 border-black"
                            }`}
                        >
                            <EditableArrayItemText section="faq" arrayKey="items" items={faqs} index={i} field="question" as="h3" className="text-xl font-black uppercase tracking-tight text-center w-full px-8" />
                            <Plus className={`w-6 h-6 shrink-0 absolute right-6 transition-transform duration-300 ${activeIndex === i ? "rotate-45" : "rotate-0"}`} />
                        </div>

                        {/* Answer — Framer Motion transition */}
                        <AnimatePresence initial={false}>
                            {activeIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <EditableArrayItemText section="faq" arrayKey="items" items={faqs} index={i} field="answer" as="p" className="p-6 text-text-dark font-bold uppercase leading-relaxed text-center" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}
