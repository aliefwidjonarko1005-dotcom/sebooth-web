'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Download, LayoutGrid, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function AccessSessionPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      }
      setLoading(false)
    }

    fetchSession()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Oops!</h1>
        <p className="mt-2 text-gray-600">{error || 'Maaf, terjadi kesalahan.'}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-6 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Kembali ke Home
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
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
            <Camera className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-gray-900 md:text-5xl">Yeay! Foto Kamu Siap.</h1>
          <p className="mt-4 text-lg text-gray-600">
            Ditemukan {session.media?.length || 0} media dari sesi kamu di <span className="font-bold text-blue-600">{session.event_name || 'Sebooth Studio'}</span>.
          </p>
        </motion.div>

        {/* Preview Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {session.media?.map((item: any, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-900/5"
            >
              {item.type === 'video' ? (
                <video src={item.url} muted loop autoPlay className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <img src={item.url} alt="Sebooth Photo" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-all translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md uppercase tracking-wider italic">
                  {item.type}
                </span>
                <Download className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Claim CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 rounded-[2.5rem] bg-blue-600 p-8 text-center text-white shadow-2xl md:p-12"
        >
          <h2 className="text-2xl font-bold md:text-3xl">Pindahkan ke Galeri Permanen?</h2>
          <p className="mt-4 text-blue-100 text-lg max-w-xl mx-auto">
            Buat akun Sebooth sekarang untuk menyimpan foto-foto ini selamanya dan akses dari perangkat apa pun kapan pun kamu mau.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={() => router.push(`/register?claim=${id}`)}
              className="w-full rounded-2xl bg-white px-8 py-4 text-lg font-black text-blue-600 shadow-xl transition-all hover:scale-105 active:scale-95 sm:w-auto"
            >
              Daftar Sekarang
            </button>
            <button 
              onClick={() => router.push(`/login?claim=${id}`)}
              className="w-full rounded-2xl bg-blue-500/30 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-blue-500/40 sm:w-auto"
            >
              Sudah Punya Akun
            </button>
          </div>
        </motion.div>

        {/* Footer info */}
        <p className="mt-12 text-center text-sm text-gray-400">
          © 2026 Sebooth Indonesia. Link ini akan kedaluwarsa dalam 24 jam jika tidak diklaim.
        </p>
      </div>
    </div>
  )
}
