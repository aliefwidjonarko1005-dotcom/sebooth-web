'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Camera,
  Users,
  Layers,
  Sparkles,
  Ticket,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Film,
  Image as ImageIcon,
  Activity,
  Award,
  Zap,
  ChevronRight,
  ExternalLink,
  Loader2,
  Search
} from 'lucide-react'
import type { InsightsData } from '@/app/api/admin/insights/route'

interface AnalyticsInsightsTabProps {
  onInspectSession?: (sessionId: string) => void
  onNavigateToUserClaims?: () => void
}

export default function AnalyticsInsightsTab({
  onInspectSession,
  onNavigateToUserClaims,
}: AnalyticsInsightsTabProps) {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [activeChartTab, setActiveChartTab] = useState<'sessions' | 'claimed'>('sessions')

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    setLoading(true)
    setError(null)
    try {
      const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'
      const res = await fetch(`/api/admin/insights${isPreview ? '?preview=1' : ''}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Gagal memuat analitik website.')
      } else {
        setData(json.data)
        setIsDemo(Boolean(json.isDemo))
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
    fetchInsights()
  }

  if (loading && !refreshing) {
    return (
      <div className="bg-white rounded-3xl border border-[#1A1A1A]/10 p-16 text-center space-y-4 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" />
        <div>
          <p className="text-base font-extrabold text-[#1A1A1A]">Menganalisis Performa Website...</p>
          <p className="text-xs text-[#1A1A1A]/50 mt-1">Mengumpulkan data sesi, klaim pengguna, media, dan antrean photobooth.</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-10 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-red-900">Gagal Memuat Analisis</h3>
        <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
        </button>
      </div>
    )
  }

  const kpi = data?.kpi
  const media = data?.mediaBreakdown
  const timeline = data?.timeline || []
  const events = data?.eventsBreakdown || []
  const peakHours = data?.peakHours || []
  const recentSessions = data?.recentSessions || []

  // Max value for timeline chart scaling
  const maxSessionsInTimeline = Math.max(
    ...timeline.map((t) => (activeChartTab === 'sessions' ? t.sessionsCreated : t.sessionsClaimed)),
    5
  )

  // Max value for peak hours scaling
  const maxPeakHour = Math.max(...peakHours.map((p) => p.count), 5)

  return (
    <div className="space-y-6">
      {/* ─── Top Header & Live Status ─── */}
      <div className="bg-gradient-to-r from-[#0F3D2E] via-[#14533D] to-[#0A291E] p-6 sm:p-7 rounded-3xl text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-40 h-40 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold text-emerald-200 backdrop-blur-xs">
                <Activity className="w-3 h-3 text-emerald-300 animate-pulse" />
                Live Performance Dashboard
              </span>
              {isDemo && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  Demo Sample Mode
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Insight & Statistik Website Sebooth
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/75 max-w-xl">
              Pantau konversi klaim foto softfile, retensi pengguna aktif, total aset digital, dan performa antrean secara berkala.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm border border-white/15 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Memperbarui...' : 'Segarkan Data'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Executive KPI Cards Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sesi & Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">Total Sesi Foto</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
              {kpi?.totalSessions.toLocaleString('id-ID') || 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {kpi?.claimedSessions || 0} Terklaim
              </span>
              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {kpi?.unclaimedSessions || 0} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Claim Conversion Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">Tingkat Klaim</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A] flex items-baseline gap-1">
              <span>{kpi?.claimRate || 0}%</span>
              <span className="text-xs font-bold text-[#1A1A1A]/40">berhasil</span>
            </div>
            {/* Visual mini progress bar */}
            <div className="w-full bg-[#1A1A1A]/5 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(kpi?.claimRate || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Pengguna & Repeat Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">Customer Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
              {kpi?.totalUniqueUsers.toLocaleString('id-ID') || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-purple-700">
              <Sparkles className="w-3 h-3" />
              <span>{kpi?.repeatUsersCount || 0} Repeat User ({kpi?.repeatUserRate || 0}%)</span>
            </div>
          </div>
        </div>

        {/* Total Aset Media */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">Aset Media Cloud</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
              {kpi?.totalMedia.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-[11px] text-[#1A1A1A]/50 font-medium mt-1.5">
              Rata-rata {kpi?.avgClaimsPerUser || 0} sesi per customer
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Interactive Visual Charts Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Activity Timeline & Peak Hours */}
        <div className="lg:col-span-8 space-y-5">
          {/* Timeline Bar Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0F3D2E]" />
                  Tren Aktivitas Sesi (7 Hari Terakhir)
                </h2>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Volume sesi foto yang dihasilkan dan diklaim oleh pengunjung website.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-[#F9F9F9] p-1 rounded-xl border border-[#1A1A1A]/10 self-start sm:self-auto">
                <button
                  onClick={() => setActiveChartTab('sessions')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === 'sessions'
                      ? 'bg-white text-[#0F3D2E] shadow-2xs'
                      : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
                  }`}
                >
                  Sesi Dibuat
                </button>
                <button
                  onClick={() => setActiveChartTab('claimed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === 'claimed'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
                  }`}
                >
                  Sesi Terklaim
                </button>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-[#1A1A1A]/10 pb-2">
                {timeline.map((item, idx) => {
                  const val = activeChartTab === 'sessions' ? item.sessionsCreated : item.sessionsClaimed
                  const heightPercent = maxSessionsInTimeline > 0 ? (val / maxSessionsInTimeline) * 100 : 0
                  const isToday = idx === timeline.length - 1

                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      {/* Hover Tooltip */}
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[10px] font-bold py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                        {val} {activeChartTab === 'sessions' ? 'Sesi' : 'Klaim'} ({item.label})
                      </div>

                      {/* Bar Value */}
                      <span className="text-[10px] font-bold text-[#1A1A1A]/50 group-hover:text-[#1A1A1A]">
                        {val}
                      </span>

                      {/* Bar Fill */}
                      <div className="w-full max-w-[42px] bg-[#1A1A1A]/5 rounded-t-xl h-full flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            activeChartTab === 'sessions'
                              ? isToday ? 'bg-[#0F3D2E]' : 'bg-[#0F3D2E]/80 group-hover:bg-[#0F3D2E]'
                              : isToday ? 'bg-emerald-600' : 'bg-emerald-500/80 group-hover:bg-emerald-600'
                          }`}
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between px-2 pt-2 text-[10px] sm:text-xs font-bold text-[#1A1A1A]/50">
                {timeline.map((item) => (
                  <span key={item.date} className="text-center truncate flex-1">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours (Waktu Terpadat Photobooth) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0F3D2E]" />
                  Jam Operasional Paling Ramai (Peak Hours)
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Distribusi waktu pengambilan foto di photobooth berdasarkan jam sesi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2">
              {peakHours.map((ph) => {
                const heightPct = maxPeakHour > 0 ? (ph.count / maxPeakHour) * 100 : 0
                return (
                  <div key={ph.hour} className="text-center group">
                    <div className="h-20 bg-[#F9F9F9] rounded-xl flex items-end p-1.5 border border-[#1A1A1A]/5">
                      <div
                        className="w-full bg-amber-400 group-hover:bg-amber-500 rounded-lg transition-all"
                        style={{ height: `${Math.max(heightPct, 8)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1A1A1A]/60 block mt-1.5">
                      {ph.label}
                    </span>
                    <span className="text-[10px] font-black text-[#1A1A1A] block">
                      {ph.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Media Breakdown & Queue Turnaround */}
        <div className="lg:col-span-4 space-y-5">
          {/* Format Media Breakdown */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0F3D2E]" />
                Distribusi Format Media
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                Komposisi file digital yang tersimpan di cloud storage.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Photostrips */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    Photostrip Cetak
                  </span>
                  <span className="text-[#1A1A1A]">{media?.strips || 0} file</span>
                </div>
                <div className="w-full bg-[#1A1A1A]/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${kpi?.totalMedia ? ((media?.strips || 0) / kpi.totalMedia) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Candid Photos */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    Foto Pose Individual
                  </span>
                  <span className="text-[#1A1A1A]">{media?.photos || 0} file</span>
                </div>
                <div className="w-full bg-[#1A1A1A]/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${kpi?.totalMedia ? ((media?.photos || 0) / kpi.totalMedia) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Live Videos */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Live Motion Video
                  </span>
                  <span className="text-[#1A1A1A]">{media?.liveVideos || 0} file</span>
                </div>
                <div className="w-full bg-[#1A1A1A]/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${kpi?.totalMedia ? ((media?.liveVideos || 0) / kpi.totalMedia) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* GIFs */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-purple-800">
                    <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                    Boomerang GIF
                  </span>
                  <span className="text-[#1A1A1A]">{media?.gifs || 0} file</span>
                </div>
                <div className="w-full bg-[#1A1A1A]/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${kpi?.totalMedia ? ((media?.gifs || 0) / kpi.totalMedia) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Antrean & Operasional Kiosk */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#0F3D2E]" />
              Kinerja Antrean Kiosk
            </h3>

            <div className="p-3.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#1A1A1A]/60 font-medium">Tiket Antrean Dikeluarkan</span>
                <span className="font-extrabold text-[#1A1A1A]">{kpi?.totalQueueTickets || 0} tiket</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#1A1A1A]/60 font-medium">Penyelesaian Sesi Booth</span>
                <span className="font-extrabold text-emerald-700">{kpi?.queueCompletionRate || 0}% sukses</span>
              </div>
            </div>

            <div className="pt-2">
              {onNavigateToUserClaims && (
                <button
                  onClick={onNavigateToUserClaims}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0F3D2E]/10 hover:bg-[#0F3D2E] text-[#0F3D2E] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Lihat Rincian Klaim Pengguna
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Event Breakdown & Recent Sessions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Event Breakdown Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0F3D2E]" />
                Event Photobooth Teraktif
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                Daftar event dengan jumlah sesi dan rasio klaim tertinggi.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {events.length === 0 ? (
              <p className="text-xs text-[#1A1A1A]/40 text-center py-6">Belum ada data event.</p>
            ) : (
              events.map((ev, i) => (
                <div
                  key={ev.eventName}
                  className="p-3 sm:p-3.5 rounded-xl bg-[#F9F9F9] hover:bg-[#F3F4F6] border border-[#1A1A1A]/5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#0F3D2E]/10 text-[#0F3D2E] text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#1A1A1A] truncate">
                        {ev.eventName}
                      </h4>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[#1A1A1A]/50 mt-1 pl-7">
                      {ev.claimed} dari {ev.total} sesi berhasil diklaim
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      {ev.claimRate}% Klaim
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sessions Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F3D2E]" />
                Sesi Terbaru
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                Log sesi terakhir yang dihasilkan sistem.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {recentSessions.length === 0 ? (
              <p className="text-xs text-[#1A1A1A]/40 text-center py-6">Belum ada sesi terbaru.</p>
            ) : (
              recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-[#1A1A1A]/5 bg-[#F9F9F9] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#1A1A1A] truncate">
                        {s.id.slice(0, 10)}...
                      </span>
                      {s.isClaimed ? (
                        <span className="text-[9px] font-black text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                          TERKLAIM
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#1A1A1A]/70 truncate mt-0.5">
                      {s.eventName || 'Sesi Booth Reguler'}
                    </p>
                  </div>

                  {onInspectSession && (
                    <button
                      onClick={() => onInspectSession(s.id)}
                      className="text-[11px] font-bold text-[#0F3D2E] hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      Cek <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
