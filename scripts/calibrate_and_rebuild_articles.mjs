import fs from 'fs'

const calibrations = {
  'artikel-20': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Konser Semarang', text: 'Di kancah festival musik Jawa Tengah, layanan Photobooth Konser Semarang menjadi tolok ukur keseruan panggung terbuka.' },
      { kw: 'Sewa Photobooth Festival Musik', text: 'Penyelenggara yang memilih paket Sewa Photobooth Festival Musik Sebooth menikmati instalasi cepat dan operator siaga.' },
      { kw: 'Photobooth Crowd Management', text: 'Sistem cerdas Photobooth Crowd Management menjamin antrean penonton tetap tertib tanpa menghalangi alur sirkulasi venue.' },
      { kw: 'Vendor Dokumentasi Konser', text: 'Sebagai Vendor Dokumentasi Konser terpercaya, Sebooth siap menghadirkan cenderamata cetak fisik bermutu lab bagi ribuan penonton.' }
    ]
  },
  'artikel-21': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Revenue Sharing Photobooth', text: 'Melalui model Revenue Sharing Photobooth, promotor acara mendapatkan bagi hasil penjualan tiket foto secara transparan dan menguntungkan.' },
      { kw: 'Sponsor Activation Photobooth', text: 'Program Sponsor Activation Photobooth membuka ruang promosi interaktif langsung di hadapan penonton muda.' },
      { kw: 'Photobooth Promotor Konser', text: 'Bagi kalangan Photobooth Promotor Konser di Semarang, skema kemitraan ini meniadakan biaya sewa modal di awal.' },
      { kw: 'Sewa Photobooth Semarang', text: 'Kebutuhan Sewa Photobooth Semarang untuk event kampus dan komersial dapat dikonsultasikan secara fleksibel bersama Sebooth.' }
    ]
  },
  'artikel-22': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Anti Antre', text: 'Keunggulan sistem Photobooth Anti Antre Sebooth memadukan hardware industri dan antrean digital QR tanpa hambatan.' },
      { kw: 'Dual Engine Photobooth Semarang', text: 'Penerapan teknologi Dual Engine Photobooth Semarang membuat dua printer bekerja paralel memproses foto penonton secara simultan.' },
      { kw: 'Photobooth Konser Musik', text: 'Efisiensi operasional Photobooth Konser Musik Sebooth sanggup melayani jam-jam puncak sebelum artis utama tampil di panggung.' },
      { kw: 'Vendor Photobooth Semarang', text: 'Kepercayaan klien terhadap Vendor Photobooth Semarang Sebooth dibangun melalui dedikasi kerja cepat dan hasil cetak prima.' }
    ]
  },
  'artikel-23': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Brand Activation Photobooth', text: 'Aktivitas Brand Activation Photobooth terbukti menggandakan ingatan merek penonton terhadap sponsor pendukung festival.' },
      { kw: 'Photobooth Sponsor Konser', text: 'Penempatan logo eksklusif pada Photobooth Sponsor Konser memberikan paparan visual jangka panjang di tangan audiens.' },
      { kw: 'Sewa Photobooth Konser Semarang', text: 'Layanan Sewa Photobooth Konser Semarang Sebooth siap melayani instalasi panggung festival musik indoor maupun outdoor.' },
      { kw: 'Kustom Frame Konser', text: 'Sentuhan grafis Kustom Frame Konser yang estetik membuat penonton dengan bangga membagikan suvenir foto ke media sosial.' }
    ]
  },
  'artikel-24': {
    targetOccurTarget: 11,
    secInjects: [
      { kw: 'Photobooth Natal Gereja Semarang', text: 'Perayaan ibadah Photobooth Natal Gereja Semarang menjadi ruang sukacita bagi jemaat untuk mengabadikan kasih persaudaraan.' },
      { kw: 'Paket Photobooth Natal', text: 'Pilihan Paket Photobooth Natal Sebooth memberikan fleksibilitas durasi operasional yang selaras dengan jadwal kebaktian gereja.' },
      { kw: 'Sewa Photobooth Natal Murah', text: 'Bagi panitia komisi, paket Sewa Photobooth Natal Murah adalah solusi suvenir berkesan tanpa membebani kas gereja.' },
      { kw: 'Photobooth Akhir Tahun Semarang', text: 'Sebagai penyedia Photobooth Akhir Tahun Semarang favorit, Sebooth melayani puluhan perayaan gereja di bulan Desember.' }
    ]
  },
  'artikel-25': {
    targetOccurTarget: 11,
    secInjects: [
      { kw: 'Photobooth Family Gathering Natal', text: 'Kemeriahan Photobooth Family Gathering Natal mencairkan hubungan formal antar karyawan menjadi kehangatan keluarga besar.' },
      { kw: 'Photobooth Kantor Semarang', text: 'Menghadirkan Photobooth Kantor Semarang pada perayaan penutup tahun adalah bentuk apresiasi berharga pimpinan kepada tim kerja.' },
      { kw: 'Sewa Photobooth Murah Natal', text: 'Layanan Sewa Photobooth Murah Natal Sebooth memberikan jaminan cetakan foto berstandar lab bagi seluruh peserta gathering.' },
      { kw: 'Paket Foto Natal Semarang', text: 'Koleksi Paket Foto Natal Semarang Sebooth dilengkapi properti pesta meriah dan dekorasi booth berhias lampu temaram hangat.' }
    ]
  },
  'artikel-26': {
    targetOccurTarget: 11,
    secInjects: [
      { kw: 'Photobooth Natal PMK UNDIP', text: 'Ibadah perayaan Photobooth Natal PMK UNDIP mempererat tali persaudaraan mahasiswa perantau dari berbagai pelosok tanah air.' },
      { kw: 'Photobooth Natal Mahasiswa Semarang', text: 'Keseruan Photobooth Natal Mahasiswa Semarang menjadi momentum hangat yang melengkapi sukacita perayaan rohani kampus.' },
      { kw: 'Cetak Foto Natal Murah', text: 'Fasilitas Cetak Foto Natal Murah Sebooth memungkinkan seluruh pengurus dan anggota membawa pulang kenangan fisik berkualitas.' },
      { kw: 'Photobooth Natal Tembalang', text: 'Lokasi workshop Photobooth Natal Tembalang menjamin pengiriman booth tepat waktu bebas biaya transportasi kampus.' }
    ]
  },
  'artikel-27': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Ultah Semarang', text: 'Keseruan Photobooth Ultah Semarang Sebooth menghidupkan suasana pesta ulang tahun dengan canda tawa para sahabat.' },
      { kw: 'Sewa Photobooth Sweet 17 Semarang', text: 'Momen berharga Sewa Photobooth Sweet 17 Semarang memberikan kenangan istimewa saat menginjak usia dewasa muda.' },
      { kw: 'Tarif Photobooth Murah Semarang', text: 'Transparansi Tarif Photobooth Murah Semarang Sebooth memudahkan penyelenggara menyesuaikan paket dengan bujet pesta.' },
      { kw: 'Photobooth Cetak Instan', text: 'Keunggulan Photobooth Cetak Instan Sebooth menghasilkan lembaran foto fisik berkualitas tinggi dalam belasan detik.' }
    ]
  },
  'artikel-28': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Harga Sewa Photobooth Semarang', text: 'Konsumen cerdas selalu membandingkan Harga Sewa Photobooth Semarang dengan kualitas perangkat keras yang digunakan vendor.' },
      { kw: 'Vendor Photobooth Murah Semarang', text: 'Memilih Vendor Photobooth Murah Semarang Sebooth menjamin foto tajam dengan pencahayaan studio yang merata.' },
      { kw: 'Tips Memilih Photobooth Semarang', text: 'Salah satu Tips Memilih Photobooth Semarang terpenting adalah memastikan printer menggunakan sistem thermal tahan air.' },
      { kw: 'Photobooth Murah Berkualitas', text: 'Layanan Photobooth Murah Berkualitas Sebooth membuktikan bahwa efisiensi biaya tetap bisa berdampingan dengan mutu tinggi.' }
    ]
  },
  'artikel-29': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Gathering Semarang', text: 'Dokumentasi Photobooth Gathering Semarang Sebooth menyatukan kerabat lintas generasi dalam satu bingkai kebersamaan.' },
      { kw: 'Photobooth Arisan Semarang', text: 'Ibu-ibu dan keluarga besar sangat menggemari Photobooth Arisan Semarang karena foto fisik langsung jadi tanpa antre.' },
      { kw: 'Sewa Booth Foto Murah Semarang', text: 'Pilihan Sewa Booth Foto Murah Semarang Sebooth sangat cocok untuk patungan santai anggota komunitas arisan.' },
      { kw: 'Photobooth Komunitas Semarang', text: 'Agenda kopi darat Photobooth Komunitas Semarang semakin semarak dengan koleksi properti foto unik dan lucu.' }
    ]
  },
  'artikel-30': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Unlimited Semarang', text: 'Paket Photobooth Unlimited Semarang memberikan kebebasan bagi para tamu untuk berfoto sepuasnya tanpa rasa cemas.' },
      { kw: 'Photobooth Live GIF Semarang', text: 'Fitur interaktif Photobooth Live GIF Semarang mengompilasi pose menjadi video animasi pendek yang siap viral di medsos.' },
      { kw: 'Paket Photobooth Murah Semarang', text: 'Fleksibilitas Paket Photobooth Murah Semarang Sebooth dapat disesuaikan dengan kebutuhan durasi acara resepsi.' },
      { kw: 'Cetak Foto Instan Semarang', text: 'Teknologi Cetak Foto Instan Semarang Sebooth menjamin lembaran foto kering seketika dengan lapisan laminasi glossy.' }
    ]
  },
  'artikel-31': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Tembalang Terbaik', text: 'Gelar Photobooth Tembalang Terbaik disandang Sebooth berkat konsistensi mutu cetak dan kepuasan ribuan mahasiswa.' },
      { kw: 'Sewa Photobooth Tembalang', text: 'Kemudahan Sewa Photobooth Tembalang Sebooth didukung pemesanan cepat via WhatsApp dan asistensi desain gratis.' },
      { kw: 'Photobooth Semarang Atas', text: 'Layanan Photobooth Semarang Atas Sebooth menjangkau seluruh kawasan Tembalang, Banyumanik, hingga Gunungpati.' },
      { kw: 'Spot Foto Tembalang', text: 'Booth Sebooth selalu menjadi Spot Foto Tembalang paling ramai dikunjungi saat perhelatan wisuda dan festival kampus.' }
    ]
  },
  'artikel-32': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Cafe Tembalang', text: 'Konsep estetik Photobooth Cafe Tembalang Sebooth berpadu selaras dengan tata ruang kedai kopi modern Semarang Atas.' },
      { kw: 'Photobooth Intimate Party Tembalang', text: 'Bagi perayaan privat, Photobooth Intimate Party Tembalang menghadirkan nuansa eksklusif yang hangat bagi sahabat.' },
      { kw: 'Vendor Photobooth Tembalang', text: 'Reputasi Vendor Photobooth Tembalang Sebooth dikenal luas oleh pengelola cafe berkat instalasi yang rapi dan aman.' },
      { kw: 'Harga Photobooth Tembalang', text: 'Keterjangkauan Harga Photobooth Tembalang Sebooth menjadikannya pilihan favorit untuk perayaan bridal shower dan ultah.' }
    ]
  },
  'artikel-33': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Vendor Rekomendasi Tembalang', text: 'Status Sebooth sebagai Vendor Rekomendasi Tembalang lahir dari dedikasi melayani komunitas kampus dengan standar prima.' },
      { kw: 'Photobooth Estetik Tembalang', text: 'Desain visual Photobooth Estetik Tembalang Sebooth sangat diminati generasi muda yang mendambakan foto kekinian.' },
      { kw: 'Sewa Booth Foto Tembalang', text: 'Kepraktisan Sewa Booth Foto Tembalang Sebooth menjamin ketepatan waktu pemasangan sebelum tamu acara berdatangan.' },
      { kw: 'Photobooth Tembalang Murah', text: 'Paket hemat Photobooth Tembalang Murah Sebooth membuktikan bahwa kualitas studio lab dapat dinikmati semua kalangan.' }
    ]
  },
  'artikel-34': {
    targetOccurTarget: 20,
    secInjects: [
      { kw: 'Photobooth Wisuda UNDIP', text: 'Momen kebanggaan Photobooth Wisuda UNDIP diabadikan sempurna bersama keluarga besar di pelataran Gedung Prof. Soedarto.' },
      { kw: 'Photobooth Gedung Soedarto', text: 'Instalasi Photobooth Gedung Soedarto Sebooth memudahkan wisudawan berfoto tanpa perlu antre studio di luar kampus.' },
      { kw: 'Sewa Photobooth UNDIP', text: 'Layanan Sewa Photobooth UNDIP Sebooth menyediakan berbagai pilihan paket batch maupun durasi operasional penuh.' },
      { kw: 'Photobooth Kampus UNDIP Tembalang', text: 'Kedekatan lokasi Photobooth Kampus UNDIP Tembalang menjamin bebas biaya transportasi untuk seluruh fakultas kampus atas.' }
    ]
  },
  'artikel-35': {
    targetOccurTarget: 20,
    secInjects: [
      { kw: 'Photobooth Muladi Dome', text: 'Kemegahan Photobooth Muladi Dome Sebooth sanggup menampung antusiasme ribuan peserta seminar akbar dan konser musik.' },
      { kw: 'Photobooth Expo UNDIP', text: 'Stan Photobooth Expo UNDIP Sebooth selalu dipadati pengunjung pameran inovasi riset dan bursa kerja mahasiswa.' },
      { kw: 'Vendor Photobooth UNDIP', text: 'Pengalaman Vendor Photobooth UNDIP Sebooth menangani venue besar memastikan alur pengunjung mengalir lancar.' },
      { kw: 'Photobooth Dies Natalis UNDIP', text: 'Perayaan tahunan Photobooth Dies Natalis UNDIP semakin semarak dengan suvenir cetak foto instan berkualitas laboratorium.' }
    ]
  },
  'artikel-36': {
    targetOccurTarget: 20,
    secInjects: [
      { kw: 'Photobooth BEM UNDIP', text: 'Kolaborasi Photobooth BEM UNDIP bersama Sebooth menghadirkan stan foto interaktif yang memeriahkan festival budaya kampus.' },
      { kw: 'Photobooth Festival UNDIP', text: 'Daya tarik Photobooth Festival UNDIP sukses menyedot perhatian mahasiswa antar jurusan untuk berfoto bersama.' },
      { kw: 'Sewa Booth Foto UNDIP', text: 'Kemudahan Sewa Booth Foto UNDIP Sebooth memberikan potongan harga kepanitiaan ormawa yang ramah anggaran kas.' },
      { kw: 'Photobooth Mahasiswa Kampus UNDIP', text: 'Suvenir foto dari Photobooth Mahasiswa Kampus UNDIP Sebooth menjadi kenangan berharga kebersamaan selama masa perkuliahan.' }
    ]
  },
  'artikel-37': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth UKM UNDIP', text: 'Kehadiran Photobooth UKM UNDIP Sebooth mempererat rasa kekeluargaan dan soliditas anggota kepengurusan organisasi.' },
      { kw: 'Photobooth Hemat Mahasiswa UNDIP', text: 'Paket Photobooth Hemat Mahasiswa UNDIP dirancang agar tidak membebani kas himpunan dan unit kegiatan kemahasiswaan.' },
      { kw: 'Sewa Photobooth Murah UNDIP', text: 'Pilihan Sewa Photobooth Murah UNDIP Sebooth memberikan fasilitas lengkap kustom frame dan cetak foto lab tahan air.' },
      { kw: 'Photobooth Organisasi UNDIP', text: 'Dokumentasi Photobooth Organisasi UNDIP menjadi arsip berharga pelaporan pertanggungjawaban kepengurusan kabinet.' }
    ]
  },
  'artikel-38': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Sidang Skripsi UNDIP', text: 'Selebrasi Photobooth Sidang Skripsi UNDIP bersama circle sahabat kos menjadi penanda tuntasnya perjuangan tugas akhir.' },
      { kw: 'Foto Wisuda Mahasiswa UNDIP', text: 'Kenangan manis Foto Wisuda Mahasiswa UNDIP Sebooth siap dipajang di dinding kamar kos sebelum kembali ke kampung halaman.' },
      { kw: 'Photobooth Tembalang Mahasiswa', text: 'Akses mudah Photobooth Tembalang Mahasiswa Sebooth melayani perayaan kelulusan sidang di berbagai fakultas kampus.' },
      { kw: 'Suvenir Foto Mahasiswa UNDIP', text: 'Lembaran suvenir Suvenir Foto Mahasiswa UNDIP Sebooth memiliki ketahanan puluhan tahun berkat lapisan laminasi pelindung.' }
    ]
  },
  'artikel-39': {
    targetOccurTarget: 14,
    secInjects: [
      { kw: 'Photobooth Angkatan UNDIP', text: 'Kekompakan Photobooth Angkatan UNDIP terekam abadi lewat foto bersama satu jurusan dengan lensa studio bersudut lebar.' },
      { kw: 'Kenangan Kuliah Mahasiswa UNDIP', text: 'Memori indah Kenangan Kuliah Mahasiswa UNDIP di Tembalang tersimpan nyata dalam lembaran fisik bermutu tinggi.' },
      { kw: 'Photobooth Tembalang Murah', text: 'Tarif bersahabat Photobooth Tembalang Murah Sebooth menjadikan iuran patungan gathering angkatan terasa sangat ringan.' },
      { kw: 'Photobooth Semarang Mahasiswa', text: 'Pelayanan prima Photobooth Semarang Mahasiswa Sebooth siap mendampingi malam keakraban dan perpisahan angkatan kampus.' }
    ]
  }
}

import('../src/data/articles.ts').then(({ ARTICLES_DATA }) => {
  for (let i = 19; i < ARTICLES_DATA.length; i++) {
    const art = ARTICLES_DATA[i]
    const cfg = calibrations[art.id] || calibrations[art.slug]
    if (!cfg) {
      console.log('Skipping art', art.id, 'no cfg found')
      continue
    }

    // 1. Inject each secondary keyword into sections
    if (art.sections && art.sections.length >= 4) {
      cfg.secInjects.forEach((inj, idx) => {
        const secIndex = idx % art.sections.length
        // Push full paragraph
        art.sections[secIndex].paragraphs.push(inj.text)
        // Also naturally weave keyword into second paragraph
        if (art.sections[secIndex].paragraphs.length > 1) {
          art.sections[secIndex].paragraphs[1] += ` Keunggulan ini memperkuat reputasi ${inj.kw} Sebooth sebagai pilihan terdepan di Kota Semarang.`
        }
      })
    }

    // 2. Add extra rich paragraph to reach >= 950 words
    if (art.sections && art.sections.length > 0) {
      const lastSec = art.sections[art.sections.length - 1]
      lastSec.paragraphs.push(
        `Komitmen mutu Sebooth di kawasan Semarang dan Tembalang memastikan setiap sesi foto berjalan dengan standar operasional terbaik. Tim profesional kami siap mendampingi kebutuhan acara Anda dengan kehangatan dan dedikasi penuh.`
      )
    }

    // 3. Calibrate primary keyword occurrences
    let getFullText = () => {
      const sTexts = (art.sections || []).flatMap(s => [
        s.heading,
        s.subheading || '',
        ...s.paragraphs,
        ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : [])
      ])
      return [
        art.title,
        art.excerpt,
        ...art.highlights,
        ...art.content,
        ...sTexts,
        ...art.faqs.map(f => f.question + ' ' + f.answer)
      ].join(' ')
    }

    const regexPrimary = new RegExp(art.targetKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    let currentOccur = (getFullText().match(regexPrimary) || []).length
    let desiredOccur = cfg.targetOccurTarget

    // If current occurrences > desiredOccur, replace excess in section paragraphs
    if (currentOccur > desiredOccur) {
      let excess = currentOccur - desiredOccur
      for (let s of art.sections) {
        if (excess <= 0) break
        for (let pIdx = 0; pIdx < s.paragraphs.length; pIdx++) {
          if (excess <= 0) break
          if (s.paragraphs[pIdx].includes(art.targetKeyword)) {
            s.paragraphs[pIdx] = s.paragraphs[pIdx].replace(art.targetKeyword, 'layanan foto instan Sebooth')
            excess--
          }
        }
      }
    }
  }

  // Format code cleanly
  const interfacesHeader = `export interface ArticleSection {
  heading: string
  subheading?: string
  paragraphs: string[]
  table?: {
    headers: string[]
    rows: string[][]
  }
}

export interface ArticleItem {
  id: string
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  targetKeyword: string
  secondaryKeywords: string[]
  category: 'EVENT SEMARANG' | 'TIPS & PANDUAN' | 'KAMPUS & WISUDA' | 'WEDDING' | 'KONSER & FESTIVAL'
  date: string
  readTime: string
  author: string
  coverImage: string
  excerpt: string
  content: string[]
  sections?: ArticleSection[]
  highlights: string[]
  faqs: { question: string; answer: string }[]
  igLink?: string
}

export const ARTICLES_DATA: ArticleItem[] = `

  const code = interfacesHeader + JSON.stringify(ARTICLES_DATA, null, 2) + '\n'
  fs.writeFileSync('src/data/articles.ts', code, 'utf8')
  console.log('Successfully calibrated all 39 articles in src/data/articles.ts!')
}).catch(err => {
  console.error('Error in calibration:', err)
  process.exit(1)
})
