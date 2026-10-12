import fs from 'fs'

const original = fs.readFileSync('src/data/articles.ts', 'utf8')

const lastBracket = original.lastIndexOf(']')
if (lastBracket === -1) {
  console.error("Last bracket not found in articles.ts!")
  process.exit(1)
}

function getItems(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const equalsBracket = code.indexOf('= [')
  if (equalsBracket === -1) {
    console.error("= [ not found in " + filePath)
    process.exit(1)
  }
  const lastB = code.lastIndexOf(']')
  return code.slice(equalsBracket + 3, lastB).trim()
}

const concertItems = getItems('src/data/articles_cluster_concert.ts')
const christmasItems = getItems('src/data/articles_cluster_christmas.ts')
const murahItems = getItems('src/data/articles_cluster_murah.ts')
const tembalangItems = getItems('src/data/articles_cluster_tembalang.ts')
const undipItems = getItems('src/data/articles_cluster_undip.ts')

const before = original.slice(0, lastBracket).trimEnd()
const updated = before + ',\n' +
  concertItems + ',\n' +
  christmasItems + ',\n' +
  murahItems + ',\n' +
  tembalangItems + ',\n' +
  undipItems + '\n]\n'

fs.writeFileSync('src/data/articles.ts', updated, 'utf8')
console.log('Appended all 20 articles cleanly to ARTICLES_DATA in src/data/articles.ts!')
