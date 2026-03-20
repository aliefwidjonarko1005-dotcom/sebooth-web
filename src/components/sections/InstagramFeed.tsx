"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";

interface IGPost {
    id: string;
    instagram_url: string;
}

export function InstagramFeed() {
    const [posts, setPosts] = useState<IGPost[]>([]);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data } = await supabase
                .from("instagram_posts")
                .select("*")
                .order("display_order");
            if (data) setPosts(data);
        }
        load();
    }, []);

    if (posts.length === 0) return null;

    return (
        <section className="py-32 bg-white border-t border-[#1A1A1A]/10">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 max-w-2xl"
                >
                    <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">
                        Social
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight">
                        Follow Us on Instagram.
                    </h2>
                    <p className="mt-4 text-[#1A1A1A]/60 text-lg">
                        See the latest moments captured with Sebooth.
                    </p>
                </motion.div>

                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {posts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="snap-center flex-shrink-0 w-[320px] md:w-[350px]"
                        >
                            <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-500">
                                <iframe
                                    src={`${post.instagram_url}embed/`}
                                    className="w-full border-0"
                                    style={{ minHeight: '480px' }}
                                    loading="lazy"
                                    allowTransparency
                                    scrolling="no"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
