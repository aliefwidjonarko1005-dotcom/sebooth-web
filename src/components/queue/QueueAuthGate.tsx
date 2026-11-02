import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import type { QueueEvent } from "@/types/database";
import { QueueEventLine } from "./QueueEventLine";
import { FlowHero, FLOW_BUTTON_NAVY, FLOW_BUTTON_ORANGE } from "@/components/ui/FlowHero";

interface QueueAuthGateProps {
    event: QueueEvent;
}

export default function QueueAuthGate({ event }: QueueAuthGateProps) {
    const redirect = encodeURIComponent(`/queue/${event.id}`);

    return (
        <div className="flex min-h-svh flex-col bg-cream-soft">
            <FlowHero title="Ambil Antrean">
                <QueueEventLine name={event.name} booth={event.booth_name} />
            </FlowHero>

            <main className="mx-auto w-full max-w-xl px-5 py-8 text-[17px] leading-relaxed text-blue-dark">
                <p>Kamu perlu akun Sebooth untuk ambil nomor. Foto dari sesimu nanti otomatis tersimpan di akun itu.</p>

                <div className="mt-6 space-y-3">
                    <Link href={`/login?redirect=${redirect}`} className={FLOW_BUTTON_ORANGE}>
                        <LogIn className="h-5 w-5" aria-hidden="true" />
                        Sudah punya akun? Masuk
                    </Link>
                    <Link href={`/register?redirect=${redirect}`} className={FLOW_BUTTON_NAVY}>
                        <UserPlus className="h-5 w-5" aria-hidden="true" />
                        Belum punya akun? Daftar
                    </Link>
                </div>
            </main>
        </div>
    );
}
