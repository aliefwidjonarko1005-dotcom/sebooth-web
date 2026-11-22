import type { Metadata } from "next";
import { KenaliSeboothContent } from "@/components/sections/KenaliSeboothContent";

const TITLE = "Kenali Sebooth | Photobooth Gratis untuk Event Anda";
const DESCRIPTION =
    "Satu mesin vending photobooth 1 × 1 meter di event Anda, gratis untuk penyelenggara. Tonton videonya, lihat cara kerja dan buktinya, lalu chat kami.";

// A pitch page sent by direct message, kept out of search so it never competes with the SEO articles
export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/kenali-sebooth" },
    robots: { index: false, follow: true },
    openGraph: {
        type: "website",
        url: "/kenali-sebooth",
        title: "Photobooth gratis untuk event Anda | Sebooth",
        description: DESCRIPTION,
        images: [{ url: "/images/kenali/og.jpg", width: 1200, height: 630, alt: "Cuplikan video Sebooth: kotak 1 × 1 meter, cetakan berlogo event, dan kontak WhatsApp" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Photobooth gratis untuk event Anda | Sebooth",
        description: DESCRIPTION,
        images: ["/images/kenali/og.jpg"],
    },
};

export default function KenaliSeboothPage() {
    return <KenaliSeboothContent />;
}
