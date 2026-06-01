import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQueueEventById, fetchQueueStatus } from "@/lib/queue/queueFetchers";
import QueueDisplayScreen from "@/components/queue/QueueDisplayScreen";

interface Props {
    params: Promise<{ eventId: string }>;
}

export const metadata: Metadata = {
    title: "Queue Display | Sebooth",
    description: "Layar antrean Sebooth untuk monitor venue.",
};

export const dynamic = "force-dynamic";

export default async function DisplayPage({ params }: Props) {
    const { eventId } = await params;
    const [event, initialStatus] = await Promise.all([
        fetchQueueEventById(eventId),
        fetchQueueStatus(eventId),
    ]);

    if (!event) notFound();

    return <QueueDisplayScreen eventId={eventId} initialStatus={{
        ...initialStatus,
        currentTicket: initialStatus.currentTicket ?? null,
    }} />;
}
