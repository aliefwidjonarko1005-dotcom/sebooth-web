"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Globe, X, Check } from "lucide-react";
import type { FrameEvent } from "@/data/frameEvents";
import { photoDisplayUrl } from "@/data/frameEvents";
import { postAdmin } from "./admin/useFrameAdminData";

interface Media {
    id: string;
    url: string;
    hdUrl?: string;
    type: "strip" | "photo" | "gif" | "video";
}

interface Props {
    sessionId?: string;
    sessionTitle?: string;
    media?: Media;
}

const field =
    "w-full h-12 rounded-xl bg-[#eef2ff] px-4 text-[16px] text-[#002366] outline-none focus:ring-2 focus:ring-[#ff4500]";

/**
 * Row for the My Photos "Opsi Sesi" sheet, shown to super admins only: sends the photo on screen to
 * the Visual Archive and, if an event is picked, to that event's frame page as a real result.
 */
export function PublishToSiteOption({ sessionId, sessionTitle, media }: Props) {
    const [isSuper, setIsSuper] = useState(false);
    const [open, setOpen] = useState(false);
    const [events, setEvents] = useState<FrameEvent[]>([]);
    const [eventSlug, setEventSlug] = useState("");
    const [label, setLabel] = useState(sessionTitle ?? "");
    const [state, setState] = useState<"idle" | "saving" | "done">("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        fetch("/api/admin/me", { cache: "no-store" })
            .then((r) => r.json())
            .then((s) => alive && setIsSuper(Boolean(s.isSuper)))
            .catch(() => {});
        return () => {
            alive = false;
        };
    }, []);

    const source = media?.hdUrl || media?.url;
    if (!isSuper || !media || !source || media.type === "video" || media.type === "gif") return null;

    async function openSheet() {
        setOpen(true);
        setState("idle");
        setError("");
        try {
            const res = await fetch("/api/admin/frame-events", { cache: "no-store" });
            const body = await res.json();
            if (res.ok) {
                const list = body.events as FrameEvent[];
                setEvents(list);
                // Preselect the event whose name matches this session, if any
                const match = list.find((e) => sessionTitle && e.name.toLowerCase() === sessionTitle.toLowerCase());
                if (match) setEventSlug(match.slug);
            }
        } catch {
            // The archive still works without the event list
        }
    }

    async function publish() {
        setState("saving");
        setError("");
        try {
            await postAdmin("/api/admin/visual-archive", {
                action: "add",
                url: source,
                sessionId,
                mediaId: media?.id,
                event: label,
                eventSlug: eventSlug || undefined,
            });
            setState("done");
        } catch (e) {
            setError((e as Error).message);
            setState("idle");
        }
    }

    return (
        <>
            <button
                onClick={openSheet}
                className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#ff4500]" />
                    <span>Tampilkan di website (super admin)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {open && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Tampilkan di website">
                    <div className="w-full max-w-[440px] bg-[#f8f9fa] text-[#002366] rounded-t-[28px] sm:rounded-[28px] p-5 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-4 max-h-[92svh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bayon text-[26px] leading-none uppercase">Tampilkan di website</h3>
                            <button onClick={() => setOpen(false)} aria-label="Tutup" className="w-11 h-11 rounded-full bg-[#eef2ff] flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoDisplayUrl(source, 480)} alt="" className="w-full max-h-[34svh] object-contain rounded-2xl bg-[#eef2ff]" />

                        {state === "done" ? (
                            <div className="flex flex-col gap-3">
                                <p className="flex items-center gap-2 text-[16px] font-semibold">
                                    <Check className="w-5 h-5 text-[#ff4500]" /> Masuk ke Visual Archive.
                                </p>
                                {eventSlug && (
                                    <a href={`/frames/event/${eventSlug}`} className="h-12 rounded-full bg-[#eef2ff] font-semibold flex items-center justify-center">
                                        Lihat di halaman acara
                                    </a>
                                )}
                                <button onClick={() => setOpen(false)} className="h-12 rounded-full bg-[#002366] text-white font-semibold">
                                    Selesai
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-[15px] leading-relaxed">
                                    Foto ini masuk ke Visual Archive. Pilih acaranya supaya juga tampil di halaman frame acara itu sebagai hasil foto.
                                </p>
                                <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
                                    Acara di halaman frame
                                    <select className={field} value={eventSlug} onChange={(e) => setEventSlug(e.target.value)}>
                                        <option value="">Tidak ditautkan ke acara</option>
                                        {events.map((e) => (
                                            <option key={e.slug} value={e.slug}>
                                                {e.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
                                    Label di Visual Archive
                                    <input className={field} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nama acara" />
                                </label>
                                {error && <p role="alert" className="text-[14px] font-semibold text-[#c43500]">{error}</p>}
                                <button
                                    onClick={publish}
                                    disabled={state === "saving"}
                                    className="h-14 rounded-full bg-[#ff4500] text-[#00113a] text-[16px] font-bold disabled:opacity-60"
                                >
                                    {state === "saving" ? "Menyimpan" : "Tambahkan ke Visual Archive"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
