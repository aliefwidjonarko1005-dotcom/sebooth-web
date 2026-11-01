'use client'

import React from 'react'
import {
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  Film,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  X,
} from 'lucide-react'
import { checkSessionExpiry } from '@/lib/sessionExpiryPolicy'
import type { DetailedResult } from './types'
import { formatDateTime, cleanPhone } from './format'

interface InspectionResultProps {
  result: DetailedResult
  setResult: React.Dispatch<React.SetStateAction<DetailedResult | null>>
  copiedId: string | null
  handleCopy: (text: string, idKey: string) => void
}

/** The inspected session: claim status, the user who claimed it, queue ticket and media counts. */
export function InspectionResult({ result, setResult, copiedId, handleCopy }: InspectionResultProps) {
  return (
    <div id="session-inspector-result" className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden animate-fadeIn">
      {/* Result Status Banner */}
      <div
        className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          result.session.is_claimed
            ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200/80 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-3">
          {result.session.is_claimed ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  result.session.is_claimed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {result.session.is_claimed ? 'SUDAH DIKLAIM' : 'BELUM DIKLAIM'}
              </span>
              {!result.session.is_claimed && (() => {
                const expiry = checkSessionExpiry(result.session.created_at, result.session.is_claimed);
                if (!expiry.isSubjectToPolicy) {
                  return (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Bebas Batas Waktu (Sesi Sebelum Kebijakan)
                    </span>
                  );
                }
                return (
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    expiry.isExpired
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    <Clock className="w-3 h-3" /> {expiry.isExpired ? 'Kedaluwarsa (3 Hari)' : `Batas 3 Hari: ${expiry.timeString}`}
                  </span>
                );
              })()}
              <span className="text-xs text-black/60 font-mono">
                ID: {result.session.id}
              </span>
            </div>
            <h3 className="text-lg font-black mt-1 text-[#1A1A1A]">
              {result.session.is_claimed
                ? `Diklaim oleh: ${result.user?.full_name || result.user?.email || 'User Sebooth'}`
                : 'Sesi ini belum diklaim oleh user manapun'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(result.session.id, 'session_id')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] hover:bg-[#F9F9F9] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {copiedId === 'session_id' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Salin ID
              </>
            )}
          </button>

          <a
            href={`/access/${result.session.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#185340] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka QR Link
          </a>

          <button
            onClick={() => setResult(null)}
            className="p-2 rounded-xl bg-white/60 hover:bg-white text-gray-600 hover:text-black border border-black/5"
            title="Tutup Hasil Inspeksi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: User & Contact Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            Informasi Pengklaim (Customer)
          </h4>

          {result.session.is_claimed && result.user ? (
            <div className="p-5 rounded-2xl bg-[#F9F9F9] border border-[#1A1A1A]/10 space-y-4">
              {/* Total Sesi Terklaim Badge */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Klaim User Ini</span>
                    <p className="text-xs font-bold text-emerald-950">
                      {result.userTotalClaims ? `${result.userTotalClaims} Sesi telah diklaim` : '1 Sesi telah diklaim'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                  {result.userTotalClaims || 1} Sesi
                </span>
              </div>

              {/* Nama Lengkap */}
              <div>
                <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Nama Lengkap</span>
                <p className="text-base font-bold text-[#1A1A1A] mt-0.5">
                  {result.user.full_name || <span className="text-gray-400 italic">Tidak ada nama</span>}
                </p>
              </div>

              {/* Email */}
              <div>
                <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Email Akun</span>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                    {result.user.email || '-'}
                  </p>
                  {result.user.email && (
                    <button
                      onClick={() => handleCopy(result.user!.email!, 'email')}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      {copiedId === 'email' ? 'Tersalin' : 'Salin'}
                    </button>
                  )}
                </div>
              </div>

              {/* No WhatsApp / Phone */}
              <div>
                <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Nomor WhatsApp / Telepon</span>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                    {result.user.phone_number || <span className="text-gray-400 italic">Tidak terdaftar</span>}
                  </p>
                  {result.user.phone_number && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone(result.user.phone_number)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat WA
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* User ID */}
              <div className="pt-2 border-t border-[#1A1A1A]/5">
                <span className="text-[10px] font-semibold text-[#1A1A1A]/40 block">User UUID</span>
                <p className="font-mono text-[11px] text-[#1A1A1A]/70 break-all select-all">
                  {result.user.id}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#F9F9F9] border border-dashed border-[#1A1A1A]/20 text-center text-[#1A1A1A]/50">
              <User className="w-8 h-8 text-[#1A1A1A]/20 mx-auto mb-2" />
              <p className="text-xs font-medium">
                Belum ada data user. Sesi ini belum di-claim oleh siapapun.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Session & Queue Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Rincian Sesi & Antrean
          </h4>

          <div className="p-5 rounded-2xl bg-[#F9F9F9] border border-[#1A1A1A]/10 space-y-4">
            {/* Event Name */}
            <div>
              <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Nama Event / Acara</span>
              <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">
                {result.session.event_name || 'Sebooth Regular Session'}
              </p>
            </div>

            {/* Tanggal & Waktu */}
            <div>
              <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Waktu Sesi Dibuat</span>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">
                {formatDateTime(result.session.created_at)}
              </p>
            </div>

            {/* Antrean Linked Info */}
            {result.queueTicket && (
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1 mb-1">
                  <Ticket className="w-3 h-3" /> Terkait Tiket Antrean
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">
                    Nomor #{result.queueTicket.queue_number}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-200/70 text-blue-800">
                    {result.queueTicket.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-blue-900/80 mt-1">
                  Nama Antrean: {result.queueTicket.display_name}
                  {result.queueTicket.phone_number ? ` (${result.queueTicket.phone_number})` : ''}
                </p>
              </div>
            )}

            {/* Media Summary Count */}
            <div className="pt-2 border-t border-[#1A1A1A]/5">
              <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block mb-2 flex items-center gap-1">
                <Film className="w-3 h-3 text-primary" />
                Total File Media Terkumpul
              </span>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] shadow-2xs">
                  📸 {result.mediaSummary.photos} Foto Raw
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] shadow-2xs">
                  🎞️ {result.mediaSummary.gifs} Animated GIF
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] shadow-2xs">
                  🎥 {result.mediaSummary.lives} Live Video
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-extrabold text-primary">
                  Total: {result.mediaSummary.total} Media
                </span>
              </div>
              <p className="text-[10px] text-[#1A1A1A]/40 mt-2 italic">
                *Gambar resolusi tinggi tidak dimuat untuk menghemat kuota data & hosting Vercel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
