import { SlideDeckLanding } from "@/components/slides/SlideDeckLanding";
import { LANDING_SLIDES } from "@/config/landingSlides";

// ═══════════════════════════════════════════════════════
// ISR: Revalidate every 60 seconds
// ═══════════════════════════════════════════════════════
export const dynamic = "force-dynamic";

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
