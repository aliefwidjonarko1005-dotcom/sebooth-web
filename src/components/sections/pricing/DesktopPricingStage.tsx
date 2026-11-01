"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
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
} from "lucide-react";
import { DetailedPackage, PackageType, DETAILED_PACKAGES, waBase } from "./pricingPackages";

interface DesktopPricingStageProps {
  selectedPackage: PackageType | null;
  isAllYouCan: boolean;
  isBatch: boolean;
  selectedTierId: string | null;
  setSelectedTierId: (id: string | null) => void;
  setTicketPkg: (pkg: DetailedPackage | null) => void;
  handleSelectPackage: (pkg: PackageType, event?: React.MouseEvent) => void;
  handleBackToOverview: () => void;
}

/** Desktop pricing: three overview cards, then the chosen package with its tiers. */
export function DesktopPricingStage({
  selectedPackage,
  isAllYouCan,
  isBatch,
  selectedTierId,
  setSelectedTierId,
  setTicketPkg,
  handleSelectPackage,
  handleBackToOverview,
}: DesktopPricingStageProps) {
  return (
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
                src="/images/slides/slide4/all-you-can-photo-pckg-brand.png"
                alt="All You Can Photo Package Card"
                fill
                unoptimized
                sizes="340px"
                className="object-contain pointer-events-none select-none"
                priority
              />

              <div className="relative z-10 mt-auto mb-[34px] lg:mb-[40px] xl:mb-[44px] w-full px-6 lg:px-7 flex flex-col items-center text-center">
                <h3 className="text-xl lg:text-2xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
                  All You Can Photo
                </h3>
                <p className="text-[9.5px] lg:text-[10.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[200px] lg:max-w-[215px]">
                  Foto sepuasnya tanpa mikir kuota! Bebas berekspresi sepuasnya, cocok banget untuk acara yang tamunya suka foto.
                </p>

                <div className="w-full max-w-[190px] lg:max-w-[210px] space-y-0.5 my-1 lg:my-1.5 text-left">
                  <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                    <InfinityIcon className="w-3.5 h-3.5 text-[#FF4500] stroke-[2.5] shrink-0" />
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
                  className="bg-[#FF4500] hover:bg-orange-press text-white font-black uppercase text-[10.5px] lg:text-[11.5px] tracking-wider px-6 lg:px-7 py-2.5 lg:py-3 rounded-full shadow-[0_8px_18px_rgba(230,77,0,0.35)] border border-orange-300/40 group-hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
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
                  <h3 className="text-2xl lg:text-3xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
                    PILIH PAKET PHOTOBOOTH KAMU
                  </h3>
                  <p className="text-xs lg:text-[13px] text-slate-500 font-medium leading-snug mt-1 max-w-[270px] mx-auto">
                    Mau foto non-stop sampai puas atau sistem kuota untuk seru-seruan? Pilih paket yang paling pas untuk acara kamu!
                  </p>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={(e) => handleSelectPackage("all-you-can", e)}
                    className="flex-1 bg-[#FF4500] hover:bg-orange-press text-white font-black uppercase text-[11px] lg:text-xs tracking-wider py-3 rounded-full shadow-md border border-orange-300/40 active:scale-95 transition-transform cursor-pointer"
                  >
                    ALL YOU CAN
                  </button>
                  <button
                    onClick={(e) => handleSelectPackage("batch-booking", e)}
                    className="flex-1 bg-[#002366] hover:bg-blue-dark text-white font-black uppercase text-[11px] lg:text-xs tracking-wider py-3 rounded-full shadow-md border border-white/30 active:scale-95 transition-transform cursor-pointer"
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
                src="/images/slides/slide4/batch-booking-pckg-brand.png"
                alt="Batch Booking Package Card"
                fill
                unoptimized
                sizes="340px"
                className="object-contain pointer-events-none select-none"
                priority
              />

              <div className="relative z-10 mt-auto mb-[34px] lg:mb-[40px] xl:mb-[44px] w-full px-6 lg:px-7 flex flex-col items-center text-center">
                <h3 className="text-xl lg:text-2xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
                  Batch Booking
                </h3>
                <p className="text-[9.5px] lg:text-[10.5px] text-slate-500 font-semibold leading-snug mt-0.5 max-w-[200px] lg:max-w-[215px]">
                  Sewa dengan kuota cetak, lebih hemat & terkontrol. Pas banget untuk acara kantor, gathering, atau komunitas kamu.
                </p>


                <div className="w-full max-w-[190px] lg:max-w-[210px] space-y-0.5 my-1 lg:my-1.5 text-left">
                  <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#002366] stroke-[2.5] shrink-0" />
                    <span>Bebas atur sesi foto</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-[#002366] stroke-[2.5] shrink-0" />
                    <span>Pas buat rombongan</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-[#002366] stroke-[2.5] shrink-0" />
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
                  className="bg-[#FF4500] hover:bg-orange-press text-white font-black uppercase text-[10.5px] lg:text-[11.5px] tracking-wider px-6 lg:px-7 py-2.5 lg:py-3 rounded-full shadow-[0_8px_18px_rgba(230,77,0,0.35)] border border-orange-300/40 group-hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
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
                    ? "/images/slides/slide4/all-you-can-photo-pckg-brand.png"
                    : "/images/slides/slide4/batch-booking-pckg-brand.png"
                }
                alt={isAllYouCan ? "All You Can Photo Card" : "Batch Booking Card"}
                fill
                unoptimized
                sizes="340px"
                className="object-contain pointer-events-none select-none"
                priority
              />

              <div className="relative z-10 mt-auto mb-[34px] lg:mb-[40px] xl:mb-[44px] w-full px-6 lg:px-7 flex flex-col items-center text-center">
                <h3 className="text-xl lg:text-2xl font-black font-bayon text-blue-dark tracking-tight uppercase leading-tight">
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
                        <InfinityIcon className="w-3.5 h-3.5 text-[#FF4500] stroke-[2.5] shrink-0" />
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
                        <Calendar className="w-3.5 h-3.5 text-[#002366] stroke-[2.5] shrink-0" />
                        <span>Bebas atur sesi foto</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-[#002366] stroke-[2.5] shrink-0" />
                        <span>Pas untuk rombongan</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#002366] stroke-[2.5] shrink-0" />
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
                  <span className="flex items-center gap-1.5 bg-navy-raised text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md transition-all shrink-0">
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                    <span>Softfile Live QR</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-navy-raised text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md transition-all shrink-0">
                    <Frame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                    <span>Custom Frame</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-navy-raised text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md transition-all shrink-0">
                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                    <span>Crew On-Site</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-navy-raised text-white px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-300/30 text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-md transition-all shrink-0">
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
                            ? "border-[#002366] ring-2 ring-white/50"
                            : "border-white/90 hover:border-[#002366] hover:bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-2xl sm:text-3xl lg:text-[30px] font-black font-bayon text-blue-dark uppercase leading-none tracking-wide">
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketPkg(pkg);
                            }}
                            className="bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-2xl shadow flex items-center gap-2 active:scale-95 transition-transform"
                          >
                            <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
                            <span>{pkg.id === "batch-4" ? "Konsultasi WA" : "Pesan WA"}</span>
                          </button>
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
                            ? "border-[#FF4500] ring-2 ring-white/50"
                            : "border-white/90 hover:border-[#FF4500] hover:bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-2xl sm:text-3xl lg:text-[30px] font-black font-bayon text-blue-dark uppercase leading-none tracking-wide">
                              {pkg.name}
                            </h4>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketPkg(pkg);
                            }}
                            className="bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-2xl shadow flex items-center gap-2 active:scale-95 transition-transform"
                          >
                            <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
                            <span>Pesan WA</span>
                          </button>
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
                  className="underline text-white hover:text-white/80 flex items-center gap-1 font-extrabold"
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
  );
}
