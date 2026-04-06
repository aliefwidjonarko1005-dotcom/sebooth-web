"use client";

import { motion } from "framer-motion";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";
import { EditableArrayItemText } from "@/components/admin/EditableArrayItemText";

const shadowCycle = ["hard-shadow-black", "hard-shadow-blue", "hard-shadow-orange"];
const avatarColors = ["bg-primary", "bg-secondary", "bg-primary"];

interface TestimonialItem {
    quote: string;
    author: string;
    initials: string;
    role: string;
    offsetClass: string;
}

const defaultTestimonials: TestimonialItem[] = [
    {
        quote: "SEBOOTH MADE OUR WEDDING LEGENDARY. THE QUALITY OF THE PRINTS IS JUST NEXT LEVEL.",
        author: "Amanda & Michael",
        initials: "AM",
        role: "Wedding Client",
        offsetClass: "",
    },
    {
        quote: "THE ZERO-LAG SYSTEM IS NOT A JOKE. WE GOT OUR PHOTOS ON OUR PHONES BEFORE WE EVEN LEFT THE BOOTH.",
        author: "Rian Kusuma",
        initials: "RK",
        role: "Tech Conference",
        offsetClass: "mt-8 md:mt-16",
    },
    {
        quote: "SOPHISTICATED HARDWARE, BUT SO EASY TO USE. OUR BOSS LOVED THE GLAMOUR FILTER!",
        author: "Sarah Teo",
        initials: "ST",
        role: "HR at TechCorp",
        offsetClass: "",
    },
];

const defaultContent = {
    section_title: "TRUSTED BY MANY",
    section_badge: "REAL FEEDBACK",
    items: "",
};

interface TestimonialsProps {
    initialData?: Record<string, string>;
}

export function Testimonials({ initialData = {} }: TestimonialsProps) {
    const content = { ...defaultContent, ...initialData };
    const testimonials = parseJsonContent<TestimonialItem[]>(content.items, defaultTestimonials);

    return (
        <section className="py-24 px-6 md:px-20 bg-white paper-texture overflow-hidden border-t-8 border-black">
            {/* Section Header */}
            <div className="text-center mb-16">
                <div className="inline-block relative">
                    <EditableText section="testimonials" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-text-dark">
                        {content.section_title}
                    </EditableText>
                    {/* Desktop badge — absolute positioned */}
                    <div className="absolute -right-16 -top-12 rotate-12 bg-secondary text-white px-6 py-2 text-xl marker-font border-2 border-black hard-shadow-black hidden sm:block" style={{ textShadow: "none" }}>
                        <EditableText section="testimonials" fieldKey="section_badge" defaultValue={content.section_badge} as="span" className="text-white text-xl marker-font">
                            {content.section_badge}
                        </EditableText>
                    </div>
                </div>
                {/* Mobile badge — inline below title */}
                <div className="mt-4 sm:hidden">
                    <span className="inline-block bg-secondary text-white px-4 py-1.5 text-sm marker-font border-2 border-black hard-shadow-black" style={{ textShadow: "none" }}>
                        {content.section_badge}
                    </span>
                </div>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-white p-8 border-2 border-black relative group ${shadowCycle[i % shadowCycle.length]} ${t.offsetClass || ""}`}
                    >
                        <div className="text-text-dark mb-6 italic font-black text-xl leading-tight">
                            &quot;<EditableArrayItemText section="testimonials" arrayKey="items" items={testimonials} index={i} field="quote" as="span" className="text-text-dark italic font-black text-xl leading-tight" />&quot;
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black border border-black`}>
                                {t.initials}
                            </div>
                            <div>
                                <EditableArrayItemText section="testimonials" arrayKey="items" items={testimonials} index={i} field="author" as="div" className="font-black uppercase text-sm text-text-dark" />
                                <EditableArrayItemText section="testimonials" arrayKey="items" items={testimonials} index={i} field="role" as="div" className="text-xs font-bold text-primary/60 uppercase" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
