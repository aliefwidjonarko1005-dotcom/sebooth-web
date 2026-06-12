"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Ticket, ArrowRight, Clock, MapPin } from "lucide-react";
import type { QueueTicket, QueueProximityTier } from "@/types/database";
import { getProximityTier, getProximityTierLabel, getProximityTierColor } from "@/types/database";

interface ActiveQueueCardProps {
    tickets: QueueTicket[];
}

export default function ActiveQueueCard({ tickets }: ActiveQueueCardProps) {
    if (tickets.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <h3 className="text-white/50 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
                Antrean Aktif
            </h3>

            <div className="space-y-3">
                {tickets.map((ticket) => {
                    const event = ticket.queue_events;
                    // For profile display, estimate position (may not be precise without full queue data)
                    const tier: QueueProximityTier = getProximityTier(
                        0, // Position not known here, use status-based
                        ticket.status
                    );
                    const colors = getProximityTierColor(
                        ticket.status === "called" || ticket.status === "in_session" ? "your_turn"
                        : "waiting"
                    );
                    const label = getProximityTierLabel(
                        ticket.status === "called" || ticket.status === "in_session" ? "your_turn"
                        : "waiting"
                    );

                    return (
                        <Link
                            key={ticket.id}
                            href={`/queue/${ticket.event_id}/ticket/${ticket.id}`}
                            className="group block"
                        >
                            <div className={`bg-white/5 border ${colors.border} rounded-2xl p-4 hover:bg-white/10 transition-all`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center gap-1 ${colors.bg} ${colors.text} text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-0.5`}>
                                                {label}
                                            </span>
                                            <span className="text-white font-black text-sm">
                                                #{String(ticket.queue_number).padStart(3, "0")}
                                            </span>
                                        </div>
                                        {event && (
                                            <p className="text-white/60 text-xs font-bold truncate">
                                                {event.name}
                                            </p>
                                        )}
                                        {event && (
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-white/30 text-[10px]">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {event.booth_name}
                                                </span>
                                                <span className="flex items-center gap-1 text-white/30 text-[10px]">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    ~{Math.round(event.avg_session_duration_sec / 60)} min/sesi
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}
