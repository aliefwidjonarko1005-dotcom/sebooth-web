"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/ui/FloatingCTA";

const EXCLUDED_PATHS = ["/profile", "/login", "/register", "/admin"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isExcluded = EXCLUDED_PATHS.some(p => pathname.startsWith(p));
    const isAccess = pathname.startsWith("/access");

    return (
        <>
            {!isExcluded && !isAccess && <Header />}
            <main>{children}</main>
            {!isExcluded && !isAccess && <Footer />}
            {!isExcluded && !isAccess && <FloatingCTA />}
        </>
    );
}
