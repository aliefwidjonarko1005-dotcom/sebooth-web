import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchSiteContent } from "@/lib/serverSupabase";
import { parseJsonContent } from "@/lib/useSiteContent";
import { FramesGalleryClient } from "@/components/sections/FramesGalleryClient";
import { SeboothLoader } from "@/components/ui/SeboothLoader";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Frames | Sebooth — Custom Photobooth Frame Designs",
    description:
        "Tinjau koleksi desain frame kustom premium kami untuk melengkapi keindahan visual acara Anda di Sebooth photobooth.",
    openGraph: {
        title: "Frames | Sebooth",
        description:
            "Tinjau koleksi desain frame kustom premium kami untuk melengkapi keindahan visual acara Anda di Sebooth photobooth.",
        type: "website",
    },
};

export default async function FramesPage() {
    const contentMap = await fetchSiteContent();
    const framesContent = contentMap["featured_frames"] || {};
    const frames = parseJsonContent<{ id: string; title: string; category: string; image_url: string; }[]>(
        framesContent["items"], 
        []
    );

    return (
        <Suspense fallback={<SeboothLoader label="Memuat koleksi frame" />}>
            <FramesGalleryClient initialFrames={frames} />
        </Suspense>
    );
}
