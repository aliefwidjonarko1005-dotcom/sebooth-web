"use client";

import { motion } from "framer-motion";

const unlimitedPackages = [
    { duration: "1 Hour", price: "Rp1.800.000,00" },
    { duration: "2 Hours", price: "Rp2.200.000,00" },
    { duration: "3 Hours", price: "Rp2.800.000,00" },
    { duration: "5 Hours", price: "Rp4.000.000,00" },
];

const quotaPackages = [
    { total: "100 Prints", price: "Rp1.300.000,00" },
    { total: "200 Prints", price: "Rp2.400.000,00" },
    { total: "300 Prints", price: "Rp3.300.000,00" },
    { total: "400 Prints", price: "Rp4.200.000,00" },
    { total: "500 Prints", price: "Rp5.000.000,00" },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-32 bg-[#F9F9F9] border-t border-[#1A1A1A]/10">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 max-w-2xl"
                >
                    <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">Investment</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight">
                        Transparent Pricing.
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 md:gap-24">
                    {/* Unlimited Package */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Unlimited Package</h3>
                        <p className="text-[#1A1A1A]/60 mb-8 italic">All You Can Photo Experience</p>

                        <div className="border-t-2 border-[#1A1A1A] mb-8" />

                        <ul className="space-y-0">
                            {unlimitedPackages.map((item, index) => (
                                <li key={index} className="flex justify-between items-center py-6 border-b border-[#1A1A1A]/10 hover:bg-[#EAEAEA] transition-colors px-2 -mx-2">
                                    <span className="font-bold text-[#1A1A1A]">{item.duration}</span>
                                    <span className="font-medium text-[#1A1A1A]/80">{item.price}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Quota Package */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Quota Package</h3>
                        <p className="text-[#1A1A1A]/60 mb-8 italic">Print Quantity Based</p>

                        <div className="border-t-2 border-[#1A1A1A] mb-8" />

                        <ul className="space-y-0">
                            {quotaPackages.map((item, index) => (
                                <li key={index} className="flex justify-between items-center py-6 border-b border-[#1A1A1A]/10 hover:bg-[#EAEAEA] transition-colors px-2 -mx-2">
                                    <span className="font-bold text-[#1A1A1A]">{item.total}</span>
                                    <span className="font-medium text-[#1A1A1A]/80">{item.price}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
