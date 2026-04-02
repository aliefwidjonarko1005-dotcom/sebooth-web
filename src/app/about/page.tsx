"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white paper-texture">

            {/* Hero Narrative */}
            <section className="px-6 md:px-20 py-24 md:py-32 bg-primary relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl z-10 relative"
                >
                    <p className="text-lg font-bold uppercase text-white/60 mb-4">[ OUR STORY ]</p>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-12 tracking-tighter leading-[0.9] uppercase">
                        Membangun <br />
                        <span className="text-secondary scribble-underline italic marker-font normal-case" style={{ textShadow: "none" }}>
                            Kenangan.
                        </span>
                    </h1>
                    <div className="space-y-8 text-xl md:text-2xl text-white font-bold uppercase leading-relaxed max-w-3xl">
                        <p>
                            Sebooth lahir dari sebuah pertanyaan sederhana: <span className="text-secondary">&quot;Bagaimana kita bisa membuat momen singkat menjadi abadi?&quot;</span>
                        </p>
                        <p>
                            Bermula dari garasi kecil di Semarang, kami menggabungkan presisi teknik dengan seni fotografi. Kami percaya bahwa photobooth bukan sekadar mesin, melainkan jembatan interaksi antar manusia.
                        </p>
                    </div>
                </motion.div>

                {/* Background Watermark */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none select-none">
                    <span className="text-[20rem] font-black text-white leading-none">AB.</span>
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
                        <p className="text-secondary font-black uppercase text-sm mb-4 border-b-2 border-white/20 pb-4">MIMPI BESAR</p>
                        <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-8 tracking-tighter">
                            Our Vision
                        </h2>
                        <p className="text-lg text-white font-bold uppercase leading-relaxed">
                            Menjadi standar emas dalam industri <em className="text-secondary">event experience</em> di Indonesia, di mana teknologi dan keramahtamahan berpadu untuk menciptakan kebahagiaan yang nyata. Kami ingin Sebooth hadir di setiap kota, menjadi bagian dari jutaan senyuman.
                        </p>
                    </motion.div>

                    {/* Right: Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-primary font-black uppercase text-sm mb-4">LANGKAH KECIL</p>
                        <h2 className="text-3xl md:text-4xl font-black uppercase text-text-dark mb-8 tracking-tighter">
                            Our Mission
                        </h2>
                        <ul className="space-y-0">
                            {[
                                {
                                    num: "01",
                                    title: "Technical Excellence",
                                    desc: "Terus berinovasi dengan peralatan optik dan cetak terbaik di kelasnya untuk hasil tanpa kompromi.",
                                    shadow: "hard-shadow-black",
                                },
                                {
                                    num: "02",
                                    title: "Human Connection",
                                    desc: "Melatih tim kami bukan hanya sebagai operator, tapi sebagai pemandu kebahagiaan di setiap acara.",
                                    shadow: "hard-shadow-blue",
                                },
                                {
                                    num: "03",
                                    title: "Sustainable Growth",
                                    desc: "Tumbuh bersama mitra lokal melalui sistem kemitraan yang adil dan transparan.",
                                    shadow: "hard-shadow-orange",
                                },
                            ].map((step) => (
                                <div key={step.num} className={`flex gap-6 p-6 border-2 border-black mb-4 bg-white ${step.shadow}`}>
                                    <span className="text-secondary font-black text-3xl">{step.num}</span>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-text-dark mb-2">{step.title}</h3>
                                        <p className="text-text-dark font-bold uppercase text-sm">{step.desc}</p>
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
                    &quot;EVERY PICTURE TELLS A STORY. <br />
                    <span className="text-secondary marker-font normal-case text-4xl md:text-6xl" style={{ textShadow: "none" }}>
                        Let us help you write yours.
                    </span>&quot;
                </h2>
            </section>

        </div>
    );
}
