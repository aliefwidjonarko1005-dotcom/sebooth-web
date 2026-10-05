'use client'

import React from 'react'
import {
  X, HelpCircle, Keyboard, MousePointer,
  Sparkles, Download, Grid, ArrowRight, Smartphone
} from 'lucide-react'

interface DesktopGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartSpotlightTour?: () => void
  onOpenMobileGestureSimulation?: () => void
}

export default function DesktopGuideModal({
  isOpen,
  onClose,
  onStartSpotlightTour,
  onOpenMobileGestureSimulation
}: DesktopGuideModalProps) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Panduan Navigasi Desktop
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kontrol mouse, shortcut keyboard, dan fitur galeri foto Sebooth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm border border-slate-200/60 active:scale-95 transition-all cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* 1. Keyboard Shortcuts (Visual 3D Keycaps) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Shortcut Keyboard
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Arrow Keys */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-600 mb-2">
                  Pindah Sesi Foto
                </span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 shadow-[0_2px_0_rgba(0,0,0,0.08)] text-xs font-mono font-bold text-slate-800">
                    ←
                  </kbd>
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 shadow-[0_2px_0_rgba(0,0,0,0.08)] text-xs font-mono font-bold text-slate-800">
                    →
                  </kbd>
                </div>
              </div>

              {/* Space / Enter */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-600 mb-2">
                  Shuffle Foto / Pose
                </span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 shadow-[0_2px_0_rgba(0,0,0,0.08)] text-xs font-mono font-bold text-slate-800">
                    Space
                  </kbd>
                  <span className="text-[10px] text-slate-400">atau</span>
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 shadow-[0_2px_0_rgba(0,0,0,0.08)] text-xs font-mono font-bold text-slate-800">
                    ↵ Enter
                  </kbd>
                </div>
              </div>

              {/* Escape */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-600 mb-2">
                  Tutup Mode / Modal
                </span>
                <div className="flex items-center">
                  <kbd className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 shadow-[0_2px_0_rgba(0,0,0,0.08)] text-xs font-mono font-bold text-slate-800">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mouse & Interactive Controls */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MousePointer className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Navigasi Mouse & Tampilan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="text-base">🖱️</span>
                  <span>Drag Mouse Kiri / Kanan</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik dan geser mouse pada area foto untuk berpindah antar sesi foto dengan transisi slide halus.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="text-base">📸</span>
                  <span>Klik Kartu Foto (Shuffle)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik foto terdepan untuk melihat foto candid, live video frame, atau pose lainnya dalam sesi aktif.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Grid className="w-4 h-4 text-orange-600" />
                  <span>Mode Galeri Album (4-Kotak)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik tombol 4-kotak di kanan atas untuk membuka rak galeri semua album foto dengan animasi zoom-out ala Apple Photos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Simpan Semua File HD</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gunakan tombol di bagian bawah layar untuk mengunduh seluruh photostrip dan foto resolusi master original.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Additional Interactive Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onStartSpotlightTour && (
              <button
                onClick={() => {
                  onClose()
                  onStartSpotlightTour()
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center gap-2 border border-orange-200/60 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Mulai Tur Layar (Spotlight Tour)</span>
              </button>
            )}

            {onOpenMobileGestureSimulation && (
              <button
                onClick={() => {
                  onClose()
                  onOpenMobileGestureSimulation?.()
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/60 active:scale-95 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-slate-600" />
                <span>Lihat Panduan Gestur Foto Langsung 👉</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Mengerti, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  )
}
