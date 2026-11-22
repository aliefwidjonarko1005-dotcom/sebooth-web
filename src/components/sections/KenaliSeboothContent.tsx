"use client";

import { useState } from "react";
import Image from "next/image";
import { MotionConfig, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/config/social";

// Every figure and line on this page comes from sebooth-proposal/facts.md (F1–F16) or the approved
// "Satu Meter" video script. No price per session and no revenue-share percentage, by design.
// Direction: a flat street poster in the brand's navy, orange and cream. The video is the one
// picture stuck on, tilted across the seam of the first screen.

const EASE = [0.16, 1, 0.3, 1] as const;

// The public 9:16 master lives in the media bucket, not in git (proposal/ prefix, generic cut only)
const VIDEO_URL = "https://storage.googleapis.com/sebooth-media-konser/proposal/satu-meter-9x16.mp4";
const WA_TEXT = "Halo Sebooth, saya panitia event dan tertarik dengan photobooth gratis 1 × 1 meter. Boleh ngobrol?";

// Order is carried by colour, darkest first (no step numbers)
const STAGES = [
    {
        name: "Bayar QRIS",
        text: "Tamu bayar sendiri di mesin lewat QRIS: GoPay, OVO, BCA, Dana, atau ShopeePay.",
        bg: "#00113A",
        img: { src: "/images/products/vending_machine_booth.webp", alt: "Mesin vending photobooth Sebooth", w: 503, h: 657, pos: "object-center" },
    },
    {
        name: "Pose",
        text: "Live view di layar, lalu hitung mundur 5 detik sebelum kamera memotret.",
        bg: "#002366",
        img: { src: "/images/gallery/hd/photo_5b47bc90_2.webp", alt: "Rombongan tamu berselempang berpose di photobooth Sebooth", w: 1400, h: 2100, pos: "object-center" },
    },
    {
        name: "Cetak",
        text: "Cetakan keluar dalam 12 detik per lembar dari printer DNP DS-RX1 HS, dengan frame bertema event.",
        bg: "#0239A0",
        img: { src: "/images/gallery/hd/strip_6e34e142.webp", alt: "Photostrip Sebooth berbingkai acara Fakultas Teknik", w: 1200, h: 1800, pos: "object-top" },
    },
    {
        name: "Scan QR",
        text: "QR muncul di layar dan tercetak di strip. Tamu scan, lalu softfile dan GIF masuk ke HP lewat sebooth.in.",
        bg: "#2B57C4",
        img: { src: "/images/gallery/hd/strip_c7b611a3.webp", alt: "Bagian bawah photostrip Sebooth dengan kode QR", w: 1200, h: 1800, pos: "object-bottom" },
    },
];

const BAND = ["4.200+ sesi foto", "36.000+ file digital", "5,0 dari 45 ulasan Google"];

const REVIEWS = [
    "KEREN BGT HASIL FOTONYAA HD SUKAA💕💕",
    "bagusss banget hasilnya hd",
    "Pelayanan ramah, desain nya lucu keren",
];

const STRIPS = [
    { src: "/images/gallery/hd/strip_49ab1cee.webp", alt: "Photostrip Sebooth berbingkai acara Fakultas Hukum" },
    { src: "/images/gallery/hd/strip_a429b5f8.webp", alt: "Photostrip Sebooth berbingkai acara Fakultas Kedokteran" },
    { src: "/images/gallery/hd/strip_8ab4d512.webp", alt: "Photostrip Sebooth berbingkai Universitas Diponegoro" },
    { src: "/images/gallery/hd/strip_e9ccd064.webp", alt: "Photostrip Sebooth berbingkai acara mahasiswa Undip" },
];

const PARTNERS = [1, 2, 3, 4, 5, 6];

// Five sizes do the work: the shout, the section display, the lead, the body and the small line
const SHOUT = "font-bayon uppercase leading-[0.84] text-[18vw] lg:text-[clamp(80px,13vw,210px)]";
const DISPLAY = "font-bayon uppercase leading-[0.9] text-[clamp(3rem,13vw,4.5rem)] lg:text-[clamp(3.5rem,5.6vw,6rem)]";
const MARGINS = "px-5 lg:px-7";

// Rises once as it enters. MotionConfig below turns travel off for reduced motion; the server and
// the client render the same props, so nothing is left stuck at opacity 0.
const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.5, delay, ease: EASE },
});

function WaButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <a
            href={whatsappUrl(WA_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-14 items-center justify-center gap-3 px-7 text-lg font-bold transition-[background-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:scale-[0.98] ${className}`}
        >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {children}
        </a>
    );
}

// The four stages as one accordion: a row of tinted panels on desktop, stacked bars on a phone
function Stages() {
    const [open, setOpen] = useState(0);
    return (
        <ol className="mt-12 flex flex-col lg:mt-16 lg:h-[34rem] lg:flex-row">
            {STAGES.map((s, i) => {
                const isOpen = i === open;
                return (
                    <li
                        key={s.name}
                        style={{ backgroundColor: s.bg }}
                        className={`overflow-hidden text-[#FAF8F5] transition-[flex-grow] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:min-w-16 lg:basis-0 ${isOpen ? "lg:grow-[7]" : "lg:grow"}`}
                    >
                        {isOpen ? (
                            <motion.div
                                key="open"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="grid lg:h-full lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]"
                            >
                                <div className="flex flex-col justify-between gap-6 p-6 lg:p-8">
                                    <h3 className="font-bayon text-[40px] leading-none uppercase">{s.name}</h3>
                                    <p className="max-w-[36ch] text-[17px] leading-relaxed lg:text-lg">{s.text}</p>
                                </div>
                                <Image
                                    src={s.img.src}
                                    alt={s.img.alt}
                                    width={s.img.w}
                                    height={s.img.h}
                                    sizes="(min-width: 1024px) 30vw, 100vw"
                                    className={`aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full ${s.img.pos}`}
                                />
                            </motion.div>
                        ) : (
                            <button
                                type="button"
                                aria-expanded={false}
                                onClick={() => setOpen(i)}
                                className="flex h-16 w-full items-center px-6 text-left text-lg font-bold transition-colors duration-150 hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#FAF8F5] lg:h-full lg:items-end lg:justify-center lg:px-0 lg:pb-6"
                            >
                                <span className="lg:rotate-180 lg:[writing-mode:vertical-rl]">{s.name}</span>
                            </button>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export function KenaliSeboothContent() {
    return (
        <MotionConfig reducedMotion="user">
            <div className="bg-[#FAF8F5] text-blue-dark">
                {/* Hero: navy field and orange band; the video is stuck on across the seam */}
                <section className="flex min-h-svh flex-col">
                    <div className={`relative z-10 flex-1 bg-primary pt-[calc(3.5rem+6svh)] text-[#FAF8F5] lg:flex lg:flex-col lg:justify-center lg:pt-16 lg:pb-8 ${MARGINS}`}>
                        <h1 className={SHOUT}>
                            <span className="block">Photobooth</span>
                            <span className="block">gratis</span>
                        </h1>
                        <motion.figure
                            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                            className="relative mt-8 mr-1 -mb-24 ml-auto w-[64%] max-w-[22rem] rotate-3 md:max-w-[17rem] bg-[#FAF8F5] p-2.5 lg:absolute lg:top-[5.5rem] lg:right-[7vw] lg:-bottom-24 lg:m-0 lg:flex lg:w-auto lg:max-w-none lg:p-3"
                        >
                            <motion.div
                                initial={{ scale: 1.12 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                                className="lg:h-full"
                            >
                                <video
                                    className="block aspect-[9/16] w-full bg-[#FAF8F5] lg:h-full lg:w-auto"
                                    src={VIDEO_URL}
                                    poster="/images/kenali/poster.webp"
                                    controls
                                    playsInline
                                    preload="metadata"
                                    width={1080}
                                    height={1920}
                                    aria-label="Video Sebooth Satu Meter, 80 detik, tanpa narasi, tetap terbaca tanpa suara"
                                />
                            </motion.div>
                        </motion.figure>
                    </div>
                    <div className={`bg-secondary pt-32 pb-8 text-blue-dark lg:py-10 ${MARGINS}`}>
                        <div className="flex flex-col gap-6 lg:max-w-[56vw] lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                            <p className="max-w-[40ch] text-xl leading-snug">
                                Satu mesin vending photobooth di area 1 × 1 meter event Anda. Tamu bayar sendiri lewat QRIS,
                                penyelenggara tidak keluar biaya.
                            </p>
                            <WaButton className="w-full shrink-0 bg-primary text-[#FAF8F5] hover:bg-blue-dark lg:w-auto">Chat WhatsApp</WaButton>
                        </div>
                    </div>
                </section>

                {/* How it works: four touches, one accordion */}
                <section className={`py-20 lg:py-32 ${MARGINS}`}>
                    <motion.div {...rise()} className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-7">
                        <h2 className={`${DISPLAY} lg:col-span-6`}>Empat sentuhan</h2>
                        <p className="max-w-[40ch] text-lg leading-relaxed lg:col-span-5 lg:col-start-8">
                            Tamu melayani dirinya sendiri, dari bayar sampai pulang membawa cetakan dan softfile. Satu sesi
                            sekitar 2 menit. Ketuk tiap tahap untuk membukanya.
                        </p>
                    </motion.div>
                    <Stages />
                </section>

                {/* Proof, part one: the record as a line of type running past */}
                <div className="overflow-hidden bg-secondary py-[5svh] lg:py-[8svh]">
                    <motion.div
                        className="flex w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                    >
                        {[0, 1].map((copy) => (
                            <p
                                key={copy}
                                aria-hidden={copy === 1}
                                className="flex shrink-0 items-center font-bayon text-[15vw] leading-none whitespace-nowrap uppercase lg:text-[8vw]"
                            >
                                {BAND.map((t) => (
                                    <span key={t} className="flex items-center">
                                        {t}
                                        <span aria-hidden="true" className="mx-[0.35em] inline-block h-[0.24em] w-[0.24em] rounded-full bg-blue-dark" />
                                    </span>
                                ))}
                            </p>
                        ))}
                    </motion.div>
                </div>
                <p className={`pt-4 text-[15px] ${MARGINS}`}>Data Sebooth, Maret–November 2026. Rating dari Google Maps.</p>

                {/* Proof, part two: the frames events printed on, what guests wrote, who we worked with */}
                <section className={`py-20 lg:py-32 ${MARGINS}`}>
                    <motion.div {...rise()} className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-7">
                        <h2 className={`${DISPLAY} lg:col-span-6`}>Tiap event, frame sendiri</h2>
                        <p className="max-w-[40ch] text-lg leading-relaxed lg:col-span-5 lg:col-start-8">
                            Logo dan tema penyelenggara tercetak di setiap lembar. Ini beberapa frame dari acara kampus Undip.
                        </p>
                    </motion.div>
                    <ul className="mt-12 grid grid-cols-2 gap-4 lg:mt-16 lg:grid-cols-4 lg:gap-7" aria-label="Contoh cetakan dari event sebelumnya">
                        {STRIPS.map((s, i) => (
                            <motion.li
                                key={s.src}
                                {...rise(0.06 * i)}
                                className={`${i === 0 ? "-rotate-2" : ""} ${i === 2 ? "rotate-2" : ""} ${i > 1 ? "hidden lg:block" : ""}`}
                            >
                                <Image
                                    src={s.src}
                                    alt={s.alt}
                                    width={1200}
                                    height={1800}
                                    sizes="(min-width: 1024px) 25vw, 50vw"
                                    className="h-auto w-full bg-white p-1.5"
                                />
                            </motion.li>
                        ))}
                    </ul>

                    <div className="mt-20 grid gap-14 lg:mt-28 lg:grid-cols-12 lg:gap-7">
                        <motion.div {...rise()} className="lg:col-span-6">
                            <h3 className="text-2xl font-extrabold">Kata tamu di Google</h3>
                            <ul className="mt-6 space-y-5">
                                {REVIEWS.map((r) => (
                                    <li key={r} className="text-[22px] leading-snug font-semibold lg:text-[28px]">
                                        <q>{r}</q>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div {...rise(0.08)} className="lg:col-span-5 lg:col-start-8">
                            <h3 className="text-2xl font-extrabold">Pernah bekerja sama dengan</h3>
                            <ul className="mt-6 grid grid-cols-3 gap-3">
                                {PARTNERS.map((n) => (
                                    <li key={n} className="flex aspect-[3/2] items-center justify-center bg-white p-3">
                                        <Image
                                            src={`/images/partners/logo_${n}.webp`}
                                            alt={`Logo partner Sebooth ${n}`}
                                            width={160}
                                            height={100}
                                            className="max-h-full w-auto object-contain"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* The offer: two fields that meet at a hard edge; the wider one is what the organiser gets */}
                <section className="grid lg:grid-cols-12">
                    <div className={`flex flex-col justify-between gap-16 bg-blue-dark py-14 text-[#FAF8F5] lg:col-span-5 lg:min-h-[70svh] lg:px-10 lg:py-16 ${MARGINS}`}>
                        <motion.div {...rise()}>
                            <h2 className="font-bayon text-[clamp(3rem,13vw,4.5rem)] leading-[0.9] uppercase lg:text-[clamp(3.5rem,5vw,5.5rem)]">Anda siapkan</h2>
                            <p className="mt-6 max-w-[40ch] text-lg leading-relaxed">
                                Area 1 × 1 meter, satu colokan listrik 350–500 W, akses loading untuk pemasangan, dan nama
                                Sebooth di publikasi event.
                            </p>
                        </motion.div>
                        <p className="text-[22vw] leading-[0.85] font-extrabold tracking-tight tabular-nums lg:text-[8vw]">1 × 1 m</p>
                    </div>
                    <div className={`flex flex-col justify-between gap-16 bg-secondary py-14 text-blue-dark lg:col-span-7 lg:min-h-[70svh] lg:px-10 lg:py-16 ${MARGINS}`}>
                        <motion.div {...rise(0.08)}>
                            <h2 className="font-bayon text-[clamp(3rem,13vw,4.5rem)] leading-[0.9] uppercase lg:text-[clamp(3.5rem,5vw,5.5rem)]">Anda dapat</h2>
                            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed">
                                Frame bertema event di setiap cetakan, softfile untuk tamu lewat QR, dan kuota foto untuk panitia
                                dan tamu VIP. Pengunjung bayar sendiri per sesi ke Sebooth.
                            </p>
                        </motion.div>
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="font-bayon text-[24vw] leading-[0.8] uppercase lg:text-[10vw]">Gratis</p>
                                <p className="mt-3 text-[15px]">Skema bagi hasil juga tersedia</p>
                            </div>
                            <WaButton className="w-full bg-blue-dark text-[#FAF8F5] hover:bg-primary lg:w-auto">Ajukan untuk event Anda</WaButton>
                        </div>
                    </div>
                </section>

                {/* The close: one word, and the whole band is the link */}
                <a
                    href={whatsappUrl(WA_TEXT)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex min-h-[46svh] flex-col justify-between gap-10 pt-8 pb-6 hover:bg-secondary hover:text-[#FAF8F5] focus-visible:bg-secondary focus-visible:text-[#FAF8F5] focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-blue-dark lg:min-h-[60svh] lg:pt-10 ${MARGINS}`}
                >
                    <span className="flex items-start justify-between gap-6">
                        <span className="max-w-[36ch] text-[17px] leading-snug lg:text-xl">
                            <strong>Seboothkan Momenmu.</strong> Chat WhatsApp 0857-1389-9441 untuk menaruh Sebooth di event
                            Anda.
                        </span>
                        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-8 w-8 shrink-0 lg:h-12 lg:w-12" fill="none" stroke="currentColor" strokeWidth="4">
                            <path d="M12 36 36 12M16 12h20v20" />
                        </svg>
                    </span>
                    <h2 className="font-bayon text-[28vw] leading-[0.8] uppercase lg:text-[31vw]">Hubungi</h2>
                </a>
            </div>
        </MotionConfig>
    );
}
