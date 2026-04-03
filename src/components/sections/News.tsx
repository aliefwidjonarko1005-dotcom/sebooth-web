"use client";

import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import { EditableText } from "@/components/admin/EditableText";

interface NewsItem {
    id: string;
    title: string;
    body: string;
    image_url: string;
    created_at: string;
}

const shadowCycle = ["hard-shadow-black", "hard-shadow-blue", "hard-shadow-orange"];
const sectionTitle = "LATEST NEWS";

interface NewsProps {
    initialNews?: NewsItem[];
}

export function News({ initialNews = [] }: NewsProps) {
    if (initialNews.length === 0) return null;

    return (
        <section className="py-24 px-6 md:px-20 bg-white paper-texture border-t-8 border-black">
            {/* Header */}
            <div className="mb-12 flex items-center gap-6">
                <EditableText section="news_section" fieldKey="section_title" defaultValue={sectionTitle} as="h2" className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-text-dark">
                    {sectionTitle}
                </EditableText>
                <Newspaper className="w-10 h-10 text-secondary" />
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialNews.map((item, idx) => (
                    <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`bg-white border-2 border-black overflow-hidden ${shadowCycle[idx % shadowCycle.length]}`}
                    >
                        {/* Image */}
                        {item.image_url && (
                            <div className="w-full h-48 bg-gray-100 overflow-hidden border-b-2 border-black relative">
                                <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                            <time className="text-xs font-bold uppercase text-primary/50 mb-2 block">
                                {new Date(item.created_at).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </time>
                            <h3 className="text-xl font-black uppercase text-text-dark mb-3 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-sm font-bold text-text-dark/70 uppercase leading-relaxed line-clamp-3">
                                {item.body}
                            </p>
                        </div>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
