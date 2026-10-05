import { ARTICLES_DATA } from '../src/data/articles.ts'

console.log('=== SEO KEYWORD DENSITY AUDIT (ai-seo-skills) ===\n')

const targetKeywords = [
  'Photobooth Semarang',
  'Photobooth Tembalang',
  'Photobooth Event Semarang Murah',
  'Sewa Photobooth Semarang',
  'Photobooth Wisuda UNDIP',
]

for (const article of ARTICLES_DATA) {
  console.log(`--------------------------------------------------`)
  console.log(`SLUG: ${article.slug}`)
  console.log(`Title: "${article.title}" (Length: ${article.title.length})`)
  console.log(`Meta Title: "${article.metaTitle}" (Length: ${article.metaTitle.length}) [Target: 40-60]`)
  console.log(`Meta Desc: "${article.metaDescription}" (Length: ${article.metaDescription.length}) [Target: 120-160]`)

  // Combine full text: title, excerpt, highlights, content, sections, faqs
  const sectionTexts = (article.sections || []).flatMap(s => [
    s.heading,
    s.subheading || '',
    ...s.paragraphs,
    ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : [])
  ])

  const fullText = [
    article.title,
    article.excerpt,
    ...article.highlights,
    ...article.content,
    ...sectionTexts,
    ...article.faqs.map(f => `${f.question} ${f.answer}`)
  ].join(' ')

  const words = fullText.split(/\s+/).filter(Boolean)
  const totalWords = words.length

  console.log(`Total Words: ${totalWords} [Target: 800-1000]`)

  const primary = article.targetKeyword
  // Count case-insensitive matches
  const regexPrimary = new RegExp(primary.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
  const primaryMatches = (fullText.match(regexPrimary) || []).length
  const primaryDensity = ((primaryMatches * primary.split(/\s+/).length) / totalWords) * 100
  // Note: SKILL.md definition: Keyword Density = (Keyword Occurrences / Total Words) * 100% or multi-word token density.
  // SKILL.md states: "Target Occurrences = Total Words * 5% = Total Words * 0.05"
  const skillOccurrencesDensity = (primaryMatches / totalWords) * 100

  console.log(`Primary Keyword: "${primary}"`)
  console.log(`  Occurrences: ${primaryMatches}`)
  console.log(`  Density (Occurrences/Words): ${skillOccurrencesDensity.toFixed(2)}% [Target: 3-5%]`)
  console.log(`  Target Occurrences for 5%: ~${Math.round(totalWords * 0.05)}`)

  console.log(`Secondary Keywords:`)
  for (const sec of article.secondaryKeywords) {
    const reg = new RegExp(sec.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    const matches = (fullText.match(reg) || []).length
    console.log(`  - "${sec}": ${matches} occurrences`)
  }
}
