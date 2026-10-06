import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ARTICLES_DATA } from '@/data/articles'
import { ArrowLeft, Clock, Calendar, ArrowUpRight, MapPin, Instagram } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Artikel & Tips Photobooth Semarang | Sebooth Stories',
  description: 'Kumpulan artikel, panduan sewa photobooth, dan tips event kampus atau wedding di Semarang & Tembalang. Cetak instan lab-grade, live video, & frame aesthetic.',
  keywords: [
    'Photobooth Semarang',
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

export default function ArtikelIndexPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 pb-24">
      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-slate-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>KEMBALI KE HOMEPAGE</span>
          </Link>

          <a
            href="https://instagram.com/sebooth.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100/80 hover:bg-orange-200/80 text-orange-700 text-xs font-bold transition-all"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@sebooth.id</span>
          </a>
        </div>
      </header>

      {/* ── Hero Headline ── */}
      <section className="max-w-4xl mx-auto px-4 pt-12 sm:pt-16 pb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-black font-bayon uppercase tracking-wide text-slate-900 leading-tight">
          Cerita, Event & Tips Photobooth Semarang
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Eksplorasi keseruan dokumentasi photobooth Sebooth di kampus Tembalang, resepsi wedding Semarang, expo, serta tips memilih photobooth aesthetic cetak instan.
        </p>
      </section>

      {/* ── Articles Grid ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ARTICLES_DATA.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                    {article.category}
                  </span>
                </div>

                {/* Article Info */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors leading-snug line-clamp-2">
                    <Link href={`/artikel/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Semarang & Tembalang
                </span>

                <Link
                  href={`/artikel/${article.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-slate-900 hover:text-[#FF5500] uppercase tracking-wider transition-colors"
                >
                  <span>Baca</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
