"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Ticket, CheckCircle, User, Phone, Mail } from "lucide-react";
import type { QueueEvent } from "@/types/database";

interface QueueUserData {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
}

interface QueueJoinFormProps {
    event: QueueEvent;
    user: QueueUserData;
}

export default function QueueJoinForm({ event, user }: QueueJoinFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    async function handleSubmit() {
        setError("");

        startTransition(async () => {
            const res = await fetch("/api/queue/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
                return;
            }
            router.push(`/queue/${event.id}/ticket/${data.ticketId}`);
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0F3D2E] to-[#0a1628] flex flex-col items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)", backgroundSize: "32px 32px" }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-4"
                    >
                        <Ticket className="w-8 h-8 text-[#D4AF37]" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Ambil Antrean
                    </h1>
                    <p className="text-white/60 mt-2 text-sm font-medium">
                        {event.name}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                        📸 {event.booth_name}
                    </p>
                </div>

                {/* User Info Card — auto-filled */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
                >
                    {/* Greeting */}
                    <div className="text-center mb-5">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-300 text-xs font-bold">Akun Terverifikasi</span>
                        </div>
                        <p className="text-white font-black text-lg mt-3">
                            Halo, {user.fullName}! 👋
                        </p>
                        <p className="text-white/50 text-sm mt-1">
                            Data akunmu akan digunakan untuk antrean ini
                        </p>
                    </div>

                    {/* User Data Preview */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                            <User className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Nama</p>
                                <p className="text-white font-bold text-sm truncate">{user.fullName}</p>
                            </div>
                        </div>
                        {user.phoneNumber && (
                            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">WhatsApp</p>
                                    <p className="text-white font-bold text-sm truncate">{user.phoneNumber}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                            <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Email</p>
                                <p className="text-white font-bold text-sm truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mb-4"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a1628] font-black text-sm rounded-2xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                        ) : (
                            <><Ticket className="w-4 h-4" /> Ambil Nomor Antrean <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </motion.div>

                {/* Info note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-white/30 text-xs mt-6"
                >
                    Nomor antrean tidak bisa dipindahtangankan. Hadir saat dipanggil ya! 📣
                </motion.p>
            </motion.div>
        </div>
    );
}
