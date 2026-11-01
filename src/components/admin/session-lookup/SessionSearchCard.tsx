'use client'

import React from 'react'
import {
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { SeboothLoader } from '@/components/ui/SeboothLoader'

interface SessionSearchCardProps {
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
  handleLookup: (idToLookup?: string) => Promise<void>
}

/** Search a session by its ID and open it in the inspector. */
export function SessionSearchCard({ searchQuery, setSearchQuery, loading, handleLookup }: SessionSearchCardProps) {
  return (
    <div id="session-inspector-card" className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Session & Claim Inspector
          </h2>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Cari spesifik Session ID untuk mengetahui profil user pengklaim, tiket antrean, kontak WA, dan summary media.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Inspeksi Real-time
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleLookup()
        }}
        className="mt-5 flex flex-col sm:flex-row items-stretch gap-2.5"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Masukkan Session ID (contoh: 0a8ff50b-67a4-4fb6-9377-12c6ff7a71b0)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-[#185340] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          {loading ? <SeboothLoader variant="mini" className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          Inspeksi Sesi
        </button>
      </form>
    </div>
  )
}
