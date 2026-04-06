'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Download, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { claimSession } from '@/app/actions'

interface AccessSessionClientProps {
  session: SessionData;
  sessionId: string;
}

export default function AccessSessionClient({ session: initialSession, sessionId }: AccessSessionClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const claimAttempted = useRef(false)

  const [user, setUser] = useState<User | null>(null)
  const [session] = useState<SessionData>(initialSession)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)

  // 1. Check auth
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()
  }, [supabase])

  // 2. Check claim status once we have both user and session
  useEffect(() => {
    if (!user || !session) return
    
    if (session.is_claimed && session.user_id && session.user_id !== user.id) {
      setAlreadyClaimed(true)
    }
    if (session.is_claimed && session.user_id && session.user_id === user.id) {
      setClaimSuccess(true)
    }
  }, [user, session])

  // 3. Auto-claim when user is logged in and session is unclaimed
  useEffect(() => {
    if (user && session && !session.is_claimed && !claimAttempted.current && !isClaiming) {
      claimAttempted.current = true
      handleClaim()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session])

  const handleClaim = async () => {
    if (!user || !session) return
    setIsClaiming(true)

    try {
      const res = await claimSession(sessionId)

      if (!res.success) throw new Error(res.error || 'Gagal mengklaim sesi')
      
      setClaimSuccess(true)
      setTimeout(() => router.push('/profile'), 2000)
    } catch (err: any) {
      console.error('Claim error:', err)
      setError(err.message || 'Gagal mengklaim sesi. Silakan coba lagi.')
    } finally {
      setIsClaiming(false)
    }
  }

  if (error) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <XCircle className="h-12 w-12 md:h-16 md:w-16 text-red-400 mb-4" />
        <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">Oops!</h1>
        <p className="mt-2 text-gray-500 font-medium text-sm md:text-base">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-2xl bg-gray-900 px-8 py-4 font-black text-white shadow-xl active:scale-95 transition-all min-h-[48px]"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-gray-50 p-4 md:p-12">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-[1.25rem] bg-blue-100 text-blue-600 shadow-inner">
            <Camera className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <h1 className="mt-6 md:mt-8 text-3xl md:text-4xl font-black text-gray-900 lg:text-6xl tracking-tighter">Yeay! Kenanganmu Siap.</h1>
          <p className="mt-3 md:mt-4 text-gray-500 font-medium italic text-base md:text-lg">
            Ditemukan {session.media?.length || 0} media dari sesi di <span className="font-black text-blue-600 not-italic uppercase tracking-wider">{session.event_name || 'Sebooth Studio'}</span>.
          </p>
        </motion.div>

        {/* Preview Grid */}
        <div className="mt-10 md:mt-16 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {session.media?.map((item: MediaItem, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-white shadow-xl ring-1 ring-gray-900/5 transition-all hover:shadow-2xl"
            >
              {item.type === 'live' || item.type === 'video' ? (
                <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <Image
                  src={item.url}
                  alt={`Sebooth ${item.type}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between opacity-0 transition-all translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="rounded-xl bg-black/50 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md uppercase tracking-widest">
                  {item.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Claim CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 md:mt-20 rounded-[2rem] md:rounded-[3rem] bg-blue-600 p-6 md:p-8 text-center text-white shadow-2xl lg:p-16 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          {claimSuccess ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4 py-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black">Foto Sudah Di Klaim ✓</h2>
              <p className="text-blue-100 font-medium text-sm md:text-base">Mengalihkan ke galeri pribadimu...</p>
              <button
                onClick={() => router.push('/profile')}
                className="mt-4 rounded-2xl bg-white px-8 py-4 text-base md:text-lg font-black text-blue-600 shadow-xl active:scale-95 transition-all min-h-[48px]"
              >
                Lihat My Photos
              </button>
            </motion.div>
          ) : alreadyClaimed ? (
            <div className="space-y-4 py-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-red-400/20 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-black">Sudah Diklaim</h2>
              <p className="text-blue-100 font-medium">Maaf, sesi foto ini sudah diklaim oleh pengguna lain.</p>
            </div>
          ) : isClaiming ? (
            <div className="space-y-4 py-4">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-white" />
              <h2 className="text-2xl font-black">Mengklaim foto...</h2>
            </div>
          ) : user ? (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-black lg:text-5xl italic tracking-tight">Hai {user.email?.split('@')[0]}!</h2>
              <p className="mt-3 md:mt-4 text-blue-100 text-base md:text-lg max-w-xl mx-auto font-medium">
                Klik tombol di bawah untuk memasukkan sesi ini ke akunmu.
              </p>
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl font-black text-blue-600 shadow-xl active:scale-95 transition-all disabled:bg-white/50 min-h-[48px]"
              >
                Klaim Sekarang! 🚀
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-black lg:text-5xl italic tracking-tight leading-[0.9]">Simpan Selamanya?</h2>
              <p className="mt-4 md:mt-6 text-blue-100 text-base md:text-lg max-w-xl mx-auto font-medium">
                Buat akun Sebooth sekarang untuk menyimpan foto-foto ini selamanya.
              </p>
              <div className="mt-8 md:mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={() => router.push(`/register?claim=${sessionId}`)}
                  className="w-full rounded-2xl bg-white px-8 py-4 md:px-10 md:py-5 text-base md:text-lg font-black text-blue-600 shadow-xl active:scale-95 transition-all sm:w-auto min-h-[48px]"
                >
                  Daftar Sekarang
                </button>
                <button
                  onClick={() => router.push(`/login?claim=${sessionId}`)}
                  className="w-full rounded-2xl bg-white/10 px-8 py-4 md:px-10 md:py-5 text-base md:text-lg font-black text-white backdrop-blur-md border border-white/20 active:bg-white/20 transition-all sm:w-auto min-h-[48px]"
                >
                  Sudah Punya Akun
                </button>
              </div>
            </>
          )}
        </motion.div>

        <p className="mt-12 text-center text-sm text-gray-400">
          © 2026 Sebooth Indonesia.
        </p>
      </div>
    </div>
  )
}
