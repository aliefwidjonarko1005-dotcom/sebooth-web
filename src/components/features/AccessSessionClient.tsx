'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Camera, Download, Loader2, CheckCircle2, XCircle,
  Clock, AlertTriangle, Share2, Sparkles, Check,
  ChevronLeft, ArrowRight, ShieldCheck, Film, Image as ImageIcon,
  ExternalLink, Eye, X, HelpCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { claimSession } from '@/app/actions'
import InteractiveTour, { TourStep } from '@/components/ui/InteractiveTour'
import { checkSessionExpiry } from '@/lib/sessionExpiryPolicy'

interface AccessSessionClientProps {
  session: SessionData
  sessionId: string
}

function getOptimizedDisplayUrl(rawUrl: string, width = 720, quality = 75): string {
  if (!rawUrl) return ''
  if (rawUrl.includes('/api/image')) return rawUrl
  if (rawUrl.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) return rawUrl
  if (rawUrl.match(/\.webp(\?.*)?$/i)) return rawUrl
  return `/api/image?url=${encodeURIComponent(rawUrl)}&w=${width}&q=${quality}`
}

export default function AccessSessionClient({ session: initialSession, sessionId }: AccessSessionClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const claimAttempted = useRef(false)

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<SessionData>(initialSession)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [alreadyClaimedByOther, setAlreadyClaimedByOther] = useState(false)
  const [isClaimedByMe, setIsClaimedByMe] = useState(false)

  // Download bundle state
  const [isBundling, setIsBundling] = useState(false)
  const [bundleProgress, setBundleProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 })
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Lightbox preview modal state
  const [previewMedia, setPreviewMedia] = useState<{ url: string; displayUrl?: string; type: string; label: string } | null>(null)
  const [isTourOpen, setIsTourOpen] = useState(false)

  // 4. Calculate session expiration time & policy eligibility
  // Kebijakan batas waktu 3 hari HANYA berlaku untuk sesi yang dibuat setelah tanggal kebijakan.
  // Sesi sebelumnya bebas batas waktu (exempt / permanent storage guarantee).
  const expiryInfo = useMemo(() => {
    return checkSessionExpiry(session.created_at, session.is_claimed)
  }, [session.created_at, session.is_claimed])

  // Interactive Step-by-Step Tour configuration for Claim Page
  const claimTourSteps: TourStep[] = useMemo(() => [
    {
      targetId: 'tour-claim-urgent-banner',
      title: expiryInfo.isSubjectToPolicy
        ? 'Wajib Klaim! Foto Akan Hilang dalam 3 Hari'
        : 'Klaim Sesi Kamu ke Akun Sebooth',
      description: expiryInfo.isSubjectToPolicy
        ? 'Sesi foto dari kiosk photobooth ini hanya disimpan sementara di server selama 3 hari. Segera klik tombol Login atau Sign Up untuk mengklaim sesi ini agar tersimpan permanen selamanya. Kalo nggak diklaim, semua foto kamu bakalan hilang terhapus otomatis dari server!'
        : 'Sesi ini dibuat sebelum kebijakan retensi 3 hari diberlakukan, sehingga foto kamu aman tanpa batas kedaluwarsa. Klik tombol Login atau Sign Up untuk mengklaim sesi ini agar fotomu tersimpan rapi di galeri profil kamu selamanya!',
      badgeText: expiryInfo.isSubjectToPolicy
        ? 'FASE 1: INFO PENTING & RETENSI'
        : 'FASE 1: KLAIM KE AKUN KAMU',
      icon: expiryInfo.isSubjectToPolicy ? <Clock className="w-5 h-5 text-orange-600" /> : <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      gesture: 'tap',
      gestureLabel: 'Tap Login / Buat Akun'
    },
    {
      targetId: 'tour-claim-bundle-btn',
      title: 'Download Semua File Langsung ke Galeri',
      description: 'Kamu bisa langsung mengunduh semua media (Photostrip, Live Video, GIF, dan Foto Individual) saat ini juga tanpa harus login atau klaim dulu! File akan terunduh beruntun dan langsung tersimpan di galeri foto HP kamu tanpa file ZIP.',
      badgeText: 'FASE 2: DOWNLOAD LANGSUNG',
      icon: <Download className="w-5 h-5 text-orange-600" />,
      gesture: 'tap',
      gestureLabel: '1-Tap Simpan Semua ke Galeri'
    },
    {
      targetId: 'tour-claim-tip-banner',
      title: 'Cara Cepat: Tekan & Tahan (Long-Press)',
      description: 'Di browser HP, kamu juga bisa menyimpan foto/video satuan dengan sangat mudah: cukup tekan dan tahan (long-press) foto mana saja, lalu pilih "Simpan ke Foto" atau "Download Gambar".',
      badgeText: 'FASE 3: CARA SIMPAN DI HP',
      icon: <Sparkles className="w-5 h-5 text-orange-600" />,
      gesture: 'hold',
      gestureLabel: 'Tekan & Tahan (Hold / Long-Press) Foto'
    },
    {
      targetId: 'tour-claim-first-media',
      title: 'Preview Detail & Download Satuan HD',
      description: 'Tap foto untuk membuka preview lightbox resolusi besar. Gunakan gesture pinch untuk zoom detail foto jika kamu ingin melihat ketajaman kualitas master 100% HD.',
      badgeText: 'FASE 4: PREVIEW & SATUAN',
      icon: <ImageIcon className="w-5 h-5 text-orange-600" />,
      gesture: 'pinch',
      gestureLabel: 'Pinch Zoom / Tap Perbesar'
    },
    {
      targetId: 'tour-claim-share-btn',
      title: 'Bagikan Sesi Ini ke Teman-Teman',
      description: 'Klik tombol ini untuk menyalin link sesi atau membagikannya langsung ke teman-teman sesi foto kamu melalui WhatsApp atau media sosial.',
      badgeText: 'FASE 5: BAGIKAN TAUTAN',
      icon: <Share2 className="w-5 h-5 text-orange-600" />,
      gesture: 'tap',
      gestureLabel: 'Tap untuk Bagikan Link'
    }
  ], [expiryInfo.isSubjectToPolicy])

  // Auto-launch interactive tour for first-time visitors
  useEffect(() => {
    if (typeof window !== 'undefined' && session) {
      const hasSeen = localStorage.getItem('hasSeenClaimTour_v1')
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsTourOpen(true)
        }, 800)
        return () => clearTimeout(timer)
      }
    }
  }, [session])

  // 1. Check auth
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        const currentUser = authSession?.user || null
        setUser(currentUser)

        if (currentUser && session) {
          if (session.is_claimed) {
            if (session.user_id === currentUser.id) {
              setIsClaimedByMe(true)
            } else if (session.user_id) {
              setAlreadyClaimedByOther(true)
            }
          }
        }
      } catch (e) {
        console.error('Auth check error:', e)
      }
    }
    checkUser()
  }, [supabase, session])

  // 2. Auto-claim when user is logged in and session is unclaimed
  useEffect(() => {
    if (user && session && !session.is_claimed && !claimAttempted.current && !isClaiming) {
      claimAttempted.current = true
      handleClaim()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session])

  // Show temporary toast notification
  const showToast = (msg: string, duration = 3500) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), duration)
  }

  // 3. Normalized Media List
  const mediaList = useMemo(() => {
    const raw = session.media || []
    return raw.map((item: MediaItem, idx: number) => {
      const isVideo = (item.type === 'live' || item.type === 'video' || !!item.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) && !item.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i)
      const isGif = item.type === 'gif' || !!item.url?.match(/\.gif(\?.*)?$/i)
      const isStrip = !isVideo && !isGif && ((item.type as string) === 'strip' || !!item.url?.toLowerCase().includes('strip'))

      const label = isStrip
        ? 'Photostrip'
        : isVideo
        ? 'Live Video Frame'
        : isGif
        ? 'Live GIF'
        : `Foto Pose ${idx + 1}`

      return {
        id: item.id || `m-${idx}`,
        url: item.url, // Original uncompressed master camera file (100% resolution for downloads)
        displayUrl: getOptimizedDisplayUrl(item.url, 720, 75), // Fast compressed WebP for instant UI display
        type: isVideo ? 'video' : isGif ? 'gif' : isStrip ? 'strip' : 'photo',
        label
      }
    })
  }, [session.media])


  // 5. Handle Claim
  const handleClaim = async () => {
    if (!user) {
      router.push(`/login?claim=${sessionId}`)
      return
    }
    if (isClaiming) return
    setIsClaiming(true)

    try {
      const res = await claimSession(sessionId)
      if (!res.success) throw new Error(res.error || 'Gagal mengklaim sesi ini.')

      setClaimSuccess(true)
      setIsClaimedByMe(true)
      setSession(prev => ({ ...prev, is_claimed: true, user_id: user.id }))
      showToast('🎉 Sesi berhasil diklaim dan tersimpan permanen di akunmu!')
    } catch (err: any) {
      console.error('Claim error:', err)
      setError(err.message || 'Gagal mengklaim sesi. Silakan coba lagi.')
    } finally {
      setIsClaiming(false)
    }
  }

  // 6. Share link
  const handleShare = () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `Foto Sesi Sebooth — ${session.event_name || 'Sebooth Studio'}`,
        text: 'Lihat dan simpan foto hasil photobooth kita di Sebooth!',
        url: shareUrl
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      showToast('Link sesi berhasil disalin ke clipboard!')
    }
  }

  // 7. Individual Download
  const handleDownloadSingle = (e: React.MouseEvent, item: { url: string; type: string; label: string }, index: number) => {
    e.stopPropagation()
    const ext = item.type === 'video' ? 'mp4' : item.type === 'gif' ? 'gif' : 'jpg'
    const sessionSlug = session.event_name?.replace(/[^a-zA-Z0-9_-]+/g, '_') || `Sebooth_${sessionId.slice(0, 6)}`
    const fileName = `Sebooth_${sessionSlug}_${item.label.replace(/\s+/g, '_')}_${index + 1}.${ext}`

    const link = document.createElement('a')
    link.href = `/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(fileName)}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Mengunduh ${item.label}...`)
  }

  // 8. Bundle Download: Multiple Sequential Downloads directly to User's Gallery (No ZIP)
  const handleDownloadBundle = async () => {
    if (mediaList.length === 0 || isBundling) return
    setIsBundling(true)
    const total = mediaList.length
    setBundleProgress({ current: 0, total })

    try {
      const isMobileDevice = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1))
      const sessionSlug = session.event_name?.replace(/[^a-zA-Z0-9_-]+/g, '_') || `Sebooth_${sessionId.slice(0, 6)}`
      const downloadedFiles: File[] = []

      // Step A: Fetch all media files with clean MIME types
      for (let i = 0; i < total; i++) {
        const item = mediaList[i]
        setBundleProgress({ current: i + 1, total })

        let ext = 'jpg'
        let mimeType = 'image/jpeg'
        if (item.type === 'video' || item.url.match(/\.(mp4|mov|webm)/i)) {
          ext = 'mp4'
          mimeType = 'video/mp4'
        } else if (item.type === 'gif' || item.url.match(/\.gif/i)) {
          ext = 'gif'
          mimeType = 'image/gif'
        } else if (item.url.match(/\.png/i)) {
          ext = 'png'
          mimeType = 'image/png'
        }

        const labelSlug = item.label.replace(/\s+/g, '_')
        const fileName = `Sebooth_${sessionSlug}_${labelSlug}.${ext}`

        // Direct fetch or API proxy fallback
        let blob: Blob | null = null
        try {
          const res = await fetch(item.url)
          if (res.ok) {
            blob = await res.blob()
          }
        } catch {
          blob = null
        }

        if (!blob) {
          const proxyRes = await fetch(`/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(fileName)}`)
          if (proxyRes.ok) {
            blob = await proxyRes.blob()
          }
        }

        if (blob) {
          const typedBlob = blob.type && blob.type !== 'application/octet-stream'
            ? blob
            : new Blob([blob], { type: mimeType })
          downloadedFiles.push(new File([typedBlob], fileName, { type: mimeType }))
        }
      }

      // Step B: Native Save via Web Share Level 2 on Mobile (Direct to Camera Roll / iOS Photos)
      let savedViaShare = false
      if (isMobileDevice && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: downloadedFiles })) {
        try {
          await navigator.share({
            files: downloadedFiles,
            title: `Sesi Foto ${session.event_name || 'Sebooth'}`,
            text: 'Simpan semua foto & video ke galeri HP!'
          })
          savedViaShare = true
          showToast(`Berhasil menyimpan ${downloadedFiles.length} file ke Galeri!`)
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Share API fallback to sequential download:', shareErr)
          } else {
            savedViaShare = true
          }
        }
      }

      // Step C: Fallback Sequential Multiple Downloads for Android / Chrome / PC
      if (!savedViaShare) {
        for (let i = 0; i < downloadedFiles.length; i++) {
          const file = downloadedFiles[i]
          const blobUrl = URL.createObjectURL(file)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)

          if (i < downloadedFiles.length - 1) {
            await new Promise(r => setTimeout(r, 450))
          }
        }
        showToast(`Berhasil mendownload ${downloadedFiles.length} file ke Galeri!`)
      }
    } catch (err) {
      console.error('Download all failed:', err)
      showToast('Gagal mendownload beberapa file. Coba lagi.')
    } finally {
      setIsBundling(false)
    }
  }

  // Format date display
  const formattedDate = useMemo(() => {
    if (!session.created_at) return ''
    const d = new Date(session.created_at)
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [session.created_at])

  // Error screen
  if (error) {
    return (
      <div className="min-h-[100svh] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-sans text-slate-900">
        <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mb-5 text-rose-600 shadow-md">
          <XCircle className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Terjadi Kesalahan</h1>
        <p className="mt-2 text-slate-600 text-sm max-w-sm">{error}</p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setError(null)}
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-[#FAF8F5] text-slate-900 flex flex-col font-sans select-none antialiased">

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-slate-950/90 backdrop-blur-md text-white font-bold text-xs sm:text-sm shadow-2xl border border-white/10 flex items-center gap-2 animate-fade-in pointer-events-none">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── TOP APP BAR ─── */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Kembali ke Beranda"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight font-sans">
                Sebooth Softfile
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-wide">
                Instant Access
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
              {session.event_name || 'Sebooth Studio'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Interactive Tour / Help Button */}
          <button
            id="tour-claim-help-btn"
            onClick={() => setIsTourOpen(true)}
            className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
            title="Buka Panduan Interaktif Halaman Ini"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Share Button */}
          <button
            id="tour-claim-share-btn"
            onClick={handleShare}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            title="Bagikan Sesi Ini"
          >
            <Share2 className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Profile / My Photos Link if Claimed */}
          {isClaimedByMe && (
            <Link
              href="/profile"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.4]" />
              <span className="hidden xs:inline">Galeri Akun</span>
            </Link>
          )}
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 flex-1 flex flex-col gap-6">

        {/* ─── 1. TOP URGENT CLAIM & RETENTION CALLOUT (DI ATAS SENDIRI) ─── */}
        <section id="tour-claim-urgent-banner">
          {isClaimedByMe ? (
            /* Already Claimed by Current User */
            <div className="w-full rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 font-sans">
                    Sesi Tersimpan Permanen di Akun Kamu
                  </h4>
                  <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                    Sesi ini sudah kamu klaim. Seluruh foto dan video tersimpan selamanya di akun Sebooth kamu dan tidak akan dihapus.
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-transform active:scale-95 shadow-sm flex items-center gap-1.5"
              >
                <span>Buka Galeri</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </Link>
            </div>
          ) : alreadyClaimedByOther ? (
            /* Claimed by Another User */
            <div className="w-full rounded-2xl bg-slate-100 border border-slate-200 p-4 sm:p-5 flex items-center gap-3 text-slate-700 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  Sesi Ini Sudah Diklaim
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sesi ini telah diklaim oleh pemilik akun lain. Namun, kamu tetap dapat mengunduh semua foto di bawah kapan saja.
                </p>
              </div>
            </div>
          ) : !expiryInfo.isSubjectToPolicy ? (
            /* Unclaimed Session BEFORE Policy Date: Permanent Safe Storage (Grandfathered Legacy Session) */
            <div id="tour-claim-urgent-banner" className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 p-[1.5px] shadow-md hover:shadow-lg transition-shadow">
              <div className="w-full rounded-[15px] bg-[#F7FDF9] p-4 sm:p-6 flex flex-col gap-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.4]" />
                      SESI AMAN • TANPA BATAS WAKTU
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✨ Sesi Arsip Permanen
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500">
                    Kebijakan 3 Hari Tidak Berlaku untuk Sesi Ini
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2">
                    Klaim & Simpan Sesi Ini ke Akun Kamu! 📸
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Sesi ini dibuat sebelum kebijakan batas waktu 3 hari diberlakukan, sehingga foto kamu aman. <strong>Login atau daftar akun Sebooth kamu sekarang</strong> untuk mengklaim sesi ini agar fotomu tersimpan rapi di galeri profil kamu selamanya!
                  </p>
                </div>

                {/* Direct Claim Action Buttons */}
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  {user ? (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengklaim ke Akun...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 stroke-[2.2]" />
                          <span>Klaim ke Akun Saya Sekarang ({user.email?.split('@')[0]})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
                      <button
                        onClick={() => router.push(`/login?claim=${sessionId}`)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black tracking-wide shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Masuk & Klaim Sekarang</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                      </button>

                      <button
                        onClick={() => router.push(`/register?claim=${sessionId}`)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-emerald-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Daftar Akun Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : expiryInfo.isExpired ? (
            /* Unclaimed Session AFTER Policy Date AND EXPIRED (> 3 days) */
            <div id="tour-claim-urgent-banner" className="w-full rounded-2xl bg-rose-50 border border-rose-200 p-4 sm:p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.4]" />
                  BATAS KLAIM 3 HARI BERAKHIR
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-100/70 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  Sesi Melewati Batas Simpan Sementara
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-sans">
                  Sesi Ini Belum Diklaim & Melewati Batas Waktu ⚠️
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Sesi ini dibuat lebih dari 3 hari yang lalu dan belum sempat diklaim ke akun Sebooth. Kamu tetap dapat mengunduh softfile yang ada di bawah sekarang sebelum server melakukan pembersihan berkala.
                </p>
              </div>
            </div>
          ) : (
            /* Unclaimed Session AFTER Policy Date AND ACTIVE (< 3 days): High-Impact Urgency Countdown */
            <div id="tour-claim-urgent-banner" className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-[1.5px] shadow-md hover:shadow-lg transition-shadow">
              <div className="w-full rounded-[15px] bg-[#FFFBF5] p-4 sm:p-6 flex flex-col gap-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-orange-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3.5 h-3.5 stroke-[2.4]" />
                      FOTO AKAN HILANG OTOMATIS
                    </span>
                    <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      ⏱️ Sisa Waktu: {expiryInfo.timeString}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500">
                    Batas Penyimpanan Server: 3 Hari
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2">
                    Klaim Sesi Ini Sekarang dengan Login / Sign Up! 🚨
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Foto & video di sesi ini hanya disimpan sementara. <strong>Segera login atau daftar akun Sebooth kamu sekarang</strong> untuk mengklaim sesi ini agar tersimpan permanen. <span className="text-rose-600 font-bold">Kalo nggak diklaim, semua foto kamu bakalan hilang terhapus otomatis dari server!</span>
                  </p>
                </div>

                {/* Direct Claim Action Buttons */}
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  {user ? (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-black tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengklaim ke Akun...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 stroke-[2.2]" />
                          <span>Klaim ke Akun Saya Sekarang ({user.email?.split('@')[0]})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
                      <button
                        onClick={() => router.push(`/login?claim=${sessionId}`)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-black tracking-wide shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Masuk / Login & Klaim Sekarang</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                      </button>
                      <button
                        onClick={() => router.push(`/register?claim=${sessionId}`)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-orange-50 border-2 border-orange-500 text-orange-700 text-xs sm:text-sm font-black tracking-wide active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                        Daftar Akun Baru (Sign Up)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─── 2. HERO SECTION & SESSION IDENTITY ─── */}
        <section className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500 text-white shadow-md mb-3 group hover:scale-105 transition-transform">
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            Foto Sesi Kamu Sudah Siap! 🎉
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Ditemukan <strong className="text-slate-900">{mediaList.length} file</strong> dari sesi di{' '}
            <strong className="text-orange-600 font-bold">{session.event_name || 'Sebooth Studio'}</strong>
            {formattedDate ? ` • ${formattedDate}` : ''}.
          </p>

          {/* ─── PRIMARY DOWNLOAD ACTION: 1-TAP SAVE ALL TO GALLERY ─── */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="tour-claim-bundle-btn"
              onClick={handleDownloadBundle}
              disabled={isBundling || mediaList.length === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all cursor-pointer border ${
                isBundling
                  ? 'bg-slate-800 text-slate-300 border-slate-700 cursor-wait'
                  : 'bg-slate-950 hover:bg-slate-900 text-white border-slate-900 hover:shadow-xl'
              }`}
              title="Download Beruntun Semua Foto & Video Sesi Ini Langsung ke Galeri HP"
            >
              {isBundling ? (
                <>
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                  <span>
                    Menyimpan ke Galeri ({bundleProgress.current}/{bundleProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>SIMPAN SEMUA KE GALERI ({mediaList.length} FILE)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ─── 3. MOBILE LONG-PRESS HINT BAR ─── */}
        <div id="tour-claim-tip-banner" className="w-full py-2.5 px-4 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-[11px] sm:text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold">💡 Tips HP:</span>
            <span>Tekan & tahan (long-press) foto/video untuk simpan via menu HP, atau klik tombol download.</span>
          </div>
        </div>

        {/* ─── 4. MEDIA GALLERY GRID ─── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-sans">
              Semua Foto & Media ({mediaList.length})
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              Ketuk untuk perbesar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4.5">
            {mediaList.map((item, idx) => {
              const isVideo = item.type === 'video'
              const isStrip = item.type === 'strip'

              return (
                <div
                  key={item.id}
                  id={idx === 0 ? 'tour-claim-first-media' : undefined}
                  onClick={() => setPreviewMedia(item)}
                  className={`group relative rounded-2xl overflow-hidden bg-zinc-950 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center select-auto ${
                    isStrip ? 'aspect-[2/3] row-span-1' : 'aspect-[3/4]'
                  }`}
                  style={{
                    WebkitTouchCallout: 'default'
                  }}
                >
                  {/* Media Rendering */}
                  {isVideo ? (
                    <video
                      src={item.url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 pointer-events-auto"
                      style={{ WebkitTouchCallout: 'default' }}
                    />
                  ) : (
                    <img
                      src={item.displayUrl}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 select-auto pointer-events-auto"
                      style={{ WebkitTouchCallout: 'default' }}
                      loading="lazy"
                      decoding="async"
                    />
                  )}

                  {/* Top-Left Media Type Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide border border-white/15 shadow-sm">
                      {item.label}
                    </span>
                  </div>

                  {/* Top-Right Quick Download Icon Button */}
                  <button
                    onClick={(e) => handleDownloadSingle(e, item, idx)}
                    className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                    title={`Download ${item.label} (HD)`}
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>

                  {/* Bottom Hover Preview Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <Eye className="w-3 h-3 stroke-[2.4]" />
                      Lihat Detail
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* ─── 5. LIGHTBOX DETAIL PREVIEW MODAL ─── */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-zinc-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col items-center"
          >
            {/* Top Modal Controls */}
            <div className="w-full flex items-center justify-between p-4 bg-zinc-900/80 border-b border-white/10 z-20">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                {previewMedia.label}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    const idx = mediaList.findIndex(m => m.url === previewMedia.url)
                    handleDownloadSingle(e, previewMedia, idx >= 0 ? idx : 0)
                  }}
                  className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center p-3 overflow-hidden">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  autoPlay
                  controls
                  playsInline
                  className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain select-auto pointer-events-auto"
                />
              ) : (
                <img
                  src={previewMedia.displayUrl || previewMedia.url}
                  alt={previewMedia.label}
                  className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain select-auto pointer-events-auto"
                  style={{ WebkitTouchCallout: 'default' }}
                />
              )}
            </div>

            {/* Bottom Hint */}
            <div className="w-full p-3 bg-zinc-900/80 border-t border-white/10 text-center text-zinc-400 text-[11px]">
              Tahan (long-press) foto untuk simpan langsung ke HP, atau klik tombol Download di atas
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="text-center py-6 mt-auto border-t border-slate-200/60 bg-white">
        <p className="text-[11px] text-slate-400 font-medium">
          © 2026 Sebooth Indonesia &bull; Digital Photobooth Experience
        </p>
      </footer>

      {/* Interactive Phase-by-Phase Tour */}
      <InteractiveTour
        steps={claimTourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        tourKey="hasSeenClaimTour_v1"
      />

    </div>
  )
}
