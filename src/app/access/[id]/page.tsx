'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Download, LayoutGrid, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'
import { User } from '@supabase/supabase-js'

export default function AccessSessionPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [supabase])

  useEffect(() => {
    async function fetchSession() {
      if (!id) return
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*, media(*)')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching session:', error)
        setError('Session tidak ditemukan atau link sudah kedaluwarsa.')
      } else {
        setSession(data)
        // If session is already claimed and user is NOT the owner, show error
        if (data.user_id && user && data.user_id !== user.id) {
            setError('Maaf, sesi ini sudah diklaim oleh orang lain.')
        }
      }
      setLoading(false)
    }

    fetchSession()
  }, [id, supabase, user])

  const handleAutoClaim = async () => {
    if (!user || !session) return
    setIsClaiming(true)
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          user_id: user.id,
          is_claimed: true 
        })
        .eq('id', id)

      if (error) throw error
      setClaimSuccess(true)
      setTimeout(() => router.push('/profile'), 1500)
    } catch (err) {
      console.error('Auto-claim error:', err)
      setError('Gagal mengklaim sesi. Silakan coba lagi.')
    } finally {
      setIsClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 uppercase tracking-[0.2em] text-[10px] font-black group">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 transition-transform group-hover:scale-110" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Oops! Adalah Masalah.</h1>
        <p className="mt-2 text-gray-500 font-medium italic">{error || 'Maaf, terjadi kesalahan.'}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-8 rounded-2xl bg-gray-900 px-8 py-4 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-blue-100 text-blue-600 shadow-inner">
            <Camera className="h-8 w-8" />
          </div>
          <h1 className="mt-8 text-4xl font-black text-gray-900 md:text-6xl tracking-tighter">Yeay! Kenanganmu Siap.</h1>
          <p className="mt-4 text-gray-500 font-medium italic text-lg">
            Ditemukan {session.media?.length || 0} media dari sesi di <span className="font-black text-blue-600 not-italic uppercase tracking-wider">{session.event_name || 'Sebooth Studio'}</span>.
          </p>
        </motion.div>

        {/* Preview Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {session.media?.map((item: MediaItem, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-white shadow-xl ring-1 ring-gray-900/5 transition-all hover:shadow-2xl"
            >
              {item.type === 'video' ? (
                <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <img src={item.url} alt={`Sebooth ${item.type}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between opacity-0 transition-all translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="rounded-xl bg-black/50 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md uppercase tracking-widest">
                  {item.type}
                </span>
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-900 shadow-xl">
                    <Download className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Claim CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 rounded-[3rem] bg-blue-600 p-8 text-center text-white shadow-2xl md:p-16 relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          
          {claimSuccess ? (
             <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4 py-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                    <LayoutGrid className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-black italic">Berhasil Diklaim!</h2>
                <p className="text-blue-100 font-medium">Beralih ke dashboard kamu...</p>
             </motion.div>
          ) : session.user_id && user?.id === session.user_id ? (
            <div className="space-y-6 py-4">
                <h2 className="text-3xl font-black italic">Sesi Ini Milik Kamu 🎯</h2>
                <p className="text-blue-100 text-lg max-w-xl mx-auto font-medium">
                    Kamu sudah mengklaim sesi ini. Ingin melihat semua koleksi fotomu?
                </p>
                <button 
                onClick={() => router.push('/profile')}
                className="rounded-2xl bg-white px-10 py-4 text-lg font-black text-blue-600 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                    Lihat Koleksi Saya
                </button>
            </div>
          ) : user ? (
            <div className="space-y-8">
              <h2 className="text-3xl font-black md:text-5xl italic tracking-tight">Hai {user.email?.split('@')[0]}!</h2>
              <p className="mt-4 text-blue-100 text-lg max-w-xl mx-auto font-medium">
                Klik tombol di bawah untuk memasukkan sesi ini ke akunmu sekarang.
              </p>
              <button 
                onClick={handleAutoClaim}
                disabled={isClaiming}
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-xl font-black text-blue-600 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:bg-white/50"
              >
                {isClaiming ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Klaim Sekarang! 🚀'}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black md:text-5xl italic tracking-tight leading-[0.9]">Simpan Selamanya?</h2>
              <p className="mt-6 text-blue-100 text-lg max-w-xl mx-auto font-medium">
                Buat akun Sebooth sekarang untuk menyimpan foto-foto ini selamanya dan akses kapan saja.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button 
                  onClick={() => router.push(`/register?claim=${id}`)}
                  className="w-full rounded-2xl bg-white px-10 py-5 text-lg font-black text-blue-600 shadow-xl transition-all hover:scale-105 active:scale-95 sm:w-auto"
                >
                  Daftar Sekarang
                </button>
                <button 
                  onClick={() => router.push(`/login?claim=${id}`)}
                  className="w-full rounded-2xl bg-white/10 px-10 py-5 text-lg font-black text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 sm:w-auto"
                >
                  Sudah Punya Akun
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer info */}
        <p className="mt-12 text-center text-sm text-gray-400">
          © 2026 Sebooth Indonesia. Link ini akan kedaluwarsa dalam 24 jam jika tidak diklaim.
        </p>
      </div>
    </div>
  )
}
