'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Loader2, Home, LogOut, ShieldCheck, Users, Type, DollarSign, 
  Instagram, Newspaper, Plus, Trash2, Save, X, Image, PenTool,
  ChevronDown, ChevronUp, Upload, Film
} from 'lucide-react'

type TabKey = 'editor' | 'content' | 'pricing' | 'instagram' | 'news' | 'admins'

interface ContentItem { id: string; section: string; key: string; value: string; }
interface IGPost { id: string; instagram_url: string; display_order: number; }
interface NewsItem { id: string; title: string; body: string; image_url: string; published: boolean; created_at: string; }
interface AdminItem { id: string; email: string; is_super: boolean; }
interface GalleryImage { name: string; url: string; }
interface GalleryMeta { name: string; event: string; type: string; }

// ─── Editor Section Collapse State ───
type EditorSection = 'hero' | 'about' | 'product' | 'pricing' | 'testimonials' | 'gallery' | 'faq' | 'location'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuper, setIsSuper] = useState(false)
  const [tab, setTab] = useState<TabKey>('editor')
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
  const [newNewsSyncGallery, setNewNewsSyncGallery] = useState(false)
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false)

  // Editor fields — Hero
  const [heroTitle, setHeroTitle] = useState('Capture Every Moment, Create')
  const [heroAccent, setHeroAccent] = useState('Infinite Memories.')
  const [heroSubtitle, setHeroSubtitle] = useState('Premium Photobooth Experience for Weddings, Corporate, and Private Parties. Powered by Zero-Lag System.')
  const [heroCta, setHeroCta] = useState('Pesan Sekarang')

  // Editor fields — About
  const [aboutTag, setAboutTag] = useState('[ 00 — ORIGIN STORY ]')
  const [aboutTitle, setAboutTitle] = useState('FROM\nENGINEERING\nTO AESTHETICS.')
  const [aboutDesc, setAboutDesc] = useState('Berawal dari proyek passion kecil, sebooth. berevolusi menjadi layanan photobooth terdepan di Semarang.')
  const [aboutCta, setAboutCta] = useState('READ OUR FULL STORY →')

  // Editor fields — Product
  const [prodTitle, setProdTitle] = useState('OUR SERVICES')
  const [prodTag, setProdTag] = useState('[ 01 — EQUIPMENT & PACKAGES ]')
  const [prodProTitle, setProdProTitle] = useState('Pro Hardware')
  const [prodProDesc, setProdProDesc] = useState('We use DSLR cameras, studio-grade strobes, and industrial dye-sublimation printers. No webcams allowed.')

  // Editor fields — Pricing
  const [pricingTitle, setPricingTitle] = useState('PRICING PLANS')
  const [pricingSubtitle, setPricingSubtitle] = useState('NO HIDDEN FEES. RAW HONESTY.')

  // Editor fields — Testimonials
  const [testiTitle, setTestiTitle] = useState('TRUSTED BY MANY')
  const [testiBadge, setTestiBadge] = useState('REAL FEEDBACK')

  // Editor fields — Gallery
  const [galleryTitle, setGalleryTitle] = useState('VISUAL ARCHIVE')
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryMetadata, setGalleryMetadata] = useState<GalleryMeta[]>([])
  const [galleryCategories, setGalleryCategories] = useState<string[]>(['All', 'Wedding', 'Corporate', 'Private', 'Cultural'])
  const [newCategory, setNewCategory] = useState('')

  // Editor fields — FAQ
  const [faqTitle, setFaqTitle] = useState('COMMON QUESTIONS')
  const [faqItems, setFaqItems] = useState<{question: string; answer: string}[]>([
    { question: 'Travel outside Semarang?', answer: 'Yes, we cover events across Central Java and can travel nationwide for special requests. Additional transport fees may apply.' },
    { question: 'Space needed?', answer: 'Our standard setup requires a 3x3 meter space to ensure the best experience for your guests and optimal lighting conditions.' },
    { question: 'Custom frame design?', answer: 'Absolutely. All our packages include a custom frame design tailored to your event theme or brand identity.' },
    { question: 'Digital copies?', answer: 'Yes! Guests can download photos instantly via QR code, and we provide a full online gallery link after the event.' },
  ])

  // Editor fields — Location
  const [locTitle, setLocTitle] = useState('Visit Our Studio')
  const [locName, setLocName] = useState('Sebooth HQ')
  const [locAddress, setLocAddress] = useState('Jl. Photobooth Premium No. 12\nSemarang Selatan, Jawa Tengah 50241')
  const [locMaps, setLocMaps] = useState('https://maps.google.com')

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Set<EditorSection>>(new Set(['hero']))

  const toggleSection = (s: EditorSection) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })
  }

  useEffect(() => {
    async function init() {
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

    const items = c.data || []

    // Load hero fields
    loadFieldsFromContent(items, 'hero', {
      title: setHeroTitle, accent: setHeroAccent, subtitle: setHeroSubtitle, cta_text: setHeroCta,
    })
    // Load about fields
    loadFieldsFromContent(items, 'about', {
      tag: setAboutTag, title: setAboutTitle, description: setAboutDesc, cta_text: setAboutCta,
    })
    // Load product fields
    loadFieldsFromContent(items, 'product', {
      section_title: setProdTitle, section_tag: setProdTag, pro_title: setProdProTitle, pro_description: setProdProDesc,
    })
    // Load pricing fields
    loadFieldsFromContent(items, 'pricing', {
      section_title: setPricingTitle, section_subtitle: setPricingSubtitle,
    })
    // Load testimonials fields
    loadFieldsFromContent(items, 'testimonials', {
      section_title: setTestiTitle, section_badge: setTestiBadge,
    })
    // Load gallery fields
    loadFieldsFromContent(items, 'gallery', {
      section_title: setGalleryTitle,
    })
    // Load gallery metadata (items JSON)
    const galleryItemsRow = items.find(i => i.section === 'gallery' && i.key === 'items')
    if (galleryItemsRow?.value) {
      try { setGalleryMetadata(JSON.parse(galleryItemsRow.value)) } catch {}
    }
    // Load gallery categories
    const galleryCatsRow = items.find(i => i.section === 'gallery' && i.key === 'categories')
    if (galleryCatsRow?.value) {
      try { setGalleryCategories(JSON.parse(galleryCatsRow.value)) } catch {}
    }
    // Load FAQ fields
    const faqTitleItem = items.find(i => i.section === 'faq' && i.key === 'section_title')
    if (faqTitleItem?.value) setFaqTitle(faqTitleItem.value)
    const faqItemsItem = items.find(i => i.section === 'faq' && i.key === 'items')
    if (faqItemsItem?.value) {
      try { setFaqItems(JSON.parse(faqItemsItem.value)) } catch {}
    }
    // Load location fields
    loadFieldsFromContent(items, 'location', {
      title: setLocTitle, name: setLocName, address: setLocAddress, maps_url: setLocMaps,
    })

    await loadGalleryImages()
  }

  function loadFieldsFromContent(
    items: ContentItem[],
    section: string,
    setters: Record<string, (v: string) => void>
  ) {
    const filtered = items.filter(i => i.section === section)
    filtered.forEach(item => {
      if (item.value && setters[item.key]) {
        setters[item.key](item.value)
      }
    })
  }

  async function loadGalleryImages() {
    const { data } = await supabase.storage.from('gallery').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    if (data) {
      const images = data
        .filter(f => !f.name.startsWith('.'))
        .map(f => ({
          name: f.name,
          url: supabase.storage.from('gallery').getPublicUrl(f.name).data.publicUrl
        }))
      setGalleryImages(images)
    }
  }

  async function uploadGalleryImage(file: File) {
    setUploadingGallery(true)
    const ext = file.name.split('.').pop()
    const fileName = `gallery_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('gallery').upload(fileName, file)
    if (error) {
      flash(`Upload error: ${error.message}`)
    } else {
      // Auto-add metadata entry for the new file
      const newMeta: GalleryMeta = { name: fileName, event: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '), type: 'All' }
      const updatedMeta = [...galleryMetadata, newMeta]
      setGalleryMetadata(updatedMeta)
      await saveField('gallery', 'items', JSON.stringify(updatedMeta))
      await loadGalleryImages()
      flash('Media uploaded!')
    }
    setUploadingGallery(false)
  }

  async function uploadNewsImage(file: File): Promise<string | null> {
    setUploadingNewsImage(true)
    const ext = file.name.split('.').pop()
    const fileName = `news_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('gallery').upload(fileName, file)
    if (error) {
      flash(`Upload error: ${error.message}`)
      setUploadingNewsImage(false)
      return null
    }
    const url = supabase.storage.from('gallery').getPublicUrl(fileName).data.publicUrl
    setUploadingNewsImage(false)
    return url
  }

  async function deleteGalleryImage(name: string) {
    await supabase.storage.from('gallery').remove([name])
    await loadGalleryImages()
    flash('Image deleted')
  }

  // ─── Generic save field to site_content ───
  async function saveField(section: string, key: string, value: string) {
    setSaving(true)
    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('section', section)
      .eq('key', key)
      .maybeSingle()
    
    if (existing) {
      await supabase.from('site_content').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('site_content').insert({ section, key, value })
    }
    flash('Saved!')
    setSaving(false)
  }

  // ─── Save multiple fields at once ───
  async function saveMultipleFields(section: string, fields: Record<string, string>) {
    setSaving(true)
    for (const [key, value] of Object.entries(fields)) {
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', section)
        .eq('key', key)
        .maybeSingle()
      
      if (existing) {
        await supabase.from('site_content').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id)
      } else {
        await supabase.from('site_content').insert({ section, key, value })
      }
    }
    flash('All changes saved!')
    setSaving(false)
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
    const { error } = await supabase.from('site_content').insert({ section, key, value: '' })
    if (error) { flash(`Error: ${error.message}`); return }
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
    // Sync to gallery if checkbox is checked and there's an image
    if (newNewsSyncGallery && newNewsImage) {
      const fileName = newNewsImage.split('/').pop() || ''
      const newMeta: GalleryMeta = { name: fileName, event: newNewsTitle, type: 'News' }
      const updatedMeta = [...galleryMetadata, newMeta]
      setGalleryMetadata(updatedMeta)
      await saveField('gallery', 'items', JSON.stringify(updatedMeta))
      // Ensure 'News' category exists
      if (!galleryCategories.includes('News')) {
        const updatedCats = [...galleryCategories, 'News']
        setGalleryCategories(updatedCats)
        await saveField('gallery', 'categories', JSON.stringify(updatedCats))
      }
    }
    setNewNewsTitle(''); setNewNewsBody(''); setNewNewsImage(''); setNewNewsSyncGallery(false)
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

  // ─── FAQ item CRUD ───
  function addFaqItem() {
    setFaqItems([...faqItems, { question: '', answer: '' }])
  }
  function removeFaqItem(idx: number) {
    setFaqItems(faqItems.filter((_, i) => i !== idx))
  }
  function updateFaqItem(idx: number, field: 'question' | 'answer', val: string) {
    setFaqItems(faqItems.map((item, i) => i === idx ? { ...item, [field]: val } : item))
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
    { key: 'editor', label: 'Page Editor', icon: <PenTool className="w-4 h-4" /> },
    { key: 'content', label: 'Content', icon: <Type className="w-4 h-4" /> },
    { key: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { key: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
    ...(isSuper ? [{ key: 'admins' as const, label: 'Admins', icon: <Users className="w-4 h-4" /> }] : []),
  ]

  // ─── Section Header Component ───
  function SectionHeader({ id, title }: { id: EditorSection; title: string }) {
    const isOpen = openSections.has(id)
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-3 px-1 text-left group"
      >
        <h2 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#0F3D2E] transition-colors">{title}</h2>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[#1A1A1A]/40" /> : <ChevronDown className="w-5 h-5 text-[#1A1A1A]/40" />}
      </button>
    )
  }

  // ─── Small Save Button ───
  function SaveBtn({ onClick, label = 'Save' }: { onClick: () => void; label?: string }) {
    return (
      <button onClick={onClick} disabled={saving}
        className="px-4 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-bold hover:bg-[#195240] transition-all disabled:opacity-50 flex items-center gap-1">
        <Save className="w-3 h-3" /> {label}
      </button>
    )
  }

  // ─── Input Field ───
  function Field({ label, value, onChange, multiline = false, rows = 2 }: {
    label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number;
  }) {
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1 block">{label}</label>
        {multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm resize-none" rows={rows} />
        ) : (
          <input value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm font-bold" />
        )}
      </div>
    )
  }

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

        {/* ═══════════════════ EDITOR TAB ═══════════════════ */}
        {tab === 'editor' && (
          <div className="space-y-2">

            {/* ── HERO ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="hero" title="🎬 Hero Section" />
              {openSections.has('hero') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Title (Line utama)" value={heroTitle} onChange={setHeroTitle} />
                  <Field label="Accent Text (teks marker)" value={heroAccent} onChange={setHeroAccent} />
                  <Field label="Subtitle" value={heroSubtitle} onChange={setHeroSubtitle} multiline rows={3} />
                  <Field label="CTA Button Text" value={heroCta} onChange={setHeroCta} />
                  <SaveBtn onClick={() => saveMultipleFields('hero', {
                    title: heroTitle, accent: heroAccent, subtitle: heroSubtitle, cta_text: heroCta
                  })} label="Save Hero" />
                  {/* Preview */}
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase text-[#1A1A1A]/30 mb-2">Live Preview</p>
                    <div className="bg-[#0A1628] p-6 rounded-2xl border border-[#1A1A1A]/10">
                      <h1 className="text-xl md:text-3xl font-black text-white leading-tight tracking-tighter uppercase mb-3">
                        {heroTitle} <br/><span className="text-[#FF6B35] italic">{heroAccent}</span>
                      </h1>
                      <p className="text-xs text-white/70 font-medium uppercase mb-4 max-w-lg">{heroSubtitle}</p>
                      <span className="inline-block bg-[#FF6B35] text-white text-xs font-black uppercase px-4 py-2 border-2 border-black">{heroCta}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── ABOUT ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="about" title="📖 About Section" />
              {openSections.has('about') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Tag (e.g. [ 00 — ORIGIN STORY ])" value={aboutTag} onChange={setAboutTag} />
                  <Field label="Title (gunakan Enter untuk baris baru)" value={aboutTitle} onChange={setAboutTitle} multiline rows={3} />
                  <Field label="Description" value={aboutDesc} onChange={setAboutDesc} multiline rows={3} />
                  <Field label="CTA Button Text" value={aboutCta} onChange={setAboutCta} />
                  <SaveBtn onClick={() => saveMultipleFields('about', {
                    tag: aboutTag, title: aboutTitle, description: aboutDesc, cta_text: aboutCta,
                  })} label="Save About" />
                </div>
              )}
            </div>

            {/* ── PRODUCT ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="product" title="📦 Product / Services Section" />
              {openSections.has('product') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Section Title" value={prodTitle} onChange={setProdTitle} />
                  <Field label="Section Tag" value={prodTag} onChange={setProdTag} />
                  <Field label="Pro Hardware Title" value={prodProTitle} onChange={setProdProTitle} />
                  <Field label="Pro Hardware Description" value={prodProDesc} onChange={setProdProDesc} multiline rows={2} />
                  <SaveBtn onClick={() => saveMultipleFields('product', {
                    section_title: prodTitle, section_tag: prodTag, pro_title: prodProTitle, pro_description: prodProDesc,
                  })} label="Save Product" />
                  <p className="text-[10px] text-[#1A1A1A]/40">Untuk edit item produk individual, gunakan tab Content → section &quot;product&quot; → key &quot;items&quot; (format JSON).</p>
                </div>
              )}
            </div>

            {/* ── PRICING ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="pricing" title="💰 Pricing Section" />
              {openSections.has('pricing') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Section Title" value={pricingTitle} onChange={setPricingTitle} />
                  <Field label="Section Subtitle" value={pricingSubtitle} onChange={setPricingSubtitle} />
                  <SaveBtn onClick={() => saveMultipleFields('pricing', {
                    section_title: pricingTitle, section_subtitle: pricingSubtitle,
                  })} label="Save Pricing" />
                  <p className="text-[10px] text-[#1A1A1A]/40">Untuk edit fitur & harga paket, gunakan tab Content → section &quot;pricing&quot; dengan key seperti &quot;unlimited_features&quot;, &quot;unlimited_packages&quot;, &quot;quota_features&quot;, &quot;quota_packages&quot; (format JSON array).</p>
                </div>
              )}
            </div>

            {/* ── TESTIMONIALS ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="testimonials" title="⭐ Testimonials Section" />
              {openSections.has('testimonials') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Section Title" value={testiTitle} onChange={setTestiTitle} />
                  <Field label="Badge Text" value={testiBadge} onChange={setTestiBadge} />
                  <SaveBtn onClick={() => saveMultipleFields('testimonials', {
                    section_title: testiTitle, section_badge: testiBadge,
                  })} label="Save Testimonials" />
                  <p className="text-[10px] text-[#1A1A1A]/40">Untuk edit testimonial items, gunakan tab Content → section &quot;testimonials&quot; → key &quot;items&quot; (format JSON array).</p>
                </div>
              )}
            </div>

            {/* ── GALLERY ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="gallery" title="🖼️ Gallery Section" />
              {openSections.has('gallery') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Section Title" value={galleryTitle} onChange={setGalleryTitle} />
                  <SaveBtn onClick={() => saveField('gallery', 'section_title', galleryTitle)} label="Save Title" />

                  {/* Category Management */}
                  <div className="border-t border-[#1A1A1A]/10 pt-4 mt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-2 block">Kategori Gallery</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {galleryCategories.map((cat, idx) => (
                        <div key={cat} className="flex items-center gap-1 bg-[#F9F9F9] border border-[#1A1A1A]/10 rounded-lg px-3 py-1.5">
                          <span className="text-xs font-bold text-[#1A1A1A]">{cat}</span>
                          {cat !== 'All' && (
                            <button onClick={() => {
                              const updated = galleryCategories.filter((_, i) => i !== idx)
                              setGalleryCategories(updated)
                            }} className="text-red-400 hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm" placeholder="Tambah kategori baru..." />
                      <button onClick={() => {
                        if (newCategory.trim() && !galleryCategories.includes(newCategory.trim())) {
                          setGalleryCategories([...galleryCategories, newCategory.trim()])
                          setNewCategory('')
                        }
                      }} className="px-3 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-bold"><Plus className="w-3 h-3" /></button>
                    </div>
                    <SaveBtn onClick={() => saveField('gallery', 'categories', JSON.stringify(galleryCategories))} label="Save Categories" />
                  </div>

                  {/* Upload */}
                  <div className="border-t border-[#1A1A1A]/10 pt-4 mt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-2 block flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload Foto / Video to Gallery
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={e => { if (e.target.files?.[0]) uploadGalleryImage(e.target.files[0]) }}
                      className="text-sm"
                      disabled={uploadingGallery}
                    />
                    {uploadingGallery && <p className="text-xs text-[#0F3D2E] mt-2 font-bold">Uploading...</p>}
                  </div>

                  {/* Media Grid with Metadata Editor */}
                  {galleryImages.length === 0 && (
                    <p className="text-[#1A1A1A]/40 text-sm text-center py-4">Belum ada media. Upload media pertamamu.</p>
                  )}
                  <div className="space-y-3">
                    {galleryImages.map(img => {
                      const meta = galleryMetadata.find(m => m.name === img.name)
                      const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(img.name)
                      return (
                        <div key={img.name} className="flex gap-3 bg-[#F9F9F9] rounded-xl p-3 border border-[#1A1A1A]/10">
                          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-[#1A1A1A]/10 relative">
                            {isVideo ? (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                <Film className="w-6 h-6 text-white/60" />
                              </div>
                            ) : (
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              value={meta?.event || ''}
                              onChange={e => {
                                setGalleryMetadata(prev => {
                                  const existing = prev.find(m => m.name === img.name)
                                  if (existing) {
                                    return prev.map(m => m.name === img.name ? { ...m, event: e.target.value } : m)
                                  }
                                  return [...prev, { name: img.name, event: e.target.value, type: 'All' }]
                                })
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#1A1A1A]/10 text-sm font-bold"
                              placeholder="Nama Event (e.g. Gala Dinner 2026)"
                            />
                            <select
                              value={meta?.type || 'All'}
                              onChange={e => {
                                setGalleryMetadata(prev => {
                                  const existing = prev.find(m => m.name === img.name)
                                  if (existing) {
                                    return prev.map(m => m.name === img.name ? { ...m, type: e.target.value } : m)
                                  }
                                  return [...prev, { name: img.name, event: '', type: e.target.value }]
                                })
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#1A1A1A]/10 text-sm"
                            >
                              {galleryCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => deleteGalleryImage(img.name)}
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <SaveBtn onClick={() => saveField('gallery', 'items', JSON.stringify(galleryMetadata))} label="Save All Gallery Metadata" />
                </div>
              )}
            </div>

            {/* ── FAQ ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="faq" title="❓ FAQ Section" />
              {openSections.has('faq') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Section Title" value={faqTitle} onChange={setFaqTitle} />

                  <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">FAQ Items</label>
                      <button onClick={addFaqItem} className="text-xs font-bold text-[#0F3D2E] hover:text-[#195240] flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Tambah FAQ
                      </button>
                    </div>
                    {faqItems.map((item, idx) => (
                      <div key={idx} className="bg-[#F9F9F9] rounded-xl p-4 space-y-2 relative">
                        <button onClick={() => removeFaqItem(idx)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                          <X className="w-3 h-3" />
                        </button>
                        <input value={item.question} onChange={e => updateFaqItem(idx, 'question', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm font-bold" placeholder="Pertanyaan" />
                        <textarea value={item.answer} onChange={e => updateFaqItem(idx, 'answer', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#1A1A1A]/10 text-sm resize-none" rows={2} placeholder="Jawaban" />
                      </div>
                    ))}
                  </div>

                  <SaveBtn onClick={() => saveMultipleFields('faq', {
                    section_title: faqTitle, items: JSON.stringify(faqItems),
                  })} label="Save FAQ" />
                </div>
              )}
            </div>

            {/* ── LOCATION ── */}
            <div className="bg-white rounded-2xl border border-[#1A1A1A]/5 overflow-hidden">
              <SectionHeader id="location" title="📍 Location Section" />
              {openSections.has('location') && (
                <div className="p-6 pt-0 space-y-4">
                  <Field label="Title" value={locTitle} onChange={setLocTitle} />
                  <Field label="Place Name" value={locName} onChange={setLocName} />
                  <Field label="Address (gunakan Enter untuk baris baru)" value={locAddress} onChange={setLocAddress} multiline rows={3} />
                  <Field label="Google Maps URL" value={locMaps} onChange={setLocMaps} />
                  <SaveBtn onClick={() => saveMultipleFields('location', {
                    title: locTitle, name: locName, address: locAddress, maps_url: locMaps,
                  })} label="Save Location" />
                </div>
              )}
            </div>

          </div>
        )}

        {/* ═══════════════════ CONTENT TAB ═══════════════════ */}
        {tab === 'content' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Site Content</h2>
              <div className="flex gap-2 flex-wrap">
                {['hero', 'about', 'product', 'gallery', 'faq', 'location', 'testimonials', 'pricing'].map(s => (
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

        {/* ═══════════════════ PRICING TAB ═══════════════════ */}
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

        {/* ═══════════════════ INSTAGRAM TAB ═══════════════════ */}
        {tab === 'instagram' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Instagram Posts</h2>
            <p className="text-sm text-[#1A1A1A]/50">Paste URL Instagram post. Post akan ter-embed otomatis di homepage.</p>
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

        {/* ═══════════════════ NEWS TAB ═══════════════════ */}
        {tab === 'news' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">News & Announcements</h2>
            
            <div className="bg-white rounded-2xl p-6 border border-[#1A1A1A]/5 space-y-4">
              <input value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm font-bold" placeholder="Judul berita" />
              <textarea value={newNewsBody} onChange={e => setNewNewsBody(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F9] border border-[#1A1A1A]/10 text-sm resize-none" rows={4} placeholder="Isi berita..." />
              
              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-2 block flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Gambar Berita
                </label>
                {newNewsImage ? (
                  <div className="flex items-center gap-3">
                    <img src={newNewsImage} className="w-16 h-16 rounded-xl object-cover border border-[#1A1A1A]/10" alt="Preview" />
                    <button onClick={() => setNewNewsImage('')} className="text-xs font-bold text-red-500">Hapus</button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = await uploadNewsImage(file)
                        if (url) setNewNewsImage(url)
                      }
                    }}
                    className="text-sm"
                    disabled={uploadingNewsImage}
                  />
                )}
                {uploadingNewsImage && <p className="text-xs text-[#0F3D2E] mt-1 font-bold">Uploading...</p>}
              </div>

              {/* Sync to Gallery */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNewsSyncGallery}
                  onChange={e => setNewNewsSyncGallery(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-bold text-[#1A1A1A]/70">Tampilkan juga di Gallery (Sync to Gallery)</span>
              </label>

              <button onClick={addNews} className="px-6 py-3 rounded-xl bg-[#0F3D2E] text-white font-bold text-sm hover:bg-[#195240] transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Publish
              </button>
            </div>

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

        {/* ═══════════════════ ADMINS TAB ═══════════════════ */}
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
