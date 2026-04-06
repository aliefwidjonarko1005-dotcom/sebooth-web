import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { fetchNewsById } from "@/lib/serverSupabase";

export const revalidate = 60;

interface NewsDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const news = await fetchNewsById(id);

    if (!news) {
        return {
            title: "Berita Tidak Ditemukan | Sebooth",
            description: "Berita yang Anda cari tidak ditemukan.",
        };
    }

    return {
        title: `${news.title} | Sebooth News`,
        description: news.body?.substring(0, 160) || "Baca berita terbaru dari Sebooth.",
        openGraph: {
            title: news.title,
            description: news.body?.substring(0, 160),
            type: "article",
            ...(news.image_url ? { images: [{ url: news.image_url }] } : {}),
        },
    };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
    const { id } = await params;
    const news = await fetchNewsById(id);

    if (!news) {
        notFound();
    }

    const formattedDate = new Date(news.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image */}
            {news.image_url && (
                <div className="relative w-full h-[50vh] md:h-[60vh] bg-primary overflow-hidden">
                    <Image
                        src={news.image_url}
                        alt={news.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
                        <div className="max-w-4xl mx-auto">
                            <time className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4 block">
                                {formattedDate}
                            </time>
                            <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                {news.title}
                            </h1>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <article className="max-w-4xl mx-auto px-6 md:px-16 py-12 md:py-20">
                {/* If no hero image, show title here */}
                {!news.image_url && (
                    <div className="mb-12 border-l-[12px] border-secondary pl-6">
                        <time className="text-primary/50 text-sm font-bold uppercase tracking-widest mb-4 block">
                            {formattedDate}
                        </time>
                        <h1 className="text-3xl md:text-6xl font-black text-text-dark uppercase tracking-tighter leading-[0.9]">
                            {news.title}
                        </h1>
                    </div>
                )}

                {/* Body */}
                <div className="prose prose-lg max-w-none">
                    {news.body.split("\n").map((paragraph: string, idx: number) => (
                        <p key={idx} className="text-lg font-medium text-text-dark/80 leading-relaxed mb-6 uppercase">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Back Link */}
                <div className="mt-16 pt-8 border-t-4 border-black">
                    <Link
                        href="/#news"
                        className="inline-flex items-center gap-3 bg-primary text-white font-black uppercase px-8 py-4 border-2 border-black hard-shadow-black hover:-translate-y-1 hover:-translate-x-1 active:translate-0 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </article>
        </div>
    );
}
