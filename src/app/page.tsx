import { Hero } from "@/components/sections/Hero";
import { ProcessPinningSection } from "@/components/sections/ProcessPinningSection";
import { Product } from "@/components/sections/Product";
import { Pricing } from "@/components/sections/Pricing";
import { Gallery } from "@/components/sections/Gallery";
import { FeaturedFrames } from "@/components/sections/FeaturedFrames";
import { Location } from "@/components/sections/Location";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { News } from "@/components/sections/News";
import {
  fetchSiteContent,
  fetchGalleryImages,
  fetchInstagramPosts,
  fetchNews,
  fetchSectionVisibility,
} from "@/lib/serverSupabase";
import { parseJsonContent } from "@/lib/useSiteContent";

// ═══════════════════════════════════════════════════════
// ISR: Revalidate every 60 seconds
// After 60s, the next request triggers a background rebuild.
// All visitors within that window get instant cached response.
// ═══════════════════════════════════════════════════════
export const revalidate = 60;

export default async function Home() {
  // ── Parallel server-side data fetching ──
  const [contentMap, instagramPosts, newsItems, sectionVisibility] =
    await Promise.all([
      fetchSiteContent(),
      fetchInstagramPosts(),
      fetchNews(),
      fetchSectionVisibility(),
    ]);

  // Gallery needs metadata from site_content to resolve event names/types
  const galleryContent = contentMap["gallery"] || {};
  const galleryMetadata = parseJsonContent<
    { name: string; event: string; type: string }[]
  >(galleryContent["items"], []);
  const galleryImages = await fetchGalleryImages(galleryMetadata);

  // ── Section visibility helper ──
  const isVisible = (section: string) => sectionVisibility[section] !== false;

  return (
    <div className="flex flex-col">
      {isVisible("hero") && <Hero initialData={contentMap["hero"]} />}
      <ProcessPinningSection />
      {isVisible("product") && <Product initialData={contentMap["product"]} />}
      {isVisible("pricing") && <Pricing initialData={contentMap["pricing"]} />}
      {isVisible("testimonials") && (
        <Testimonials initialData={contentMap["testimonials"]} />
      )}
      {isVisible("gallery") && (
        <Gallery
          initialData={contentMap["gallery"]}
          initialGalleryImages={galleryImages}
        />
      )}
      {isVisible("featured_frames") && (
        <FeaturedFrames initialData={contentMap["featured_frames"]} />
      )}
      {isVisible("instagram") && (
        <InstagramFeed initialPosts={instagramPosts} />
      )}
      {isVisible("faq") && <FAQ initialData={contentMap["faq"]} />}
      {isVisible("news") && <News initialNews={newsItems} />}
      {isVisible("location") && (
        <Location initialData={contentMap["location"]} />
      )}
    </div>
  );
}

