import type { Metadata } from "next";
import { Space_Grotesk, Permanent_Marker } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ClientProviders } from "@/components/admin/ClientProviders";

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
        className={`${spaceGrotesk.variable} ${permanentMarker.variable} ${seboothFont.variable} antialiased paper-texture`}
      >
        <ClientProviders>
          <LayoutShell>{children}</LayoutShell>
        </ClientProviders>
      </body>
    </html>
  );
}

