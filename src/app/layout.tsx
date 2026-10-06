import type { Metadata } from "next";
import { Poppins, Bayon } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { OrientationProvider } from "@/components/layout/OrientationProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

const bayon = Bayon({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bayon",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebooth.in"),
  title: {
    default: "Sebooth | Photobooth Semarang & Tembalang Murah Terbaik",
    template: "%s | Sebooth Photobooth Semarang"
  },
  description: "Vendor sewa photobooth Semarang & Tembalang murah terbaik untuk wedding & wisuda UNDIP. Cetak instan lab-grade, live video, & softfile langsung ke HP.",
  alternates: {
    canonical: "https://www.sebooth.in",
    languages: {
      "id-ID": "https://www.sebooth.in",
    },
  },
  keywords: [
    "Photobooth Semarang",
    "Photobooth Tembalang",
    "Photobooth Konser Semarang",
    "Kerjasama Photobooth Konser",
    "Photobooth Stasiun Tawang",
    "Photobooth Event Semarang Murah",
    "Sewa Photobooth Semarang",
    "Photobooth Wedding Semarang",
    "Photobooth Wisuda UNDIP",
    "Vendor Photobooth Semarang",
    "Photobooth Cetak Instan Semarang",
    "Vending Machine Photobooth Semarang",
    "Self Photo Studio Semarang",
    "Photobooth Murah Tembalang",
    "Photobooth Banyumanik Semarang"
  ],
  authors: [{ name: "Sebooth Indonesia", url: "https://www.sebooth.in" }],
  creator: "Sebooth",
  publisher: "Sebooth Indonesia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.sebooth.in",
    siteName: "Sebooth - Vendor Photobooth Semarang",
    title: "Sebooth | Vendor Photobooth Semarang & Tembalang Murah Terbaik",
    description: "Cari vendor sewa photobooth di Semarang & Tembalang? Nikmati photobooth modern dengan cetak kilat, live video frame, softfile instan ke galeri HP.",
    images: [
      {
        url: "/images/slides/hero/bg_slide_1.webp",
        width: 1200,
        height: 630,
        alt: "Sebooth Photobooth Semarang & Tembalang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sebooth | Vendor Photobooth Semarang & Tembalang Murah",
    description: "Sewa photobooth aesthetic cetak instan di Semarang & Tembalang untuk event, wisuda UNDIP, dan wedding.",
    images: ["/images/slides/hero/bg_slide_1.webp"],
  },
  other: {
    "geo.placename": "Semarang, Jawa Tengah",
    "geo.region": "ID-JT",
    "geo.position": "-7.0506;110.4357",
    "ICBM": "-7.0506, 110.4357",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${poppins.variable} ${bayon.variable}`}>
      <head>
        <LocalBusinessSchema />
        <link
          rel="preload"
          as="image"
          href="/images/slides/hero/bg_slide_1.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/images/slides/hero/overlay_slide_1.webp"
          type="image/webp"
        />
      </head>
      <body
        className="antialiased paper-texture"
      >
        <OrientationProvider>
          <SmoothScrollProvider>
            <div id="root-app" className="w-full h-full relative">
              <LayoutShell>{children}</LayoutShell>
            </div>
          </SmoothScrollProvider>
        </OrientationProvider>
      </body>
    </html>
  );
}


