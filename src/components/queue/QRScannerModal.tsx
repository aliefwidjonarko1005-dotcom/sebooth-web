"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, CheckCircle, AlertCircle, Loader2, Flashlight, FlashlightOff } from "lucide-react";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanned: (sessionToken: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanned }: QRScannerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [scannedResult, setScannedResult] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setScanning(false);
    }, []);

    const startCamera = useCallback(async () => {
        setError(null);
        setScannedResult(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            // Check torch support
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities?.();
            if (capabilities && "torch" in capabilities) {
                setTorchSupported(true);
            }

            setScanning(true);

            // Start scanning loop
            scanIntervalRef.current = setInterval(() => {
                scanFrame();
            }, 250); // Scan 4x per second
        } catch (err) {
            console.error("[QR Scanner] Camera error:", err);
            setError("Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.");
        }
    }, []);

    // Scan a single frame for QR codes
    const scanFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Try native BarcodeDetector API first
        if ("BarcodeDetector" in window) {
            try {
                // @ts-expect-error - BarcodeDetector is not in TS lib yet
                const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
                const barcodes = await detector.detect(canvas);
                if (barcodes.length > 0) {
                    const value = barcodes[0].rawValue;
                    handleScanResult(value);
                    return;
                }
            } catch {
                // BarcodeDetector failed, fall through
            }
        }

        // Fallback: try jsQR if available
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const { default: jsQR } = await import("jsqr");
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                handleScanResult(code.data);
            }
        } catch {
            // jsQR not available — will retry on next frame
        }
    }, []);

    const handleScanResult = useCallback((rawValue: string) => {
        // Stop scanning
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        // Extract session token from URL or raw value
        // Expected format: https://sebooth.com/api/queue/scan/SESSION_TOKEN
        // or just the token itself
        let token = rawValue;
        try {
            const url = new URL(rawValue);
            const pathParts = url.pathname.split("/");
            const scanIndex = pathParts.indexOf("scan");
            if (scanIndex !== -1 && pathParts[scanIndex + 1]) {
                token = pathParts[scanIndex + 1];
            }
        } catch {
            // Not a URL, use raw value as token
        }

        setScannedResult(token);

        // Play success sound
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch { /* ignore */ }

        // Notify parent
        setTimeout(() => {
            onScanned(token);
        }, 800);
    }, [onScanned]);

    const toggleTorch = useCallback(async () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        const newValue = !torchOn;
        try {
            await track.applyConstraints({
                // @ts-expect-error - torch not in standard TS types
                advanced: [{ torch: newValue }],
            });
            setTorchOn(newValue);
        } catch {
            // Torch toggle failed
        }
    }, [torchOn]);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setScannedResult(null);
            setError(null);
        }
        return () => stopCamera();
    }, [isOpen, startCamera, stopCamera]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black flex flex-col"
            >
                {/* Top bar */}
                <div className="flex items-center justify-between p-4 z-10">
                    <div>
                        <h2 className="text-white font-black text-sm">Scan QR Booth</h2>
                        <p className="text-white/50 text-xs">Arahkan kamera ke QR di layar mesin</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Camera View */}
                <div className="flex-1 relative overflow-hidden">
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Viewfinder overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Dark overlay with transparent center */}
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative w-64 h-64">
                            {/* Cut-out (transparent center) */}
                            <div className="absolute inset-0 bg-transparent" style={{
                                boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                            }} />
                            {/* Corner markers */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#D4AF37] rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#D4AF37] rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#D4AF37] rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#D4AF37] rounded-br-lg" />
                            {/* Scan line animation */}
                            {scanning && !scannedResult && (
                                <motion.div
                                    className="absolute left-2 right-2 h-0.5 bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                                    animate={{ top: ["8%", "92%", "8%"] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Success overlay */}
                    {scannedResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10 }}
                            >
                                <CheckCircle className="w-20 h-20 text-green-400" />
                            </motion.div>
                            <p className="text-white font-black text-xl mt-4">QR Terdeteksi!</p>
                            <p className="text-white/50 text-sm mt-1">Menghubungkan sesi...</p>
                            <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin mt-3" />
                        </motion.div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8">
                            <AlertCircle className="w-16 h-16 text-red-400" />
                            <p className="text-white font-black text-lg mt-4 text-center">{error}</p>
                            <button
                                onClick={startCamera}
                                className="mt-4 bg-[#D4AF37] text-[#0a1628] font-black text-sm rounded-2xl px-6 py-3"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom controls */}
                <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    {torchSupported && (
                        <button
                            onClick={toggleTorch}
                            className={`p-3 rounded-full transition-all ${
                                torchOn
                                    ? "bg-[#D4AF37] text-[#0a1628]"
                                    : "bg-white/10 text-white/50 hover:bg-white/20"
                            }`}
                        >
                            {torchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
                        </button>
                    )}
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                        <Camera className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white/60 text-xs font-bold">
                            {scanning ? "Memindai..." : "Memuat kamera..."}
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
