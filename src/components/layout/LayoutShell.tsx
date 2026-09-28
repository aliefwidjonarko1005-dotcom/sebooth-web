"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/ui/FloatingCTA";

const EXCLUDED_PATHS = ["/profile", "/login", "/register", "/admin", "/queue"];
// Only dedicated subpages that specifically require a traditional website footer
const PAGES_WITH_FOOTER = ["/partnership", "/frames", "/about", "/news"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isExcluded = Boolean(pathname && EXCLUDED_PATHS.some(p => pathname.startsWith(p)));
    const isAccess = Boolean(pathname?.startsWith("/access"));
    // Under NO circumstances should Footer ever render on the full-page slide deck homepage (/)
    const shouldShowFooter = Boolean(pathname && PAGES_WITH_FOOTER.some(p => pathname.startsWith(p)));

    return (
        <>
            {!isExcluded && !isAccess && <Header />}
            <main>{children}</main>
            {shouldShowFooter && <Footer />}
            {!isExcluded && !isAccess && <FloatingCTA />}
        </>
    );
}

