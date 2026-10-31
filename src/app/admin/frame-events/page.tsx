"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, QrCode, ExternalLink } from "lucide-react";
import type { FrameEvent } from "@/data/frameEvents";
import { frameImage } from "@/data/frameEvents";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { FrameEventEditor } from "@/components/frames-event/admin/FrameEventEditor";
import { useFrameAdminData } from "@/components/frames-event/admin/useFrameAdminData";

/** Super-admin list of frame events: which designs each event shows guests, plus its QR card. */
export default function FrameEventsAdminPage() {
    const { state, reload } = useFrameAdminData();
    const [editing, setEditing] = useState<FrameEvent | "new" | null>(null);

    if (state.status === "loading") return <SeboothLoader label="Memuat acara" />;

    if (state.status !== "ready") {
        const message =
            state.status === "signed-out"
                ? "Masuk dengan akun super admin untuk mengelola frame acara."
                : state.status === "forbidden"
                  ? "Halaman ini khusus super admin."
                  : state.message;
        return (
            <main className="min-h-svh bg-[#f8f9fa] text-[#002366] px-5 py-16 flex flex-col items-start gap-6 max-w-xl mx-auto">
                <h1 className="font-bayon text-[44px] leading-none uppercase">Frame acara</h1>
                <p className="text-[17px]">{message}</p>
                {state.status === "signed-out" && (
                    <Link href="/login?redirect=/admin/frame-events" className="h-12 px-6 rounded-full bg-[#ff4500] text-blue-dark font-bold inline-flex items-center">
                        Masuk
                    </Link>
                )}
            </main>
        );
    }

    const { events, catalogue, archive } = state.data;
    const byId = new Map(catalogue.map((f) => [f.id, f]));

    return (
        <main className="min-h-svh bg-[#f8f9fa] text-[#002366] pb-28">
            <div className="max-w-3xl mx-auto px-5">
                <div className="h-16 flex items-center">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[15px] font-semibold py-3">
                        <ArrowLeft className="w-4 h-4" /> Admin
                    </Link>
                </div>
                <h1 className="font-bayon text-[44px] leading-none uppercase">Frame acara</h1>
                <p className="text-[17px] leading-relaxed mt-2 mb-8">
                    Atur desain frame tiap acara. Tamu membuka halamannya lewat kartu QR di meja booth.
                </p>

                <ul className="flex flex-col gap-3">
                    {events.map((e) => {
                        const cover = byId.get(e.frameIds[0]);
                        const photoCount = archive.filter((a) => a.event_slug === e.slug).length;
                        return (
                            <li key={e.slug} className="rounded-2xl bg-white p-3 flex gap-3 items-center">
                                <button onClick={() => setEditing(e)} className="flex flex-1 min-w-0 gap-3 items-center text-left">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cover ? frameImage(cover.image_url, "thumb") : "/images/logo/sebooth-navy.svg"}
                                        alt=""
                                        className="w-20 h-16 shrink-0 rounded-xl object-cover bg-[#eef2ff]"
                                    />
                                    <span className="min-w-0">
                                        <strong className="block text-[16px] leading-tight">{e.name}</strong>
                                        <span className="block text-[14px] text-[#4d5f8c] mt-1">
                                            {e.frameIds.length} frame{photoCount > 0 ? ` · ${photoCount} foto` : ""}
                                            {e.date ? ` · ${e.date}` : ""}
                                        </span>
                                    </span>
                                </button>
                                <Link href={`/frames/event/${e.slug}`} aria-label={`Buka halaman ${e.name}`} className="w-11 h-11 shrink-0 rounded-full bg-[#eef2ff] flex items-center justify-center">
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                                <Link href={`/frames/event/${e.slug}/qr`} aria-label={`Kartu QR ${e.name}`} className="w-11 h-11 shrink-0 rounded-full bg-[#eef2ff] flex items-center justify-center">
                                    <QrCode className="w-4 h-4" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="fixed bottom-0 inset-x-0 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] bg-[#f8f9fa]">
                <button
                    onClick={() => setEditing("new")}
                    className="w-full max-w-3xl mx-auto h-14 rounded-full bg-[#ff4500] text-blue-dark text-[16px] font-bold flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Acara baru
                </button>
            </div>

            {editing && (
                <FrameEventEditor
                    event={editing === "new" ? null : editing}
                    catalogue={catalogue}
                    archive={archive}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        reload();
                    }}
                />
            )}
        </main>
    );
}
