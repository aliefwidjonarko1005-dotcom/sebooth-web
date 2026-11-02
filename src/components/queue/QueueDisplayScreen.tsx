"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublicQueueStatus } from "@/types/database";

interface QueueDisplayScreenProps {
    eventId: string;
    initialStatus: PublicQueueStatus;
}

/** Venue monitor, read from across the room. Everything is sized in vh so it fits any TV. */
export default function QueueDisplayScreen({ eventId, initialStatus }: QueueDisplayScreenProps) {
    const [status, setStatus] = useState<PublicQueueStatus>(initialStatus);
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

    const current = status.currentTicket;
    const isCalled = current?.status === "called";
    const stats = [
        { label: "Menunggu", value: status.totalWaiting },
        { label: "Selesai", value: status.totalCompleted },
        { label: "Menit/sesi", value: `±${Math.round(status.avgDurationSec / 60)}` },
    ];

    return (
        <div className="flex h-svh flex-col overflow-hidden bg-primary text-white select-none">
            <header className="flex items-start justify-between gap-[4vw] px-[4vw] pt-[4vh] pb-[2vh]">
                <div className="min-w-0">
                    <h1 className="truncate font-bayon text-[6vh] leading-none uppercase">{status.event?.name || "Antrean Sebooth"}</h1>
                    <p className="mt-[1vh] truncate text-[2.8vh] leading-none text-white/85">{status.event?.booth_name}</p>
                </div>
                {/* The clock renders on the server too, and the seconds never match */}
                <div className="shrink-0 text-right">
                    <p suppressHydrationWarning className="text-[6vh] leading-none font-bold tabular-nums">
                        {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p suppressHydrationWarning className="mt-[1vh] text-[2.8vh] leading-none text-white/85">
                        {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
            </header>

            <main className="flex min-h-0 flex-1">
                <section className="flex min-w-0 flex-1 flex-col items-center justify-center px-[4vw] text-center">
                    <h2 className="font-bayon text-[5vh] leading-none uppercase">Sedang Dilayani</h2>

                    <AnimatePresence mode="wait">
                        {current ? (
                            <motion.div
                                key={current.queue_number}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p
                                    className={`text-[38vh] leading-none font-extrabold tabular-nums transition-colors duration-500 ${isCalled ? "text-secondary" : "text-white"} ${flashNew ? "animate-pulse" : ""}`}
                                >
                                    {String(current.queue_number).padStart(3, "0")}
                                </p>
                                <p className="mt-[1vh] text-[4.5vh] leading-tight font-semibold">{current.display_name}</p>
                                <p className="mt-[1vh] text-[3.2vh] leading-tight text-white/85">{isCalled ? "Dipanggil, silakan ke booth" : "Sedang berfoto"}</p>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p className="text-[24vh] leading-none font-extrabold text-white/25">---</p>
                                <p className="mt-[2vh] text-[3.2vh] leading-tight text-white/85">Menunggu antrean berikutnya</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <aside className="flex w-[32vw] min-w-80 shrink-0 flex-col bg-blue-dark px-[2.5vw] py-[4vh]">
                    <h2 className="font-bayon text-[4vh] leading-none uppercase">Antrean Berikutnya</h2>

                    <ul className="mt-[2.5vh] min-h-0 flex-1 space-y-[1.5vh]">
                        {status.waitingTickets.slice(0, 5).map((t, i) => (
                            <li key={t.queue_number} className={`flex items-baseline gap-[1.5vw] ${i === 0 ? "text-white" : "text-white/70"}`}>
                                <span className="text-[5vh] leading-none font-extrabold tabular-nums">{String(t.queue_number).padStart(3, "0")}</span>
                                <span className="min-w-0 truncate text-[2.8vh] leading-none">{t.display_name}</span>
                            </li>
                        ))}
                        {status.waitingTickets.length === 0 && <li className="text-[2.8vh] leading-snug text-white/85">Belum ada yang menunggu</li>}
                    </ul>

                    <dl className="mt-[2vh] grid grid-cols-3 gap-[1vw]">
                        {stats.map((s) => (
                            <div key={s.label}>
                                <dd className="text-[4vh] leading-none font-bold tabular-nums">{s.value}</dd>
                                <dt className="mt-[0.8vh] text-[2.2vh] leading-none text-white/85">{s.label}</dt>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-[3vh] text-[2.8vh] leading-snug">
                        Ambil nomor di <b className="font-bold whitespace-nowrap">sebooth.in/queue</b>
                    </p>
                </aside>
            </main>
        </div>
    );
}
