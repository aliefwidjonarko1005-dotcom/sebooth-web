import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQueueEventById } from "@/lib/queue/queueFetchers";
import QueueJoinForm from "@/components/queue/QueueJoinForm";

interface Props {
    params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { eventId } = await params;
    const event = await fetchQueueEventById(eventId);
    if (!event) return { title: "Event Tidak Ditemukan | Sebooth" };
    return {
        title: `Antrean ${event.name} | Sebooth`,
        description: `Ambil nomor antrean untuk ${event.name} di ${event.booth_name}. Pantau posisi secara real-time.`,
    };
}

export const dynamic = "force-dynamic";

export default async function QueueEventPage({ params }: Props) {
    const { eventId } = await params;
    const event = await fetchQueueEventById(eventId);

    if (!event || !event.is_active) {
        notFound();
    }

    return <QueueJoinForm event={event} />;
}
