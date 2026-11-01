'use client'

import { useState, useEffect } from 'react'
import {
  XCircle,
  Layers,
  X,
} from 'lucide-react'
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import type { DetailedResult, SessionItem } from './session-lookup/types'
import { SessionStatsCards } from './session-lookup/SessionStatsCards'
import { SessionSearchCard } from './session-lookup/SessionSearchCard'
import { InspectionResult } from './session-lookup/InspectionResult'
import { ExplorerToolbar } from './session-lookup/ExplorerToolbar'
import { SessionListTable } from './session-lookup/SessionListTable'
import { SessionGrid } from './session-lookup/SessionGrid'
import { ExplorerPagination } from './session-lookup/ExplorerPagination'

interface SessionLookupTabProps {
  initialSessionId?: string
}

export default function SessionLookupTab({ initialSessionId }: SessionLookupTabProps = {}) {
  const [searchQuery, setSearchQuery] = useState(initialSessionId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DetailedResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ── Session List, Filter, Sort & Pagination States ──
  const [sessionsList, setSessionsList] = useState<SessionItem[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filterSearch, setFilterSearch] = useState('')
  const [debouncedFilterSearch, setDebouncedFilterSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all')
  const [policyFilter, setPolicyFilter] = useState<'all' | 'legacy' | 'new'>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<{ total: number; claimed: number; unclaimed: number }>({
    total: 0,
    claimed: 0,
    unclaimed: 0
  })

  // Auto-lookup if initialSessionId is provided
  useEffect(() => {
    if (initialSessionId) {
      setSearchQuery(initialSessionId)
      handleLookup(initialSessionId)
    }
  }, [initialSessionId])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterSearch(filterSearch)
    }, 300)
    return () => clearTimeout(handler)
  }, [filterSearch])

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedFilterSearch, statusFilter, policyFilter, sortBy, pageSize])

  // Fetch list whenever query params change
  useEffect(() => {
    fetchSessionsList(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedFilterSearch, statusFilter, policyFilter, sortBy, pageSize])

  async function fetchSessionsList(pageToFetch = currentPage) {
    setListLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedFilterSearch.trim()) params.set('search', debouncedFilterSearch.trim())
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (policyFilter !== 'all') params.set('policy', policyFilter)
      if (sortBy !== 'newest') params.set('sort', sortBy)
      params.set('page', pageToFetch.toString())
      params.set('limit', pageSize.toString())

      const res = await fetch(`/api/admin/session-lookup?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setSessionsList(json.sessions || [])
        if (json.pagination) {
          setTotalCount(json.pagination.total)
          setTotalPages(json.pagination.totalPages)
          setCurrentPage(json.pagination.page)
        }
        if (json.stats) {
          setStats(json.stats)
        }
      }
    } catch (err) {
      console.error('Error fetching sessions list:', err)
    } finally {
      setListLoading(false)
    }
  }

  async function handleLookup(idToLookup?: string) {
    const targetId = (idToLookup || searchQuery).trim()
    if (!targetId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/session-lookup?id=${encodeURIComponent(targetId)}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Sesi tidak ditemukan atau terjadi kesalahan.')
      } else {
        setResult(json.data)
        // Scroll smoothly to inspector result view
        setTimeout(() => {
          const el = document.getElementById('session-inspector-result')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 100)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectSession(sessionId: string) {
    setSearchQuery(sessionId)
    handleLookup(sessionId)
  }

  function handleCopy(text: string, idKey: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(idKey)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP KPI METRICS / QUICK FILTERS ─── */}
      <SessionStatsCards
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        policyFilter={policyFilter}
        setPolicyFilter={setPolicyFilter}
        stats={stats}
      />

      {/* ─── 2. SESSION INSPECTOR SEARCH CARD ─── */}
      <SessionSearchCard
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        handleLookup={handleLookup}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── 3. INSPECTION RESULT VIEW (IF SELECTED) ─── */}
      {result && (
        <InspectionResult
          result={result}
          setResult={setResult}
          copiedId={copiedId}
          handleCopy={handleCopy}
        />
      )}

      {/* ─── 4. DAFTAR SESI EXPLORER (LIST VIEW + FILTER + SORT) ─── */}
      <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden">
        {/* Header Title & Controls */}
        <ExplorerToolbar
          listLoading={listLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filterSearch={filterSearch}
          setFilterSearch={setFilterSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          policyFilter={policyFilter}
          setPolicyFilter={setPolicyFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          currentPage={currentPage}
          fetchSessionsList={fetchSessionsList}
        />

        {/* ─── DATA RENDERING (LIST vs GRID) ─── */}
        {listLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#1A1A1A]/40">
            <SeboothLoader variant="block" theme="white" label="Memuat daftar sesi" className="mb-3 w-40" />
            <p className="text-xs font-medium">Memuat daftar sesi...</p>
          </div>
        ) : sessionsList.length === 0 ? (
          <div className="py-20 text-center text-[#1A1A1A]/50 px-4">
            <Layers className="w-10 h-10 text-[#1A1A1A]/20 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#1A1A1A]">Tidak Ada Sesi yang Cocok</h4>
            <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-sm mx-auto">
              Tidak ditemukan sesi photobooth dengan filter pencarian saat ini. Silakan ubah filter atau kata kunci.
            </p>
            <button
              onClick={() => {
                setFilterSearch('')
                setStatusFilter('all')
                setPolicyFilter('all')
                setSortBy('newest')
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#185340] transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <SessionListTable
            result={result}
            copiedId={copiedId}
            sessionsList={sessionsList}
            currentPage={currentPage}
            pageSize={pageSize}
            handleSelectSession={handleSelectSession}
            handleCopy={handleCopy}
          />
        ) : (
          <SessionGrid
            result={result}
            copiedId={copiedId}
            sessionsList={sessionsList}
            handleSelectSession={handleSelectSession}
            handleCopy={handleCopy}
          />
        )}

        {/* ─── 5. PAGINATION CONTROLS ─── */}
        <ExplorerPagination
          listLoading={listLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
