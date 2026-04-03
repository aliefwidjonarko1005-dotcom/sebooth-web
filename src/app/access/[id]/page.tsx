import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSessionById } from "@/lib/serverSupabase";
import AccessSessionClient from "@/components/features/AccessSessionClient";

interface AccessPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate dynamic SEO metadata based on session data.
 */
export async function generateMetadata({ params }: AccessPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await fetchSessionById(id);

  if (!session) {
    return {
      title: "Session Not Found | Sebooth",
      description: "Sesi foto tidak ditemukan atau link sudah kedaluwarsa.",
    };
  }

  return {
    title: `${session.event_name || "Sebooth Session"} — Foto Kamu Siap! | Sebooth`,
    description: `Lihat dan klaim ${session.media?.length || 0} foto dari sesi di ${session.event_name || "Sebooth Studio"}. Simpan kenangan indahmu selamanya!`,
    openGraph: {
      title: `${session.event_name || "Sebooth Session"} — Foto Kamu Siap!`,
      description: `${session.media?.length || 0} foto menunggumu dari ${session.event_name || "Sebooth Studio"}.`,
      type: "website",
    },
  };
}

export default async function AccessSessionPage({ params }: AccessPageProps) {
  const { id } = await params;
  const session = await fetchSessionById(id);

  if (!session) {
    notFound();
  }

  return <AccessSessionClient session={session} sessionId={id} />;
}
