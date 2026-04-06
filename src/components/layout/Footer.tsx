"use client";

import Link from "next/link";
import { EditableText } from "@/components/admin/EditableText";

const socialLinks = [
    { name: "INSTAGRAM", href: "https://instagram.com/sebooth.photobooth" },
    { name: "TIKTOK", href: "https://tiktok.com/@sebooth.photobooth" },
    { name: "WHATSAPP", href: "https://wa.me/6285713899441" },
];

export function Footer() {
    return (
        <footer className="bg-primary border-t-8 border-black">
            {/* CTA Banner */}
            <div className="py-16 md:py-32 px-6 md:px-20 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <EditableText section="footer" fieldKey="cta_heading" defaultValue="Ready to elevate your event?" as="h2" className="text-3xl sm:text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 md:mb-12 leading-none">
                        Ready to elevate your event?
                    </EditableText>
                    <Link
                        href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth%20untuk%20acara%20saya."
                        target="_blank"
                        className="inline-block bg-secondary text-white text-lg sm:text-2xl md:text-4xl font-black uppercase px-8 py-5 md:px-12 md:py-8 border-4 border-black hover:scale-105 transition-none hard-shadow-black active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        <EditableText section="footer" fieldKey="cta_button" defaultValue="Get a Quote Today" as="span" className="text-white text-lg sm:text-2xl md:text-4xl font-black uppercase">
                            Get a Quote Today
                        </EditableText>
                    </Link>
                </div>

                {/* Background Watermark Words */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none flex flex-wrap gap-4 md:gap-8 p-4 overflow-hidden items-center justify-center">
                    <div className="text-white font-black text-3xl md:text-6xl uppercase">SMILE</div>
                    <div className="text-white font-black text-3xl md:text-6xl uppercase">FLASH</div>
                    <div className="text-white font-black text-3xl md:text-6xl uppercase">PRINT</div>
                    <div className="text-white font-black text-3xl md:text-6xl uppercase">REPEAT</div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-8 py-8 md:py-12 gap-6 border-t-4 border-black safe-bottom">
                <div className="text-2xl font-black text-white uppercase">sebooth.</div>
                <div className="text-white font-bold uppercase text-xs tracking-widest text-center">
                    © {new Date().getFullYear()} SEBOOTH. ALL RIGHTS RESERVED.
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {socialLinks.map((social) => (
                        <Link
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            className="text-white font-bold uppercase text-xs tracking-widest hover:text-secondary transition-none py-1"
                        >
                            {social.name}
                        </Link>
                    ))}
                    <Link href="#" className="text-white font-bold uppercase text-xs tracking-widest hover:text-secondary transition-none py-1">
                        PRIVACY
                    </Link>
                </div>
            </div>
        </footer>
    );
}
