"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Ticket, CheckSquare, User, Phone, Mail } from "lucide-react";
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
                setError(data.error || "TERJADI KESALAHAN. SILAKAN COBA LAGI.");
                return;
            }
            router.push(`/queue/${event.id}/ticket/${data.ticketId}`);
        });
    }

    return (
        <div className="min-h-[100svh] bg-gradient-to-br from-gray-100 to-gray-300 paper-texture flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px]"
            >
                {/* Header Container */}
                <div className="mb-10 text-center relative">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-primary text-white mb-6 relative z-10"
                    >
                        <Ticket className="w-10 h-10" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight relative z-10">
                        Ambil Antrean
                    </h1>
                    <div className="mt-3 text-center relative z-10">
                        <p className="text-primary text-[0.9rem] font-bold uppercase tracking-wider truncate">
                            Event: <span className="font-black text-secondary">{event.name}</span>
                        </p>
                        <p className="text-primary/70 text-[0.8rem] font-bold uppercase tracking-widest mt-1 truncate">
                            {event.booth_name}
                        </p>
                    </div>
                </div>

                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mb-8"
                >
                    {/* Greeting */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1.5 border border-green-500 mb-2">
                            <CheckSquare className="w-4 h-4 text-green-700" />
                            <span className="text-green-700 text-[0.7rem] font-black uppercase tracking-widest">Akun Terverifikasi</span>
                        </div>
                        <p className="text-primary font-black text-2xl mt-4 uppercase tracking-wider">
                            HALO, {user.fullName}!
                        </p>
                        <p className="text-primary/50 text-[0.75rem] font-bold mt-2 uppercase tracking-widest">
                            DATA AKUNMU DIGUNAKAN UNTUK ANTREAN INI
                        </p>
                    </div>

                    {/* User Data Preview */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4 border-b border-gray-200 pb-3">
                            <User className="w-5 h-5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-primary/50 text-[0.7rem] font-black uppercase tracking-widest">NAMA LENGKAP</p>
                                <p className="text-primary font-bold text-[0.9rem] truncate uppercase tracking-wider">{user.fullName}</p>
                            </div>
                        </div>
                        {user.phoneNumber && (
                            <div className="flex items-center gap-4 border-b border-gray-200 pb-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-primary/50 text-[0.7rem] font-black uppercase tracking-widest">WHATSAPP</p>
                                    <p className="text-primary font-bold text-[0.9rem] truncate uppercase tracking-wider">{user.phoneNumber}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4 border-b border-gray-200 pb-3">
                            <Mail className="w-5 h-5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-primary/50 text-[0.7rem] font-black uppercase tracking-widest">EMAIL</p>
                                <p className="text-primary font-bold text-[0.9rem] truncate uppercase tracking-wider">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border border-red-200 text-red-600 p-3 mb-6 text-center"
                        >
                            <p className="text-[0.7rem] font-black uppercase tracking-widest">{error}</p>
                        </motion.div>
                    )}

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full bg-secondary text-white font-black text-[0.9rem] uppercase tracking-wider border-4 border-black hard-shadow-black py-4 flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                        {isPending ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> MEMPROSES...</>
                        ) : (
                            <><Ticket className="w-5 h-5" /> AMBIL NOMOR <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </motion.div>

                {/* Info note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-primary/50 text-[0.7rem] font-black uppercase tracking-widest mt-6"
                >
                    NOMOR ANTREAN TIDAK BISA DIPINDAHTANGANKAN.<br/>HADIR SAAT DIPANGGIL YA!
                </motion.p>
            </motion.div>
        </div>
    );
}
