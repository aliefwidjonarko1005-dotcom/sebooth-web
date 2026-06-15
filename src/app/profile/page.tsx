'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Loader2, Grid, Home, LayoutGrid, List, ShieldCheck, Users, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { SessionData, QueueTicket } from '@/types/database'
import ActiveQueueCard from '@/components/queue/ActiveQueueCard'
import SessionFeedCard from '@/components/profile/SessionFeedCard'
import GalleryGrid from '@/components/profile/GalleryGrid'

type ViewMode = 'feed' | 'gallery'
type SessionScope = 'mine' | 'all'

const PAGE_SIZE = 10

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('feed')
  const [activeTickets, setActiveTickets] = useState<QueueTicket[]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [sessionScope, setSessionScope] = useState<SessionScope>('mine')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // ─── Fetch a page of sessions ───
  const fetchSessions = useCallback(async (
    scope: SessionScope,
    userId: string,
    offset: number,
    append: boolean
  ) => {
    let query = supabase
      .from('sessions')
      .select('*, media(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (scope === 'mine') {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (!error && data) {
      if (append) {
        setSessions(prev => [...prev, ...data])
      } else {
        setSessions(data)
      }
      setHasMore(data.length === PAGE_SIZE)
    } else {
      setHasMore(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setCurrentUserId(user.id)

      // ─── Check if user is super admin ───
      const userEmail = user.email || ''
      const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
      const isEnvSuperAdmin = envAdmins.includes(userEmail.toLowerCase())

      let superAdmin = isEnvSuperAdmin
      if (!isEnvSuperAdmin) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('is_super')
          .eq('email', userEmail)
          .maybeSingle()
        if (adminData?.is_super) superAdmin = true
      }
      setIsSuperAdmin(superAdmin)

      // ─── Fetch first page of sessions ───
      await fetchSessions('mine', user.id, 0, false)

      // Fetch active queue tickets
      const { data: ticketsData } = await supabase
        .from('queue_tickets')
        .select('*, queue_events(*)')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'called', 'in_session'])
        .order('created_at', { ascending: false })

      if (ticketsData) {
        const validTickets = ticketsData.filter(t => t.queue_events?.is_active)
        setActiveTickets(validTickets)
      }

      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Refetch sessions when scope changes ───
  useEffect(() => {
    if (!currentUserId || loading) return
    setSessions([])
    setHasMore(true)
    fetchSessions(sessionScope, currentUserId, 0, false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionScope])

  // ─── Infinite scroll: observe sentinel ───
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && currentUserId) {
          setLoadingMore(true)
          fetchSessions(sessionScope, currentUserId, sessions.length, true)
            .then(() => setLoadingMore(false))
        }
      },
      { rootMargin: '400px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, sessions.length, sessionScope, currentUserId])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fluid-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-fluid-gradient paper-texture flex flex-col">
      {/* ═══ Top Navigation Bar ═══ */}
      <nav className="sticky top-0 z-50 bg-primary border-b-2 border-black safe-top">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Home + Gallery toggle */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 text-white/80 hover:text-white transition-none"
              title="Beranda"
            >
              <Home className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setViewMode(viewMode === 'feed' ? 'gallery' : 'feed')}
              className={`flex items-center justify-center w-10 h-10 transition-none ${
                viewMode === 'gallery' ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
              title={viewMode === 'feed' ? 'Gallery View' : 'Feed View'}
            >
              {viewMode === 'feed' ? (
                <LayoutGrid className="h-5 w-5" />
              ) : (
                <List className="h-5 w-5" />
              )}
            </button>
            {/* Super Admin: scope toggle */}
            {isSuperAdmin && (
              <button
                onClick={() => setSessionScope(sessionScope === 'mine' ? 'all' : 'mine')}
                className={`flex items-center justify-center w-10 h-10 transition-none ${
                  sessionScope === 'all' ? 'text-yellow-400' : 'text-white/50 hover:text-white/80'
                }`}
                title={sessionScope === 'mine' ? 'Lihat Semua Sesi (Admin)' : 'Lihat Sesi Saya'}
              >
                {sessionScope === 'all' ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          {/* Center: Title */}
          <div className="flex flex-col items-center">
            <h1 className="text-[0.95rem] font-black text-white uppercase tracking-widest marker-font">
              {sessionScope === 'all' ? 'ALL SESSIONS' : 'MY PHOTOS'}
            </h1>
            {isSuperAdmin && sessionScope === 'all' && (
              <span className="flex items-center gap-1 text-[0.55rem] font-bold text-yellow-400/80 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Super Admin
              </span>
            )}
          </div>

          {/* Right: Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 text-white/80 hover:text-white transition-none"
            title="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ═══ Super Admin: Scope Info Banner ═══ */}
      {isSuperAdmin && sessionScope === 'all' && (
        <div className="bg-yellow-400 border-b-2 border-black px-4 py-2 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span className="text-[0.7rem] font-black text-black uppercase tracking-wider">
            Menampilkan {sessions.length} sesi dari semua pengguna{hasMore ? '+' : ''}
          </span>
        </div>
      )}

      {/* ═══ Content ═══ */}
      {sessions.length === 0 && !loadingMore ? (
        /* ─── Empty State ─── */
        <div className="flex flex-col items-center justify-center text-center pt-20 px-6 flex-1">
          <div className="h-20 w-20 bg-white border-2 border-black hard-shadow-black flex items-center justify-center mb-5">
            <Grid className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-[1.6rem] font-black text-primary uppercase tracking-tight">
            Belum Ada Koleksi
          </h3>
          <p className="mt-2 text-primary/60 font-bold max-w-xs text-[0.8rem]">
            {sessionScope === 'all'
              ? 'Belum ada sesi foto dari pengguna manapun.'
              : 'Scan QR code di Sebooth untuk mulai mengisi galerimu!'}
          </p>
        </div>
      ) : (
        <main className="flex-1 pb-8">
          {/* Active Queue Tickets */}
          {activeTickets.length > 0 && sessionScope === 'mine' && (
            <div className="mx-4 mt-4">
              <div className="bg-primary border-2 border-black p-4 hard-shadow-blue">
                <ActiveQueueCard tickets={activeTickets} />
              </div>
            </div>
          )}

          {/* View Modes */}
          <AnimatePresence mode="wait">
            {viewMode === 'feed' ? (
              /* ─── Feed View ─── */
              <motion.div
                key="feed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="max-w-lg mx-auto px-4 pt-5"
              >
                {sessions.map((session, idx) => (
                  <SessionFeedCard
                    key={session.id}
                    session={session}
                    index={idx}
                    showOwner={sessionScope === 'all'}
                  />
                ))}
              </motion.div>
            ) : (
              /* ─── Gallery View ─── */
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="pt-4"
              >
                <GalleryGrid sessions={sessions} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Infinite Scroll Sentinel ─── */}
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            </div>
          )}
          {!hasMore && sessions.length > 0 && (
            <p className="text-center text-[0.6rem] font-bold text-primary/30 uppercase tracking-widest py-4">
              Semua sesi telah dimuat
            </p>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="text-center py-6 border-t-2 border-black bg-white mt-auto">
        <p className="text-[0.6rem] text-primary/40 font-black uppercase tracking-widest">
          Powered by Sebooth
        </p>
      </footer>
    </div>
  )
}
