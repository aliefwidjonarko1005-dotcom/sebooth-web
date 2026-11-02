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

const PACKAGE_CARDS = {
  "all-you-can": {
    image: "/images/slides/slide4/all-you-can-photo-pckg-brand.png",
    title: "All You Can Photo",
    desc: "Foto sepuasnya tanpa mikir kuota! Bebas berekspresi sepuasnya, cocok untuk acara yang tamunya suka foto.",
    features: [
      { icon: InfinityIcon, label: "Foto bebas tanpa batas" },
      { icon: Users, label: "Untuk semua tamu kamu" },
      { icon: Clock, label: "Sepanjang durasi acara" },
    ],
    // The card's art is edged in orange, so its button is navy
    buttonClass: "bg-blue-dark text-white",
  },
  "batch-booking": {
    image: "/images/slides/slide4/batch-booking-pckg-brand.png",
    title: "Batch Booking",
    desc: "Sewa dengan kuota cetak, lebih hemat & terkontrol. Pas banget untuk acara kantor, gathering, atau komunitas kamu.",
    features: [
      { icon: Calendar, label: "Bebas atur sesi foto" },
      { icon: Users, label: "Pas untuk rombongan" },
      { icon: Clock, label: "Fleksibel & rapi terjadwal" },
    ],
    // ...and this one in navy, so its button is orange
    buttonClass: "bg-secondary text-blue-dark",
  },
} as const;

// What sets each tier apart, in tier order; the highlighted tier is the one Sebooth recommends
const TIER_TAGS: Record<PackageType, string[]> = {
  "all-you-can": ["Express", "Most popular", "Full event", "VIP custom"],
  "batch-booking": ["Pas & hemat", "Rekomendasi", "Ramai event", "Event akbar"],
};
const HIGHLIGHTED_TIER = 1;

function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: keyof typeof PACKAGE_CARDS;
  onSelect: (pkg: PackageType, event?: React.MouseEvent) => void;
}) {
  const card = PACKAGE_CARDS[pkg];
  return (
    <div
      onClick={(e) => onSelect(pkg, e)}
      className="relative flex h-full w-full cursor-pointer flex-col justify-between transition-transform active:scale-[0.98]"
    >
      <Image src={card.image} alt={card.title} fill unoptimized sizes="310px" className="pointer-events-none object-contain" priority />
      <div className="relative z-10 mt-auto mb-[26px] flex w-full flex-col items-center px-5 text-center min-[375px]:mb-[30px] min-[375px]:px-6">
        <h3 className="font-bayon text-2xl leading-none text-blue-dark uppercase">{card.title}</h3>
        <p className="mt-1 text-[13px] leading-snug text-slate-600">{card.desc}</p>
        <ul className="my-1.5 w-full max-w-[210px] space-y-0.5 text-left text-[13px] font-bold text-blue-dark">
          {card.features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -bottom-3 left-0 right-0 z-20 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pkg, e);
          }}
          className={`flex min-h-11 cursor-pointer items-center gap-1 rounded-full px-6 text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${card.buttonClass}`}
        >
          Pilih Paket Ini
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
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
            <div className="relative w-[280px] min-[375px]:w-[305px] h-[430px] min-[375px]:h-[460px] flex items-center justify-center">
              {activeSlide === 0 ? (
                <PackageCard pkg="all-you-can" onSelect={handleSelectPackage} />
              ) : activeSlide === 1 ? (
                <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-white p-1.5">
                  <div
                    className="relative flex h-[53%] w-full items-center justify-center bg-blue-light p-2"
                    style={{
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      borderBottomLeftRadius: "50% 28px",
                      borderBottomRightRadius: "50% 28px",
                    }}
                  >
                    <Image
                      src="/images/slides/slide4/card-obj-1-v2.png"
                      alt="Pilih paket photobooth"
                      fill
                      unoptimized
                      sizes="330px"
                      className="object-contain p-1"
                      priority
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between px-2 pt-2.5 pb-1.5 text-center">
                    <div>
                      <h3 className="font-bayon text-2xl leading-[1.05] text-blue-dark uppercase">
                        Pilih Paket Photobooth Kamu
                      </h3>
                      <p className="mx-auto mt-1 max-w-[260px] text-sm leading-snug text-slate-600">
                        Mau foto non-stop sampai puas atau sistem kuota untuk seru-seruan? Pilih paket yang paling pas untuk acara kamu!
                      </p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => handleSelectPackage("all-you-can", e)}
                        className="min-h-11 flex-1 cursor-pointer rounded-full bg-secondary text-[15px] font-bold text-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                      >
                        All You Can
                      </button>
                      <button
                        onClick={(e) => handleSelectPackage("batch-booking", e)}
                        className="min-h-11 flex-1 cursor-pointer rounded-full bg-primary text-[15px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                      >
                        Batch Booking
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <PackageCard pkg="batch-booking" onSelect={handleSelectPackage} />
              )}
            </div>

            {/* The dots stay small; the padding gives each a 24px target */}
            <div className="mt-2 flex items-center justify-center">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Kartu paket ${idx + 1}`}
                  aria-current={activeSlide === idx || undefined}
                  className="cursor-pointer p-2 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span
                    className={`block h-2 rounded-full transition-[width,background-color] duration-200 ${
                      activeSlide === idx ? "w-6 bg-secondary" : "w-2 bg-white/50"
                    }`}
                  />
                </button>
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
            className="w-full flex flex-col gap-3 overflow-y-auto max-h-[78vh] p-2 pt-1 pb-4 no-scrollbar"
          >
            <div className="px-1 text-white">
              <button
                onClick={handleBackToOverview}
                aria-label="Kembali ke Pilihan Paket"
                className="-ml-2.5 flex h-11 w-11 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white active:scale-90"
              >
                <ArrowLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <h3 className="font-bayon text-[1.75rem] leading-[1.05] uppercase">
                {isAllYouCan ? "Pilih Durasi Unlimited Kamu" : "Pilih Kuota Batch Booking Kamu"}
              </h3>
              <p className="mt-2 text-[15px] leading-snug">
                Semua paket termasuk softfile live QR, custom frame, crew on-site, dan fun props box.
              </p>
            </div>

            {/* 2-ROW × 2-COLUMN TIER GRID */}
            <div className="grid grid-cols-2 gap-3 w-full p-1">
              {(isBatch ? DETAILED_PACKAGES["batch-booking"] : DETAILED_PACKAGES["all-you-can"]).map((pkg, idx) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setSelectedTierId(pkg.id)}
                  className={`flex min-h-[170px] cursor-pointer flex-col items-center justify-between gap-2 rounded-lg bg-white p-3 text-center ${
                    selectedTierId === pkg.id ? "outline-3 outline-offset-2 outline-secondary" : ""
                  }`}
                >
                  <p
                    className={`text-[13px] font-bold ${
                      idx === HIGHLIGHTED_TIER ? "rounded-full bg-secondary px-2.5 py-0.5 text-blue-dark" : "py-0.5 text-slate-600"
                    }`}
                  >
                    {TIER_TAGS[isBatch ? "batch-booking" : "all-you-can"][idx]}
                  </p>

                  <div>
                    <h4 className="font-bayon text-[1.75rem] leading-none text-blue-dark uppercase">{pkg.name}</h4>
                    <p className="mt-1 text-[13px] text-slate-600">{isBatch ? "Photostrip cetak" : "Softfile & cetak"}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTicketPkg(pkg);
                    }}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-secondary text-[15px] font-bold text-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {pkg.id.includes("4") ? "Konsultasi" : "Pesan WA"}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
