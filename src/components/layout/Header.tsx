"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { EditableText } from "@/components/admin/EditableText";

const navItems = [
    { name: "ABOUT", href: "/about" },
    { name: "PRODUCT", href: "/#product" },
    { name: "PRICING", href: "/#pricing" },
    { name: "GALLERY", href: "/#gallery" },
    { name: "PARTNERSHIP", href: "/partnership" },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    return (
        <header
            className={`sticky top-0 left-0 right-0 z-50 bg-white border-b-4 border-black transition-none safe-top ${
                isScrolled ? "py-2 md:py-3" : "py-3 md:py-4"
            }`}
        >
            <div className="w-full px-6 flex items-center justify-between">
                {/* Text Logo */}
                <Link
                    href="/"
                    className="text-2xl font-black text-primary uppercase tracking-tighter"
                >
                    sebooth.
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-6 items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="font-bold uppercase tracking-tight text-primary hover:bg-secondary hover:text-white transition-none px-2 py-1"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="/profile"
                        className="font-black uppercase tracking-tight text-primary border-l-2 border-black pl-6 ml-2"
                    >
                        MY PHOTOS
                    </Link>
                </nav>

                {/* Desktop CTA + Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <Link
                        href="#contact"
                        className="hidden md:inline-block font-bold uppercase tracking-tight bg-secondary text-white px-6 py-2 border-2 border-black active:translate-x-[2px] active:translate-y-[2px] transition-none hard-shadow-black"
                    >
                        <EditableText section="header" fieldKey="cta_text" defaultValue="BOOK NOW" as="span" className="font-bold uppercase tracking-tight text-white">
                            BOOK NOW
                        </EditableText>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-primary"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation & Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        />
                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 right-0 bg-white border-b-4 border-black p-6 md:hidden z-50 shadow-2xl"
                        >
                            <nav className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-xl font-black uppercase tracking-tight text-primary active:bg-secondary active:text-white transition-none px-2 py-3 min-h-[44px] flex items-center"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <Link
                                    href="/profile"
                                    className="text-xl font-black uppercase tracking-tight text-primary border-t-2 border-black pt-4 mt-2 min-h-[44px] flex items-center px-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    MY PHOTOS
                                </Link>
                                <Link
                                    href="#contact"
                                    className="font-bold uppercase bg-secondary text-white text-center py-4 border-2 border-black hard-shadow-black transition-none mt-2 min-h-[44px] flex items-center justify-center active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    BOOK NOW
                                </Link>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
