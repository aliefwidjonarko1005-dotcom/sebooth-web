"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RefreshCw, X, Camera, Volume2, VolumeX } from "lucide-react";
import type { QueueTicket, QueueEvent } from "@/types/database";
import QueueStatusBadge from "./QueueStatusBadge";
import QueueEstimateTimer from "./QueueEstimateTimer";

interface QueueStatus {
    event: QueueEvent | null;
    currentTicket: QueueTicket | null;
    waitingTickets: Array<QueueTicket & { positionFromFront: number; estimatedWaitMs: number }>;
    avgDurationSec: number;
    totalWaiting: number;
    totalCompleted: number;
}

interface QueueTicketDisplayProps {
    ticket: QueueTicket;
    initialStatus: QueueStatus;
    eventId: string;
}

export default function QueueTicketDisplay({ ticket, initialStatus, eventId }: QueueTicketDisplayProps) {
    const [status, setStatus] = useState<QueueStatus>(initialStatus);
    const [sseConnected, setSseConnected] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const sseRef = useRef<EventSource | null>(null);
    const retryCount = useRef(0);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevStatusRef = useRef<string>(ticket.status);

    // Get this ticket's current data from live status
    const myTicket = status.waitingTickets.find((t) => t.id === ticket.id) ||
        status.currentTicket?.id === ticket.id ? status.currentTicket : null;

    const myPosition = status.waitingTickets.find((t) => t.id === ticket.id)?.positionFromFront ?? 0;
    const myEstimateMs = status.waitingTickets.find((t) => t.id === ticket.id)?.estimatedWaitMs ?? 0;

    // Determine current status from live data
    const liveStatus = (() => {
        if (status.currentTicket?.id === ticket.id) return status.currentTicket.status;
        const inWaiting = status.waitingTickets.find((t) => t.id === ticket.id);
        if (inWaiting) return "waiting";
        // Check if completed or expired (not in active list anymore)
        return ticket.status;
    })();

    // Play notification sound when status changes to "called"
    const playNotification = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.6);
        } catch {
            // AudioContext not available (SSR or restricted)
        }
    }, [soundEnabled]);

    useEffect(() => {
        if (liveStatus === "called" && prevStatusRef.current !== "called") {
            playNotification();
        }
        prevStatusRef.current = liveStatus;
    }, [liveStatus, playNotification]);

    // SSE connection with auto-reconnect and polling fallback
    const connectSSE = useCallback(() => {
        if (sseRef.current) {
            sseRef.current.close();
        }

        const es = new EventSource(`/api/queue/stream/${eventId}`);
        sseRef.current = es;

        es.addEventListener("queue_update", (event) => {
            try {
                const data = JSON.parse(event.data);
                setStatus(data);
                setSseConnected(true);
                retryCount.current = 0;
                // Clear polling fallback if SSE is working
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            } catch { /* ignore parse errors */ }
        });

        es.onerror = () => {
            setSseConnected(false);
            es.close();
            retryCount.current += 1;

            if (retryCount.current >= 3) {
                // SSE failed 3x — switch to polling
                startPolling();
            } else {
                // Reconnect after 3 seconds
                setTimeout(connectSSE, 3000);
            }
        };
    }, [eventId]);

    const startPolling = useCallback(() => {
        if (pollingRef.current) return; // already polling
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/queue/${eventId}/status`);
                const data = await res.json();
                setStatus(data);
            } catch { /* ignore */ }
        }, 10000);
    }, [eventId]);

    useEffect(() => {
        connectSSE();
        return () => {
            sseRef.current?.close();
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [connectSSE]);

    async function handleCancel() {
        setCancelling(true);
        await fetch(`/api/queue/ticket/${ticket.id}`, { method: "DELETE" });
        setCancelling(false);
        window.location.href = `/queue/${eventId}`;
    }

    // Completed state — show link to photos
    const isCompleted = liveStatus === "completed";
    const sessionId = (status.currentTicket?.id === ticket.id && status.currentTicket.session_id) ||
        (myTicket as QueueTicket | null)?.session_id;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0F3D2E] to-[#0a1628] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)", backgroundSize: "32px 32px" }} />

            {/* Sound toggle */}
            <button
                onClick={() => setSoundEnabled((s) => !s)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all"
                title={soundEnabled ? "Matikan suara notifikasi" : "Nyalakan suara notifikasi"}
            >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* SSE indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${sseConnected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                <span className="text-white/30 text-[10px] font-bold uppercase">
                    {sseConnected ? "Live" : "Polling"}
                </span>
            </div>

            <div className="w-full max-w-sm space-y-4">
                {/* Event info */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                        {status.event?.name || "Sebooth Photobooth"}
                    </p>
                    <p className="text-white/30 text-[10px] mt-0.5">
                        📸 {status.event?.booth_name}
                    </p>
                </motion.div>

                {/* Main ticket card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={liveStatus}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-white/10 backdrop-blur-xl border rounded-3xl p-6 text-center shadow-2xl transition-all ${
                            liveStatus === "called"
                                ? "border-[#D4AF37]/50 shadow-[#D4AF37]/20"
                                : liveStatus === "in_session"
                                ? "border-green-500/30 shadow-green-500/10"
                                : "border-white/20"
                        }`}
                    >
                        {/* Status badge */}
                        <div className="flex justify-center mb-4">
                            <QueueStatusBadge status={liveStatus as import("@/types/database").QueueTicketStatus} />
                        </div>

                        {/* Queue Number */}
                        <motion.div
                            animate={liveStatus === "called" ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: liveStatus === "called" ? Infinity : 0, duration: 1.5 }}
                        >
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">
                                Nomor Antrean
                            </p>
                            <div className={`text-7xl font-black tabular-nums leading-none mb-2 ${
                                liveStatus === "called" ? "text-[#D4AF37]" : "text-white"
                            }`}>
                                {String(ticket.queue_number).padStart(3, "0")}
                            </div>
                            <p className="text-white/70 text-sm font-bold">
                                Halo, <span className="text-white">{ticket.display_name}</span>! 👋
                            </p>
                        </motion.div>

                        {/* Timer / Status Content */}
                        <div className="mt-6">
                            <QueueEstimateTimer
                                estimatedWaitMs={myEstimateMs}
                                positionFromFront={myPosition}
                                avgDurationSec={status.avgDurationSec}
                                status={liveStatus}
                            />
                        </div>

                        {/* Completed — link to photos */}
                        {isCompleted && sessionId && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4"
                            >
                                <Link
                                    href={`/access/${sessionId}`}
                                    className="flex items-center justify-center gap-2 w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a1628] font-black text-sm rounded-2xl py-3.5 transition-all shadow-lg"
                                >
                                    <Camera className="w-4 h-4" /> Lihat Foto Saya!
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Queue ahead info */}
                {liveStatus === "waiting" && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                        <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 text-center">
                            Antrean di depanmu
                        </p>
                        <div className="space-y-2">
                            {/* Current */}
                            {status.currentTicket && (
                                <div className="flex items-center justify-between py-1.5 px-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <span className="text-green-300 text-xs font-bold">
                                        #{String(status.currentTicket.queue_number).padStart(3, "0")} — Sedang berfoto
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                </div>
                            )}

                            {/* Others waiting before me */}
                            {status.waitingTickets
                                .filter((t) => t.id !== ticket.id && t.positionFromFront < myPosition)
                                .slice(0, 3)
                                .map((t) => (
                                    <div key={t.id} className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-xl">
                                        <span className="text-white/40 text-xs font-bold">
                                            #{String(t.queue_number).padStart(3, "0")} — {t.display_name}
                                        </span>
                                        <span className="text-white/20 text-[10px]">Antri</span>
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                )}

                {/* Queue stats */}
                <div className="flex gap-3 text-center">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-[#D4AF37] font-black text-lg">{status.totalWaiting}</p>
                        <p className="text-white/40 text-xs font-bold uppercase">Menunggu</p>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-green-300 font-black text-lg">{status.totalCompleted}</p>
                        <p className="text-white/40 text-xs font-bold uppercase">Selesai</p>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-white font-black text-lg">~{Math.round(status.avgDurationSec / 60)}m</p>
                        <p className="text-white/40 text-xs font-bold uppercase">Avg/Sesi</p>
                    </div>
                </div>

                {/* Cancel button — only for waiting */}
                {(liveStatus === "waiting") && (
                    <div className="text-center">
                        {!cancelConfirm ? (
                            <button
                                onClick={() => setCancelConfirm(true)}
                                className="text-white/30 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1 mx-auto"
                            >
                                <X className="w-3 h-3" /> Batalkan antrean
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3"
                            >
                                <p className="text-red-400 text-sm font-bold">Yakin ingin membatalkan antrean?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-2 text-xs font-black hover:bg-red-500/30 transition-all disabled:opacity-60"
                                    >
                                        {cancelling ? <RefreshCw className="w-3 h-3 animate-spin mx-auto" /> : "Ya, Batalkan"}
                                    </button>
                                    <button
                                        onClick={() => setCancelConfirm(false)}
                                        className="flex-1 bg-white/10 text-white/60 rounded-xl py-2 text-xs font-black hover:bg-white/20 transition-all"
                                    >
                                        Tidak
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
