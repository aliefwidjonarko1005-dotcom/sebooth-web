'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'

export type GestureType = 'pinch' | 'swipe' | 'hold'

interface MobileGestureTutorialProps {
  isOpen: boolean
  onClose: () => void
  storageKey?: string
  allowDesktop?: boolean
  onPinchSuccess?: () => void
}

const GESTURES: { type: GestureType; emoji: string; label: string; desc: string }[] = [
  { type: 'pinch', emoji: '🤏', label: 'Pinch', desc: 'Cubit layar untuk buka Galeri Album' },
  { type: 'swipe', emoji: '👉', label: 'Swipe', desc: 'Geser kiri/kanan untuk ganti sesi' },
  { type: 'hold', emoji: '👆', label: 'Hold', desc: 'Tahan foto untuk simpan / opsi lainnya' },
]

export default function MobileGestureTutorial({
  isOpen,
  onClose,
  storageKey = 'hasSeenMobileGestureTutorial_v1',
  allowDesktop = false,
  onPinchSuccess
}: MobileGestureTutorialProps) {
  const [step, setStep] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset step when opened
  useEffect(() => {
    if (isOpen) setStep(0)
  }, [isOpen])

  if (!isMounted || !isOpen) return null

  const currentGesture = GESTURES[step]
  const isLast = step === GESTURES.length - 1

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {}
    onClose()
  }

  const handleNext = () => {
    if (isLast) {
      handleDismiss()
      onPinchSuccess?.()
    } else {
      setStep(prev => prev + 1)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] ${
        allowDesktop ? 'flex' : 'flex md:hidden'
      } flex-col items-center justify-end select-none font-sans bg-black/50 animate-fade-in`}
      aria-label="Tutorial Gestur"
    >
      {/* ─── Top: Dismiss Button ─── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-end p-4 z-10">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          <span>Lewati</span>
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* ─── Center: Gesture Animation Overlay (directly on the photo, no box) ─── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          key={currentGesture.type}
          className="relative w-[200px] h-[200px] flex items-center justify-center animate-fade-in"
        >
          {/* ── PINCH: Two fingers converging ── */}
          {currentGesture.type === 'pinch' && (
            <>
              {/* Finger 1: top-left → center */}
              <div className="absolute z-30 animate-real-pinch-f1 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 border-2 border-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              {/* Finger 2: bottom-right → center */}
              <div className="absolute z-30 animate-real-pinch-f2 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 border-2 border-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </>
          )}

          {/* ── SWIPE: Single finger sliding left ── */}
          {currentGesture.type === 'swipe' && (
            <div className="absolute animate-real-swipe-finger flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 border-2 border-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          )}

          {/* ── HOLD: Single finger pressing down with ring ── */}
          {currentGesture.type === 'hold' && (
            <>
              {/* Expanding pulse */}
              <div className="absolute animate-gesture-hold-pulse w-14 h-14 rounded-full bg-orange-400/30" />

              <div className="absolute animate-real-hold-finger flex items-center justify-center">
                {/* Progress ring */}
                <svg className="w-14 h-14 -rotate-90 pointer-events-none absolute" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle
                    cx="35" cy="35" r="28" fill="none"
                    stroke="#f97316" strokeWidth="3"
                    strokeDasharray="176" strokeDashoffset="176"
                    strokeLinecap="round"
                    className="animate-gesture-hold-ring"
                  />
                </svg>
                <div className="w-12 h-12 rounded-full bg-white/90 border-2 border-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Bottom Panel: Info + Next Button ─── */}
      <div className="w-full max-w-md px-5 pb-10 pt-4 flex flex-col items-center gap-4 z-10 pointer-events-auto">
        {/* Gesture info pill */}
        <div className="px-5 py-2.5 rounded-2xl bg-black/70 border border-white/15 flex items-center gap-3 shadow-xl animate-fade-in">
          <span className="text-2xl">{currentGesture.emoji}</span>
          <div className="flex flex-col">
            <span className="text-white text-sm font-bold leading-tight">{currentGesture.label}</span>
            <span className="text-white/70 text-xs leading-snug">{currentGesture.desc}</span>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {GESTURES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 h-2 bg-orange-500'
                  : i < step
                  ? 'w-2 h-2 bg-white/50'
                  : 'w-2 h-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Next / Finish button */}
        <button
          onClick={handleNext}
          className="w-full max-w-[260px] py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.97] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
        >
          <span>{isLast ? 'Mulai Sekarang' : 'Lanjut'}</span>
          {!isLast && <ChevronRight className="w-4 h-4 stroke-[2.5]" />}
        </button>

        <span className="text-[11px] text-white/40">
          Ketuk di mana saja untuk lewati
        </span>
      </div>
    </div>
  )
}
