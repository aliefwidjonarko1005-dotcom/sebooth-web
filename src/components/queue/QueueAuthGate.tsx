"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Ticket, Camera } from "lucide-react";
import type { QueueEvent } from "@/types/database";

interface QueueAuthGateProps {
    event: QueueEvent;
}

export default function QueueAuthGate({ event }: QueueAuthGateProps) {
    const router = useRouter();
    const redirectPath = `/queue/${event.id}`;

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

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-4"
                >
                    <div className="flex items-start gap-3 text-white/60 text-sm">
                        <Camera className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <p>
                            Untuk mengambil nomor antrean, kamu perlu memiliki akun Sebooth terlebih dahulu. 
                            Foto hasil sesimu akan otomatis tersimpan ke akunmu! ✨
                        </p>
                    </div>
                </motion.div>

                {/* Auth Options */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-3"
                >
                    {/* Login Button */}
                    <button
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)}
                        className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a1628] font-black text-sm rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <LogIn className="w-5 h-5" />
                        Sudah Punya Akun? Masuk
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">atau</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Register Button */}
                    <button
                        onClick={() => router.push(`/register?redirect=${encodeURIComponent(redirectPath)}`)}
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#D4AF37]/40 text-white font-black text-sm rounded-2xl py-4 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <UserPlus className="w-5 h-5" />
                        Belum Punya Akun? Daftar Dulu
                    </button>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                    <p className="text-white/50 text-xs font-black uppercase tracking-wider mb-3">
                        Keuntungan Punya Akun
                    </p>
                    <div className="space-y-2.5">
                        {[
                            { icon: "📸", text: "Foto otomatis tersimpan ke akunmu" },
                            { icon: "🔔", text: "Notifikasi real-time saat giliran tiba" },
                            { icon: "🖼️", text: "Akses galeri foto kapan saja" },
                            { icon: "⚡", text: "Ambil antrean lebih cepat di event berikutnya" },
                        ].map((benefit) => (
                            <div key={benefit.icon} className="flex items-start gap-3">
                                <span className="text-sm">{benefit.icon}</span>
                                <p className="text-white/50 text-xs font-medium">{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
