"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F9F9F9] pt-20">

            {/* Hero Narrative */}
            <section className="container mx-auto px-6 py-24 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-6 block">Our Story</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-[#1A1A1A] mb-12 tracking-tighter leading-none">
                        Membangun <br /> Kenangan.
                    </h1>
                    <div className="space-y-8 text-xl md:text-2xl text-[#1A1A1A]/80 leading-relaxed font-medium">
                        <p>
                            Sebooth lahir dari sebuah pertanyaan sederhana: <span className="text-[#1A1A1A]">&quot;Bagaimana kita bisa membuat momen singkat menjadi abadi?&quot;</span>
                        </p>
                        <p>
                            Bermula dari garasi kecil di Semarang, kami menggabungkan presisi teknik dengan seni fotografi. Kami percaya bahwa photobooth bukan sekadar mesin, melainkan jembatan interaksi antar manusia yang seringkali terlupakan di era digital.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Vision & Mission (Mimpi Besar & Langkah Kecil) */}
            <section className="bg-[#1A1A1A] text-[#F9F9F9] py-32">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20">

                    {/* Left: Vision */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">Mimpi Besar</h2>
                        <p className="text-lg text-white/70 leading-relaxed">
                            Menjadi standar emas dalam industri <em>event experience</em> di Indonesia, di mana teknologi dan keramahtamahan berpadu untuk menciptakan kebahagiaan yang nyata. Kami ingin Sebooth hadir di setiap kota, menjadi bagian dari jutaan senyuman.
                        </p>
                    </motion.div>

                    {/* Right: Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">Langkah Kecil</h2>
                        <ul className="space-y-8">
                            <li className="flex gap-6 border-b border-white/10 pb-8">
                                <span className="text-[#D4AF37] font-bold text-xl">01</span>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Technical Excellence</h3>
                                    <p className="text-white/60">Terus berinovasi dengan peralatan optik dan cetak terbaik di kelasnya untuk hasil tanpa kompromi.</p>
                                </div>
                            </li>
                            <li className="flex gap-6 border-b border-white/10 pb-8">
                                <span className="text-[#D4AF37] font-bold text-xl">02</span>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Human Connection</h3>
                                    <p className="text-white/60">Melatih tim kami bukan hanya sebagai operator, tapi sebagai pemandu kebahagiaan di setiap acara.</p>
                                </div>
                            </li>
                            <li className="flex gap-6 pb-8">
                                <span className="text-[#D4AF37] font-bold text-xl">03</span>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Sustainable Growth</h3>
                                    <p className="text-white/60">Tumbuh bersama mitra lokal melalui sistem kemitraan yang adil dan transparan.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* Footer Quote */}
            <section className="py-32 container mx-auto px-6 text-center">
                <h2 className="text-2xl md:text-4xl font-serif italic text-[#1A1A1A]/60">
                    &quot;Every picture tells a story. Let us help you write yours.&quot;
                </h2>
            </section>

        </div>
    );
}
