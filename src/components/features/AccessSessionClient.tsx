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
      <div className="flex min-h-[100svh] flex-col items-center justify-center bg-fluid-gradient paper-texture p-6 text-center">
        <div className="h-16 w-16 bg-red-200 border-2 border-black flex items-center justify-center mb-5 hard-shadow-black">
          <XCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-tight">Oops!</h1>
        <p className="mt-2 text-primary/60 font-bold text-sm md:text-base">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 bg-primary hover:bg-primary/90 text-white font-black text-sm md:text-base uppercase tracking-wider border-4 border-black py-4 px-8 active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-fluid-gradient paper-texture p-4 md:p-12 flex flex-col">
      <div className="mx-auto max-w-4xl w-full flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center bg-white border-2 border-black text-primary hard-shadow-black">
            <Camera className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <h1 className="mt-6 md:mt-8 text-[1.8rem] md:text-[2.5rem] lg:text-[3rem] font-black text-primary uppercase tracking-tight leading-none">
            Yeay! Kenanganmu Siap.
          </h1>
          <p className="mt-3 md:mt-4 text-primary/60 font-bold text-sm md:text-base uppercase tracking-wider">
            Ditemukan {session.media?.length || 0} media dari sesi di <span className="font-black text-secondary">{session.event_name || 'Sebooth Studio'}</span>.
          </p>
        </motion.div>

        {/* Preview Grid */}
        <div className="mt-10 md:mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {session.media?.map((item: MediaItem, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden bg-white border-4 border-black hard-shadow-black transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              {item.type === 'live' || item.type === 'video' ? (
                <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover transition-transform duration-75 group-hover:scale-105" />
              ) : (
                <Image
                  src={item.url}
                  alt={`Sebooth ${item.type}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-75 group-hover:scale-105"
                />
              )}
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-white border-2 border-black px-2 py-1 text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)]">
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
          className="mt-12 bg-white border-4 border-black p-6 md:p-10 text-center text-primary shadow-[8px_8px_0px_rgba(0,0,0,1)] relative"
        >
          {claimSuccess ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4 py-4">
              <div className="mx-auto h-16 w-16 bg-green-200 border-2 border-black flex items-center justify-center hard-shadow-black">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Foto Sudah Di Klaim ✓</h2>
              <p className="text-primary/60 font-bold text-sm md:text-base">Mengalihkan ke galeri pribadimu...</p>
              <button
                onClick={() => router.push('/profile')}
                className="mt-4 bg-secondary hover:bg-secondary/90 text-white font-black text-sm md:text-base uppercase tracking-wider border-4 border-black py-4 px-8 active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
              >
                Lihat My Photos
              </button>
            </motion.div>
          ) : alreadyClaimed ? (
            <div className="space-y-4 py-4">
              <div className="mx-auto h-16 w-16 bg-red-200 border-2 border-black flex items-center justify-center hard-shadow-black">
                <XCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Sudah Diklaim</h2>
              <p className="text-primary/60 font-bold text-sm">Maaf, sesi foto ini sudah diklaim oleh pengguna lain.</p>
            </div>
          ) : isClaiming ? (
            <div className="space-y-4 py-4">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary">Mengklaim foto...</h2>
            </div>
          ) : user ? (
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary">
                Hai <span className="text-secondary">{user.email?.split('@')[0]}</span>!
              </h2>
              <p className="text-primary/60 font-bold text-sm md:text-base max-w-xl mx-auto">
                Klik tombol di bawah untuk memasukkan sesi ini ke akunmu.
              </p>
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-white font-black text-sm md:text-base uppercase tracking-wider border-4 border-black py-4 px-8 active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:bg-gray-300"
              >
                Klaim Sekarang! 🚀
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary">Simpan Selamanya?</h2>
              <p className="mt-3 text-primary/60 font-bold text-sm md:text-base max-w-xl mx-auto">
                Buat akun Sebooth sekarang untuk menyimpan foto-foto ini selamanya.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => router.push(`/register?claim=${sessionId}`)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-black text-sm md:text-base uppercase tracking-wider border-4 border-black py-4 px-8 active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none transition-all sm:w-auto"
                >
                  Daftar Sekarang
                </button>
                <button
                  onClick={() => router.push(`/login?claim=${sessionId}`)}
                  className="w-full bg-white hover:bg-gray-100 text-primary font-black text-sm md:text-base uppercase tracking-wider border-4 border-black py-4 px-8 active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none transition-all sm:w-auto"
                >
                  Sudah Punya Akun
                </button>
              </div>
            </>
          )}
        </motion.div>

        <footer className="text-center py-8 mt-auto">
          <p className="text-[0.6rem] text-primary/40 font-black uppercase tracking-widest">
            © 2026 Sebooth Indonesia
          </p>
        </footer>
      </div>
    </div>
  )
}
