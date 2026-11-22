"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/config/social";

// Every figure and line on this page comes from sebooth-proposal/facts.md (F1–F16) or the approved
// "Satu Meter" video script. No price per session and no revenue-share percentage, by design.

const EASE = [0.16, 1, 0.3, 1] as const;

// The public 9:16 master lives in the media bucket, not in git (proposal/ prefix, generic cut only)
const VIDEO_URL = "https://storage.googleapis.com/sebooth-media-konser/proposal/satu-meter-9x16.mp4";
const WA_TEXT = "Halo Sebooth, saya panitia event dan tertarik dengan photobooth gratis 1 × 1 meter. Boleh ngobrol?";

const STEPS = [
    { what: "Bayar QRIS", value: "GoPay, OVO, BCA, Dana, ShopeePay" },
    { what: "Pose", value: "Hitung mundur 5 detik" },
    { what: "Cetak", value: "12 detik" },
    { what: "Scan QR", value: "Softfile + GIF di HP" },
];

const REVIEWS = [
    "KEREN BGT HASIL FOTONYAA HD SUKAA💕💕",
    "bagusss banget hasilnya hd",
    "Pelayanan ramah, desain nya lucu keren",
];

const STRIPS = [
    { src: "/images/gallery/hd/strip_49ab1cee.webp", alt: "Photostrip Sebooth berbingkai acara Fakultas Hukum" },
    { src: "/images/gallery/hd/strip_a429b5f8.webp", alt: "Photostrip Sebooth berbingkai acara Fakultas Kedokteran" },
    { src: "/images/gallery/hd/strip_6e34e142.webp", alt: "Photostrip Sebooth berbingkai acara Fakultas Teknik" },
    { src: "/images/gallery/hd/strip_c7b611a3.webp", alt: "Photostrip Sebooth berbingkai acara Universitas Diponegoro" },
];

const PARTNERS = [1, 2, 3, 4, 5, 6];

const YOU_GIVE = ["1 × 1 meter", "1 colokan listrik, 350–500 W", "Akses loading", "Sebut kami di publikasi"];
const YOU_GET = ["Frame bertema event", "Softfile untuk tamu", "Kuota foto panitia & VIP"];

// Zigzag cut along the bottom of the receipt slip
const ZIGZAG = `polygon(0 0, 100% 0, 100% calc(100% - 12px), ${Array.from({ length: 21 }, (_, i) => `${100 - i * 5}% ${i % 2 ? "100%" : "calc(100% - 12px)"}`).join(", ")})`;

function WaButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <a
            href={whatsappUrl(WA_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-14 items-center justify-center gap-3 font-bold text-white transition-[background-color,transform] duration-150 hover:bg-orange-press focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:scale-[0.98] ${className}`}
        >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {children}
        </a>
    );
}

export function KenaliSeboothContent() {
    const reduceMotion = useReducedMotion();
    // Rises once as it enters; content stays visible if the script never runs
    const rise = (delay = 0) =>
        reduceMotion
            ? {}
            : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "0px 0px -10% 0px" },
                  transition: { duration: 0.6, delay, ease: EASE },
              };

    return (
        <div className="min-h-svh bg-[#FAF8F5] text-blue-dark">
            {/* Hero: the offer, and the video inside the orange 1 × 1 m tape square it opens with */}
            <section className="bg-primary px-4 pt-24 pb-16 text-white sm:px-8 md:pt-36 md:pb-28">
                <div className="mx-auto grid max-w-6xl gap-y-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-16">
                    <h1 className="font-bayon text-[clamp(3rem,13vw,4rem)] leading-[0.92] uppercase md:text-[4.5rem] lg:self-end lg:text-[clamp(4rem,5.6vw,5rem)]">
                        Photobooth gratis untuk event Anda.
                    </h1>
                    <figure className="mx-auto w-full max-w-[22rem] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:max-w-[24rem]">
                        <div className="bg-secondary p-2.5 sm:p-3">
                            <video
                                className="block aspect-[9/16] w-full bg-[#FAF8F5]"
                                src={VIDEO_URL}
                                poster="/images/kenali/poster.webp"
                                controls
                                playsInline
                                preload="metadata"
                                width={1080}
                                height={1920}
                                aria-label="Video Sebooth Satu Meter, 80 detik, tanpa narasi"
                            />
                        </div>
                        <figcaption className="mt-3 text-center text-[15px] text-white/80">
                            80 detik, tanpa suara pun terbaca
                        </figcaption>
                    </figure>
                    <p className="max-w-[42ch] text-lg leading-snug md:text-xl">
                        Sebooth menaruh satu mesin vending photobooth di area 1 × 1 meter. Tamu berfoto dan bayar sendiri lewat
                        QRIS, penyelenggara tidak keluar biaya.
                    </p>
                    <div className="lg:self-start">
                        <WaButton className="w-full rounded-full bg-secondary px-7 text-xl md:w-auto">Chat WhatsApp</WaButton>
                    </div>
                </div>
            </section>

            {/* How it works, printed as the receipt slip the booth would hand you */}
            <section className="px-4 py-20 sm:px-8 md:py-32">
                <div className="mx-auto grid max-w-6xl gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-16">
                    <motion.div {...rise()}>
                        <h2 className="font-bayon text-[clamp(2.5rem,9vw,4.25rem)] leading-[0.95] uppercase">Empat sentuhan saja.</h2>
                        <p className="mt-5 max-w-[34ch] text-lg leading-relaxed">
                            Empat sentuhan dari bayar sampai pulang membawa cetakan dan softfile.
                        </p>
                    </motion.div>
                    <motion.div
                        {...rise(0.08)}
                        className="w-full max-w-[30rem] justify-self-center bg-white px-6 pt-7 pb-12 text-[17px] tabular-nums sm:px-8 lg:justify-self-end"
                        style={{ clipPath: ZIGZAG }}
                    >
                        <ol>
                            {STEPS.map((s) => (
                                <li key={s.what} className="flex items-baseline gap-2 py-3">
                                    <span className="font-bold whitespace-nowrap">{s.what}</span>
                                    <span aria-hidden="true" className="min-w-6 flex-1 self-center border-b-4 border-dotted border-blue-dark/25" />
                                    <span className="text-right">{s.value}</span>
                                </li>
                            ))}
                        </ol>
                        <p className="mt-4 flex min-h-11 items-center justify-between gap-3 bg-blue-dark px-4 text-[#FAF8F5]">
                            <span className="font-bold">Satu sesi</span>
                            <span>Sekitar 2 menit</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Proof: the record card, then the frames earlier events printed on */}
            <section className="overflow-hidden bg-secondary px-4 pt-20 text-white sm:px-8 md:pt-32">
                <div className="mx-auto max-w-6xl">
                    <motion.h2 {...rise()} className="font-bayon text-[clamp(2.5rem,9vw,4.25rem)] leading-[0.95] uppercase">
                        Sudah jalan di 4.200+ sesi.
                    </motion.h2>
                    <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-16">
                        <motion.div {...rise(0.06)} className="-rotate-1 bg-[#FAF8F5] p-7 text-blue-dark sm:p-10">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                <div>
                                    <p className="text-4xl font-extrabold tabular-nums sm:text-5xl">4.200+</p>
                                    <p className="text-[15px]">Sesi foto</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold tabular-nums sm:text-5xl">36.000+</p>
                                    <p className="text-[15px]">File digital</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-4xl font-extrabold tabular-nums sm:text-5xl">
                                        5,0 <span className="text-lg font-bold">dari 45 ulasan</span>
                                    </p>
                                    <p className="text-[15px]">Rating Google</p>
                                </div>
                            </div>
                            <ul className="mt-8 space-y-3">
                                {REVIEWS.map((r) => (
                                    <li key={r} className="bg-white px-4 py-3 text-[17px] font-semibold">
                                        <q>{r}</q>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-5 text-[13px] text-slate-600">
                                Kutipan ulasan Google. Data Sebooth, Maret–November 2026.
                            </p>
                        </motion.div>
                        <motion.div {...rise(0.12)}>
                            <h3 className="text-xl font-bold">Pernah bekerja sama dengan</h3>
                            <ul className="mt-5 grid grid-cols-3 gap-3">
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
                            <p className="mt-8 max-w-[38ch] text-xl leading-snug font-bold">
                                Setiap event mencetak di frame-nya sendiri. Ini beberapa dari acara kampus Undip.
                            </p>
                        </motion.div>
                    </div>
                    {/* Strips run off the bottom edge, like prints sliding out of the slot */}
                    <ul className="mt-14 -mb-16 grid grid-cols-2 gap-4 sm:gap-5 md:-mb-24 md:grid-cols-4" aria-label="Contoh cetakan dari event sebelumnya">
                        {STRIPS.map((s, i) => (
                            <motion.li
                                key={s.src}
                                {...rise(0.06 * i)}
                                className={`${i % 2 ? "rotate-2" : "-rotate-2"} ${i > 1 ? "hidden md:block" : ""}`}
                            >
                                <Image src={s.src} alt={s.alt} width={600} height={1800} className="h-auto w-full bg-white p-1.5" />
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* The offer, printed as a ticket: what the organiser gives, what they get, and the price at the stub */}
            <section className="px-4 pt-36 pb-20 sm:px-8 md:pt-48 md:pb-32">
                <div className="mx-auto max-w-6xl">
                    <motion.h2 {...rise()} className="font-bayon text-[clamp(2.5rem,9vw,4.25rem)] leading-[0.95] uppercase">
                        Tukarnya cuma satu meter.
                    </motion.h2>
                    <motion.div
                        {...rise(0.08)}
                        className="relative mt-10 grid bg-primary text-white md:grid-cols-[7fr_3fr]"
                    >
                        <div className="grid gap-8 p-7 sm:grid-cols-2 sm:p-10">
                            <div>
                                <h3 className="text-xl font-bold">Anda siapkan</h3>
                                <ul className="mt-4 space-y-2 text-[17px]">
                                    {YOU_GIVE.map((t) => (
                                        <li key={t}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Anda dapat</h3>
                                <ul className="mt-4 space-y-2 text-[17px]">
                                    {YOU_GET.map((t) => (
                                        <li key={t}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* Perforation: notches bitten out where the two parts meet, dots between them */}
                        <div
                            className="relative flex flex-col items-center justify-center gap-4 border-t-[6px] border-dotted border-[#FAF8F5] p-7 text-center sm:p-10 md:border-t-0 md:border-l-[6px]"
                        >
                            <span aria-hidden="true" className="absolute -top-[17px] -left-3.5 h-7 w-7 rounded-full bg-[#FAF8F5] md:-top-3.5 md:-left-[17px]" />
                            <span aria-hidden="true" className="absolute -top-[17px] -right-3.5 h-7 w-7 rounded-full bg-[#FAF8F5] md:top-auto md:-bottom-3.5 md:-left-[17px]" />
                            <p className="font-bayon text-6xl uppercase md:text-7xl">Gratis</p>
                            <p className="text-[15px] text-white/85">Skema bagi hasil juga tersedia.</p>
                            <WaButton className="w-full bg-secondary px-5 text-xl">Ajukan untuk event Anda</WaButton>
                        </div>
                    </motion.div>
                    <motion.figure {...rise(0.1)} className="mt-14 grid items-end gap-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                        <Image
                            src="/images/products/vending_machine_booth.webp"
                            alt="Mesin vending photobooth Sebooth"
                            width={900}
                            height={1200}
                            className="h-auto w-full max-w-sm"
                        />
                        <figcaption className="max-w-[40ch] text-lg leading-snug">
                            Kabinet 1 × 1 meter, satu colokan listrik. Pengunjung bayar sendiri per sesi ke Sebooth.
                        </figcaption>
                    </motion.figure>
                </div>
            </section>

            {/* Reply card on navy: the one action, again */}
            <section className="overflow-hidden bg-blue-dark px-4 pt-20 text-white sm:px-8 md:pt-28">
                <div className="mx-auto grid max-w-6xl items-end gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
                    <motion.p {...rise()} className="font-bayon text-5xl uppercase md:mb-24 md:text-6xl">
                        Seboothkan Momenmu
                    </motion.p>
                    <motion.div
                        {...rise(0.08)}
                        className="mx-auto -mb-12 w-full max-w-xl rotate-1 bg-[#FAF8F5] px-7 pt-10 pb-20 text-center text-blue-dark sm:px-12 md:rotate-2"
                    >
                        <h2 className="text-[26px] leading-tight font-extrabold sm:text-[32px]">Taruh Sebooth di event Anda</h2>
                        <p className="mt-3 text-[17px]">Chat WhatsApp 0857-1389-9441</p>
                        <WaButton className="mt-7 w-full bg-blue-dark px-5 text-lg hover:!bg-primary">Chat WhatsApp</WaButton>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
