"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RefreshCw, X, Camera, Volume2, VolumeX, Bell, BellOff, QrCode, Loader2, CheckSquare } from "lucide-react";
import type { QueueTicket, QueueEvent, QueueProximityTier } from "@/types/database";
import { getProximityTier, getProximityTierColor } from "@/types/database";
import QueueStatusBadge from "./QueueStatusBadge";
import QueueEstimateTimer from "./QueueEstimateTimer";
import QRScannerModal from "./QRScannerModal";
import { subscribeToPush, isPushSupported } from "@/lib/queue/pushSubscription";

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
        const ctx = new window.AudioContext();
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);

        if (tier === "approaching") {
            const osc = ctx.createOscillator();
            osc.connect(gainNode);
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } else if (tier === "preparing") {
            const osc1 = ctx.createOscillator();
            osc1.connect(gainNode);
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            osc1.frequency.setValueAtTime(1046, ctx.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);
        } else if (tier === "your_turn") {
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

    const myWaitingData = status.waitingTickets.find((t) => t.id === ticket.id);
    const myPosition = myWaitingData?.positionFromFront ?? 0;
    const myEstimateMs = myWaitingData?.estimatedWaitMs ?? 0;

    const liveStatus = (() => {
        if (status.currentTicket?.id === ticket.id) return status.currentTicket.status;
        if (myWaitingData) return "waiting";
        return ticket.status;
    })();

    const proximityTier: QueueProximityTier = getProximityTier(myPosition, liveStatus as import("@/types/database").QueueTicketStatus);
    const tierColors = getProximityTierColor(proximityTier);

    const currentSessionName = status.currentTicket?.display_name;
    const currentSessionElapsedSec = status.currentTicket?.called_at
        ? Math.round((Date.now() - new Date(status.currentTicket.called_at).getTime()) / 1000)
        : undefined;

    useEffect(() => {
        if (pushSubscribedRef.current || !ticket.user_id) return;
        if (!isPushSupported()) return;
        pushSubscribedRef.current = true;

        subscribeToPush(ticket.user_id).then((sub) => {
            if (sub) setPushEnabled(true);
        });
    }, [ticket.user_id]);

    async function handleEnablePush() {
        if (!ticket.user_id) return;
        const sub = await subscribeToPush(ticket.user_id);
        setPushEnabled(!!sub);
    }

    const [isCheckingIn, setIsCheckingIn] = useState(false);
    
    async function handleCheckIn() {
        setIsCheckingIn(true);
        try {
            const res = await fetch('/api/queue/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ticket.id, eventId }),
            });
            const data = await res.json();
            if (!data.success) {
                alert(data.error || 'Gagal check-in. Silakan coba lagi.');
            }
        } catch (e) {
            alert('Kesalahan jaringan. Gagal check-in.');
        } finally {
            setIsCheckingIn(false);
        }
    }

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

    useEffect(() => {
        if (proximityTier !== prevTierRef.current) {
            playTierAudio(proximityTier, soundEnabled);
            prevTierRef.current = proximityTier;
        }
    }, [proximityTier, soundEnabled]);

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
            } catch { /* ignore */ }
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
        window.location.href = `/queue`;
    }

    const isCompleted = liveStatus === "completed";
    const sessionObjId = (status.currentTicket?.id === ticket.id && status.currentTicket.session_id) ||
        (myWaitingData as QueueTicket | undefined)?.session_id ||
        (status.currentTicket?.id === ticket.id ? status.currentTicket : null)?.session_id;

    // Determine brutalist background color based on tier
    let bgClass = "bg-white paper-texture";
    if (proximityTier === "your_turn") bgClass = "bg-red-500 paper-texture";
    else if (proximityTier === "preparing") bgClass = "bg-orange-400 paper-texture";
    else if (proximityTier === "approaching") bgClass = "bg-yellow-300 paper-texture";

    return (
        <div className={`min-h-[100svh] ${bgClass} flex flex-col items-center justify-center p-4 relative transition-colors duration-700`}>
            {/* Top bar: SSE indicator + controls */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white border-2 border-black hard-shadow-black px-3 py-1.5 z-10">
                <span className={`w-3 h-3 border border-black ${sseConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                <span className="text-primary text-[0.65rem] font-black uppercase tracking-widest">
                    {sseConnected ? "LIVE" : "POLLING"}
                </span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {isPushSupported() && (
                    <button
                        onClick={handleEnablePush}
                        className={`p-2 border-2 border-black hard-shadow-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                            pushEnabled ? "bg-green-300 text-primary" : "bg-white text-primary"
                        }`}
                        title={pushEnabled ? "Push notification aktif" : "Aktifkan push notification"}
                    >
                        {pushEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                )}
                <button
                    onClick={() => setSoundEnabled((s) => !s)}
                    className="p-2 bg-white text-primary border-2 border-black hard-shadow-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    title={soundEnabled ? "Matikan suara" : "Nyalakan suara"}
                >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>

            <div className="w-full max-w-sm space-y-6 mt-16 pb-8 relative z-0">
                {/* Event info */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4"
                >
                    <p className="text-primary text-[0.85rem] font-black uppercase tracking-widest">
                        {status.event?.name || "Sebooth Photobooth"}
                    </p>
                    <p className="text-primary/70 text-[0.7rem] font-bold mt-1 uppercase">
                        {status.event?.booth_name}
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
                        className={`bg-white border-4 border-black p-6 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-transform`}
                    >
                        {/* Status badge */}
                        <div className="flex justify-center mb-6">
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
                            <p className="text-primary/50 text-[0.75rem] font-black uppercase tracking-widest mb-2 border-b-2 border-black pb-1 inline-block">
                                NOMOR ANTREAN
                            </p>
                            <div className="text-[5rem] md:text-[6rem] font-black tabular-nums leading-none mb-4 text-primary tracking-tighter">
                                {String(ticket.queue_number).padStart(3, "0")}
                            </div>
                            <p className="text-primary text-[0.9rem] font-bold uppercase tracking-wider bg-gray-100 border-2 border-black py-2 px-4 inline-block">
                                HALO, <span className="font-black text-secondary">{ticket.display_name}</span>!
                            </p>
                        </motion.div>

                        {/* Timer / Status Content */}
                        <div className="mt-8 relative pt-6 border-t-4 border-black border-dashed">
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

                        {/* Check-in logic */}
                        {liveStatus !== "completed" && liveStatus !== "cancelled" && liveStatus !== "expired" && liveStatus !== "in_session" && (
                            <div className="mt-8">
                                {!ticket.is_checked_in && (myPosition <= 2 || liveStatus === "called") ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-yellow-300 border-4 border-black p-4 relative overflow-hidden"
                                    >
                                        <p className="text-primary text-[0.85rem] font-black uppercase tracking-widest mb-3 text-center">
                                            {liveStatus === "called" ? "SEGERA CHECK-IN!" : "WAKTU CHECK-IN TIBA!"}
                                        </p>
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={isCheckingIn}
                                            className="w-full bg-secondary text-white font-black text-[0.85rem] uppercase tracking-wider border-4 border-black py-4 flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none"
                                        >
                                            {isCheckingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "CHECK-IN SEKARANG"}
                                        </button>
                                        {liveStatus === "called" && (
                                            <p className="text-red-600 text-[0.65rem] text-center mt-3 font-black uppercase tracking-widest">
                                                ANTREAN DI-SKIP JIKA TIDAK CHECK-IN!
                                            </p>
                                        )}
                                    </motion.div>
                                ) : ticket.is_checked_in ? (
                                    <div className="flex items-center justify-center gap-2 bg-green-200 border-4 border-black py-3 px-4 hard-shadow-black">
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                        <span className="text-[0.8rem] font-black uppercase tracking-wider text-primary">SUDAH CHECK-IN</span>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* SCAN QR button */}
                        {liveStatus === "called" && ticket.user_id && ticket.is_checked_in && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8"
                            >
                                <button
                                    onClick={() => { setShowQRScanner(true); setScanStatus('idle'); setScanError(''); }}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black text-base uppercase tracking-wider border-4 border-black hard-shadow-black py-4 flex items-center justify-center gap-3 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                >
                                    <QrCode className="w-6 h-6" />
                                    SCAN QR UNTUK MULAI
                                </button>
                                <p className="text-primary/60 text-[0.7rem] font-black uppercase tracking-widest text-center mt-3">SCAN QR DI LAYAR MESIN BOOTH</p>
                            </motion.div>
                        )}

                        {/* Scan result feedback */}
                        {scanStatus === 'success' && (
                            <div className="mt-6 flex items-center gap-2 bg-green-200 border-4 border-black px-4 py-3">
                                <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-primary text-[0.8rem] font-black uppercase tracking-wider">SESI TERHUBUNG!</span>
                            </div>
                        )}
                        {scanStatus === 'linking' && (
                            <div className="mt-6 flex items-center gap-2 justify-center py-2 border-2 border-black bg-gray-100">
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                <span className="text-primary text-[0.8rem] font-black uppercase tracking-wider">MENGHUBUNGKAN...</span>
                            </div>
                        )}
                        {scanStatus === 'error' && (
                            <div className="mt-6 bg-red-200 border-4 border-black px-4 py-3">
                                <p className="text-red-700 text-[0.8rem] font-black uppercase tracking-wider">{scanError}</p>
                            </div>
                        )}

                        {/* Completed — link to photos */}
                        {isCompleted && sessionObjId && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                                <Link
                                    href={`/access/${sessionObjId}`}
                                    className="flex items-center justify-center gap-2 w-full bg-secondary hover:bg-secondary/90 text-white font-black text-[0.9rem] uppercase tracking-wider border-4 border-black hard-shadow-black py-4 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                >
                                    <Camera className="w-5 h-5" /> LIHAT FOTO SAYA!
                                </Link>
                            </motion.div>
                        )}

                        {/* Completed — link to profile */}
                        {isCompleted && !sessionObjId && ticket.user_id && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                                <Link
                                    href="/profile"
                                    className="flex items-center justify-center gap-2 w-full bg-secondary hover:bg-secondary/90 text-white font-black text-[0.9rem] uppercase tracking-wider border-4 border-black hard-shadow-black py-4 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                >
                                    <Camera className="w-5 h-5" /> LIHAT DI PROFIL
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
                        className="bg-white border-4 border-black hard-shadow-black p-4"
                    >
                        <p className="text-primary text-[0.8rem] font-black uppercase tracking-widest mb-4 text-center border-b-2 border-black pb-2 inline-block mx-auto w-full">
                            ANTREAN DI DEPANMU
                        </p>
                        <div className="space-y-3">
                            {/* Current */}
                            {status.currentTicket && (
                                <div className="flex items-center justify-between py-2 px-3 bg-green-200 border-2 border-black">
                                    <span className="text-primary text-[0.7rem] font-black uppercase tracking-wider">
                                        #{String(status.currentTicket.queue_number).padStart(3, "0")} — PROSES
                                    </span>
                                    <span className="w-3 h-3 bg-green-500 border border-black animate-pulse" />
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
                                        <div key={t.id} className={`flex items-center justify-between py-2 px-3 ${tColors.bg} ${tColors.border} border-2`}>
                                            <span className={`${tColors.text === 'text-white' ? 'text-white' : 'text-primary'} text-[0.7rem] font-black uppercase tracking-wider truncate mr-2`}>
                                                #{String(t.queue_number).padStart(3, "0")} — {t.display_name}
                                            </span>
                                            <span className="text-primary/50 text-[0.6rem] font-black uppercase px-1.5 bg-white border border-black shrink-0">ANTRI</span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </motion.div>
                )}

                {/* Queue stats */}
                <div className="flex gap-4 text-center">
                    <div className="flex-1 bg-white border-4 border-black hard-shadow-black p-3">
                        <p className="text-primary font-black text-2xl">{status.totalWaiting}</p>
                        <p className="text-primary/60 text-[0.6rem] font-black uppercase tracking-widest mt-1 border-t-2 border-black pt-1">MENUNGGU</p>
                    </div>
                    <div className="flex-1 bg-white border-4 border-black hard-shadow-black p-3">
                        <p className="text-green-600 font-black text-2xl">{status.totalCompleted}</p>
                        <p className="text-primary/60 text-[0.6rem] font-black uppercase tracking-widest mt-1 border-t-2 border-black pt-1">SELESAI</p>
                    </div>
                    <div className="flex-1 bg-white border-4 border-black hard-shadow-black p-3">
                        <p className="text-primary font-black text-2xl">~{Math.round(status.avgDurationSec / 60)}M</p>
                        <p className="text-primary/60 text-[0.6rem] font-black uppercase tracking-widest mt-1 border-t-2 border-black pt-1">AVG/SESI</p>
                    </div>
                </div>

                {/* Cancel button */}
                {(liveStatus === "waiting") && (
                    <div className="text-center pt-4">
                        {!cancelConfirm ? (
                            <button
                                onClick={() => setCancelConfirm(true)}
                                className="text-primary/50 hover:text-red-600 text-[0.7rem] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 mx-auto bg-white border-2 border-black border-dashed px-4 py-2"
                            >
                                <X className="w-4 h-4" /> BATALKAN ANTREAN
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border-4 border-black hard-shadow-black p-5 space-y-4"
                            >
                                <p className="text-red-600 text-[0.8rem] font-black uppercase tracking-widest border-b-2 border-red-200 pb-2">
                                    YAKIN INGIN MEMBATALKAN?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="flex-1 bg-red-600 text-white border-2 border-black py-3 text-[0.75rem] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-60 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                                    >
                                        {cancelling ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "YA, BATAL"}
                                    </button>
                                    <button
                                        onClick={() => setCancelConfirm(false)}
                                        className="flex-1 bg-gray-200 text-primary border-2 border-black py-3 text-[0.75rem] font-black uppercase tracking-widest hover:bg-gray-300 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                                    >
                                        TIDAK
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            <QRScannerModal
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScanned={handleQRScanned}
            />
        </div>
    );
}
