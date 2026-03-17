"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
    { name: "About", href: "/about" },
    { name: "Product", href: "/#product" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Locations", href: "/#location" },
];

const socialLinks = [
    { name: "Instagram", href: "https://instagram.com/sebooth.photobooth" },
    { name: "TikTok", href: "https://tiktok.com/@sebooth.photobooth" },
    { name: "WhatsApp", href: "https://wa.me/6281234567890" },
];

export function Footer() {
    return (
        <footer className="bg-[#1A1A1A] text-[#F9F9F9] border-t border-white/10 pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-24">

                    {/* Column 1: Brand */}
                    <div className="md:col-span-1 space-y-8">
                        <h2 className="text-3xl font-bold font-sebooth tracking-tight">sebooth.</h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Premium photobooth experience powered by industrial efficiency. Creating infinite memories for every moment.
                        </p>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="md:col-span-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-8">Menu</h3>
                        <ul className="space-y-4">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Socials */}
                    <div className="md:col-span-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-8">Connect</h3>
                        <ul className="space-y-4">
                            {socialLinks.map((social) => (
                                <li key={social.name}>
                                    <Link href={social.href} target="_blank" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group">
                                        {social.name}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Office */}
                    <div className="md:col-span-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-8">Office</h3>
                        <address className="not-italic text-sm text-white/70 space-y-2">
                            <p>Jl. Photobooth Premium No. 12</p>
                            <p>Semarang Selatan, Jawa Tengah 50241</p>
                            <p className="pt-4 hover:text-white transition-colors">hello@sebooth.com</p>
                        </address>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p>© {new Date().getFullYear()} Sebooth Indonesia. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
