'use client'

import React from 'react'
import {
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { checkSessionExpiry } from '@/lib/sessionExpiryPolicy'
import type { DetailedResult, SessionItem } from './types'
import { formatDateTime } from './format'

interface SessionGridProps {
  result: DetailedResult | null
  copiedId: string | null
  sessionsList: SessionItem[]
  handleSelectSession: (sessionId: string) => void
  handleCopy: (text: string, idKey: string) => void
}

/** Session list as cards. */
export function SessionGrid({ result, copiedId, sessionsList, handleSelectSession, handleCopy }: SessionGridProps) {
  return (
    /* ─── GRID CARDS VIEW ─── */
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {sessionsList.map((s) => {
        const isSelected = result?.session?.id === s.id
        const expiry = checkSessionExpiry(s.created_at, s.is_claimed)

        return (
          <div
            key={s.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                : 'border-[#1A1A1A]/10 bg-white hover:border-primary/40 hover:shadow-xs'
            }`}
          >
            <div>
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#1A1A1A]">
                  <span>{s.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => handleCopy(s.id, `grid_${s.id}`)}
                    className="p-1 text-gray-400 hover:text-black rounded"
                    title="Salin ID"
                  >
                    {copiedId === `grid_${s.id}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {s.is_claimed ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Claimed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Unclaimed
                  </span>
                )}
              </div>

              {/* Event Name */}
              <h4 className="text-sm font-bold text-[#1A1A1A] truncate" title={s.event_name || 'Sebooth Event'}>
                {s.event_name || 'Sebooth Event'}
              </h4>

              {/* Date */}
              <p className="text-[11px] text-[#1A1A1A]/50 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateTime(s.created_at)}
              </p>

              {/* Policy / Retention Tag */}
              <div className="mt-2.5">
                {s.is_claimed ? (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tersimpan Permanen
                  </span>
                ) : !expiry.isSubjectToPolicy ? (
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" /> Bebas Batas Waktu
                  </span>
                ) : expiry.isExpired ? (
                  <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" /> Kedaluwarsa
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Sisa {expiry.timeString}
                  </span>
                )}
              </div>
            </div>

            {/* Card Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-[#1A1A1A]/5 flex items-center justify-between gap-2">
              <button
                onClick={() => handleSelectSession(s.id)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-primary text-white hover:bg-[#185340] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              >
                <Search className="w-3 h-3" />
                Inspeksi
              </button>
              <a
                href={`/access/${s.id}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg border border-[#1A1A1A]/10 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
                title="Buka QR Access"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
