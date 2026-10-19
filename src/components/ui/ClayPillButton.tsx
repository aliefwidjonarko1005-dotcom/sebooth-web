'use client'

import React from 'react'
import { Download, Check } from 'lucide-react'
import { SeboothLoader } from "@/components/ui/SeboothLoader";

interface ClayPillButtonProps {
  id?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  loading?: boolean
  title?: string
  className?: string
  titleAttr?: string
  ariaLabel?: string
  /** Live bundle progress while loading */
  progress?: { current: number; total: number }
  /** Briefly true right after every file was saved */
  done?: boolean
}

/**
 * ClayPillButton (Authentic 3D Claymorphic Pill Button)
 * 
 * Recreated to match the exact reference image 2 (+ New Email):
 * - Soft matte 3D inflated clay pill (sampled palette: #8E89F8 top -> #7E79F1 center -> #625EE4 bottom)
 * - Deep, soft, colored ambient clay drop shadow (rgba(98, 94, 228, 0.52))
 * - Calibrated top inner highlight and bottom inner depth (inflated 3D clay volume)
 * - Pure matte clay aesthetic: NO glass shimmers, NO glares, NO translucent blur
 * - Spacious breathing room (px-10 sm:px-12 py-4 sm:py-4.5) to avoid any cramped layout
 * - Inline crisp white icon + single-line text "Download All Photo"
 */
export default function ClayPillButton({
  id = 'tour-claim-bundle-btn',
  onClick,
  disabled = false,
  loading = false,
  title = 'Download All Photo',
  className = '',
  titleAttr = 'Download All Photo',
  ariaLabel = 'Download All Photo',
  progress,
  done = false
}: ClayPillButtonProps) {
  const pct = progress && progress.total > 0 ? progress.current / progress.total : 0
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`group relative rounded-full flex items-center justify-center gap-3.5 sm:gap-4 text-white cursor-pointer select-none whitespace-nowrap transition-all duration-300 ease-out active:scale-[0.97] active:translate-y-0.5 hover:scale-[1.03] hover:-translate-y-1 ${
        disabled ? 'cursor-not-allowed opacity-70' : ''
      } ${className}`}
      style={{
        // Generous, luxurious cushion dimensions (prevents cramped layout)
        padding: '15px 40px',
        minHeight: '56px',

        // 1. Soft Matte 3D Clay Gradient (Sampled directly from Reference Image 2)
        background: disabled
          ? 'linear-gradient(180deg, #9C97E8 0%, #837ED9 100%)'
          : 'linear-gradient(180deg, #918DF8 0%, #7E7BEA 45%, #635FE6 100%)',

        // 2. Multi-layer Claymorphic 3D Volume + Ambient Glow Shadow (Image 2)
        boxShadow: disabled
          ? '0 8px 18px -2px rgba(98, 94, 228, 0.25)'
          : `
            0 20px 42px -4px rgba(98, 94, 228, 0.55),
            0 10px 20px -2px rgba(98, 94, 228, 0.38),
            0 4px 8px -1px rgba(98, 94, 228, 0.2),
            inset 0 3px 5px -1px rgba(255, 255, 255, 0.6),
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.75),
            inset 0 -5px 8px -1px rgba(45, 40, 160, 0.32),
            inset 0 -1.5px 2.5px 0 rgba(195, 190, 255, 0.6)
          `,
      }}
      title={titleAttr}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {/* ─── INLINE WHITE ICON (Clean stroke matching '+' in Reference Image 2) ─── */}
      <div className="relative z-10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
        {loading && progress && progress.total > 0 ? (
          <svg className="w-[22px] h-[22px] -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={59.7} strokeDashoffset={59.7 * (1 - pct)} style={{ transition: 'stroke-dashoffset 300ms ease-out' }} />
          </svg>
        ) : loading ? (
          <SeboothLoader variant="mini" className="w-5 h-5 text-white" />
        ) : done ? (
          <Check className="w-[19px] h-[19px] text-white stroke-[2.6]" />
        ) : (
          <Download className="w-[19px] h-[19px] text-white stroke-[2.1]" />
        )}
      </div>

      {/* ─── PURE WHITE TYPOGRAPHY (Single-Line "Download All Photo") ─── */}
      <span className="relative z-10 text-[16px] font-medium text-white tracking-normal leading-none select-none tabular-nums">
        {loading
          ? progress && progress.total > 0
            ? `Downloading ${progress.current}/${progress.total}`
            : 'Downloading...'
          : done
          ? 'Saved to device'
          : title}
      </span>
    </button>
  )
}
