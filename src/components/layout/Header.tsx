"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { whatsappUrl } from "@/config/social";
import { useModalFocus } from "@/lib/useModalFocus";

const mobileNavItems = [
  { name: "HOME", href: "/#hero" },
  { name: "PRODUCT", href: "/#product" },
  { name: "FRAMES", href: "/#frames" },
  { name: "GALLERY", href: "/#portfolio" },
  { name: "AKTIVITAS", href: "/#activities" },
  { name: "PRICING", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "MY PHOTOS", href: "/profile" },
];

const desktopNavItems = [
  { name: "PRODUCT", href: "/#product" },
  { name: "FRAMES", href: "/#frames" },
  { name: "GALLERY", href: "/#portfolio" },
  { name: "AKTIVITAS", href: "/#activities" },
  { name: "PRICING", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "MY PHOTOS", href: "/profile" },
];

const BOOKING_MESSAGE = "Halo Sebooth, saya ingin booking photobooth untuk acara saya!";

export function Header() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("");
  const reduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeDrawer = useCallback(() => setIsMobileDrawerOpen(false), []);
  useModalFocus(isMobileDrawerOpen, drawerRef, closeDrawer);

  const handleNavClick = (href: string, name: string) => {
    setActiveItem(name);
    setIsMobileDrawerOpen(false);

    // If on homepage and linking to a slide hash, trigger smooth jump or hash change
    if (pathname === "/" && href.startsWith("/#")) {
      const hash = href.replace("/#", "");
      const targetElement =
        document.getElementById(hash) ||
        document.getElementById(`slide-${hash}`) ||
        (hash === "product" ? document.getElementById("slide-services") : null) ||
        (hash === "activities" ? document.getElementById("slide-activities") : null) ||
        (hash === "faq" ? document.getElementById("slide-contact") : null);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE ONLY: CORNER TAB WITH MENU BUTTON AND WORDMARK
          Stays in the corner so slide titles remain unobstructed and visible.
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 z-50 flex items-center rounded-br-2xl bg-blue-dark pt-[env(safe-area-inset-top)] pr-4 md:hidden">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Buka Menu Navigasi"
          aria-haspopup="dialog"
          aria-expanded={isMobileDrawerOpen}
          className="flex h-14 w-14 cursor-pointer items-center justify-center text-white transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white active:scale-95"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <Link
          href="/"
          aria-label="Sebooth, ke beranda"
          className="flex h-14 items-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        >
          <Image src="/images/logo/sebooth-white.svg" alt="Sebooth Photobooth" width={72} height={30} unoptimized priority className="h-auto w-auto" style={{ height: 30 }} />
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE ONLY: SIDE DRAWER
         ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-[9998] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-blue-dark/70"
            />

            {/* Left slide-out drawer */}
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
              className="relative flex h-full w-[82vw] max-w-[320px] flex-col justify-between overflow-y-auto bg-primary px-5 pt-[env(safe-area-inset-top)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-white"
            >
              <div>
                {/* Drawer top: brand and close button */}
                <div className="flex h-14 items-center justify-between">
                  <Link
                    href="/"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    aria-label="Sebooth, ke beranda"
                    className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <Image src="/images/logo/sebooth-white.svg" alt="Sebooth Photobooth" width={72} height={30} unoptimized priority className="h-auto w-auto" style={{ height: 30 }} />
                  </Link>

                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    aria-label="Tutup Menu"
                    className="-mr-3 flex h-12 w-12 cursor-pointer items-center justify-center text-white transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white active:scale-95"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation list */}
                <nav aria-label="Navigasi utama" className="mt-4 flex flex-col">
                  {mobileNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => handleNavClick(item.href, item.name)}
                      className={`flex min-h-12 items-center font-bayon text-[2rem] leading-none uppercase transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-white ${
                        activeItem === item.name ? "text-secondary" : "text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer bottom: WhatsApp booking */}
              <a
                href={whatsappUrl(BOOKING_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="mt-6 flex min-h-14 items-center justify-center rounded-full bg-secondary px-6 text-[17px] font-bold text-blue-dark transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98]"
              >
                Booking via WhatsApp
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP ONLY: PLAIN TOP BAR (>= md screens)
          64px tall: every slide already reserves at least 80px at the top.
         ═══════════════════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 hidden bg-blue-dark px-10 text-white md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link
            href="/"
            onClick={() => setActiveItem("")}
            aria-label="Sebooth, ke beranda"
            className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Image src="/images/logo/sebooth-white.svg" alt="Sebooth Photobooth" width={86} height={36} unoptimized priority className="h-auto w-auto" style={{ height: 36 }} />
          </Link>

          <nav aria-label="Navigasi utama" className="flex items-center gap-4 lg:gap-7">
            {desktopNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick(item.href, item.name)}
                className={`font-bayon text-base uppercase transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:text-lg ${
                  activeItem === item.name ? "text-secondary" : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <a
            href={whatsappUrl(BOOKING_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full bg-secondary px-5 font-bayon text-base text-blue-dark uppercase transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98] lg:text-lg"
          >
            Book Now
          </a>
        </div>
      </header>
    </>
  );
}
