"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "About Us", href: "/about" },
    { name: "Our Product", href: "/#product" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Partnership", href: "/partnership" },
    { name: "Location", href: "/#location" },
    { name: "My Photos", href: "/profile" },
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
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
                isScrolled
                    ? "bg-white border-b border-black/5 py-3"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="relative w-32 h-8"
                >
                    <Image
                        src="/logo-text-black.png"
                        alt="Sebooth"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-10">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-[#1A1A1A]/80 hover:text-black transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="#contact"
                        className="px-6 py-2.5 bg-[#0F3D2E] hover:bg-[#195240] text-white font-medium text-sm rounded-none transition-colors"
                    >
                        Book Now
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-[#1A1A1A]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-black/5 p-6 md:hidden"
                    >
                        <nav className="flex flex-col gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-xl font-medium text-[#1A1A1A] hover:text-[#0F3D2E] transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="#contact"
                                className="px-6 py-3 bg-[#0F3D2E] hover:bg-[#195240] text-white font-bold text-center rounded-none transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Book Now
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
