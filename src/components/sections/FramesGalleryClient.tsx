"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, X, ZoomIn, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FrameItem {
    id: string;
    title: string;
    category: string;
    image_url: string;
}

interface FramesGalleryClientProps {
    initialFrames: FrameItem[];
}

export function FramesGalleryClient({ initialFrames }: FramesGalleryClientProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeLightboxFrame, setActiveLightboxFrame] = useState<FrameItem | null>(null);
    const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

    const handleImageLoad = useCallback((frameId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
            setImageRatios(prev => ({ ...prev, [frameId]: img.naturalWidth / img.naturalHeight }));
        }
    }, []);

    // Categories derived from frames
    const categories = ["All", ...Array.from(new Set(initialFrames.map(f => f.category || "General").filter(Boolean)))];

    // Filter frames
    const filteredFrames = initialFrames.filter((frame) => {
        const matchesSearch = frame.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (frame.category || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || (frame.category || "General") === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Check if query param ?id= exists to auto-open lightbox
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const frame = initialFrames.find((f) => f.id === id);
            if (frame) {
                setActiveLightboxFrame(frame);
            }
        }
    }, [searchParams, initialFrames]);

    return (
        <div className="min-h-screen bg-transparent pt-20 pb-24">
            {/* Ambient Background Glows */}
            <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl">
                {/* Back navigation */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-bold uppercase tracking-tight text-primary hover:text-text-dark transition-colors px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-16 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black font-sebooth uppercase tracking-tighter text-text-dark mb-4 leading-none">
                        Our Design Frames
                    </h1>
                    <p className="text-lg font-bold uppercase text-primary/70">
                        Koleksi template frame premium untuk melengkapi momen spesial Anda.
                    </p>
                </div>

                {/* Search & Category Filter Controls */}
                <div className="mb-12 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-sm">
                    {/* Categories Tabs */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap",
                                    selectedCategory === cat
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-white/20 hover:bg-white/40 text-text-dark border border-white/30"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari desain frame..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 focus:border-primary/50 text-sm font-bold uppercase tracking-tight text-text-dark placeholder-text-dark/40 outline-none transition-all duration-200"
                        />
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-dark/40" />
                    </div>
                </div>

                {/* 3-Column Centered Grid */}
                {filteredFrames.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-16 text-center max-w-md mx-auto">
                        <p className="text-lg font-bold uppercase text-text-dark/50">Tidak ada frame yang cocok.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                            className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 transition-all"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
                        {filteredFrames.map((frame, idx) => (
                            <motion.div
                                key={frame.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                                className="bg-white/12 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:border-white/40 hover:bg-white/20 transition-all duration-300 group flex flex-col items-center"
                            >
                                {/* Shiny Overlay effect */}
                                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
                                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer" />
                                </div>

                                {/* Frame Image Frame — dynamic aspect ratio */}
                                <div 
                                    className="w-full bg-neutral-900/5 rounded-2xl overflow-hidden flex items-center justify-center p-3 relative cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
                                    style={{ aspectRatio: imageRatios[frame.id] ? `${imageRatios[frame.id]}` : '3/4' }}
                                    onClick={() => setActiveLightboxFrame(frame)}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                                    {frame.image_url ? (
                                        <img
                                            src={frame.image_url}
                                            alt={frame.title}
                                            onLoad={(e) => handleImageLoad(frame.id, e)}
                                            className="h-full w-auto object-contain z-10 max-h-full drop-shadow-md select-none pointer-events-none"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/20 text-[#1A1A1A]/30 font-bold uppercase text-xs">
                                            No Image
                                        </div>
                                    )}
                                    
                                    {/* Glass Overlay Zoom Button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <span className="p-3 bg-white/90 backdrop-blur-md rounded-full text-primary shadow-md hover:scale-105 transition-all">
                                            <ZoomIn className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Frame Info */}
                                <div className="w-full mt-4 text-center">
                                    <h3 className="text-xl font-black uppercase text-text-dark tracking-tight mb-1 truncate">
                                        {frame.title}
                                    </h3>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
                                        {frame.category || "General"}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Interactive Lightbox Overlay */}
            <AnimatePresence>
                {activeLightboxFrame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
                    >
                        {/* Close gesture click area */}
                        <div className="absolute inset-0" onClick={() => setActiveLightboxFrame(null)} />
                        
                        {/* Close button top right */}
                        <button
                            onClick={() => setActiveLightboxFrame(null)}
                            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Lightbox Content Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative z-10 bg-neutral-900/90 border border-white/10 p-6 md:p-8 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col items-center justify-between shadow-2xl overflow-hidden"
                        >
                            {/* Shiny gloss backdrop inside */}
                            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                            {/* Title details */}
                            <div className="w-full text-center mb-6">
                                <h2 className="text-2xl font-black uppercase text-white tracking-tight leading-none mb-1">
                                    {activeLightboxFrame.title}
                                </h2>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] px-3 py-1 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">
                                    {activeLightboxFrame.category || "General"}
                                </span>
                            </div>

                            {/* Image Container with checked pattern background — dynamic aspect ratio */}
                            <div 
                                className="w-full flex-1 bg-[#121212] border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-6 relative max-h-[50vh]"
                                style={{ aspectRatio: imageRatios[activeLightboxFrame.id] ? `${imageRatios[activeLightboxFrame.id]}` : '3/4' }}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                                <img
                                    src={activeLightboxFrame.image_url}
                                    alt={activeLightboxFrame.title}
                                    className="h-full w-auto object-contain max-h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full mt-6 flex gap-4">
                                <button
                                    onClick={() => setActiveLightboxFrame(null)}
                                    className="flex-1 py-3 border border-white/20 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                                >
                                    Tutup
                                </button>
                                <a
                                    href={activeLightboxFrame.image_url}
                                    download={activeLightboxFrame.title}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-[#0F3D2E] text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#195240] transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Frame
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
