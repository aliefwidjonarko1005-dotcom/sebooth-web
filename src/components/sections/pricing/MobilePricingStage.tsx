"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Users,
  Clock,
  Calendar,
  Infinity as InfinityIcon,
  MessageCircle,
  ArrowUpRight,
  ArrowLeft,
  QrCode,
  Frame,
  UserCheck,
  PartyPopper,
  Zap,
} from "lucide-react";
import { DetailedPackage, PackageType, DETAILED_PACKAGES } from "./pricingPackages";

interface MobilePricingStageProps {
  selectedPackage: PackageType | null;
  isAllYouCan: boolean;
  isBatch: boolean;
  selectedTierId: string | null;
  setSelectedTierId: (id: string | null) => void;
  setTicketPkg: (pkg: DetailedPackage | null) => void;
  handleSelectPackage: (pkg: PackageType, event?: React.MouseEvent) => void;
  handleBackToOverview: () => void;
  activeSlide: number;
  setActiveSlide: (slide: number) => void;
}

/** Mobile pricing: one swipeable card at a time, then the chosen package as a 2x2 tier grid. */
export function MobilePricingStage({
  selectedPackage,
  isAllYouCan,
  isBatch,
  selectedTierId,
  setSelectedTierId,
  setTicketPkg,
  handleSelectPackage,
  handleBackToOverview,
  activeSlide,
  setActiveSlide,
}: MobilePricingStageProps) {
  return (
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
                    src="/images/slides/slide4/all-you-can-photo-pckg-brand.png"
                    alt="All You Can Photo"
                    fill
                    unoptimized
                    sizes="310px"
                    className="object-contain pointer-events-none"
                    priority
                  />
                  <div className="relative z-10 mt-auto mb-[26px] xs:mb-[30px] w-full px-5 xs:px-6 flex flex-col items-center text-center">
                    <h3 className="text-xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
                      All You Can Photo
                    </h3>
                    <p className="text-[9px] xs:text-[9.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[190px]">
                      Foto sepuasnya tanpa mikir kuota! Bebas berekspresi sepuasnya, cocok untuk acara yang tamunya suka foto.
                    </p>
                    <div className="w-full max-w-[175px] space-y-0.5 my-1 text-left">
                      <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                        <InfinityIcon className="w-3.5 h-3.5 text-[#FF4500] stroke-[2.5]" />
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
                      className="bg-[#FF4500] active:bg-orange-press text-white font-black uppercase text-[10.5px] tracking-wider px-6 py-2 rounded-full shadow-[0_6px_16px_rgba(230,77,0,0.35)] border border-orange-300/40 flex items-center gap-1"
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
                      <h3 className="text-xl xs:text-2xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
                        PILIH PAKET PHOTOBOOTH KAMU
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1 max-w-[260px] mx-auto">
                        Mau foto non-stop sampai puas atau sistem kuota untuk seru-seruan? Pilih paket yang paling pas untuk acara kamu!
                      </p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => handleSelectPackage("all-you-can", e)}
                        className="flex-1 bg-[#FF4500] text-white font-black uppercase text-[10.5px] py-2.5 rounded-full shadow-md border border-orange-300/40 active:scale-95"
                      >
                        ALL YOU CAN
                      </button>
                      <button
                        onClick={(e) => handleSelectPackage("batch-booking", e)}
                        className="flex-1 bg-[#002366] text-white font-black uppercase text-[10.5px] py-2.5 rounded-full shadow-md border border-white/30 active:scale-95"
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
                    src="/images/slides/slide4/batch-booking-pckg-brand.png"
                    alt="Batch Booking"
                    fill
                    unoptimized
                    sizes="310px"
                    className="object-contain pointer-events-none"
                    priority
                  />
                  <div className="relative z-10 mt-auto mb-[26px] xs:mb-[30px] w-full px-5 xs:px-6 flex flex-col items-center text-center">
                    <h3 className="text-xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
                      Batch Booking
                    </h3>
                    <p className="text-[9px] xs:text-[9.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[190px]">
                      Sewa dengan kuota cetak, lebih hemat & terkontrol. Pas banget untuk acara kantor, gathering, atau komunitas kamu.
                    </p>
                    <div className="w-full max-w-[175px] space-y-0.5 my-1 text-left">
                      <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-[#002366] stroke-[2.5]" />
                        <span>Bebas atur sesi foto</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-[#002366] stroke-[2.5]" />
                        <span>Pas untuk rombongan</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#002366] stroke-[2.5]" />
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
                      className="bg-[#FF4500] active:bg-orange-press text-white font-black uppercase text-[10.5px] tracking-wider px-6 py-2 rounded-full shadow-[0_6px_16px_rgba(230,77,0,0.35)] border border-orange-300/40 flex items-center gap-1"
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
                    activeSlide === idx ? "w-6 h-2 bg-[#FF4500]" : "w-2 h-2 bg-white/40"
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
                <span className="flex items-center gap-1 bg-navy-raised text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                  <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                  <span>Softfile Live QR</span>
                </span>
                <span className="flex items-center gap-1 bg-navy-raised text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                  <Frame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                  <span>Custom Frame</span>
                </span>
                <span className="flex items-center gap-1 bg-navy-raised text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
                  <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />
                  <span>Crew On-Site</span>
                </span>
                <span className="flex items-center gap-1 bg-navy-raised text-white px-2.5 py-1 rounded-full border border-blue-300/30 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md shrink-0">
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
                          ? "bg-white border-4 border-[#002366]"
                          : "bg-white border-4 border-[#FF4500]"
                        : "bg-gradient-to-b from-white via-slate-50/95 to-slate-100/90 border-2 border-white/90 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {/* Top Header Row with Icon Badge & Highlight Pill */}
                    <div className="w-full flex items-center justify-between">
                      <div
                        className={`w-7 h-7 xs:w-8 xs:h-8 rounded-full flex items-center justify-center shadow-inner ${
                          isBatch
                            ? "bg-[#eef2ff] text-[#002366]"
                            : "bg-[#eef2ff] text-[#FF4500]"
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
                            ? "bg-[#FF4500] text-white"
                            : idx === 3
                            ? "bg-[#002366] text-white"
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
                      <h4 className="text-xl xs:text-2xl font-black font-bayon text-blue-dark uppercase leading-none tracking-tight">
                        {pkg.name}
                      </h4>
                      <span className="text-[9.5px] xs:text-[10.5px] font-extrabold text-slate-400 mt-1 uppercase tracking-wider">
                        {isBatch ? "Photostrip Cetak" : "Softfile & Cetak"}
                      </span>
                    </div>

                    {/* Shimmer CTA Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketPkg(pkg);
                      }}
                      className={`w-full text-white font-black uppercase text-[10.5px] xs:text-[11.5px] py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                        isBatch
                          ? "bg-[#002366] border border-white/30"
                          : "bg-[#FF4500] hover:bg-orange-press"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                      <span>{pkg.id.includes("4") ? "Konsultasi" : "Pesan WA"}</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
