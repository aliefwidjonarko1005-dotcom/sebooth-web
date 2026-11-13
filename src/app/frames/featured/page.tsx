import type { Metadata } from "next";
import { FEATURED_STRIPS } from "@/data/featuredStrips";
import { FeaturedStripsClient } from "@/components/frames-featured/FeaturedStripsClient";

export const metadata: Metadata = {
    title: { absolute: "All Featured Frame | Sebooth" },
    description: "Semua desain frame photostrip yang pernah dicetak Sebooth di acara kampus, wisuda, farewell dan gathering.",
    // Real guests are in these prints: shown on the site, kept out of search results
    robots: { index: false, follow: true },
};

export default function FeaturedFramesPage() {
    return <FeaturedStripsClient strips={FEATURED_STRIPS} />;
}
