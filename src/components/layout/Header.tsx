"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

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

    return (
        <header
            className={`sticky top-0 left-0 right-0 z-50 bg-white border-b-4 border-black transition-none ${
                isScrolled ? "py-3" : "py-4"
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
                        BOOK NOW
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

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white border-b-4 border-black p-6 md:hidden"
                    >
                        <nav className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-xl font-black uppercase tracking-tight text-primary hover:bg-secondary hover:text-white transition-none px-2 py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/profile"
                                className="text-xl font-black uppercase tracking-tight text-primary border-t-2 border-black pt-4 mt-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                MY PHOTOS
                            </Link>
                            <Link
                                href="#contact"
                                className="font-bold uppercase bg-secondary text-white text-center py-3 border-2 border-black hard-shadow-black transition-none mt-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                BOOK NOW
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
