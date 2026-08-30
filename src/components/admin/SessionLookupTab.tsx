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
  Sparkles
} from 'lucide-react'

interface SessionItem {
  id: string
  created_at: string
  event_name: string | null
  user_id: string | null
  is_claimed: boolean
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
  queueTicket: QueueTicketInfo | null
  mediaSummary: MediaSummary
}

export default function SessionLookupTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentLoading, setRecentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionItem[]>([])
  const [result, setResult] = useState<DetailedResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch recent sessions on mount
  useEffect(() => {
    fetchRecentSessions()
  }, [])

  async function fetchRecentSessions() {
    setRecentLoading(true)
    try {
      const res = await fetch('/api/admin/session-lookup?limit=10')
      const json = await res.json()
      if (json.success && json.sessions) {
        setRecentSessions(json.sessions)
      }
    } catch {
      // ignore
    } finally {
      setRecentLoading(false)
    }
  }

  async function handleLookup(idToLookup?: string) {
    const targetId = (idToLookup || searchQuery).trim()
    if (!targetId) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/admin/session-lookup?id=${encodeURIComponent(targetId)}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Sesi tidak ditemukan atau terjadi kesalahan.')
      } else {
        setResult(json.data)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server.')
    } finally {
      setLoading(false)
    }
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
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0F3D2E]" />
              Session & Claim Inspector
            </h2>
            <p className="text-xs text-[#1A1A1A]/60 mt-1">
              Cari session ID untuk mengetahui siapa user yang mengklaim softfile foto ini.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Hemat Kuota Bandwidth
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
              placeholder="Masukkan Session ID (contoh: 3fa85f64-5717-4562-b3fc-2c963f66afa6)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all"
            />
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#185340] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Cari Sesi
          </button>
        </form>
      </div>

      {/* Quick Select Recent Sessions */}
      <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            10 Sesi Terakhir
          </h3>
          <button
            onClick={fetchRecentSessions}
            disabled={recentLoading}
            className="text-[11px] text-[#0F3D2E] font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${recentLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-[#1A1A1A]/40 py-2">
            {recentLoading ? 'Memuat sesi terbaru...' : 'Belum ada sesi di database.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {recentSessions.map((s) => {
              const isSelected = result?.session?.id === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSearchQuery(s.id)
                    handleLookup(s.id)
                  }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#0F3D2E] bg-[#0F3D2E]/5 shadow-sm'
                      : 'border-[#1A1A1A]/10 bg-[#F9F9F9] hover:border-[#0F3D2E]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-[#1A1A1A] truncate">
                      {s.id.slice(0, 8)}...
                    </span>
                    {s.is_claimed ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Claimed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded">
                        Unclaimed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/70 truncate font-medium">
                    {s.event_name || 'Sebooth Event'}
                  </p>
                  <p className="text-[10px] text-[#1A1A1A]/40 mt-0.5">
                    {formatDateTime(s.created_at)}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Result View */}
      {result && (
        <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden animate-fadeIn">
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
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      result.session.is_claimed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {result.session.is_claimed ? 'SUDAH DIKLAIM' : 'BELUM DIKLAIM'}
                  </span>
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
                className="px-3.5 py-2 rounded-xl bg-white border border-[#1A1A1A]/10 text-xs font-bold text-[#1A1A1A] hover:bg-[#F9F9F9] transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copiedId === 'session_id' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Salin Session ID
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
    </div>
  )
}
