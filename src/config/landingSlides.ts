export interface SlideCta {
  text: string;
  href: string;
  isExternal?: boolean;
  variant?: "primary" | "secondary" | "whatsapp" | "gold";
  position?: "bottom-center" | "bottom-right" | "bottom-left" | "center-right";
}

export interface LandingSlide {
  id: string;
  slideNumber: string; // e.g. "01", "02"
  title: string;
  subtitle?: string;
  desktopImage?: string;
  mobileImage?: string;
  isAnimatedHero?: boolean;
  heroBackground?: string;
  heroOverlay?: string;
  alt: string;
  ctas?: SlideCta[];
  bgFallbackColor?: string;
}

export const LANDING_SLIDES: LandingSlide[] = [
  {
    id: "hero",
    slideNumber: "01",
    title: "Seboothkan Momenmu",
    subtitle: "Momen seru, cetak instan & softfile langsung ke HP kamu",
    isAnimatedHero: true,
    heroBackground: "/images/slides/hero/bg_slide_1.png",
    heroOverlay: "/images/slides/hero/overlay_slide_1.png",
    desktopImage: "/images/slides/hero/bg_slide_1.png",
    mobileImage: "/images/slides/hero/bg_slide_1.png",
    alt: "Sebooth Photobooth Hero Banner",
    bgFallbackColor: "#001845",
    ctas: [
      {
        text: "SEBOOTH-IN SEKARANG",
        href: "https://wa.me/6281234567890?text=Halo%20Sebooth,%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya!",
        isExternal: true,
        variant: "primary",
        position: "bottom-center",
      },
    ],
  },
  {
    id: "services",
    slideNumber: "02",
    title: "Sebutin Apa Yang Kamu Mau!",
    subtitle: "Layanan Photobooth Fleksibel: Batch Booking, All You Can Photos & Partnership",
    desktopImage: "/images/slides/desktop/slide-02-services.svg",
    mobileImage: "/images/slides/mobile/slide-02-services.svg",
    alt: "Sebooth Services & Packages",
    bgFallbackColor: "#0f3d2e",
    ctas: [
      {
        text: "LIHAT DETAIL LAYANAN",
        href: "/partnership",
        variant: "secondary",
        position: "bottom-center",
      },
    ],
  },
  {
    id: "frames",
    slideNumber: "03",
    title: "Exclusive Frame Collection",
    subtitle: "Ratusan pilihan template frame aesthetic & custom branding untuk event kamu",
    desktopImage: "/images/slides/desktop/slide-03-frames.svg",
    mobileImage: "/images/slides/mobile/slide-03-frames.svg",
    alt: "Sebooth Featured Frames & Portfolio",
    bgFallbackColor: "#FF4500",
    ctas: [],
  },
  {
    id: "portfolio",
    slideNumber: "04",
    title: "Portofolio & Hasil Foto",
    subtitle: "Koleksi Photostrip 2x6, Postcard 4R & Momen Seru di Sebooth",
    desktopImage: "/images/slides/desktop/slide-04-portfolio.svg",
    mobileImage: "/images/slides/mobile/slide-04-portfolio.svg",
    alt: "Sebooth Photobooth Portfolio & Gallery Archive",
    bgFallbackColor: "#FFFFFF",
    ctas: [],
  },
  {
    id: "pricing",
    slideNumber: "05",
    title: "Pilihan Paket Sewa Sebooth",
    subtitle: "Pilih paket yang paling pas untuk acara kamu, seru dan tanpa ribet!",
    desktopImage: "/images/slides/desktop/slide-04-pricing.svg",
    mobileImage: "/images/slides/mobile/slide-04-pricing.svg",
    alt: "Sebooth Pricing & Rental Packages",
    bgFallbackColor: "#0239A0",
    ctas: [],
  },
  {
    id: "contact",
    slideNumber: "06",
    title: "Frequently Ask Question",
    subtitle: "Belum menemukan jawaban? Yuk, ngobrol langsung dengan tim kami!",
    desktopImage: "/images/slides/desktop/slide-06-contact.svg",
    mobileImage: "/images/slides/mobile/slide-06-contact.svg",
    alt: "Sebooth Frequently Ask Question",
    bgFallbackColor: "#FFFFFF",
    ctas: [],
  },

];
