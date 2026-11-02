"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Flashlight, FlashlightOff } from "lucide-react";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { useModalFocus } from "@/lib/useModalFocus";

interface QRScannerModalProps {
    isOpen: boolean;
    /** Must be stable (useCallback): the modal's focus handling re-runs when it changes. */
    onClose: () => void;
    onScanned: (sessionToken: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanned }: QRScannerModalProps) {
    const reduceMotion = useReducedMotion();
    const panelRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const jsQRModuleRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [scannedResult, setScannedResult] = useState<string | null>(null);

    useModalFocus(isOpen, panelRef, onClose);

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

        // Pre-load jsQR dynamically if not already cached and native detector is not available
        if (!jsQRModuleRef.current && !("BarcodeDetector" in window)) {
            try {
                const { default: jsQR } = await import("jsqr");
                jsQRModuleRef.current = jsQR;
            } catch (e) {
                console.error("[QR Scanner] Failed to pre-load jsQR:", e);
            }
        }

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
            let jsQR = jsQRModuleRef.current;
            if (!jsQR) {
                const { default: loaded } = await import("jsqr");
                jsQR = loaded;
                jsQRModuleRef.current = loaded;
            }
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
        // Expected format: https://sebooth.in/api/queue/scan/SESSION_TOKEN
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

    const corner = "absolute h-8 w-8 border-secondary";

    return (
        <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-scanner-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col bg-blue-dark text-white"
        >
            <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 pt-1">
                    <h2 id="qr-scanner-title" className="font-bayon text-[1.75rem] leading-none uppercase">Scan QR Booth</h2>
                    <p className="mt-1 text-[15px] leading-snug text-white/85">Arahkan kamera ke QR di layar mesin</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup kamera"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Camera view: only the area around the frame is dimmed, so the QR itself stays clear */}
            <div className="relative flex-1 overflow-hidden">
                <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className="relative h-64 w-64 shadow-[0_0_0_9999px_rgba(0,17,58,0.6)]">
                        <div className={`${corner} top-0 left-0 rounded-tl-lg border-t-4 border-l-4`} />
                        <div className={`${corner} top-0 right-0 rounded-tr-lg border-t-4 border-r-4`} />
                        <div className={`${corner} bottom-0 left-0 rounded-bl-lg border-b-4 border-l-4`} />
                        <div className={`${corner} right-0 bottom-0 rounded-br-lg border-r-4 border-b-4`} />
                        {scanning && !scannedResult && !reduceMotion && (
                            <motion.div
                                className="absolute right-2 left-2 h-0.5 bg-secondary"
                                animate={{ top: ["8%", "92%", "8%"] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            />
                        )}
                    </div>
                </div>

                {scannedResult && (
                    <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-blue-dark/90 p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-secondary" aria-hidden="true" />
                        <p className="mt-4 font-bayon text-[2rem] leading-none uppercase">QR Terdeteksi</p>
                        <p className="mt-2 text-[17px] leading-snug">Menghubungkan sesi</p>
                        <SeboothLoader variant="mini" className="mt-3 h-5 w-5 text-white" />
                    </div>
                )}

                {error && (
                    <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center bg-blue-dark/90 p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-secondary" aria-hidden="true" />
                        <p className="mt-4 text-[17px] leading-snug font-semibold">{error}</p>
                        <button
                            type="button"
                            onClick={startCamera}
                            className="mt-5 min-h-14 rounded-full bg-secondary px-8 text-[17px] font-bold text-blue-dark transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}
            </div>

            <div className="flex min-h-20 items-center justify-center gap-4 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {torchSupported && (
                    <button
                        type="button"
                        onClick={toggleTorch}
                        aria-pressed={torchOn}
                        aria-label={torchOn ? "Matikan senter" : "Nyalakan senter"}
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                            torchOn ? "bg-secondary text-blue-dark" : "bg-primary text-white hover:bg-navy-raised"
                        }`}
                    >
                        {torchOn ? <Flashlight className="h-5 w-5" /> : <FlashlightOff className="h-5 w-5" />}
                    </button>
                )}
                <p className="text-[15px] font-medium">{scanning ? "Memindai" : "Memuat kamera"}</p>
            </div>
        </motion.div>
    );
}
