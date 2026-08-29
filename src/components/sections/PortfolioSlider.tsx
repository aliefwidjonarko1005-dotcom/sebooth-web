"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ZoomIn, Heart, MessageCircle, Tag, MoreHorizontal, ChevronDown } from "lucide-react";

interface PortfolioPin {
  id: string;
  title: string;
  category: string;
  frameType: string;
  imageUrl: string;
  width: number;
  height: number;
  tags: string[];
  likes: number;
  aspectClass?: string; // Natural Pinterest aspect ratios
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTIC PINTEREST FEED (STAGGERED 2-COLUMN MOBILE & MULTI-COLUMN DESKTOP)
// Exactly like native Pinterest app: pure rounded images with bottom ••• action
// ═══════════════════════════════════════════════════════════════════════════
const PINS: PortfolioPin[] = [
  // 1. Medium Portrait Poster (3:4) - Left Column Top
  {
    id: "pin-1",
    title: "Golden Hour Romance",
    category: "WEDDING VIBES",
    frameType: "Pre-Wedding & Photobooth",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    width: 800,
    height: 1067,
    tags: ["Wedding", "Sunset", "Romantic"],
    likes: 615,
  },
  // 2. Tall Character Poster / Photostrip (1:2.2) - Right Column Top
  {
    id: "pin-2",
    title: "Black Velvet Gold Luxury",
    category: "PHOTOSTRIP 2x6",
    frameType: "Classic Elegance Gold Foil",
    imageUrl: "/images/frames/1.1.png",
    width: 600,
    height: 1600,
    tags: ["Gold", "Velvet", "Photostrip", "VIP"],
    likes: 342,
  },
  // 3. Square Sticker / Candid (1:1) - Left Column
  {
    id: "pin-3",
    title: "Funky Friends Party Props",
    category: "PARTY CANDID",
    frameType: "All You Can Photo Booth",
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop",
    width: 800,
    height: 800,
    tags: ["Party", "Props", "Fun", "Candid"],
    likes: 284,
  },
  // 4. Extra-Tall Staggered Strip (1:2.8) - Right Column
  {
    id: "pin-4",
    title: "BEM FT Ocean Wave Undip",
    category: "PHOTOSTRIP 2x6",
    frameType: "Campus Event Blue Edition",
    imageUrl: "/images/frames/4.1.png",
    width: 600,
    height: 1850,
    tags: ["Campus", "Undip", "Teal", "Photostrip"],
    likes: 276,
  },
  // 5. 4-Grid Quad Photo Split (1:1.1) - Left Column
  {
    id: "pin-5",
    title: "Class of 2026 Graduation Splash",
    category: "GRADUATION",
    frameType: "High School & College Booth",
    imageUrl: "/images/frames/10.3.png",
    width: 800,
    height: 900,
    tags: ["Graduation", "Friends", "Memories"],
    likes: 298,
  },
  // 6. Wide Postcard 4R (4:3) - Right Column
  {
    id: "pin-6",
    title: "Royal Emerald Wedding Reception",
    category: "POSTCARD 4R",
    frameType: "Landscape Postcard 4x6",
    imageUrl: "/images/frames/9.1.png",
    width: 1800,
    height: 1250,
    tags: ["Wedding", "Emerald", "Postcard 4R"],
    likes: 520,
  },
  // 7. Graphic Design Blue Poster (1:1.2) - Left Column
  {
    id: "pin-7",
    title: "Midnight Tokyo Cyberpunk 4R",
    category: "POSTCARD 4R",
    frameType: "Horizontal Postcard Dark Glow",
    imageUrl: "/images/frames/14.1.png",
    width: 1800,
    height: 1200,
    tags: ["Cyberpunk", "Tokyo", "Postcard 4R"],
    likes: 820,
  },
  // 8. Korean Pastel 4-Cut (1:2.4) - Right Column
  {
    id: "pin-8",
    title: "Korean 4-Cut Pastel Dreams",
    category: "PHOTOSTRIP 2x6",
    frameType: "Soft Cloud Blue 4-Cut",
    imageUrl: "/images/frames/2.1.png",
    width: 600,
    height: 1700,
    tags: ["Korean", "Pastel", "4-Cut"],
    likes: 389,
  },
  // 9. Party Night Neon Flash (3:4)
  {
    id: "pin-9",
    title: "Neon Cyber Party Night",
    category: "PARTY CANDID",
    frameType: "Glow & Props Booth",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    width: 800,
    height: 1067,
    tags: ["Neon", "Gen-Z", "Party", "Nightlife"],
    likes: 418,
  },
  // 10. Botanical Gold Postcard (4:3)
  {
    id: "pin-10",
    title: "Floral Watercolor Wedding 4R",
    category: "POSTCARD 4R",
    frameType: "Postcard Botanical Gold",
    imageUrl: "/images/frames/9.2.png",
    width: 1800,
    height: 1200,
    tags: ["Wedding", "Botanical", "Watercolor"],
    likes: 388,
  },
  // 11. Sweet 17 Baby Pink (1:2.6)
  {
    id: "pin-11",
    title: "Sweet 17 Pink Ribbon & Confetti",
    category: "PHOTOSTRIP 2x6",
    frameType: "Baby Pink Glossy Strip",
    imageUrl: "/images/frames/5.1.png",
    width: 600,
    height: 1800,
    tags: ["Sweet17", "Pink", "Sparkle"],
    likes: 472,
  },
  // 12. Corporate Brand Watermark 4R (4:3)
  {
    id: "pin-12",
    title: "Tech Summit Corporate Gala",
    category: "POSTCARD 4R",
    frameType: "Custom Brand Watermark 4R",
    imageUrl: "/images/frames/12.1.png",
    width: 1800,
    height: 1200,
    tags: ["Corporate", "Tech", "Postcard 4R"],
    likes: 195,
  },
  // 13. Minimalist Modern Black Strip (1:2.7)
  {
    id: "pin-13",
    title: "Minimalist Modern Black Frame",
    category: "PHOTOSTRIP 2x6",
    frameType: "High Contrast Minimalist Strip",
    imageUrl: "/images/frames/10.1.png",
    width: 600,
    height: 1850,
    tags: ["Minimalist", "Black", "Photostrip"],
    likes: 405,
  },
  // 14. Retro Monochrome Grain Portrait (4:5)
  {
    id: "pin-14",
    title: "Retro Monochrome B&W Film",
    category: "ANALOG VIBES",
    frameType: "Classic B&W Grain Strip",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    width: 800,
    height: 1000,
    tags: ["Monochrome", "Vintage", "Film"],
    likes: 367,
  },
  // 15. Sunset Orange Fiery Beats (1:2.5)
  {
    id: "pin-15",
    title: "Sunset Orange Beats & Bass",
    category: "PHOTOSTRIP 2x6",
    frameType: "Fiery Sunset Duo Strip",
    imageUrl: "/images/frames/6.1.png",
    width: 600,
    height: 1750,
    tags: ["Orange", "Music", "Photostrip"],
    likes: 310,
  },
  // 16. Luxury Gold Leaf Postcard (4:3)
  {
    id: "pin-16",
    title: "Elegant Gold Leaf Postcard 4R",
    category: "POSTCARD 4R",
    frameType: "Horizontal Luxury Postcard",
    imageUrl: "/images/frames/13.1.png",
    width: 1800,
    height: 1200,
    tags: ["Luxury", "Gold", "Postcard 4R"],
    likes: 467,
  },
  // 17. Live Concert Festival Crowd (1:1)
  {
    id: "pin-17",
    title: "Outdoor Music Festival Summer",
    category: "EVENT LIVE",
    frameType: "Festival Stage Photobooth",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    width: 800,
    height: 800,
    tags: ["Festival", "Summer", "Crowd"],
    likes: 339,
  },
  // 18. Retro 90s Synthwave Arcade (1:2.7)
  {
    id: "pin-18",
    title: "Retro 90s Arcade Neon",
    category: "PHOTOSTRIP 2x6",
    frameType: "Synthwave Duo Frame",
    imageUrl: "/images/frames/6.4.png",
    width: 600,
    height: 1850,
    tags: ["Arcade", "90s", "Neon", "Retro"],
    likes: 295,
  },
  // 19. Vintage Japanese Kyoto Postcard (4:3)
  {
    id: "pin-19",
    title: "Vintage Japanese Kyoto Style 4R",
    category: "POSTCARD 4R",
    frameType: "Nostalgic Travel Postcard",
    imageUrl: "/images/frames/14.2.png",
    width: 1800,
    height: 1200,
    tags: ["Japan", "Kyoto", "Postcard 4R"],
    likes: 442,
  },
  // 20. University Special Gold Strip (1:2.5)
  {
    id: "pin-20",
    title: "Golden Hour Graduation Squad",
    category: "PHOTOSTRIP 2x6",
    frameType: "University Special 2x6",
    imageUrl: "/images/frames/11.1.png",
    width: 600,
    height: 1750,
    tags: ["Graduation", "Gold", "Photostrip"],
    likes: 429,
  },
  // 21. Glamour Prom Evening Gown (4:5)
  {
    id: "pin-21",
    title: "Glamour Prom Night Memories",
    category: "WEDDING & DRESS",
    frameType: "Sparkling Glitter Backdrop",
    imageUrl: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop",
    width: 800,
    height: 1000,
    tags: ["Prom", "Dress", "Glamour"],
    likes: 512,
  },
  // 22. Korean Lavender Aesthetic 4-Cut (1:2.4)
  {
    id: "pin-22",
    title: "Pastel Lavender Dreams 4-Cut",
    category: "PHOTOSTRIP 2x6",
    frameType: "Korean Lavender Aesthetic",
    imageUrl: "/images/frames/2.2.png",
    width: 600,
    height: 1700,
    tags: ["Lavender", "Korean", "Photostrip"],
    likes: 374,
  },
  // 23. Editorial Classic Monochrome Strip (1:2.8)
  {
    id: "pin-23",
    title: "Classic Monochrome Portrait Strip",
    category: "PHOTOSTRIP 2x6",
    frameType: "Editorial B&W Strip",
    imageUrl: "/images/frames/10.2.png",
    width: 600,
    height: 1850,
    tags: ["B&W", "Editorial", "Monochrome"],
    likes: 360,
  },
  // 24. Summer Pop Colors Duo Strip (1:2.5)
  {
    id: "pin-24",
    title: "Summer Pop Festival Music Strip",
    category: "PHOTOSTRIP 2x6",
    frameType: "Pop Summer Duo Edition",
    imageUrl: "/images/frames/6.2.png",
    width: 600,
    height: 1750,
    tags: ["Music", "Pop", "Summer"],
    likes: 325,
  },
];

interface PortfolioSliderProps {
  isActive?: boolean;
}

export function PortfolioSlider({ isActive = true }: PortfolioSliderProps) {
  const [selectedPin, setSelectedPin] = useState<PortfolioPin | null>(null);
  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [savedPins, setSavedPins] = useState<Record<string, boolean>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

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
          PINTEREST MASONRY GRID (AUTHENTIC PINTEREST FEED APP LAYOUT)
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
          {/* Authentic Pinterest Column Stagger */}
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 sm:gap-4 pb-8 pt-1">
            {PINS.map((pin, idx) => {
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
                  className="break-inside-avoid mb-3 sm:mb-4 group cursor-pointer block will-change-transform"
                >
                  {/* ── PINTEREST PIN IMAGE CARD (ROUNDED-2XL FULL BLEED) ── */}
                  <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <Image
                      src={pin.imageUrl}
                      alt={pin.title}
                      width={pin.width}
                      height={pin.height}
                      quality={70}
                      sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, (max-width: 1536px) 20vw, 15vw"
                      className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                      loading={idx < 8 ? "eager" : "lazy"}
                      priority={idx < 4}
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
            {/* Bottom Next Slide CTA Card */}
            <div className="break-inside-avoid col-span-full w-full py-8 flex flex-col items-center justify-center gap-2.5 text-center mt-3 mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                Tertarik dengan hasil cetak Sebooth?
              </span>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("sebooth:next-slide"))}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#FF2200] text-white font-black font-bayon uppercase tracking-wider text-sm shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>LANJUT KE PRICING & PAKET</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
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
                  quality={85}
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
