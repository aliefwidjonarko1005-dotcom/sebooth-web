"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EditableText } from "@/components/admin/EditableText";
import { EditableImage } from "@/components/admin/EditableImage";

const defaultContent = {
    tag: "[ 00 — ORIGIN STORY ]",
    title: "FROM\nENGINEERING\nTO AESTHETICS.",
    description: "Berawal dari proyek passion kecil, sebooth. berevolusi menjadi layanan photobooth terdepan di Semarang.",
    cta_text: "READ OUR FULL STORY →",
};

interface AboutProps {
    initialData?: Record<string, string>;
}

export function About({ initialData = {} }: AboutProps) {
    const content = { ...defaultContent, ...initialData };

    return (
        <section id="about" className="py-24 px-6 md:px-20 bg-white paper-texture border-t-8 border-black">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col justify-center space-y-8"
                >
                    <div className="border-l-[12px] border-secondary pl-6">
                        <EditableText section="about" fieldKey="tag" defaultValue={content.tag} as="p" className="text-lg font-bold uppercase text-primary mb-2">
                            {content.tag}
                        </EditableText>
                        <EditableText section="about" fieldKey="title" defaultValue={content.title} as="h2" className="text-4xl md:text-6xl font-black uppercase text-text-dark tracking-tighter leading-none">
                            {content.title}
                        </EditableText>
                    </div>

                    <div className="space-y-6">
                        <EditableText section="about" fieldKey="description" defaultValue={content.description} as="p" className="text-lg font-bold uppercase text-text-dark max-w-md">
                            {content.description}
                        </EditableText>
                        <Link
                            href="/about"
                            className="inline-block font-black uppercase bg-secondary text-white px-8 py-4 border-2 border-black hard-shadow-black hover:-translate-y-1 hover:-translate-x-1 active:translate-0 transition-none"
                        >
                            <EditableText section="about" fieldKey="cta_text" defaultValue={content.cta_text} as="span" className="text-white font-black uppercase">
                                {content.cta_text}
                            </EditableText>
                        </Link>
                    </div>
                </motion.div>

                {/* Right: Visual */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-[500px] w-full bg-gray-100 border-4 border-black hard-shadow-blue flex items-center justify-center overflow-hidden"
                >
                    {initialData["image"] ? (
                        <EditableImage
                            section="about"
                            fieldKey="image"
                            defaultValue={initialData["image"]}
                            className="w-full h-full object-cover"
                            altText="About Sebooth"
                        />
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <EditableImage
                                section="about"
                                fieldKey="image"
                                defaultValue=""
                                className="w-full h-full object-cover"
                                altText="About Sebooth"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-text-dark/20 font-black text-center p-8 flex-col gap-4 uppercase pointer-events-none">
                                <span className="text-6xl">⚡</span>
                                <span className="text-2xl">[Zero-Lag System]</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
