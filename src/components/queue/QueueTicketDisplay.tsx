"use client";

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Volume2, VolumeX, Bell, BellOff, QrCode, Check, HelpCircle } from "lucide-react";
import type { OwnQueueTicket, PublicQueueStatus, QueueProximityTier, QueueTicketStatus } from "@/types/database";
import { getProximityTier, getProximityTierColor } from "@/types/database";
import QRScannerModal from "./QRScannerModal";
import PoseIdeasCard from "./PoseIdeasCard";
import { FLOW_BUTTON_NAVY, FLOW_BUTTON_ORANGE, FLOW_HEADING } from "@/components/ui/FlowHero";
import { subscribeToPush, isPushSupported } from "@/lib/queue/pushSubscription";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import Guide from "@/components/guide/Guide";
import { useGuide } from "@/components/guide/useGuide";
import { QUEUE_TICKET_GUIDE, GUIDE_KEYS } from "@/config/guides";

interface QueueTicketDisplayProps {
    ticket: OwnQueueTicket;
    initialStatus: PublicQueueStatus;
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

/** The one thing the screen says at each moment of the ticket's life. */
function ticketMessage(status: QueueTicketStatus, inLine: boolean, position: number, checkedIn: boolean) {
    switch (status) {
        case "completed":
            return { title: "Sesi Selesai", body: "Terima kasih sudah berfoto bareng Sebooth." };
        case "expired":
            return { title: "Nomormu Terlewat", body: "Nomor ini sudah dilewati. Kamu bisa ambil nomor baru kalau antreannya masih buka." };
        case "cancelled":
            return { title: "Antrean Dibatalkan", body: "Nomor ini sudah tidak berlaku." };
        case "in_session":
            return { title: "Sedang Berfoto", body: "Selamat berfoto! Hasilnya otomatis masuk ke akunmu." };
        case "called":
            return checkedIn
                ? { title: "Giliranmu!", body: "Kamu sudah check-in. Scan QR di layar mesin untuk mulai foto." }
                : { title: "Giliranmu!", body: "Segera ke booth dan check-in. Kalau tidak, nomormu bisa dilewati." };
    }
    if (!inLine) return { title: "Memeriksa Nomormu", body: "Sebentar, status nomormu sedang diperbarui." };
    if (position <= 2) {
        return {
            title: position === 1 ? "Kamu Berikutnya" : "Satu Lagi Giliranmu",
            body: checkedIn ? "Kamu sudah check-in. Tunggu di dekat booth ya." : "Menuju booth sekarang dan check-in.",
        };
    }
    if (position <= 4) return { title: "Hampir Giliranmu", body: "Mulai balik ke area booth ya." };
    return { title: "Masih Ada Waktu", body: "Kamu bebas jalan-jalan dulu. Halaman ini memberi tahu kapan harus kembali." };
}

const noSubscribe = () => () => {};

export default function QueueTicketDisplay({ ticket, initialStatus, eventId }: QueueTicketDisplayProps) {
    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const [status, setStatus] = useState<PublicQueueStatus>(initialStatus);
    const [sseConnected, setSseConnected] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushHint, setPushHint] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle');
    const [scanError, setScanError] = useState('');
    const guide = useGuide(GUIDE_KEYS.queueTicket, { enabled: !showQRScanner });
    const sseRef = useRef<EventSource | null>(null);
    const retryCount = useRef(0);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevTierRef = useRef<QueueProximityTier>("waiting");
    const pushSubscribedRef = useRef(false);

    // False on the server and on first paint, so the bell never causes a hydration mismatch
    const pushSupported = useSyncExternalStore(noSubscribe, isPushSupported, () => false);

    // The public status carries no ticket ids; a number is unique within an event
    const myWaitingData = status.waitingTickets.find((t) => t.queue_number === ticket.queue_number);
    const myCurrentData = status.currentTicket?.queue_number === ticket.queue_number ? status.currentTicket : undefined;
    const myPosition = myWaitingData?.positionFromFront ?? 0;
    const myEstimateMs = myWaitingData?.estimatedWaitMs ?? 0;

    const liveStatus: QueueTicketStatus = myCurrentData?.status ?? (myWaitingData ? "waiting" : ticket.status);
    const inLine = !!myWaitingData;
    const atBooth = liveStatus === "called" || liveStatus === "in_session";

    // Ended tickets have no position, so they sit on the calm colour instead of counting as "first in line"
    const proximityTier: QueueProximityTier = inLine || atBooth ? getProximityTier(myPosition, liveStatus) : "waiting";
    const tierColors = getProximityTierColor(proximityTier);

    const [checkedInNow, setCheckedInNow] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkInError, setCheckInError] = useState('');
    const isCheckedIn = checkedInNow || (myCurrentData ?? myWaitingData ?? ticket).is_checked_in;
    const canCheckIn = !isCheckedIn && (liveStatus === "called" || (inLine && myPosition <= 2));

    const message = ticketMessage(liveStatus, inLine, myPosition, isCheckedIn);
    const peopleAhead = status.waitingTickets.filter((t) => t.queue_number !== ticket.queue_number && t.positionFromFront < myPosition);
    const waitMinutes = Math.ceil(myEstimateMs / 60_000);
    const sessionMinutes = Math.round(status.avgDurationSec / 60);

    const currentSessionMinutes = status.currentTicket?.called_at
        ? Math.floor((Date.now() - new Date(status.currentTicket.called_at).getTime()) / 60_000)
        : undefined;

    useEffect(() => {
        if (pushSubscribedRef.current || !ticket.user_id) return;
        if (!isPushSupported()) return;
        pushSubscribedRef.current = true;

        subscribeToPush().then((sub) => {
            if (sub) setPushEnabled(true);
        });
    }, [ticket.user_id]);

    async function handleEnablePush() {
        if (!ticket.user_id) return;
        const sub = await subscribeToPush();
        setPushEnabled(!!sub);
        setPushHint(!sub);
    }

    async function handleCheckIn() {
        setIsCheckingIn(true);
        setCheckInError('');
        try {
            const res = await fetch('/api/queue/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ticket.id, eventId }),
            });
            const data = await res.json();
            if (data.success) {
                setCheckedInNow(true);
            } else {
                setCheckInError(res.status === 401 ? 'Sesi login kamu habis. Masuk lagi untuk check-in.' : data.error || 'Gagal check-in. Silakan coba lagi.');
            }
        } catch {
            setCheckInError('Koneksi terputus. Gagal check-in, coba lagi.');
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

    const closeScanner = useCallback(() => setShowQRScanner(false), []);

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

    // The live lists only hold active tickets. Once this one leaves them, ask the server how it ended.
    const leftLiveQueue = !inLine && !myCurrentData && ["waiting", "called", "in_session"].includes(ticket.status);
    useEffect(() => {
        if (leftLiveQueue) router.refresh();
    }, [leftLiveQueue, router]);

    async function handleCancel() {
        setCancelling(true);
        setCancelError('');
        try {
            const res = await fetch(`/api/queue/ticket/${ticket.id}`, { method: "DELETE" });
            if (res.ok) {
                window.location.href = `/queue`;
                return;
            }
            setCancelError(res.status === 401 ? 'Sesi login kamu habis. Masuk lagi untuk membatalkan.' : 'Gagal membatalkan antrean. Silakan coba lagi.');
        } catch {
            setCancelError('Koneksi terputus. Silakan coba lagi.');
        }
        setCancelling(false);
    }

    const isCompleted = liveStatus === "completed";
    const sessionObjId = ticket.session_id;
    const isVoid = liveStatus === "expired" || liveStatus === "cancelled";
    const showScan = liveStatus === "called" && !!ticket.user_id && isCheckedIn;
    const hasStub = inLine || liveStatus === "called" || isVoid || (isCompleted && (!!sessionObjId || !!ticket.user_id));

    const iconButton =
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-dark transition-transform focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-dark active:scale-90";

    return (
        <div className={`min-h-svh ${tierColors.bg} ${tierColors.text} transition-colors duration-700`}>
            <div className="mx-auto w-full max-w-md px-4 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
                <header className="flex items-center justify-between gap-2">
                    <Link
                        href="/"
                        aria-label="Sebooth, kembali ke beranda"
                        className="-ml-1 flex min-h-11 items-center px-1 focus-visible:outline-2 focus-visible:outline-current"
                    >
                        <Image
                            src={tierColors.text === "text-white" ? "/images/logo/sebooth-white.svg" : "/images/logo/sebooth-navy.svg"}
                            alt=""
                            width={67}
                            height={28}
                            unoptimized
                            priority
                            className="h-7 w-auto"
                        />
                    </Link>
                    <div className="flex items-center gap-2">
                        {pushSupported && (
                            <button
                                id="guide-ticket-push"
                                type="button"
                                onClick={handleEnablePush}
                                aria-pressed={pushEnabled}
                                aria-label={pushEnabled ? "Notifikasi aktif" : "Aktifkan notifikasi"}
                                title={pushEnabled ? "Notifikasi aktif" : "Aktifkan notifikasi"}
                                className={iconButton}
                            >
                                {pushEnabled ? <Bell className="h-5 w-5 fill-current" /> : <BellOff className="h-5 w-5" />}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setSoundEnabled((s) => !s)}
                            aria-pressed={soundEnabled}
                            aria-label={soundEnabled ? "Matikan suara" : "Nyalakan suara"}
                            title={soundEnabled ? "Matikan suara" : "Nyalakan suara"}
                            className={iconButton}
                        >
                            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </button>
                        <button type="button" onClick={guide.start} aria-label="Buka panduan halaman ini" title="Panduan" className={iconButton}>
                            <HelpCircle className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {pushHint && (
                    <p role="status" className="mt-3 rounded-lg bg-white p-3 text-[15px] leading-snug font-medium text-blue-dark">
                        Notifikasi belum aktif. Izinkan notifikasi untuk situs ini di pengaturan browser.
                    </p>
                )}

                <p className="mt-5 text-[15px] leading-snug font-medium">
                    {status.event?.name || "Sebooth Photobooth"}
                    {status.event?.booth_name ? ` · ${status.event.booth_name}` : ""}
                </p>

                <motion.div
                    key={message.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    aria-live="polite"
                >
                    <h1 className="mt-1 font-bayon text-[2.75rem] leading-none uppercase">{message.title}</h1>
                    <p className="mt-2 text-[17px] leading-snug font-medium">{message.body}</p>
                </motion.div>

                {/* The ticket: main part and stub, scooped where they meet */}
                <section aria-label="Tiket antrean" className="mt-5 text-blue-dark">
                    <div className={`bg-white px-5 pt-5 text-center ${hasStub ? "ticket-top rounded-t-2xl pb-6" : "rounded-2xl pb-6"}`}>
                        <motion.div
                            id="guide-ticket-number"
                            animate={liveStatus === "called" && !reduceMotion ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                            transition={liveStatus === "called" && !reduceMotion ? { repeat: Infinity, duration: 1.5 } : { duration: 0.2 }}
                        >
                            <p className="text-[15px] leading-snug text-slate-600">Nomor antrean</p>
                            <p className={`text-[8rem] leading-[0.95] font-extrabold tracking-tight tabular-nums ${isVoid ? "text-slate-400" : "text-primary"}`}>
                                {String(ticket.queue_number).padStart(3, "0")}
                            </p>
                            <p className="mt-2 truncate text-[17px] leading-snug font-bold">{ticket.display_name}</p>
                        </motion.div>
                    </div>

                    {hasStub && (
                        <div className="ticket-bottom -mt-px rounded-b-2xl bg-white px-5 pb-5">
                            <div aria-hidden="true" className="border-t-2 border-dashed border-slate-300" />

                            <div className="space-y-4 pt-5">
                                {inLine && (
                                    <div id="guide-ticket-timer">
                                        <dl className="grid grid-cols-2 gap-x-4">
                                            <div>
                                                <dt className="text-[15px] leading-snug text-slate-600">Urutan</dt>
                                                <dd className="mt-0.5 text-[1.75rem] leading-tight font-bold tabular-nums text-primary">ke-{myPosition}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-[15px] leading-snug text-slate-600">Perkiraan tunggu</dt>
                                                <dd className="mt-0.5 text-[1.75rem] leading-tight font-bold tabular-nums text-primary">
                                                    {waitMinutes > 0 ? `±${waitMinutes} menit` : "Sebentar lagi"}
                                                </dd>
                                            </div>
                                        </dl>
                                        <p className="mt-3 flex items-center gap-2 text-[15px] leading-snug text-slate-600">
                                            <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${sseConnected ? "bg-green-600" : "bg-slate-400"}`} />
                                            {sseConnected ? "Live" : "Diperbarui berkala"} · sesi rata-rata ±{sessionMinutes} menit
                                        </p>
                                    </div>
                                )}

                                {(inLine || liveStatus === "called") && (
                                    <div id="guide-ticket-checkin">
                                        {canCheckIn ? (
                                            <button type="button" onClick={handleCheckIn} disabled={isCheckingIn} className={FLOW_BUTTON_ORANGE}>
                                                {isCheckingIn ? <SeboothLoader variant="mini" className="h-5 w-5" /> : "Check-in Sekarang"}
                                            </button>
                                        ) : isCheckedIn ? (
                                            <p className="flex items-center gap-2 text-[17px] leading-snug font-bold text-primary">
                                                <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                                                Sudah check-in
                                            </p>
                                        ) : (
                                            <p className="text-[15px] leading-snug text-slate-600">
                                                Tombol check-in muncul saat kamu tinggal dua antrean lagi.
                                            </p>
                                        )}
                                        {checkInError && (
                                            <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-[15px] leading-snug font-medium text-red-700">
                                                {checkInError}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {showScan && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowQRScanner(true);
                                            setScanStatus('idle');
                                            setScanError('');
                                        }}
                                        className={FLOW_BUTTON_ORANGE}
                                    >
                                        <QrCode className="h-6 w-6" aria-hidden="true" />
                                        Scan QR untuk Mulai
                                    </button>
                                )}

                                {scanStatus === 'linking' && (
                                    <p role="status" className="flex items-center gap-2 text-[15px] font-semibold">
                                        <SeboothLoader variant="mini" className="h-5 w-5 text-primary" />
                                        Menghubungkan sesi
                                    </p>
                                )}
                                {scanStatus === 'success' && (
                                    <p role="status" className="flex items-center gap-2 text-[15px] font-semibold text-primary">
                                        <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        Sesi terhubung
                                    </p>
                                )}
                                {scanStatus === 'error' && (
                                    <p role="alert" className="rounded-lg bg-red-50 p-3 text-[15px] leading-snug font-medium text-red-700">
                                        {scanError}
                                    </p>
                                )}

                                {isCompleted && sessionObjId && (
                                    <Link href={`/access/${sessionObjId}`} className={FLOW_BUTTON_ORANGE}>
                                        <Camera className="h-5 w-5" aria-hidden="true" /> Lihat Foto Saya
                                    </Link>
                                )}
                                {isCompleted && !sessionObjId && ticket.user_id && (
                                    <Link href="/profile" className={FLOW_BUTTON_ORANGE}>
                                        <Camera className="h-5 w-5" aria-hidden="true" /> Lihat di Profil
                                    </Link>
                                )}
                                {isVoid && (
                                    <Link href="/queue" className={FLOW_BUTTON_NAVY}>
                                        Lihat Antrean yang Buka
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <div className="mt-4 space-y-4">
                    {inLine && (status.currentTicket || peopleAhead.length > 0) && (
                        <section className="rounded-2xl bg-white p-5 text-[17px] leading-snug text-blue-dark">
                            <h2 className={FLOW_HEADING}>Antrean di Depanmu</h2>
                            <ul className="mt-3 space-y-2">
                                {status.currentTicket && (
                                    <li className="flex items-baseline justify-between gap-3">
                                        <span className="min-w-0 truncate">
                                            <b className="tabular-nums">{String(status.currentTicket.queue_number).padStart(3, "0")}</b> {status.currentTicket.display_name}
                                        </span>
                                        <span className="shrink-0 text-[15px] text-slate-600">
                                            {status.currentTicket.status === "called" ? "Dipanggil" : "Sedang berfoto"}
                                            {currentSessionMinutes ? `, ${currentSessionMinutes} menit` : ""}
                                        </span>
                                    </li>
                                )}
                                {peopleAhead.slice(0, 3).map((t) => (
                                    <li key={t.queue_number} className="truncate">
                                        <b className="tabular-nums">{String(t.queue_number).padStart(3, "0")}</b> {t.display_name}
                                    </li>
                                ))}
                                {peopleAhead.length > 3 && (
                                    <li className="text-[15px] text-slate-600">dan {peopleAhead.length - 3} orang lagi</li>
                                )}
                            </ul>
                        </section>
                    )}

                    {(inLine || liveStatus === "called") && <PoseIdeasCard />}

                    {(inLine || atBooth) && (
                        <p className="text-center text-[15px] leading-snug font-medium">
                            {status.totalWaiting} orang menunggu · {status.totalCompleted} sesi selesai
                        </p>
                    )}

                    {inLine && (cancelConfirm ? (
                        <div className="rounded-2xl bg-white p-5 text-blue-dark">
                            <p className="text-[17px] leading-snug font-bold">Yakin batalkan nomor ini?</p>
                            <p className="mt-1 text-[15px] leading-snug text-slate-600">Kalau berubah pikiran, kamu harus ambil nomor baru dari belakang.</p>
                            {cancelError && (
                                <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-[15px] leading-snug font-medium text-red-700">
                                    {cancelError}
                                </p>
                            )}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="flex min-h-12 items-center justify-center rounded-full bg-red-600 text-[15px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                                >
                                    {cancelling ? <SeboothLoader variant="mini" className="h-5 w-5" /> : "Ya, batalkan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCancelConfirm(false)}
                                    className="min-h-12 rounded-full bg-blue-light text-[15px] font-bold text-primary transition-colors hover:bg-slate-200"
                                >
                                    Tidak
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCancelConfirm(true)}
                            className="mx-auto flex min-h-11 items-center px-4 text-[15px] font-semibold underline underline-offset-4"
                        >
                            Batalkan antrean
                        </button>
                    ))}
                </div>
            </div>

            <QRScannerModal isOpen={showQRScanner} onClose={closeScanner} onScanned={handleQRScanned} />

            <Guide steps={QUEUE_TICKET_GUIDE} open={guide.open} onClose={guide.close} storageKey={GUIDE_KEYS.queueTicket} />
        </div>
    );
}
