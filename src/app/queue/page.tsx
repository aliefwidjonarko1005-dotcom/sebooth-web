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
        <div className="min-h-screen bg-fluid-gradient flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-[400px] space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary text-white mb-6">
                        <Ticket className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight">
                        Sistem Antrean
                    </h1>
                    <p className="text-primary/60 mt-2 text-sm font-bold uppercase tracking-wider">
                        Pilih event untuk mengambil nomor antrean
                    </p>
                </div>

                {/* Events List */}
                {events.length === 0 ? (
                    <div className="bg-white border-4 border-black hard-shadow-black p-8 text-center">
                        <QrCode className="w-12 h-12 text-primary/20 mx-auto mb-3" />
                        <p className="text-primary font-bold text-sm uppercase">Belum ada event antrean aktif saat ini.</p>
                        <p className="text-primary/50 text-xs mt-1 font-bold uppercase">Silakan hubungi staff Sebooth.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/queue/${event.id}`}
                                className="group block bg-white border-4 border-black hard-shadow-black p-5 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-primary font-black text-base uppercase tracking-wider group-hover:text-secondary transition-colors">
                                            {event.name}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-primary/50 text-xs font-bold uppercase">
                                                <Clock className="w-3.5 h-3.5" />
                                                ~{Math.round(event.avg_session_duration_sec / 60)} min/sesi
                                            </span>
                                            <span className="flex items-center gap-1 text-primary/50 text-xs font-bold uppercase">
                                                <Users className="w-3.5 h-3.5" />
                                                {event.booth_name}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-primary/30 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* How it works */}
                <div className="bg-white border-4 border-black hard-shadow-black p-5">
                    <p className="text-primary text-xs font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Cara Kerja</p>
                    <div className="space-y-3">
                        {[
                            { step: "01", text: "Pilih event di atas dan login/daftar akun" },
                            { step: "02", text: "Ambil nomor antrean digital otomatis" },
                            { step: "03", text: "Pantau posisi dan estimasi waktu secara live" },
                            { step: "04", text: "Scan QR di booth saat dipanggil" },
                            { step: "05", text: "Foto otomatis masuk ke akunmu" },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-3">
                                <span className="text-secondary font-black text-sm shrink-0">{item.step}</span>
                                <p className="text-primary/70 text-xs font-bold uppercase tracking-wider">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-primary/30 text-xs font-bold uppercase tracking-widest">
                    Powered by Sebooth Queue System
                </p>
            </div>
        </div>
    );
}
