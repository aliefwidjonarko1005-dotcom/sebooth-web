'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Camera,
  Zap,
  Crown,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  XCircle,
  ArrowUpDown
} from 'lucide-react'

interface SessionMini {
  id: string
  event_name: string | null
  created_at: string
}

interface UserClaimItem {
  userId: string
  displayName: string
  email: string | null
  phoneNumber: string | null
  totalClaims: number
  latestClaimAt: string
  latestEventName: string | null
  sessions: SessionMini[]
}

interface SummaryData {
  totalUniqueUsers: number
  totalClaimedSessions: number
  avgClaimsPerUser: number
  topClaimer: {
    displayName: string
    userId: string
    totalClaims: number
  } | null
}

interface UserClaimsMonitorTabProps {
  onInspectSession?: (sessionId: string) => void
}

export default function UserClaimsMonitorTab({ onInspectSession }: UserClaimsMonitorTabProps) {
  const [users, setUsers] = useState<UserClaimItem[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'count' | 'recent'>('count')

  // Expanded user row
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Fetch users on filter change
  useEffect(() => {
    fetchClaims()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy])

  async function fetchClaims() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      if (sortBy) params.set('sort', sortBy)
      params.set('limit', '100')

      const res = await fetch(`/api/admin/user-claims?${params.toString()}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Gagal memuat data pengguna.')
      } else {
        setUsers(data.users || [])
        setSummary(data.summary || null)
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function handleRefresh() {
    setRefreshing(true)
    fetchClaims()
  }

  function handleCopy(text: string, keyId: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(keyId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function cleanPhone(phone?: string | null) {
    if (!phone) return ''
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1)
    }
    return cleaned
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

  return (
    <div className="space-y-6">
      {/* ─── Metric Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pengguna Unik */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 block">Pengguna Aktif</span>
            <p className="text-xl sm:text-2xl font-black text-[#1A1A1A] mt-0.5">
              {summary ? summary.totalUniqueUsers.toLocaleString('id-ID') : '...'}
            </p>
          </div>
        </div>

        {/* Total Sesi Terklaim */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 block">Sesi Terklaim</span>
            <p className="text-xl sm:text-2xl font-black text-[#1A1A1A] mt-0.5">
              {summary ? summary.totalClaimedSessions.toLocaleString('id-ID') : '...'}
            </p>
          </div>
        </div>

        {/* Rata-Rata Sesi per User */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 block">Rata-Rata / User</span>
            <p className="text-xl sm:text-2xl font-black text-[#1A1A1A] mt-0.5">
              {summary ? `${summary.avgClaimsPerUser} Sesi` : '...'}
            </p>
          </div>
        </div>

        {/* User Paling Aktif (Top Claimer) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-100">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 block">Top Claimer</span>
            <p className="text-sm sm:text-base font-extrabold text-[#1A1A1A] truncate mt-0.5">
              {summary?.topClaimer ? summary.topClaimer.displayName : '-'}
            </p>
            {summary?.topClaimer && (
              <span className="text-[11px] font-bold text-purple-700">
                {summary.topClaimer.totalClaims} Sesi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F3D2E]" />
              Pantau Frekuensi Klaim Pengguna
            </h2>
            <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
              Lihat berapa kali setiap customer mengklaim softfile foto mereka di Sebooth.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="self-start sm:self-auto text-xs font-bold text-[#0F3D2E] hover:text-[#185340] bg-[#0F3D2E]/5 hover:bg-[#0F3D2E]/10 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-[#1A1A1A]/5">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, WhatsApp, email, nama event, atau User ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all"
            />
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#F9F9F9] p-1 rounded-xl border border-[#1A1A1A]/10 self-start sm:self-auto">
            <button
              onClick={() => setSortBy('count')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'count'
                  ? 'bg-white text-[#0F3D2E] shadow-xs'
                  : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
              }`}
            >
              <Crown className="w-3 h-3" />
              Paling Banyak
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'recent'
                  ? 'bg-white text-[#0F3D2E] shadow-xs'
                  : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Klaim Baru
            </button>
          </div>
        </div>
      </div>

      {/* ─── Error Message ─── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ─── User Claims List ─── */}
      <div className="space-y-3">
        {loading && !refreshing ? (
          <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 p-12 text-center text-[#1A1A1A]/40">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F3D2E]" />
            <p className="text-xs font-medium">Memuat data klaim pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 p-10 text-center text-[#1A1A1A]/50 space-y-2">
            <Users className="w-8 h-8 text-[#1A1A1A]/20 mx-auto" />
            <p className="text-sm font-bold text-[#1A1A1A]/70">
              Tidak ada data pengguna yang cocok
            </p>
            <p className="text-xs text-[#1A1A1A]/40">
              {search ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada sesi yang diklaim oleh pengguna.'}
            </p>
          </div>
        ) : (
          users.map((u, idx) => {
            const isExpanded = expandedUserId === u.userId
            const isTop3 = sortBy === 'count' && idx < 3 && !debouncedSearch

            return (
              <div
                key={u.userId}
                className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-xs overflow-hidden transition-all hover:border-[#0F3D2E]/30"
              >
                {/* Main Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: User Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Initial Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs ${
                        isTop3
                          ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300/60'
                          : u.totalClaims >= 5
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#0F3D2E]/10 text-[#0F3D2E]'
                      }`}
                    >
                      {u.displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#1A1A1A] truncate">
                          {u.displayName}
                        </h3>

                        {/* Top Rank Badge */}
                        {isTop3 && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-700" />
                            Rank #{idx + 1}
                          </span>
                        )}
                      </div>

                      {/* User Contact & ID */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#1A1A1A]/60">
                        {u.phoneNumber && (
                          <span className="flex items-center gap-1 text-[#1A1A1A]/80 font-medium">
                            <Phone className="w-3 h-3 text-[#1A1A1A]/40" />
                            {u.phoneNumber}
                          </span>
                        )}

                        <span className="font-mono text-[11px] text-[#1A1A1A]/40">
                          UUID: {u.userId.slice(0, 8)}...
                        </span>

                        <span className="text-[11px] text-[#1A1A1A]/50 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#1A1A1A]/30" />
                          Klaim terakhir: {formatDateTime(u.latestClaimAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Claim Badge & Toggle Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1A1A1A]/5">
                    {/* WhatsApp Action */}
                    {u.phoneNumber && (
                      <a
                        href={`https://wa.me/${cleanPhone(u.phoneNumber)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center gap-1 text-xs font-bold"
                        title="Chat WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">WA</span>
                      </a>
                    )}

                    {/* Total Claim Badge */}
                    <div
                      className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs ${
                        u.totalClaims >= 10
                          ? 'bg-amber-500 text-white'
                          : u.totalClaims >= 3
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/10'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {u.totalClaims} Sesi
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedUserId(isExpanded ? null : u.userId)}
                      className="px-3 py-1.5 rounded-xl bg-[#F9F9F9] hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A]/80 transition-all flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Tutup' : 'Lihat Sesi'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* ─── Expanded Sessions Drawer ─── */}
                {isExpanded && (
                  <div className="bg-[#F9F9F9]/80 border-t border-[#1A1A1A]/10 p-4 sm:p-5 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#0F3D2E]" />
                        Daftar {u.sessions.length} Sesi Terklaim
                      </h4>
                      <button
                        onClick={() => handleCopy(u.userId, `uid_${u.userId}`)}
                        className="text-[11px] font-bold text-[#0F3D2E] hover:underline flex items-center gap-1"
                      >
                        {copiedId === `uid_${u.userId}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> UUID Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#0F3D2E]" /> Salin User UUID
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {u.sessions.map((sess, sIdx) => {
                        const isCopied = copiedId === sess.id

                        return (
                          <div
                            key={sess.id}
                            className="bg-white p-3 rounded-xl border border-[#1A1A1A]/10 shadow-2xs flex items-center justify-between gap-2.5 hover:border-[#0F3D2E]/40 transition-all"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#1A1A1A] truncate">
                                  {sess.id.slice(0, 10)}...
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  #{sIdx + 1}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#1A1A1A]/70 truncate font-medium mt-0.5">
                                {sess.event_name || 'Sebooth Regular Event'}
                              </p>
                              <p className="text-[10px] text-[#1A1A1A]/40 mt-0.5">
                                {formatDateTime(sess.created_at)}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Copy ID */}
                              <button
                                onClick={() => handleCopy(sess.id, sess.id)}
                                title="Salin Session ID"
                                className="p-1.5 rounded-lg bg-[#F9F9F9] hover:bg-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-all"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Inspect in Tab */}
                              {onInspectSession && (
                                <button
                                  onClick={() => onInspectSession(sess.id)}
                                  title="Inspeksi Sesi ini di tab Cek Sesi"
                                  className="px-2 py-1 rounded-lg bg-[#0F3D2E]/10 hover:bg-[#0F3D2E] text-[#0F3D2E] hover:text-white transition-all text-[11px] font-bold"
                                >
                                  Inspeksi
                                </button>
                              )}

                              {/* QR Link */}
                              <a
                                href={`/access/${sess.id}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka Link QR Akses"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
