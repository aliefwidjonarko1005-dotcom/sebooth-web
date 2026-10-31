import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteContent } from "@/lib/serverSupabase";
import { resolveFrameEvent } from "@/data/frameEvents";
import { EventFramesClient } from "@/components/frames-event/EventFramesClient";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = resolveFrameEvent(await fetchSiteContent(), slug);
    const title = event ? `Frame ${event.name}` : "Frame acara";
    return {
        title: { absolute: `${title} | Sebooth` },
        description: event
            ? `${event.frames.length} desain frame photostrip Sebooth untuk ${event.name}.`
            : "Desain frame photostrip Sebooth untuk acara ini.",
        // Guests reach this page from the QR at the booth; it is not search content
        robots: { index: false, follow: false },
    };
}

export default async function EventFramesPage({ params }: Props) {
    const { slug } = await params;
    const event = resolveFrameEvent(await fetchSiteContent(), slug);
    if (!event) notFound();

    return <EventFramesClient event={event} />;
}
