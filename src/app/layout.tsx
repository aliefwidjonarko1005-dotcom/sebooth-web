import type { Metadata } from "next";
import { Space_Grotesk, Permanent_Marker, Poppins, Bayon } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { OrientationProvider } from "@/components/layout/OrientationProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["300", "400", "500", "600", "700"],
});
const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-marker",
  weight: "400",
});
const seboothFont = localFont({
  src: "./fonts/Sebooth.otf",
  variable: "--font-sebooth",
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
});
const bayon = Bayon({
  subsets: ["latin"],
  variable: "--font-bayon",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sebooth | The Most Favorite Photobooth in Semarang",
  description: "Capture Every Moment, Create Infinite Memories with sebooth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${permanentMarker.variable} ${seboothFont.variable} ${poppins.variable} ${bayon.variable} antialiased paper-texture`}
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

