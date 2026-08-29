"use client";

import { motion } from "framer-motion";
import {
    Download,
    ArrowRight,
    CheckCircle,
    ShieldCheck,
    Zap,
} from "lucide-react";

interface PartnershipContentProps {
    content: Record<string, string>;
}

export function PartnershipContent({ content }: PartnershipContentProps) {
    const headerLabel =
        content["header_label"] || "For Event Professionals";
    const headerTitle =
        content["header_title"] || "The Best Friend of \nEOs & WOs.";
    const headerDesc =
        content["header_desc"] ||
        'We understand that for an organizer, reliability is everything. Sebooth provides a "zero-worry" photobooth experience that fits seamlessly into your premium decor, backed by industrial-grade stability.';

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
    const ctaText = content["cta_text"] || "Download Partner Rate Card";
    const submitText = content["submit_text"] || "Apply for Partnership";

    return (
        <div className="min-h-screen bg-transparent pt-20">
            <div className="container mx-auto px-6 py-24">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl"
                >
                    <span className="text-secondary font-black uppercase tracking-widest text-sm mb-4 block">
                        [ {headerLabel} ]
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase text-white tracking-tighter leading-none mb-8 whitespace-pre-line">
                        {headerTitle}
                    </h1>
                    <p className="text-xl md:text-2xl font-bold uppercase text-white/80 leading-relaxed max-w-3xl mb-12">
                        {headerDesc}
                    </p>
                    <a
                        href="https://wa.me/6285713899441?text=Halo%20Sebooth,%20saya%20tertarik%20dengan%20kemitraan%20EO/WO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-black uppercase tracking-wider text-lg border-2 border-black hard-shadow-orange hover:bg-secondary transition-colors"
                    >
                        <Download className="w-6 h-6" />
                        {ctaText}
                    </a>
                </motion.div>

                {/* Benefits Grid */}
                <div className="mt-32">
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter mb-12">
                        {benefitsTitle}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-primary p-8 border-2 border-black hard-shadow-white"
                        >
                            <Zap className="w-12 h-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-black uppercase text-white mb-4">
                                {benefit1Title}
                            </h3>
                            <p className="text-white/80 font-bold uppercase text-sm leading-relaxed">
                                {benefit1Desc}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-primary p-8 border-2 border-black hard-shadow-orange"
                        >
                            <ShieldCheck className="w-12 h-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-black uppercase text-white mb-4">
                                {benefit2Title}
                            </h3>
                            <p className="text-white/80 font-bold uppercase text-sm leading-relaxed">
                                {benefit2Desc}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-primary p-8 border-2 border-black hard-shadow-blue"
                        >
                            <CheckCircle className="w-12 h-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-black uppercase text-white mb-4">
                                {benefit3Title}
                            </h3>
                            <p className="text-white/80 font-bold uppercase text-sm leading-relaxed">
                                {benefit3Desc}
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Contact / Inquiry Form */}
                <div className="mt-32 max-w-2xl bg-white p-8 md:p-12 border-2 border-black hard-shadow-black">
                    <h2 className="text-3xl md:text-4xl font-black uppercase text-text-dark tracking-tighter mb-4">
                        {formTitle}
                    </h2>
                    <p className="text-text-dark font-bold uppercase text-sm mb-8">
                        Hubungi tim kami langsung via WhatsApp untuk mendiskusikan peluang kolaborasi & penawaran khusus EO / WO.
                    </p>
                    <a
                        href="https://wa.me/6285713899441?text=Halo%20Sebooth,%20saya%20ingin%20mengajukan%20kemitraan%20resmi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-5 bg-primary text-white font-black uppercase tracking-wider text-lg border-2 border-black flex items-center justify-center gap-3 hard-shadow-orange hover:bg-black transition-colors"
                    >
                        {submitText}
                        <ArrowRight className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </div>
    );
}
