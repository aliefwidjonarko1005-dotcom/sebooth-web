'use client'

import React from 'react'
import { X } from 'lucide-react'
import ProgressiveImage from '@/components/ui/ProgressiveImage'
import { UserSessionDisplayItem, getBlurPlaceholderUrl } from './profileMedia'

interface BookshelfViewProps {
  sessionsList: UserSessionDisplayItem[]
  activeSessionIndex: number
  cardRectsRef: React.MutableRefObject<Record<number, { x: number; y: number }>>
  handleCardClick: (e: React.MouseEvent<HTMLDivElement>, targetIdx: number) => void
  handleCloseBookshelf: () => void
}

/** Gallery View: every session as a stacked album card in a 2–4 column grid. */
export function BookshelfView({ sessionsList, activeSessionIndex, cardRectsRef, handleCardClick, handleCloseBookshelf }: BookshelfViewProps) {
  return (
    <div className="w-full max-w-md sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-28 sm:pb-32 flex flex-col flex-1">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-[28px] md:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          Galeri Sebooth
        </h1>

        <div className="flex items-center gap-2">
          {/* Close / Return to Focus View */}
          <button
            onClick={handleCloseBookshelf}
            className="w-9 h-9 rounded-xl bg-slate-200/70 hover:bg-slate-300/80 active:scale-90 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            title="Kembali ke Tampilan Fokus"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Bookshelf Grid: 2 columns on mobile, 3 on tablet, 4 columns on desktop */}
      <div id="tour-profile-bookshelf-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-8 md:gap-x-7 md:gap-y-9 lg:gap-x-8 lg:gap-y-10">
        {sessionsList.map((session, sIdx) => {
          const originalIndex = sessionsList.findIndex(s => s.id === session.id)
          const targetIndex = originalIndex >= 0 ? originalIndex : sIdx

          return (
            <div
              key={session.id}
              id={`bookshelf-card-${targetIndex}`}
              ref={(el) => {
                if (el) {
                  const rect = el.getBoundingClientRect()
                  cardRectsRef.current[targetIndex] = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                  }
                }
              }}
              onClick={(e) => handleCardClick(e, targetIndex)}
              style={{
                contentVisibility: 'auto',
                containIntrinsicSize: '0 240px'
              }}
              className="group flex flex-col cursor-pointer select-none active:scale-[0.94] active:brightness-95 transition-all duration-150 ease-out"
            >
              {/* 3D Stacked Album Card (Gambar 1) */}
              <div className="relative w-full aspect-[3/4] flex items-center justify-center p-1.5">
                {/* Back Left Card: Stylized photo backing layer (Zero duplicate image requests) */}
                <div
                  className="absolute inset-1.5 rounded-[15px] sm:rounded-[17px] bg-gradient-to-tr from-stone-300 via-stone-200 to-stone-100 border border-white/90 shadow-sm will-change-transform transition-transform duration-200 group-hover:-translate-x-2"
                  style={{
                    transform: 'translate3d(-8px, -5px, 0) rotate(-7.5deg) scale(0.92)',
                    transformOrigin: 'center center'
                  }}
                />

                {/* Back Right Card: Stylized photo backing layer (Zero duplicate image requests) */}
                <div
                  className="absolute inset-1.5 rounded-[15px] sm:rounded-[17px] bg-gradient-to-tl from-stone-300 via-stone-200 to-stone-100 border border-white/90 shadow-sm will-change-transform transition-transform duration-200 group-hover:translate-x-2"
                  style={{
                    transform: 'translate3d(8px, -5px, 0) rotate(7.5deg) scale(0.92)',
                    transformOrigin: 'center center'
                  }}
                />

                {/* Front Center Card */}
                <div
                  className="relative w-full h-full rounded-[16px] sm:rounded-[18px] overflow-hidden border-[2.2px] border-white shadow-[0_12px_24px_-6px_rgba(0,0,0,0.18),0_4px_8px_-2px_rgba(0,0,0,0.08)] bg-zinc-950 will-change-transform group-hover:scale-[1.02] transition-transform duration-200"
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                    transformOrigin: 'center center'
                  }}
                >
                  <ProgressiveImage
                    src={session.stripUrl}
                    placeholder={getBlurPlaceholderUrl(session.rawStripUrl)}
                    fallbackSrc={session.rawStripUrl}
                    alt={session.title}
                    className="w-full h-full object-cover object-top select-none pointer-events-none"
                    loading={Math.abs(targetIndex - activeSessionIndex) < 8 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
