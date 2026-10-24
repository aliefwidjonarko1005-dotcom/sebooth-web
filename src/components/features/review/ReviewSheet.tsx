'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import ReviewFunnel from './ReviewFunnel'
import { FunnelStage, writeFunnel } from '@/lib/reviewFunnel'

interface ReviewSheetProps {
  open: boolean
  sessionId: string
  eventName?: string | null
  initialStage?: FunnelStage
  doneNote?: string
  /** Download progress shown above the funnel while the files save in the background. */
  status?: { text: string; busy: boolean; action?: { label: string; onClick: () => void } }
  onClose: () => void
}

/**
 * Bottom sheet that slides up when the user taps Download All (files keep saving underneath).
 * Drag the handle down, tap the backdrop, press Esc or the close button to dismiss.
 */
export default function ReviewSheet({ open, sessionId, eventName, initialStage, doneNote, status, onClose }: ReviewSheetProps) {
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()

  const close = () => {
    writeFunnel(sessionId, { dismissedAt: new Date().toISOString() })
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-slate-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Rating, ulasan, dan Instagram"
            className="relative w-full sm:max-w-[440px] max-h-[94svh] overflow-y-auto overscroll-contain bg-white rounded-t-[28px] sm:rounded-[28px] px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(15,23,42,0.18)]"
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            drag={reduceMotion ? false : 'y'}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) close()
            }}
          >
            <div className="flex items-center justify-between">
              <div className="w-10" />
              <button
                type="button"
                aria-label="Geser ke bawah untuk menutup"
                onPointerDown={(e) => dragControls.start(e)}
                className="h-8 px-6 flex items-center justify-center touch-none cursor-grab"
              >
                <span className="block w-10 h-1.5 rounded-full bg-slate-300" />
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup"
                className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {status && (
              <p
                role="status"
                aria-live="polite"
                className="mx-auto mt-1 w-fit max-w-full px-3 py-1.5 rounded-full bg-slate-100 text-[13px] text-slate-600 tabular-nums flex items-center gap-2"
              >
                {status.busy ? (
                  <span className="w-3.5 h-3.5 shrink-0 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 stroke-[2.6]" aria-hidden="true" />
                )}
                {status.text}
              </p>
            )}
            {status?.action && (
              <button
                type="button"
                onClick={status.action.onClick}
                className="mt-3 w-full min-h-[52px] rounded-full bg-slate-900 text-white text-[15px] font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                {status.action.label}
              </button>
            )}
            <div className="mt-1">
              <ReviewFunnel sessionId={sessionId} eventName={eventName} initialStage={initialStage} doneNote={doneNote} onFinish={close} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
