"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const mobileNavItems = [
  { name: "HOME", href: "/#hero" },
  { name: "PRODUCT", href: "/#product" },
  { name: "FRAMES", href: "/#frames" },
  { name: "GALLERY", href: "/#portfolio" },
  { name: "PRICING", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "PARTNERSHIP", href: "/partnership" },
  { name: "MY PHOTOS", href: "/profile" },
];

const desktopNavItems = [
  { name: "PRODUCT", href: "/#product" },
  { name: "PRICING", href: "/#pricing" },
  { name: "GALLERY", href: "/#portfolio" },
  { name: "PARTNERSHIP", href: "/partnership" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock body scroll when mobile side drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  const handleNavClick = (href: string, name: string) => {
    setActiveItem(name);
    setIsMobileDrawerOpen(false);

    // If on homepage and linking to a slide hash, trigger smooth jump or hash change
    if (pathname === "/" && href.startsWith("/#")) {
      const hash = href.replace("/#", "");
      const targetElement = document.getElementById(hash) || document.getElementById(`slide-${hash}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE ONLY: TOP-LEFT FLOATING HAMBURGER BUTTON (STRIP 3)
          Leaves 100% of slide titles completely unobstructed & visible!
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-3.5 left-3.5 z-50 md:hidden flex items-center gap-2">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Buka Menu Navigasi"
          className="w-11 h-11 rounded-full bg-black/65 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-95 hover:bg-black/85 transition-all cursor-pointer group"
        >
          <Menu className="w-5 h-5 text-white group-hover:text-[#FF5500] transition-colors" />
        </button>

        {/* Small Brand Pill Next to Hamburger */}
        <Link
          href="/"
          className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-lg border border-white/15 text-white font-black font-bayon text-lg uppercase tracking-wide flex items-center shadow-md"
        >
          <span>SEBOOTH</span>
          <span className="text-[#FF4500] ml-0.5">.</span>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE ONLY: ULTRA-FAST GLASSMORPHISM SIDE-DRAWER
         ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-[9998] md:hidden">
            {/* Smooth Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            />

            {/* Left Slide-out Drawer (Hardware Accelerated Glassmorphism) */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
              className="relative w-[78vw] max-w-[290px] h-full bg-black/85 backdrop-blur-2xl border-r border-white/20 shadow-[20px_0_60px_rgba(0,0,0,0.85)] p-5 flex flex-col justify-between text-white overflow-y-auto [transform:translate3d(0,0,0)]"
            >
              {/* Drawer Top: Brand & Close Button */}
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-white/15 mb-3">
                  <Link
                    href="/"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="text-2xl font-black font-bayon uppercase tracking-wider text-white flex items-center"
                  >
                    <span>SEBOOTH</span>
                    <span className="text-[#FF4500] ml-0.5">.</span>
                  </Link>

                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    aria-label="Tutup Menu"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all active:scale-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Minimalist Glassmorphism Navigation Items List (No Icons / No Subtitles) */}
                <nav className="flex flex-col gap-1.5 py-1">
                  {mobileNavItems.map((item) => {
                    const isActive = activeItem === item.name;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => handleNavClick(item.href, item.name)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 border text-left ${
                          isActive
                            ? "bg-white/20 border-white/35 text-white font-black shadow-md backdrop-blur-md"
                            : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/80 hover:text-white"
                        }`}
                      >
                        <span className="text-base xs:text-lg font-bayon uppercase tracking-wider">
                          {item.name}
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Bottom: WhatsApp Booking Glass CTA */}
              <div className="pt-3 mt-2 border-t border-white/15">
                <a
                  href="https://wa.me/6285713899441?text=Halo%20Sebooth,%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya!"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-black font-bayon uppercase tracking-wider text-sm xs:text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <span>BOOKING VIA WHATSAPP</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP ONLY: FLOATING CENTER PILL HEADER (>= md screens)
         ═══════════════════════════════════════════════════════════════════ */}
      <header
        className={`hidden md:block fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-5xl z-50 rounded-full border border-white/20 shadow-2xl transition-all duration-300 ${
          isScrolled
            ? "py-2.5 bg-black/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "py-3.5 bg-black/40 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Dynamic Glass Shine Keyframe Animation Overlay */}
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full pointer-events-none z-[-1]">
          <div className="absolute top-0 -left-[150%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-20 animate-shimmer" />
        </div>

        <div className="w-full px-7 flex items-center justify-between relative z-10">
          {/* Brand Text Logo with Vibrant Accent */}
          <Link
            href="/"
            onClick={() => setActiveItem("")}
            className="text-3xl font-black text-white uppercase tracking-tight font-bayon flex items-center hover:opacity-90 transition-opacity"
          >
            <span>sebooth</span>
            <span className="text-[#FF4500] ml-0.5">.</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="flex gap-1.5 items-center">
            {desktopNavItems.map((item) => {
              const isActive = activeItem === item.name;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveItem(item.name)}
                  className={`font-extrabold text-[0.82rem] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#FF4500] text-white shadow-[0_0_16px_rgba(255,69,0,0.6)] scale-105"
                      : "text-white/85 hover:text-white hover:bg-white/15"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-white/25 mx-2" />

            {/* My Photos Link */}
            <Link
              href="/profile"
              onClick={() => setActiveItem("MY PHOTOS")}
              className={`font-black text-[0.82rem] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 ${
                activeItem === "MY PHOTOS"
                  ? "bg-[#FF4500] text-white shadow-[0_0_16px_rgba(255,69,0,0.6)] scale-105"
                  : "text-[#D4AF37] hover:text-white hover:bg-white/15"
              }`}
            >
              MY PHOTOS
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/6285713899441?text=Halo%20Sebooth,%20saya%20ingin%20booking%20photobooth!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-black text-[0.82rem] uppercase tracking-wider px-5 py-2 rounded-full bg-[#FF4500] text-white hover:bg-[#e03d00] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,69,0,0.4)] border border-white/20"
            >
              <span>BOOK NOW</span>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

