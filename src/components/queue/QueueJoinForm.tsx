"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";
import type { QueueEvent } from "@/types/database";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import Guide from "@/components/guide/Guide";
import GuideLauncher from "@/components/guide/GuideLauncher";
import { useGuide } from "@/components/guide/useGuide";
import { QUEUE_JOIN_GUIDE, GUIDE_KEYS } from "@/config/guides";
import { QueueEventLine } from "./QueueEventLine";
import { FlowHero, FLOW_BUTTON_ORANGE } from "@/components/ui/FlowHero";

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
    const guide = useGuide(GUIDE_KEYS.queueJoin);

    const accountRows = [
        { label: "Nama", value: user.fullName },
        { label: "WhatsApp", value: user.phoneNumber },
        { label: "Email", value: user.email },
    ].filter((row) => row.value);

    async function handleSubmit() {
        setError("");

        startTransition(async () => {
            try {
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
            } catch {
                setError("Koneksi terputus. Silakan coba lagi.");
            }
        });
    }

    return (
        <div className="flex min-h-svh flex-col bg-cream-soft">
            <FlowHero title="Ambil Antrean" action={<GuideLauncher onClick={guide.start} />}>
                <QueueEventLine name={event.name} booth={event.booth_name} />
            </FlowHero>

            <main className="mx-auto w-full max-w-xl px-5 py-8 text-[17px] leading-relaxed text-blue-dark">
                <p className="text-xl leading-snug font-bold text-primary">Halo, {user.fullName}</p>
                <p className="mt-1">Data akunmu ini yang dipakai operator untuk memanggilmu.</p>

                <dl id="guide-join-account" className="mt-5 space-y-3 rounded-lg bg-white p-4">
                    {accountRows.map((row) => (
                        <div key={row.label}>
                            <dt className="text-[15px] leading-snug text-slate-600">{row.label}</dt>
                            <dd className="leading-snug font-semibold break-words">{row.value}</dd>
                        </div>
                    ))}
                </dl>

                {error && (
                    <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 font-medium text-red-700">
                        {error}
                    </p>
                )}

                <button
                    id="guide-join-submit"
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className={`mt-5 ${FLOW_BUTTON_ORANGE}`}
                >
                    {isPending ? (
                        <>
                            <SeboothLoader variant="mini" className="h-5 w-5" /> Memproses
                        </>
                    ) : (
                        <>
                            <Ticket className="h-5 w-5" aria-hidden="true" /> Ambil Nomor
                        </>
                    )}
                </button>

                <p className="mt-4 text-[15px] leading-snug text-slate-600">
                    Nomor antrean tidak bisa dipindahtangankan. Hadir saat dipanggil ya!
                </p>
            </main>

            <Guide steps={QUEUE_JOIN_GUIDE} open={guide.open} onClose={guide.close} storageKey={GUIDE_KEYS.queueJoin} />
        </div>
    );
}
