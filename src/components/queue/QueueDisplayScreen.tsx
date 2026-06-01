"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QueueTicket, QueueEvent } from "@/types/database";

interface QueueStatus {
    event: QueueEvent | null;
    currentTicket: QueueTicket | null;
    waitingTickets: Array<QueueTicket & { positionFromFront: number; estimatedWaitMs: number }>;
    avgDurationSec: number;
    totalWaiting: number;
    totalCompleted: number;
}

interface QueueDisplayScreenProps {
    eventId: string;
    initialStatus: QueueStatus;
}

export default function QueueDisplayScreen({ eventId, initialStatus }: QueueDisplayScreenProps) {
    const [status, setStatus] = useState<QueueStatus>(initialStatus);
    const [time, setTime] = useState(new Date());
    const prevCurrentRef = useRef<number | undefined>(undefined);
    const [flashNew, setFlashNew] = useState(false);
    const sseRef = useRef<EventSource | null>(null);

    // Clock
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Flash animation when current number changes
    useEffect(() => {
        const currentNum = status.currentTicket?.queue_number;
        if (currentNum && currentNum !== prevCurrentRef.current) {
            setFlashNew(true);
            setTimeout(() => setFlashNew(false), 2000);
        }
        prevCurrentRef.current = currentNum;
    }, [status.currentTicket?.queue_number]);

    // SSE connection
    const connectSSE = useCallback(() => {
        if (sseRef.current) sseRef.current.close();
        const es = new EventSource(`/api/queue/stream/${eventId}`);
        sseRef.current = es;
        es.addEventListener("queue_update", (ev) => {
            try { setStatus(JSON.parse(ev.data)); } catch { /* ignore */ }
        });
        es.onerror = () => {
            es.close();
            setTimeout(connectSSE, 5000);
        };
    }, [eventId]);

    useEffect(() => {
        connectSSE();
        return () => sseRef.current?.close();
    }, [connectSSE]);

    const currentNum = status.currentTicket?.queue_number;
    const nextNumbers = status.waitingTickets.slice(0, 5).map((t) => t.queue_number);

    return (
        <div className="min-h-screen bg-[#050d1a] flex flex-col overflow-hidden select-none">
            {/* Top bar */}
            <div className="flex items-center justify-between px-12 py-6 border-b border-white/5">
                <div>
                    <h1 className="text-white/90 font-black text-2xl tracking-tight">
                        {status.event?.name || "Sebooth Queue"}
                    </h1>
                    <p className="text-white/40 text-sm font-medium mt-0.5">
                        📸 {status.event?.booth_name}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-white/90 font-black text-3xl tabular-nums tracking-tight">
                        {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </p>
                    <p className="text-white/40 text-sm font-medium">
                        {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 gap-0">
                {/* LEFT — Current serving */}
                <div className="flex-1 flex flex-col items-center justify-center p-16 border-r border-white/5">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/40 font-black text-base uppercase tracking-[0.3em] mb-8"
                    >
                        ▶ Sedang Dilayani
                    </motion.p>

                    <AnimatePresence mode="wait">
                        {currentNum ? (
                            <motion.div
                                key={currentNum}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="text-center"
                            >
                                <div className={`relative inline-block ${flashNew ? "animate-pulse" : ""}`}>
                                    {/* Glow ring */}
                                    <div className="absolute inset-0 rounded-full bg-[#D4AF37] blur-3xl opacity-20 scale-150" />
                                    <div className={`relative text-[180px] md:text-[220px] font-black leading-none tabular-nums transition-colors duration-500 ${
                                        status.currentTicket?.status === "called"
                                            ? "text-[#D4AF37]"
                                            : "text-white"
                                    }`}>
                                        {String(currentNum).padStart(3, "0")}
                                    </div>
                                </div>
                                <p className="text-white/50 font-bold text-xl mt-4">
                                    {status.currentTicket?.display_name}
                                </p>
                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                                    <span className="text-[#D4AF37] font-black text-sm uppercase tracking-wider">
                                        {status.currentTicket?.status === "called" ? "Dipanggil" : "Sedang Berfoto"}
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <div className="text-[120px] font-black text-white/10 leading-none">---</div>
                                <p className="text-white/30 font-bold text-lg mt-4">Menunggu antrean...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT — Next up + Stats */}
                <div className="w-80 xl:w-96 flex flex-col p-8 gap-6">
                    {/* Next Numbers */}
                    <div>
                        <p className="text-white/40 font-black text-xs uppercase tracking-[0.25em] mb-4">
                            Antrean Berikutnya
                        </p>
                        <div className="space-y-2">
                            <AnimatePresence>
                                {nextNumbers.map((num, i) => (
                                    <motion.div
                                        key={num}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all ${
                                            i === 0
                                                ? "bg-white/15 border-white/30"
                                                : "bg-white/5 border-white/10"
                                        }`}
                                    >
                                        <span className={`font-black tabular-nums ${
                                            i === 0 ? "text-white text-2xl" : "text-white/50 text-xl"
                                        }`}>
                                            {String(num).padStart(3, "0")}
                                        </span>
                                        <span className="text-white/30 text-xs font-bold">
                                            {status.waitingTickets[i]?.display_name || ""}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {nextNumbers.length === 0 && (
                                <p className="text-white/20 text-sm text-center py-4">Tidak ada antrean</p>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/5" />

                    {/* Stats */}
                    <div className="space-y-3">
                        <p className="text-white/40 font-black text-xs uppercase tracking-[0.25em] mb-2">Statistik</p>
                        {[
                            { label: "Menunggu", value: status.totalWaiting, color: "text-blue-300" },
                            { label: "Selesai", value: status.totalCompleted, color: "text-green-300" },
                            { label: "Avg / Sesi", value: `~${Math.round(status.avgDurationSec / 60)} menit`, color: "text-[#D4AF37]" },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
                                <span className="text-white/50 text-sm font-bold">{s.label}</span>
                                <span className={`font-black text-lg ${s.color}`}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Marquee / Scan info */}
                    <div className="mt-auto border-t border-white/5 pt-4">
                        <p className="text-white/30 text-xs text-center font-medium">
                            Scan QR untuk ambil nomor antrean
                        </p>
                        <p className="text-[#D4AF37]/60 text-xs text-center font-bold mt-1">
                            sebooth.com/queue
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
