'use client'

import React from 'react'
import {
  CheckCircle2,
  Layers,
  Clock,
} from 'lucide-react'

interface SessionStatsCardsProps {
  statusFilter: 'all' | 'claimed' | 'unclaimed'
  setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'claimed' | 'unclaimed'>>
  policyFilter: 'all' | 'legacy' | 'new'
  setPolicyFilter: React.Dispatch<React.SetStateAction<'all' | 'legacy' | 'new'>>
  stats: { total: number; claimed: number; unclaimed: number }
}

/** Total, claimed and unclaimed counts; each card filters the list below. */
export function SessionStatsCards({ statusFilter, setStatusFilter, policyFilter, setPolicyFilter, stats }: SessionStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Sesi */}
      <button
        onClick={() => {
          setStatusFilter('all')
          setPolicyFilter('all')
        }}
        className={`p-5 rounded-2xl border text-left transition-all ${
          statusFilter === 'all' && policyFilter === 'all'
            ? 'bg-primary/5 border-primary shadow-sm'
            : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wider">
            Total Sesi Foto
          </span>
          <span className="p-2 rounded-xl bg-primary/10 text-primary">
            <Layers className="w-4 h-4" />
          </span>
        </div>
        <p className="text-2xl font-black text-[#1A1A1A] mt-2">
          {stats.total ? stats.total.toLocaleString('id-ID') : '...'}
        </p>
        <p className="text-[11px] text-[#1A1A1A]/50 mt-1">
          Seluruh sesi photobooth terdaftar di database
        </p>
      </button>

      {/* Claimed */}
      <button
        onClick={() => setStatusFilter('claimed')}
        className={`p-5 rounded-2xl border text-left transition-all ${
          statusFilter === 'claimed'
            ? 'bg-emerald-50 border-emerald-500 shadow-sm'
            : 'bg-white border-[#1A1A1A]/10 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Sudah Diklaim
          </span>
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-2xl font-black text-emerald-950">
            {stats.claimed ? stats.claimed.toLocaleString('id-ID') : '...'}
          </p>
          {stats.total > 0 && (
            <span className="text-xs font-bold text-emerald-700">
              ({((stats.claimed / stats.total) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
        <p className="text-[11px] text-emerald-700/70 mt-1">
          Tersimpan permanen di akun pengguna
        </p>
      </button>

      {/* Unclaimed */}
      <button
        onClick={() => setStatusFilter('unclaimed')}
        className={`p-5 rounded-2xl border text-left transition-all ${
          statusFilter === 'unclaimed'
            ? 'bg-amber-50 border-amber-500 shadow-sm'
            : 'bg-white border-[#1A1A1A]/10 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Belum Diklaim
          </span>
          <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-2xl font-black text-amber-950">
            {stats.unclaimed ? stats.unclaimed.toLocaleString('id-ID') : '...'}
          </p>
          {stats.total > 0 && (
            <span className="text-xs font-bold text-amber-700">
              ({((stats.unclaimed / stats.total) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
        <p className="text-[11px] text-amber-700/70 mt-1">
          Menunggu klaim via QR code access point
        </p>
      </button>
    </div>
  )
}
