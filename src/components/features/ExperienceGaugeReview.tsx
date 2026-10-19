'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import ReviewFunnel from './review/ReviewFunnel'

interface ExperienceGaugeReviewProps {
  sessionId: string
  eventName?: string | null
}

/**
 * Full-page version of the post-download funnel (rating → Google Review → Instagram).
 * Reached by deep link only; the gallery itself opens the same funnel as a bottom sheet.
 * Never redirects on its own: every navigation back to the gallery is a user tap.
 */
export default function ExperienceGaugeReview({ sessionId, eventName }: ExperienceGaugeReviewProps) {
  const router = useRouter()

  return (
    <div className="min-h-[100svh] bg-[#FAF8F5] text-slate-900 flex justify-center font-sans">
      <div className="w-full max-w-[440px] flex flex-col min-h-[100svh] bg-white sm:my-6 sm:min-h-0 sm:rounded-[28px]">
        <header className="px-5 pt-4 pb-2 flex items-center justify-between">
          <Link
            href={`/access/${sessionId}`}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            aria-label="Kembali ke galeri foto"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Image src="/images/logo/Frame 225.png" alt="Sebooth Photobooth" width={100} height={42} className="h-8 w-auto object-contain" priority />
          <div className="w-10" />
        </header>
        <main className="flex-1 px-5 pt-2 pb-8">
          <ReviewFunnel
            sessionId={sessionId}
            eventName={eventName}
            onFinish={() => router.push(`/access/${sessionId}`)}
            finishLabel="Kembali ke galeri"
          />
        </main>
      </div>
    </div>
  )
}
