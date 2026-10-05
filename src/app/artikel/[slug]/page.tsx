import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ARTICLES_DATA, ArticleItem } from '@/data/articles'
import {
  ArrowLeft, Calendar, Clock, MapPin,
  CheckCircle2, HelpCircle, MessageCircle, Sparkles, ChevronRight
} from 'lucide-react'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return ARTICLES_DATA.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES_DATA.find((a) => a.slug === slug)
  if (!article) return {}

  const url = `https://www.sebooth.in/artikel/${article.slug}`

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: [article.targetKeyword, ...article.secondaryKeywords],
    alternates: {
      canonical: url,
      languages: {
        'id-ID': url,
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
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      type: 'article',
      locale: 'id_ID',
      siteName: 'Sebooth - Vendor Photobooth Semarang',
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: `${article.title} - Sebooth Photobooth Semarang`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.coverImage],
    },
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = ARTICLES_DATA.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = ARTICLES_DATA.filter((a) => a.id !== article.id)

  // JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.sebooth.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Artikel',
        item: 'https://www.sebooth.in/artikel',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://www.sebooth.in/artikel/${article.slug}`,
      },
    ],
  }

  // JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: `https://www.sebooth.in${article.coverImage}`,
    author: {
      '@type': 'Organization',
      name: 'Sebooth Indonesia',
      url: 'https://www.sebooth.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sebooth Indonesia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.sebooth.in/icon.png',
      },
    },
    datePublished: '2026-10-01T08:00:00+07:00',
    dateModified: '2026-10-05T10:00:00+07:00',
    mainEntityOfPage: `https://www.sebooth.in/artikel/${article.slug}`,
  }

  // JSON-LD FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 pb-28">
      {/* ── JSON-LD Structured Data Injection ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-slate-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>SEMUA ARTIKEL</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            SEBOOTH.IN
          </Link>
        </div>
      </header>

      {/* ── Main Article Container ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Breadcrumb List */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/artikel" className="hover:text-slate-900 transition-colors">Artikel</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{article.category}</span>
        </nav>

        {/* Category & Metadata */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-4">
          <span className="px-3 py-1 rounded-full bg-orange-500/10 text-[#FF5500] font-black text-[11px] uppercase tracking-wider">
            {article.category}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {article.date}
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            Semarang & Tembalang
          </span>
        </div>

        {/* H1 Title (Unique across the page) */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-bayon uppercase tracking-wide text-slate-900 leading-tight">
          {article.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
          {article.excerpt}
        </p>

        {/* Cover Photo */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden my-8 shadow-md border border-stone-200">
          <Image
            src={article.coverImage}
            alt={`${article.title} - Layanan ${article.targetKeyword} Sebooth`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Key Highlights Box */}
        <div className="p-6 rounded-2xl bg-orange-50/70 border border-orange-200/80 my-8">
          <div className="flex items-center gap-2 text-sm font-black text-orange-950 uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-[#FF5500]" />
            <h2 className="text-sm font-black text-orange-950 uppercase tracking-wider">Poin Utama Pembahasan</h2>
          </div>
          <ul className="space-y-2">
            {article.highlights.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article Body Content (Introduction) */}
        <div className="prose prose-slate max-w-none text-slate-800 space-y-5 text-sm sm:text-base leading-relaxed">
          {article.content.map((paragraph, pIdx) => (
            <p key={pIdx}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Structured Sections (H2 & H3 Hierarchy + Tables) */}
        {article.sections && article.sections.length > 0 && (
          <div className="mt-8 space-y-10">
            {article.sections.map((section, sIdx) => (
              <section key={sIdx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black font-bayon uppercase tracking-wide text-slate-900 border-b border-stone-200/80 pb-2">
                  {section.heading}
                </h2>

                {section.subheading && (
                  <h3 className="text-sm sm:text-base font-bold text-slate-700">
                    {section.subheading}
                  </h3>
                )}

                <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Optional Responsive Comparison Table */}
                {section.table && (
                  <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-orange-50/80 border-b border-stone-200">
                          {section.table.headers.map((th, thIdx) => (
                            <th key={thIdx} className="p-3 sm:p-4 font-bold text-slate-900 whitespace-nowrap">
                              {th}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-stone-100 hover:bg-stone-50/80 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-3 sm:p-4 ${cIdx === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* FAQ Section with Rich Schema Alignment */}
        <section className="mt-14 pt-8 border-t border-stone-200">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-xl sm:text-2xl font-black font-bayon uppercase tracking-wide text-slate-900">
              Pertanyaan Populer (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {article.faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm"
              >
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Floating / Embedded WhatsApp CTA Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#002366] to-[#001338] text-white shadow-xl text-center flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-3">
            SEWA PHOTOBOOTH SEMARANG & TEMBALANG
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-bayon uppercase tracking-wide">
            Mau Bikin Acara Kamu di Semarang Makin Seru?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md">
            Konsultasikan tanggal event, pilih paket yang pas, dan dapatkan penawaran harga terbaik dari tim Sebooth hari ini!
          </p>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Sebooth,%20saya%20baca%20artikel%20di%20website%20dan%20tertarik%20sewa%20photobooth%20untuk%20event%20di%20Semarang!"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF2200] hover:opacity-95 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat WhatsApp Sebooth Sekarang</span>
          </a>
        </div>

        {/* Related Articles */}
        <section className="mt-14 pt-8 border-t border-stone-200">
          <h2 className="text-lg sm:text-xl font-black font-bayon uppercase tracking-wide text-slate-900 mb-5">
            Artikel Terkait Lainnya
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                href={`/artikel/${rel.slug}`}
                className="group p-4 rounded-2xl bg-white border border-stone-200 hover:border-orange-500 shadow-sm transition-all"
              >
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                  {rel.category}
                </span>
                <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors line-clamp-2">
                  {rel.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {rel.readTime}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

