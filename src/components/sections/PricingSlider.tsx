"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookingTicket } from "@/components/features/BookingTicket";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Music,
  Smile,
} from "lucide-react";
import { DetailedPackage, PackageType } from "./pricing/pricingPackages";
import { DesktopPricingStage } from "./pricing/DesktopPricingStage";
import { MobilePricingStage } from "./pricing/MobilePricingStage";

interface PricingSliderProps {
  isActive?: boolean;
}

export function PricingSlider({ isActive = true }: PricingSliderProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [ticketPkg, setTicketPkg] = useState<DetailedPackage | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [clickCoord, setClickCoord] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const [swipeRipple, setSwipeRipple] = useState<{
    id: number;
    colorClass: string;
    direction: "left" | "right";
  } | null>(null);

  const handleMobileSlideChange = (targetSlide: number, direction: "left" | "right") => {
    // Exact matching background gradient classes of the destination target slide
    let colorGradient = "bg-[#002366]"; // Slide 1 (Center Hero Overview)
    if (targetSlide === 0) {
      colorGradient = "bg-blue-dark"; // Slide 0 (All You Can Photo)
    } else if (targetSlide === 2) {
      colorGradient = "bg-blue-dark"; // Slide 2 (Batch Booking)
    }

    setSwipeRipple({
      id: Date.now(),
      colorClass: colorGradient,
      direction: direction,
    });

    setActiveSlide(targetSlide);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        const nextIdx = activeSlide < 2 ? activeSlide + 1 : 0;
        handleMobileSlideChange(nextIdx, "right");
      } else {
        const prevIdx = activeSlide > 0 ? activeSlide - 1 : 2;
        handleMobileSlideChange(prevIdx, "left");
      }
    }
    touchStartX.current = null;
  };

  const handleSelectPackage = (pkg: PackageType, event?: React.MouseEvent) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setClickCoord({
        x: Math.round(((rect.left + rect.width / 2) / window.innerWidth) * 100),
        y: Math.round(((rect.top + rect.height / 2) / window.innerHeight) * 100),
      });
    } else {
      setClickCoord({
        x: pkg === "all-you-can" ? 25 : 75,
        y: 50,
      });
    }

    setSelectedPackage(pkg);
    if (pkg === "all-you-can") setSelectedTierId("ayc-2");
    else setSelectedTierId("batch-2");
  };

  const handleBackToOverview = () => {
    setSelectedPackage(null);
  };

  const isAllYouCan = selectedPackage === "all-you-can";
  const isBatch = selectedPackage === "batch-booking";

  // Dynamic background color based on selectedPackage (Detail Mode) OR activeSlide (Mobile Overview Mode)
  const isAllYouCanActive = isAllYouCan || (!selectedPackage && activeSlide === 0);
  const isBatchActive = isBatch || (!selectedPackage && activeSlide === 2);

  const currentBgColor = isAllYouCanActive || isBatchActive ? "var(--color-blue-dark)" : "var(--color-primary)";

  // Helper to determine semi-circle button colors and targets based on activeSlide
  const getSideButtonConfig = (direction: "left" | "right") => {
    if (activeSlide === 1) {
      // Center slide: Left points to All You Can (Amber), Right points to Batch (Teal)
      return direction === "left"
        ? { colorClass: "bg-[#FF4500]", borderClass: "border-white/30", target: 0 }
        : { colorClass: "bg-[#002366]", borderClass: "border-white/30", target: 2 };
    }
    if (activeSlide === 0) {
      // All You Can slide: Left points to Batch (Teal), Right points to Center (Royal Blue)
      return direction === "left"
        ? { colorClass: "bg-[#002366]", borderClass: "border-white/30", target: 2 }
        : { colorClass: "bg-[#002366]", borderClass: "border-blue-200/60", target: 1 };
    }
    // Batch slide: Left points to Center (Royal Blue), Right points to All You Can (Amber)
    return direction === "left"
      ? { colorClass: "bg-[#002366]", borderClass: "border-blue-200/60", target: 1 }
      : { colorClass: "bg-[#FF4500]", borderClass: "border-white/30", target: 0 };
  };

  const leftBtnConfig = getSideButtonConfig("left");
  const rightBtnConfig = getSideButtonConfig("right");

  return (
    <section
      id="pricing"
      className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] text-slate-900 overflow-hidden select-none flex flex-col justify-between items-center px-3 sm:px-6 md:px-8 pt-14 sm:pt-18 md:pt-20 pb-3 sm:pb-5 transition-colors duration-500"
      style={{
        backgroundColor: currentBgColor,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── HIGH PERFORMANCE GPU RIPPLE WIPE (CARD SELECTION) ── */}
      <AnimatePresence>
        {selectedPackage && (
          <motion.div
            key={`gpu-ripple-${selectedPackage}`}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 4.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: `${clickCoord.x}%`,
              top: `${clickCoord.y}%`,
              willChange: "transform",
            }}
            className={`absolute w-[120vmax] h-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 ${
              isAllYouCan
                ? "bg-blue-dark"
                : "bg-blue-dark"
            }`}
          />
        )}
      </AnimatePresence>

      {/* ── MOBILE SIDE SWIPE GPU RIPPLE WIPE (PORTAL TO DOCUMENT.BODY AT Z-INDEX 9999) ── */}
      {typeof window !== "undefined" &&
        swipeRipple &&
        createPortal(
          <AnimatePresence mode="wait">
            <motion.div
              key={`swipe-ripple-${swipeRipple.id}`}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.2, 0.9, 0.3, 1] }}
              onAnimationComplete={() => {
                setTimeout(() => setSwipeRipple(null), 50);
              }}
              style={{
                position: "fixed",
                left: swipeRipple.direction === "left" ? "0px" : "100vw",
                top: "50vh",
                width: "160vmax",
                height: "160vmax",
                marginLeft: "-80vmax",
                marginTop: "-80vmax",
                borderRadius: "9999px",
                pointerEvents: "none",
                willChange: "transform",
                zIndex: 9999,
              }}
              className={swipeRipple.colorClass}
            />
          </AnimatePresence>,
          document.body
        )}

      {/* Dynamic Base Gradient Layer */}
      {!selectedPackage && (
        <div
          className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${
            isAllYouCanActive
              ? "bg-blue-dark"
              : isBatchActive
              ? "bg-blue-dark"
              : "bg-[#002366]"
          }`}
        />
      )}

      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-white/12 via-transparent to-transparent pointer-events-none z-0" />

      {/* ── BACKGROUND VECTOR DOODLES ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute top-[8%] left-[23%] text-white">
          <Music className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="absolute top-[12%] left-[27%] text-white">
          <Music className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="absolute top-[7%] left-[41%] text-white">
          <Music className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="absolute top-[15%] left-[5%] w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
          <Heart className="w-5 h-5 fill-white text-white" />
        </div>
        <div className="absolute top-[17%] right-[6%] w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
          <Smile className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="absolute top-[36%] left-[8%] text-white">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* ── MAIN STAGE CONTAINER ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex items-center justify-center px-1 sm:px-4 my-auto overflow-visible md:overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════════
            DESKTOP STAGE
           ═══════════════════════════════════════════════════════════════════ */}
        <DesktopPricingStage
          selectedPackage={selectedPackage}
          isAllYouCan={isAllYouCan}
          isBatch={isBatch}
          selectedTierId={selectedTierId}
          setSelectedTierId={setSelectedTierId}
          setTicketPkg={setTicketPkg}
          handleSelectPackage={handleSelectPackage}
          handleBackToOverview={handleBackToOverview}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE STAGE
           ═══════════════════════════════════════════════════════════════════ */}
        <MobilePricingStage
          selectedPackage={selectedPackage}
          isAllYouCan={isAllYouCan}
          isBatch={isBatch}
          selectedTierId={selectedTierId}
          setSelectedTierId={setSelectedTierId}
          setTicketPkg={setTicketPkg}
          handleSelectPackage={handleSelectPackage}
          handleBackToOverview={handleBackToOverview}
          activeSlide={activeSlide}
          setActiveSlide={setActiveSlide}
        />
      </div>

      {/* ── MOBILE FLUSH SCREEN-EDGE SEMI-CIRCLE SWIPE CUES (VERTICALLY CENTERED) ── */}
      {!selectedPackage && (
        <>
          {/* Left Semi-Circle (Flush Left Screen Boundary - Vertically Centered) */}
          <button
            onClick={() => handleMobileSlideChange(leftBtnConfig.target, "left")}
            aria-label="Previous Package Card"
            className={`md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-50 w-8 xs:w-9 sm:w-10 h-16 xs:h-18 sm:h-20 rounded-r-full ${leftBtnConfig.colorClass} border-y-2 border-r-2 ${leftBtnConfig.borderClass} shadow-[0_6px_20px_rgba(0,0,0,0.45)] flex items-center justify-start pl-0.5 xs:pl-1 text-white active:scale-90 transition-all cursor-pointer animate-pulse`}
          >
            <ChevronLeft className="w-5 h-5 xs:w-6 xs:h-6 stroke-[3.5] drop-shadow-md" />
          </button>

          {/* Right Semi-Circle (Flush Right Screen Boundary - Vertically Centered) */}
          <button
            onClick={() => handleMobileSlideChange(rightBtnConfig.target, "right")}
            aria-label="Next Package Card"
            className={`md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-50 w-8 xs:w-9 sm:w-10 h-16 xs:h-18 sm:h-20 rounded-l-full ${rightBtnConfig.colorClass} border-y-2 border-l-2 ${rightBtnConfig.borderClass} shadow-[0_6px_20px_rgba(0,0,0,0.45)] flex items-center justify-end pr-0.5 xs:pr-1 text-white active:scale-90 transition-all cursor-pointer animate-pulse`}
          >
            <ChevronRight className="w-5 h-5 xs:w-6 xs:h-6 stroke-[3.5] drop-shadow-md" />
          </button>
        </>
      )}
      <BookingTicket pkg={ticketPkg} onClose={() => setTicketPkg(null)} />
    </section>
  );
}
