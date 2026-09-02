"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
}

interface FaqFolder {
  id: string;
  name: string;
  tabLabel: string;
  gradientId: string;
  stops: { offset: string; color: string }[];
  tabTextColor: string;
  tabPosition: "left" | "middle" | "right";
  svgPath: string;
  rows: FaqRow[];
}

// 3 Proportional Folder Tab Silhouettes for viewBox="0 0 600 460"
// Symmetrically calculated so each tab peak (x-span: ~140px in SVG, 33.3% flex) fits its text label perfectly!
const PATH_TAB_LEFT =
  "M 0,32 C 0,12 14,0 32,0 L 172,0 C 190,0 200,10 212,24 C 224,38 234,42 254,42 L 568,42 C 586,42 600,56 600,74 L 600,460 L 0,460 Z";

const PATH_TAB_MIDDLE =
  "M 0,74 C 0,56 14,42 32,42 L 155,42 C 175,42 185,38 197,24 C 209,10 219,0 237,0 L 363,0 C 381,0 391,10 403,24 C 415,38 425,42 445,42 L 568,42 C 586,42 600,56 600,74 L 600,460 L 0,460 Z";

const PATH_TAB_RIGHT =
  "M 0,74 C 0,56 14,42 32,42 L 346,42 C 366,42 376,38 388,24 C 400,10 410,0 428,0 L 568,0 C 586,0 600,14 600,32 L 600,460 L 0,460 Z";


// ── ARRANGED: MERAH (BACK) -> BIRU (MIDDLE) -> ORANYE (FRONT) WITH RICH GRADIENTS ──
const FOLDERS: FaqFolder[] = [
  {
    id: "custom",
    name: "FRAME & PROPS",
    tabLabel: "Custom Frame",
    gradientId: "grad-faq-custom",
    stops: [
      { offset: "0%", color: "#FF3B5C" },
      { offset: "35%", color: "#E60039" },
      { offset: "70%", color: "#99002B" },
      { offset: "100%", color: "#4D0014" },
    ],
    tabTextColor: "text-white",
    tabPosition: "left",
    svgPath: PATH_TAB_LEFT,
    rows: [
      {
        id: "c-1",
        question: "Apakah bisa request custom frame & branding logo acara?",
        answer:
          "Gratis! Kirimkan logo atau konsep tema acara kamu, tim desainer Sebooth akan membuatkan pilihan template frame aesthetic hingga cocok.",
      },
      {
        id: "c-2",
        question: "Apakah paket sewa sudah termasuk fun props & aksesoris?",
        answer:
          "Sudah termasuk 1 box penuh properti kacamata funky, bando, dan aksesoris lucu. Diperbolehkan juga membawa properti tema sendiri.",
      },
      {
        id: "c-3",
        question: "Apa saja pilihan ukuran foto cetak yang tersedia?",
        answer:
          "Tersedia Photostrip (2x6 inch) dan Postcard 4R (4x6 inch) dengan cetakan thermal premium anti air, anti luntur, dan langsung kering.",
      },
      {
        id: "c-4",
        question: "Bagaimana ketentuan DP dan pelunasan pembayaran?",
        answer:
          "Cukup DP 30% untuk mengunci tanggal acara. Pelunasan bisa diselesaikan santai H-1 atau pada hari-H setelah booth selesai terpasang.",
      },
      {
        id: "c-5",
        question: "Apakah bisa request tema atau custom backdrop sendiri?",
        answer:
          "Bebas pilih tema warna backdrop polos atau request backdrop custom gambar branding acara kamu sesuai selera.",
      },
    ],
  },
  {
    id: "technical",
    name: "TEKNIS & VENUE",
    tabLabel: "Teknis",
    gradientId: "grad-faq-technical",
    stops: [
      { offset: "0%", color: "#0066FF" },
      { offset: "35%", color: "#0038B8" },
      { offset: "70%", color: "#001B66" },
      { offset: "100%", color: "#000B2B" },
    ],
    tabTextColor: "text-white",
    tabPosition: "middle",
    svgPath: PATH_TAB_MIDDLE,
    rows: [
      {
        id: "t-1",
        question: "Berapa minimal ukuran ruangan yang dibutuhkan untuk booth?",
        answer:
          "Idealnya minimal 2.5 x 2.5 meter atau 3 x 3 meter agar leluasa foto rame-rame dan pencahayaan studio merata maksimal.",
      },
      {
        id: "t-2",
        question: "Berapa kapasitas daya listrik yang diperlukan?",
        answer:
          "Cukup 1 colokan listrik standar rumah/gedung (450 - 650 Watt) untuk menyalakan printer thermal, lighting studio, kamera, dan PC booth.",
      },
      {
        id: "t-3",
        question: "Berapa lama waktu persiapan crew sebelum acara dimulai?",
        answer:
          "Crew kami datang 1.5 - 2 jam sebelum acara untuk pasang backdrop, kalibrasi kamera, test print, dan setting booth 100% siap.",
      },
      {
        id: "t-4",
        question: "Apakah ada crew operator yang mendampingi selama acara?",
        answer:
          "Minimal 2 crew ramah & profesional siap standby memandu tamu, mengarahkan pose, mengganti kertas foto, dan menjaga kelancaran.",
      },
      {
        id: "t-5",
        question: "Bagaimana jika terjadi kendala teknis saat acara berlangsung?",
        answer:
          "Setiap event dibekali printer thermal cadangan, kamera backup, dan sistem kelistrikan terproteksi agar acara berjalan 100% lancar tanpa kompromi.",
      },
    ],
  },
  {
    id: "general",
    name: "UMUM & BOOKING",
    tabLabel: "General",
    gradientId: "grad-faq-general",
    stops: [
      { offset: "0%", color: "#FF7700" },
      { offset: "35%", color: "#FF3B00" },
      { offset: "70%", color: "#B82300" },
      { offset: "100%", color: "#5E0F00" },
    ],
    tabTextColor: "text-white",
    tabPosition: "right",
    svgPath: PATH_TAB_RIGHT,
    rows: [
      {
        id: "g-1",
        question: "Apakah Sebooth melayani sewa photobooth di luar kota?",
        answer:
          "Bisa banget! Kita siap meluncur ke seluruh Jawa Tengah, Jogja, hingga luar pulau. Cukup sesuaikan akomodasi & transport crew.",
      },
      {
        id: "g-2",
        question: "Kapan waktu paling ideal untuk melakukan reservasi?",
        answer:
          "Disarankan minimal 2-4 minggu sebelum hari-H agar tanggal aman. Jika mendesak, langsung chat admin untuk cek ketersediaan slot!",
      },
      {
        id: "g-3",
        question: "Apa perbedaan paket All You Can Photo dan Batch Booking?",
        answer:
          "All You Can Photo: cetak sepuasnya tanpa batas lembar selama durasi sewa. Batch Booking: kuota lembar (100, 200, 300 lembar) lebih hemat & terkontrol.",
      },
      {
        id: "g-4",
        question: "Bagaimana cara tamu mendownload softfile foto & GIF?",
        answer:
          "Begitu selesai sesi foto, layar monitor otomatis menampilkan Live QR Code. Scan dengan HP dan softfile HD langsung tersimpan.",
      },
      {
        id: "g-5",
        question: "Apakah tanggal booking bisa di-reschedule jika acara bergeser?",
        answer:
          "Bisa banget! Kamu bisa atur ulang tanggal reservasi tanpa biaya tambahan selama slot di tanggal baru masih tersedia.",
      },
    ],
  },
];


interface FaqStackSliderProps {
  isActive?: boolean;
}

export function FaqStackSlider({ isActive = true }: FaqStackSliderProps) {
  // Default starts with Folder 2 (Oranye / UMUM & BOOKING - Paling Depan)
  const [activeFolderIdx, setActiveFolderIdx] = useState(2);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleToggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-white text-slate-900 overflow-hidden select-none flex flex-col justify-end items-center px-2 xs:px-4 sm:px-6 md:px-8 lg:px-12 pb-0 pt-0"
    >
      {/* ── AMBIENT ABSTRACT BLUR BACKDROPS (DESKTOP ONLY FOR 120FPS MOBILE) ── */}
      <div className="hidden sm:block absolute top-1/4 left-1/5 -translate-x-1/2 w-[550px] h-[550px] bg-[#FF6B00]/22 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="hidden sm:block absolute top-1/3 right-1/5 translate-x-1/3 w-[500px] h-[500px] bg-[#FF3838]/18 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="hidden sm:block absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] bg-[#0239A0]/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER (Title & Subtitle - Proporsional, Elegan & Rapi)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-4xl text-center shrink-0 flex flex-col justify-center items-center py-0 mb-1 xs:mb-1.5 sm:mb-2 px-2">
        <motion.h2
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black font-bayon uppercase tracking-normal sm:tracking-wide text-[#181B34] leading-tight drop-shadow-xs"
        >
          FREQUENTLY ASK QUESTION
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="text-[11px] xs:text-xs sm:text-sm md:text-base text-slate-600 font-semibold max-w-xl mx-auto mt-0.5 sm:mt-1 leading-snug"
        >
          Belum menemukan jawaban? Yuk, ngobrol langsung dengan tim kami!
        </motion.p>
      </div>


      {/* ═══════════════════════════════════════════════════════════════════
          FLUSH & SEJAJAR RATA FOLDERS (SNUG TO BOTTOM & HEADER)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[98vw] sm:max-w-[95vw] md:max-w-[94vw] lg:max-w-[1240px] xl:max-w-[1380px] shrink-0 flex flex-col justify-end min-h-0 pb-0">
        <div className="relative w-full h-[64vh] xs:h-[68vh] sm:h-[480px] md:h-[520px] lg:h-[560px] xl:h-[600px] max-h-[72vh] min-h-[400px] xs:min-h-[440px]">
          
          {FOLDERS.map((folder, idx) => {
            const isActive = idx === activeFolderIdx;

            // Active folder gets top priority z-index (40) so its content & text are always on top!
            // Inactive folders retain background layer order: 10 (Merah), 20 (Biru), 30 (Oranye)
            const dynamicZIndex = isActive ? 40 : (idx + 1) * 10;

            return (
              <motion.div
                key={folder.id}
                initial={false}
                animate={{
                  top: "0px",
                  scale: isActive ? 1 : 0.992,
                  y: isActive ? 0 : 2,
                }}
                transition={{
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ zIndex: dynamicZIndex }}
                className="absolute inset-0 h-full cursor-pointer drop-shadow-[0_24px_50px_rgba(0,0,0,0.24)] select-none pointer-events-auto"
              >
                {/* SVG Silhouette of the Folder (Multi-Stop Rich Gradients) */}
                <svg
                  viewBox="0 0 600 460"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <defs>
                    <linearGradient id={folder.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      {folder.stops.map((stop, i) => (
                        <stop key={i} offset={stop.offset} stopColor={stop.color} />
                      ))}
                    </linearGradient>
                    <linearGradient id={`${folder.gradientId}-top-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
                      <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.08" />
                      <stop offset="60%" stopColor="#000000" stopOpacity="0" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Main Multi-Stop Rich Color Gradient Path */}
                  <path d={folder.svgPath} fill={`url(#${folder.gradientId})`} />

                  {/* Top Metallic / Glass Sheen Overlay */}
                  <path d={folder.svgPath} fill={`url(#${folder.gradientId}-top-shine)`} />
                </svg>

                {/* ── PER-FOLDER TAB TEXT & INTERACTIVE BUTTONS (BOUND TO THIS FOLDER'S Z-INDEX) ── */}
                <div className="absolute top-0 inset-x-0 h-10 sm:h-12 z-30 flex items-center justify-between px-1 xs:px-2 sm:px-6 md:px-10 lg:px-14 pointer-events-auto">
                  {FOLDERS.map((f, i) => {
                    const isCurrentFolderTab = i === idx;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFolderIdx(i);
                          setExpandedRowId(null);
                        }}
                        className={`h-9 sm:h-11 w-1/3 pointer-events-auto flex items-center justify-center font-black font-bayon uppercase text-[12.5px] xs:text-[14.5px] sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-normal sm:tracking-wide transition-all duration-200 cursor-pointer px-0.5 xs:px-1 ${
                          isCurrentFolderTab
                            ? "text-white opacity-100 drop-shadow-md"
                            : "text-white/80 hover:text-white opacity-0"
                        }`}
                      >
                        <span className="whitespace-nowrap truncate">{f.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Folder Content */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between px-2.5 xs:px-4 sm:px-6 md:px-10 lg:px-14 pt-2 sm:pt-3 pb-3 sm:pb-4 text-white overflow-hidden">
                  {/* Spacer for Top Tab Header Bar */}
                  <div className="w-full h-10 sm:h-14 shrink-0 select-none" />

                  {/* ── FOLDER BODY QUESTIONS (COMPACT SNUG SPACING, ZERO HUGE GAPS) ── */}
                  <div
                    className={`flex-1 flex flex-col justify-start py-1 sm:py-2 md:py-2.5 space-y-1.5 xs:space-y-2 sm:space-y-3 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-0.5 xs:px-1 transition-opacity duration-200 ${
                      isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {folder.rows.map((row) => {
                      const isRowExpanded = expandedRowId === row.id;

                      return (
                        <div
                          key={row.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRow(row.id);
                          }}
                          className={`w-full rounded-xl sm:rounded-2xl transition-colors duration-150 cursor-pointer overflow-hidden border ${
                            isRowExpanded
                              ? "bg-slate-950/95 text-white shadow-xl border-white/30 ring-1 ring-white/20"
                              : "bg-black/35 hover:bg-black/45 text-white border-white/15 hover:border-white/25 shadow-sm"
                          }`}
                        >
                          {/* Direct Question Header Row */}
                          <div className="flex items-center justify-between gap-3 p-3 xs:p-3.5 sm:p-4">
                            <h4 className="text-[13px] xs:text-[14px] sm:text-[15.5px] md:text-base font-bold leading-snug text-white break-words flex-1 text-left">
                              {row.question}
                            </h4>

                            <div
                              className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center bg-white/15 text-white shrink-0 transition-transform duration-200 ${
                                isRowExpanded ? "rotate-180 bg-white text-slate-950" : "rotate-0"
                              }`}
                            >
                              <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
                            </div>
                          </div>

                          {/* Fast Hardware-Accelerated Dropdown Answer (CSS Grid Rows) */}
                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                              isRowExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-3 xs:px-3.5 sm:px-4 pb-3 sm:pb-3.5 pt-0 text-xs xs:text-[13px] sm:text-sm md:text-[14.5px] font-medium leading-relaxed text-slate-200 border-t border-white/10 mx-1.5 xs:mx-2 mt-0.5 text-left">
                                <p className="pt-2">{row.answer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
