"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const WA_NUMBER = "6285713899441";

export interface BookingTicketPackage {
  name: string;
  durationOrQuota: string;
  category: "all-you-can" | "batch-booking";
}

interface BookingTicketProps {
  pkg: BookingTicketPackage | null;
  onClose: () => void;
}

const formatDate = (value: string) =>
  value
    ? new Date(`${value}T00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

/**
 * Booking printed as a ticket: what the visitor types appears on the ticket and becomes
 * a pre-filled WhatsApp message. Main part + stub, joined by a notched perforation.
 */
export function BookingTicket({ pkg, onClose }: BookingTicketProps) {
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pkg) firstFieldRef.current?.focus();
  }, [pkg]);

  if (!pkg || typeof document === "undefined") return null;

  const isBatch = pkg.category === "batch-booking";
  const lines = [
    "Halo Sebooth, saya mau booking photobooth.",
    eventName.trim() && `Acara: ${eventName.trim()}`,
    date && `Tanggal: ${formatDate(date)}`,
    venue.trim() && `Lokasi: ${venue.trim()}`,
    `Paket: ${isBatch ? "Batch Booking" : "All You Can Photo"}, ${pkg.name}`,
  ].filter(Boolean);
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;

  const fieldClass =
    "w-full bg-white/10 border-0 border-b-2 border-white/50 rounded-none px-1 py-2.5 text-[17px] font-medium text-white placeholder:text-white/45 focus:outline-none focus:border-[#FF4500]";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#00113a]/80 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        // Keep arrow/space keys from moving the slide deck behind the ticket
        e.stopPropagation();
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-ticket-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => e.preventDefault()}
        className="booking-ticket relative w-full max-w-[1000px] max-h-[92svh] overflow-y-auto overflow-x-hidden grid grid-cols-1 md:grid-cols-[7fr_3fr] bg-[#002366] text-white"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup tiket"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center text-white/80 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col justify-between gap-6 p-6 pr-14 md:p-10">
          <h2
            id="booking-ticket-title"
            className="text-[clamp(28px,3.4vw,52px)] font-medium leading-[0.95] tracking-[-0.04em]"
          >
            Sebooth untuk <span className="text-[#FF4500]">{eventName.trim() || "acaramu"}</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6">
            <label className="grid gap-1.5 text-sm text-white/85">
              Nama acara
              <input
                ref={firstFieldRef}
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Wisuda Teknik Sipil"
                maxLength={40}
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm text-white/85">
              Tanggal
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${fieldClass} [color-scheme:dark]`} />
            </label>
            <label className="grid gap-1.5 text-sm text-white/85 sm:col-span-2">
              Kota / venue
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Muladi Dome, Tembalang"
                maxLength={60}
                className={fieldClass}
              />
            </label>
          </div>
        </div>

        {/* Perforation: notches + dotted line between main part and stub */}
        <span aria-hidden="true" className="ticket-perf" />

        <div className="flex flex-col justify-between gap-5 p-6 text-center md:px-6 md:pb-6 md:pt-10">
          <p className="text-[clamp(40px,5vw,84px)] font-medium leading-[0.9] tracking-[-0.05em]">
            {pkg.name.replace(/^Unlimited /, "")}
            <small className="mt-2.5 block text-sm font-normal tracking-normal text-white/85">
              {pkg.durationOrQuota}
            </small>
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 w-full items-center justify-center rounded-[4px] bg-[#FF4500] px-4 text-base font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#e63e00] active:translate-y-0.5 active:scale-[0.98]"
          >
            Kirim ke WhatsApp
          </a>
          <p className="text-xs leading-snug text-white/70">
            Harga menyesuaikan tanggal, durasi, dan lokasi.
          </p>
        </div>
      </form>
    </div>,
    document.body
  );
}
