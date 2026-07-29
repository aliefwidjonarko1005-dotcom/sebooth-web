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
        <footer className="bg-[#eef2ff] relative overflow-hidden select-none">
            {/* Floating Decorative Balls */}
            <div className="absolute bottom-10 left-12 w-20 h-20 rounded-full bg-[#ff4500] opacity-20 pointer-events-none z-0" />
            <div className="absolute top-12 right-20 w-28 h-28 rounded-full bg-[#002366] opacity-10 pointer-events-none z-0" />

            {/* CTA Banner */}
            <div className="py-20 md:py-32 px-6 md:px-20 text-center relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <span className="text-[#002366] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#002366]/15 inline-block mb-4 shadow-sm">
                        ✦ SEBOOTH PHOTOBOOTH CONSULTATION ✦
                    </span>

                    <EditableText
                        section="footer"
                        fieldKey="cta_heading"
                        defaultValue="SIAP ABADIKAN MOMEN SERUMU?"
                        as="h2"
                        className="h1 text-[#002366] font-bayon uppercase leading-[0.8] tracking-[-0.04em] mb-8"
                    >
                        SIAP ABADIKAN MOMEN SERUMU?
                    </EditableText>

                    <p className="text-sm md:text-xl font-semibold text-[#ff4500] uppercase max-w-xl mb-10 leading-relaxed tracking-wide">
                        Hubungi tim Sebooth hari ini untuk berkonsultasi mengenai tanggal event, paket unlimited, & custom frame overlay!
                    </p>

                    <div className="flex items-center justify-center">
                        <RotatingBadge
                            text="SEBOOTH PHOTOBOOTH • GET QUOTE TODAY • "
                            btnText="CHAT US"
                            bgColor="#ff4500"
                            textColor="#ffffff"
                            size={145}
                            href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya."
                        />
                    </div>
                </div>
            </div>

            {/* Footer Bottom Bar */}
            <div className="bg-[#002366] text-white flex flex-col md:flex-row justify-between items-center w-full px-8 py-8 gap-6 relative z-10 safe-bottom">
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
                            className="font-black uppercase text-[0.75rem] tracking-widest text-white/90 hover:text-[#ff4500] transition-colors"
                        >
                            {social.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
