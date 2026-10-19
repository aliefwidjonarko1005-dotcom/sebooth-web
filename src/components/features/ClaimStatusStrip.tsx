'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { SeboothLoader } from '@/components/ui/SeboothLoader'

export type ClaimStatusVariant = 'other' | 'legacy' | 'expired' | 'active'

interface ClaimStatusStripProps {
  id?: string
  variant: ClaimStatusVariant
  timeString?: string
  userName?: string | null
  isClaiming: boolean
  onClaim: () => void
  onLogin: () => void
  onRegister: () => void
}

const COPY: Record<ClaimStatusVariant, { status: string; detail: string; tone: string; dot: string }> = {
  other: {
    status: 'Sesi ini sudah tersimpan di akun lain',
    detail: 'Kamu tetap bisa melihat dan mengunduh semua media di bawah kapan saja.',
    tone: 'bg-slate-100 text-slate-800',
    dot: 'bg-slate-400'
  },
  legacy: {
    status: 'Aman tanpa batas waktu',
    detail: 'Sesi ini dibuat sebelum kebijakan simpan 3 hari berlaku. Masuk agar foto juga muncul rapi di galeri profilmu.',
    tone: 'bg-white text-slate-800',
    dot: 'bg-emerald-500'
  },
  expired: {
    status: 'Batas simpan 3 hari sudah lewat',
    detail: 'Unduh file di bawah sekarang. Server membersihkan sesi yang tidak diklaim secara berkala.',
    tone: 'bg-rose-50 text-rose-900',
    dot: 'bg-rose-500'
  },
  active: {
    status: 'Tersimpan sementara',
    detail: 'File dari kiosk disimpan 3 hari. Masuk atau daftar sekarang agar semua foto tersimpan permanen di akunmu.',
    tone: 'bg-amber-50 text-amber-950',
    dot: 'bg-amber-500'
  }
}

/**
 * One-line storage status with a single action. The long explanation lives behind "Kenapa?"
 * so the gallery reaches the first screen on a phone.
 */
export default function ClaimStatusStrip({ id, variant, timeString, userName, isClaiming, onClaim, onLogin, onRegister }: ClaimStatusStripProps) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const copy = COPY[variant]
  const canClaim = variant === 'legacy' || variant === 'active'

  return (
    <section id={id} className={`w-full rounded-2xl ${copy.tone} px-4 py-3`} aria-label="Status penyimpanan sesi">
      <div className="flex items-center gap-3">
        <span className="relative flex w-2.5 h-2.5 shrink-0" aria-hidden="true">
          {variant === 'active' && !reduceMotion && <span className={`absolute inset-0 rounded-full ${copy.dot} animate-ping opacity-60`} />}
          <span className={`relative w-2.5 h-2.5 rounded-full ${copy.dot}`} />
        </span>
        <p className="flex-1 min-w-0 text-[14px] leading-snug">
          <span className="font-semibold">{copy.status}</span>
          {variant === 'active' && timeString && <span className="tabular-nums"> · sisa {timeString}</span>}
        </p>
        {canClaim && (
          <button
            type="button"
            onClick={userName ? onClaim : onLogin}
            disabled={isClaiming}
            className="shrink-0 min-h-[40px] px-4 rounded-full bg-slate-900 text-white text-[13px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer disabled:opacity-70"
          >
            {isClaiming ? <SeboothLoader variant="mini" className="w-3.5 h-3.5" /> : null}
            <span>{isClaiming ? 'Menyimpan' : 'Simpan permanen'}</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-1 ml-[22px] min-h-[32px] flex items-center gap-1 text-[13px] font-medium opacity-75 hover:opacity-100 cursor-pointer"
      >
        Kenapa?
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="ml-[22px] pb-1">
              <p className="text-[14px] leading-relaxed opacity-90">{copy.detail}</p>
              {canClaim && !userName && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={onLogin} className="min-h-[40px] px-4 rounded-full bg-slate-900 text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer">
                    Masuk <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={onRegister} className="min-h-[40px] px-4 rounded-full bg-white text-slate-900 text-[13px] font-semibold cursor-pointer">
                    Daftar akun baru
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
