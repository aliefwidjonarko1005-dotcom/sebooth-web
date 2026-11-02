'use client'

import React from 'react'
import { X } from 'lucide-react'
import ProgressiveImage from '@/components/ui/ProgressiveImage'
import { UserSessionDisplayItem, getBlurPlaceholderUrl } from './profileMedia'

interface BookshelfViewProps {
  sessionsList: UserSessionDisplayItem[]
  activeSessionIndex: number
  cardRectsRef: React.MutableRefObject<Record<number, { x: number; y: number }>>
  handleCardClick: (e: React.MouseEvent<HTMLElement>, targetIdx: number) => void
  handleCloseBookshelf: () => void
}

const BACK_CARD = 'absolute inset-1.5 rounded-xl bg-slate-300 transition-transform duration-200'

/** Gallery View: every session as a stacked album card in a 2–4 column grid. */
export function BookshelfView({ sessionsList, activeSessionIndex, cardRectsRef, handleCardClick, handleCloseBookshelf }: BookshelfViewProps) {
  return (
    <div className="w-full max-w-md sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-28 sm:pb-32 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="font-bayon text-[2rem] leading-none text-primary uppercase md:text-[2.5rem]">
          Galeri Sebooth
        </h1>

        {/* Close / Return to Focus View */}
        <button
          onClick={handleCloseBookshelf}
          aria-label="Kembali ke tampilan foto"
          title="Kembali ke tampilan foto"
          className="w-11 h-11 rounded-full bg-blue-dark hover:bg-primary active:scale-90 flex items-center justify-center text-white transition-[background-color,transform] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Bookshelf Grid: 2 columns on mobile, 3 on tablet, 4 columns on desktop */}
      <div id="tour-profile-bookshelf-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-8 md:gap-x-7 md:gap-y-9 lg:gap-x-8 lg:gap-y-10">
        {sessionsList.map((session, sIdx) => {
          const originalIndex = sessionsList.findIndex(s => s.id === session.id)
          const targetIndex = originalIndex >= 0 ? originalIndex : sIdx

          return (
            <button
              key={session.id}
              type="button"
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
                containIntrinsicSize: '0 290px'
              }}
              className="group flex min-w-0 flex-col text-left cursor-pointer select-none active:scale-[0.96] transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {/* Stacked album card: the two backing sheets carry no image, so they cost no requests */}
              <span className="relative block w-full aspect-[3/4] p-1.5">
                <span
                  className={`${BACK_CARD} group-hover:-translate-x-2`}
                  style={{ transform: 'translate3d(-8px, -5px, 0) rotate(-7.5deg) scale(0.92)' }}
                />
                <span
                  className={`${BACK_CARD} group-hover:translate-x-2`}
                  style={{ transform: 'translate3d(8px, -5px, 0) rotate(7.5deg) scale(0.92)' }}
                />
                <span className="relative block w-full h-full rounded-xl overflow-hidden border-2 border-white bg-slate-200">
                  <ProgressiveImage
                    src={session.stripUrl}
                    placeholder={getBlurPlaceholderUrl(session.rawStripUrl)}
                    fallbackSrc={session.rawStripUrl}
                    alt=""
                    className="w-full h-full object-cover object-top select-none pointer-events-none"
                    loading={Math.abs(targetIndex - activeSessionIndex) < 8 ? 'eager' : 'lazy'}
                  />
                </span>
              </span>

              <span className="mt-2 block truncate text-[15px] leading-snug font-bold text-primary">{session.title}</span>
              <span className="block truncate text-[13px] leading-snug text-slate-600">{session.dateStr}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
