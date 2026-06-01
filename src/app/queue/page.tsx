import type { Metadata } from "next";
import Link from "next/link";
import { fetchActiveQueueEvents } from "@/lib/queue/queueFetchers";
import { Ticket, Clock, Users, ArrowRight, QrCode } from "lucide-react";

export const metadata: Metadata = {
    title: "Antrean Photobooth | Sebooth",
    description: "Ambil nomor antrean photobooth Sebooth secara digital. Pantau posisi dan estimasi waktu tunggu secara real-time.",
};

export const dynamic = "force-dynamic";

export default async function QueueLandingPage() {
    const events = await fetchActiveQueueEvents();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0F3D2E] to-[#0a1628] flex flex-col items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)", backgroundSize: "32px 32px" }} />

            <div className="relative w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-4">
                        <Ticket className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Sistem Antrean
                    </h1>
                    <p className="text-white/50 mt-2 text-sm">
                        Pilih event untuk mengambil nomor antrean
                    </p>
                </div>

                {/* Events List */}
                {events.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
                        <QrCode className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 font-bold text-sm">Belum ada event antrean aktif saat ini.</p>
                        <p className="text-white/30 text-xs mt-1">Silakan hubungi staff Sebooth.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/queue/${event.id}`}
                                className="group block bg-white/10 backdrop-blur-xl border border-white/20 hover:border-[#D4AF37]/50 hover:bg-white/15 rounded-3xl p-5 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-white font-black text-base group-hover:text-[#D4AF37] transition-colors">
                                            {event.name}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-white/40 text-xs font-bold">
                                                <Clock className="w-3 h-3" />
                                                ~{Math.round(event.avg_session_duration_sec / 60)} min/sesi
                                            </span>
                                            <span className="flex items-center gap-1 text-white/40 text-xs font-bold">
                                                <Users className="w-3 h-3" />
                                                {event.booth_name}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* How it works */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-white/60 text-xs font-black uppercase tracking-wider mb-3">Cara Kerja</p>
                    <div className="space-y-2.5">
                        {[
                            { icon: "1️⃣", text: "Pilih event di atas & isi nama kamu" },
                            { icon: "2️⃣", text: "Dapat nomor antrean digital otomatis" },
                            { icon: "3️⃣", text: "Pantau posisi & estimasi waktu live" },
                            { icon: "4️⃣", text: "Datang ke booth saat dipanggil 📣" },
                        ].map((step) => (
                            <div key={step.icon} className="flex items-start gap-3">
                                <span className="text-sm">{step.icon}</span>
                                <p className="text-white/50 text-xs font-medium">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-white/20 text-xs">
                    Powered by Sebooth Queue System ✨
                </p>
            </div>
        </div>
    );
}
