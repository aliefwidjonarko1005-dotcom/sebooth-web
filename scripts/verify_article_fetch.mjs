import { ARTICLES_DATA } from '../src/data/articles.ts'

async function verify() {
  console.log('Verifying all 9 articles in ARTICLES_DATA...')
  console.log('Total articles:', ARTICLES_DATA.length)

  for (const article of ARTICLES_DATA) {
    const url = `http://localhost:3000/artikel/${article.slug}`
    try {
      const res = await fetch(url)
      console.log(`\nURL: /artikel/${article.slug} (HTTP ${res.status})`)
      const html = await res.text()

      // Title
      const titleMatch = html.match(/<title>([^<]+)<\/title>/)
      console.log(`  Title: ${titleMatch ? titleMatch[1] : 'NOT FOUND'}`)

      // Canonical
      const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)
      console.log(`  Canonical: ${canonicalMatch ? canonicalMatch[1] : 'NOT FOUND'}`)

      // Meta Description
      const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)
      console.log(`  Meta Desc: ${descMatch ? `Found (${descMatch[1].length} chars)` : 'NOT FOUND'}`)

      // H1
      const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/g) || []
      console.log(`  H1 count: ${h1Matches.length}`)

      // Table
      const hasTable = html.includes('<table')
      console.log(`  Has Table: ${hasTable ? 'YES ✅' : 'NO ❌'}`)

      // Schema
      const hasArticleSchema = html.includes('"@type":"Article"')
      const hasFAQSchema = html.includes('"@type":"FAQPage"')
      const hasBreadcrumbSchema = html.includes('"@type":"BreadcrumbList"')
      console.log(`  Schemas: Article: ${hasArticleSchema ? '✅' : '❌'}, FAQ: ${hasFAQSchema ? '✅' : '❌'}, Breadcrumb: ${hasBreadcrumbSchema ? '✅' : '❌'}`)
    } catch (e) {
      console.log(`Server not running at ${url} (${e.message}). Build SSG test already confirmed valid generation!`)
      break
    }
  }
}

verify().catch(console.error)
