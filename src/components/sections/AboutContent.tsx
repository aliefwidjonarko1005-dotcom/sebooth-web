"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/config/social";

interface AboutContentProps {
    content: Record<string, string>;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Sebooth's own print stands in for the hero picture until the CMS supplies one
const HERO_PRINT = {
    src: "/images/gallery/hd/strip_225fd0b3.webp",
    alt: "Cetakan photostrip Sebooth berbingkai acara FISIP, dua strip dalam satu lembar",
};

const STEP_PHOTOS = [
    {
        src: "/images/products/mini_studio_booth.webp",
        alt: "Mini studio Sebooth dengan kamera dan lampu di sebuah acara kampus",
    },
    {
        src: "/images/gallery/hd/photo_69650726_4.webp",
        alt: "Rombongan tamu berjaket kuning berpose di depan kamera Sebooth",
    },
    {
        src: "/images/products/vending_machine_booth.webp",
        alt: "Mesin photobooth Sebooth di Lapangan Widya Puraya",
    },
];

export function AboutContent({ content }: AboutContentProps) {
    const reduceMotion = useReducedMotion();
    const heroTitle1 = content["hero_title_1"] || "Membangun";
    const heroTitle2 = content["hero_title_2"] || "Kenangan.";
    const heroParagraph1 =
        content["hero_paragraph_1"] ||
        'Sebooth lahir dari sebuah pertanyaan sederhana: "Bagaimana kita bisa membuat momen singkat menjadi abadi?"';
    const heroParagraph2 =
        content["hero_paragraph_2"] ||
        "Bermula dari garasi kecil di Semarang, kami menggabungkan presisi teknik dengan seni fotografi. Kami percaya bahwa photobooth bukan sekadar mesin, melainkan jembatan interaksi antar manusia.";
    const heroImage = content["hero_image"]
        ? { src: content["hero_image"], alt: "Sebooth di sebuah acara" }
        : HERO_PRINT;

    const visionTitle = content["vision_title"] || "Our Vision";
    const visionText =
        content["vision_text"] ||
        "Menjadi standar emas dalam industri event experience di Indonesia, di mana teknologi dan keramahtamahan berpadu untuk menciptakan kebahagiaan yang nyata. Kami ingin Sebooth hadir di setiap kota, menjadi bagian dari jutaan senyuman.";

    const missionTitle = content["mission_title"] || "Our Mission";

    const step1Title = content["step1_title"] || "Technical Excellence";
    const step1Desc =
        content["step1_desc"] ||
        "Terus berinovasi dengan peralatan optik dan cetak terbaik di kelasnya untuk hasil tanpa kompromi.";
    const step2Title = content["step2_title"] || "Human Connection";
    const step2Desc =
        content["step2_desc"] ||
        "Melatih tim kami bukan hanya sebagai operator, tapi sebagai pemandu kebahagiaan di setiap acara.";
    const step3Title = content["step3_title"] || "Sustainable Growth";
    const step3Desc =
        content["step3_desc"] ||
        "Tumbuh bersama mitra lokal melalui sistem kemitraan yang adil dan transparan.";

    const footerQuote1 =
        content["footer_quote_1"] || "Every picture tells a story.";
    const footerQuote2 =
        content["footer_quote_2"] || "Let us help you write yours.";

    const steps = [
        { title: step1Title, desc: step1Desc, photo: STEP_PHOTOS[0] },
        { title: step2Title, desc: step2Desc, photo: STEP_PHOTOS[1] },
        { title: step3Title, desc: step3Desc, photo: STEP_PHOTOS[2] },
    ];

    // The hero only slides (its H1 must be readable on first paint); later parts rise in once
    const slide = (delay = 0) =>
        reduceMotion
            ? {}
            : {
                  initial: { y: 24 },
                  animate: { y: 0 },
                  transition: { duration: 0.8, delay, ease: EASE },
              };
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
        <div className="min-h-svh">
            {/* Hero: the story beside a real Sebooth print */}
            <section className="bg-primary px-5 pt-28 pb-20 text-white md:px-10 md:pt-40 md:pb-32">
                {/* Last row takes the slack so the print's height doesn't pry the text apart */}
                <div className="mx-auto grid max-w-6xl gap-y-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:grid-rows-[auto_auto_1fr] md:gap-x-16">
                    <motion.h1
                        {...slide()}
                        className="font-bayon text-[4rem] leading-[0.9] uppercase md:text-[clamp(4rem,10vw,7.5rem)]"
                    >
                        {heroTitle1} {heroTitle2}
                    </motion.h1>
                    <motion.p
                        {...slide(0.08)}
                        className="max-w-[34ch] text-xl leading-snug font-medium md:col-start-1 lg:text-[1.75rem]"
                    >
                        {heroParagraph1}
                    </motion.p>
                    <motion.div
                        initial={reduceMotion ? false : { scale: 1.04 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.2, ease: EASE }}
                        className="relative aspect-[2/3] w-full overflow-hidden md:col-start-2 md:row-span-3 md:row-start-1 md:self-start"
                    >
                        <Image
                            src={heroImage.src}
                            alt={heroImage.alt}
                            fill
                            priority
                            sizes="(min-width: 768px) 40vw, 100vw"
                            className="object-cover"
                        />
                    </motion.div>
                    <motion.p
                        {...slide(0.16)}
                        className="max-w-[52ch] text-[17px] leading-relaxed md:col-start-1 md:text-lg"
                    >
                        {heroParagraph2}
                    </motion.p>
                </div>
            </section>

            {/* Vision: one statement */}
            <section className="px-5 py-24 md:px-10 md:py-40">
                <div className="mx-auto grid max-w-6xl gap-y-6 md:grid-cols-12 md:gap-x-8">
                    <motion.h2
                        {...rise()}
                        className="font-bayon text-5xl leading-[0.95] text-primary uppercase md:col-span-4 md:text-7xl"
                    >
                        {visionTitle}
                    </motion.h2>
                    <motion.p
                        {...rise(0.08)}
                        className="text-xl leading-snug font-medium text-blue-dark md:col-span-8 lg:text-[1.75rem] lg:leading-[1.3]"
                    >
                        {visionText}
                    </motion.p>
                    {content["vision_image"] && (
                        <motion.div
                            {...rise(0.16)}
                            className="relative aspect-[16/9] overflow-hidden md:col-span-8 md:col-start-5"
                        >
                            <Image
                                src={content["vision_image"]}
                                alt="Visi Sebooth"
                                fill
                                sizes="(min-width: 768px) 60vw, 100vw"
                                className="object-cover"
                            />
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Mission: three commitments, each beside a picture of where it shows */}
            <section className="bg-white px-5 py-24 md:px-10 md:py-40">
                <div className="mx-auto max-w-6xl">
                    <motion.h2
                        {...rise()}
                        className="font-bayon text-5xl leading-[0.95] text-primary uppercase md:text-7xl"
                    >
                        {missionTitle}
                    </motion.h2>
                    <ul className="mt-12 space-y-12 md:mt-20 md:space-y-16">
                        {steps.map((step, i) => (
                            <motion.li
                                key={step.title}
                                {...rise(i * 0.08)}
                                className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-5 md:grid-cols-12 md:gap-8"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-lg md:col-span-2">
                                    <Image
                                        src={step.photo.src}
                                        alt={step.photo.alt}
                                        fill
                                        sizes="(min-width: 768px) 180px, 88px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="md:col-span-10 md:grid md:grid-cols-10 md:gap-8">
                                    <h3 className="font-bayon text-[1.75rem] leading-none text-primary uppercase md:col-span-4 md:text-[2.5rem]">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-[17px] leading-relaxed text-blue-dark md:col-span-6 md:mt-0 md:text-lg">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Close: the line the page ends on, and the booking it leads to */}
            <section className="bg-secondary px-5 py-24 md:px-10 md:py-36">
                <div className="mx-auto max-w-6xl">
                    <motion.h2
                        {...rise()}
                        className="max-w-[16ch] font-bayon text-5xl leading-[0.95] text-blue-dark uppercase md:text-7xl"
                    >
                        {footerQuote1}
                    </motion.h2>
                    <motion.p
                        {...rise(0.08)}
                        className="mt-5 text-xl font-medium text-blue-dark md:text-[1.75rem]"
                    >
                        {footerQuote2}
                    </motion.p>
                    <motion.a
                        {...rise(0.16)}
                        href={whatsappUrl("Halo Sebooth, saya ingin booking photobooth untuk acara saya!")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-10 inline-flex min-h-14 items-center gap-3 rounded-full bg-blue-dark px-7 text-[17px] font-bold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-dark active:scale-[0.98] md:text-lg"
                    >
                        <MessageCircle className="h-5 w-5" aria-hidden="true" />
                        Booking via WhatsApp
                    </motion.a>
                </div>
            </section>
        </div>
    );
}
