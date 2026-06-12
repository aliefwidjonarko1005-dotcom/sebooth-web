"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Ticket, Camera, Info } from "lucide-react";
import type { QueueEvent } from "@/types/database";

interface QueueAuthGateProps {
    event: QueueEvent;
}

export default function QueueAuthGate({ event }: QueueAuthGateProps) {
    const router = useRouter();
    const redirectPath = `/queue/${event.id}`;

    return (
        <div className="min-h-[100svh] bg-white paper-texture flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header Container */}
                <div className="bg-white border-4 border-black hard-shadow-black p-6 mb-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white border-2 border-black hard-shadow-black mb-4"
                    >
                        <Ticket className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight marker-font">
                        Ambil Antrean
                    </h1>
                    <div className="mt-4 p-3 bg-gray-100 border-2 border-black text-left">
                        <p className="text-primary text-[0.8rem] font-bold uppercase tracking-wider">
                            Event: <span className="font-black text-secondary">{event.name}</span>
                        </p>
                        <p className="text-primary/70 text-[0.7rem] font-bold uppercase tracking-widest mt-1">
                            📸 {event.booth_name}
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border-4 border-black hard-shadow-black p-5 mb-6 flex gap-4 items-start"
                >
                    <div className="bg-primary text-white p-2 border-2 border-black shrink-0 mt-1">
                        <Info className="w-6 h-6" />
                    </div>
                    <p className="text-primary text-[0.8rem] font-bold leading-relaxed">
                        UNTUK MENGAMBIL NOMOR ANTREAN, KAMU PERLU MEMILIKI AKUN SEBOOTH TERLEBIH DAHULU. 
                        FOTO HASIL SESIMU AKAN OTOMATIS TERSIMPAN KE AKUNMU! ✨
                    </p>
                </motion.div>

                {/* Auth Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {/* Login Button */}
                    <button
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black text-[0.85rem] uppercase tracking-wider border-4 border-black hard-shadow-black py-4 flex items-center justify-center gap-3 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        <LogIn className="w-5 h-5" />
                        Sudah Punya Akun? Masuk
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-[2px] bg-black" />
                        <span className="text-primary text-[0.7rem] font-black uppercase tracking-widest">atau</span>
                        <div className="flex-1 h-[2px] bg-black" />
                    </div>

                    {/* Register Button */}
                    <button
                        onClick={() => router.push(`/register?redirect=${encodeURIComponent(redirectPath)}`)}
                        className="w-full bg-white hover:bg-gray-50 text-primary font-black text-[0.85rem] uppercase tracking-wider border-4 border-black hard-shadow-black py-4 flex items-center justify-center gap-3 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        <UserPlus className="w-5 h-5" />
                        Belum Punya Akun? Daftar
                    </button>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-white border-2 border-black border-dashed p-5"
                >
                    <p className="text-primary text-[0.8rem] font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2 inline-block">
                        KEUNTUNGAN PUNYA AKUN
                    </p>
                    <div className="space-y-3">
                        {[
                            { icon: "📸", text: "FOTO OTOMATIS TERSIMPAN KE AKUNMU" },
                            { icon: "🔔", text: "NOTIFIKASI REAL-TIME SAAT GILIRAN TIBA" },
                            { icon: "🖼️", text: "AKSES GALERI FOTO KAPAN SAJA" },
                            { icon: "⚡", text: "AMBIL ANTREAN LEBIH CEPAT DI EVENT BERIKUTNYA" },
                        ].map((benefit) => (
                            <div key={benefit.icon} className="flex items-start gap-3">
                                <span className="text-base">{benefit.icon}</span>
                                <p className="text-primary text-[0.7rem] font-bold mt-0.5">{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
