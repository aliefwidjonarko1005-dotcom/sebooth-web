"use client";

import Link from "next/link";

const navLinks = [
    { name: "About", href: "/about" },
    { name: "Product", href: "/#product" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Partnership", href: "/partnership" },
];

const socialLinks = [
    { name: "INSTAGRAM", href: "https://instagram.com/sebooth.photobooth" },
    { name: "TIKTOK", href: "https://tiktok.com/@sebooth.photobooth" },
    { name: "WHATSAPP", href: "https://wa.me/6285713899441" },
];

export function Footer() {
    return (
        <footer className="bg-primary border-t-8 border-black">
            {/* CTA Banner */}
            <div className="py-32 px-6 md:px-20 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-12 leading-none">
                        Ready to elevate your event?
                    </h2>
                    <Link
                        href="#contact"
                        className="inline-block bg-secondary text-white text-2xl md:text-4xl font-black uppercase px-12 py-8 border-4 border-black hover:scale-105 transition-none hard-shadow-black active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        Get a Quote Today
                    </Link>
                </div>

                {/* Background Watermark Words */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none flex flex-wrap gap-8 p-4 overflow-hidden items-center justify-center">
                    <div className="text-white font-black text-6xl uppercase">SMILE</div>
                    <div className="text-white font-black text-6xl uppercase">FLASH</div>
                    <div className="text-white font-black text-6xl uppercase">PRINT</div>
                    <div className="text-white font-black text-6xl uppercase">REPEAT</div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-6 border-t-4 border-black">
                <div className="text-2xl font-black text-white uppercase">sebooth.</div>
                <div className="text-white font-bold uppercase text-xs tracking-widest">
                    © {new Date().getFullYear()} SEBOOTH. ALL RIGHTS RESERVED.
                </div>
                <div className="flex gap-6">
                    {socialLinks.map((social) => (
                        <Link
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            className="text-white font-bold uppercase text-xs tracking-widest hover:text-secondary transition-none"
                        >
                            {social.name}
                        </Link>
                    ))}
                    <Link href="#" className="text-white font-bold uppercase text-xs tracking-widest hover:text-secondary transition-none">
                        PRIVACY
                    </Link>
                </div>
            </div>
        </footer>
    );
}
