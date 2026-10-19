"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FloatingCTA } from "@/components/ui/FloatingCTA";

const EXCLUDED_PATHS = ["/profile", "/login", "/register", "/admin", "/queue"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isExcluded = Boolean(pathname && EXCLUDED_PATHS.some(p => pathname.startsWith(p)));
    const isAccess = Boolean(pathname?.startsWith("/access"));
    // Article routes render their own sticky header; the global fixed nav would overlap it
    const hasOwnHeader = Boolean(pathname?.startsWith("/artikel"));

    return (
        <>
            {!isExcluded && !isAccess && !hasOwnHeader && <Header />}
            <main>{children}</main>
            {!isExcluded && !isAccess && <FloatingCTA />}
        </>
    );
}


