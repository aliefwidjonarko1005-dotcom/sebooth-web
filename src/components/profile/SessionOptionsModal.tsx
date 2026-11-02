'use client'

import React, { useCallback, useRef } from 'react'
import { X, Download, Share2, Package } from 'lucide-react'
import { PublishToSiteOption } from '@/components/frames-event/PublishToSiteOption'
import { useModalFocus } from '@/lib/useModalFocus'
import { SessionMediaItem, UserSessionDisplayItem } from './profileMedia'

interface SessionOptionsModalProps {
  currentSession?: UserSessionDisplayItem
  activeSessionMediaList: SessionMediaItem[]
  currentMediaIndex: number
  setIsOptionsModalOpen: (open: boolean) => void
  handleDownload: (e?: React.MouseEvent | React.TouchEvent) => void
  handleDownloadBundle: (e?: React.MouseEvent | React.TouchEvent) => void
  handleShare: () => void
}

const OPTION_ROW =
  'flex min-h-14 w-full items-center gap-3 rounded-lg bg-blue-dark px-4 py-3 text-left text-[17px] leading-snug font-semibold text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.99] cursor-pointer'
const OPTION_ICON = 'w-5 h-5 shrink-0 text-secondary'

/** The ••• menu of one session: download this photo, save all, share, publish (super admins). */
export function SessionOptionsModal({
  currentSession,
  activeSessionMediaList,
  currentMediaIndex,
  setIsOptionsModalOpen,
  handleDownload,
  handleDownloadBundle,
  handleShare
}: SessionOptionsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setIsOptionsModalOpen(false), [setIsOptionsModalOpen])
  useModalFocus(true, panelRef, close)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-blue-dark/80 md:p-6 animate-fade-in" onClick={close}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-options-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-primary p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white md:max-w-md md:rounded-2xl animate-modal-pop"
      >
        <button
          id="tour-profile-options-close"
          type="button"
          onClick={close}
          aria-label="Tutup menu"
          className="absolute top-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-dark text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="session-options-title" className="pr-12 font-bayon text-[2rem] leading-[1.05] uppercase">Opsi Sesi</h2>
        <p className="mt-1 truncate pr-12 text-[15px] leading-snug text-white/85">{currentSession?.title}</p>

        <div className="mt-4 space-y-2">
          <button type="button" onClick={handleDownload} className={OPTION_ROW}>
            <Download className={OPTION_ICON} aria-hidden="true" />
            Download foto ini (HD)
          </button>

          <button
            type="button"
            onClick={() => {
              handleDownloadBundle()
              setIsOptionsModalOpen(false)
            }}
            className={OPTION_ROW}
          >
            <Package className={OPTION_ICON} aria-hidden="true" />
            Simpan semua ke galeri HP ({activeSessionMediaList.length} file)
          </button>

          <button type="button" onClick={handleShare} className={OPTION_ROW}>
            <Share2 className={OPTION_ICON} aria-hidden="true" />
            Bagikan link galeri
          </button>

          {/* Super admins only: send this photo to the Visual Archive / an event frame page */}
          <PublishToSiteOption
            sessionId={currentSession?.id}
            sessionTitle={currentSession?.title}
            media={activeSessionMediaList[currentMediaIndex]}
            rowClassName={OPTION_ROW}
            iconClassName={OPTION_ICON}
          />
        </div>
      </div>
    </div>
  )
}
