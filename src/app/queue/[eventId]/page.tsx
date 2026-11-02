import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchQueueEventById } from "@/lib/queue/queueFetchers";
import { fetchUserActiveTickets } from "@/lib/queue/fetchUserActiveTickets";
import { getQueueUser } from "@/lib/queue/queueAuth";
import QueueJoinForm from "@/components/queue/QueueJoinForm";
import QueueAuthGate from "@/components/queue/QueueAuthGate";

interface Props {
    params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { eventId } = await params;
    const event = await fetchQueueEventById(eventId);
    if (!event) return { title: { absolute: "Event Tidak Ditemukan | Sebooth" } };
    return {
        title: { absolute: `Antrean ${event.name} | Sebooth` },
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

    const user = await getQueueUser();

    // If not logged in, show auth gate (login/register choice)
    if (!user) {
        return <QueueAuthGate event={event} />;
    }

    // Someone already holding a number here goes back to it instead of being offered another
    const [heldTicket] = await fetchUserActiveTickets(user.id, eventId);
    if (heldTicket) {
        redirect(`/queue/${eventId}/ticket/${heldTicket.id}`);
    }

    // User is authenticated — pass user data to join form
    const userData = {
        id: user.id,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phoneNumber: user.user_metadata?.phone_number || '',
        email: user.email || '',
    };

    return <QueueJoinForm event={event} user={userData} />;
}
