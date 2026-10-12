import fs from 'fs'

let content = fs.readFileSync('src/data/articles.ts', 'utf8')

const marker = 'export const ARTICLES_DATA: ArticleItem[] = ['
const idx = content.indexOf(marker)

if (idx === -1) {
  console.error('Marker not found!')
  process.exit(1)
}

const newTop = `export * from './articleTypes'
import { ArticleItem } from './articleTypes'
import { ARTICLES_CONCERT } from './articles_cluster_concert'
import { ARTICLES_CHRISTMAS } from './articles_cluster_christmas'
import { ARTICLES_MURAH } from './articles_cluster_murah'
import { ARTICLES_TEMBALANG } from './articles_cluster_tembalang'
import { ARTICLES_UNDIP } from './articles_cluster_undip'

`

content = newTop + content.slice(idx)

const lastBracket = content.lastIndexOf(']')
const appendStr = `  ,
  ...ARTICLES_CONCERT,
  ...ARTICLES_CHRISTMAS,
  ...ARTICLES_MURAH,
  ...ARTICLES_TEMBALANG,
  ...ARTICLES_UNDIP
]
`

content = content.slice(0, lastBracket) + appendStr

fs.writeFileSync('src/data/articles.ts', content, 'utf8')
console.log('Successfully updated articles.ts!')
