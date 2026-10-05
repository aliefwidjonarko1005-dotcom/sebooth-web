'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  X, ChevronLeft, ChevronRight, CheckCircle2,
  Sparkles, HelpCircle, ArrowRight, Hand
} from 'lucide-react'
import GestureVisualizer, { TourGesture } from './GestureVisualizer'

export type { TourGesture }

export interface TourStep {
  targetId: string
  title: string
  description: string
  badgeText?: string
  icon?: React.ReactNode
  gesture?: TourGesture
  gestureLabel?: string
  placement?: 'top' | 'bottom' | 'center' | 'auto'
}

interface InteractiveTourProps {
  steps: TourStep[]
  isOpen: boolean
  onClose: () => void
  tourKey: string
  onComplete?: () => void
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

export default function InteractiveTour({
  steps,
  isOpen,
  onClose,
  tourKey,
  onComplete
}: InteractiveTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)

  const currentStep = steps[currentStepIndex]

  // Track client mount
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
  }, [])

  // Update target rect with padding
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !currentStep) {
      setTargetRect(null)
      return
    }

    const el = document.getElementById(currentStep.targetId)
    if (el) {
      // Smooth scroll into view
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

      const rect = el.getBoundingClientRect()
      const padding = 8
      setTargetRect({
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding
      })
    } else {
      // Fallback: If element is not found, center overlay
      setTargetRect(null)
    }
  }, [isOpen, currentStep])

  // Recalculate on step change or resize/scroll
  useEffect(() => {
    if (!isOpen) return

    // Small delay to allow any layout rendering or tab transitions
    const timer = setTimeout(() => {
      updateTargetRect()
    }, 120)

    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      updateTargetRect()
    }

    const handleScroll = () => {
      updateTargetRect()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, currentStepIndex, updateTargetRect])

  // Handle keyboard navigation (ArrowRight, ArrowLeft, Escape)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStepIndex])

  if (!isOpen || !isMounted || steps.length === 0) return null

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    try {
      localStorage.setItem(tourKey, 'true')
    } catch {}
    onClose()
  }

  const handleFinish = () => {
    try {
      localStorage.setItem(tourKey, 'true')
    } catch {}
    if (onComplete) onComplete()
    onClose()
  }

  const isLastStep = currentStepIndex === steps.length - 1
  const isMobile = windowDimensions.width < 768

  if (!isOpen || !isMounted || steps.length === 0) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden select-none font-sans">
      {/* ─── 1. DARK BACKDROP WITH CUTOUT SPOTLIGHT ─── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto transition-all duration-300"
        style={{ width: '100vw', height: '100vh' }}
        onClick={handleSkip}
      >
        <defs>
          <mask id={`tour-mask-${tourKey}`}>
            {/* White covers entire screen (opaque) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout creates transparent hole over target */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Semi-transparent dimmed backdrop */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.78)"
          mask={`url(#tour-mask-${tourKey})`}
        />
      </svg>

      {/* ─── 2. GLOWING SPOTLIGHT BORDER OVER TARGET ─── */}
      {targetRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out z-[10000] rounded-2xl"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            boxShadow: '0 0 0 3px #f97316, 0 0 30px rgba(249, 115, 22, 0.5)'
          }}
        >
          {/* Subtle animated beacon ping */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white shadow-sm" />
          </span>
        </div>
      )}

      {/* ─── 2.5 FLOATING SPOTLIGHT GESTURE CUE (OVER TARGET ELEMENT) ─── */}
      {targetRect && currentStep.gesture && targetRect.height >= 140 && !isMobile && (
        <div
          className="fixed z-[10002] pointer-events-none transition-all duration-300 ease-out flex flex-col items-center justify-center animate-fade-in"
          style={{
            top: `${targetRect.top + Math.min(targetRect.height * 0.45, 260)}px`,
            left: `${targetRect.left + targetRect.width / 2}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="bg-slate-950/85 backdrop-blur-md border border-white/20 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col items-center gap-1.5 text-white scale-90 sm:scale-100">
            <GestureVisualizer gesture={currentStep.gesture} />
            <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-sm">
              {currentStep.gestureLabel || getGestureDefaultLabel(currentStep.gesture)}
            </span>
          </div>
        </div>
      )}

      {/* ─── 3. INTERACTIVE PHASE-BY-PHASE TOOLTIP CARD ─── */}
      <div
        className={`fixed z-[10001] transition-all duration-300 ease-out pointer-events-auto ${
          isMobile
            ? 'bottom-4 left-4 right-4 max-w-md mx-auto'
            : 'max-w-md w-full'
        }`}
        style={(() => {
          if (isMobile || !targetRect) return {}
          const cardEstimatedHeight = 280
          const cardEstimatedWidth = 420

          // 1. Try below target
          if (targetRect.bottom + cardEstimatedHeight + 20 < windowDimensions.height) {
            return {
              top: `${targetRect.bottom + 16}px`,
              left: '50%',
              transform: 'translateX(-50%)'
            }
          }

          // 2. Try above target
          if (targetRect.top - cardEstimatedHeight - 20 > 0) {
            return {
              bottom: `${windowDimensions.height - targetRect.top + 16}px`,
              left: '50%',
              transform: 'translateX(-50%)'
            }
          }

          // 3. Try to the right of target (ideal for desktop tall photo cards)
          const rightSpace = windowDimensions.width - targetRect.right
          if (rightSpace >= 340) {
            return {
              left: `${targetRect.right + 20}px`,
              top: `${Math.max(40, Math.min(windowDimensions.height - cardEstimatedHeight - 40, targetRect.top + 50))}px`,
              maxWidth: '380px',
              width: '100%'
            }
          }

          // 4. Try to the left of target
          const leftSpace = targetRect.left
          if (leftSpace >= 340) {
            return {
              left: `${Math.max(20, targetRect.left - 400)}px`,
              top: `${Math.max(40, Math.min(windowDimensions.height - cardEstimatedHeight - 40, targetRect.top + 50))}px`,
              maxWidth: '380px',
              width: '100%'
            }
          }

          // 5. Fallback centered
          return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }
        })()}
      >
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col gap-3.5 text-slate-900 animate-modal-pop">
          {/* Top Bar: Phase Badge & Skip Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-500 fill-orange-500" />
                {currentStep.badgeText || `FASE ${currentStepIndex + 1} DARI ${steps.length}`}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Langkah {currentStepIndex + 1}/{steps.length}
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Lewati Seluruh Panduan"
            >
              <span>Lewati</span>
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Phase Title & Icon */}
          <div className="flex items-start gap-3 mt-0.5">
            {currentStep.icon && (
              <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {currentStep.icon}
              </div>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-sans leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Interactive Gesture Showcase Bar */}
          {currentStep.gesture && (
            <div className="w-full bg-orange-50/85 border border-orange-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-300/60 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                <GestureVisualizer gesture={currentStep.gesture} compact />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black tracking-wider uppercase">
                    GESTUR
                  </span>
                  <span className="text-xs font-black text-slate-800 tracking-tight truncate">
                    {currentStep.gestureLabel || getGestureDefaultLabel(currentStep.gesture)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5 font-medium">
                  {getGestureTip(currentStep.gesture)}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Actions: Progress Dots, Back, Next / Finish */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-6 bg-orange-500'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Lompat ke langkah ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 sm:px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {isLastStep ? (
                  <>
                    <span>Selesai & Jelajah!</span>
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGestureDefaultLabel(gesture: TourGesture): string {
  switch (gesture) {
    case 'swipe':
      return 'Swipe Kiri / Kanan'
    case 'pinch':
      return 'Pinch / Zoom Layar'
    case 'hold':
      return 'Tekan & Tahan (Hold)'
    case 'tap':
      return 'Ketuk / Tap Layar'
  }
}

function getGestureTip(gesture: TourGesture): string {
  switch (gesture) {
    case 'swipe':
      return 'Geser jari ke kiri atau kanan untuk berpindah antar sesi foto.'
    case 'pinch':
      return 'Cubit (pinch in/out) atau tap 4-grid untuk beralih antara rak galeri dan foto.'
    case 'hold':
      return 'Tekan & tahan foto selama 1-2 detik di HP untuk memunculkan menu simpan.'
    case 'tap':
      return 'Ketuk foto satu kali untuk melihat pose atau aksi selanjutnya.'
  }
}

