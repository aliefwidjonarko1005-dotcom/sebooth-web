"use client";

import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, MessageCircle, X } from "lucide-react";
import { GALLERY_PINS, PortfolioPin } from "@/data/galleryPins";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { whatsappUrl } from "@/config/social";
import { useModalFocus } from "@/lib/useModalFocus";

const PINS: PortfolioPin[] = GALLERY_PINS;

interface PortfolioSliderProps {
  isActive?: boolean;
}

export function PortfolioSlider({ isActive = true }: PortfolioSliderProps) {
  const [selectedPin, setSelectedPin] = useState<PortfolioPin | null>(null);
  const [columnsCount, setColumnsCount] = useState(2);
  // Progressive batch loading: load 24 pins initially, append 16 more on scroll for ultra-low initial data usage
  const [visibleCount, setVisibleCount] = useState(24);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const pinDialogRef = useRef<HTMLDivElement>(null);
  const closePin = useCallback(() => setSelectedPin(null), []);
  useModalFocus(selectedPin !== null, pinDialogRef, closePin);

  const visiblePins = useMemo(() => PINS.slice(0, visibleCount), [visibleCount]);

  // Responsive dynamic columns count detection
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1536) setColumnsCount(6);
      else if (w >= 1280) setColumnsCount(5);
      else if (w >= 1024) setColumnsCount(4);
      else if (w >= 640) setColumnsCount(3);
      else setColumnsCount(2);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Infinite scroll listener: dynamically appends photos as user scrolls near bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visibleCount >= PINS.length) return;
      const threshold = 450;
      const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
      if (nearBottom) {
        setVisibleCount((prev) => Math.min(PINS.length, prev + 16));
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [visibleCount]);

  // Greedy Height Balancing: Distributes pins across columns to eliminate any empty holes or blank spaces
  const columns = useMemo(() => {
    const cols: PortfolioPin[][] = Array.from({ length: columnsCount }, () => []);
    const heights = new Array(columnsCount).fill(0);

    visiblePins.forEach((pin) => {
      // Find the column with the minimum accumulated height
      let minIdx = 0;
      for (let i = 1; i < columnsCount; i++) {
        if (heights[i] < heights[minIdx]) {
          minIdx = i;
        }
      }
      cols[minIdx].push(pin);
      // Track column height by aspect ratio
      const ratio = (pin.height || 1200) / (pin.width || 800);
      heights[minIdx] += ratio;
    });

    return cols;
  }, [columnsCount, visiblePins]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || !scrollContainerRef.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const container = scrollContainerRef.current;

    // Near bottom and swiping UP (scrolling down further to advance slide)
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 35;
    if (isAtBottom && diff > 35) {
      window.dispatchEvent(new CustomEvent("sebooth:next-slide"));
    }

    // At top and swiping DOWN (scrolling up to go to previous slide)
    const isAtTop = container.scrollTop <= 15;
    if (isAtTop && diff < -35) {
      window.dispatchEvent(new CustomEvent("sebooth:prev-slide"));
    }
    touchStartY.current = null;
  };

  return (
    <section
      id="portfolio"
      className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-[#FFFFFF] text-slate-900 overflow-hidden select-none flex flex-col justify-between items-center px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 pt-[64px] xs:pt-[70px] sm:pt-18 md:pt-20 pb-2 sm:pb-3"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          MASONRY GRID (BALANCED MULTI-COLUMN WITH ZERO GAPS)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Scrollable Wall Container (Unblocked Chaining) */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          data-scrollable="true"
          aria-label="Galeri foto hasil Sebooth"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full overflow-y-auto px-0.5 sm:px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [scroll-behavior:smooth] touch-pan-y"
        >
          {/* Height-Balanced Flex Columns */}
          <div className="flex gap-3 sm:gap-4 pb-8 pt-1 w-full items-start">
            {columns.map((colPins, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
                {colPins.map((pin, idx) => (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setSelectedPin(pin)}
                    style={{
                      contentVisibility: "auto",
                      containIntrinsicSize: "280px",
                    }}
                    className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    <span
                      className="relative block w-full overflow-hidden rounded-lg bg-slate-100"
                      style={{
                        aspectRatio: `${pin.width || 800} / ${pin.height || 1200}`,
                      }}
                    >
                      <Image
                        src={pin.imageUrl}
                        alt={pin.title}
                        width={pin.width || 600}
                        height={pin.height || 900}
                        unoptimized
                        sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, (max-width: 1536px) 20vw, 15vw"
                        className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                        loading={colIdx === 0 && idx < 2 ? "eager" : "lazy"}
                        decoding="async"
                        priority={colIdx === 0 && idx < 1}
                      />
                    </span>
                    <span className="mt-1.5 block text-sm leading-snug font-medium text-blue-dark">
                      {pin.title}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Subtle Infinite Scroll Loading Indicator */}
          {visibleCount < PINS.length && (
            <div className="flex w-full items-center justify-center gap-2 py-4 text-sm font-medium text-slate-600">
              <SeboothLoader variant="mini" className="w-4 h-4 text-orange-500" />
              <span>Memuat foto lainnya ({visibleCount}/{PINS.length})...</span>
            </div>
          )}

          {/* Next-slide action, after all the gallery photos */}
          <div className="mx-auto mt-6 mb-8 flex max-w-xl flex-col items-center gap-3 pb-14 text-center">
            <p className="text-[17px] font-medium text-blue-dark">Tertarik dengan hasil cetak Sebooth?</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("sebooth:next-slide"))}
              className="inline-flex min-h-14 cursor-pointer items-center gap-2 rounded-full bg-secondary px-7 font-bayon text-xl text-blue-dark uppercase transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
            >
              Lanjut ke Pricing & Paket
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PHOTO DETAIL (PORTAL TO BODY TO ESCAPE SLIDE TRACK TRANSFORMS)
         ═══════════════════════════════════════════════════════════════════ */}
      {selectedPin &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            onClick={closePin}
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-blue-dark/80 md:items-center md:p-6"
          >
            <motion.div
              ref={pinDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pin-dialog-title"
              initial={{ y: 32 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[92svh] w-full flex-col overflow-y-auto rounded-t-2xl bg-primary text-white md:max-w-3xl md:flex-row md:rounded-2xl"
            >
              <button
                onClick={closePin}
                aria-label="Tutup detail foto"
                className="absolute top-2 right-2 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-dark text-white transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>

              <div className="flex w-full shrink-0 items-center justify-center bg-blue-dark p-4 md:w-1/2">
                <Image
                  src={selectedPin.hdUrl || selectedPin.imageUrl}
                  alt={selectedPin.title}
                  width={selectedPin.width}
                  height={selectedPin.height}
                  unoptimized
                  decoding="async"
                  priority
                  className="h-auto max-h-[52svh] w-auto max-w-full rounded-lg object-contain md:max-h-[75vh]"
                />
              </div>

              <div className="flex w-full flex-col justify-between gap-5 p-5 text-[17px] leading-relaxed md:w-1/2 md:p-6">
                <div>
                  <h3 id="pin-dialog-title" className="font-bayon text-[2rem] leading-[1.05] uppercase">
                    {selectedPin.title}
                  </h3>
                  <p className="mt-2">
                    Frame / Style: <span className="font-bold">{selectedPin.frameType}</span>
                  </p>
                  <p className="mt-3">
                    Hasil cetak photostrip thermal anti-air dengan resolusi tinggi, siap bikin acara kamu makin berkesan dan rame!
                  </p>
                  <p className="mt-3 text-sm text-white/80">
                    {selectedPin.tags.map((tag) => `#${tag}`).join(" ")}
                  </p>
                </div>

                <a
                  href={whatsappUrl(`Halo Sebooth, saya tertarik dengan frame portofolio "${selectedPin.title}" untuk acara saya!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-secondary px-5 text-center text-[17px] font-bold text-blue-dark transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98]"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Request frame seperti ini
                </a>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </section>
  );
}
