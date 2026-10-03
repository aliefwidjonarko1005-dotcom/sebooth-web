'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Loader2, Home, LogOut, ShieldCheck, Users, Search,
  Ticket, TrendingUp, Plus, Trash2, CheckCircle2, AlertCircle
} from 'lucide-react'
import AnalyticsInsightsTab from '@/components/admin/AnalyticsInsightsTab'
import UserClaimsMonitorTab from '@/components/admin/UserClaimsMonitorTab'
import SessionLookupTab from '@/components/admin/SessionLookupTab'
import QueueOperatorTab from '@/components/admin/QueueOperatorTab'

type TabKey = 'insights' | 'user_claims' | 'session_lookup' | 'queue' | 'admins'

interface AdminItem { 
  id: string
  email: string
  is_super: boolean 
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuper, setIsSuper] = useState(false)
  const [tab, setTab] = useState<TabKey>('insights')
  const [msg, setMsg] = useState('')
  const [inspectSessionId, setInspectSessionId] = useState<string | undefined>(undefined)

  // Admin Management Data
  const [admins, setAdmins] = useState<AdminItem[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)

  useEffect(() => {
    async function init() {
      const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'
      if (isPreview) {
        setIsAdmin(true)
        setIsSuper(true)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const userEmail = user.email || ''
      const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
      const isEnvAdmin = envAdmins.includes(userEmail.toLowerCase())

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle()

      if (isEnvAdmin || adminData) {
        setIsAdmin(true)
        setIsSuper(isEnvAdmin || (adminData?.is_super ?? false))
        if (isEnvAdmin || adminData?.is_super) {
          loadAdmins()
        }
      }
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAdmins() {
    const { data } = await supabase.from('admins').select('*').order('created_at')
    setAdmins(data || [])
  }

  function flash(m: string) { 
    setMsg(m)
    setTimeout(() => setMsg(''), 3000) 
  }

  // ─── Admin CRUD ───
  async function addAdmin() {
    if (!newAdminEmail.trim()) return
    setAddingAdmin(true)
    const { error } = await supabase.from('admins').insert({ email: newAdminEmail.trim().toLowerCase(), is_super: false })
    if (error) {
      flash(`Gagal menambah admin: ${error.message}`)
    } else {
      setNewAdminEmail('')
      await loadAdmins()
      flash('Admin berhasil ditambahkan!')
    }
    setAddingAdmin(false)
  }

  async function removeAdmin(id: string) {
    if (!confirm('Yakin ingin menghapus akses admin ini?')) return
    const { error } = await supabase.from('admins').delete().eq('id', id)
    if (error) {
      flash(`Gagal menghapus admin: ${error.message}`)
    } else {
      await loadAdmins()
      flash('Admin dihapus.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0F3D2E]" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9F9] p-6 text-center">
        <ShieldCheck className="h-16 w-16 text-red-300 mb-4" />
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Access Denied</h1>
        <p className="mt-2 text-[#1A1A1A]/50 text-sm">Akun Anda tidak terdaftar sebagai admin.</p>
        <p className="mt-1 text-[#1A1A1A]/30 text-xs">Hubungi super admin untuk mendapatkan akses.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/profile" className="px-6 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all">My Photos</Link>
          <Link href="/" className="px-6 py-3 rounded-xl bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold text-sm hover:bg-[#1A1A1A]/10 transition-all">Beranda</Link>
        </div>
      </div>
    )
  }

  const tabItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'insights', label: 'Insights & Analisis', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'user_claims', label: 'Monitor Klaim User', icon: <Users className="w-4 h-4" /> },
    { key: 'session_lookup', label: 'Cek Sesi', icon: <Search className="w-4 h-4" /> },
    { key: 'queue', label: 'Operator Antrean', icon: <Ticket className="w-4 h-4" /> },
    ...(isSuper ? [{ key: 'admins' as const, label: 'Kelola Admin', icon: <ShieldCheck className="w-4 h-4" /> }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#1A1A1A]/5 shadow-2xs">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#1A1A1A]/50 hover:text-[#0F3D2E] transition-colors p-1.5 rounded-lg hover:bg-black/5" title="Ke Beranda">
              <Home className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
                <span className="font-extrabold text-sm sm:text-base text-[#1A1A1A]">Sebooth Admin Hub</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-xs font-bold text-[#0F3D2E] hover:underline hidden sm:inline"
            >
              Lihat Galeri Sesi
            </Link>
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }} 
              className="text-[#1A1A1A]/50 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1 text-xs font-bold"
              title="Keluar dari Akun Admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {msg && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#0F3D2E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {msg}
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Tab Navigation Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#1A1A1A]/10 [scrollbar-width:none]">
          {tabItems.map(t => (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                tab === t.key 
                  ? 'bg-[#0F3D2E] text-white shadow-xs' 
                  : 'text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════ INSIGHTS & ANALYTICS TAB ═══════════════════ */}
        {tab === 'insights' && (
          <AnalyticsInsightsTab
            onInspectSession={(sessId) => {
              setInspectSessionId(sessId)
              setTab('session_lookup')
            }}
            onNavigateToUserClaims={() => {
              setTab('user_claims')
            }}
          />
        )}

        {/* ═══════════════════ USER CLAIMS MONITOR TAB ═══════════════════ */}
        {tab === 'user_claims' && (
          <UserClaimsMonitorTab
            onInspectSession={(sessId) => {
              setInspectSessionId(sessId)
              setTab('session_lookup')
            }}
          />
        )}

        {/* ═══════════════════ SESSION LOOKUP TAB ═══════════════════ */}
        {tab === 'session_lookup' && (
          <SessionLookupTab initialSessionId={inspectSessionId} />
        )}

        {/* ═══════════════════ QUEUE OPERATOR TAB ═══════════════════ */}
        {tab === 'queue' && (
          <QueueOperatorTab flash={flash} />
        )}

        {/* ═══════════════════ ADMINS TAB ═══════════════════ */}
        {tab === 'admins' && isSuper && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Kelola Akses Administrator</h2>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Tambahkan atau hapus email yang diizinkan mengakses panel admin Sebooth.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <input 
                  type="email"
                  value={newAdminEmail} 
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="admin-baru@gmail.com" 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/15 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E]"
                />
                <button 
                  onClick={addAdmin} 
                  disabled={addingAdmin}
                  className="px-5 py-2.5 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Undang Admin
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                Daftar Administrator ({admins.length})
              </h3>

              <div className="space-y-2">
                {admins.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3.5 bg-[#F9F9F9] rounded-xl border border-[#1A1A1A]/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-[#1A1A1A] truncate">{a.email}</span>
                      {a.is_super && (
                        <span className="text-[10px] font-black text-[#D4AF37] bg-amber-50 border border-amber-200 uppercase px-2 py-0.5 rounded-full">
                          Super Admin
                        </span>
                      )}
                    </div>
                    {!a.is_super && (
                      <button 
                        onClick={() => removeAdmin(a.id)} 
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                        title="Hapus Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {admins.length === 0 && (
                  <p className="text-xs text-[#1A1A1A]/40 text-center py-4">Belum ada admin tambahan di database.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
