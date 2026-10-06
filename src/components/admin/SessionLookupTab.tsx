'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  Film,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  MessageCircle,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  LayoutList,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react'
import { checkSessionExpiry } from '@/lib/sessionExpiryPolicy'

interface SessionItem {
  id: string
  created_at: string
  event_name: string | null
  user_id: string | null
  is_claimed: boolean
  queue_ticket_id?: string | null
}

interface UserInfo {
  id: string
  email: string | null
  full_name: string | null
  phone_number: string | null
  created_at: string | null
}

interface QueueTicketInfo {
  id: string
  queue_number: number
  display_name: string
  phone_number: string | null
  status: string
  event_name?: string
  created_at: string
}

interface MediaSummary {
  total: number
  photos: number
  gifs: number
  lives: number
}

interface DetailedResult {
  session: SessionItem
  user: UserInfo | null
  userTotalClaims?: number
  queueTicket: QueueTicketInfo | null
  mediaSummary: MediaSummary
}

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

  function formatDateTime(isoStr?: string | null) {
    if (!isoStr) return '-'
    try {
      const date = new Date(isoStr)
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoStr
    }
  }

  function cleanPhone(phone?: string | null) {
    if (!phone) return ''
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1)
    }
    return cleaned
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP KPI METRICS / QUICK FILTERS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sesi */}
        <button
          onClick={() => {
            setStatusFilter('all')
            setPolicyFilter('all')
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'all' && policyFilter === 'all'
              ? 'bg-[#0F3D2E]/5 border-[#0F3D2E] shadow-sm'
              : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wider">
              Total Sesi Foto
            </span>
            <span className="p-2 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E]">
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

      {/* ─── 2. SESSION INSPECTOR SEARCH CARD ─── */}
      <div id="session-inspector-card" className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0F3D2E]" />
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
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all"
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
            className="px-6 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#185340] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Inspeksi Sesi
          </button>
        </form>
      </div>

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
        <div id="session-inspector-result" className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden animate-fadeIn">
          {/* Result Status Banner */}
          <div
            className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              result.session.is_claimed
                ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200/80 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.session.is_claimed ? (
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      result.session.is_claimed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {result.session.is_claimed ? 'SUDAH DIKLAIM' : 'BELUM DIKLAIM'}
                  </span>
                  {!result.session.is_claimed && (() => {
                    const expiry = checkSessionExpiry(result.session.created_at, result.session.is_claimed);
                    if (!expiry.isSubjectToPolicy) {
                      return (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Bebas Batas Waktu (Sesi Sebelum Kebijakan)
                        </span>
                      );
                    }
                    return (
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        expiry.isExpired
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <Clock className="w-3 h-3" /> {expiry.isExpired ? 'Kedaluwarsa (3 Hari)' : `Batas 3 Hari: ${expiry.timeString}`}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-black/60 font-mono">
                    ID: {result.session.id}
                  </span>
                </div>
                <h3 className="text-lg font-black mt-1 text-[#1A1A1A]">
                  {result.session.is_claimed
                    ? `Diklaim oleh: ${result.user?.full_name || result.user?.email || 'User Sebooth'}`
                    : 'Sesi ini belum diklaim oleh user manapun'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(result.session.id, 'session_id')}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] hover:bg-[#F9F9F9] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {copiedId === 'session_id' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Salin ID
                  </>
                )}
              </button>

              <a
                href={`/access/${result.session.id}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-bold hover:bg-[#185340] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka QR Link
              </a>

              <button
                onClick={() => setResult(null)}
                className="p-2 rounded-xl bg-white/60 hover:bg-white text-gray-600 hover:text-black border border-black/5"
                title="Tutup Hasil Inspeksi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: User & Contact Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0F3D2E]" />
                Informasi Pengklaim (Customer)
              </h4>

              {result.session.is_claimed && result.user ? (
                <div className="p-5 rounded-2xl bg-[#F9F9F9] border border-[#1A1A1A]/10 space-y-4">
                  {/* Total Sesi Terklaim Badge */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Klaim User Ini</span>
                        <p className="text-xs font-bold text-emerald-950">
                          {result.userTotalClaims ? `${result.userTotalClaims} Sesi telah diklaim` : '1 Sesi telah diklaim'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                      {result.userTotalClaims || 1} Sesi
                    </span>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Nama Lengkap</span>
                    <p className="text-base font-bold text-[#1A1A1A] mt-0.5">
                      {result.user.full_name || <span className="text-gray-400 italic">Tidak ada nama</span>}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Email Akun</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                        {result.user.email || '-'}
                      </p>
                      {result.user.email && (
                        <button
                          onClick={() => handleCopy(result.user!.email!, 'email')}
                          className="text-[11px] font-bold text-[#0F3D2E] hover:underline"
                        >
                          {copiedId === 'email' ? 'Tersalin' : 'Salin'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* No WhatsApp / Phone */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Nomor WhatsApp / Telepon</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                        {result.user.phone_number || <span className="text-gray-400 italic">Tidak terdaftar</span>}
                      </p>
                      {result.user.phone_number && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${cleanPhone(result.user.phone_number)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            <MessageCircle className="w-3 h-3" /> Chat WA
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="pt-2 border-t border-[#1A1A1A]/5">
                    <span className="text-[10px] font-semibold text-[#1A1A1A]/40 block">User UUID</span>
                    <p className="font-mono text-[11px] text-[#1A1A1A]/70 break-all select-all">
                      {result.user.id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#F9F9F9] border border-dashed border-[#1A1A1A]/20 text-center text-[#1A1A1A]/50">
                  <User className="w-8 h-8 text-[#1A1A1A]/20 mx-auto mb-2" />
                  <p className="text-xs font-medium">
                    Belum ada data user. Sesi ini belum di-claim oleh siapapun.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Session & Queue Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0F3D2E]" />
                Rincian Sesi & Antrean
              </h4>

              <div className="p-5 rounded-2xl bg-[#F9F9F9] border border-[#1A1A1A]/10 space-y-4">
                {/* Event Name */}
                <div>
                  <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Nama Event / Acara</span>
                  <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">
                    {result.session.event_name || 'Sebooth Regular Session'}
                  </p>
                </div>

                {/* Tanggal & Waktu */}
                <div>
                  <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block">Waktu Sesi Dibuat</span>
                  <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">
                    {formatDateTime(result.session.created_at)}
                  </p>
                </div>

                {/* Antrean Linked Info */}
                {result.queueTicket && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1 mb-1">
                      <Ticket className="w-3 h-3" /> Terkait Tiket Antrean
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">
                        Nomor #{result.queueTicket.queue_number}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-200/70 text-blue-800">
                        {result.queueTicket.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-blue-900/80 mt-1">
                      Nama Antrean: {result.queueTicket.display_name}
                      {result.queueTicket.phone_number ? ` (${result.queueTicket.phone_number})` : ''}
                    </p>
                  </div>
                )}

                {/* Media Summary Count */}
                <div className="pt-2 border-t border-[#1A1A1A]/5">
                  <span className="text-[11px] font-semibold text-[#1A1A1A]/50 block mb-2 flex items-center gap-1">
                    <Film className="w-3 h-3 text-[#0F3D2E]" />
                    Total File Media Terkumpul
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] shadow-2xs">
                      📸 {result.mediaSummary.photos} Foto Raw
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] shadow-2xs">
                      🎞️ {result.mediaSummary.gifs} Animated GIF
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] shadow-2xs">
                      🎥 {result.mediaSummary.lives} Live Video
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-[#0F3D2E]/10 border border-[#0F3D2E]/20 text-xs font-extrabold text-[#0F3D2E]">
                      Total: {result.mediaSummary.total} Media
                    </span>
                  </div>
                  <p className="text-[10px] text-[#1A1A1A]/40 mt-2 italic">
                    *Gambar resolusi tinggi tidak dimuat untuk menghemat kuota data & hosting Vercel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. DAFTAR SESI EXPLORER (LIST VIEW + FILTER + SORT) ─── */}
      <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden">
        {/* Header Title & Controls */}
        <div className="p-6 border-b border-[#1A1A1A]/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0F3D2E]" />
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
                      ? 'bg-white text-[#0F3D2E] shadow-xs'
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
                      ? 'bg-white text-[#0F3D2E] shadow-xs'
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
                <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? 'animate-spin text-[#0F3D2E]' : ''}`} />
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
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all"
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
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all appearance-none cursor-pointer"
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
                className="w-full px-3 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all appearance-none cursor-pointer"
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
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all appearance-none cursor-pointer"
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

        {/* ─── DATA RENDERING (LIST vs GRID) ─── */}
        {listLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#1A1A1A]/40">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E] mb-3" />
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
              className="mt-4 px-4 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-bold hover:bg-[#185340] transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'list' ? (
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
                      className={`hover:bg-[#0F3D2E]/5 transition-colors ${
                        isSelected ? 'bg-[#0F3D2E]/10 font-medium' : ''
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
                            className="px-2.5 py-1.5 rounded-lg bg-[#0F3D2E] text-white hover:bg-[#185340] text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
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
        ) : (
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
                      ? 'border-[#0F3D2E] bg-[#0F3D2E]/5 shadow-sm ring-2 ring-[#0F3D2E]/20'
                      : 'border-[#1A1A1A]/10 bg-white hover:border-[#0F3D2E]/40 hover:shadow-xs'
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
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#0F3D2E] text-white hover:bg-[#185340] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
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
        )}

        {/* ─── 5. PAGINATION CONTROLS ─── */}
        <div className="p-4 sm:p-6 border-t border-[#1A1A1A]/10 bg-[#F9F9F9]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#1A1A1A]/60">
            <span>
              Menampilkan{' '}
              <strong className="text-[#1A1A1A]">
                {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-[#1A1A1A]">
                {Math.min(currentPage * pageSize, totalCount)}
              </strong>{' '}
              dari <strong className="text-[#1A1A1A]">{totalCount.toLocaleString('id-ID')}</strong> sesi
            </span>

            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#1A1A1A]/15">
              <span>Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                className="bg-white border border-[#1A1A1A]/15 rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1 || listLoading}
              className="p-2 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1 || listLoading}
              className="px-3 py-1.5 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <span className="px-3 py-1.5 text-xs font-bold text-[#1A1A1A]">
              Hal {currentPage} / {totalPages || 1}
            </span>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || listLoading}
              className="px-3 py-1.5 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || listLoading}
              className="p-2 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
