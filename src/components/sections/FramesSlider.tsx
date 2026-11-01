"use client"

import React, { useCallback, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { frameImage } from '@/data/frameEvents'
import { whatsappUrl } from '@/config/social'
import { useModalFocus } from '@/lib/useModalFocus'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface FrameCardItem {
  id: string
  title: string
  category: string
  subtitle: string
  desc: string
  image: string
  cardBgGradient: string
  buttonBgGradient: string
  badgeBg: string
  features: string[]
  dimensions: string
}

const FRAME_ITEMS: FrameCardItem[] = [
  {
    id: 'frame-1-1',
    title: 'BLACK & GOLD BEM UNDIP FAREWELL',
    category: 'ELEGANT PARTY',
    subtitle: 'Pola Heksagon Hitam Emas & Glitter Luxury',
    desc: 'Bingkai perpisahan bertema malam penghargaan dengan kombinasi pola heksagon hitam emas berglitter, logo BEM UNDIP 2025, dan pembatas emas bernuansa mewah.',
    image: '/images/frames/1.1.png',
    cardBgGradient: 'from-slate-900 via-zinc-900 to-black',
    buttonBgGradient: 'from-slate-800 to-zinc-900',
    badgeBg: 'bg-amber-300/20 text-amber-200 border-amber-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Pola Heksagon Hitam-Emas Glitter', 'Logo & Branding BEM UNDIP 2025', 'Bingkai Border Emas Luxury', 'Format 3 Pose Landscape']
  },
  {
    id: 'frame-1-2',
    title: 'BURGUNDY VELVET BEM UNDIP',
    category: 'ELEGANT PARTY',
    subtitle: 'Pola Heksagon Merah Burgundy & Glitter Emas',
    desc: 'Nuansa malam perpisahan yang mewah dengan kombinasi warna merah burgundy velvet, aksen heksagon keemasan berglitter, dan header resmi Farewell BEM UNDIP.',
    image: '/images/frames/1.2.png',
    cardBgGradient: 'from-[#18181b] via-[#27272a] to-[#09090b]',
    buttonBgGradient: 'from-[#27272a] to-[#18181b]',
    badgeBg: 'bg-rose-300/20 text-rose-200 border-rose-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Latar Belakang Burgundy Velvet', 'Glitter Emas & Pola Heksagon', 'Typography Farewell BEM UNDIP', 'Format 3 Pose Landscape']
  },
  {
    id: 'frame-2-1',
    title: 'VIOLET BATIK FIRST GATHERING HMTI',
    category: 'ACADEMIC EVENT',
    subtitle: 'Motif Batik Ungu & Sketsa Arsitektur Teknik Industri',
    desc: 'Bingkai acara keakraban mahasiswa bertema tradisional-modern dengan motif batik bunga berwarna ungu violet, teks 3D First Gathering HMTI, dan sketsa arsitektur gedung perkuliahan Teknik Industri.',
    image: '/images/frames/2.1.png',
    cardBgGradient: 'from-[#2e1065] via-[#3b0764] to-[#581c87]',
    buttonBgGradient: 'from-[#3b0764] to-[#581c87]',
    badgeBg: 'bg-purple-300/20 text-purple-200 border-purple-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Motif Batik Floral Ungu Violet', 'Teks 3D First Gathering HMTI', 'Sketsa Gedung Teknik Industri', 'Format 3 Pose Landscape']
  },
  {
    id: 'frame-2-2',
    title: 'SKY BLUE BATIK HMTI GATHERING',
    category: 'ACADEMIC EVENT',
    subtitle: 'Motif Batik Biru Muda & Sketsa Kampus Teknik Industri',
    desc: 'Varian warna biru langit yang segar dengan motif batik tradisional, huruf 3D oranye-kuning First Gathering HMTI, serta gambar lukisan garis gedung Teknik Industri.',
    image: '/images/frames/2.2.png',
    cardBgGradient: 'from-[#0284c7] via-[#0369a1] to-[#075985]',
    buttonBgGradient: 'from-[#0284c7] to-[#0369a1]',
    badgeBg: 'bg-sky-300/20 text-sky-100 border-sky-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Motif Batik Tradisional Biru Langit', 'Typography 3D Yellow-Orange', 'Sketsa Kampus Teknik Industri', 'Vibes Fresh Academic Gathering']
  },
  {
    id: 'frame-3-1',
    title: 'PIRATE ADVENTURE WELCOMING PARTY',
    category: 'THEMATIC PARTY',
    subtitle: 'Maskot Beruang Bajak Laut & Peta Harta Karun BEM UNDIP',
    desc: 'Tema petualangan laut yang seru dengan maskot beruang berpakaian bajak laut, latar tekstur pasir pantai, peta harta karun, dan tulisan Welcoming Party Dipanegara BEM UNDIP 2026.',
    image: '/images/frames/3.1.png',
    cardBgGradient: 'from-[#78350f] via-[#92400e] to-[#b45309]',
    buttonBgGradient: 'from-[#78350f] to-[#92400e]',
    badgeBg: 'bg-amber-300/20 text-amber-100 border-amber-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Maskot 3D Beruang Bajak Laut', 'Tekstur Kertas Peta Harta Karun', 'Header Welcoming Party Dipanegara', 'Latar Pasir Pantai & Tali Tambang']
  },
  {
    id: 'frame-3-2',
    title: 'OCEAN SAILBOAT WELCOMING PARTY',
    category: 'WATERCOLOR ART',
    subtitle: 'Gelombang Laut Soft Pastel & Ilustrasi Kapal Layar',
    desc: 'Estetika lukisan cat air laut bernuansa ungu-biru pastel yang tenang, dilengkapi ilustrasi kapal layar yang mengarungi ombak dan tipografi Welcoming Party BEM UNDIP 2026.',
    image: '/images/frames/3.2.png',
    cardBgGradient: 'from-[#1e1b4b] via-[#312e81] to-[#1e40af]',
    buttonBgGradient: 'from-[#1e1b4b] to-[#312e81]',
    badgeBg: 'bg-indigo-300/20 text-indigo-100 border-indigo-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Lukisan Cat Air Ocean Waves', 'Ilustrasi Kapal Layar Watercolor', 'Gradasi Soft Purple & Blue', 'Header Official BEM UNDIP 2026']
  },
  {
    id: 'frame-4-1',
    title: 'JAPANESE WAVE & DEKANAT FT BEM',
    category: 'ACADEMIC EVENT',
    subtitle: 'Ombak Jepang Blue-Gold & Sketsa Gedung Dekanat FT',
    desc: 'Perpaduan estetika seni ombak Jepang bertema biru tua-emas dengan sketsa arsitektur gedung Dekanat Fakultas Teknik UNDIP untuk perayaan Welcoming Party BEM FT 2026.',
    image: '/images/frames/4.1.png',
    cardBgGradient: 'from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af]',
    buttonBgGradient: 'from-[#1e3a8a] to-[#1d4ed8]',
    badgeBg: 'bg-blue-300/20 text-blue-100 border-blue-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Seni Ombak & Matahari Jepang', 'Sketsa Line-Art Gedung Dekanat FT', 'Skema Warna Royal Blue & Gold', 'Header Official BEM FT 2026']
  },
  {
    id: 'frame-4-2',
    title: 'TEAL PAPERCUT SUN & WAVES',
    category: 'MODERN ART',
    subtitle: 'Layer Papercraft Toska & Matahari Terbit Emas',
    desc: 'Bingkai seni potong kertas (papercut 3D) bertingkat dengan nuansa warna hijau toska, latar belakang laut, matahari emas melengkung, dan tipografi Welcoming Party BEM FT 2026.',
    image: '/images/frames/4.2.png',
    cardBgGradient: 'from-[#0f766e] via-[#115e59] to-[#134e4a]',
    buttonBgGradient: 'from-[#0f766e] to-[#115e59]',
    badgeBg: 'bg-teal-300/20 text-teal-100 border-teal-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Efek Layer Papercraft 3D Toska', 'Matahari Terbit Emas Premium', 'Header Welcoming Party BEM FT', 'Desain Modern Layered Aesthetic']
  },
  {
    id: 'frame-5-1',
    title: 'MAHOGANY MAP & RED WAX SEAL BEM SV',
    category: 'CLASSIC VINTAGE',
    subtitle: 'Kayu Mahogany, Segel Lilin Merah & Peta Alkemia',
    desc: 'Desain vintage petualangan ilmiah dengan latar belakang tekstur kayu mahogany tua, segel lilin merah 3D, papan kompas, peta alkemia antik, dan tulisan First Gathering BEM SV 2026.',
    image: '/images/frames/5.1.png',
    cardBgGradient: 'from-[#451a03] via-[#78350f] to-[#92400e]',
    buttonBgGradient: 'from-[#451a03] to-[#78350f]',
    badgeBg: 'bg-amber-300/20 text-amber-100 border-amber-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Stempel Segel Lilin Merah 3D', 'Tekstur Kayu Mahogany Vintage', 'Peta Alkemia & Kompas Antik', 'Header First Gathering BEM SV 2026']
  },
  {
    id: 'frame-5-2',
    title: 'ROYAL NAVY & BLUE ROSE BEM SV',
    category: 'ROYAL VINTAGE',
    subtitle: 'Mawar Biru Elegan, Kompas Emas & Koran Vintage Navy',
    desc: 'Estetika vintage mewah berwarna biru navy royal dengan hiasan kuntum mawar biru, kompas keemasan, naskah koran tua, dan kaligrafi Gothic First Gathering BEM SV 2026.',
    image: '/images/frames/5.2.png',
    cardBgGradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    buttonBgGradient: 'from-[#0f172a] to-[#1e293b]',
    badgeBg: 'bg-sky-300/20 text-sky-100 border-sky-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Ilustrasi Mawar Biru Watercolor', 'Ornamen Kompas Emas Antik', 'Font Kaligrafi Gothic Royal', 'Tekstur Vintage Paper Navy Blue']
  },
  {
    id: 'frame-5-3',
    title: 'SEPIA WOODEN SIGNBOARD & NEWSPAPER BEM SV',
    category: 'VINTAGE NEWSPAPER',
    subtitle: 'Kertas Perkamen Sepia, Papan Kayu Gantung & Naskah Koran',
    desc: 'Konsep dokumen surat kabar klasik berlatar kayu sepia hangat, papan nama kayu gantung, naskah koran antik, dan header Welcome to BEM SV 2026 Official First Gathering.',
    image: '/images/frames/5.3.png',
    cardBgGradient: 'from-[#78350f] via-[#b45309] to-[#d97706]',
    buttonBgGradient: 'from-[#78350f] to-[#b45309]',
    badgeBg: 'bg-amber-300/20 text-amber-100 border-amber-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Papan Kayu Signboard Gantung', 'Tekstur Kertas Perkamen Sepia', 'Naskah Koran Klasik Vintage', 'Header Welcome to BEM SV 2026']
  },
  {
    id: 'frame-6-1',
    title: 'GRUNGE STREET POSTER FERTILIZED',
    category: 'STREETWEAR Y2K',
    subtitle: 'Poster Jalanan Hitam Metalik & LAZONE.ID FERTILIZED',
    desc: 'Gaya grunge street art hitam metalik ala poster konser rock underground dengan tekstur kertas terkelupas, efek noise, dan header LAZONE.ID FERTILIZED 6.0.',
    image: '/images/frames/6.1.png',
    cardBgGradient: 'from-slate-900 via-zinc-900 to-black',
    buttonBgGradient: 'from-slate-800 to-zinc-900',
    badgeBg: 'bg-zinc-400/20 text-zinc-200 border-zinc-400/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Tekstur Street Wall Poster', 'Noise & Metalic Dark Grunge', 'Typography Rock Concert', 'Header LAZONE.ID FERTILIZED 6.0']
  },
  {
    id: 'frame-6-2',
    title: 'DARK UNDERGROUND CHROME STAR',
    category: 'CYBERPUNK Y2K',
    subtitle: 'Elegan Dark Metal & Chrome Star FERTILIZED',
    desc: 'Estetika cyberpunk underground serba gelap dengan bintang chrome cair 3D metalik di bagian bawah dan branding FERTILIZED LAZONE.ID yang futuristik.',
    image: '/images/frames/6.2.png',
    cardBgGradient: 'from-[#09090b] via-[#18181b] to-[#27272a]',
    buttonBgGradient: 'from-[#18181b] to-[#27272a]',
    badgeBg: 'bg-slate-300/20 text-slate-100 border-slate-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Logo Bintang Chrome Liquid 3D', 'Background Dark Metal Textured', 'Visual Minimalis Industrial', 'Branding LAZONE.ID Official']
  },
  {
    id: 'frame-6-3',
    title: 'CHROME GOTHIC CYBERPUNK FERTILIZED',
    category: 'CYBERPUNK Y2K',
    subtitle: 'Liquid Metal Header & Gothic Typography',
    desc: 'Tampilan Y2K cyberpunk tingkat lanjut dengan header cairan raksa metalik (liquid chrome goth), efek distorsi analog, dan layout photo strip bergaris tegas.',
    image: '/images/frames/6.3.png',
    cardBgGradient: 'from-[#18181b] via-[#27272a] to-[#3f3f46]',
    buttonBgGradient: 'from-[#27272a] to-[#3f3f46]',
    badgeBg: 'bg-zinc-300/20 text-zinc-100 border-zinc-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Liquid Chrome Gothic Header', 'Distorsi Analog Cyberpunk', 'Layout Frame Dark Industrial', 'Branding FERTILIZED LAZONE.ID']
  },
  {
    id: 'frame-6-4',
    title: 'BOXING MATCH FIERY STRIVENGE',
    category: 'SPORT CONCERT',
    subtitle: 'Poster Ring Tinju Merah-Oranye & Mahasiswa Si Paling Kuat',
    desc: 'Desain ala poster pertandingan tinju retro berwarna oranye menyala dan hitam, menampilkan jargon "MAHASISWA SI PALING KUAT" dan header STRIVENGE BOXING LAZONE.ID.',
    image: '/images/frames/6.4.png',
    cardBgGradient: 'from-[#7c2d12] via-[#9a3412] to-[#c2410c]',
    buttonBgGradient: 'from-[#7c2d12] to-[#9a3412]',
    badgeBg: 'bg-orange-300/20 text-orange-100 border-orange-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Warna Oranye Api & Hitam Kontras', 'Slogan Mahasiswa Si Paling Kuat', 'Typography Marquee Boxing Sign', 'Branding STRIVENGE LAZONE.ID']
  },
  {
    id: 'frame-6-5',
    title: 'HIGH CONTRAST BLUE & YELLOW STRIVENGE',
    category: 'MODERN POP',
    subtitle: 'Duo-Tone Yellow-Blue & Orange Ribbon Headline',
    desc: 'Estetika pop modern duo-tone dengan perpaduan warna biru elektrik, aksen strip kuning menyala, dan ribbon header "THE STRIVENGE LAZONE.ID" yang sangat energik.',
    image: '/images/frames/6.5.png',
    cardBgGradient: 'from-[#1e40af] via-[#2563eb] to-[#3b82f6]',
    buttonBgGradient: 'from-[#1e40af] to-[#2563eb]',
    badgeBg: 'bg-yellow-300/25 text-yellow-100 border-yellow-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Skema Duo-Tone Biru & Kuning', 'Header Ribbon Orange Strivenge', 'Layout Clean Photo Grid', 'High Energy Street Vibe']
  },
  {
    id: 'frame-6-6',
    title: 'VINTAGE BOXING HALFTONE COLLAGE',
    category: 'RETRO SPORT',
    subtitle: 'Kolase Koran Halftone & Tribut Boxing Legend',
    desc: 'Desain tribut tinju klasik bergaya cetakan koran halftone retro berwarna cyan biru, menampilkan potongan artikel koran bertema Muhammad Ali dan slogan STRIVENGE.',
    image: '/images/frames/6.6.png',
    cardBgGradient: 'from-[#0891b2] via-[#0e7490] to-[#155e75]',
    buttonBgGradient: 'from-[#0891b2] to-[#0e7490]',
    badgeBg: 'bg-cyan-300/20 text-cyan-100 border-cyan-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Kolase Cetakan Koran Halftone', 'Ilustrasi Boxing Legend Vintage', 'Palet Warna Cyan Blue & Concrete', 'Header Retro Strivenge Edition']
  },
  {
    id: 'frame-7-1',
    title: 'BROADWAY NEON MUSIC CORNER',
    category: 'MUSIC & CONCERT',
    subtitle: 'Plang Lampu Neon Broadway, Kaset Tape & Headphone',
    desc: 'Bingkai bertema panggung musik retro dengan papan nama neon marquee "MUSIC CORNER 2026", stiker kaset pita Fleetwood Mac, dan headphone DJ 3D yang otentik.',
    image: '/images/frames/7.1.png',
    cardBgGradient: 'from-[#4c1d95] via-[#5b21b6] to-[#6d28d9]',
    buttonBgGradient: 'from-[#4c1d95] to-[#5b21b6]',
    badgeBg: 'bg-purple-300/20 text-purple-100 border-purple-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Papan Lampu Neon Broadway 3D', 'Stiker Kaset Tape Vintage', 'Headphone DJ 3D Element', 'Header HMTI Special Present']
  },
  {
    id: 'frame-8-1',
    title: 'HIGH SCHOOL LOCKER SCRAPBOOK',
    category: 'SCRAPBOOK SCHOOL',
    subtitle: 'Loker Biru Sekolah, Post-It & Stiker Pensil',
    desc: 'Konsep scrapbook loker sekolah biru nostalgia lengkap dengan tempelan kertas post-it, coretan tangan, dan stiker pensil yang mengingatkan pada kenangan masa sekolah.',
    image: '/images/frames/8.1.png',
    cardBgGradient: 'from-[#0369a1] via-[#0284c7] to-[#38bdf8]',
    buttonBgGradient: 'from-[#0369a1] to-[#0284c7]',
    badgeBg: 'bg-sky-300/20 text-sky-100 border-sky-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Tekstur Loker Sekolah Biru', 'Kertas Sticky Notes Post-It', 'Stiker Ilustrasi Pensil & Bintang', 'Youth Scrapbook Style']
  },
  {
    id: 'frame-9-1',
    title: 'MUSIC CORNER DON BOSKO EDITION',
    category: 'CONCERT EVENT',
    subtitle: 'Papan Marquee Neon & Pass Ticket Don Bosko',
    desc: 'Desain khusus event festival musik sekolah Pangudi Luhur High School Don Bosko dengan papan marquee neon 3D retro dan informasi tiket festival.',
    image: '/images/frames/9.1.png',
    cardBgGradient: 'from-[#1e1b4b] via-[#312e81] to-[#3730a3]',
    buttonBgGradient: 'from-[#1e1b4b] to-[#312e81]',
    badgeBg: 'bg-indigo-300/20 text-indigo-100 border-indigo-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Custom School & Event Header', 'Neon Marquee Signboard', 'Ticket Pass Badge', 'Vibrant Night Lighting']
  },
  {
    id: 'frame-9-2',
    title: 'RED VELVET WAVE FAREWELL',
    category: 'LUXURY FAREWELL',
    subtitle: 'Gelombang Merah Velvet & Kaligrafi Emas',
    desc: 'Nuansa perpisahan yang megah dengan tirai gelombang merah velvet, kilau cahaya magenta neon, dan kaligrafi emas bertuliskan "FAREWELL HIMAFORMAS".',
    image: '/images/frames/9.2.png',
    cardBgGradient: 'from-[#881337] via-[#9f1239] to-[#be123c]',
    buttonBgGradient: 'from-[#881337] to-[#9f1239]',
    badgeBg: 'bg-rose-300/20 text-rose-100 border-rose-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Gelombang Velvet Merah Neon', 'Kaligrafi Emas 3D Luxury', 'Emblem Logo Partner Space', 'Elegant Velvet Lighting']
  },
  {
    id: 'frame-9-4',
    title: 'GRADIENT NEON GLOW MUSIC CORNER',
    category: 'NEON VIBE',
    subtitle: 'Gradasi Warna Lime-Violet & Papan Music Corner',
    desc: 'Tampilan gradasi warna neon lime dan violet yang menyala untuk event pesta musik kekinian dengan papan penunjuk Music Corner di bagian bawah.',
    image: '/images/frames/9.4.png',
    cardBgGradient: 'from-[#365314] via-[#4d7c0f] to-[#65a30d]',
    buttonBgGradient: 'from-[#365314] to-[#4d7c0f]',
    badgeBg: 'bg-lime-300/20 text-lime-100 border-lime-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Gradasi Neon Lime-Violet', 'Papan Signboard Neon', 'Dark Mode Contrast', 'Vibrant Party Filter']
  },
  {
    id: 'frame-10-1',
    title: 'BATIK MEGAMENDUNG CAMPUS WISUDA',
    category: 'TRADITIONAL GRADUATION',
    subtitle: 'Motif Batik Megamendung & Lukisan Kampus',
    desc: 'Kombinasi elegan motif batik Megamendung tradisional biru dengan lukisan gedung universitas dan aksen ukiran emas di bagian atas.',
    image: '/images/frames/10.1.png',
    cardBgGradient: 'from-[#172554] via-[#1e3a8a] to-[#1e40af]',
    buttonBgGradient: 'from-[#172554] to-[#1e3a8a]',
    badgeBg: 'bg-blue-300/20 text-blue-100 border-blue-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Pattern Batik Megamendung', 'Lukisan Gedung Kampus', 'Ukiran Emas Klasik Header', 'Formal Cultural Theme']
  },
  {
    id: 'frame-10-2',
    title: 'ANIME WISUDA SQUAD CELEBRATION',
    category: 'MANGA GRADUATION',
    subtitle: 'Karakter Anime Wisudawan Pose Squad',
    desc: 'Bingkai komik anime seru dengan pose bersorak sekelompok karakter wisudawan bertoga biru yang kompak untuk kenangan persahabatan kampus.',
    image: '/images/frames/10.2.png',
    cardBgGradient: 'from-[#1e40af] via-[#2563eb] to-[#60a5fa]',
    buttonBgGradient: 'from-[#1e40af] to-[#2563eb]',
    badgeBg: 'bg-sky-300/20 text-sky-100 border-sky-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Ilustrasi Anime Wisuda Squad', 'Text Pop-Art Manga Header', 'Border Komik Modern', 'Expressive Youth Style']
  },
  {
    id: 'frame-10-3',
    title: 'CLASS OF 2026 BRIGHT PARTY',
    category: 'PARTY GRADUATION',
    subtitle: 'Bingkai Biru-Kuning & Pesta Konfeti Meriah',
    desc: 'Bingkai foto energik dengan perpaduan warna biru-kuning cerah, taburan konfeti, dan ilustrasi perayaan wisuda Class of 2026 yang penuh suka cita.',
    image: '/images/frames/10.3.png',
    cardBgGradient: 'from-[#ca8a04] via-[#eab308] to-[#fde047]',
    buttonBgGradient: 'from-[#ca8a04] to-[#eab308]',
    badgeBg: 'bg-amber-300/20 text-amber-100 border-amber-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Bingkai Diagonal Biru-Kuning', 'Ilustrasi Wisudawan Ceria', 'Taburan Konfeti Party', 'Custom Branding Sebooth']
  },
  {
    id: 'frame-11-1',
    title: 'CYAN MARS PARTY CONCERT',
    category: 'NEON PARTY',
    subtitle: 'Header Partner Logo & Teks Cyan Vertikal',
    desc: 'Photostrip modern bertema pesta malam dengan header logo resmi partner instansi dan tulisan bold "FISIPMARS PARTY" berlatar cyan neon.',
    image: '/images/frames/11.1.png',
    cardBgGradient: 'from-[#0369a1] via-[#0284c7] to-[#06b6d4]',
    buttonBgGradient: 'from-[#0369a1] to-[#0284c7]',
    badgeBg: 'bg-cyan-300/20 text-cyan-100 border-cyan-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Header Multi-Logo Partner', 'Typography Cyan Neon Vertikal', 'Latar Midnight Blue', 'Format 3 Pose Landscape']
  },
  {
    id: 'frame-11-2',
    title: 'LIME & PURPLE GLOW PARTY',
    category: 'NEON PARTY',
    subtitle: 'Glow Purple Shadow & Lime Neon Accent',
    desc: 'Efek pencahayaan pesta ungu dan lime neon yang kontras dengan typography 3D "FISIPMARS PARTY" yang menonjol untuk vibes konser musik youth festival.',
    image: '/images/frames/11.2.png',
    cardBgGradient: 'from-[#581c87] via-[#6b21a8] to-[#7e22ce]',
    buttonBgGradient: 'from-[#581c87] to-[#6b21a8]',
    badgeBg: 'bg-purple-300/20 text-purple-100 border-purple-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Typography 3D White Glow', 'Aksen Warna Lime & Violet', 'Tekstur Glitter Party', 'High Contrast Night Filter']
  },
  {
    id: 'frame-11-3',
    title: 'VINTAGE STEAMPUNK NIGHT',
    category: 'STEAMPUNK VINTAGE',
    subtitle: 'Detail Roda Gigi Mekanis & Jam Antik',
    desc: 'Bingkai edisi khusus Steampunk Night dengan fokus detail pada tekstur kayu vintage, roda gigi kuningan mekanis, dan stempel amplop surat antik.',
    image: '/images/frames/11.3.png',
    cardBgGradient: 'from-[#451a03] via-[#78350f] to-[#92400e]',
    buttonBgGradient: 'from-[#451a03] to-[#78350f]',
    badgeBg: 'bg-amber-400/25 text-amber-200 border-amber-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Tekstur Jam & Roda Gigi Antik', 'Papan Kayu Vintage Steampunk', 'Stempel Amplop Wax Seal', 'Warm Copper Tone']
  },
  {
    id: 'frame-11-4',
    title: 'GALACTIC DISCO BALL NIGHT',
    category: 'GALAXY DISCO',
    subtitle: 'Bola Disko Silver & Langit Malam Nebula',
    desc: 'Suasana malam galaxy disco yang penuh kilau bola disko perak di sudut-sudut foto dengan latar langit malam nebula ungu yang magis.',
    image: '/images/frames/11.4.png',
    cardBgGradient: 'from-[#3b0764] via-[#581c87] to-[#6b21a8]',
    buttonBgGradient: 'from-[#3b0764] to-[#581c87]',
    badgeBg: 'bg-fuchsia-300/20 text-fuchsia-100 border-fuchsia-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Bola Disko Silver 3D', 'Latar Belakang Nebula Ungu', 'Typography Vox Creativa Noctis', 'Glowing Party Aura']
  },
  {
    id: 'frame-12-1',
    title: 'OSAKA TICKET SCALLOP BORDER',
    category: 'TRAVEL TICKET',
    subtitle: 'Barcode Ticket Top & Bingkai Scallop Kayu',
    desc: 'Desain tiket perjalanan unik dengan barcode di bagian atas dan bingkai foto bergerigi scallop cokelat kayu ala perangko pos perjalanan Osaka.',
    image: '/images/frames/12.1.png',
    cardBgGradient: 'from-[#0891b2] via-[#0e7490] to-[#155e75]',
    buttonBgGradient: 'from-[#0891b2] to-[#0e7490]',
    badgeBg: 'bg-cyan-300/20 text-cyan-100 border-cyan-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Top Barcode Flight Ticket', 'Scallop Wooden Border', 'Custom Gathering Date Text', 'Travel Vintage Feel']
  },
  {
    id: 'frame-12-2',
    title: 'OSAKA NATURE SCALLOP FRAME',
    category: 'SAFARI NATURE',
    subtitle: 'Bingkai Scallop Cokelat & Pemandangan Alam',
    desc: 'Bingkai foto bergaya scallop perangko cokelat dengan latar pemandangan alam terbuka hijau, sungai jernih, dan maskot rusa petualang Osaka.',
    image: '/images/frames/12.2.png',
    cardBgGradient: 'from-[#166534] via-[#15803d] to-[#22c55e]',
    buttonBgGradient: 'from-[#166534] to-[#15803d]',
    badgeBg: 'bg-green-300/20 text-green-100 border-green-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Bingkai Scallop Perangko Cokelat', 'Pemandangan Alam Osaka', 'Maskot Rusa Petualang', 'Fresh Nature Theme']
  },
  {
    id: 'frame-13-1',
    title: 'PINK RIBBON FAREWELL GIRLUP',
    category: 'COQUETTE PASTEL',
    subtitle: 'Ribbon 3D Pink & Kaligrafi Farewell GirlUp',
    desc: 'Desain feminin bertema Coquette dengan pita satin 3D warna pink, ukiran bunga lotus, dan kaligrafi melengkung "Farewell GirlUp Semarang".',
    image: '/images/frames/13.1.png',
    cardBgGradient: 'from-[#9d174d] via-[#be185d] to-[#e11d48]',
    buttonBgGradient: 'from-[#9d174d] to-[#be185d]',
    badgeBg: 'bg-pink-300/20 text-pink-100 border-pink-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Pita Satin 3D Pink Accent', 'Kaligrafi Farewell GirlUp', 'Motif Ukiran Bunga Pink', 'Soft Feminine Aesthetic']
  },
  {
    id: 'frame-13-2',
    title: 'GIRLUP TOP BANNER COQUETTE',
    category: 'COQUETTE SPECIAL',
    subtitle: 'Header Banner GirlUp & Logo UN Foundation',
    desc: 'Frame edisi spesial dengan banner header "Farewell GirlUp Semarang" di bagian atas dan pita pink manis yang menghiasi setiap slot foto.',
    image: '/images/frames/13.2.png',
    cardBgGradient: 'from-[#831843] via-[#9d174d] to-[#be185d]',
    buttonBgGradient: 'from-[#831843] to-[#9d174d]',
    badgeBg: 'bg-rose-300/20 text-rose-100 border-rose-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Header Banner Typography GirlUp', 'Logo Partner UN Foundation', 'Bingkai Cutout Pink Pastel', 'Format 3 Pose Portrait']
  },
  {
    id: 'frame-14-1',
    title: 'DJ HEADPHONE & CASSETTE TAPE',
    category: 'NEON MUSIC',
    subtitle: 'Stiker Kaset Pita Analog & Headphone DJ',
    desc: 'Bingkai bertema musik DJ dengan stiker kaset pita analog retro di bagian atas dan headphone studio DJ realistis yang berada di samping slot foto.',
    image: '/images/frames/14.1.png',
    cardBgGradient: 'from-[#1e1b4b] via-[#312e81] to-[#4338ca]',
    buttonBgGradient: 'from-[#1e1b4b] to-[#312e81]',
    badgeBg: 'bg-indigo-300/20 text-indigo-100 border-indigo-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Stiker Kaset Audio Retro 3D', 'Headphone Studio DJ Detail', 'Papan Signboard Music Corner', 'Vibrant Music Vibe']
  },
  {
    id: 'frame-14-2',
    title: 'BLUE LOCKER SCHOOL SCRAPBOOK',
    category: 'SCRAPBOOK SCHOOL',
    subtitle: 'Loker Sekolah Biru, Pensil Sketsa & Post-It',
    desc: 'Konsep scrapbook loker sekolah biru yang unik dengan aksen pensil sketsa, stiker smiley, dan kertas post-it untuk kenangan manis panggung sekolah.',
    image: '/images/frames/14.2.png',
    cardBgGradient: 'from-[#0284c7] via-[#0369a1] to-[#075985]',
    buttonBgGradient: 'from-[#0284c7] to-[#0369a1]',
    badgeBg: 'bg-sky-300/20 text-sky-100 border-sky-300/40',
    dimensions: '2 x 6 inch (Photostrip)',
    features: ['Tekstur Loker Sekolah Biru', 'Pensil Sketsa & Stiker Smiley', 'Kertas Sticky Notes Post-It', 'Authentic Scrapbook Vibe']
  }
]

function FrameCard({ item, large = false, isLoopCopy, onOpen }: {
  item: FrameCardItem
  large?: boolean
  /** The marquee renders every card twice to loop: the copies stay out of the tab order and screen readers */
  isLoopCopy: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-hidden={isLoopCopy || undefined}
      tabIndex={isLoopCopy ? -1 : undefined}
      className={`group shrink-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${large ? "w-[380px] md:w-[420px]" : "w-[210px] min-[375px]:w-[240px]"}`}
    >
      <span className={`relative block overflow-hidden rounded-lg bg-blue-dark ${large ? "h-[245px] md:h-[270px]" : "h-[120px] min-[375px]:h-[135px]"}`}>
        <Image
          src={frameImage(item.image, "thumb")}
          alt={item.title}
          fill
          unoptimized
          draggable={false}
          loading="lazy"
          sizes={large ? "450px" : "240px"}
          className="object-cover object-center select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
          style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
        />
      </span>
      <span className="mt-1.5 block truncate text-sm font-bold text-white capitalize">
        {item.category.toLowerCase()}
      </span>
    </button>
  )
}

interface FramesSliderProps {
  initialData?: Record<string, string>
  isActive?: boolean
}

export function FramesSlider({ initialData = {}, isActive = true }: FramesSliderProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedFrame, setSelectedFrame] = useState<FrameCardItem | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const frameDialogRef = useRef<HTMLDivElement>(null)
  const closeFrame = useCallback(() => setSelectedFrame(null), [])
  useModalFocus(selectedFrame !== null, frameDialogRef, closeFrame)

  useEffect(() => {
    setMounted(true)
  }, [])

  const count = FRAME_ITEMS.length
  const touchStartX = useRef<number | null>(null)

  // Split frame items into 2 balanced rows for mobile 2-tier display (limited to top items on mobile for blazing fast performance)
  const row1Items = FRAME_ITEMS.slice(0, 6)
  const row2Items = FRAME_ITEMS.slice(6, 12)

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + count) % count)
  }

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % count)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
    touchStartX.current = null
  }

  return (
    <section
      id="frames"
      className="relative w-full h-[100svh] min-h-[100svh] bg-primary text-white pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-4 sm:pb-12 px-3 sm:px-8 lg:px-16 overflow-hidden select-none flex flex-col justify-center items-center gap-2 sm:gap-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── SECTION HEADER ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center mb-1 sm:mb-4 px-2">
        <h2 className="text-[min(8.4vw,2.5rem)] sm:text-6xl md:text-7xl lg:text-8xl font-bayon text-white uppercase leading-none text-center whitespace-nowrap">
          PILIH FRAME AESTHETIC-MU!
        </h2>

        <p className="text-[15px] sm:text-lg text-white max-w-sm sm:max-w-2xl mt-2 sm:mt-3 leading-snug text-center">
          Ratusan pilihan template photostrip beresolusi tinggi. Klik kartu mana saja untuk melihat preview frame pilihanmu!
        </p>
      </div>

      {/* ── CONTINUOUS INFINITE SLIDING MARQUEE TRACK (ZERO MASK-IMAGE FOR ULTRA 60FPS) ── */}
      <div className="relative z-10 w-full overflow-hidden select-none pt-1 sm:pt-4 pb-4 sm:pb-16 md:pb-20">
        {/* MOBILE 2-TIER STACKED ROWS (Visible only on < sm screens) */}
        <div className="flex sm:hidden flex-col gap-3 py-1">
          {[
            { items: row1Items, direction: "animate-marquee-frames" },
            { items: row2Items, direction: "animate-marquee-frames-reverse" },
          ].map(({ items, direction }) => (
            <div
              key={direction}
              className={`${direction} flex items-start gap-2.5 py-0.5`}
              style={{ animationPlayState: isActive ? "running" : "paused" }}
            >
              {[...items, ...items].map((item, idx) => (
                <FrameCard
                  key={`${direction}-${item.id}-${idx}`}
                  item={item}
                  isLoopCopy={idx >= items.length}
                  onOpen={() => setSelectedFrame(item)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* DESKTOP / TABLET SINGLE ROW (Visible on >= sm screens) */}
        <div
          className="hidden sm:flex animate-marquee-frames items-start gap-5 py-4 sm:py-6 md:py-8"
          style={{ animationPlayState: isActive ? "running" : "paused" }}
        >
          {/* Repeated 2x to guarantee endless seamless looping */}
          {[...FRAME_ITEMS, ...FRAME_ITEMS].map((item, idx) => (
            <FrameCard
              key={`d-${item.id}-${idx}`}
              item={item}
              large
              isLoopCopy={idx >= FRAME_ITEMS.length}
              onOpen={() => setSelectedFrame(item)}
            />
          ))}
        </div>
      </div>

      {/* ── EXPANDED PHOTOSTRIP FRAME LIGHTBOX MODAL WITH STRICT COPY/DOWNLOAD PROTECTION ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedFrame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSelectedFrame(null)}
              className="fixed inset-0 z-[9999] bg-blue-dark/80 flex items-end justify-center md:items-center md:p-6 select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <motion.div
                ref={frameDialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={selectedFrame.title}
                initial={{ y: 32 }}
                animate={{ y: 0 }}
                exit={{ y: 32 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: "transform, opacity" }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full md:max-w-xl lg:max-w-4xl bg-primary rounded-t-2xl md:rounded-2xl text-white p-5 md:p-7 flex flex-col lg:flex-row gap-4 lg:gap-6 max-h-[92svh] overflow-y-auto"
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Close Button */}
                <button
                  onClick={closeFrame}
                  aria-label="Tutup preview frame"
                  className="absolute top-2 right-2 z-30 h-12 w-12 rounded-full bg-blue-dark flex items-center justify-center text-white transition-colors hover:text-secondary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Left Side: Expanded Uncropped Frame Image Preview Container with STRICT Protection */}
                <div 
                  className="relative w-full lg:w-[60%] h-[280px] min-[375px]:h-[320px] lg:h-[480px] rounded-lg overflow-hidden bg-blue-dark shrink-0 flex items-center justify-center select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {/* Photo Frame Display (Full Uncropped Display) */}
                  <Image
                    src={frameImage(selectedFrame.image, "modal")}
                    alt={selectedFrame.title}
                    fill
                    unoptimized
                    draggable={false}
                    priority
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-contain object-center p-2 sm:p-3 pointer-events-none select-none"
                    style={{
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  />

                  {/* Diagonal Protection Watermark */}
                  <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
                    <div className="rotate-[-25deg] text-sm font-bold text-white/35 whitespace-nowrap">
                      Sebooth preview only · Protected frame
                    </div>
                  </div>

                  {/* TRANSPARENT SHIELD OVERLAY (Blocks long press, right click & image drag) */}
                  <div 
                    className="absolute inset-0 z-20 bg-transparent select-none cursor-default"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>

                {/* Right Side: Frame Metadata & Info */}
                <div className="flex flex-col justify-between w-full lg:w-[42%] text-left gap-4">
                  <div className="text-[17px] leading-relaxed">
                    <h3 className="font-bayon text-[2rem] leading-[1.05] uppercase">
                      {selectedFrame.title}
                    </h3>
                    <p className="mt-2">{selectedFrame.desc}</p>

                    {/* Features List */}
                    <h4 className="mt-4 font-bold">Fitur & Spesifikasi Frame</h4>
                    <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-secondary">
                      {selectedFrame.features.map((feat, fIdx) => (
                        <li key={fIdx}>{feat}</li>
                      ))}
                    </ul>

                    {/* Security Notice */}
                    <p className="mt-4 text-sm text-white/80">
                      Template frame ini terlindungi hak cipta Sebooth. Untuk memesan frame custom event kamu, hubungi tim Sebooth via WhatsApp.
                    </p>
                  </div>

                  {/* WhatsApp Order / Booking Button */}
                  <a
                    href={whatsappUrl(`Halo Sebooth, saya mau pakai template frame "${selectedFrame.title}" untuk acara saya!`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-14 rounded-full px-5 bg-secondary hover:bg-white text-blue-dark font-bold text-[17px] text-center transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <span>Pakai Frame Ini Untuk Acara Saya</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
