import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSessionById } from "@/lib/serverSupabase";
import ExperienceGaugeReview from "@/components/features/ExperienceGaugeReview";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await fetchSessionById(id);

  if (!session) {
    return {
      title: "Session Not Found | Sebooth",
      description: "Sesi foto tidak ditemukan atau link sudah kedaluwarsa.",
    };
  }

  return {
    title: `Ulasan Pengalaman · ${session.event_name || "Sebooth Photobooth"}`,
    description: `Berikan ulasan dan rating pengalaman photobooth kamu di ${session.event_name || "Sebooth"}.`,
  };
}

export default async function SessionReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  const session = await fetchSessionById(id);

  if (!session) {
    notFound();
  }

  return <ExperienceGaugeReview sessionId={id} eventName={session.event_name} />;
}
