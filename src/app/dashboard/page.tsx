'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  LogOut, 
  Grid, 
  Calendar, 
  MapPin, 
  Download, 
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserName(user.email?.split('@')[0] || 'User')
      fetchSessions(user.id)
    }

    checkUser()
  }, [router, supabase])

  async function fetchSessions(userId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, media(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch sessions error:', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">S</div>
            <span className="font-black text-2xl tracking-tighter text-gray-900">Sebooth</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-12">
        <header>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Halo, {userName}! 👋</h1>
          <p className="mt-2 text-gray-500 font-medium italic">Ini adalah galeri semua momen seru kamu di Sebooth.</p>
        </header>

        {sessions.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300">
              <Grid className="h-12 w-12" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">Belum Ada Koleksi</h3>
            <p className="mt-2 text-gray-500 max-w-xs">Gunakan Sebooth di event terdekat dan scan QR untuk mengisi galerimu!</p>
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {sessions.map((session) => (
              <section key={session.id} className="relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest mb-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">{session.event_name || 'Sebooth Studio Session'}</h2>
                  </div>
                  <button className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <Download className="h-4 w-4" /> Download Semua
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  <AnimatePresence>
                    {session.media?.map((item: MediaItem) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl ring-1 ring-gray-900/5"
                      >
                        {item.type === 'video' ? (
                          <video src={item.url} muted loop autoPlay className="h-full w-full object-cover" />
                        ) : (
                          <img src={item.url} alt={`Sebooth ${item.type}`} className="h-full w-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-3">
                            <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-900 shadow-xl hover:scale-110 transition-transform">
                                <Download className="h-5 w-5" />
                            </button>
                            <button className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                                <ExternalLink className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="absolute top-2 left-2">
                            <span className="rounded-lg bg-black/40 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-md uppercase tracking-wide">
                                {item.type}
                            </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Stats bar */}
      <footer className="mt-24 border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-12">
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sesi Selesai</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">{sessions.length}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Media</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">{sessions.reduce((acc, s) => acc + (s.media?.length || 0), 0)}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 font-medium italic italic">Teruslah menabung kenangan bersama Sebooth.</p>
        </div>
      </footer>
    </div>
  )
}
