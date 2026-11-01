'use client'

import React from 'react'
import {
  Search,
  RefreshCw,
  Layers,
  LayoutList,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react'
import { SeboothLoader } from '@/components/ui/SeboothLoader'

interface ExplorerToolbarProps {
  listLoading: boolean
  viewMode: 'list' | 'grid'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'grid'>>
  filterSearch: string
  setFilterSearch: React.Dispatch<React.SetStateAction<string>>
  statusFilter: 'all' | 'claimed' | 'unclaimed'
  setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'claimed' | 'unclaimed'>>
  policyFilter: 'all' | 'legacy' | 'new'
  setPolicyFilter: React.Dispatch<React.SetStateAction<'all' | 'legacy' | 'new'>>
  sortBy: string
  setSortBy: React.Dispatch<React.SetStateAction<string>>
  currentPage: number
  fetchSessionsList: (pageToFetch?: number) => Promise<void>
}

/** Session list header: title, view toggle, refresh, search, status, retention and sort filters. */
export function ExplorerToolbar({ listLoading, viewMode, setViewMode, filterSearch, setFilterSearch, statusFilter, setStatusFilter, policyFilter, setPolicyFilter, sortBy, setSortBy, currentPage, fetchSessionsList }: ExplorerToolbarProps) {
  return (
    <div className="p-6 border-b border-[#1A1A1A]/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Daftar & Penjelajah Sesi Photobooth
          </h3>
          <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
            Kelola, filter, urutkan, dan telusuri seluruh riwayat sesi photobooth dari kiosk lapangan.
          </p>
        </div>

        {/* View Mode Toggle & Refresh Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#F9F9F9] p-1 rounded-xl border border-[#1A1A1A]/10">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
              }`}
              title="Tampilan Tabel / List"
            >
              <LayoutList className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
          </div>

          <button
            onClick={() => fetchSessionsList(currentPage)}
            disabled={listLoading}
            className="px-3 py-2 rounded-xl border border-[#1A1A1A]/10 hover:bg-[#F9F9F9] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            title="Segarkan data sesi"
          >
            {listLoading ? <SeboothLoader variant="mini" className="w-3.5 h-3.5 text-primary" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Filter */}
        <div className="lg:col-span-4 relative">
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Cari event atau ID..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          {filterSearch && (
            <button
              onClick={() => setFilterSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="all">Semua Status Klaim</option>
              <option value="claimed">Claimed (Sudah Diklaim)</option>
              <option value="unclaimed">Unclaimed (Belum Diklaim)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Retention Policy Filter */}
        <div className="lg:col-span-2">
          <select
            value={policyFilter}
            onChange={(e) => setPolicyFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="all">Semua Kebijakan</option>
            <option value="legacy">Bebas Batas Waktu (Legacy)</option>
            <option value="new">Batas 3 Hari (Sesi Baru)</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="lg:col-span-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="newest">Urut: Terbaru (Default)</option>
              <option value="oldest">Urut: Terlama</option>
              <option value="event_asc">Nama Event: A &rarr; Z</option>
              <option value="event_desc">Nama Event: Z &rarr; A</option>
              <option value="claimed_first">Status: Claimed Dahulu</option>
              <option value="unclaimed_first">Status: Unclaimed Dahulu</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
