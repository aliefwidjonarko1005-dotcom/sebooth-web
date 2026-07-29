import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchSiteContent } from "@/lib/serverSupabase";
import { parseJsonContent } from "@/lib/useSiteContent";
import { FramesGalleryClient } from "@/components/sections/FramesGalleryClient";

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
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <FramesGalleryClient initialFrames={frames} />
        </Suspense>
    );
}
