'use client'

import React from 'react'
import { X, Download, Share2, ArrowRight, Package } from 'lucide-react'
import { PublishToSiteOption } from '@/components/frames-event/PublishToSiteOption'
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
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-[420px] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col gap-3 text-slate-900 animate-modal-pop">

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Opsi Sesi ({currentSession?.title})
          </h3>
          <button
            id="tour-profile-options-close"
            onClick={() => setIsOptionsModalOpen(false)}
            aria-label="Tutup menu"
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>


        <button
          onClick={handleDownload}
          className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Foto Ini (HD)</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => {
            handleDownloadBundle()
            setIsOptionsModalOpen(false)
          }}
          className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-orange-500" />
            <span>Simpan Semua File ke Galeri HP ({activeSessionMediaList.length} File)</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={handleShare}
          className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4 text-sky-500" />
            <span>Bagikan Link Galeri</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Super admins only: send this photo to the Visual Archive / an event frame page */}
        <PublishToSiteOption
          sessionId={currentSession?.id}
          sessionTitle={currentSession?.title}
          media={activeSessionMediaList[currentMediaIndex]}
        />
      </div>
    </div>
  )
}
