import Image from 'next/image'
import { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { ArticleLink, ArticleMeta, ArticleTile } from '@/components/artikel/ArticleCards'
import { ARTICLES_DATA, type ArticleItem } from '@/data/articles'
import { CATEGORY_IDS } from '@/data/articleCategories'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, whatsappUrl } from '@/config/social'

export const metadata: Metadata = {
  title: { absolute: 'Artikel & Tips Photobooth Semarang | Sebooth Stories' },
  description: 'Kumpulan artikel, panduan sewa photobooth, dan tips event kampus atau wedding di Semarang & Tembalang. Cetak instan lab-grade, live video, & frame aesthetic.',
  keywords: [
    'Photobooth Semarang',
    'Photobooth Semarang Murah',
    'Vendor Photobooth Konser',
    'Photobooth Natal Semarang Murah',
    'Rekomendasi Photobooth Tembalang',
    'Photobooth UNDIP',
    'Photobooth Mahasiswa UNDIP',
    'Photobooth Vending Machine Widya Puraya',
    'Photobooth Widpur UNDIP',
    'Nongkrong Malam Widpur UNDIP',
    'Photobooth Tembalang',
    'Photobooth Konser Semarang',
    'Kerjasama Photobooth Konser',
    'Photobooth Stasiun Tawang',
    'Pop-up Photobooth Widya Puraya Undip',
    'Photobooth Sekolah Politik BEM FSM Undip',
    'Photobooth Dipoxpo Undip',
    'Photobooth Pekan Ekonomi Teknik Undip',
    'Tips Sewa Photobooth Semarang',
    'Photobooth Wisuda UNDIP',
    'Photobooth Event Semarang Murah',
    'Vendor Photobooth Semarang',
    'Harga Sewa Photobooth Semarang',
    'Photobooth Wedding Semarang',
    'Photobooth Tembalang Murah',
    'Sewa Photobooth Tembalang',
    'Photobooth Wisuda Muladi Dome',
    'Photobooth Sweet 17 Semarang',
  ],
  alternates: {
    canonical: 'https://www.sebooth.in/artikel',
    languages: {
      'id-ID': 'https://www.sebooth.in/artikel',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Artikel & Tips Photobooth Semarang | Sebooth Stories',
    description: 'Kumpulan artikel, tips sewa photobooth, dan dokumentasi aktivitas Sebooth di event kampus, wedding, dan festival seru di Semarang & Tembalang.',
    url: 'https://www.sebooth.in/artikel',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Sebooth - Vendor Photobooth Semarang',
    images: [
      {
        url: '/images/slides/hero/bg_slide_1.webp',
        width: 1200,
        height: 630,
        alt: 'Artikel & Tips Photobooth Semarang Sebooth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artikel & Tips Photobooth Semarang | Sebooth Stories',
    description: 'Panduan sewa photobooth Semarang, event kampus Tembalang, dan wedding.',
    images: ['/images/slides/hero/bg_slide_1.webp'],
  },
}

// Each category opens on one big picture, so no two may share a cover.
// The partner handshake art is ruled out too: it is an illustration, not a photo of an event.
const leadCovers = new Set(['/images/products/partner_sebooth.webp'])

const SECTIONS = (Object.keys(CATEGORY_IDS) as ArticleItem['category'][]).map((name) => {
  const articles = ARTICLES_DATA.filter((article) => article.category === name)
  const lead = articles.find((article) => !leadCovers.has(article.coverImage)) ?? articles[0]
  leadCovers.add(lead.coverImage)
  return {
    name,
    id: CATEGORY_IDS[name],
    count: articles.length,
    lead,
    rest: articles.filter((article) => article !== lead),
  }
})

function LeadArticle({ article }: { article: ArticleItem }) {
  return (
    <article className="rise-on-scroll group relative md:col-span-2 md:row-span-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
        <Image
          src={article.coverImage.replace('/thumbs/', '/hd/')}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-4 text-xl leading-snug font-bold text-blue-dark md:text-2xl">
        <ArticleLink article={article} />
      </h3>
      <ArticleMeta article={article} />
      <p className="mt-3 text-[17px] leading-relaxed text-blue-dark md:text-lg">{article.excerpt}</p>
    </article>
  )
}

export default function ArtikelIndexPage() {
  return (
    <div className="min-h-svh">
      {/* ── Hero: what this is, and a contents list to jump by what you're planning ── */}
      <section className="bg-primary px-5 pt-24 pb-14 text-white md:px-10 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-bayon text-[min(10.4vw,6rem)] leading-[0.95] text-balance uppercase">
            Cerita, Event & Tips Photobooth Semarang
          </h1>
          <div className="mt-6 grid gap-y-8 md:mt-12 md:grid-cols-12 md:gap-x-8">
            <p className="text-[17px] leading-relaxed md:col-span-5 md:text-lg">
              Eksplorasi keseruan dokumentasi photobooth Sebooth di kampus Tembalang, resepsi wedding Semarang, expo, serta tips memilih photobooth aesthetic cetak instan.
            </p>
            <nav aria-label="Kategori artikel" className="md:col-span-6 md:col-start-7">
              <ul>
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-12 items-center justify-between gap-4 font-bayon text-[2rem] leading-none uppercase transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span>{section.name}</span>
                      {/* Hanken, not Bayon: Bayon's 1 reads as an I */}
                      <span className="font-sans text-xl font-bold text-secondary tabular-nums md:text-2xl">
                        {section.count}
                        <span className="sr-only"> artikel</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* ── Categories: a big opening article, then the rest ── */}
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`px-5 py-16 md:px-10 md:py-28 ${index % 2 === 0 ? 'bg-white' : ''}`}
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="font-bayon text-[2rem] leading-none text-primary uppercase md:text-[4rem]">
              {section.name}
            </h2>
            <div className="mt-8 grid gap-x-6 gap-y-8 md:mt-12 md:grid-cols-3 md:gap-y-12 lg:grid-cols-4">
              <LeadArticle article={section.lead} />
              {section.rest.map((article) => (
                <ArticleTile key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── Close: from reading to booking ── */}
      <section className="bg-secondary px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-bayon text-[2rem] leading-none text-blue-dark uppercase md:text-[4rem]">
            Mau Sebooth di acaramu?
          </h2>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed font-medium text-blue-dark md:text-lg">
            Kabari tanggal dan lokasi acaramu, nanti tim kami bantu pilih paket yang pas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href={whatsappUrl('Halo Sebooth, saya ingin booking photobooth untuk acara saya!')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-blue-dark px-7 text-[17px] font-bold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-dark active:scale-[0.98] md:text-lg"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Booking via WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-[17px] font-bold text-blue-dark underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-dark md:text-lg"
            >
              Instagram @{INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
