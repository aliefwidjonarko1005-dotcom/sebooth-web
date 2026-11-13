import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { FEATURED_STRIPS } from "@/data/featuredStrips";
import { FeaturedStripsClient } from "@/components/frames-featured/FeaturedStripsClient";

// The strips are guests' own prints and stay out of git, so a copy of the site may not have them:
// the page is built from whatever files are present, and shows only those.
export const dynamic = "force-static";

export const metadata: Metadata = {
    title: { absolute: "All Featured Frame | Sebooth" },
    description: "Semua desain frame photostrip yang pernah dicetak Sebooth di acara kampus, wisuda, farewell dan gathering.",
    // Real guests are in these prints: shown on the site, kept out of search results
    robots: { index: false, follow: true },
};

export default function FeaturedFramesPage() {
    const dir = path.join(process.cwd(), "public/images/featured-frames");
    const strips = FEATURED_STRIPS.filter(
        (s) => fs.existsSync(path.join(dir, "thumb", `${s.id}.webp`)) && fs.existsSync(path.join(dir, "full", `${s.id}.webp`))
    );

    return <FeaturedStripsClient strips={strips} />;
}
