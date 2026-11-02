import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { ArticleTile } from '@/components/artikel/ArticleCards'
import { ARTICLES_DATA } from '@/data/articles'
import { CATEGORY_IDS } from '@/data/articleCategories'
import { whatsappUrl } from '@/config/social'

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
    title: { absolute: article.metaTitle },
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

  // Same category first, starting after this article so each page links onward to different ones
  const peers = ARTICLES_DATA.filter((a) => a.category === article.category)
  const position = peers.indexOf(article)
  const relatedArticles = [
    ...peers.slice(position + 1),
    ...peers.slice(0, position),
    ...ARTICLES_DATA.filter((a) => a.category !== article.category),
  ].slice(0, 4)

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

  const crumbClass =
    'underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
  const sectionHeadingClass =
    'font-bayon text-[1.75rem] leading-[1.05] text-primary uppercase md:text-[2.5rem]'

  return (
    <div className="min-h-svh">
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

      <article>
        {/* ── Hero: where you are, the title, what it covers, and its picture ── */}
        <header className="bg-primary px-5 pt-20 pb-14 text-white md:px-10 md:pt-28 md:pb-24">
          <div className="mx-auto grid max-w-6xl gap-y-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-x-16">
            <div>
              <nav aria-label="Breadcrumb" className="text-sm text-white/80 md:text-base">
                <Link href="/" className={crumbClass}>Home</Link>
                <span aria-hidden="true"> / </span>
                <Link href="/artikel" className={crumbClass}>Artikel</Link>
                <span aria-hidden="true"> / </span>
                <Link href={`/artikel#${CATEGORY_IDS[article.category]}`} className={`${crumbClass} capitalize`}>
                  {article.category.toLowerCase()}
                </Link>
              </nav>

              {/* H1 Title (Unique across the page) */}
              <h1 className="mt-6 font-bayon text-[2rem] leading-[1.05] uppercase md:text-[clamp(2.5rem,4.6vw,4rem)]">
                {article.title}
              </h1>

              <p className="mt-5 text-sm text-white/80 md:text-base">
                {article.date} · {article.readTime} · Semarang & Tembalang
              </p>

              <p className="mt-5 text-xl leading-snug md:text-[1.375rem]">
                {article.excerpt}
              </p>
            </div>

            {/* Cover Photo */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src={article.coverImage.replace('/thumbs/', '/hd/')}
                alt={`${article.title} - Layanan ${article.targetKeyword} Sebooth`}
                fill
                priority
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* ── Reading column ── */}
        <div className="mx-auto max-w-2xl px-5 py-12 text-[17px] leading-relaxed text-blue-dark md:py-20 md:text-lg">
          {/* Key Highlights */}
          <section className="rounded-lg bg-white p-5 md:p-8">
            <h2 className={sectionHeadingClass}>Poin Utama Pembahasan</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-secondary">
              {article.highlights.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </section>

          {/* Article Body Content (Introduction) */}
          <div className="mt-10 space-y-5">
            {article.content.map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </div>

          {/* Structured Sections (H2 & H3 Hierarchy + Tables) */}
          {article.sections?.map((section, sIdx) => (
            <section key={sIdx} className="mt-12 md:mt-16">
              <h2 className={sectionHeadingClass}>{section.heading}</h2>

              {section.subheading && (
                <h3 className="mt-3 text-xl leading-snug font-bold md:text-[1.375rem]">
                  {section.subheading}
                </h3>
              )}

              <div className="mt-4 space-y-5">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {/* Wide tables scroll inside their own region, running to the screen edge on phones */}
              {section.table && (
                <div
                  role="region"
                  aria-label={section.heading}
                  tabIndex={0}
                  className="-mx-5 mt-6 overflow-x-auto px-5 focus-visible:outline-2 focus-visible:outline-secondary md:mx-0 md:px-0"
                >
                  <table
                    className="w-full border-collapse text-left text-sm leading-snug md:text-base"
                    style={{ minWidth: `${section.table.headers.length * 9}rem` }}
                  >
                    <thead>
                      <tr className="border-b-2 border-primary">
                        {section.table.headers.map((th, thIdx) => (
                          <th key={thIdx} scope="col" className="py-3 pr-4 font-bold text-primary">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-200">{/* taste-skill-ignore: a real table row */}
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`py-3 pr-4 align-top ${cIdx === 0 ? 'font-bold' : ''}`}>
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

          {/* FAQ Section with Rich Schema Alignment */}
          <section className="mt-12 md:mt-16">
            <h2 className={sectionHeadingClass}>Pertanyaan Populer (FAQ)</h2>
            <div className="mt-6 space-y-6">
              {article.faqs.map((faq, fIdx) => (
                <div key={fIdx}>
                  <h3 className="font-bold">{faq.question}</h3>
                  <p className="mt-1.5">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>

      {/* ── Related Articles ── */}
      <section className="bg-white px-5 py-14 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className={sectionHeadingClass}>Artikel Terkait Lainnya</h2>
          <div className="mt-8 grid gap-x-6 gap-y-8 md:mt-12 md:grid-cols-4">
            {relatedArticles.map((rel) => (
              <ArticleTile key={rel.id} article={rel} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Close: from reading to booking ── */}
      <section className="bg-secondary px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-[20ch] font-bayon text-[1.75rem] leading-[1.05] text-blue-dark uppercase md:text-[2.5rem]">
            Mau Bikin Acara Kamu di Semarang Makin Seru?
          </h2>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed font-medium text-blue-dark md:text-lg">
            Konsultasikan tanggal event, pilih paket yang pas, dan dapatkan penawaran harga terbaik dari tim Sebooth hari ini!
          </p>
          <a
            href={whatsappUrl('Halo Sebooth, saya baca artikel di website dan tertarik sewa photobooth untuk event di Semarang!')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-blue-dark px-7 text-[17px] font-bold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-dark active:scale-[0.98] md:text-lg"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Chat WhatsApp Sebooth
          </a>
        </div>
      </section>
    </div>
  )
}
