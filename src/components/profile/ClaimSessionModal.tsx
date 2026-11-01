'use client'

import Link from 'next/link'
import { X, QrCode } from 'lucide-react'

interface ClaimSessionModalProps {
  claimInput: string
  setClaimInput: (value: string) => void
  setIsClaimModalOpen: (open: boolean) => void
  showQueueLink?: boolean
}

/** Bottom sheet to open a photobooth session by its ID. */
export function ClaimSessionModal({ claimInput, setClaimInput, setIsClaimModalOpen, showQueueLink = false }: ClaimSessionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-[420px] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col gap-4 text-slate-900 animate-modal-pop">

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Klaim Foto Photobooth
            </h3>
          </div>
          <button
            onClick={() => setIsClaimModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Scan QR code di layar kiosk photobooth atau masukkan Session ID di bawah ini untuk menambahkan foto ke galeri kamu:
        </p>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={claimInput}
            onChange={(e) => setClaimInput(e.target.value)}
            placeholder="Masukkan Session ID / UUID..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
          />
          <button
            onClick={() => {
              if (claimInput.trim()) {
                window.location.href = `/access/${claimInput.trim()}`
              }
            }}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Klaim Foto Sekarang
          </button>
        </div>

        {showQueueLink && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/queue"
              onClick={() => setIsClaimModalOpen(false)}
              className="text-xs text-orange-500 hover:text-orange-600 font-semibold"
            >
              Lihat Antrean Aktif (Queue) →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
