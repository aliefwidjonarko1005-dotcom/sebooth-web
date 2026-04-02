"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditableText } from "@/components/admin/EditableText";

interface IGPost {
    id: string;
    instagram_url: string;
}

declare global {
    interface Window {
        instgrm?: { Embeds: { process: () => void } };
    }
}

const sectionTitle = "LIVE FROM INSTAGRAM";
const sectionTag = "Tag Us!";

interface InstagramFeedProps {
    initialPosts?: IGPost[];
}

export function InstagramFeed({ initialPosts = [] }: InstagramFeedProps) {
    const scriptLoaded = useRef(false);

    // Load Instagram embed script
    const loadInstagramScript = useCallback(() => {
        if (scriptLoaded.current) {
            // Script already loaded, just re-process
            window.instgrm?.Embeds.process();
            return;
        }

        // Remove existing script to force re-process
        const existingScript = document.querySelector(
            'script[src*="instagram.com/embed.js"]'
        );
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement("script");
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
            scriptLoaded.current = true;
            window.instgrm?.Embeds.process();
        };
        document.body.appendChild(script);
    }, []);

    // When posts are available, load/process Instagram embeds
    useEffect(() => {
        if (initialPosts.length > 0) {
            // Small delay to allow DOM to render blockquotes first
            const timer = setTimeout(() => {
                loadInstagramScript();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [initialPosts, loadInstagramScript]);

    if (initialPosts.length === 0) return null;

    // Normalize URL to ensure it ends with /
    function normalizeUrl(url: string) {
        // Remove any query params and ensure trailing slash
        const cleanUrl = url.split("?")[0];
        return cleanUrl.endsWith("/") ? cleanUrl : cleanUrl + "/";
    }

    return (
        <section className="py-24 px-6 md:px-20 bg-white paper-texture border-t-8 border-black">
            {/* Section Header */}
            <div className="mb-12 flex items-center gap-6">
                <EditableText section="instagram" fieldKey="section_title" defaultValue={sectionTitle} as="h2" className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-text-dark">
                    {sectionTitle}
                </EditableText>
                <EditableText section="instagram" fieldKey="section_tag" defaultValue={sectionTag} as="span" className="marker-font text-secondary text-3xl rotate-[-5deg] inline-block" style={{ textShadow: "none" }}>
                    {sectionTag}
                </EditableText>
            </div>

            {/* Horizontal Scroll Carousel with Real Embeds */}
            <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar px-2 items-start">
                {initialPosts.map((post) => (
                    <div
                        key={post.id}
                        className="flex-none w-[340px] min-w-[340px]"
                    >
                        <blockquote
                            className="instagram-media"
                            data-instgrm-captioned
                            data-instgrm-permalink={normalizeUrl(post.instagram_url)}
                            data-instgrm-version="14"
                            style={{
                                background: "#FFF",
                                border: "0",
                                borderRadius: "0",
                                boxShadow: "none",
                                margin: "0",
                                maxWidth: "340px",
                                minWidth: "280px",
                                padding: "0",
                                width: "100%",
                            }}
                        >
                            <a
                                href={normalizeUrl(post.instagram_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 text-center text-sm text-primary/60 font-bold uppercase"
                            >
                                Loading Instagram Post...
                            </a>
                        </blockquote>
                    </div>
                ))}
            </div>
        </section>
    );
}
