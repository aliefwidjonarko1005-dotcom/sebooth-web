"use client";

import Link from "next/link";
import { EditableText } from "@/components/admin/EditableText";
import { RotatingBadge } from "@/components/ui/RotatingBadge";

const socialLinks = [
    { name: "INSTAGRAM", href: "https://instagram.com/sebooth.photobooth" },
    { name: "TIKTOK", href: "https://tiktok.com/@sebooth.photobooth" },
    { name: "WHATSAPP", href: "https://wa.me/6285713899441" },
];

export function Footer() {
    return (
        <footer className="bg-[#afd8fb] relative overflow-hidden select-none">
            {/* Floating Decorative Yellow Balls */}
            <div className="absolute bottom-10 left-12 w-16 h-16 rounded-full bg-[#fff500] opacity-80 pointer-events-none z-0" />
            <div className="absolute top-12 right-20 w-24 h-24 rounded-full bg-[#f4ced3] opacity-70 pointer-events-none z-0" />

            {/* CTA Banner */}
            <div className="py-20 md:py-32 px-6 md:px-20 text-center relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <span className="text-[#2b6786] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#2b6786]/20 inline-block mb-4">
                        ✦ SEBOOTH PHOTOBOOTH CONSULTATION ✦
                    </span>

                    <EditableText
                        section="footer"
                        fieldKey="cta_heading"
                        defaultValue="SIAP ABADIKAN MOMEN SERUMU?"
                        as="h2"
                        className="h1 text-[#2b6786] font-bayon uppercase leading-[0.8] tracking-[-0.04em] mb-8"
                    >
                        SIAP ABADIKAN MOMEN SERUMU?
                    </EditableText>

                    <p className="text-sm md:text-xl font-semibold text-[#2b6786] uppercase max-w-xl mb-10 leading-relaxed">
                        Hubungi tim Sebooth hari ini untuk berkonsultasi mengenai tanggal event, paket unlimited, & custom frame overlay!
                    </p>

                    <div className="flex items-center justify-center">
                        <RotatingBadge
                            text="SEBOOTH PHOTOBOOTH • GET QUOTE TODAY • "
                            btnText="CHAT US"
                            bgColor="#2b6786"
                            textColor="#ffffff"
                            size={145}
                            href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya."
                        />
                    </div>
                </div>
            </div>

            {/* Footer Bottom Bar */}
            <div className="bg-[#2b6786] text-white flex flex-col md:flex-row justify-between items-center w-full px-8 py-8 gap-6 relative z-10 safe-bottom">
                <div className="text-3xl font-black font-bayon uppercase tracking-tight text-white">
                    sebooth.
                </div>
                <div className="font-bold uppercase text-[0.7rem] tracking-widest text-center text-white/80">
                    © {new Date().getFullYear()} SEBOOTH INDONESIA. ALL RIGHTS RESERVED.
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    {socialLinks.map((social) => (
                        <Link
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            className="font-black uppercase text-[0.75rem] tracking-widest text-white/90 hover:text-[#fff500] transition-colors"
                        >
                            {social.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
