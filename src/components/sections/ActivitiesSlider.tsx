import Link from 'next/link'
import { ArticleTile, type ArticleCardData } from '@/components/artikel/ArticleCards'

interface ActivitiesSliderProps {
  articles: ArticleCardData[]
}

export function ActivitiesSlider({ articles }: ActivitiesSliderProps) {
  return (
    <section className="relative flex h-full min-h-full w-full flex-col items-center overflow-hidden bg-blue-light px-5 pt-20 pb-16 select-none md:px-10 md:pt-24">
      <div className="w-full max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-bayon text-[2rem] leading-none text-primary uppercase md:text-[4rem]">
            Cerita Sebooth
          </h2>
          <Link
            href="/artikel"
            className="inline-flex min-h-11 items-center text-[17px] font-bold whitespace-nowrap text-primary underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:text-lg"
          >
            Semua artikel
          </Link>
        </div>

        {/* Short phones get the heading and two articles; a clipped third helps nobody */}
        <p className="mt-2 text-[17px] leading-snug text-blue-dark md:text-lg [@media(max-height:680px)]:hidden">
          Keseruan photobooth Sebooth di kampus Tembalang, resepsi wedding, konser musik, dan festival di Kota Semarang.
        </p>

        <div className="mt-5 grid gap-4 md:mt-8 md:grid-cols-3 md:gap-6">
          {articles.map((article, index) => (
            <div key={article.slug} className={index === 2 ? '[@media(max-height:740px)]:hidden' : undefined}>
              <ArticleTile article={article} wide />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
