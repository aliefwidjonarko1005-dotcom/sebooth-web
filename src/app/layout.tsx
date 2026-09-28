import type { Metadata } from "next";
import { Poppins, Bayon } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { OrientationProvider } from "@/components/layout/OrientationProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const bayon = Bayon({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bayon",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sebooth.id"),
  title: "Sebooth | The Most Favorite Photobooth in Semarang",
  description: "Capture Every Moment, Create Infinite Memories with sebooth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${poppins.variable} ${bayon.variable}`}>
      <body
        className="antialiased paper-texture"
      >
        <OrientationProvider>
          <SmoothScrollProvider>
            <CustomCursor />
            <div id="root-app" className="w-full h-full relative">
              <LayoutShell>{children}</LayoutShell>
            </div>
          </SmoothScrollProvider>
        </OrientationProvider>
      </body>
    </html>
  );
}


