"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { MediaItem } from "@/types/database";

const FRAMES = [
    { id: "classic", name: "Classic White", url: "/frames/classic.svg" },
    { id: "dark", name: "Night Edition", url: "/frames/dark.svg" },
    { id: "elegant", name: "Wedding Elegant", url: "/frames/elegant.svg" },
];

// Target aspect ratio of a typical photo slot (960x420 is ~2.28:1). Standard DSLR is 3:2 landscape.
const SLOT_WIDTH = 960;
const SLOT_HEIGHT = 420;
// We'll crop the center of the raw photo to fit exactly in 960x420

interface FrameEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    rawPhotos: MediaItem[];
}

export function FrameEditorModal({ isOpen, onClose, rawPhotos }: FrameEditorModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
    const [isRendering, setIsRendering] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const activeFrame = FRAMES[currentFrameIdx];

    useEffect(() => {
        if (!isOpen) {
            setPreviewUrl(null);
            return;
        }
        renderComposite();
    }, [isOpen, currentFrameIdx, rawPhotos]);

    const handlePrevious = () => {
        setCurrentFrameIdx((prev) => (prev === 0 ? FRAMES.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentFrameIdx((prev) => (prev === FRAMES.length - 1 ? 0 : prev + 1));
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const renderComposite = async () => {
        if (!canvasRef.current || rawPhotos.length === 0) return;
        setIsRendering(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 1080;
        canvas.height = 1620;

        // White background base
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
            // 1. Draw Raw Photos into specific slots
            // Assuming 3 slots max based on our frame template
            const slots = [
                { x: 60, y: 60, w: SLOT_WIDTH, h: SLOT_HEIGHT },
                { x: 60, y: 520, w: SLOT_WIDTH, h: SLOT_HEIGHT },
                { x: 60, y: 980, w: SLOT_WIDTH, h: SLOT_HEIGHT },
            ];

            for (let i = 0; i < Math.min(rawPhotos.length, 3); i++) {
                const slot = slots[i];
                try {
                    const img = await loadImage(rawPhotos[i].url);
                    
                    // Calculate center crop
                    const imgAspect = img.width / img.height;
                    const slotAspect = slot.w / slot.h;
                    
                    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

                    if (imgAspect > slotAspect) {
                        // Image is wider than slot. Crop sides
                        srcW = img.height * slotAspect;
                        srcX = (img.width - srcW) / 2;
                    } else {
                        // Image is taller than slot. Crop top/bottom
                        srcH = img.width / slotAspect;
                        srcY = (img.height - srcH) / 2;
                    }

                    ctx.drawImage(img, srcX, srcY, srcW, srcH, slot.x, slot.y, slot.w, slot.h);
                } catch (err) {
                    console.error(`Failed to load photo ${i}:`, err);
                }
            }

            // 2. Draw Frame Overlay on top
            try {
                const overlay = await loadImage(activeFrame.url);
                ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
            } catch (err) {
                console.error("Failed to load overlay:", err);
            }

            // 3. Export to Preview
            setPreviewUrl(canvas.toDataURL("image/jpeg", 0.95));

        } catch (globalErr) {
            console.error("Rendering failed:", globalErr);
        } finally {
            setIsRendering(false);
        }
    };

    const downloadComposite = () => {
        if (!previewUrl) return;
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = `sebooth-${activeFrame.id}-${new Date().getTime()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
                    {/* Hidden canvas used for processing */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-md hover:bg-white hover:scale-105 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left: Preview Area */}
                        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative min-h-[500px]">
                            {isRendering ? (
                                <div className="flex flex-col items-center text-gray-500">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p className="font-bold">Menerapkan Frame...</p>
                                </div>
                            ) : (
                                previewUrl && (
                                    <motion.img
                                        key={previewUrl}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={previewUrl}
                                        alt="Composite Preview"
                                        className="h-full max-h-[70vh] object-contain shadow-2xl rounded-sm"
                                    />
                                )
                            )}

                            {/* Swipe Controls */}
                            <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
                                <button
                                    onClick={handlePrevious}
                                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-black hover:scale-110 transition-transform active:scale-95"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-black hover:scale-110 transition-transform active:scale-95"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Right: Controls Area */}
                        <div className="w-full md:w-80 bg-white p-8 flex flex-col border-l border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Frame Editor</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8">Geser kiri/kanan untuk mencoba berbagai desain frame premium kami.</p>

                            <div className="space-y-4 flex-1">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Frame Aktif</span>
                                    <span className="text-lg font-black text-gray-900">{activeFrame.name}</span>
                                </div>
                            </div>

                            <button
                                onClick={downloadComposite}
                                disabled={isRendering || !previewUrl}
                                className="mt-8 w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Download className="w-5 h-5" /> Download Hasil
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
