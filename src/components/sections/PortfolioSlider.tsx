"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ZoomIn, Heart, MessageCircle, Tag, MoreHorizontal, ChevronDown } from "lucide-react";
import { GALLERY_PINS, PortfolioPin } from "@/data/galleryPins";

const PINS: PortfolioPin[] = GALLERY_PINS;

interface PortfolioSliderProps {
  isActive?: boolean;
}

export function PortfolioSlider({ isActive = true }: PortfolioSliderProps) {
  const [selectedPin, setSelectedPin] = useState<PortfolioPin | null>(null);
  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [savedPins, setSavedPins] = useState<Record<string, boolean>>({});
  const [columnsCount, setColumnsCount] = useState(2);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

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

  // Greedy Height Balancing: Distributes pins across columns to eliminate any empty holes or blank spaces
  const columns = useMemo(() => {
    const cols: PortfolioPin[][] = Array.from({ length: columnsCount }, () => []);
    const heights = new Array(columnsCount).fill(0);

    PINS.forEach((pin) => {
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
  }, [columnsCount]);

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikesState((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleSavePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedPins((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
          PINTEREST MASONRY GRID (BALANCED MULTI-COLUMN WITH ZERO GAPS)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Scrollable Pinterest Wall Container (Unblocked Chaining) */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          data-scrollable="true"
          aria-label="Pinterest photo gallery wall"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full overflow-y-auto px-0.5 sm:px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [scroll-behavior:smooth] touch-pan-y"
        >
          {/* Authentic Height-Balanced Pinterest Flex Columns */}
          <div className="flex gap-3 sm:gap-4 pb-8 pt-1 w-full items-start">
            {columns.map((colPins, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
                {colPins.map((pin, idx) => {
                  const currentLikes = pin.likes + (likesState[pin.id] || 0);
                  const isSaved = !!savedPins[pin.id];

                  return (
                    <div
                      key={pin.id}
                      onClick={() => setSelectedPin(pin)}
                      style={{
                        contentVisibility: "auto",
                        containIntrinsicSize: "280px",
                      }}
                      className="group cursor-pointer block will-change-transform"
                    >
                      {/* ── PINTEREST PIN IMAGE CARD (ROUNDED-2XL FULL BLEED) ── */}
                      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <Image
                          src={pin.imageUrl}
                          alt={pin.title}
                          width={pin.width}
                          height={pin.height}
                          unoptimized
                          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, (max-width: 1536px) 20vw, 15vw"
                          className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                          loading={idx < 4 ? "eager" : "lazy"}
                          priority={colIdx === 0 && idx < 2}
                        />

                        {/* Subtle Hover Gradient Mask */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                        {/* ── TOP RIGHT PINTEREST SAVE RED BUTTON (HOVER) ── */}
                        <div className="absolute top-2.5 right-2.5 flex items-center justify-end z-20">
                          <button
                            onClick={(e) => handleSavePin(e, pin.id)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-black font-bayon uppercase tracking-wider transition-all duration-150 shadow-md flex items-center gap-1 cursor-pointer ${
                              isSaved
                                ? "bg-rose-600 text-white scale-105 opacity-100"
                                : "bg-[#E60023] hover:bg-[#ad081b] text-white opacity-0 group-hover:opacity-100 hover:scale-105"
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${isSaved ? "fill-white" : ""}`} />
                            <span>{isSaved ? "SIMPAN" : "SAVE"}</span>
                          </button>
                        </div>

                        {/* ── BOTTOM HOVER OVERLAY INFO (LIKE BUTTON & ZOOM PREVIEW) ── */}
                        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => handleLike(e, pin.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/85 text-[10.5px] font-bold text-white hover:text-rose-400 transition-colors shadow-sm"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>{currentLikes}</span>
                          </button>
                          <span className="px-2.5 py-1 rounded-full bg-black/85 text-[10px] font-black uppercase text-orange-400 flex items-center gap-1 shadow-sm">
                            <ZoomIn className="w-3 h-3" />
                            LIHAT
                          </span>
                        </div>
                      </div>

                      {/* ── PINTEREST PIN FOOTER (SHORT LABEL + THREE DOTS BUTTON) ── */}
                      <div className="flex items-start justify-between pt-1.5 px-0.5 text-slate-700">
                        <span className="text-[11px] font-medium text-slate-800 break-words leading-tight flex-1 pr-1">
                          {pin.title}
                        </span>
                        <button
                          aria-label="More options"
                          className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPin(pin);
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Next Slide CTA Card (Positioned after all 86 gallery photos) */}
          <div className="w-full py-8 sm:py-10 pb-16 flex flex-col items-center justify-center gap-2.5 text-center mt-4 mb-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Tertarik dengan hasil cetak Sebooth?
            </span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("sebooth:next-slide"))}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#FF2200] text-white font-black font-bayon uppercase tracking-wider text-base shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>LANJUT KE PRICING & PAKET</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PINTEREST LIGHTBOX DETAIL MODAL (HIGH-PERFORMANCE DIALOG)
         ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 bg-black/90">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform, opacity" }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-white [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/80 border border-white/20 text-white hover:bg-rose-600 transition-colors flex items-center justify-center cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Image Area */}
              <div className="relative w-full md:w-1/2 h-[320px] md:h-auto bg-slate-950 flex items-center justify-center p-4">
                <Image
                  src={selectedPin.imageUrl}
                  alt={selectedPin.title}
                  width={selectedPin.width}
                  height={selectedPin.height}
                  unoptimized
                  className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </div>

              {/* Right Detail Content Area */}
              <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between bg-slate-900 text-white">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black font-bayon uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedPin.category}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-bayon uppercase text-white leading-tight">
                    {selectedPin.title}
                  </h3>

                  <p className="text-sm font-semibold text-slate-300 mt-1">
                    Frame / Style: <span className="text-white font-bold">{selectedPin.frameType}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {selectedPin.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-orange-400" />
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4">
                    Hasil cetak photostrip thermal anti-air dengan resolusi tinggi, siap bikin acara kamu makin berkesan dan rame!
                  </p>
                </div>

                {/* Bottom WhatsApp Inquiry CTA */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2.5">
                  <a
                    href={`https://wa.me/6285713899441?text=Halo%20Sebooth,%20saya%20tertarik%20dengan%20frame%20portofolio%20"${encodeURIComponent(
                      selectedPin.title
                    )}"%20untuk%20acara%20saya!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white font-black font-bayon uppercase tracking-wider text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>REQUEST FRAME SEPERTI INI</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
