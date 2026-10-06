import fs from 'fs'
import path from 'path'

const articlesFilePath = path.join(process.cwd(), 'src', 'data', 'articles.ts')
let content = fs.readFileSync(articlesFilePath, 'utf8')

// 1. In Article 7: add 1 more occurrence of Photobooth Dipoxpo Undip to cross 3.0%
content = content.replace(
  `Layanan Photobooth Dipoxpo Undip ini sukses mencatatkan rekor layanan tanpa ada insiden kertas macet (paper jam) maupun mesin overheat, membuktikan bahwa Sebooth adalah mitra terpercaya nomor satu untuk event kampus berskala masif di Semarang.`,
  `Layanan Photobooth Dipoxpo Undip ini sukses mencatatkan rekor operasional Photobooth Dipoxpo Undip tanpa ada insiden kertas macet maupun mesin overheat, membuktikan bahwa Sebooth adalah mitra terpercaya nomor satu untuk event kampus berskala masif di Semarang.`
)

// 2. In Article 9: trim ~30 words to bring it under 1250 words (around 1200 words)
content = content.replace(
  `Mulai dari festival musik akbar tahunan di PRPP Convention Hall dan Sam Poo Kong, konser musik kampus di Muladi Dome UNDIP, hingga pertunjukan intimate gig di Marina Convention Center (MCC) dan TBRS (Taman Budaya Raden Saleh), puluhan ribu penonton memadati arena konser untuk menyaksikan musisi idola mereka.`,
  `Mulai dari festival akbar di PRPP Convention Hall dan Sam Poo Kong, konser kampus di Muladi Dome UNDIP, hingga venue Marina Convention Center dan TBRS Semarang, puluhan ribu penonton memadati arena konser untuk menyaksikan musisi idola mereka.`
)

content = content.replace(
  `Bagi Anda Event Organizer, promotor festival musik, agensi periklanan, atau pengelola venue di Kota Semarang dan sekitarnya yang sedang merencanakan konser musik akbar, jangan lewatkan kesempatan bermitra bersama Sebooth.`,
  `Bagi Event Organizer dan promotor festival musik di Kota Semarang yang sedang merencanakan konser akbar, jangan lewatkan kesempatan bermitra bersama Sebooth.`
)

content = content.replace(
  `4. Eksekusi Hari H: Tim Sebooth tiba lebih awal untuk instalasi mandiri, uji coba, dan mengawal kesuksesan aktivasi booth dari open gate hingga konser usai.`,
  `4. Eksekusi Hari H: Tim Sebooth tiba awal untuk instalasi mandiri dan mengawal kesuksesan aktivasi booth hingga konser usai.`
)

fs.writeFileSync(articlesFilePath, content, 'utf8')
console.log('Fine-tuned Article 7 and Article 9 successfully!')
