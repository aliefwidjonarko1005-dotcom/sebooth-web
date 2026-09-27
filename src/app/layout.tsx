import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { OrientationProvider } from "@/components/layout/OrientationProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bayon&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
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

