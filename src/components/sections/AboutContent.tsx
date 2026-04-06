"use client";

import { motion } from "framer-motion";
import { EditableText } from "@/components/admin/EditableText";
import { EditableImage } from "@/components/admin/EditableImage";

interface AboutContentProps {
    content: Record<string, string>;
}

/**
 * Client component for the About page.
 * Receives CMS content from the Server Component parent.
 * Framer Motion requires 'use client'.
 */
export function AboutContent({ content }: AboutContentProps) {
    // CMS keys with hardcoded fallbacks
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
            titleKey: "step1_title",
            descKey: "step1_desc",
            title: step1Title,
            desc: step1Desc,
            shadow: "hard-shadow-black",
        },
        {
            num: "02",
            titleKey: "step2_title",
            descKey: "step2_desc",
            title: step2Title,
            desc: step2Desc,
            shadow: "hard-shadow-blue",
        },
        {
            num: "03",
            titleKey: "step3_title",
            descKey: "step3_desc",
            title: step3Title,
            desc: step3Desc,
            shadow: "hard-shadow-orange",
        },
    ];

    return (
        <div className="min-h-screen bg-white paper-texture">
            {/* Hero Narrative */}
            <section className="px-6 md:px-20 py-24 md:py-32 bg-primary relative overflow-hidden">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl z-10 relative"
                    >
                        <EditableText section="about_page" fieldKey="hero_label" defaultValue={heroLabel} as="p" className="text-lg font-bold uppercase text-white/60 mb-4">
                            [ {heroLabel} ]
                        </EditableText>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-12 tracking-tighter leading-[0.9] uppercase">
                            <EditableText section="about_page" fieldKey="hero_title_1" defaultValue={heroTitle1} as="span" className="text-white text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                                {heroTitle1}
                            </EditableText>
                            <br />
                            <EditableText section="about_page" fieldKey="hero_title_2" defaultValue={heroTitle2} as="span" className="text-secondary scribble-underline italic marker-font normal-case text-5xl md:text-8xl" style={{ textShadow: "none" }}>
                                {heroTitle2}
                            </EditableText>
                        </h1>
                        <div className="space-y-8 text-xl md:text-2xl text-white font-bold uppercase leading-relaxed max-w-3xl">
                            <EditableText section="about_page" fieldKey="hero_paragraph_1" defaultValue={heroParagraph1} as="p" className="text-xl md:text-2xl text-white font-bold uppercase leading-relaxed">
                                {heroParagraph1}
                            </EditableText>
                            <EditableText section="about_page" fieldKey="hero_paragraph_2" defaultValue={heroParagraph2} as="p" className="text-xl md:text-2xl text-white font-bold uppercase leading-relaxed">
                                {heroParagraph2}
                            </EditableText>
                        </div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative h-[400px] md:h-[500px] w-full border-4 border-white/20 overflow-hidden flex items-center justify-center"
                    >
                        {content["hero_image"] ? (
                            <EditableImage
                                section="about_page"
                                fieldKey="hero_image"
                                defaultValue={content["hero_image"]}
                                className="w-full h-full object-cover"
                                altText="About Sebooth Hero"
                            />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center bg-white/5">
                                <EditableImage
                                    section="about_page"
                                    fieldKey="hero_image"
                                    defaultValue=""
                                    className="w-full h-full object-cover"
                                    altText="About Sebooth Hero"
                                />
                                <span className="absolute text-white/30 font-black uppercase text-sm pointer-events-none">[Upload Hero Image]</span>
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
            <section className="py-24 px-6 md:px-20 bg-white paper-texture border-y-8 border-black">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Vision */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-primary p-12 border-2 border-black hard-shadow-orange"
                    >
                        <EditableText section="about_page" fieldKey="vision_label" defaultValue={visionLabel} as="p" className="text-secondary font-black uppercase text-sm mb-4 border-b-2 border-white/20 pb-4">
                            {visionLabel}
                        </EditableText>
                        <EditableText section="about_page" fieldKey="vision_title" defaultValue={visionTitle} as="h2" className="text-3xl md:text-4xl font-black uppercase text-white mb-8 tracking-tighter">
                            {visionTitle}
                        </EditableText>
                        <EditableText section="about_page" fieldKey="vision_text" defaultValue={visionText} as="p" className="text-lg text-white font-bold uppercase leading-relaxed">
                            {visionText}
                        </EditableText>

                        {/* Vision Image */}
                        <div className="mt-8 h-[200px] border-2 border-white/20 overflow-hidden flex items-center justify-center">
                            {content["vision_image"] ? (
                                <EditableImage
                                    section="about_page"
                                    fieldKey="vision_image"
                                    defaultValue={content["vision_image"]}
                                    className="w-full h-full object-cover"
                                    altText="Vision Image"
                                />
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center bg-white/5">
                                    <EditableImage
                                        section="about_page"
                                        fieldKey="vision_image"
                                        defaultValue=""
                                        className="w-full h-full object-cover"
                                        altText="Vision Image"
                                    />
                                    <span className="absolute text-white/30 font-black uppercase text-xs pointer-events-none">[Upload Image]</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <EditableText section="about_page" fieldKey="mission_label" defaultValue={missionLabel} as="p" className="text-primary font-black uppercase text-sm mb-4">
                            {missionLabel}
                        </EditableText>
                        <EditableText section="about_page" fieldKey="mission_title" defaultValue={missionTitle} as="h2" className="text-3xl md:text-4xl font-black uppercase text-text-dark mb-8 tracking-tighter">
                            {missionTitle}
                        </EditableText>
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
                                        <EditableText section="about_page" fieldKey={step.titleKey} defaultValue={step.title} as="h3" className="text-xl font-black uppercase text-text-dark mb-2">
                                            {step.title}
                                        </EditableText>
                                        <EditableText section="about_page" fieldKey={step.descKey} defaultValue={step.desc} as="p" className="text-text-dark font-bold uppercase text-sm">
                                            {step.desc}
                                        </EditableText>
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
                    <EditableText section="about_page" fieldKey="footer_quote_1" defaultValue={footerQuote1} as="span" className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">
                        {footerQuote1}
                    </EditableText>
                    <br />
                    <EditableText section="about_page" fieldKey="footer_quote_2" defaultValue={footerQuote2} as="span" className="text-secondary marker-font normal-case text-4xl md:text-6xl" style={{ textShadow: "none" }}>
                        {footerQuote2}
                    </EditableText>
                    &quot;
                </h2>
            </section>
        </div>
    );
}
