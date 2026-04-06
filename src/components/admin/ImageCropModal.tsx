"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

interface ImageCropModalProps {
    file: File;
    aspectRatio?: number; // width/height, e.g. 16/9. If 0 or undefined = free crop
    onConfirm: () => void;
    onCancel: () => void;
}

export function ImageCropModal({ file, aspectRatio, onConfirm, onCancel }: ImageCropModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Fixed crop output size
    const CROP_W = 480;
    const CROP_H = aspectRatio ? Math.round(CROP_W / aspectRatio) : 360;

    // Load image from file
    useEffect(() => {
        const img = new window.Image();
        img.onload = () => {
            setImage(img);
            // Auto-fit: scale image to FILL (cover) the entire crop area
            const scaleW = CROP_W / img.width;
            const scaleH = CROP_H / img.height;
            const fillScale = Math.max(scaleW, scaleH);
            setScale(fillScale);
            // Center the image
            setOffset({
                x: (CROP_W - img.width * fillScale) / 2,
                y: (CROP_H - img.height * fillScale) / 2,
            });
        };
        img.src = URL.createObjectURL(file);
        return () => URL.revokeObjectURL(img.src);
    }, [file, CROP_W, CROP_H]);

    // Draw canvas every frame
    useEffect(() => {
        if (!image || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Set canvas internal resolution to match crop size
        canvasRef.current.width = CROP_W;
        canvasRef.current.height = CROP_H;

        // Draw checkered background (transparency indicator)
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(0, 0, CROP_W, CROP_H);
        const gridSize = 16;
        ctx.fillStyle = "#d1d5db";
        for (let y = 0; y < CROP_H; y += gridSize) {
            for (let x = 0; x < CROP_W; x += gridSize) {
                if ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) {
                    ctx.fillRect(x, y, gridSize, gridSize);
                }
            }
        }

        // Draw the image at current offset/scale
        ctx.drawImage(image, offset.x, offset.y, image.width * scale, image.height * scale);
    }, [image, scale, offset, CROP_W, CROP_H]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }, [offset]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;
        setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }, [dragging, dragStart]);

    const handleMouseUp = useCallback(() => setDragging(false), []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setScale(prev => Math.max(0.05, Math.min(8, prev + delta)));
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setDragging(true);
            setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
        }
    }, [offset]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!dragging || e.touches.length !== 1) return;
        e.preventDefault();
        setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }, [dragging, dragStart]);

    const handleTouchEnd = useCallback(() => setDragging(false), []);

    const handleConfirm = useCallback(() => {
        onConfirm();
    }, [onConfirm]);

    const zoomIn = () => setScale(prev => Math.min(8, prev + 0.15));
    const zoomOut = () => setScale(prev => Math.max(0.05, prev - 0.15));
    const resetView = () => {
        if (!image) return;
        const fillScale = Math.max(CROP_W / image.width, CROP_H / image.height);
        setScale(fillScale);
        setOffset({
            x: (CROP_W - image.width * fillScale) / 2,
            y: (CROP_H - image.height * fillScale) / 2,
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border-2 border-black">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#1A1A1A]">
                    <h3 className="text-white font-black uppercase tracking-tight">Sesuaikan Gambar</h3>
                    <button onClick={onCancel} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {/* Canvas Area — CSS scales to fit modal, canvas keeps internal resolution */}
                <div className="flex justify-center p-4 bg-[#F9F9F9]">
                    <div
                        className="relative overflow-hidden border-2 border-dashed border-[#1A1A1A]/30 cursor-grab active:cursor-grabbing"
                        style={{ width: "100%", maxWidth: CROP_W, aspectRatio: `${CROP_W}/${CROP_H}` }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <canvas
                            ref={canvasRef}
                            style={{ width: "100%", height: "100%", display: "block" }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t-2 border-black/10">
                    <div className="flex items-center gap-2">
                        <button onClick={zoomOut} className="p-2 rounded-lg bg-[#F9F9F9] border border-[#1A1A1A]/10 hover:bg-[#E5E5E5]">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-[#1A1A1A]/60 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={zoomIn} className="p-2 rounded-lg bg-[#F9F9F9] border border-[#1A1A1A]/10 hover:bg-[#E5E5E5]">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button onClick={resetView} className="p-2 rounded-lg bg-[#F9F9F9] border border-[#1A1A1A]/10 hover:bg-[#E5E5E5] ml-1">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border-2 border-[#1A1A1A]/20 text-sm font-bold text-[#1A1A1A] hover:bg-[#F9F9F9]">
                            Batal
                        </button>
                        <button onClick={handleConfirm} className="px-5 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-bold flex items-center gap-2 hover:bg-[#195240] border-2 border-black">
                            <Check className="w-4 h-4" /> Terapkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
