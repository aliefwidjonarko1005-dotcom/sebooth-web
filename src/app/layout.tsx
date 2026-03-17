import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/ui/FloatingCTA";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const seboothFont = localFont({
  src: "./fonts/Sebooth.otf",
  variable: "--font-sebooth",
});

export const metadata: Metadata = {
  title: "Sebooth - Premium Photobooth Experience",
  description: "Capture Every Moment, Create Infinite Memories with Sebooth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${seboothFont.variable} antialiased selection:bg-[#D4AF37] selection:text-black`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
