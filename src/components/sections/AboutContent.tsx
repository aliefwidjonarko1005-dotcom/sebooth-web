"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface AboutContentProps {
    content: Record<string, string>;
}

export function AboutContent({ content }: AboutContentProps) {
    const heroLabel = content["hero_label"] || "OUR STORY";
    const heroTitle1 = content["hero_title_1"] || "Membangun";
    const heroTitle2 = content["hero_title_2"] || "Kenangan.";
    const heroParagraph1 =
        content["hero_paragraph_1"] ||
        'Sebooth lahir dari sebuah pertanyaan sederhana: "Bagaimana kita bisa membuat momen singkat menjadi abadi?"';
    const heroParagraph2 =
        content["hero_paragraph_2"] ||
        "Bermula dari garasi kecil di Semarang, kami menggabungkan presisi teknik dengan seni fotografi. Kami percaya bahwa photobooth bukan sekadar mesin, melainkan jembatan interaksi antar manusia.";

    const visionLabel = content["vision_label"] || "MIMPI BESAR";
    const visionTitle = content["vision_title"] || "Our Vision";
    const visionText =
        content["vision_text"] ||
        "Menjadi standar emas dalam industri event experience di Indonesia, di mana teknologi dan keramahtamahan berpadu untuk menciptakan kebahagiaan yang nyata. Kami ingin Sebooth hadir di setiap kota, menjadi bagian dari jutaan senyuman.";

    const missionLabel = content["mission_label"] || "LANGKAH KECIL";
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
        content["footer_quote_1"] || "EVERY PICTURE TELLS A STORY.";
    const footerQuote2 =
        content["footer_quote_2"] || "Let us help you write yours.";

    const steps = [
        {
            num: "01",
            title: step1Title,
            desc: step1Desc,
            shadow: "hard-shadow-black",
        },
        {
            num: "02",
            title: step2Title,
            desc: step2Desc,
            shadow: "hard-shadow-blue",
        },
        {
            num: "03",
            title: step3Title,
            desc: step3Desc,
            shadow: "hard-shadow-orange",
        },
    ];

    return (
        <div className="min-h-screen bg-transparent paper-texture">
            {/* Hero Narrative */}
            <section className="px-6 md:px-20 py-24 md:py-32 bg-primary relative overflow-hidden">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl z-10 relative"
                    >
                        <p className="text-lg font-bold uppercase text-white/60 mb-4">
                            [ {heroLabel} ]
                        </p>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-12 tracking-tighter leading-[0.9] uppercase">
                            <span className="text-white text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                                {heroTitle1}
                            </span>
                            <br />
                            <span className="text-secondary scribble-underline italic marker-font normal-case text-5xl md:text-8xl" style={{ textShadow: "none" }}>
                                {heroTitle2}
                            </span>
                        </h1>
                        <div className="space-y-8 text-xl md:text-2xl text-white font-bold uppercase leading-relaxed max-w-3xl">
                            <p className="text-xl md:text-2xl text-white font-bold uppercase leading-relaxed">
                                {heroParagraph1}
                            </p>
                            <p className="text-xl md:text-2xl text-white font-bold uppercase leading-relaxed">
                                {heroParagraph2}
                            </p>
                        </div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative h-[400px] md:h-[500px] w-full border-4 border-white/20 overflow-hidden flex items-center justify-center bg-slate-900"
                    >
                        {content["hero_image"] ? (
                            <Image
                                src={content["hero_image"]}
                                alt="About Sebooth Hero"
                                fill
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center bg-white/5">
                                <span className="text-white/40 font-black uppercase text-sm">Sebooth Photo Booth</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Background Watermark */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none select-none">
                    <span className="text-[20rem] font-black text-white leading-none">
                        AB.
                    </span>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-24 px-6 md:px-20 bg-transparent paper-texture">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Vision */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-primary p-12 border-2 border-black hard-shadow-orange"
                    >
                        <p className="text-secondary font-black uppercase text-sm mb-4 border-b-2 border-white/20 pb-4">
                            {visionLabel}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-8 tracking-tighter">
                            {visionTitle}
                        </h2>
                        <p className="text-lg text-white font-bold uppercase leading-relaxed">
                            {visionText}
                        </p>

                        {/* Vision Image */}
                        {content["vision_image"] && (
                            <div className="mt-8 h-[200px] border-2 border-white/20 overflow-hidden relative">
                                <Image
                                    src={content["vision_image"]}
                                    alt="Vision Image"
                                    fill
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Right: Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-primary font-black uppercase text-sm mb-4">
                            {missionLabel}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black uppercase text-text-dark mb-8 tracking-tighter">
                            {missionTitle}
                        </h2>
                        <ul className="space-y-0">
                            {steps.map((step) => (
                                <div
                                    key={step.num}
                                    className={`flex gap-6 p-6 border-2 border-black mb-4 bg-white ${step.shadow}`}
                                >
                                    <span className="text-secondary font-black text-3xl">
                                        {step.num}
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-text-dark mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-text-dark font-bold uppercase text-sm">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* Footer Quote */}
            <section className="py-32 px-6 md:px-20 bg-primary text-center relative overflow-hidden">
                <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter leading-tight max-w-4xl mx-auto">
                    &quot;
                    <span className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">
                        {footerQuote1}
                    </span>
                    <br />
                    <span className="text-secondary marker-font normal-case text-4xl md:text-6xl" style={{ textShadow: "none" }}>
                        {footerQuote2}
                    </span>
                    &quot;
                </h2>
            </section>
        </div>
    );
}
