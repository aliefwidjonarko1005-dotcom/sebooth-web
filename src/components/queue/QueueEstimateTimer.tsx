"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Zap, Camera } from "lucide-react";
import type { QueueProximityTier } from "@/types/database";
import { getProximityTierColor } from "@/types/database";

interface QueueEstimateTimerProps {
    estimatedWaitMs: number;
    positionFromFront: number;
    avgDurationSec: number;
    status: string;
    proximityTier: QueueProximityTier;
    /** Name of the person currently in session */
    currentSessionName?: string;
    /** Elapsed time of current session in seconds */
    currentSessionElapsedSec?: number;
}

export default function QueueEstimateTimer({
    estimatedWaitMs,
    positionFromFront,
    avgDurationSec,
    status,
    proximityTier,
    currentSessionName,
    currentSessionElapsedSec,
}: QueueEstimateTimerProps) {
    const [remainingMs, setRemainingMs] = useState(estimatedWaitMs);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sync from parent when SSE pushes new data
    useEffect(() => {
        setRemainingMs(estimatedWaitMs);
    }, [estimatedWaitMs]);

    // Count down locally for smooth UX
    useEffect(() => {
        if (status !== "waiting" || remainingMs <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(() => {
            setRemainingMs((prev) => Math.max(0, prev - 1000));
        }, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const totalSec = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    // Get tier color for the countdown ring
    const tierColors = getProximityTierColor(proximityTier);

    if (status === "called" || status === "in_session") {
        return (
            <motion.div
                key="called"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-4"
            >
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/30 flex items-center justify-center">
                        {status === "in_session" ? (
                            <Camera className="w-10 h-10 text-green-400 animate-pulse" />
                        ) : (
                            <Zap className="w-10 h-10 text-[#D4AF37] animate-pulse" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] animate-ping opacity-30" />
                </div>
                <p className="text-[#D4AF37] font-black text-lg text-center">
                    {status === "called" ? "Segera ke booth!" : "Sedang berfoto 📸"}
                </p>
            </motion.div>
        );
    }

    if (status === "completed") {
        return (
            <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 py-4"
            >
                <div className="text-5xl">🎉</div>
                <p className="text-white font-black text-lg text-center">Sesi Selesai!</p>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                {/* Countdown Ring */}
                <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke={tierColors.hex}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - Math.min(1, remainingMs / Math.max(estimatedWaitMs, 1)))}`}
                                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-white font-black text-xl tabular-nums">
                                {minutes}:{String(seconds).padStart(2, "0")}
                            </span>
                            <span className="text-white/40 text-[10px] font-bold uppercase">menit</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Estimate Breakdown */}
                {positionFromFront > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider text-center">
                            Detail Estimasi
                        </p>
                        <div className="text-white/50 text-xs space-y-1.5">
                            {currentSessionName && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                                    <span>Sedang berfoto: <span className="text-white/70 font-bold">{currentSessionName}</span></span>
                                    {currentSessionElapsedSec != null && (
                                        <span className="text-white/30 ml-auto text-[10px]">
                                            {Math.floor(currentSessionElapsedSec / 60)}m berlalu
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-white/30 shrink-0" />
                                <span>
                                    {positionFromFront} orang × ~{Math.round(avgDurationSec / 60)} menit = <span className="text-white/70 font-bold">~{minutes} menit</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats row */}
                <div className="flex gap-3 justify-center flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
                        <Users className={`w-3.5 h-3.5 ${tierColors.text}`} />
                        <span className="text-white/70 text-xs font-bold">
                            Posisi ke-<span className="text-white">{positionFromFront}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
                        <Clock className={`w-3.5 h-3.5 ${tierColors.text}`} />
                        <span className="text-white/70 text-xs font-bold">
                            ~<span className="text-white">{Math.round(avgDurationSec / 60)} min</span>/sesi
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
