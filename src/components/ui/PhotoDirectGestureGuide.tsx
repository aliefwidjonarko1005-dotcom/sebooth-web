'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, Download, LayoutGrid } from 'lucide-react'

export interface PhotoDirectGestureGuideProps {
  isOpen: boolean
  onClose: () => void
  onOpenBookshelf?: () => void
  storageKey?: string
}

interface StepData {
  badge: string
  title: string
  desc: string
  type: 'swipe' | 'tap' | 'hold' | 'nav'
}

const STEPS: StepData[] = [
  {
    type: 'swipe',
    badge: '👉 Geser Sesi',
    title: 'Geser Layar (Swipe)',
    desc: 'Geser foto ke kiri atau kanan untuk berganti antar sesi foto kamu.'
  },
  {
    type: 'tap',
    badge: '👆 Ketuk Ganti Foto',
    title: 'Ketuk Foto (Tap)',
    desc: 'Ketuk foto untuk berganti pose, video live motion, atau animasi GIF.'
  },
  {
    type: 'hold',
    badge: '⏱️ Tahan Simpan Foto',
    title: 'Tekan & Tahan (Hold)',
    desc: 'Tekan & tahan foto selama 1 detik untuk membuka menu opsi & download.'
  },
  {
    type: 'nav',
    badge: '🗂️ Gallery View',
    title: 'Navigasi Kapsul Bawah',
    desc: 'Ketuk icon Gallery View di navigasi bawah untuk melihat seluruh rak sesi.'
  }
]

// Reusable SVG Hand Illustration with pointing index finger
export function SvgHandIllustration({
  className = '',
  touchGlow = true
}: {
  className?: string
  touchGlow?: boolean
}) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_14px_28px_rgba(0,0,0,0.65)]"
      >
        {/* Glowing tactile contact puck at fingertip (x: 46, y: 12) */}
        {touchGlow && (
          <>
            <circle cx="46" cy="12" r="14" fill="rgba(249, 115, 22, 0.4)" />
            <circle cx="46" cy="12" r="7" fill="rgba(249, 115, 22, 0.9)" />
            <circle cx="46" cy="12" r="3.5" fill="#ffffff" />
          </>
        )}

        {/* Hand Body with natural slight tilt */}
        <g transform="rotate(-12 46 45)">
          {/* Palm & Fingers Vector */}
          <path
            d="
              M 40 28
              V 14
              A 6 6 0 0 1 52 14
              V 34
              M 52 26
              A 5.5 5.5 0 0 1 63 26
              V 38
              M 63 34
              A 5 5 0 0 1 72 34
              V 44
              M 72 40
              A 4.5 4.5 0 0 1 80 40
              V 56
              C 80 72, 68 85, 52 85
              L 44 95
              H 32
              L 38 82
              C 26 80, 20 68, 20 56
              V 48
              C 20 44, 23 41, 27 41
              C 29.5 41, 32 42.5, 33 45
              L 40 52
              Z
            "
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gentle finger crease lines */}
          <path d="M 41 22 H 51" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <path d="M 53 32 H 62" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <path d="M 64 39 H 71" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <path d="M 32 50 C 37 56, 45 62, 54 62" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

export default function PhotoDirectGestureGuide({
  isOpen,
  onClose,
  onOpenBookshelf,
  storageKey = 'hasSeenPhotoGestureGuide_v1'
}: PhotoDirectGestureGuideProps) {
  const [step, setStep] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset step on open
  useEffect(() => {
    if (isOpen) {
      setStep(0)
    }
  }, [isOpen])

  // Auto-advance step every 4.2 seconds
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setStep(prev => (prev < STEPS.length - 1 ? prev + 1 : 0))
    }, 4200)
    return () => clearInterval(timer)
  }, [isOpen, step])

  if (!isMounted || !isOpen) return null

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {}
    onClose()
  }

  const handleNext = () => {
    if (isLast) {
      handleDismiss()
      if (currentStep.type === 'nav') {
        onOpenBookshelf?.()
      }
    } else {
      setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setStep(prev => (prev > 0 ? prev - 1 : 0))
  }

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-4 select-none animate-fade-in"
      aria-label="Panduan Gestur Foto Langsung"
    >
      {/* ─── 1. TOP FLOATING HUD PILL (Positioned directly over photo) ─── */}
      <div className="w-full flex items-center justify-center pointer-events-auto">
        <div className="w-full max-w-[340px] bg-slate-950/85 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex flex-col gap-2 transition-all">
          {/* Header row: Badge + Dots + Close */}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/25 border border-orange-500/40 text-orange-400 text-[11px] font-bold tracking-wide">
              {currentStep.badge}
            </span>

            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === step ? 'w-5 h-1.5 bg-orange-500' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Langkah ${i + 1}`}
                />
              ))}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              title="Tutup Panduan"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Description line */}
          <p className="text-[11.5px] leading-snug text-white/90 font-medium">
            {currentStep.desc}
          </p>

          {/* Controls: Prev / Next */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className={`text-[11px] font-semibold flex items-center gap-1 transition-opacity ${
                step === 0 ? 'opacity-0 pointer-events-none' : 'text-white/70 hover:text-white cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleNext}
              className="px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <span>{isLast ? 'Selesai ✓' : 'Lanjut'}</span>
              {!isLast && <ChevronRight className="w-3 h-3 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. CENTER STAGE: ANIMATED HAND DIRECTLY ON THE USER'S PHOTO ─── */}
      <div className="relative w-full flex-1 flex items-center justify-center pointer-events-none overflow-hidden my-auto">

        {/* ─── GESTURE 0: SWIPE (Hand glides horizontally across the photo) ─── */}
        {currentStep.type === 'swipe' && (
          <div className="relative flex flex-col items-center justify-center">
            {/* Guide Rail & Arrows on Photo */}
            <div className="absolute flex items-center justify-between w-[220px] px-2 text-white/70">
              <span className="text-sm font-black animate-pulse">◀</span>
              <div className="flex-1 h-[2px] mx-3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <span className="text-sm font-black animate-pulse">▶</span>
            </div>

            {/* Hand Gliding Animation */}
            <div className="animate-hand-swipe">
              <SvgHandIllustration touchGlow={true} />
            </div>

            <span className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/90 shadow-lg">
              Geser Kiri / Kanan
            </span>
          </div>
        )}

        {/* ─── GESTURE 1: TAP (Hand touches down with expanding tactile ripple) ─── */}
        {currentStep.type === 'tap' && (
          <div className="relative flex flex-col items-center justify-center">
            {/* Expanding Touch Ripple Wave directly on photo */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-orange-400 bg-orange-400/20 animate-hand-tap-ripple pointer-events-none" />

            {/* Hand Tap Motion */}
            <div className="animate-hand-tap">
              <SvgHandIllustration touchGlow={true} />
            </div>

            <span className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/90 shadow-lg">
              Ketuk 1-Kali untuk Ganti Pose
            </span>
          </div>
        )}

        {/* ─── GESTURE 2: HOLD (Hand presses down with 360 countdown ring) ─── */}
        {currentStep.type === 'hold' && (
          <div className="relative flex flex-col items-center justify-center">
            {/* 360 SVG Countdown Ring at fingertip contact point */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-16 pointer-events-none flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-orange-500/25 animate-gesture-hold-pulse" />
              <svg className="w-16 h-16 -rotate-90 pointer-events-none" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
                <circle
                  cx="35"
                  cy="35"
                  r="28"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeDasharray="176"
                  strokeDashoffset="176"
                  strokeLinecap="round"
                  className="animate-gesture-hold-ring"
                />
              </svg>
            </div>

            {/* Hand Hold Motion */}
            <div className="animate-hand-hold">
              <SvgHandIllustration touchGlow={true} />
            </div>

            <span className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/90 shadow-lg">
              Tahan 1 Detik untuk Opsi Simpan
            </span>
          </div>
        )}

        {/* ─── GESTURE 3: NAV BUTTON (Hand points down toward bottom navigation bar) ─── */}
        {currentStep.type === 'nav' && (
          <div className="relative flex flex-col items-center justify-end h-full pb-2">
            {/* Point Down Hand Animation */}
            <div className="animate-hand-point-down flex flex-col items-center">
              <SvgHandIllustration touchGlow={true} />
              <div className="text-orange-400 text-xl font-black -mt-2 animate-bounce">
                ▼
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-orange-500/50 text-[11px] font-bold text-orange-400 shadow-xl">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Ketuk icon Gallery View di navigasi bawah</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. BOTTOM HINT BAR (Sleek micro helper) ─── */}
      <div className="w-full flex items-center justify-center pointer-events-auto pb-1">
        <button
          onClick={handleDismiss}
          className="text-[11px] text-white/70 hover:text-white transition-colors cursor-pointer bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10"
        >
          Ketuk foto atau tombol di bawah untuk langsung mencoba
        </button>
      </div>
    </div>
  )
}
