"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { EditableText } from "@/components/admin/EditableText";

const navItems = [
    { name: "PRODUCT", href: "/#product" },
    { name: "PRICING", href: "/#pricing" },
    { name: "GALLERY", href: "/#gallery" },
    { name: "PARTNERSHIP", href: "/partnership" },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [activeHash, setActiveHash] = useState("");
    const [activeItem, setActiveItem] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("hashchange", handleHashChange);
        window.addEventListener("popstate", handleHashChange);
        
        handleScroll();
        handleHashChange();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("hashchange", handleHashChange);
            window.removeEventListener("popstate", handleHashChange);
        };
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

    useEffect(() => {
        const currentPath = pathname;
        const currentHash = activeHash;

        if (currentHash) {
            const matchingItem = navItems.find(
                (item) => item.href === `${currentPath}${currentHash}` || item.href === `/${currentHash}`
            );
            if (matchingItem) {
                setActiveItem(matchingItem.name);
                return;
            }
        }

        const matchingItem = navItems.find((item) => item.href === currentPath);
        if (matchingItem) {
            setActiveItem(matchingItem.name);
        } else if (currentPath === "/profile") {
            setActiveItem("MY PHOTOS");
        } else {
            setActiveItem("");
        }
    }, [pathname, activeHash]);

    return (
        <header
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 floating-glass-header border border-black/[0.08] transition-all duration-300 ${
                isScrolled
                    ? "py-2.5 shadow-lg"
                    : "py-4 shadow-sm"
            }`}
        >
            {/* Glass Background & Blur with Increased Transparency */}
            <div className={`absolute inset-0 w-full h-full pointer-events-none z-[-2] shimmer-container transition-all duration-300 ${
                isScrolled
                    ? "bg-white/25 backdrop-blur-lg"
                    : "bg-white/12 backdrop-blur-md"
            }`} />

            {/* Glass shine animation overlay */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1] shimmer-container">
                <div className="absolute top-0 -left-[150%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-20 animate-shimmer" />
            </div>

            <div className="w-full px-6 flex items-center justify-between relative z-10">
                {/* Text Logo */}
                <Link
                    href="/"
                    onClick={() => setActiveItem("")}
                    className="text-3xl font-black text-[#e33529] uppercase tracking-tight font-bayon"
                >
                    sebooth.
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-2 items-center">
                    {navItems.map((item) => {
                        const isActive = activeItem === item.name;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveItem(item.name)}
                                className={`font-bold text-[0.8rem] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 ${
                                    isActive
                                        ? "bg-[#e33529] text-white shadow-sm"
                                        : "text-[#e33529] hover:bg-[#e33529]/10"
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                    
                    {/* Vertical Divider */}
                    <div className="h-4 w-[1.5px] bg-[#e33529]/20 mx-2" />

                    <Link
                        href="/profile"
                        onClick={() => setActiveItem("MY PHOTOS")}
                        className={`font-black text-[0.8rem] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 ${
                            activeItem === "MY PHOTOS"
                                ? "bg-[#e33529] text-white shadow-sm"
                                : "text-[#e33529] hover:bg-[#e33529]/10"
                        }`}
                    >
                        MY PHOTOS
                    </Link>
                </nav>

                {/* Desktop CTA + Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <Link
                        href="#pricing"
                        onClick={() => setActiveItem("BOOK NOW")}
                        className="hidden md:inline-block font-black text-[0.8rem] uppercase tracking-wider px-6 py-2.5 rounded-full bg-[#e33529] text-white hover:bg-[#a02b22] hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        <EditableText section="header" fieldKey="cta_text" defaultValue="BOOK NOW" as="span" className="font-black uppercase tracking-wider text-white">
                            BOOK NOW
                        </EditableText>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-primary p-2 focus:outline-none"
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
                            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-md border border-black/10 p-6 md:hidden z-50 shadow-2xl floating-glass-header"
                        >
                            <nav className="flex flex-col gap-3">
                                {navItems.map((item) => {
                                    const isActive = activeItem === item.name;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`text-lg font-black uppercase tracking-tight px-4 py-3 min-h-[44px] flex items-center transition-all duration-200 ${
                                                isActive
                                                    ? "bg-secondary text-white"
                                                    : "text-secondary hover:bg-secondary/10 hover:text-primary"
                                            }`}
                                            onClick={() => {
                                                setActiveItem(item.name);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <Link
                                    href="/profile"
                                    className={`text-lg font-black uppercase tracking-tight px-4 py-3 min-h-[44px] flex items-center transition-all duration-200 ${
                                        activeItem === "MY PHOTOS"
                                            ? "bg-secondary text-white"
                                            : "text-secondary hover:bg-secondary/10 hover:text-primary"
                                    }`}
                                    onClick={() => {
                                        setActiveItem("MY PHOTOS");
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    MY PHOTOS
                                </Link>
                                <Link
                                    href="#contact"
                                    className={`font-bold uppercase text-center py-3.5 min-h-[44px] flex items-center justify-center transition-all duration-200 ${
                                        activeItem === "BOOK NOW"
                                            ? "bg-secondary text-white"
                                            : "bg-primary text-white hover:bg-secondary"
                                    }`}
                                    onClick={() => {
                                        setActiveItem("BOOK NOW");
                                        setIsMobileMenuOpen(false);
                                    }}
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
