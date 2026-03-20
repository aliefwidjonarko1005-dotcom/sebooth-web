'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Loader2, Home, LogOut, ShieldCheck, Users, Type, DollarSign, 
  Instagram, Newspaper, Plus, Trash2, Save, X
} from 'lucide-react'

type TabKey = 'content' | 'pricing' | 'instagram' | 'news' | 'admins'

interface ContentItem { id: string; section: string; key: string; value: string; }
interface IGPost { id: string; instagram_url: string; display_order: number; }
interface NewsItem { id: string; title: string; body: string; image_url: string; published: boolean; created_at: string; }
interface AdminItem { id: string; email: string; is_super: boolean; }

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuper, setIsSuper] = useState(false)
  const [tab, setTab] = useState<TabKey>('content')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Data
  const [content, setContent] = useState<ContentItem[]>([])
  const [igPosts, setIgPosts] = useState<IGPost[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [admins, setAdmins] = useState<AdminItem[]>([])

  // Forms
  const [newIgUrl, setNewIgUrl] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newNewsTitle, setNewNewsTitle] = useState('')
  const [newNewsBody, setNewNewsBody] = useState('')
  const [newNewsImage, setNewNewsImage] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const userEmail = user.email || ''
      console.log('Admin check for:', userEmail)

      // Primary check: env var (always works, no RLS issues)
      const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
      const isEnvAdmin = envAdmins.includes(userEmail.toLowerCase())

      // Secondary check: DB table (may fail due to RLS)
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle()

      console.log('Env admin:', isEnvAdmin, 'DB admin:', adminData)

      if (isEnvAdmin || adminData) {
        setIsAdmin(true)
        setIsSuper(isEnvAdmin || (adminData?.is_super ?? false))
        await loadAll()
      }
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAll() {
    const [c, ig, n, a] = await Promise.all([
      supabase.from('site_content').select('*').order('section').order('key'),
      supabase.from('instagram_posts').select('*').order('display_order'),
      supabase.from('news').select('*').order('created_at', { ascending: false }),
      supabase.from('admins').select('*').order('created_at'),
    ])
    setContent(c.data || [])
    setIgPosts(ig.data || [])
    setNews(n.data || [])
    setAdmins(a.data || [])
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  // ─── Content CRUD ───
  async function saveContent(item: ContentItem) {
    setSaving(true)
    await supabase.from('site_content').upsert({ 
      id: item.id, section: item.section, key: item.key, value: item.value, updated_at: new Date().toISOString() 
    })
    flash('Saved!')
    setSaving(false)
  }

  async function addContent(section: string, key: string) {
    await supabase.from('site_content').insert({ section, key, value: '' })
    await loadAll()
    flash('Added')
  }

  async function deleteContent(id: string) {
    await supabase.from('site_content').delete().eq('id', id)
    await loadAll()
    flash('Deleted')
  }

  // ─── Instagram CRUD ───
  async function addIG() {
    if (!newIgUrl) return
    await supabase.from('instagram_posts').insert({ instagram_url: newIgUrl, display_order: igPosts.length })
    setNewIgUrl('')
    await loadAll()
    flash('Instagram post added')
  }

  async function deleteIG(id: string) {
    await supabase.from('instagram_posts').delete().eq('id', id)
    await loadAll()
    flash('Deleted')
  }

  // ─── News CRUD ───
  async function addNews() {
    if (!newNewsTitle) return
    await supabase.from('news').insert({ title: newNewsTitle, body: newNewsBody, image_url: newNewsImage })
    setNewNewsTitle(''); setNewNewsBody(''); setNewNewsImage('')
    await loadAll()
    flash('News added')
  }

  async function deleteNews(id: string) {
    await supabase.from('news').delete().eq('id', id)
    await loadAll()
    flash('Deleted')
  }

  // ─── Admin CRUD ───
  async function addAdmin() {
    if (!newAdminEmail) return
    await supabase.from('admins').insert({ email: newAdminEmail, is_super: false })
    setNewAdminEmail('')
    await loadAll()
    flash('Admin invited')
  }

  async function removeAdmin(id: string) {
    await supabase.from('admins').delete().eq('id', id)
    await loadAll()
    flash('Admin removed')
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

  const sections = [...new Set(content.map(c => c.section))]

  const tabItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'content', label: 'Content', icon: <Type className="w-4 h-4" /> },
    { key: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { key: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
    ...(isSuper ? [{ key: 'admins' as const, label: 'Admins', icon: <Users className="w-4 h-4" /> }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#1A1A1A]/5">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#1A1A1A]/50 hover:text-[#0F3D2E] transition-colors"><Home className="w-5 h-5" /></Link>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
              <span className="font-bold text-sm text-[#1A1A1A]">Admin Panel</span>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-[#1A1A1A]/40 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Toast */}
      {msg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0F3D2E] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
          {msg}
        </div>
      )}

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Tab Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-8 border-b border-[#1A1A1A]/10">
          {tabItems.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.key ? 'bg-[#0F3D2E] text-white' : 'text-[#1A1A1A]/50 hover:bg-[#1A1A1A]/5'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT TAB */}
        {tab === 'content' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Site Content</h2>
              <div className="flex gap-2">
                {['hero', 'about', 'product', 'gallery', 'faq', 'location', 'testimonials'].map(s => (
                  <button key={s} onClick={() => addContent(s, `new_${Date.now()}`)}
                    className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]/50 hover:bg-[#0F3D2E]/10 hover:text-[#0F3D2E] transition-all">
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {sections.length === 0 && (
              <p className="text-[#1A1A1A]/40 text-sm py-10 text-center">Belum ada konten. Klik tombol section di atas untuk menambahkan.</p>
            )}

            {sections.map(section => (
              <div key={section} className="bg-white rounded-2xl p-6 border border-[#1A1A1A]/5">
                <h3 className="font-bold text-sm uppercase tracking-widest text-[#0F3D2E] mb-4">{section}</h3>
                <div className="space-y-4">
                  {content.filter(c => c.section === section).map(item => (
                    <div key={item.id} className="flex gap-3">
                      <input value={item.key} onChange={e => setContent(prev => prev.map(c => c.id === item.id ? { ...c, key: e.target.value } : c))}
                        className="w-40 px-3 py-2 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm font-bold text-[#1A1A1A]" placeholder="Key" />
                      <textarea value={item.value || ''} onChange={e => setContent(prev => prev.map(c => c.id === item.id ? { ...c, value: e.target.value } : c))}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm text-[#1A1A1A] resize-none" rows={2} placeholder="Value" />
                      <div className="flex flex-col gap-1">
                        <button onClick={() => saveContent(item)} disabled={saving} className="p-2 rounded-xl bg-[#0F3D2E] text-white hover:bg-[#195240] transition-all">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteContent(item.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRICING TAB */}
        {tab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Pricing Management</h2>
            <p className="text-sm text-[#1A1A1A]/50">Tambahkan item melalui tab Content dengan section &quot;pricing&quot;. Key = nama paket, Value = harga.</p>
            <button onClick={() => addContent('pricing', `package_${Date.now()}`)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all">
              <Plus className="w-4 h-4" /> Tambah Paket
            </button>

            <div className="bg-white rounded-2xl p-6 border border-[#1A1A1A]/5">
              {content.filter(c => c.section === 'pricing').length === 0 && (
                <p className="text-[#1A1A1A]/40 text-sm text-center py-4">Belum ada paket pricing.</p>
              )}
              {content.filter(c => c.section === 'pricing').map(item => (
                <div key={item.id} className="flex gap-3 mb-3">
                  <input value={item.key} onChange={e => setContent(prev => prev.map(c => c.id === item.id ? { ...c, key: e.target.value } : c))}
                    className="w-48 px-3 py-2 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm font-bold" placeholder="Nama paket" />
                  <input value={item.value || ''} onChange={e => setContent(prev => prev.map(c => c.id === item.id ? { ...c, value: e.target.value } : c))}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm" placeholder="Harga" />
                  <button onClick={() => saveContent(item)} className="p-2 rounded-xl bg-[#0F3D2E] text-white"><Save className="w-4 h-4" /></button>
                  <button onClick={() => deleteContent(item.id)} className="p-2 rounded-xl bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSTAGRAM TAB */}
        {tab === 'instagram' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Instagram Posts</h2>
            <div className="flex gap-3">
              <input value={newIgUrl} onChange={e => setNewIgUrl(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm" placeholder="https://www.instagram.com/p/XXXXX/" />
              <button onClick={addIG} className="px-5 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>

            <div className="space-y-3">
              {igPosts.map((post, i) => (
                <div key={post.id} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#1A1A1A]/5">
                  <span className="text-sm font-bold text-[#1A1A1A]/30 w-8">{i + 1}</span>
                  <span className="flex-1 text-sm text-[#1A1A1A]/70 truncate">{post.instagram_url}</span>
                  <button onClick={() => deleteIG(post.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {igPosts.length === 0 && <p className="text-[#1A1A1A]/40 text-sm text-center py-10">Belum ada post Instagram.</p>}
            </div>
          </div>
        )}

        {/* NEWS TAB */}
        {tab === 'news' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">News & Announcements</h2>
            
            {/* Add Form */}
            <div className="bg-white rounded-2xl p-6 border border-[#1A1A1A]/5 space-y-4">
              <input value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm font-bold" placeholder="Judul berita" />
              <textarea value={newNewsBody} onChange={e => setNewNewsBody(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm resize-none" rows={4} placeholder="Isi berita..." />
              <input value={newNewsImage} onChange={e => setNewNewsImage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm" placeholder="URL gambar (opsional)" />
              <button onClick={addNews} className="px-6 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Publish
              </button>
            </div>

            {/* News List */}
            <div className="space-y-3">
              {news.map(n => (
                <div key={n.id} className="flex items-start gap-4 bg-white rounded-xl p-4 border border-[#1A1A1A]/5">
                  {n.image_url && <img src={n.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />}
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#1A1A1A]">{n.title}</h4>
                    <p className="text-xs text-[#1A1A1A]/50 mt-1 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-[#1A1A1A]/30 mt-2">{new Date(n.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <button onClick={() => deleteNews(n.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMINS TAB */}
        {tab === 'admins' && isSuper && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Admin Management</h2>
            <div className="flex gap-3">
              <input value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm" placeholder="email@contoh.com" />
              <button onClick={addAdmin} className="px-5 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Invite
              </button>
            </div>

            <div className="space-y-3">
              {admins.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#1A1A1A]/5">
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[#1A1A1A]">{a.email}</span>
                    {a.is_super && <span className="ml-2 text-[10px] font-bold text-[#D4AF37] uppercase">Super Admin</span>}
                  </div>
                  {!a.is_super && (
                    <button onClick={() => removeAdmin(a.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
