"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Music,
  Camera,
  Users,
  Clock,
  Calendar,
  Infinity as InfinityIcon,
  CheckCircle2,
  MessageCircle,
  ArrowUpRight,
  Smile,
  ArrowLeft,
  QrCode,
  Frame,
  UserCheck,
  PartyPopper,
  Zap,
} from "lucide-react";

export type PackageType = "all-you-can" | "batch-booking";

export interface DetailedPackage {
  id: string;
  name: string;
  category: PackageType;
  durationOrQuota: string;
  price: string;
  badge?: string;
  features: string[];
  waText: string;
}

const DETAILED_PACKAGES: Record<PackageType, DetailedPackage[]> = {
  "all-you-can": [
    {
      id: "ayc-1",
      name: "Unlimited 2 Jam",
      category: "all-you-can",
      durationOrQuota: "2 Jam Non-stop",
      price: "",
      badge: "POPULER",
      features: [
        "Cetak Instan Sepuasnya Selama 2 Jam",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design & Branding",
        "2 Crew Staff Professional On-Site",
        "Fun Funky Props Box & Accessories",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket All You Can Photo - Unlimited 2 Jam nih!",
    },
    {
      id: "ayc-2",
      name: "Unlimited 3 Jam",
      category: "all-you-can",
      durationOrQuota: "3 Jam Non-stop",
      price: "",
      badge: "PALING LAKU 🔥",
      features: [
        "Cetak Sepuasnya 3 Jam Penuh",
        "Softfile HD, GIF & Live QR Download",
        "Custom Frame Branding + Free Backdrop",
        "2 Crew Staff On-Site Full Support",
        "Fun Props Box & Premium Lighting",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket All You Can Photo - Unlimited 3 Jam nih!",
    },
    {
      id: "ayc-3",
      name: "Unlimited 5 Jam",
      category: "all-you-can",
      durationOrQuota: "5 Jam Penuh Event",
      price: "",
      badge: "VIP ULTIMATE",
      features: [
        "Cetak Sepuasnya Full 5 Jam Acara",
        "Full HD Softfile, GIF & Boomerang",
        "Exclusive Custom Frame & Custom Backdrop",
        "VIP Dedicated Crew & Priority Queue",
        "Complete Props Collection",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket All You Can Photo - Unlimited 5 Jam nih!",
    },
    {
      id: "ayc-4",
      name: "Custom Durasi",
      category: "all-you-can",
      durationOrQuota: "Custom / Full Day",
      price: "",
      badge: "VIP CUSTOM",
      features: [
        "Cetak Sepuasnya Full Day / Multi-Day",
        "Full HD Softfile, GIF & Boomerang",
        "Exclusive Custom Frame & Custom Backdrop",
        "VIP Dedicated Staff & Priority Queue",
        "Complete Props Collection",
      ],
      waText: "Halo Sebooth, saya mau konsultasi paket All You Can Photo durasi custom / full day untuk acara saya nih!",
    },
  ],
  "batch-booking": [
    {
      id: "batch-1",
      name: "100 Prints",
      category: "batch-booking",
      durationOrQuota: "100 Lembar",
      price: "",
      badge: "PALING HEMAT",
      features: [
        "Cetak Instan Photostrip",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket Batch Booking - 100 Prints nih!",
    },
    {
      id: "batch-2",
      name: "200 Prints",
      category: "batch-booking",
      durationOrQuota: "200 Lembar",
      price: "",
      badge: "REKOMENDASI 🔥",
      features: [
        "Cetak Instan Photostrip",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket Batch Booking - 200 Prints nih!",
    },
    {
      id: "batch-3",
      name: "300 Prints",
      category: "batch-booking",
      durationOrQuota: "300 Lembar",
      price: "",
      badge: "POPULER",
      features: [
        "Cetak Instan Photostrip",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket Batch Booking - 300 Prints nih!",
    },
    {
      id: "batch-4",
      name: "> 300 Prints",
      category: "batch-booking",
      durationOrQuota: "Custom >300 Lembar",
      price: "",
      badge: "EVENT AKBAR",
      features: [
        "Cetak Instan Photostrip Custom Sesuai Kebutuhan",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau konsultasi kuota lebih dari 300 prints untuk event saya nih!",
    },

  ],
};

const waBase = "https://wa.me/6285713899441?text=";

interface PricingSliderProps {
  isActive?: boolean;
}

export function PricingSlider({ isActive = true }: PricingSliderProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [activeSlide, setActiveSlide] = useState(1);
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
    let colorGradient = "bg-gradient-to-b from-[#1E50D8] via-[#0239A0] to-[#001D66]"; // Slide 1 (Center Hero Overview)
    if (targetSlide === 0) {
      colorGradient = "bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#B45309]"; // Slide 0 (All You Can Photo)
    } else if (targetSlide === 2) {
      colorGradient = "bg-gradient-to-b from-[#14B8A6] via-[#0D9488] to-[#0F5550]"; // Slide 2 (Batch Booking)
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

  const currentBgColor = isAllYouCanActive ? "#F59E0B" : isBatchActive ? "#0D9488" : "#0239A0";

  // Helper to determine semi-circle button colors and targets based on activeSlide
  const getSideButtonConfig = (direction: "left" | "right") => {
    if (activeSlide === 1) {
      // Center slide: Left points to All You Can (Amber), Right points to Batch (Teal)
      return direction === "left"
        ? { colorClass: "bg-gradient-to-r from-[#FF851B] to-[#FF6200]", borderClass: "border-orange-200/60", target: 0 }
        : { colorClass: "bg-gradient-to-r from-[#14B8A6] to-[#0D9488]", borderClass: "border-teal-200/60", target: 2 };
    }
    if (activeSlide === 0) {
      // All You Can slide: Left points to Batch (Teal), Right points to Center (Royal Blue)
      return direction === "left"
        ? { colorClass: "bg-gradient-to-r from-[#14B8A6] to-[#0D9488]", borderClass: "border-teal-200/60", target: 2 }
        : { colorClass: "bg-gradient-to-r from-[#0A4DBF] to-[#0239A0]", borderClass: "border-blue-200/60", target: 1 };
    }
    // Batch slide: Left points to Center (Royal Blue), Right points to All You Can (Amber)
    return direction === "left"
      ? { colorClass: "bg-gradient-to-r from-[#0A4DBF] to-[#0239A0]", borderClass: "border-blue-200/60", target: 1 }
      : { colorClass: "bg-gradient-to-r from-[#FF851B] to-[#FF6200]", borderClass: "border-orange-200/60", target: 0 };
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
                ? "bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706]"
                : "bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E]"
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
              ? "bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#B45309]"
              : isBatchActive
              ? "bg-gradient-to-b from-[#14B8A6] via-[#0D9488] to-[#0F766E]"
              : "bg-gradient-to-b from-[#0A4DBF] via-[#0239A0] to-[#01256B]"
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
        <div className="hidden md:flex items-center justify-center w-full max-w-5xl h-full py-1 relative">
          <AnimatePresence mode="wait">
            {/* ── STAGE 1: 3-CARD OVERVIEW ── */}
            {!selectedPackage ? (
              <motion.div
                key="desktop-overview-view"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex items-center justify-center gap-5 lg:gap-7 xl:gap-8 w-full"
              >
                {/* ── CARD 1: ALL YOU CAN PHOTO ── */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => handleSelectPackage("all-you-can", e)}
                  className="relative w-[275px] lg:w-[305px] xl:w-[325px] h-[450px] lg:h-[485px] xl:h-[510px] flex flex-col justify-between shrink-0 drop-shadow-[0_15px_25px_rgba(0,0,0,0.22)] cursor-pointer group"
                >
                  <Image
                    src="/images/slides/slide4/all-you-can-photo-pckg.png"
                    alt="All You Can Photo Package Card"
                    fill
                    unoptimized
                    sizes="340px"
                    className="object-contain pointer-events-none select-none"
                    priority
                  />

                  <div className="relative z-10 mt-auto mb-[34px] lg:mb-[40px] xl:mb-[44px] w-full px-6 lg:px-7 flex flex-col items-center text-center">
                    <h3 className="text-xl lg:text-2xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                      All You Can Photo
                    </h3>
                    <p className="text-[9.5px] lg:text-[10.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[200px] lg:max-w-[215px]">
                      Foto sepuasnya tanpa mikir kuota! Bebas berekspresi sepuasnya, cocok banget untuk acara yang tamunya suka foto.
                    </p>

                    <div className="w-full max-w-[190px] lg:max-w-[210px] space-y-0.5 my-1 lg:my-1.5 text-left">
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <InfinityIcon className="w-3.5 h-3.5 text-amber-500 stroke-[2.5] shrink-0" />
                        <span>Foto bebas tanpa batas</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-rose-500 stroke-[2.5] shrink-0" />
                        <span>Untuk semua tamu kamu</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-sky-500 stroke-[2.5] shrink-0" />
                        <span>Sepanjang durasi acara</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-3 lg:-bottom-4 left-0 right-0 flex justify-center z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPackage("all-you-can", e);
                      }}
                      className="bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] hover:from-[#FF9433] hover:to-[#FF5500] text-white font-black uppercase text-[10.5px] lg:text-[11.5px] tracking-wider px-6 lg:px-7 py-2.5 lg:py-3 rounded-full shadow-[0_8px_18px_rgba(230,77,0,0.35)] border border-orange-300/40 group-hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>PILIH PAKET INI</span>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[3] text-white" />
                    </button>
                  </div>
                </motion.div>

                {/* ── CARD 2: CENTER HERO ── */}
                <div className="relative w-[310px] lg:w-[350px] xl:w-[375px] h-[480px] lg:h-[520px] xl:h-[545px] bg-white rounded-[36px] lg:rounded-[42px] shadow-2xl flex flex-col justify-between p-1.5 lg:p-2 shrink-0 border-2 border-white z-20 overflow-hidden">
                  <div
                    className="relative w-full h-[55%] lg:h-[56%] bg-[#EBF2FF] p-2 flex items-center justify-center border border-blue-100/70 shadow-inner"
                    style={{
                      borderTopLeftRadius: "30px",
                      borderTopRightRadius: "30px",
                      borderBottomLeftRadius: "50% 36px",
                      borderBottomRightRadius: "50% 36px",
                    }}
                  >
                    <Image
                      src="/images/slides/slide4/card-obj-1-v2.png"
                      alt="Sebooth Mascot Package Artwork"
                      fill
                      unoptimized
                      sizes="400px"
                      className="object-contain p-1"
                      priority
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between px-3 lg:px-4 pt-3 pb-2 text-center">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                        PILIH PAKET PHOTOBOOTH KAMU
                      </h3>
                      <p className="text-xs lg:text-[13px] text-slate-500 font-medium leading-snug mt-1 max-w-[270px] mx-auto">
                        Mau foto non-stop sampai puas atau sistem kuota untuk seru-seruan? Pilih paket yang paling pas untuk acara kamu!
                      </p>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => handleSelectPackage("all-you-can", e)}
                        className="flex-1 bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] hover:from-[#FF9433] hover:to-[#FF5500] text-white font-black uppercase text-[11px] lg:text-xs tracking-wider py-3 rounded-full shadow-md border border-orange-300/40 active:scale-95 transition-transform cursor-pointer"
                      >
                        ALL YOU CAN
                      </button>
                      <button
                        onClick={(e) => handleSelectPackage("batch-booking", e)}
                        className="flex-1 bg-[#26B7AB] hover:bg-[#1fa196] text-white font-black uppercase text-[11px] lg:text-xs tracking-wider py-3 rounded-full shadow-md border border-teal-300 active:scale-95 transition-transform cursor-pointer"
                      >
                        BATCH BOOKING
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── CARD 3: BATCH BOOKING ── */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => handleSelectPackage("batch-booking", e)}
                  className="relative w-[275px] lg:w-[305px] xl:w-[325px] h-[450px] lg:h-[485px] xl:h-[510px] flex flex-col justify-between shrink-0 drop-shadow-[0_15px_25px_rgba(0,0,0,0.22)] cursor-pointer group"
                >
                  <Image
                    src="/images/slides/slide4/batch-booking-pckg.png"
                    alt="Batch Booking Package Card"
                    fill
                    unoptimized
                    sizes="340px"
                    className="object-contain pointer-events-none select-none"
                    priority
                  />

                  <div className="relative z-10 mt-auto mb-[34px] lg:mb-[40px] xl:mb-[44px] w-full px-6 lg:px-7 flex flex-col items-center text-center">
                    <h3 className="text-xl lg:text-2xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                      Batch Booking
                    </h3>
                    <p className="text-[9.5px] lg:text-[10.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[200px] lg:max-w-[215px]">
                      Sewa dengan kuota cetak, lebih hemat & terkontrol. Pas banget untuk acara kantor, gathering, atau komunitas kamu.
                    </p>


                    <div className="w-full max-w-[190px] lg:max-w-[210px] space-y-0.5 my-1 lg:my-1.5 text-left">
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 stroke-[2.5] shrink-0" />
                        <span>Bebas atur sesi foto</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-teal-600 stroke-[2.5] shrink-0" />
                        <span>Pas buat rombongan</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-600 stroke-[2.5] shrink-0" />
                        <span>Fleksibel & rapi terjadwal</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-3 lg:-bottom-4 left-0 right-0 flex justify-center z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPackage("batch-booking", e);
                      }}
                      className="bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] hover:from-[#FF9433] hover:to-[#FF5500] text-white font-black uppercase text-[10.5px] lg:text-[11.5px] tracking-wider px-6 lg:px-7 py-2.5 lg:py-3 rounded-full shadow-[0_8px_18px_rgba(230,77,0,0.35)] border border-orange-300/40 group-hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>PILIH PAKET INI</span>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[3] text-white" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              /* ── STAGE 2: DETAIL SPLIT VIEW ── */
              <motion.div
                key="desktop-detail-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-center gap-6 lg:gap-8 w-full"
              >
                {/* Back Button close above cards */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className="absolute -top-10 lg:-top-11 left-0 z-30 flex items-center gap-2"
                >
                  <button
                    onClick={handleBackToOverview}
                    aria-label="Kembali ke Pilihan Paket"
                    className="p-1 text-white/90 hover:text-white transition-all active:scale-90 cursor-pointer group"
                  >
                    <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] transition-transform group-hover:-translate-x-1 drop-shadow-md" />
                  </button>
                </motion.div>

                {/* Left Anchored Card (Clean transparent PNG shadow without rectangular edge box) */}
                <motion.div
                  initial={{ opacity: 0, x: isAllYouCan ? -40 : 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-[275px] lg:w-[305px] xl:w-[325px] h-[450px] lg:h-[485px] xl:h-[510px] flex flex-col justify-between shrink-0 drop-shadow-[0_15px_25px_rgba(0,0,0,0.22)] z-20"
                >
                  <Image
                    src={
                      isAllYouCan
                        ? "/images/slides/slide4/all-you-can-photo-pckg.png"
                        : "/images/slides/slide4/batch-booking-pckg.png"
                    }
                    alt={isAllYouCan ? "All You Can Photo Card" : "Batch Booking Card"}
                    fill
                    unoptimized
                    sizes="340px"
                    className="object-contain pointer-events-none select-none"
                    priority
                  />

                  <div className="relative z-10 mt-auto mb-[34px] lg:mb-[40px] xl:mb-[44px] w-full px-6 lg:px-7 flex flex-col items-center text-center">
                    <h3 className="text-xl lg:text-2xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                      {isAllYouCan ? "All You Can Photo" : "Batch Booking"}
                    </h3>
                    <p className="text-[9.5px] lg:text-[10.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[200px] lg:max-w-[215px]">
                      {isAllYouCan
                        ? "Foto sepuasnya tanpa mikir kuota! Bebas berekspresi sepuasnya, cocok banget untuk acara yang tamunya suka foto."
                        : "Sewa dengan kuota cetak, lebih hemat & terkontrol. Pas banget untuk acara kantor, gathering, atau komunitas kamu."}
                    </p>

                    <div className="w-full max-w-[190px] lg:max-w-[210px] space-y-0.5 my-1 lg:my-1.5 text-left">
                      {isAllYouCan ? (
                        <>
                          <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                            <InfinityIcon className="w-3.5 h-3.5 text-amber-500 stroke-[2.5] shrink-0" />
                            <span>Foto bebas tanpa batas</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-rose-500 stroke-[2.5] shrink-0" />
                            <span>Untuk semua tamu kamu</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-sky-500 stroke-[2.5] shrink-0" />
                            <span>Sepanjang durasi acara</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 stroke-[2.5] shrink-0" />
                            <span>Bebas atur sesi foto</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-teal-600 stroke-[2.5] shrink-0" />
                            <span>Pas untuk rombongan</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-teal-600 stroke-[2.5] shrink-0" />
                            <span>Fleksibel & rapi terjadwal</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Right Details Tier List */}
                <div className="flex-1 max-w-xl flex flex-col justify-between max-h-[460px] lg:max-h-[500px] z-10 pl-2">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="mb-3 text-left"
                  >
                    <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black font-bayon text-white uppercase tracking-tight leading-none drop-shadow-md">
                      {isAllYouCan ? "PILIH DURASI UNLIMITED KAMU" : "PILIH KUOTA BATCH BOOKING KAMU"}
                    </h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 text-white flex-nowrap overflow-x-auto no-scrollbar">
                      <span className="flex items-center gap-1.5 bg-[#0239A0] text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md hover:bg-[#022e85] transition-all shrink-0">
                        <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                        <span>Softfile Live QR</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#0239A0] text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md hover:bg-[#022e85] transition-all shrink-0">
                        <Frame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                        <span>Custom Frame</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#0239A0] text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md hover:bg-[#022e85] transition-all shrink-0">
                        <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                        <span>Crew On-Site</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#0239A0] text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md hover:bg-[#022e85] transition-all shrink-0">
                        <PartyPopper className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                        <span>Fun Props Box</span>
                      </span>
                    </div>
                  </motion.div>

                  {/* ── BATCH BOOKING: DIRECT 4 ITEMS, NO SCROLLBAR ── */}
                  {isBatch ? (
                    <div className="flex flex-col gap-3 lg:gap-3.5 flex-1 justify-center my-auto">
                      {DETAILED_PACKAGES["batch-booking"].map((pkg, index) => {
                        const isTierSelected = selectedTierId === pkg.id;

                        return (
                          <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.12 + index * 0.04,
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={() => setSelectedTierId(pkg.id)}
                            className={`bg-white rounded-2xl px-6 py-3.5 lg:py-4 shadow-md border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isTierSelected
                                ? "border-teal-400 ring-2 ring-white/50"
                                : "border-white/90 hover:border-teal-300 hover:bg-white"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="text-2xl sm:text-3xl lg:text-[30px] font-black font-bayon text-[#181B34] uppercase leading-none tracking-wide">
                                  {pkg.name}
                                </h4>
                              </div>
                              {pkg.id === "batch-4" && (
                                <p className="text-xs sm:text-[12.5px] font-semibold text-slate-500 mt-1">
                                  Bebas tentukan kuota cetak untuk event besar / gathering akbar kamu
                                </p>
                              )}
                            </div>


                            <div className="shrink-0">
                              <a
                                href={`${waBase}${encodeURIComponent(pkg.waText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-2xl shadow flex items-center gap-2 active:scale-95 transition-transform"
                              >
                                <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
                                <span>{pkg.id === "batch-4" ? "Konsultasi WA" : "Pesan WA"}</span>
                              </a>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ── ALL YOU CAN PHOTO: DURATION CARDS ── */
                    <div className="flex flex-col gap-3.5 lg:gap-4 flex-1 justify-center my-auto">
                      {DETAILED_PACKAGES["all-you-can"].map((pkg, index) => {
                        const isTierSelected = selectedTierId === pkg.id;

                        return (
                          <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.12 + index * 0.04,
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={() => setSelectedTierId(pkg.id)}
                            className={`bg-white rounded-2xl px-6 py-4 lg:py-5 shadow-md border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isTierSelected
                                ? "border-amber-400 ring-2 ring-white/50"
                                : "border-white/90 hover:border-amber-300 hover:bg-white"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="text-2xl sm:text-3xl lg:text-[30px] font-black font-bayon text-[#181B34] uppercase leading-none tracking-wide">
                                  {pkg.name}
                                </h4>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <a
                                href={`${waBase}${encodeURIComponent(pkg.waText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-2xl shadow flex items-center gap-2 active:scale-95 transition-transform"
                              >
                                <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
                                <span>Pesan WA</span>
                              </a>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.4 }}
                    className="mt-2 flex items-center justify-between text-[10.5px] sm:text-xs font-bold text-white/90"
                  >
                    <span>Mau custom branding atau request khusus?</span>
                    <a
                      href={`${waBase}${encodeURIComponent(
                        "Halo Sebooth, saya mau ngobrol konsultasi paket custom untuk acara saya nih!"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-white hover:text-amber-200 flex items-center gap-1 font-extrabold"
                    >
                      <span>Ngobrol Bareng Kami</span>
                      <ArrowUpRight className="w-3 h-3 stroke-[3]" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE STAGE
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex md:hidden items-center justify-center w-full max-w-sm flex-col">
          <AnimatePresence mode="wait">
            {!selectedPackage ? (
              <motion.div
                key="mob-overview-mode"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="w-full flex flex-col items-center justify-center"
              >
                <div className="relative w-[280px] xs:w-[305px] h-[430px] xs:h-[460px] flex items-center justify-center">

                  {activeSlide === 0 ? (
                    <div 
                      onClick={(e) => handleSelectPackage("all-you-can", e)}
                      className="relative w-full h-full flex flex-col justify-between drop-shadow-[0_12px_20px_rgba(0,0,0,0.22)] cursor-pointer group active:scale-[0.98] transition-transform"
                    >
                      <Image
                        src="/images/slides/slide4/all-you-can-photo-pckg.png"
                        alt="All You Can Photo"
                        fill
                        unoptimized
                        sizes="310px"
                        className="object-contain pointer-events-none"
                        priority
                      />
                      <div className="relative z-10 mt-auto mb-[26px] xs:mb-[30px] w-full px-5 xs:px-6 flex flex-col items-center text-center">
                        <h3 className="text-xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                          All You Can Photo
                        </h3>
                        <p className="text-[9px] xs:text-[9.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[190px]">
                          Foto sepuasnya tanpa mikir kuota! Bebas berekspresi sepuasnya, cocok untuk acara yang tamunya suka foto.
                        </p>
                        <div className="w-full max-w-[175px] space-y-0.5 my-1 text-left">
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <InfinityIcon className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                            <span>Foto bebas tanpa batas</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
                            <span>Untuk semua tamu kamu</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                            <span>Sepanjang durasi acara</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-3 left-0 right-0 flex justify-center z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPackage("all-you-can", e);
                          }}
                          className="bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] active:from-[#FF9433] active:to-[#FF5500] text-white font-black uppercase text-[10.5px] tracking-wider px-6 py-2 rounded-full shadow-[0_6px_16px_rgba(230,77,0,0.35)] border border-orange-300/40 flex items-center gap-1"
                        >
                          <span>PILIH PAKET INI</span>
                          <ArrowUpRight className="w-3 h-3 stroke-[3] text-white" />
                        </button>
                      </div>
                    </div>
                  ) : activeSlide === 1 ? (
                    <div className="relative w-full h-full bg-white rounded-[34px] shadow-2xl flex flex-col justify-between p-1.5 border-2 border-white overflow-hidden">
                      <div
                        className="relative w-full h-[53%] bg-[#EBF2FF] p-2 flex items-center justify-center border border-blue-100 shadow-inner"
                        style={{
                          borderTopLeftRadius: "28px",
                          borderTopRightRadius: "28px",
                          borderBottomLeftRadius: "50% 28px",
                          borderBottomRightRadius: "50% 28px",
                        }}
                      >
                        <Image
                          src="/images/slides/slide4/card-obj-1-v2.png"
                          alt="Choose Your Photobooth Package"
                          fill
                          unoptimized
                          sizes="330px"
                          className="object-contain p-1"
                          priority
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between px-2 pt-2.5 pb-1.5 text-center">
                        <div>
                          <h3 className="text-xl xs:text-2xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                            PILIH PAKET PHOTOBOOTH KAMU
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1 max-w-[260px] mx-auto">
                            Mau foto non-stop sampai puas atau sistem kuota untuk seru-seruan? Pilih paket yang paling pas untuk acara kamu!
                          </p>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={(e) => handleSelectPackage("all-you-can", e)}
                            className="flex-1 bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] text-white font-black uppercase text-[10.5px] py-2.5 rounded-full shadow-md border border-orange-300/40 active:scale-95"
                          >
                            ALL YOU CAN
                          </button>
                          <button
                            onClick={(e) => handleSelectPackage("batch-booking", e)}
                            className="flex-1 bg-[#26B7AB] text-white font-black uppercase text-[10.5px] py-2.5 rounded-full shadow-md border border-teal-300 active:scale-95"
                          >
                            BATCH BOOKING
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={(e) => handleSelectPackage("batch-booking", e)}
                      className="relative w-full h-full flex flex-col justify-between drop-shadow-[0_12px_20px_rgba(0,0,0,0.22)] cursor-pointer group active:scale-[0.98] transition-transform"
                    >
                      <Image
                        src="/images/slides/slide4/batch-booking-pckg.png"
                        alt="Batch Booking"
                        fill
                        unoptimized
                        sizes="310px"
                        className="object-contain pointer-events-none"
                        priority
                      />
                      <div className="relative z-10 mt-auto mb-[26px] xs:mb-[30px] w-full px-5 xs:px-6 flex flex-col items-center text-center">
                        <h3 className="text-xl font-black font-bayon text-[#181B34] tracking-tight uppercase leading-tight">
                          Batch Booking
                        </h3>
                        <p className="text-[9px] xs:text-[9.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[190px]">
                          Sewa dengan kuota cetak, lebih hemat & terkontrol. Pas banget untuk acara kantor, gathering, atau komunitas kamu.
                        </p>
                        <div className="w-full max-w-[175px] space-y-0.5 my-1 text-left">
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
                            <span>Bebas atur sesi foto</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
                            <span>Pas untuk rombongan</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
                            <span>Fleksibel & rapi terjadwal</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-3 left-0 right-0 flex justify-center z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPackage("batch-booking", e);
                          }}
                          className="bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] active:from-[#FF9433] active:to-[#FF5500] text-white font-black uppercase text-[10.5px] tracking-wider px-6 py-2 rounded-full shadow-[0_6px_16px_rgba(230,77,0,0.35)] border border-orange-300/40 flex items-center gap-1"
                        >
                          <span>PILIH PAKET INI</span>
                          <ArrowUpRight className="w-3 h-3 stroke-[3] text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-3">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Go to card ${idx + 1}`}
                      className={`transition-all duration-200 rounded-full cursor-pointer ${
                        activeSlide === idx ? "w-6 h-2 bg-[#FFC72C]" : "w-2 h-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              /* ── MOBILE DETAIL VIEW ── */
              <motion.div
                key="mob-detail-mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col gap-2.5 overflow-y-auto max-h-[78vh] p-2 pt-1 pb-4 no-scrollbar"
              >
                {/* Back Button close above cards */}
                <div className="flex items-center justify-start px-1">
                  <button
                    onClick={handleBackToOverview}
                    aria-label="Kembali ke Pilihan Paket"
                    className="p-1 text-white/90 active:text-white transition-all active:scale-90"
                  >
                    <ArrowLeft className="w-6 h-6 stroke-[3.5] drop-shadow-md" />
                  </button>
                </div>

                <div className="text-left text-white px-1">
                  <h3 className="text-xl font-black font-bayon uppercase leading-tight">
                    {isAllYouCan ? "PILIH DURASI UNLIMITED KAMU" : "PILIH KUOTA BATCH BOOKING KAMU"}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-2 text-white flex-nowrap overflow-x-auto no-scrollbar pb-0.5">
                    <span className="flex items-center gap-1 bg-[#0239A0] text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                      <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                      <span>Softfile Live QR</span>
                    </span>
                    <span className="flex items-center gap-1 bg-[#0239A0] text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                      <Frame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                      <span>Custom Frame</span>
                    </span>
                    <span className="flex items-center gap-1 bg-[#0239A0] text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                      <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                      <span>Crew On-Site</span>
                    </span>
                    <span className="flex items-center gap-1 bg-[#0239A0] text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                      <PartyPopper className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                      <span>Fun Props Box</span>
                    </span>
                  </div>
                </div>

                {/* 2-ROW × 2-COLUMN LARGE KOTAK-KOTAK GRID */}
                <div className="grid grid-cols-2 gap-2.5 xs:gap-3 w-full p-1">
                  {(isBatch ? DETAILED_PACKAGES["batch-booking"] : DETAILED_PACKAGES["all-you-can"]).map((pkg, idx) => {
                    const isSelected = selectedTierId === pkg.id;

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.08 + idx * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setSelectedTierId(pkg.id)}
                        className={`relative rounded-2xl xs:rounded-3xl p-3 xs:p-3.5 flex flex-col justify-between items-center text-center overflow-hidden transition-all cursor-pointer min-h-[155px] xs:min-h-[170px] ${
                          isSelected
                            ? isBatch
                              ? "bg-white border-4 border-teal-400 shadow-[0_8px_24px_rgba(13,148,136,0.35)]"
                              : "bg-white border-4 border-amber-400 shadow-[0_8px_24px_rgba(245,158,11,0.35)]"
                            : "bg-gradient-to-b from-white via-slate-50/95 to-slate-100/90 border-2 border-white/90 shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {/* Top Header Row with Icon Badge & Highlight Pill */}
                        <div className="w-full flex items-center justify-between">
                          <div
                            className={`w-7 h-7 xs:w-8 xs:h-8 rounded-full flex items-center justify-center shadow-inner ${
                              isBatch
                                ? "bg-teal-50 text-teal-600 border border-teal-200/60"
                                : "bg-amber-50 text-amber-600 border border-amber-200/60"
                            }`}
                          >
                            {idx === 0 && <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />}
                            {idx === 1 && <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />}
                            {idx === 2 && <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />}
                            {idx === 3 && <PartyPopper className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />}
                          </div>

                          <span
                            className={`text-[8px] xs:text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wide ${
                              idx === 1
                                ? "bg-gradient-to-r from-rose-500 to-red-600 text-white"
                                : idx === 3
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                : "bg-slate-800 text-white"
                            }`}
                          >
                            {idx === 0
                              ? isBatch
                                ? "PAS & HEMAT"
                                : "EXPRESS"
                              : idx === 1
                              ? isBatch
                                ? "REKOMENDASI 🔥"
                                : "MOST POPULAR 🔥"
                              : idx === 2
                              ? isBatch
                                ? "RAMAI EVENT"
                                : "FULL EVENT"
                              : isBatch
                              ? "EVENT AKBAR 👑"
                              : "VIP CUSTOM 👑"}
                          </span>
                        </div>

                        {/* Title & Sub-tagline */}
                        <div className="my-auto py-1 flex flex-col items-center justify-center">
                          <h4 className="text-xl xs:text-2xl font-black font-bayon text-[#181B34] uppercase leading-none tracking-tight">
                            {pkg.name}
                          </h4>
                          <span className="text-[9.5px] xs:text-[10.5px] font-extrabold text-slate-400 mt-1 uppercase tracking-wider">
                            {isBatch ? "Photostrip Cetak" : "Softfile & Cetak"}
                          </span>
                        </div>

                        {/* Shimmer CTA Button */}
                        <a
                          href={`${waBase}${encodeURIComponent(pkg.waText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full text-white font-black uppercase text-[10.5px] xs:text-[11.5px] py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                            isBatch
                              ? "bg-gradient-to-r from-[#26B7AB] via-[#0D9488] to-[#0F5550] shadow-teal-500/25 border border-teal-300/40"
                              : "bg-gradient-to-r from-[#FF851B] via-[#FF6200] to-[#E64D00] shadow-orange-500/25 border border-orange-300/40"
                          }`}
                        >
                          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                          <span>{pkg.id.includes("4") ? "Konsultasi" : "Pesan WA"}</span>
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
    </section>
  );
}
