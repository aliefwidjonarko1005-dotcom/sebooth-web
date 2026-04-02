"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";

interface PkgItem { duration?: string; total?: string; price: string; }

const defaultUnlimitedFeatures = [
    "Unlimited Physical Prints",
    "All Digital Files",
    "Custom Frame Design",
    "2 Professional On-Site Staff",
];

const defaultUnlimitedPackages: PkgItem[] = [
    { duration: "1 Hour", price: "Rp1.800.000" },
    { duration: "2 Hours", price: "Rp2.200.000" },
    { duration: "3 Hours", price: "Rp2.800.000" },
    { duration: "5 Hours", price: "Rp4.000.000" },
];

const defaultQuotaFeatures = [
    "Physical Prints (by quota)",
    "All Digital Files",
    "Standard Backdrop",
    "Instant QR Gallery",
];

const defaultQuotaPackages: PkgItem[] = [
    { total: "100 Prints", price: "Rp1.300.000" },
    { total: "200 Prints", price: "Rp2.400.000" },
    { total: "300 Prints", price: "Rp3.300.000" },
    { total: "400 Prints", price: "Rp4.200.000" },
    { total: "500 Prints", price: "Rp5.000.000" },
];

const defaultContent = {
    section_title: "PRICING PLANS",
    section_subtitle: "NO HIDDEN FEES. RAW HONESTY.",
    unlimited_title: "Unlimited Package",
    unlimited_subtitle: "FOR MASSIVE CELEBRATIONS",
    unlimited_badge: "BEST VALUE",
    unlimited_features: "",
    unlimited_packages: "",
    unlimited_cta: "SELECT UNLIMITED",
    unlimited_wa_text: "Halo Sebooth, saya tertarik dengan paket Unlimited. Bisa info lebih lanjut?",
    quota_title: "Quota Package",
    quota_subtitle: "FOR INTIMATE EVENTS",
    quota_features: "",
    quota_packages: "",
    quota_cta: "SELECT QUOTA",
    quota_wa_text: "Halo Sebooth, saya tertarik dengan paket Quota. Bisa info lebih lanjut?",
};

interface PricingProps {
    initialData?: Record<string, string>;
}

export function Pricing({ initialData = {} }: PricingProps) {
    const content = { ...defaultContent, ...initialData };

    const unlimitedFeatures = parseJsonContent<string[]>(content.unlimited_features, defaultUnlimitedFeatures);
    const unlimitedPackages = parseJsonContent<PkgItem[]>(content.unlimited_packages, defaultUnlimitedPackages);
    const quotaFeatures = parseJsonContent<string[]>(content.quota_features, defaultQuotaFeatures);
    const quotaPackages = parseJsonContent<PkgItem[]>(content.quota_packages, defaultQuotaPackages);

    const waBase = "https://wa.me/6285713899441?text=";

    return (
        <section id="pricing" className="py-24 px-6 md:px-20 bg-white paper-texture border-y-8 border-black">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 border-l-[12px] border-secondary pl-6"
            >
                <EditableText section="pricing" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-text-dark">
                    {content.section_title}
                </EditableText>
                <EditableText section="pricing" fieldKey="section_subtitle" defaultValue={content.section_subtitle} as="p" className="text-xl font-bold text-secondary marker-font" >
                    {content.section_subtitle}
                </EditableText>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Unlimited Package */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-primary p-12 border-2 border-black relative hard-shadow-orange"
                >
                    {content.unlimited_badge && (
                        <div className="absolute -top-6 left-6 bg-secondary text-white px-4 py-1 font-black uppercase text-sm border-2 border-black">
                            {content.unlimited_badge}
                        </div>
                    )}
                    <EditableText section="pricing" fieldKey="unlimited_title" defaultValue={content.unlimited_title} as="h3" className="text-white text-4xl font-black uppercase mb-2">
                        {content.unlimited_title}
                    </EditableText>
                    <EditableText section="pricing" fieldKey="unlimited_subtitle" defaultValue={content.unlimited_subtitle} as="p" className="text-white font-bold uppercase mb-8 opacity-80">
                        {content.unlimited_subtitle}
                    </EditableText>

                    <ul className="space-y-4 mb-8">
                        {unlimitedFeatures.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-white font-bold uppercase">
                                <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="border-t-2 border-white/20 pt-6 mb-8">
                        {unlimitedPackages.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-bold uppercase">{item.duration}</span>
                                <span className="text-white font-black text-lg">{item.price}</span>
                            </div>
                        ))}
                    </div>

                    <Link href={`${waBase}${encodeURIComponent(content.unlimited_wa_text)}`} target="_blank"
                        className="block w-full bg-white text-primary font-black uppercase py-4 border-2 border-black hover:bg-secondary hover:text-white transition-all duration-200 ease-out hard-shadow-black text-center">
                        {content.unlimited_cta}
                    </Link>
                </motion.div>

                {/* Quota Package */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-primary p-12 border-2 border-black relative hard-shadow-orange"
                >
                    <EditableText section="pricing" fieldKey="quota_title" defaultValue={content.quota_title} as="h3" className="text-white text-4xl font-black uppercase mb-2">
                        {content.quota_title}
                    </EditableText>
                    <EditableText section="pricing" fieldKey="quota_subtitle" defaultValue={content.quota_subtitle} as="p" className="text-white font-bold uppercase mb-8 opacity-80">
                        {content.quota_subtitle}
                    </EditableText>

                    <ul className="space-y-4 mb-8">
                        {quotaFeatures.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-white font-bold uppercase">
                                <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="border-t-2 border-white/20 pt-6 mb-8">
                        {quotaPackages.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-bold uppercase">{item.total}</span>
                                <span className="text-white font-black text-lg">{item.price}</span>
                            </div>
                        ))}
                    </div>

                    <Link href={`${waBase}${encodeURIComponent(content.quota_wa_text)}`} target="_blank"
                        className="block w-full bg-transparent text-white font-black uppercase py-4 border-2 border-white hover:bg-white hover:text-primary transition-all duration-200 ease-out hard-shadow-white text-center">
                        {content.quota_cta}
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
