import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchActiveQueueEvents } from "@/lib/queue/queueFetchers";
import { fetchUserActiveTickets } from "@/lib/queue/fetchUserActiveTickets";
import { getQueueUser } from "@/lib/queue/queueAuth";
import ActiveQueueCard from "@/components/queue/ActiveQueueCard";
import { FlowHero, FLOW_HEADING } from "@/components/ui/FlowHero";

export const metadata: Metadata = {
    title: { absolute: "Antrean Photobooth | Sebooth" },
    description: "Ambil nomor antrean photobooth Sebooth secara digital. Pantau posisi dan estimasi waktu tunggu secara real-time.",
};

export const dynamic = "force-dynamic";

const STEPS = [
    "Pilih event di atas, lalu masuk atau daftar akun.",
    "Ambil nomor antrean dari HP.",
    "Pantau posisi dan perkiraan waktunya di halaman tiket.",
    "Saat dipanggil, check-in dan scan QR di layar booth.",
    "Foto otomatis masuk ke akunmu.",
];

export default async function QueueLandingPage() {
    const [events, user] = await Promise.all([fetchActiveQueueEvents(), getQueueUser()]);
    const heldTickets = user ? await fetchUserActiveTickets(user.id) : [];

    return (
        <div className="min-h-svh bg-cream-soft">
            <FlowHero title="Antrean Photobooth">
                <p className="mt-3 text-xl leading-snug">
                    Ambil nomor dari HP, lalu tunggu di mana saja sampai giliranmu dekat.
                </p>
            </FlowHero>

            <main className="mx-auto max-w-xl px-5 py-10 text-[17px] leading-relaxed text-blue-dark">
                <ActiveQueueCard tickets={heldTickets} />

                <h2 className={FLOW_HEADING}>Pilih Event</h2>

                {events.length === 0 ? (
                    <div className="mt-4 rounded-lg bg-white p-5">
                        <p className="font-bold">Belum ada antrean yang dibuka.</p>
                        <p className="mt-1">Antrean dibuka saat acara berlangsung. Kalau kamu sedang di lokasi, tanya staff Sebooth di booth.</p>
                    </div>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {events.map((event) => (
                            <li key={event.id}>
                                <Link
                                    href={`/queue/${event.id}`}
                                    className="flex min-h-20 items-center justify-between gap-4 rounded-lg bg-white p-4 transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99]"
                                >
                                    <span className="min-w-0">
                                        <span className="block text-lg leading-snug font-bold text-primary">{event.name}</span>
                                        <span className="mt-0.5 block text-[15px] leading-snug text-slate-600">
                                            {event.booth_name} · ±{Math.round(event.avg_session_duration_sec / 60)} menit per sesi
                                        </span>
                                    </span>
                                    <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <h2 className={`${FLOW_HEADING} mt-12`}>Cara Kerjanya</h2>
                <ol className="mt-4 list-decimal space-y-2 pl-6 marker:font-bold marker:text-primary">
                    {STEPS.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </main>
        </div>
    );
}
