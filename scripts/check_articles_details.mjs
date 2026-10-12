import { ARTICLES_DATA } from '../src/data/articles.ts'

console.log('AUDIT CHECK FOR ARTICLES 20-39:')

for (let i = 19; i < ARTICLES_DATA.length; i++) {
  const a = ARTICLES_DATA[i]
  const sTexts = (a.sections || []).flatMap(s => [
    s.heading,
    s.subheading || '',
    ...s.paragraphs,
    ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : [])
  ])
  const full = [
    a.title,
    a.excerpt,
    ...a.highlights,
    ...a.content,
    ...sTexts,
    ...a.faqs.map(f => f.question + ' ' + f.answer)
  ].join(' ')
  const words = full.split(/\s+/).filter(Boolean)
  const total = words.length

  const titleLen = a.metaTitle.length
  const descLen = a.metaDescription.length

  const regexPrimary = new RegExp(a.targetKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
  const primaryCount = (full.match(regexPrimary) || []).length
  const tokenWeight = ((primaryCount * a.targetKeyword.split(/\s+/).length) / total) * 100

  const secZero = []
  a.secondaryKeywords.forEach(sec => {
    const reg = new RegExp(sec.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    const m = (full.match(reg) || []).length
    if (m === 0) secZero.push(sec)
  })

  const issues = []
  if (total < 800 || total > 1250) issues.push(`Words: ${total}`)
  if (titleLen < 40 || titleLen > 60) issues.push(`TitleLen: ${titleLen}`)
  if (descLen < 120 || descLen > 160) issues.push(`DescLen: ${descLen}`)
  if (secZero.length > 0) issues.push(`Missing Sec: ${secZero.join(', ')}`)

  console.log(`[Art ${i+1}] ${a.slug}: ${issues.length === 0 ? '✅ PASSED' : '⚠️ ' + issues.join(' | ')} (Target: "${a.targetKeyword}", Occur: ${primaryCount}, Weight: ${tokenWeight.toFixed(2)}%)`)
}
