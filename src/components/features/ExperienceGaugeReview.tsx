'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
function ArrowLeft({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function ArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function CheckCircle2({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function Star({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function Loader2({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export type MoodType = 'BURUK' | 'KURANG' | 'CUKUP' | 'BAGUS' | 'KEREN' | 'BAD' | 'UGH' | 'OK' | 'GOOD'

interface MoodConfig {
  id: number
  key: string
  title: string
  sub: string
  color: string
  lightColor: string
  btnShadow: string
  bgSoft: string
}

const MOODS: MoodConfig[] = [
  {
    id: 0,
    key: 'BURUK',
    title: 'BURUK',
    sub: 'Maaf atas pengalaman kurang baikmu',
    color: '#FF4258',
    lightColor: '#FFF0F3',
    btnShadow: '0 10px 25px -4px rgba(255, 66, 88, 0.45)',
    bgSoft: 'rgba(255, 66, 88, 0.08)'
  },
  {
    id: 1,
    key: 'KURANG',
    title: 'KURANG',
    sub: 'Beri tahu kami apa yang bisa diperbaiki',
    color: '#FF7A45',
    lightColor: '#FFF3EE',
    btnShadow: '0 10px 25px -4px rgba(255, 122, 69, 0.45)',
    bgSoft: 'rgba(255, 122, 69, 0.08)'
  },
  {
    id: 2,
    key: 'CUKUP',
    title: 'CUKUP',
    sub: 'Sesi standar tanpa kendala berarti',
    color: '#FFB020',
    lightColor: '#FFFDF0',
    btnShadow: '0 10px 25px -4px rgba(255, 176, 32, 0.45)',
    bgSoft: 'rgba(255, 176, 32, 0.08)'
  },
  {
    id: 3,
    key: 'BAGUS',
    title: 'BAGUS',
    sub: 'Hasil foto ceria & memuaskan!',
    color: '#00C2FF',
    lightColor: '#EDFAFF',
    btnShadow: '0 10px 25px -4px rgba(0, 194, 255, 0.45)',
    bgSoft: 'rgba(0, 194, 255, 0.08)'
  },
  {
    id: 4,
    key: 'KEREN',
    title: 'KEREN!',
    sub: 'Luar biasa seru & sangat puas!',
    color: '#10D078',
    lightColor: '#ECFDF5',
    btnShadow: '0 10px 25px -4px rgba(16, 208, 120, 0.45)',
    bgSoft: 'rgba(16, 208, 120, 0.08)'
  }
]

// Golden Ratio Geometry Constants for Full Mobile Semicircle Dome (phi ≈ 1.618)
const CX = 300
const CY = 300
const R_OUTER = 285 // 285 / 175 = 1.628 ≈ phi
const R_INNER = 175 // Inner radius to ring width (110px) = 175 / 110 = 1.59 ≈ phi
const SECTOR_STEP = 60 // 60 deg wide sectors for edge-to-edge visible semicircle on mobile

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  }
}

function describeRingSector(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const p1 = polarToCartesian(x, y, outerRadius, startAngle)
  const p2 = polarToCartesian(x, y, outerRadius, endAngle)
  const p3 = polarToCartesian(x, y, innerRadius, endAngle)
  const p4 = polarToCartesian(x, y, innerRadius, startAngle)
  const largeArc = (endAngle - startAngle) % 360 <= 180 ? 0 : 1

  return [
    'M', p1.x.toFixed(2), p1.y.toFixed(2),
    'A', outerRadius, outerRadius, 0, largeArc, 1, p2.x.toFixed(2), p2.y.toFixed(2),
    'L', p3.x.toFixed(2), p3.y.toFixed(2),
    'A', innerRadius, innerRadius, 0, largeArc, 0, p4.x.toFixed(2), p4.y.toFixed(2),
    'Z'
  ].join(' ')
}

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  'https://search.google.com/local/writereview?placeid=ChIJMw7u0BePcC4RfJlnOavYI6k'

interface ExperienceGaugeReviewProps {
  sessionId: string
  eventName?: string | null
}

export default function ExperienceGaugeReview({ sessionId, eventName }: ExperienceGaugeReviewProps) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState<number>(4) // Default to 'KEREN!' (index 4)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [indicatorTilt, setIndicatorTilt] = useState<number>(0)
  const [faceKey, setFaceKey] = useState<number>(0)

  const activeMood = MOODS[selectedIndex]

  // Wheel and animation DOM references
  const wheelRef = useRef<SVGSVGElement>(null)
  const wheelWrapperRef = useRef<HTMLDivElement>(null)

  // Drag physics tracking
  const currentAngleRef = useRef<number>(-(4 * SECTOR_STEP)) // Starts at -180deg
  const isPointerDownRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startAngleRef = useRef<number>(0)
  const lastMoveTimeRef = useRef<number>(0)
  const lastMoveAngleRef = useRef<number>(0)
  const velocityAngleRef = useRef<number>(0)

  // Auto-return to gallery: when user returns from Instagram / Review (tab switch, focus, or back navigation)
  useEffect(() => {
    const checkAndRedirectToGallery = () => {
      try {
        const redirected =
          sessionStorage.getItem(`sebooth_redirected_instagram_${sessionId}`) === 'true' ||
          localStorage.getItem(`sebooth_redirected_instagram_${sessionId}`) === 'true' ||
          sessionStorage.getItem(`sebooth_redirected_google_${sessionId}`) === 'true' ||
          localStorage.getItem(`sebooth_redirected_google_${sessionId}`) === 'true'

        if (redirected) {
          sessionStorage.removeItem('sebooth_redirected_instagram_' + sessionId)
          localStorage.removeItem('sebooth_redirected_instagram_' + sessionId)
          sessionStorage.removeItem('sebooth_redirected_google_' + sessionId)
          localStorage.removeItem('sebooth_redirected_google_' + sessionId)
          window.location.href = `/access/${sessionId}?reviewed=true&download=true`
        }
      } catch {}
    }

    checkAndRedirectToGallery()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRedirectToGallery()
      }
    }

    const handleFocus = () => {
      checkAndRedirectToGallery()
    }

    const handlePageShow = () => {
      checkAndRedirectToGallery()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [sessionId, router])

  // Check stored rating on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`sebooth_review_${sessionId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Accommodate both 5-mood and legacy 4-mood identifiers
        const idx = MOODS.findIndex(m => m.key === parsed.mood || m.title === parsed.mood)
        if (idx >= 0) {
          setSelectedIndex(idx)
          currentAngleRef.current = -(idx * SECTOR_STEP)
          if (wheelRef.current) {
            wheelRef.current.style.transform = `rotate(${currentAngleRef.current}deg)`
          }
        }
      }
    } catch {}
  }, [sessionId])

  // Select mood programmatically with smooth spring animation
  const handleSelectMood = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(4, idx))
    setSelectedIndex(clamped)
    setFaceKey(prev => prev + 1)
    currentAngleRef.current = -(clamped * SECTOR_STEP)

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 0.42s cubic-bezier(0.18, 1, 0.26, 1.02)'
      wheelRef.current.style.transform = `rotate(${currentAngleRef.current}deg)`
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(20)
      } catch {}
    }
  }, [])

  // Pointer Drag Handlers (Unified for Mobile Touch & Desktop Mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true
    setIsDragging(true)
    startXRef.current = e.clientX
    startAngleRef.current = currentAngleRef.current
    lastMoveAngleRef.current = currentAngleRef.current
    lastMoveTimeRef.current = performance.now()
    velocityAngleRef.current = 0

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none'
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return

    const deltaX = e.clientX - startXRef.current
    const sensitivity = 0.32
    let newAngle = startAngleRef.current + deltaX * sensitivity

    // Elastic resistance bounds (Index 0 is 0deg, Index 4 is -240deg)
    const maxBound = 20
    const minBound = -(4 * SECTOR_STEP + 20)

    if (newAngle > maxBound) {
      newAngle = maxBound + (newAngle - maxBound) * 0.25
    } else if (newAngle < minBound) {
      newAngle = minBound + (newAngle - minBound) * 0.25
    }

    currentAngleRef.current = newAngle
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${newAngle}deg)`
    }

    // Velocity computation for natural flick release
    const now = performance.now()
    const dt = now - lastMoveTimeRef.current
    if (dt > 10) {
      velocityAngleRef.current = (newAngle - lastMoveAngleRef.current) / dt
      lastMoveTimeRef.current = now
      lastMoveAngleRef.current = newAngle
    }

    // Dynamic tilt on indicator pin
    const tilt = Math.max(-12, Math.min(12, deltaX * 0.1))
    setIndicatorTilt(tilt)

    // Realtime estimated sector feedback
    let estIdx = Math.round(-newAngle / SECTOR_STEP)
    if (estIdx < 0) estIdx = 0
    if (estIdx > 4) estIdx = 4

    if (estIdx !== selectedIndex) {
      setSelectedIndex(estIdx)
      setFaceKey(prev => prev + 1)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(12)
        } catch {}
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false
    setIsDragging(false)
    setIndicatorTilt(0)

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    // Apply inertia based on release speed
    const projectedAngle = currentAngleRef.current + velocityAngleRef.current * 140
    let targetIdx = Math.round(-projectedAngle / SECTOR_STEP)
    if (targetIdx < 0) targetIdx = 0
    if (targetIdx > 4) targetIdx = 4

    handleSelectMood(targetIdx)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    const ratingScore = selectedIndex + 1

    try {
      localStorage.setItem(
        `sebooth_review_${sessionId}`,
        JSON.stringify({
          mood: activeMood.key,
          ratingScore,
          submittedAt: new Date().toISOString()
        })
      )
      localStorage.setItem(`sebooth_reviewed_${sessionId}`, 'true')
      sessionStorage.setItem(`sebooth_redirected_google_${sessionId}`, 'true')
      localStorage.setItem(`sebooth_redirected_google_${sessionId}`, 'true')
    } catch {}

    // Auto-copy recommended review template text based on rating to clipboard
    const reviewTemplates: Record<number, string> = {
      1: 'Pengalaman sesi photobooth di Sebooth.',
      2: 'Sesi foto di Sebooth, semoga ke depannya lebih baik lagi.',
      3: 'Sesi foto seru di Sebooth, hasil foto jernih.',
      4: 'Bagus banget foto di Sebooth! Hasil foto ceria, frame estetik, dan staf ramah.',
      5: 'Keren banget! Hasil cetak jernih, filter & frame estetik, softfile langsung masuk dan gampang diunduh. Sangat puas foto di Sebooth! ⭐⭐⭐⭐⭐'
    }
    const templateText = reviewTemplates[ratingScore] || reviewTemplates[5]

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(templateText).catch(() => {})
      }
    } catch {}

    // Otomatis langsung redirect ke Google Review secara synchronous pada gesture tap
    try {
      window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to auto-open Google Review:', err)
      window.location.href = GOOGLE_REVIEW_URL
    }

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 400)
  }

  const handleOpenGoogleReview = () => {
    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
  }

  const handleBackToGallery = () => {
    window.location.href = `/access/${sessionId}?reviewed=true&download=true`
  }

  return (
    <div className="min-h-[100svh] bg-[#FAF8F5] text-slate-900 flex justify-center items-center p-0 md:p-6 selection:bg-slate-200 font-sans relative overflow-x-hidden">

      {/* Top ambient aura matching active mood color */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[540px] h-[360px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 opacity-25 -z-0"
        style={{ backgroundColor: activeMood.color }}
      />

      {/* ─── MOBILE CONTAINER FRAME ─── */}
      <div className="w-full h-full min-h-[100svh] md:min-h-[860px] md:h-[884px] md:max-w-[420px] bg-[#FAFBFD] flex flex-col md:rounded-[48px] shadow-2xl relative overflow-hidden border-0 md:border-[8px] md:border-slate-800/10">

        {/* ─── TOP HEADER BAR ─── */}
        <header className="w-full px-6 pt-5 pb-2 flex items-center justify-between z-30 select-none bg-transparent">
          <button
            type="button"
            onClick={() => router.push(`/access/${sessionId}`)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            aria-label="Kembali ke Galeri Foto"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center">
            <Image
              src="/images/logo/Frame 225.png"
              alt="Sebooth Photobooth"
              width={100}
              height={42}
              className="h-8 sm:h-9 w-auto object-contain shrink-0"
              priority
            />
          </div>

          <div className="w-10" />
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 flex flex-col items-center justify-between relative px-6 select-none z-10 pt-1 pb-0 overflow-hidden">
          {!isSubmitted ? (
            /* ════════════════════════════════════════════════════════
               STAGE 1: STITCH INTERACTIVE ROULETTE SWIPE ARC RATING
               ════════════════════════════════════════════════════════ */
            <>
              {/* Question & Header Section */}
              <div className="text-center z-20 mt-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Bagaimana pengalamanmu?
                </h1>
              </div>

              {/* Expressive SVG Face & Dynamic Mood Title */}
              <div className="flex flex-col items-center justify-center my-auto z-20 mt-3 mb-2">
                <div
                  key={faceKey}
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center relative shadow-md animate-in zoom-in-95 duration-200"
                  style={{ backgroundColor: activeMood.lightColor }}
                >
                  <svg className="w-full h-full" fill="none" viewBox="0 0 160 160">
                    {/* Face Outer Border Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      stroke={activeMood.color}
                      strokeWidth="7"
                      fill={activeMood.lightColor}
                      className="transition-colors duration-300"
                    />

                    {/* Sector 0: BURUK (Angry / Frowning) */}
                    {selectedIndex === 0 && (
                      <g className="transition-opacity duration-200">
                        <ellipse cx="54" cy="64" rx="7" ry="8" fill="#FF4258" transform="rotate(15 54 64)" />
                        <ellipse cx="106" cy="64" rx="7" ry="8" fill="#FF4258" transform="rotate(-15 106 64)" />
                        <path d="M46 50 L64 58" stroke="#FF4258" strokeWidth="5.5" strokeLinecap="round" />
                        <path d="M114 50 L96 58" stroke="#FF4258" strokeWidth="5.5" strokeLinecap="round" />
                        <path d="M52 114 Q80 84 108 114" stroke="#FF4258" strokeWidth="7.5" strokeLinecap="round" fill="none" />
                      </g>
                    )}

                    {/* Sector 1: KURANG (Skeptical / Annoyed) */}
                    {selectedIndex === 1 && (
                      <g className="transition-opacity duration-200">
                        <ellipse cx="55" cy="64" rx="7.5" ry="8.5" fill="#FF7A45" />
                        <ellipse cx="105" cy="64" rx="7.5" ry="8.5" fill="#FF7A45" />
                        <path d="M48 50 Q60 44 70 50" stroke="#FF7A45" strokeWidth="5" strokeLinecap="round" fill="none" />
                        <path d="M90 52 Q100 46 112 50" stroke="#FF7A45" strokeWidth="5" strokeLinecap="round" fill="none" />
                        <path d="M52 108 C68 96 90 114 108 102" stroke="#FF7A45" strokeWidth="7.5" strokeLinecap="round" fill="none" />
                      </g>
                    )}

                    {/* Sector 2: CUKUP (Neutral / Straight Face) */}
                    {selectedIndex === 2 && (
                      <g className="transition-opacity duration-200">
                        <circle cx="56" cy="65" r="8" fill="#FFB020" />
                        <circle cx="104" cy="65" r="8" fill="#FFB020" />
                        <line x1="52" y1="108" x2="108" y2="108" stroke="#FFB020" strokeWidth="7.5" strokeLinecap="round" />
                      </g>
                    )}

                    {/* Sector 3: BAGUS (Friendly Smile) */}
                    {selectedIndex === 3 && (
                      <g className="transition-opacity duration-200">
                        <ellipse cx="55" cy="64" rx="8" ry="9" fill="#00C2FF" />
                        <ellipse cx="105" cy="64" rx="8" ry="9" fill="#00C2FF" />
                        <path d="M50 96 Q80 134 110 96" stroke="#00C2FF" strokeWidth="7.5" strokeLinecap="round" fill="none" />
                      </g>
                    )}

                    {/* Sector 4: KEREN! (Laughing Open Mouth & Star Eyes) */}
                    {selectedIndex === 4 && (
                      <g className="transition-opacity duration-200">
                        {/* Left Star Eye */}
                        <path d="M54 50 L57 60 L67 63 L57 66 L54 76 L51 66 L41 63 L51 60 Z" fill="#10D078" />
                        {/* Right Star Eye */}
                        <path d="M106 50 L109 60 L119 63 L109 66 L106 76 L103 66 L93 63 L103 60 Z" fill="#10D078" />
                        {/* Big Laughing Open Mouth */}
                        <path d="M46 94 Q80 142 114 94 Z" fill="#10D078" stroke="#10D078" strokeWidth="4" strokeLinejoin="round" />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Bold Uppercase Mood Label */}
                <h2
                  className="text-4xl sm:text-5xl font-black tracking-wider uppercase mt-3 mb-0 transition-colors duration-300 select-none font-bayon"
                  style={{ color: activeMood.color }}
                >
                  {activeMood.title}
                </h2>
                <p className="text-[13px] sm:text-[14px] font-semibold text-slate-400 tracking-wide mt-1 transition-all text-center">
                  {activeMood.sub}
                </p>
              </div>

              {/* ─── BOTTOM SWIPE ROULETTE ARC ─── */}
              <div
                className="w-full relative flex flex-col items-center justify-end z-20"
                style={{ height: '295px' }}
              >
                {/* Center Indicator Pin Marker at Top Apex */}
                <div
                  className="absolute top-1.5 z-30 flex flex-col items-center pointer-events-none transition-transform duration-150"
                  style={{
                    transform: `rotate(${indicatorTilt}deg)`
                  }}
                >
                  <div className="w-3.5 h-3.5 bg-white border-[2.5px] border-slate-700 rounded-full shadow-md z-10" />
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[14px] border-t-slate-800 -mt-1.5 filter drop-shadow-sm" />
                </div>

                {/* Interactive Wheel Dome Wrapper (Full Semicircle Edge-to-Edge Span) */}
                <div
                  ref={wheelWrapperRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none touch-none"
                  style={{
                    bottom: '-225px',
                    width: '500px',
                    height: '500px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <svg
                    ref={wheelRef}
                    className="w-full h-full drop-shadow-xl"
                    style={{
                      transform: `rotate(${-(selectedIndex * SECTOR_STEP)}deg)`,
                      transformOrigin: '50% 50%',
                      textRendering: 'geometricPrecision',
                      WebkitFontSmoothing: 'antialiased',
                      transition: isDragging ? 'none' : 'transform 0.42s cubic-bezier(0.18, 1, 0.26, 1.02)'
                    }}
                    viewBox="0 0 600 600"
                  >
                    {/* Outer Thin Rim */}
                    <circle cx={CX} cy={CY} r="295" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

                    {/* Wheel Wedges Group */}
                    <g id="wheel-wedges-group">
                      {MOODS.map((m, i) => {
                        const centerAngle = i * SECTOR_STEP
                        const startAngle = centerAngle - SECTOR_STEP / 2
                        const endAngle = centerAngle + SECTOR_STEP / 2
                        const pathD = describeRingSector(CX, CY, R_INNER, R_OUTER, startAngle, endAngle)
                        const textPos = polarToCartesian(CX, CY, (R_INNER + R_OUTER) / 2 + 4, centerAngle)
                        const isSelected = selectedIndex === i

                        return (
                          <g
                            key={m.id}
                            className="cursor-pointer transition-opacity duration-200"
                            style={{ opacity: isSelected ? 1 : 0.78 }}
                            onClick={() => handleSelectMood(i)}
                          >
                            {/* Sector Arc Path */}
                            <path
                              d={pathD}
                              fill={m.color}
                              stroke="#FFFFFF"
                              strokeWidth="2.5"
                            />

                            {/* Outer and Inner Tick Marks (Wider span for 60 deg sector) */}
                            {[-20, -10, 0, 10, 20].map((tickDeg, tIdx) => {
                              const pOuter = polarToCartesian(CX, CY, R_OUTER - 3, centerAngle + tickDeg)
                              const pOuterIn = polarToCartesian(CX, CY, R_OUTER - 12, centerAngle + tickDeg)
                              return (
                                <line
                                  key={tIdx}
                                  x1={pOuter.x}
                                  y1={pOuter.y}
                                  x2={pOuterIn.x}
                                  y2={pOuterIn.y}
                                  stroke="rgba(255,255,255,0.6)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              )
                            })}

                            {/* Sector Mood Label */}
                            <text
                              x={textPos.x}
                              y={textPos.y + 6}
                              fill="#FFFFFF"
                              fontSize={isSelected ? '18' : '16'}
                              fontWeight={isSelected ? '900' : '700'}
                              letterSpacing="0.08em"
                              textAnchor="middle"
                              transform={`rotate(${centerAngle}, ${textPos.x}, ${textPos.y})`}
                              className="select-none pointer-events-none"
                            >
                              {m.title}
                            </text>
                          </g>
                        )
                      })}
                    </g>

                    {/* Center Hub Disc (White Dome matching Golden Ratio inner radius) */}
                    <circle
                      cx={CX}
                      cy={CY}
                      r={R_INNER}
                      fill="#FFFFFF"
                      filter="drop-shadow(0 -4px 14px rgba(0,0,0,0.06))"
                      stroke="rgba(226,232,240,0.7)"
                      strokeWidth="4"
                    />
                  </svg>
                </div>

                {/* Floating Submit CTA Button */}
                <div className="relative z-30 mb-7 flex flex-col items-center w-full pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 h-[48px] rounded-full text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-xl select-none cursor-pointer border border-white/20"
                    style={{
                      backgroundColor: activeMood.color,
                      boxShadow: activeMood.btnShadow
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>MENGALIHKAN...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>KIRIM RATING ({selectedIndex + 1} ⭐)</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    )}
                  </button>
                  <p className="mt-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    Langsung diarahkan ke Google Review dengan rating bintang {selectedIndex + 1}
                  </p>
                </div>

                {/* iOS Home Bar Indicator */}
                <div className="w-32 h-1 bg-slate-300 rounded-full mb-2 z-30 pointer-events-none" />
              </div>
            </>
          ) : (
            /* ════════════════════════════════════════════════════════
               STAGE 2: CELEBRATION, GOOGLE REVIEW & GALLERY RETURN
               ════════════════════════════════════════════════════════ */
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center py-6 animate-in fade-in zoom-in-95 duration-300">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg mb-3"
                style={{ backgroundColor: activeMood.color }}
              >
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>

              <span
                className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border"
                style={{
                  backgroundColor: activeMood.lightColor,
                  color: activeMood.color,
                  borderColor: `${activeMood.color}40`
                }}
              >
                Rating {selectedIndex + 1} Bintang &middot; {activeMood.title}
              </span>

              <h2 className="text-3xl sm:text-4xl font-black font-bayon uppercase text-[#181B34] tracking-tight leading-none mt-3">
                Terima Kasih Banyak!
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
                Halaman Google Review telah terbuka untuk mengirimkan rating {selectedIndex + 1} bintang kamu.
              </p>

              {/* Google Review Card */}
              <div className="w-full rounded-[28px] bg-white border border-slate-200/90 p-5 mt-5 shadow-md flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-amber-400 mb-2">
                  {[...Array(selectedIndex + 1)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <h3 className="text-sm sm:text-base font-black font-bayon uppercase tracking-wide text-[#181B34]">
                  Beri Ulasan di Google Maps
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
                  Ulasanmu membantu studio Sebooth terus berkembang dan menghadirkan pengalaman photobooth terbaik.
                </p>

                {/* Primary Action: Reopen Google Review if needed */}
                <button
                  type="button"
                  onClick={handleOpenGoogleReview}
                  className="w-full mt-4 py-3.5 rounded-full text-white font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 hover:scale-[1.02] transition-all cursor-pointer border border-white/20"
                  style={{
                    backgroundColor: '#FF5500'
                  }}
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Buka Ulang Google Review</span>
                </button>
              </div>

              {/* Action Buttons: Kembali ke Galeri */}
              <div className="w-full mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleBackToGallery}
                  className="w-full py-3.5 rounded-full text-white font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,85,0,0.35)] active:scale-95 hover:scale-[1.02] transition-all cursor-pointer border border-white/20"
                  style={{
                    background: 'linear-gradient(90deg, #FF6A00 0%, #FF3D00 50%, #E62A00 100%)'
                  }}
                >
                  <span>Kembali ke Galeri & Unduh Foto</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER BAR ─── */}
        <footer className="w-full text-center py-3.5 border-t border-slate-200/60 bg-white/70">
          <p className="text-[11px] text-slate-400 font-medium">
            Sebooth Photobooth &middot; Capture Your Joyful Moments
          </p>
        </footer>

      </div>

    </div>
  )
}
