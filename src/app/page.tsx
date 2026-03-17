import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Product } from "@/components/sections/Product";
import { Pricing } from "@/components/sections/Pricing";
import { Gallery } from "@/components/sections/Gallery";
import { Location } from "@/components/sections/Location";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <About />
      <Product />
      <Pricing />
      <Testimonials />
      <Gallery />
      <FAQ />
      <Location />
    </div>
  );
}
