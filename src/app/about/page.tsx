import type { Metadata } from "next";
import { fetchAboutPageContent } from "@/lib/serverSupabase";
import { AboutContent } from "@/components/sections/AboutContent";

// ═══════════════════════════════════════════════════════
// ISR: Revalidate every 60 seconds
// ═══════════════════════════════════════════════════════
export const revalidate = 60;

export const metadata: Metadata = {
    title: "About Us | Sebooth — The Most Favorite Photobooth in Semarang",
    description:
        "Kenali kisah Sebooth — dari garasi kecil di Semarang menjadi standar emas industri event experience Indonesia. Visi, misi, dan perjalanan kami.",
    openGraph: {
        title: "About Us | Sebooth",
        description:
            "Kenali kisah Sebooth — dari garasi kecil di Semarang menjadi standar emas industri event experience Indonesia.",
        type: "website",
    },
};

export default async function AboutPage() {
    const content = await fetchAboutPageContent();

    return <AboutContent content={content} />;
}
