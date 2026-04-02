"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";

const shadowCycle = ["hard-shadow-black", "hard-shadow-blue", "hard-shadow-orange", "hard-shadow-black"];

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
        <section className="py-24 px-6 md:px-20 bg-white paper-texture border-t-8 border-black">
            {/* Section Header */}
            <div className="mb-16">
                <EditableText section="faq" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-text-dark">
                    {content.section_title}
                </EditableText>
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-4xl space-y-4">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={`bg-white border-2 border-black ${shadowCycle[i % shadowCycle.length]} cursor-pointer`}
                        onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                    >
                        {/* Question Row */}
                        <div
                            className={`p-6 flex justify-between items-center transition-all duration-200 ease-out ${
                                activeIndex === i
                                    ? "bg-primary text-white border-b-4 border-black"
                                    : "bg-white text-text-dark hover:bg-primary hover:text-white border-b-4 border-black"
                            }`}
                        >
                            <h3 className="text-xl font-black uppercase tracking-tight">
                                {faq.question}
                            </h3>
                            {activeIndex === i ? (
                                <Minus className="w-6 h-6 shrink-0" />
                            ) : (
                                <Plus className="w-6 h-6 shrink-0" />
                            )}
                        </div>

                        {/* Answer — CSS grid transition */}
                        <div className={activeIndex === i ? "grid-expand" : "grid-collapse"}>
                            <div className="grid-inner">
                                <p className="p-6 text-text-dark font-bold uppercase leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
