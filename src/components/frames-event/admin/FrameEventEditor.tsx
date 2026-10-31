"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Search, Trash2, X } from "lucide-react";
import type { FrameEvent } from "@/data/frameEvents";
import { frameImage, photoDisplayUrl } from "@/data/frameEvents";
import type { FrameItem } from "@/data/frames";
import { postAdmin, type ArchiveRow } from "./useFrameAdminData";

interface Props {
    /** null for a new event */
    event: FrameEvent | null;
    catalogue: FrameItem[];
    archive: ArchiveRow[];
    onClose: () => void;
    onSaved: () => void;
}

const field =
    "w-full h-12 rounded-xl bg-[#eef2ff] px-4 text-[16px] text-[#002366] placeholder:text-[#4d5f8c] outline-none focus:ring-2 focus:ring-[#ff4500]";

/** Full-screen sheet on phones: event details, the frames it uses, new uploads and its archive photos. */
export function FrameEventEditor({ event, catalogue, archive, onClose, onSaved }: Props) {
    const [name, setName] = useState(event?.name ?? "");
    const [date, setDate] = useState(event?.date ?? "");
    const [venue, setVenue] = useState(event?.venue ?? "");
    const [selected, setSelected] = useState<string[]>(event?.frameIds ?? []);
    const [designs, setDesigns] = useState<FrameItem[]>(catalogue);
    const [query, setQuery] = useState("");
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploadTitle, setUploadTitle] = useState("");

    const photos = archive.filter((a) => event && a.event_slug === event.slug);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const matches = designs.filter((f) => !q || `${f.title} ${f.category}`.toLowerCase().includes(q));
        // Chosen frames first, in the order they were picked
        return [...selected.map((id) => matches.find((f) => f.id === id)).filter((f): f is FrameItem => Boolean(f)),
            ...matches.filter((f) => !selected.includes(f.id))];
    }, [designs, query, selected]);

    function toggle(id: string) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    async function upload() {
        const file = fileRef.current?.files?.[0];
        if (!file) return setError("Pilih file gambar desain dulu.");
        if (!uploadTitle.trim()) return setError("Beri nama desain frame-nya.");
        setBusy("upload");
        setError("");
        try {
            const form = new FormData();
            form.set("file", file);
            form.set("title", uploadTitle);
            form.set("category", name || "EVENT");
            const res = await fetch("/api/admin/frame-designs", { method: "POST", body: form });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || "Gagal mengunggah.");
            const frame = body.frame as FrameItem;
            setDesigns((prev) => [frame, ...prev]);
            setSelected((prev) => [...prev, frame.id]);
            setUploadTitle("");
            if (fileRef.current) fileRef.current.value = "";
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(null);
        }
    }

    async function save() {
        setBusy("save");
        setError("");
        try {
            await postAdmin("/api/admin/frame-events", {
                action: "save",
                originalSlug: event?.slug,
                event: { slug: event?.slug, name, date, venue, frameIds: selected },
            });
            onSaved();
        } catch (e) {
            setError((e as Error).message);
            setBusy(null);
        }
    }

    async function remove() {
        if (!event || !window.confirm(`Hapus acara "${event.name}"? Halaman dan QR-nya tidak bisa dibuka lagi.`)) return;
        setBusy("delete");
        try {
            await postAdmin("/api/admin/frame-events", { action: "delete", slug: event.slug });
            onSaved();
        } catch (e) {
            setError((e as Error).message);
            setBusy(null);
        }
    }

    async function removePhoto(item: ArchiveRow) {
        setBusy(item.name);
        try {
            await postAdmin("/api/admin/visual-archive", { action: "remove", name: item.name });
            onSaved();
        } catch (e) {
            setError((e as Error).message);
            setBusy(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-[#f8f9fa] text-[#002366] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Edit acara">
            <div className="sticky top-0 z-10 bg-[#f8f9fa] flex items-center justify-between px-5 h-16">
                <h2 className="font-bayon text-[28px] leading-none uppercase">{event ? "Edit acara" : "Acara baru"}</h2>
                <button onClick={onClose} aria-label="Tutup" className="w-11 h-11 rounded-full bg-[#eef2ff] flex items-center justify-center">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="px-5 pb-40 max-w-3xl mx-auto flex flex-col gap-8">
                <section className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
                        Nama acara
                        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Wisuda FEB UNDIP 2026" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
                            Tanggal
                            <input className={field} value={date} onChange={(e) => setDate(e.target.value)} placeholder="Sabtu, 8 Nov" />
                        </label>
                        <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
                            Tempat
                            <input className={field} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Gedung Prof. Soedarto" />
                        </label>
                    </div>
                    {event && <p className="text-[14px] text-[#4d5f8c]">Alamat halaman: /frames/event/{event.slug}</p>}
                </section>

                <section className="flex flex-col gap-3">
                    <h3 className="font-bayon text-[24px] leading-none uppercase">Frame acara ini ({selected.length})</h3>
                    <p className="text-[15px] text-[#4d5f8c] -mt-1">Ketuk desain untuk memilih. Urutan pilihan jadi urutan di halaman tamu.</p>

                    <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
                        <p className="text-[15px] font-semibold">Unggah desain baru (slot foto masih kosong)</p>
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="text-[14px] file:mr-3 file:h-10 file:px-4 file:rounded-full file:border-0 file:bg-[#eef2ff] file:text-[#002366] file:font-semibold" />
                        <div className="flex gap-2">
                            <input className={field} value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Nama desain, mis. Navy Gold" />
                            <button
                                onClick={upload}
                                disabled={busy === "upload"}
                                className="shrink-0 h-12 px-5 rounded-full bg-[#002366] text-white font-semibold flex items-center gap-2 disabled:opacity-60"
                            >
                                <ImagePlus className="w-4 h-4" /> {busy === "upload" ? "Mengunggah" : "Unggah"}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5f8c]" />
                        <input className={`${field} pl-10`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari desain" aria-label="Cari desain" />
                    </div>

                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {visible.map((f) => {
                            const on = selected.includes(f.id);
                            return (
                                <li key={f.id}>
                                    <button onClick={() => toggle(f.id)} aria-pressed={on} className="w-full text-left flex flex-col gap-1.5">
                                        <span className={`relative block rounded-xl overflow-hidden ${on ? "ring-[3px] ring-[#ff4500]" : ""}`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={frameImage(f.image_url, "thumb")} alt="" loading="lazy" className="w-full aspect-[1200/943] object-cover bg-[#eef2ff]" />
                                            {on && (
                                                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#ff4500] text-white flex items-center justify-center">
                                                    <Check className="w-4 h-4" />
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-[13px] font-semibold leading-tight line-clamp-2">{f.title}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                {event && (
                    <section className="flex flex-col gap-3">
                        <h3 className="font-bayon text-[24px] leading-none uppercase">Hasil foto ({photos.length})</h3>
                        <p className="text-[15px] text-[#4d5f8c] -mt-1">
                            Foto dari sesi yang kamu klaim. Tambahkan lewat My Photos, menu Opsi Sesi, Tampilkan di website.
                        </p>
                        {photos.length > 0 && (
                            <ul className="grid grid-cols-3 gap-2">
                                {photos.map((p) => (
                                    <li key={p.name} className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={photoDisplayUrl(p.src, 320)} alt="" loading="lazy" className="w-full aspect-[3/4] object-cover rounded-xl bg-[#eef2ff]" />
                                        <button
                                            onClick={() => removePhoto(p)}
                                            disabled={busy === p.name}
                                            aria-label="Hapus foto dari Visual Archive"
                                            className="absolute top-1.5 right-1.5 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-[#f8f9fa] px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {error && <p role="alert" className="text-[14px] font-semibold text-[#c43500]">{error}</p>}
                    <div className="flex gap-2">
                        {event && (
                            <button onClick={remove} disabled={!!busy} aria-label="Hapus acara" className="w-14 h-14 shrink-0 rounded-full bg-[#eef2ff] flex items-center justify-center disabled:opacity-60">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={save}
                            disabled={!!busy}
                            className="flex-1 h-14 rounded-full bg-[#ff4500] text-[#00113a] text-[16px] font-bold disabled:opacity-60"
                        >
                            {busy === "save" ? "Menyimpan" : `Simpan acara (${selected.length} frame)`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
