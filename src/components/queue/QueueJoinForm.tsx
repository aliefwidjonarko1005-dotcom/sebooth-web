"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, ArrowRight, Loader2, Ticket } from "lucide-react";
import type { QueueEvent } from "@/types/database";

interface QueueJoinFormProps {
    event: QueueEvent;
}

export default function QueueJoinForm({ event }: QueueJoinFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [displayName, setDisplayName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!displayName.trim()) {
            setError("Nama wajib diisi.");
            return;
        }
        setError("");

        startTransition(async () => {
            const res = await fetch("/api/queue/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                    displayName: displayName.trim(),
                    phoneNumber: phoneNumber.trim() || undefined,
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

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                                Nama Kamu *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Masukkan nama lengkapmu"
                                    maxLength={50}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 font-medium text-sm focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/15 transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                                Nomor WhatsApp{" "}
                                <span className="text-white/30 font-normal normal-case">
                                    (opsional — untuk notifikasi)
                                </span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="08xx xxxx xxxx"
                                    maxLength={16}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 font-medium text-sm focus:outline-none focus:border-[#D4AF37]/60 focus:bg-white/15 transition-all"
                                />
                            </div>
                            {phoneNumber && (
                                <p className="text-[#D4AF37]/70 text-xs mt-1.5 pl-1">
                                    ✓ Kamu akan mendapat notifikasi WA saat giliran hampir tiba
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a1628] font-black text-sm rounded-2xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                            ) : (
                                <><Ticket className="w-4 h-4" /> Ambil Nomor Antrean <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
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
