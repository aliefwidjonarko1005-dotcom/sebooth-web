'use client'

import React, { useState, useEffect } from 'react'
import { Star, ExternalLink, Check, Sparkles } from 'lucide-react'

interface GoogleReviewPromptCardProps {
  sessionId?: string
  eventName?: string | null
  className?: string
}

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  'https://search.google.com/local/writereview?placeid=ChIJMw7u0BePcC4RfJlnOavYI6k'

function GoogleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.09-6.68-4.9H1.21v3.13C3.25 21.43 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.57 1.21 6.57l4.11 3.13c.94-2.81 3.58-4.95 6.68-4.95z"
      />
    </svg>
  )
}

export default function GoogleReviewPromptCard({
  sessionId = '',
  eventName = 'Sebooth',
  className = ''
}: GoogleReviewPromptCardProps) {
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      const savedGoogle = localStorage.getItem(`has_reviewed_google_${sessionId}`)
      const savedReview = localStorage.getItem(`sebooth_review_${sessionId}`)
      const urlParams = new URLSearchParams(window.location.search)
      const isReviewedParam = urlParams.get('reviewed') === 'true'

      if (savedGoogle === 'true' || savedReview || isReviewedParam) {
        setHasReviewed(true)
      }
    }
  }, [sessionId])

  const handleOpenGoogleReview = () => {
    if (sessionId) {
      localStorage.setItem(`has_reviewed_google_${sessionId}`, 'true')
    }
    setHasReviewed(true)
    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
  }

  // Jika sudah diulas, jangan tampilkan kartu ulasan sama sekali
  if (hasReviewed) {
    return null
  }

  return (
    <div
      id="tour-claim-google-review-card"
      className={`relative overflow-hidden w-full rounded-[26px] sm:rounded-[32px] border border-white/15 p-4.5 sm:p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 text-white group ${className}`}
      style={{ backgroundColor: '#121620' }}
    >
      {/* Subtle Sebooth Brand Orange Ambient Glow in the Top-Right Corner */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#FF5500]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#002366]/40 blur-2xl pointer-events-none" />

      {/* Left Column: Google Identity, Badge, Headline & Stars */}
      <div className="relative z-10 flex items-start sm:items-center gap-3.5 sm:gap-4">
        {/* Google Icon Glass Container */}
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <GoogleIcon className="w-6 h-6" />
        </div>

        <div>
          {/* Top Pill Tags & Stars */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF5500]/25 text-[#FF7A29] text-[10px] font-extrabold uppercase tracking-wider border border-[#FF5500]/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>GOOGLE REVIEW</span>
            </span>

            <div className="flex items-center gap-0.5 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-3 h-3"
                  style={{ fill: '#F59E0B', stroke: '#F59E0B' }}
                />
              ))}
              <span className="text-[10px] font-black text-amber-400 ml-1">5.0</span>
            </div>
          </div>

          {/* Headline in Sebooth Landing Page Style */}
          <h3 className="text-base sm:text-lg font-black font-bayon uppercase tracking-wide text-white leading-tight">
            Puas dengan Hasil Foto Sebooth?
          </h3>

          <p className="text-xs sm:text-[13px] text-white/70 mt-0.5 leading-relaxed max-w-lg">
            Bantu studio kami dengan memberi rating bintang 5 di Google Maps. Ulasanmu sangat berarti!
          </p>
        </div>
      </div>

      {/* Right Column: Signature Sebooth Fiery Orange Pill Button */}
      <div className="relative z-10 shrink-0 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleOpenGoogleReview}
          className="w-full sm:w-auto px-6 py-3 rounded-full text-white font-extrabold uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,85,0,0.4)] border border-white/25 active:scale-95 transition-all cursor-pointer group/btn"
          style={{
            background: 'linear-gradient(90deg, #FF6A00 0%, #FF3D00 50%, #E62A00 100%)'
          }}
        >
          <Star className="w-4 h-4" style={{ fill: '#FFFFFF', stroke: '#FFFFFF' }} />
          <span>Beri Ulasan di Google</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}
