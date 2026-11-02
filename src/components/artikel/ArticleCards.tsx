import Link from 'next/link'
import Image from 'next/image'
import type { ArticleItem } from '@/data/articles'

/** Only what a card shows, so client pages can receive it without bundling the whole article data. */
export type ArticleCardData = Pick<ArticleItem, 'slug' | 'title' | 'date' | 'readTime' | 'coverImage' | 'excerpt'>

// The title link stretches over the whole article, so the picture and text are one big tap target
export function ArticleLink({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="decoration-secondary decoration-2 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-secondary"
    >
      {article.title}
    </Link>
  )
}

export function ArticleMeta({ article }: { article: ArticleCardData }) {
  return (
    <p className="mt-2 text-sm text-slate-600 md:text-base">
      {article.date} · {article.readTime}
    </p>
  )
}

/** `wide` crops the picture to 4:3 from tablet up, for places too short for a portrait one. */
export function ArticleTile({ article, wide = false }: { article: ArticleCardData; wide?: boolean }) {
  return (
    <article className="rise-on-scroll group relative grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-4 md:block">
      <div className={`relative aspect-[4/5] overflow-hidden rounded-lg ${wide ? 'md:aspect-[4/3]' : ''}`}>
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 96px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          unoptimized
        />
      </div>
      <div className="md:mt-4">
        <h3 className="text-[17px] leading-snug font-bold text-blue-dark md:text-lg">
          <ArticleLink article={article} />
        </h3>
        <ArticleMeta article={article} />
        {/* Phones get a scannable list; the excerpt returns where there is room for it */}
        <p className="mt-2 hidden text-base leading-normal text-blue-dark md:line-clamp-3">{article.excerpt}</p>
      </div>
    </article>
  )
}
