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
    currentSessionName?: string;
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

    useEffect(() => {
        setRemainingMs(estimatedWaitMs);
    }, [estimatedWaitMs]);

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
                    <div className="w-24 h-24 bg-white border-4 border-black hard-shadow-black flex items-center justify-center">
                        {status === "in_session" ? (
                            <Camera className="w-10 h-10 text-green-500" />
                        ) : (
                            <Zap className="w-10 h-10 text-red-500 animate-pulse" />
                        )}
                    </div>
                </div>
                <p className="text-primary font-black text-lg text-center uppercase border-b-4 border-black pb-1 inline-block mt-2">
                    {status === "called" ? "SEGERA KE BOOTH!" : "SEDANG BERFOTO 📸"}
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
                <div className="text-5xl border-4 border-black p-4 bg-yellow-300 hard-shadow-black">🎉</div>
                <p className="text-primary font-black text-xl uppercase mt-2">Sesi Selesai!</p>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Countdown Ring */}
                <div className="flex justify-center">
                    <div className="relative w-32 h-32 bg-white border-4 border-black rounded-full hard-shadow-black p-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E5E5" strokeWidth="8" />
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
                            <span className="text-primary font-black text-xl tabular-nums tracking-tighter">
                                {minutes}:{String(seconds).padStart(2, "0")}
                            </span>
                            <span className="text-primary/50 text-[0.65rem] font-black uppercase">menit</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Estimate Breakdown */}
                {positionFromFront > 0 && (
                    <div className="bg-white border-2 border-black border-dashed p-3 space-y-2">
                        <p className="text-primary/50 text-[0.7rem] font-black uppercase tracking-wider text-center border-b-2 border-black pb-1 mb-2 inline-block mx-auto w-full">
                            DETAIL ESTIMASI
                        </p>
                        <div className="text-primary text-xs space-y-2 font-bold">
                            {currentSessionName && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-green-500 border border-black animate-pulse shrink-0" />
                                    <span>SEDANG BERFOTO: <span className="text-secondary font-black">{currentSessionName.toUpperCase()}</span></span>
                                    {currentSessionElapsedSec != null && (
                                        <span className="text-primary/50 ml-auto text-[0.65rem] font-black bg-gray-100 border border-black px-1.5 py-0.5">
                                            {Math.floor(currentSessionElapsedSec / 60)}M BERLALU
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary shrink-0" />
                                <span>
                                    {positionFromFront} ORANG × ~{Math.round(avgDurationSec / 60)} MENIT = <span className="text-secondary font-black bg-yellow-200 px-1 border border-black">~{minutes} MNT</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats row */}
                <div className="flex gap-3 justify-center flex-wrap">
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-black px-3 py-2 hard-shadow-black">
                        <Users className={`w-4 h-4 text-primary`} />
                        <span className="text-primary/70 text-[0.75rem] font-black uppercase">
                            POSISI <span className="text-primary">#{positionFromFront}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-black px-3 py-2 hard-shadow-black">
                        <Clock className={`w-4 h-4 text-primary`} />
                        <span className="text-primary/70 text-[0.75rem] font-black uppercase">
                            <span className="text-primary">~{Math.round(avgDurationSec / 60)}M</span>/SESI
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
