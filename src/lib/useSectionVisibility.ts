"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface SectionVisibility {
    [key: string]: boolean;
}

export function useSectionVisibility() {
    const [visibility, setVisibility] = useState<SectionVisibility>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            // First, try localStorage
            const saved = localStorage.getItem("sebooth-section-visibility");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setVisibility(parsed);
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error("Failed to parse localStorage:", e);
                }
            }

            // Then try Supabase
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from("site_content")
                    .select("key, value")
                    .eq("section", "settings")
                    .ilike("key", "section_%_visible");

                if (data) {
                    const vis: SectionVisibility = {};
                    data.forEach((item) => {
                        const sectionName = item.key.replace(
                            /section_(.*)_visible/,
                            "$1"
                        );
                        vis[sectionName] = item.value === "true";
                    });
                    setVisibility(vis);

                    // Save to localStorage for next time
                    localStorage.setItem(
                        "sebooth-section-visibility",
                        JSON.stringify(vis)
                    );
                }
            } catch (err) {
                console.error("Failed to load section visibility:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const isVisible = (section: string): boolean => {
        return visibility[section] !== false; // Default to visible
    };

    return { visibility, isVisible, loading };
}
