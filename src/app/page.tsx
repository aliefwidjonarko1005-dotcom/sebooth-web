import { SlideDeckLanding } from "@/components/slides/SlideDeckLanding";
import { LANDING_SLIDES } from "@/config/landingSlides";

// ═══════════════════════════════════════════════════════
// Pure Static Edge Generation (Zero-Latency Edge CDN)
// ═══════════════════════════════════════════════════════
export const dynamic = "force-static";

export const metadata = {
  title: "Sebooth | The Most Favorite Photobooth in Semarang",
  description:
    "Capture Every Moment, Create Infinite Memories with Sebooth Photobooth. Layanan photobooth seru, frame aesthetic, dan download softfile instan.",
  openGraph: {
    title: "Sebooth Photobooth",
    description:
      "Capture Every Moment, Create Infinite Memories with Sebooth Photobooth.",
    images: ["/images/slides/placeholders/desktop-slide-01.svg"],
  },
};

export default function Home() {
  return <SlideDeckLanding slides={LANDING_SLIDES} />;
}
