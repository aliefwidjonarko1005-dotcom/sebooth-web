import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { fetchQueueTicketById, fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { getQueueUser } from "@/lib/queue/queueAuth";
import QueueTicketDisplay from "@/components/queue/QueueTicketDisplay";

interface Props {
    params: Promise<{ eventId: string; ticketId: string }>;
}

// A ticket leads to its owner's photos, so only its owner gets to see it
const loadOwnTicket = cache(async (ticketId: string) => {
    const user = await getQueueUser();
    if (!user) return { user, ticket: null };
    const ticket = await fetchQueueTicketById(ticketId);
    return { user, ticket: ticket?.user_id === user.id ? ticket : null };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { ticketId } = await params;
    const { ticket } = await loadOwnTicket(ticketId);
    const robots = { index: false, follow: false };
    if (!ticket) return { title: { absolute: "Tiket Antrean | Sebooth" }, robots };
    return {
        title: { absolute: `Antrean #${String(ticket.queue_number).padStart(3, "0")} — ${ticket.display_name} | Sebooth` },
        description: `Pantau posisi antrean Sebooth kamu secara real-time. Nomor ${ticket.queue_number} atas nama ${ticket.display_name}.`,
        robots,
    };
}

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: Props) {
    const { eventId, ticketId } = await params;
    const { user, ticket } = await loadOwnTicket(ticketId);

    if (!user) {
        redirect(`/login?redirect=${encodeURIComponent(`/queue/${eventId}/ticket/${ticketId}`)}`);
    }
    if (!ticket) {
        notFound();
    }

    const initialStatus = await fetchQueueStatus(ticket.event_id);

    return <QueueTicketDisplay ticket={ticket} initialStatus={initialStatus} eventId={ticket.event_id} />;
}
