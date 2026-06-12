"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RefreshCw, X, Camera, Volume2, VolumeX, Bell, BellOff, QrCode, Loader2, CheckCircle } from "lucide-react";
import type { QueueTicket, QueueEvent, QueueProximityTier } from "@/types/database";
import { getProximityTier, getProximityTierColor } from "@/types/database";
import QueueStatusBadge from "./QueueStatusBadge";
import QueueEstimateTimer from "./QueueEstimateTimer";
import QRScannerModal from "./QRScannerModal";
import { subscribeToPush, isPushSupported, getPushPermission } from "@/lib/queue/pushSubscription";

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

// ═══════════════════════════════════════
// AUDIO CUE SYSTEM
// ═══════════════════════════════════════

function playTierAudio(tier: QueueProximityTier, enabled: boolean) {
    if (!enabled) return;
    try {
        const ctx = new AudioContext();
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);

        if (tier === "approaching") {
            // Single subtle chime
            const osc = ctx.createOscillator();
            osc.connect(gainNode);
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } else if (tier === "preparing") {
            // Double urgent chime
            const osc1 = ctx.createOscillator();
            osc1.connect(gainNode);
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            osc1.frequency.setValueAtTime(1046, ctx.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);
        } else if (tier === "your_turn") {
            // Triple ascending excited chime
            const osc = ctx.createOscillator();
            osc.connect(gainNode);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
            osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        }
    } catch {
        // AudioContext not available
    }
}

export default function QueueTicketDisplay({ ticket, initialStatus, eventId }: QueueTicketDisplayProps) {
    const [status, setStatus] = useState<QueueStatus>(initialStatus);
    const [sseConnected, setSseConnected] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle');
    const [scanError, setScanError] = useState('');
    const sseRef = useRef<EventSource | null>(null);
    const retryCount = useRef(0);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevTierRef = useRef<QueueProximityTier>("waiting");
    const pushSubscribedRef = useRef(false);

    // Get this ticket's current data from live status
    const myWaitingData = status.waitingTickets.find((t) => t.id === ticket.id);
    const myPosition = myWaitingData?.positionFromFront ?? 0;
    const myEstimateMs = myWaitingData?.estimatedWaitMs ?? 0;

    // Determine current status from live data
    const liveStatus = (() => {
        if (status.currentTicket?.id === ticket.id) return status.currentTicket.status;
        if (myWaitingData) return "waiting";
        return ticket.status;
    })();

    // Calculate proximity tier
    const proximityTier: QueueProximityTier = getProximityTier(myPosition, liveStatus as import("@/types/database").QueueTicketStatus);
    const tierColors = getProximityTierColor(proximityTier);

    // Current session info for detailed estimate
    const currentSessionName = status.currentTicket?.display_name;
    const currentSessionElapsedSec = status.currentTicket?.called_at
        ? Math.round((Date.now() - new Date(status.currentTicket.called_at).getTime()) / 1000)
        : undefined;

    // ── Push Notification Setup — Auto-prompt on mount ──
    useEffect(() => {
        if (pushSubscribedRef.current || !ticket.user_id) return;
        if (!isPushSupported()) return;
        pushSubscribedRef.current = true;

        // Always attempt to subscribe — this will trigger the permission prompt
        // if not yet granted, or silently subscribe if already granted
        subscribeToPush(ticket.user_id).then((sub) => {
            if (sub) setPushEnabled(true);
        });
    }, [ticket.user_id]);

    async function handleEnablePush() {
        if (!ticket.user_id) return;
        const sub = await subscribeToPush(ticket.user_id);
        setPushEnabled(!!sub);
    }

    // ── QR Scan Handler ──
    async function handleQRScanned(sessionToken: string) {
        setScanStatus('linking');
        try {
            const res = await fetch('/api/queue/link-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken }),
            });
            const data = await res.json();
            if (data.success) {
                setScanStatus('success');
                setShowQRScanner(false);
                // Status will update via SSE
            } else {
                setScanStatus('error');
                setScanError(data.error || 'Gagal menghubungkan sesi.');
                setShowQRScanner(false);
            }
        } catch {
            setScanStatus('error');
            setScanError('Terjadi kesalahan jaringan.');
            setShowQRScanner(false);
        }
    }

    // ── Audio + Tier Transition Detection ──
    useEffect(() => {
        if (proximityTier !== prevTierRef.current) {
            // Tier changed — play audio cue
            playTierAudio(proximityTier, soundEnabled);
            prevTierRef.current = proximityTier;
        }
    }, [proximityTier, soundEnabled]);

    // ── SSE Connection ──
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
                startPolling();
            } else {
                setTimeout(connectSSE, 3000);
            }
        };
    }, [eventId]);

    const startPolling = useCallback(() => {
        if (pollingRef.current) return;
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
        (myWaitingData as QueueTicket | undefined)?.session_id ||
        (status.currentTicket?.id === ticket.id ? status.currentTicket : null)?.session_id;

    // Dynamic background gradient based on tier
    const bgGradient = proximityTier === "your_turn"
        ? "from-[#1a0a0a] via-[#3D0F0F] to-[#1a0a0a]"
        : proximityTier === "preparing"
        ? "from-[#1a1408] via-[#3D2E0F] to-[#1a1408]"
        : proximityTier === "approaching"
        ? "from-[#141a08] via-[#2E3D0F] to-[#141a08]"
        : "from-[#0a1628] via-[#0F3D2E] to-[#0a1628]";

    return (
        <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-1000`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)", backgroundSize: "32px 32px" }} />

            {/* Top bar: SSE indicator + controls */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${sseConnected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                <span className="text-white/30 text-[10px] font-bold uppercase">
                    {sseConnected ? "Live" : "Polling"}
                </span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Push notification toggle */}
                {isPushSupported() && (
                    <button
                        onClick={handleEnablePush}
                        className={`p-2 rounded-xl transition-all ${
                            pushEnabled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-white/10 text-white/50 hover:text-white hover:bg-white/20"
                        }`}
                        title={pushEnabled ? "Push notification aktif" : "Aktifkan push notification"}
                    >
                        {pushEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                )}
                {/* Sound toggle */}
                <button
                    onClick={() => setSoundEnabled((s) => !s)}
                    className="p-2 rounded-xl bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all"
                    title={soundEnabled ? "Matikan suara notifikasi" : "Nyalakan suara notifikasi"}
                >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
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
                        key={`${liveStatus}-${proximityTier}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-white/10 backdrop-blur-xl border rounded-3xl p-6 text-center shadow-2xl transition-all ${
                            proximityTier === "your_turn"
                                ? "border-red-500/50 shadow-red-500/20"
                                : proximityTier === "preparing"
                                ? "border-orange-500/30 shadow-orange-500/10"
                                : proximityTier === "approaching"
                                ? "border-yellow-500/30 shadow-yellow-500/10"
                                : liveStatus === "in_session"
                                ? "border-green-500/30 shadow-green-500/10"
                                : "border-white/20"
                        }`}
                    >
                        {/* Full-screen takeover for your_turn */}
                        {proximityTier === "your_turn" && liveStatus === "called" && (
                            <motion.div
                                className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                />
                            </motion.div>
                        )}

                        {/* Status badge */}
                        <div className="flex justify-center mb-4 relative">
                            <QueueStatusBadge
                                status={liveStatus as import("@/types/database").QueueTicketStatus}
                                positionFromFront={myPosition}
                            />
                        </div>

                        {/* Queue Number */}
                        <motion.div
                            animate={proximityTier === "your_turn" ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: proximityTier === "your_turn" ? Infinity : 0, duration: 1.5 }}
                        >
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">
                                Nomor Antrean
                            </p>
                            <div className={`text-7xl font-black tabular-nums leading-none mb-2 ${
                                proximityTier === "your_turn" ? "text-red-400"
                                : proximityTier === "preparing" ? "text-orange-400"
                                : proximityTier === "approaching" ? "text-yellow-400"
                                : "text-white"
                            }`}>
                                {String(ticket.queue_number).padStart(3, "0")}
                            </div>
                            <p className="text-white/70 text-sm font-bold">
                                Halo, <span className="text-white">{ticket.display_name}</span>! 👋
                            </p>
                        </motion.div>

                        {/* Timer / Status Content */}
                        <div className="mt-6 relative">
                            <QueueEstimateTimer
                                estimatedWaitMs={myEstimateMs}
                                positionFromFront={myPosition}
                                avgDurationSec={status.avgDurationSec}
                                status={liveStatus}
                                proximityTier={proximityTier}
                                currentSessionName={currentSessionName}
                                currentSessionElapsedSec={currentSessionElapsedSec}
                            />
                        </div>

                        {/* SCAN QR button — shown when called */}
                        {liveStatus === "called" && ticket.user_id && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-5"
                            >
                                <button
                                    onClick={() => { setShowQRScanner(true); setScanStatus('idle'); setScanError(''); }}
                                    className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a1628] font-black text-base rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <QrCode className="w-5 h-5" />
                                    SCAN QR UNTUK MULAI
                                </button>
                                <p className="text-white/30 text-xs text-center mt-2">Scan QR di layar mesin booth</p>
                            </motion.div>
                        )}

                        {/* Scan result feedback */}
                        {scanStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3"
                            >
                                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                <span className="text-green-300 text-sm font-bold">Sesi berhasil dihubungkan! 🎉</span>
                            </motion.div>
                        )}
                        {scanStatus === 'linking' && (
                            <div className="mt-4 flex items-center gap-2 justify-center py-2">
                                <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                                <span className="text-white/50 text-sm">Menghubungkan sesi...</span>
                            </div>
                        )}
                        {scanStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                            >
                                <p className="text-red-400 text-sm font-medium">{scanError}</p>
                            </motion.div>
                        )}

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

                        {/* Completed — link to profile */}
                        {isCompleted && !sessionId && ticket.user_id && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4"
                            >
                                <Link
                                    href="/profile"
                                    className="flex items-center justify-center gap-2 w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a1628] font-black text-sm rounded-2xl py-3.5 transition-all shadow-lg"
                                >
                                    <Camera className="w-4 h-4" /> Lihat di Profil Saya
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
                                .map((t) => {
                                    const tTier = getProximityTier(t.positionFromFront, "waiting");
                                    const tColors = getProximityTierColor(tTier);
                                    return (
                                        <div key={t.id} className={`flex items-center justify-between py-1.5 px-3 ${tColors.bg} border ${tColors.border} rounded-xl`}>
                                            <span className={`${tColors.text} text-xs font-bold`}>
                                                #{String(t.queue_number).padStart(3, "0")} — {t.display_name}
                                            </span>
                                            <span className="text-white/20 text-[10px]">Antri</span>
                                        </div>
                                    );
                                })
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

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScanned={handleQRScanned}
            />
        </div>
    );
}
