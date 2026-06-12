import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchQueueEventById } from "@/lib/queue/queueFetchers";
import QueueJoinForm from "@/components/queue/QueueJoinForm";
import QueueAuthGate from "@/components/queue/QueueAuthGate";

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

async function getAuthUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export default async function QueueEventPage({ params }: Props) {
    const { eventId } = await params;
    const event = await fetchQueueEventById(eventId);

    if (!event || !event.is_active) {
        notFound();
    }

    const user = await getAuthUser();

    // If not logged in, show auth gate (login/register choice)
    if (!user) {
        return <QueueAuthGate event={event} />;
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
