import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQueueTicketById, fetchQueueStatus } from "@/lib/queue/queueFetchers";
import QueueTicketDisplay from "@/components/queue/QueueTicketDisplay";

interface Props {
    params: Promise<{ eventId: string; ticketId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { ticketId } = await params;
    const ticket = await fetchQueueTicketById(ticketId);
    if (!ticket) return { title: "Tiket Tidak Ditemukan | Sebooth" };
    return {
        title: `Antrean #${String(ticket.queue_number).padStart(3, "0")} — ${ticket.display_name} | Sebooth`,
        description: `Pantau posisi antrean Sebooth kamu secara real-time. Nomor ${ticket.queue_number} atas nama ${ticket.display_name}.`,
    };
}

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: Props) {
    const { eventId, ticketId } = await params;
    const [ticket, initialStatus] = await Promise.all([
        fetchQueueTicketById(ticketId),
        fetchQueueStatus(eventId),
    ]);

    if (!ticket) {
        notFound();
    }

    return (
        <QueueTicketDisplay
            ticket={ticket}
            initialStatus={{
                ...initialStatus,
                currentTicket: initialStatus.currentTicket ?? null,
            }}
            eventId={eventId}
        />
    );
}
