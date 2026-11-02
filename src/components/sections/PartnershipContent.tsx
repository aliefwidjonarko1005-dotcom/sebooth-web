"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/config/social";

interface PartnershipContentProps {
    content: Record<string, string>;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// One strip from each of three client events: every event prints on its own frame
const CLIENT_STRIPS = [
    {
        src: "/images/gallery/hd/strip_49ab1cee.webp",
        alt: "Photostrip Sebooth berbingkai acara Fakultas Hukum",
    },
    {
        src: "/images/gallery/hd/strip_a429b5f8.webp",
        alt: "Photostrip Sebooth berbingkai acara Fakultas Kedokteran",
    },
    {
        src: "/images/gallery/hd/strip_6e34e142.webp",
        alt: "Photostrip Sebooth berbingkai acara Fakultas Teknik",
    },
];

const CLOSE_PHOTO = {
    src: "/images/gallery/hd/photo_5b47bc90_2.webp",
    alt: "Rombongan tamu berselempang berpose di photobooth Sebooth",
};

export function PartnershipContent({ content }: PartnershipContentProps) {
    const reduceMotion = useReducedMotion();
    const headerTitle =
        content["header_title"] || "The Best Friend of \nEOs & WOs.";
    const headerDesc =
        content["header_desc"] ||
        'We understand that for an organizer, reliability is everything. Sebooth provides a "zero-worry" photobooth experience that fits into your premium decor, backed by industrial-grade stability.';

    const benefitsTitle = content["benefits_title"] || "Partner Benefits";

    const benefit1Title = content["benefit1_title"] || "Lucrative Commission";
    const benefit1Desc =
        content["benefit1_desc"] ||
        "Earn a transparent 10-15% commission on every booking, or choose a net-rate scheme to markup as you please.";
    const benefit2Title = content["benefit2_title"] || "Whitelabel Option";
    const benefit2Desc =
        content["benefit2_desc"] ||
        'Your brand, not ours. For premium events, we offer a fully unbranded "Ghost Mode" where the booth appears as your in-house service.';
    const benefit3Title =
        content["benefit3_title"] || "Dedicated Coordinator";
    const benefit3Desc =
        content["benefit3_desc"] ||
        "Direct access to a technical lead. No call centers, no delays. Priority support for all your events.";

    const formTitle = content["form_title"] || "Join Our Network";
    // The button opens a WhatsApp chat (its icon says so), not a download
    const ctaText = content["cta_text"] || "Minta Rate Card";
    const submitText = content["submit_text"] || "Apply for Partnership";

    const benefits = [
        { title: benefit1Title, desc: benefit1Desc },
        { title: benefit2Title, desc: benefit2Desc },
        { title: benefit3Title, desc: benefit3Desc },
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
            {/* Hero: the offer to organisers beside strips printed on their clients' frames */}
            <section className="bg-primary px-5 pt-28 pb-20 text-white md:px-10 md:pt-40 md:pb-32">
                <div className="mx-auto max-w-6xl">
                    {/* Full width so the two lines never break again inside a column */}
                    <motion.h1
                        {...slide()}
                        className="font-bayon text-[3.25rem] leading-[0.92] uppercase md:text-[clamp(4.5rem,9vw,6.5rem)] md:whitespace-pre-line"
                    >
                        {headerTitle}
                    </motion.h1>
                </div>
                <div className="mx-auto mt-6 grid max-w-6xl gap-y-12 md:mt-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-x-16">
                    <div>
                        <motion.p
                            {...slide(0.08)}
                            className="max-w-[46ch] text-xl leading-snug"
                        >
                            {headerDesc}
                        </motion.p>
                        <motion.a
                            {...slide(0.16)}
                            href={whatsappUrl("Halo Sebooth, saya tertarik dengan kemitraan EO/WO. Boleh minta rate card partner?")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-10 inline-flex min-h-14 items-center gap-3 rounded-full bg-secondary px-7 text-xl font-bold whitespace-nowrap text-white transition-colors hover:bg-orange-press focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.98]"
                        >
                            <MessageCircle className="h-5 w-5" aria-hidden="true" />
                            {ctaText}
                            <span className="sr-only"> via WhatsApp</span>
                        </motion.a>
                    </div>
                    <motion.div {...slide(0.1)} className="grid grid-cols-3 gap-2 md:gap-3">
                        {CLIENT_STRIPS.map((strip) => (
                            <div key={strip.src} className="relative aspect-[1/3] overflow-hidden">
                                {/* Each print holds two identical strips side by side; show one */}
                                <Image
                                    src={strip.src}
                                    alt={strip.alt}
                                    fill
                                    priority
                                    sizes="(min-width: 768px) 150px, 30vw"
                                    className="object-cover object-left"
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Benefits: what a partner gets, one line each */}
            <section className="px-5 py-24 md:px-10 md:py-40">
                <div className="mx-auto max-w-6xl">
                    <motion.h2
                        {...rise()}
                        className="font-bayon text-5xl leading-[0.95] text-primary uppercase md:text-7xl"
                    >
                        {benefitsTitle}
                    </motion.h2>
                    <ul className="mt-12 space-y-12 md:mt-20 md:space-y-16">
                        {benefits.map((benefit, i) => (
                            <motion.li
                                key={benefit.title}
                                {...rise(i * 0.08)}
                                className="md:grid md:grid-cols-12 md:gap-8"
                            >
                                <h3 className="font-bayon text-[1.75rem] leading-none text-primary uppercase md:col-span-5 md:text-[2.5rem]">
                                    {benefit.title}
                                </h3>
                                <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-blue-dark md:col-span-7 md:mt-0 md:text-lg">
                                    {benefit.desc}
                                </p>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Close: guests at a Sebooth booth, then the application straight to the team */}
            <section className="bg-secondary px-5 py-24 md:px-10 md:py-36">
                <div className="mx-auto grid max-w-6xl gap-y-10 md:grid-cols-12 md:items-center md:gap-x-8">
                    <motion.div
                        {...rise()}
                        className="relative aspect-[4/5] overflow-hidden md:col-span-5"
                    >
                        <Image
                            src={CLOSE_PHOTO.src}
                            alt={CLOSE_PHOTO.alt}
                            fill
                            sizes="(min-width: 768px) 40vw, 100vw"
                            className="object-cover"
                        />
                    </motion.div>
                    <div className="md:col-span-6 md:col-start-7">
                        <motion.h2
                            {...rise()}
                            className="font-bayon text-5xl leading-[0.95] text-blue-dark uppercase md:text-7xl"
                        >
                            {formTitle}
                        </motion.h2>
                        <motion.p
                            {...rise(0.08)}
                            className="mt-5 text-[17px] leading-relaxed font-medium text-blue-dark md:text-lg"
                        >
                            Hubungi tim kami langsung via WhatsApp untuk mendiskusikan peluang kolaborasi & penawaran khusus EO / WO.
                        </motion.p>
                        <motion.a
                            {...rise(0.16)}
                            href={whatsappUrl("Halo Sebooth, saya ingin mengajukan kemitraan resmi")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-blue-dark px-7 text-[17px] font-bold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-dark active:scale-[0.98] md:text-lg"
                        >
                            {submitText}
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </motion.a>
                    </div>
                </div>
            </section>
        </div>
    );
}
