"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Play, SkipForward, CheckCircle, RotateCcw,
    QrCode, Loader2, Users, Clock, Zap, Monitor, X, Power,
} from "lucide-react";
import QueueQrCode from "./QueueQrCode";
import type { QueueEvent, QueueTicket } from "@/types/database";
import QueueStatusBadge from "../queue/QueueStatusBadge";
import { createQueueEvent, toggleQueueEventActive } from "@/lib/queue/queueActions";

interface QueueStatus {
    event: QueueEvent | null;
    currentTicket: QueueTicket | null;
    waitingTickets: Array<QueueTicket & { positionFromFront: number; estimatedWaitMs: number }>;
    avgDurationSec: number;
    totalWaiting: number;
    totalCompleted: number;
    allActiveTickets: QueueTicket[];
}

interface QueueOperatorTabProps {
    flash: (msg: string) => void;
}

export default function QueueOperatorTab({ flash }: QueueOperatorTabProps) {
    const [events, setEvents] = useState<QueueEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [status, setStatus] = useState<QueueStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showQr, setShowQr] = useState(false);

    // Create form state
    const [newName, setNewName] = useState("");
    const [newBooth, setNewBooth] = useState("Main Booth");
    const [newDuration, setNewDuration] = useState("10");
    const [creating, setCreating] = useState(false);

    const sseRef = useRef<EventSource | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    // Load events
    const loadEvents = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/queue/events");
        const data = await res.json();
        setEvents(data.events || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Connect SSE for selected event
    useEffect(() => {
        if (!selectedEventId) return;

        // Initial fetch
        fetch(`/api/queue/${selectedEventId}/status`)
            .then((r) => r.json())
            .then((d) => setStatus(d))
            .catch(console.error);

        // SSE
        if (sseRef.current) sseRef.current.close();
        const es = new EventSource(`/api/queue/stream/${selectedEventId}`);
        sseRef.current = es;

        es.addEventListener("queue_update", (ev) => {
            try { setStatus(JSON.parse(ev.data)); } catch { /* ignore */ }
        });

        es.onerror = () => {
            es.close();
            // Polling fallback
            if (!pollingRef.current) {
                pollingRef.current = setInterval(async () => {
                    const res = await fetch(`/api/queue/${selectedEventId}/status`);
                    const d = await res.json();
                    setStatus(d);
                }, 10000);
            }
        };

        return () => {
            es.close();
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [selectedEventId]);

    async function doAction(action: string, ticketId?: string, sessionId?: string) {
        const key = action + (ticketId || "");
        setActionLoading(key);
        const res = await fetch("/api/queue/operator/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, eventId: selectedEventId, ticketId, sessionId }),
        });
        const data = await res.json();
        setActionLoading(null);
        if (data.success) {
            flash(action === "call_next" ? `Memanggil #${data.calledNumber}!` : "Berhasil!");
        } else {
            flash(`Error: ${data.error}`);
        }
    }

    async function handleCreateEvent() {
        if (!newName.trim()) { flash("Nama event wajib diisi"); return; }
        setCreating(true);
        const result = await createQueueEvent(newName.trim(), newBooth.trim(), parseInt(newDuration) * 60);
        setCreating(false);
        if (result.success) {
            flash("Event antrean berhasil dibuat!");
            setShowCreateForm(false);
            setNewName(""); setNewBooth("Main Booth"); setNewDuration("10");
            await loadEvents();
            if (result.eventId) setSelectedEventId(result.eventId);
        } else {
            flash(`Error: ${result.error}`);
        }
    }

    async function handleToggleActive(eventId: string, isActive: boolean) {
        await toggleQueueEventActive(eventId, !isActive);
        await loadEvents();
        flash(isActive ? "Event dinonaktifkan" : "Event diaktifkan");
    }

    const allTickets = status ? [
        ...(status.currentTicket ? [status.currentTicket] : []),
        ...(status.waitingTickets || []),
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-[#1A1A1A]">🎫 Operator Antrean</h2>
                    <p className="text-[#1A1A1A]/40 text-xs mt-0.5">Kelola antrean photobooth secara real-time</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F3D2E] text-white text-sm font-bold hover:bg-[#195240] transition-all"
                >
                    <Plus className="w-4 h-4" /> Buat Event
                </button>
            </div>

            {/* Create Event Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="bg-[#F9F9F9] border border-[#1A1A1A]/10 rounded-2xl p-5 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[#1A1A1A] text-sm">Buat Event Antrean Baru</h3>
                            <button onClick={() => setShowCreateForm(false)} className="text-[#1A1A1A]/30 hover:text-[#1A1A1A]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wider block mb-1">Nama Event *</label>
                                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm font-bold"
                                    placeholder="e.g. Wedding Gala Sabtu 31 Mei" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wider block mb-1">Nama Booth</label>
                                    <input value={newBooth} onChange={(e) => setNewBooth(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm"
                                        placeholder="Main Booth" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wider block mb-1">Durasi Sesi (menit)</label>
                                    <input type="number" min="3" max="60" value={newDuration}
                                        onChange={(e) => setNewDuration(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm font-bold" />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleCreateEvent} disabled={creating}
                            className="w-full bg-[#0F3D2E] text-white font-bold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-[#195240] transition-all disabled:opacity-60">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Buat Event
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Events Selector */}
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#0F3D2E]" /></div>
            ) : events.length === 0 ? (
                <div className="bg-[#F9F9F9] border border-[#1A1A1A]/10 rounded-2xl p-8 text-center">
                    <Users className="w-8 h-8 text-[#1A1A1A]/20 mx-auto mb-2" />
                    <p className="text-[#1A1A1A]/40 text-sm">Belum ada event. Buat event antrean pertama di atas.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Pilih Event</p>
                    {events.map((event) => (
                        <div key={event.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                selectedEventId === event.id
                                    ? "bg-[#0F3D2E]/5 border-[#0F3D2E]/30"
                                    : "bg-[#F9F9F9] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"
                            }`}
                            onClick={() => setSelectedEventId(event.id)}
                        >
                            <div>
                                <p className="font-bold text-[#1A1A1A] text-sm">{event.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[#1A1A1A]/40 text-xs">{event.booth_name}</span>
                                    <span className="text-[#1A1A1A]/40 text-xs">~{Math.round(event.avg_session_duration_sec / 60)} min/sesi</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${event.is_active ? "bg-green-400" : "bg-gray-300"}`} />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(event.id, event.is_active); }}
                                    className="p-1.5 rounded-lg bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-all"
                                    title={event.is_active ? "Nonaktifkan event" : "Aktifkan event"}
                                >
                                    <Power className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Operator Dashboard */}
            {selectedEventId && status && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: <Users className="w-4 h-4" />, label: "Menunggu", value: status.totalWaiting, color: "text-blue-600" },
                            { icon: <CheckCircle className="w-4 h-4" />, label: "Selesai", value: status.totalCompleted, color: "text-green-600" },
                            { icon: <Clock className="w-4 h-4" />, label: "Avg/Sesi", value: `${Math.round(status.avgDurationSec / 60)}m`, color: "text-[#D4AF37]" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 text-center">
                                <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                                <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
                                <p className="text-[#1A1A1A]/40 text-xs font-bold uppercase">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">Aksi Cepat</p>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => doAction("call_next")}
                                disabled={actionLoading === "call_next" || status.totalWaiting === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-bold hover:bg-[#195240] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === "call_next" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Panggil Berikutnya
                            </button>
                            <button
                                onClick={() => setShowQr(!showQr)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A]/5 text-[#1A1A1A] text-sm font-bold hover:bg-[#1A1A1A]/10 transition-all"
                            >
                                <QrCode className="w-4 h-4" /> QR Code
                            </button>
                            <a
                                href={`/queue/${selectedEventId}/display`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A]/5 text-[#1A1A1A] text-sm font-bold hover:bg-[#1A1A1A]/10 transition-all"
                            >
                                <Monitor className="w-4 h-4" /> Layar TV
                            </a>
                        </div>

                        {/* QR Code */}
                        <AnimatePresence>
                            {showQr && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3 border-t border-[#1A1A1A]/10">
                                        <p className="text-xs text-[#1A1A1A]/50 mb-3">
                                            Scan untuk ambil antrean: <span className="font-bold text-[#0F3D2E]">{baseUrl}/queue/{selectedEventId}</span>
                                        </p>
                                        <QueueQrCode url={`${baseUrl}/queue/${selectedEventId}`} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Current serving */}
                    {status.currentTicket && (
                        <div className="bg-[#0F3D2E]/5 border border-[#0F3D2E]/20 rounded-2xl p-4">
                            <p className="text-xs font-black text-[#0F3D2E]/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" /> Sedang Dilayani
                            </p>
                            <TicketRow
                                ticket={status.currentTicket}
                                eventId={selectedEventId}
                                actionLoading={actionLoading}
                                onSkip={(id) => doAction("skip", id)}
                                onComplete={(id) => doAction("complete", id)}
                                onReset={(id) => doAction("reset", id)}
                                isCurrent
                            />
                        </div>
                    )}

                    {/* Waiting List */}
                    <div className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">
                            Daftar Antrean ({status.totalWaiting} menunggu)
                        </p>
                        {status.waitingTickets.length === 0 ? (
                            <p className="text-[#1A1A1A]/30 text-sm text-center py-4">Tidak ada antrean yang menunggu</p>
                        ) : (
                            <div className="space-y-2">
                                {status.waitingTickets.map((ticket) => (
                                    <TicketRow
                                        key={ticket.id}
                                        ticket={ticket}
                                        eventId={selectedEventId}
                                        actionLoading={actionLoading}
                                        onSkip={(id) => doAction("skip", id)}
                                        onComplete={(id) => doAction("complete", id)}
                                        onReset={(id) => doAction("reset", id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ── Ticket Row Component ──
function TicketRow({
    ticket,
    onSkip,
    onComplete,
    onReset,
    actionLoading,
    isCurrent = false,
}: {
    ticket: QueueTicket & { positionFromFront?: number; estimatedWaitMs?: number };
    eventId: string;
    actionLoading: string | null;
    onSkip: (id: string) => void;
    onComplete: (id: string) => void;
    onReset: (id: string) => void;
    isCurrent?: boolean;
}) {
    const isLoading = (action: string) => actionLoading === action + ticket.id;

    return (
        <div className={`flex items-center justify-between gap-3 p-3 rounded-xl ${isCurrent ? "bg-[#0F3D2E]/10" : "bg-[#F9F9F9]"}`}>
            <div className="flex items-center gap-3 min-w-0">
                <span className={`font-black tabular-nums text-xl shrink-0 ${isCurrent ? "text-[#0F3D2E]" : "text-[#1A1A1A]"}`}>
                    #{String(ticket.queue_number).padStart(3, "0")}
                </span>
                <div className="min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-sm truncate">{ticket.display_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <QueueStatusBadge status={ticket.status} />
                        {ticket.phone_number && (
                            <span className="text-[#1A1A1A]/30 text-[10px] font-medium">{ticket.phone_number}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
                {(ticket.status === "called" || ticket.status === "in_session") && (
                    <button
                        onClick={() => onComplete(ticket.id)}
                        disabled={isLoading("complete")}
                        className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all disabled:opacity-50"
                        title="Selesai"
                    >
                        {isLoading("complete") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                )}
                {ticket.status === "waiting" && (
                    <button
                        onClick={() => onReset(ticket.id)}
                        disabled={isLoading("reset")}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                        title="Reset ke menunggu"
                    >
                        {isLoading("reset") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    </button>
                )}
                <button
                    onClick={() => onSkip(ticket.id)}
                    disabled={isLoading("skip")}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    title="Skip / Expired"
                >
                    {isLoading("skip") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SkipForward className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}
