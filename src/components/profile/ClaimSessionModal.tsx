'use client'

import { useCallback, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useModalFocus } from '@/lib/useModalFocus'

interface ClaimSessionModalProps {
  claimInput: string
  setClaimInput: (value: string) => void
  setIsClaimModalOpen: (open: boolean) => void
  showQueueLink?: boolean
}

/** Bottom sheet to open a photobooth session by its ID. */
export function ClaimSessionModal({ claimInput, setClaimInput, setIsClaimModalOpen, showQueueLink = false }: ClaimSessionModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setIsClaimModalOpen(false), [setIsClaimModalOpen])
  useModalFocus(true, panelRef, close)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-blue-dark/80 md:p-6 animate-fade-in" onClick={close}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-session-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-primary p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white md:max-w-md md:rounded-2xl animate-modal-pop"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Tutup"
          className="absolute top-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-dark text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="claim-session-title" className="pr-12 font-bayon text-[2rem] leading-[1.05] uppercase">Klaim Foto</h2>
        <p className="mt-2 text-[17px] leading-snug">
          Scan QR di layar photobooth pakai kamera HP. Kalau tidak bisa, masukkan kode sesinya di sini.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (claimInput.trim()) {
              window.location.href = `/access/${encodeURIComponent(claimInput.trim())}`
            }
          }}
        >
          <label className="block text-[15px] leading-snug font-semibold">
            Kode sesi (Session ID)
            <input
              type="text"
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-1.5 min-h-14 w-full rounded-lg bg-white px-4 text-[17px] font-normal text-blue-dark outline-none focus:outline-2 focus:outline-offset-2 focus:outline-secondary"
            />
          </label>
          <button
            type="submit"
            className="min-h-14 w-full rounded-full bg-secondary text-[17px] font-bold text-blue-dark transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] cursor-pointer"
          >
            Klaim Foto Sekarang
          </button>
        </form>

        {showQueueLink && (
          <Link
            href="/queue"
            onClick={close}
            className="mt-3 flex min-h-11 items-center justify-center text-[15px] font-semibold underline underline-offset-4"
          >
            Lihat antrean yang buka
          </Link>
        )}
      </div>
    </div>
  )
}
