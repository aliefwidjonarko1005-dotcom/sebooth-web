'use client'

import React from 'react'
import {
  Search,
  CheckCircle2,
  XCircle,
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

interface SessionListTableProps {
  result: DetailedResult | null
  copiedId: string | null
  sessionsList: SessionItem[]
  currentPage: number
  pageSize: number
  handleSelectSession: (sessionId: string) => void
  handleCopy: (text: string, idKey: string) => void
}

/** Session list as table rows. */
export function SessionListTable({ result, copiedId, sessionsList, currentPage, pageSize, handleSelectSession, handleCopy }: SessionListTableProps) {
  return (
    /* ─── TABLE LIST VIEW ─── */
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1A1A1A]/10 bg-[#F9F9F9]/80 text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
            <th className="py-3 px-4 w-12 text-center">#</th>
            <th className="py-3 px-4">Session ID</th>
            <th className="py-3 px-4">Nama Event</th>
            <th className="py-3 px-4">Waktu Dibuat</th>
            <th className="py-3 px-4">Status Klaim</th>
            <th className="py-3 px-4">Kebijakan Retensi</th>
            <th className="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1A1A]/5 text-xs">
          {sessionsList.map((s, idx) => {
            const isSelected = result?.session?.id === s.id
            const expiry = checkSessionExpiry(s.created_at, s.is_claimed)
            const itemIndex = (currentPage - 1) * pageSize + idx + 1

            return (
              <tr
                key={s.id}
                className={`hover:bg-primary/5 transition-colors ${
                  isSelected ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                {/* Index */}
                <td className="py-3.5 px-4 text-center font-mono text-[11px] text-[#1A1A1A]/40">
                  {itemIndex}
                </td>

                {/* Session ID */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span
                      className="font-bold text-[#1A1A1A] cursor-pointer hover:underline"
                      onClick={() => handleSelectSession(s.id)}
                      title="Klik untuk inspeksi sesi"
                    >
                      {s.id.slice(0, 8)}...
                    </span>
                    <button
                      onClick={() => handleCopy(s.id, `table_${s.id}`)}
                      className="p-1 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Salin full ID"
                    >
                      {copiedId === `table_${s.id}` ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Event Name */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-[#1A1A1A] max-w-[200px] truncate" title={s.event_name || 'Sebooth Event'}>
                    {s.event_name || 'Sebooth Event'}
                  </div>
                </td>

                {/* Created At */}
                <td className="py-3.5 px-4 text-[#1A1A1A]/70 whitespace-nowrap">
                  {formatDateTime(s.created_at)}
                </td>

                {/* Claim Status Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {s.is_claimed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Claimed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Unclaimed
                    </span>
                  )}
                </td>

                {/* Retention Policy Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {s.is_claimed ? (
                    <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
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
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => handleSelectSession(s.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-primary text-white hover:bg-[#185340] text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      title="Inspeksi detail sesi ini"
                    >
                      <Search className="w-3 h-3" />
                      Inspeksi
                    </button>

                    <a
                      href={`/access/${s.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-[#1A1A1A]/10 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors inline-flex"
                      title="Buka QR Access page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
