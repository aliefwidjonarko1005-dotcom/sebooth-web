import fs from 'fs';
import path from 'path';

const slides = [
  {
    num: '01',
    id: 'hero',
    title: 'SEBOOTH MOMENMU',
    subtitle: 'Momen seru, cetak instan & softfile ke HP',
    file: 'slide-01-hero.png',
    gradient: ['#001845', '#002366', '#03045E'],
    accent: '#FF4500',
    type: 'HERO BANNER & GREETING',
  },
  {
    num: '02',
    id: 'services',
    title: 'SEBUTIN APA YANG LOE MAU!',
    subtitle: 'Batch Booking, All You Can Photos & Partnership',
    file: 'slide-02-services.png',
    gradient: ['#052c1e', '#0F3D2E', '#09402e'],
    accent: '#25D366',
    type: 'OUR SERVICES & PACKAGES',
  },
  {
    num: '03',
    id: 'frames',
    title: 'EXCLUSIVE FRAMES',
    subtitle: 'Koleksi Template Frame Aesthetic & Custom Branding',
    file: 'slide-03-frames.png',
    gradient: ['#1c1917', '#292524', '#18181b'],
    accent: '#D4AF37',
    type: 'FEATURED FRAMES & GALLERY',
  },
  {
    num: '04',
    id: 'pricing',
    title: 'PRICELIST & PACKAGES',
    subtitle: 'Pilihan Paket Sewa Transparan & All-In',
    file: 'slide-04-pricing.png',
    gradient: ['#0f172a', '#1e293b', '#0f172a'],
    accent: '#38bdf8',
    type: 'PRICING & RENTAL PACKAGES',
  },
  {
    num: '05',
    id: 'partnership',
    title: 'B2B & EVENT PARTNERSHIP',
    subtitle: 'Solusi Khusus Wedding Organizer & Event Organizer',
    file: 'slide-05-partnership.png',
    gradient: ['#2e1065', '#3b0764', '#1e1b4b'],
    accent: '#c084fc',
    type: 'B2B PARTNERSHIP PROGRAM',
  },
  {
    num: '06',
    id: 'contact',
    title: 'FAQ & HUBUNGI KAMI',
    subtitle: 'Tanya Jawab, Lokasi Studio & Reservasi WhatsApp',
    file: 'slide-06-contact.png',
    gradient: ['#022c22', '#064e3b', '#022c22'],
    accent: '#25D366',
    type: 'FAQ, STUDIO & BOOKING CTA',
  },
];

const publicDir = path.resolve(process.cwd(), 'public/images/slides');
const desktopDir = path.join(publicDir, 'desktop');
const mobileDir = path.join(publicDir, 'mobile');
const placeholdersDir = path.join(publicDir, 'placeholders');

[publicDir, desktopDir, mobileDir, placeholdersDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

slides.forEach((s) => {
  // Desktop SVG (1920 x 1080)
  const desktopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bgDesk${s.num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${s.gradient[0]}"/>
      <stop offset="50%" stop-color="${s.gradient[1]}"/>
      <stop offset="100%" stop-color="${s.gradient[2]}"/>
    </linearGradient>
    <radialGradient id="glowDesk${s.num}" cx="80%" cy="25%" r="50%">
      <stop offset="0%" stop-color="${s.accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="gridDesk${s.num}" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    </pattern>
  </defs>
  
  <rect width="1920" height="1080" fill="url(#bgDesk${s.num})"/>
  <rect width="1920" height="1080" fill="url(#glowDesk${s.num})"/>
  <rect width="1920" height="1080" fill="url(#gridDesk${s.num})"/>

  <rect x="40" y="40" width="1840" height="1000" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" rx="24"/>
  <rect x="44" y="44" width="1832" height="992" fill="none" stroke="${s.accent}" stroke-width="1.2" stroke-dasharray="12 8" rx="20"/>

  <rect x="100" y="90" width="140" height="46" rx="23" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)"/>
  <text x="170" y="120" font-family="'Poppins', sans-serif" font-weight="700" font-size="18" fill="#D4AF37" text-anchor="middle" letter-spacing="2">SLIDE ${s.num}</text>

  <rect x="260" y="90" width="220" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="${s.accent}"/>
  <text x="370" y="120" font-family="'Poppins', sans-serif" font-weight="600" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">DESKTOP (16:9)</text>

  <text x="100" y="300" font-family="'Poppins', sans-serif" font-weight="900" font-size="64" fill="#FFFFFF" letter-spacing="-0.5">
    ${s.title}
  </text>
  <text x="100" y="360" font-family="'Poppins', sans-serif" font-weight="400" font-size="26" fill="rgba(255,255,255,0.85)">
    ${s.subtitle}
  </text>

  <rect x="100" y="440" width="880" height="380" rx="20" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  
  <text x="140" y="500" font-family="'Poppins', sans-serif" font-weight="700" font-size="22" fill="${s.accent}">
    📸 AREA DESAIN GAMBAR SLIDE ${s.num} (${s.type})
  </text>
  
  <text x="140" y="560" font-family="'Poppins', sans-serif" font-weight="500" font-size="18" fill="#EAEAEA">
    • Resolusi Rekomendasi : 1920 × 1080 px (Landscape 16:9)
  </text>
  <text x="140" y="605" font-family="'Poppins', sans-serif" font-weight="500" font-size="18" fill="#EAEAEA">
    • Target File Simpan : public/images/slides/desktop/${s.file}
  </text>
  <text x="140" y="650" font-family="'Poppins', sans-serif" font-weight="500" font-size="18" fill="#EAEAEA">
    • Format File : .png atau .webp (transparan atau solid background)
  </text>
  <text x="140" y="695" font-family="'Poppins', sans-serif" font-weight="500" font-size="18" fill="#EAEAEA">
    • Tips : Sisakan ruang kanan/bawah untuk tombol interaktif & navigasi
  </text>
  <text x="140" y="750" font-family="'Poppins', sans-serif" font-weight="600" font-size="18" fill="#9CA3AF">
    • Status : [ Siap Digantikan dengan PNG Anda ]
  </text>

  <rect x="1060" y="220" width="720" height="660" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <circle cx="1420" cy="520" r="130" fill="rgba(255,255,255,0.03)" stroke="${s.accent}" stroke-width="2.5" stroke-dasharray="10 6"/>
  <text x="1420" y="515" font-family="'Poppins', sans-serif" font-weight="800" font-size="28" fill="#FFFFFF" text-anchor="middle">VISUAL MOCKUP</text>
  <text x="1420" y="555" font-family="'Poppins', sans-serif" font-weight="600" font-size="17" fill="#D4AF37" text-anchor="middle">SLIDE ${s.num}</text>

  <text x="100" y="980" font-family="'Poppins', sans-serif" font-weight="600" font-size="16" fill="rgba(255,255,255,0.5)">
    SEBOOTH INDONESIA • WEB SLIDE DECK SYSTEM
  </text>
</svg>`;

  // Mobile SVG (1080 x 1920)
  const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="bgMob${s.num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${s.gradient[0]}"/>
      <stop offset="50%" stop-color="${s.gradient[1]}"/>
      <stop offset="100%" stop-color="${s.gradient[2]}"/>
    </linearGradient>
    <radialGradient id="glowMob${s.num}" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${s.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="gridMob${s.num}" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    </pattern>
  </defs>

  <rect width="1080" height="1920" fill="url(#bgMob${s.num})"/>
  <rect width="1080" height="1920" fill="url(#glowMob${s.num})"/>
  <rect width="1080" height="1920" fill="url(#gridMob${s.num})"/>

  <rect x="32" y="32" width="1016" height="1856" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" rx="28"/>
  <rect x="36" y="36" width="1008" height="1848" fill="none" stroke="${s.accent}" stroke-width="1.2" stroke-dasharray="10 6" rx="24"/>

  <rect x="64" y="140" width="130" height="44" rx="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)"/>
  <text x="129" y="168" font-family="'Poppins', sans-serif" font-weight="700" font-size="16" fill="#D4AF37" text-anchor="middle" letter-spacing="2">SLIDE ${s.num}</text>

  <rect x="210" y="140" width="190" height="44" rx="22" fill="rgba(255,255,255,0.08)" stroke="${s.accent}"/>
  <text x="305" y="168" font-family="'Poppins', sans-serif" font-weight="600" font-size="15" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">MOBILE (9:16)</text>

  <text x="64" y="320" font-family="'Poppins', sans-serif" font-weight="900" font-size="56" fill="#FFFFFF" letter-spacing="-0.5">
    ${s.title}
  </text>
  <text x="64" y="385" font-family="'Poppins', sans-serif" font-weight="400" font-size="24" fill="rgba(255,255,255,0.85)">
    ${s.subtitle}
  </text>

  <rect x="64" y="470" width="952" height="660" rx="24" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <circle cx="540" cy="780" r="130" fill="rgba(255,255,255,0.03)" stroke="${s.accent}" stroke-width="2.5" stroke-dasharray="10 6"/>
  <text x="540" y="780" font-family="'Poppins', sans-serif" font-weight="800" font-size="28" fill="#FFFFFF" text-anchor="middle">${s.type}</text>
  <text x="540" y="820" font-family="'Poppins', sans-serif" font-weight="600" font-size="18" fill="#D4AF37" text-anchor="middle">SLIDE ${s.num} MOBILE</text>

  <rect x="64" y="1180" width="952" height="480" rx="20" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  
  <text x="104" y="1245" font-family="'Poppins', sans-serif" font-weight="700" font-size="24" fill="${s.accent}">
    📱 AREA DESAIN GAMBAR MOBILE (HP)
  </text>
  
  <text x="104" y="1310" font-family="'Poppins', sans-serif" font-weight="500" font-size="22" fill="#EAEAEA">
    • Resolusi : 1080 × 1920 px (Rasio 9:16)
  </text>
  <text x="104" y="1370" font-family="'Poppins', sans-serif" font-weight="500" font-size="22" fill="#EAEAEA">
    • Target File : public/images/slides/mobile/${s.file}
  </text>
  <text x="104" y="1430" font-family="'Poppins', sans-serif" font-weight="500" font-size="22" fill="#EAEAEA">
    • Tips : Letakkan visual penting di tengah layar
  </text>
  <text x="104" y="1490" font-family="'Poppins', sans-serif" font-weight="500" font-size="22" fill="#EAEAEA">
    • Navigasi : Geser / Swipe naik-turun untuk berganti slide
  </text>
  <text x="104" y="1560" font-family="'Poppins', sans-serif" font-weight="600" font-size="20" fill="#9CA3AF">
    • Status : [ Menunggu File PNG Anda ]
  </text>

  <text x="540" y="1790" font-family="'Poppins', sans-serif" font-weight="600" font-size="20" fill="rgba(255,255,255,0.5)" text-anchor="middle">
    SEBOOTH INDONESIA • SLIDE DECK SYSTEM
  </text>
</svg>`;

  fs.writeFileSync(path.join(placeholdersDir, `desktop-slide-${s.num}.svg`), desktopSvg);
  fs.writeFileSync(path.join(placeholdersDir, `mobile-slide-${s.num}.svg`), mobileSvg);
});

console.log('All 6 desktop and mobile SVG placeholders generated successfully!');
