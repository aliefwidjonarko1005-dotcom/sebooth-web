'use client'

import React, { useState, useEffect } from 'react'
import { Star, ExternalLink, Check, Copy } from 'lucide-react'

interface GoogleReviewPromptCardProps {
  sessionId?: string
  eventName?: string | null
  className?: string
}

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  'https://search.google.com/local/writereview?placeid=ChIJMw7u0BePcC4RfJlnOavYI6k'

const REVIEW_TEMPLATES = [
  'Hasil cetak tajam, frame aesthetic, dan softfile langsung bisa didownload cepat.',
  'Photobooth seru di event. Cetak instan lab-grade, dapat live video dan GIF juga.',
  'Pelayanan ramah dan hasil cetak memuaskan. Recommended vendor photobooth di Semarang.'
]

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [hoverRating, setHoverRating] = useState<number>(5)
  const [activeRating, setActiveRating] = useState<number>(5)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      const saved = localStorage.getItem(`has_reviewed_google_${sessionId}`)
      if (saved === 'true') {
        setHasReviewed(true)
      }
    }
  }, [sessionId])

  const handleCopyTemplate = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const text = REVIEW_TEMPLATES[idx]
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedIndex(idx)
      setSelectedTemplate(idx)
      setTimeout(() => setCopiedIndex(null), 3000)
    }
  }

  const handleOpenGoogleReview = () => {
    if (selectedTemplate !== null && navigator.clipboard) {
      navigator.clipboard.writeText(REVIEW_TEMPLATES[selectedTemplate])
    }

    if (sessionId) {
      localStorage.setItem(`has_reviewed_google_${sessionId}`, 'true')
    }
    setHasReviewed(true)

    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
  }

  if (hasReviewed) {
    return (
      <div
        className={`w-full rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[2.5] text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Terima kasih atas ulasanmu di Google
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Dukunganmu sangat membantu studio kami dikenal lebih banyak orang.
            </p>
          </div>
        </div>

        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
        >
          <span>Lihat Profil</span>
          <ExternalLink className="w-3 h-3 stroke-[2]" />
        </a>
      </div>
    )
  }

  return (
    <div
      id="tour-claim-google-review-card"
      className={`w-full rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4 text-slate-900 ${className}`}
    >
      {/* Top Header Row: Google Maps Brand & Location */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
            <GoogleIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Google Maps
            </span>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <span className="font-bold text-slate-900">5.0</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Sebooth Semarang & Tembalang
        </span>
      </div>

      {/* Main Copy & Context */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Bagikan pengalamanmu bersama Sebooth
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Suka dengan hasil foto dan layanan kami? Beri rating bintang 5 di Google Maps untuk membantu studio kami terus berkembang.
        </p>
      </div>

      {/* Interactive 5-Star Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 mr-1">
            Beri rating:
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled = starVal <= (hoverRating || activeRating)
              return (
                <button
                  key={starVal}
                  type="button"
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(5)}
                  onClick={() => {
                    setActiveRating(5)
                    handleOpenGoogleReview()
                  }}
                  className="p-1 rounded-md hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                  title={`Pilih ${starVal} bintang`}
                  aria-label={`${starVal} bintang`}
                >
                  <Star
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
          Klik bintang untuk membuka dialog ulasan langsung
        </span>
      </div>

      {/* Quick Copy Snippets */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600">
            Contoh ulasan cepat (klik untuk salin):
          </span>
          {copiedIndex !== null && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[2.4]" />
              Tersalin ke clipboard
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REVIEW_TEMPLATES.map((tmpl, idx) => {
            const isCopied = copiedIndex === idx
            const isSelected = selectedTemplate === idx

            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleCopyTemplate(idx, e)}
                className={`p-3 rounded-xl text-left text-[11px] leading-relaxed border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isCopied
                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                    : isSelected
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-600'
                }`}
              >
                <span>&ldquo;{tmpl}&rdquo;</span>
                <span className="self-end text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin teks</span>
                    </>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <button
          onClick={handleOpenGoogleReview}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>Tulis Ulasan di Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2] opacity-75" />
        </button>

        <span className="text-[11px] text-slate-400 text-center sm:text-right">
          Membuka formulir ulasan resmi dengan rating 5 bintang
        </span>
      </div>
    </div>
  )
}
