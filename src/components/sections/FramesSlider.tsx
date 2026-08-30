"use client"

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ShieldAlert, Sparkles, Eye, CheckCircle2, Lock } from 'lucide-react'

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

interface FramesSliderProps {
  initialData?: Record<string, string>
  isActive?: boolean
}

export function FramesSlider({ initialData = {}, isActive = true }: FramesSliderProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedFrame, setSelectedFrame] = useState<FrameCardItem | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

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
      className="relative w-full h-[100svh] min-h-[100svh] bg-[#FF4500] text-white pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-4 sm:pb-12 px-3 sm:px-8 lg:px-16 overflow-hidden select-none flex flex-col justify-center items-center gap-2 sm:gap-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── AMBIENT VIBRANT ORANGE MULTI-STOP GRADIENT BACKGROUND ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF7700] via-[#FF3D00] to-[#7A0F00] pointer-events-none z-0" />

      {/* Dominant Fiery Orange Core Aura (Desktop only for max mobile 60fps performance) */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] sm:w-[70rem] h-[40rem] sm:h-[70rem] rounded-full bg-gradient-to-r from-[#FF9900]/40 via-[#FF4500]/50 to-[#CC2200]/40 blur-[120px] sm:blur-[180px] pointer-events-none z-0" />

      {/* Abstract Bright Amber & Vivid Crimson Ambient Blur Accent Blobs */}
      <div className="hidden sm:block absolute top-[-10%] left-[-15%] sm:left-[-8%] w-[25rem] sm:w-[42rem] h-[25rem] sm:h-[42rem] rounded-full bg-gradient-to-br from-[#FFBB00] via-[#FF5500] to-[#D6002A] opacity-55 blur-[90px] sm:blur-[140px] pointer-events-none z-0 animate-pulse duration-10000" />
      <div className="hidden sm:block absolute bottom-[-10%] right-[-15%] sm:right-[-8%] w-[26rem] sm:w-[44rem] h-[26rem] sm:h-[44rem] rounded-full bg-gradient-to-tl from-[#FFAA00] via-[#FF3300] to-[#90001B] opacity-55 blur-[100px] sm:blur-[150px] pointer-events-none z-0 animate-pulse duration-7000" />

      {/* ── SECTION HEADER ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center mb-1 sm:mb-4 px-2">
        <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-bayon text-white uppercase tracking-tight leading-none text-center drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] filter">
          PILIH FRAME AESTHETIC-MU!
        </h2>

        <p className="text-xs xs:text-sm sm:text-lg text-white/95 font-medium tracking-wide max-w-xs xs:max-w-sm sm:max-w-2xl mt-1 sm:mt-2.5 leading-snug sm:leading-relaxed text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] filter">
          Ratusan pilihan template photostrip beresolusi tinggi. Klik kartu mana saja untuk melihat preview frame pilihanmu!
        </p>
      </div>

      {/* ── CONTINUOUS INFINITE SLIDING MARQUEE TRACK (ZERO MASK-IMAGE FOR ULTRA 60FPS) ── */}
      <div className="relative z-10 w-full overflow-hidden select-none pt-1 sm:pt-4 pb-4 sm:pb-16 md:pb-20">
        {/* Hardware-friendly Left & Right Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FF5500] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FF4000] to-transparent z-20 pointer-events-none" />

        {/* MOBILE 2-TIER STACKED ROWS (Visible only on < sm screens) */}
        <div className="flex sm:hidden flex-col gap-2 xs:gap-3 py-1">
          {/* Mobile Row 1 (Sliding Left) */}
          <div 
            className="animate-marquee-frames flex items-center gap-2 xs:gap-2.5 py-0.5"
            style={{
              animationPlayState: isActive ? "running" : "paused",
            }}
          >
            {[...row1Items, ...row1Items].map((item, idx) => (
              <div
                key={`m1-${item.id}-${idx}`}
                onClick={() => setSelectedFrame(item)}
                className={`relative w-[210px] xs:w-[240px] rounded-[16px] overflow-hidden shrink-0 cursor-pointer border border-white/25 flex flex-col p-2 xs:p-2.5 bg-gradient-to-br ${item.cardBgGradient} group gap-1.5 shadow-md will-change-transform`}
              >
                <div className="relative z-20 flex items-center justify-between gap-1">
                  <span className={`text-[8px] xs:text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-black/50 ${item.badgeBg}`}>
                    {item.category}
                  </span>
                  <div className="w-4.5 h-4.5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80">
                    <Lock className="w-2.5 h-2.5 text-orange-300" />
                  </div>
                </div>
                <div className="relative w-full h-[120px] xs:h-[135px] rounded-lg overflow-hidden border border-white/25 bg-black/20 flex items-center justify-center group/img">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized
                    draggable={false}
                    sizes="240px"
                    className="object-cover object-center select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 z-20 bg-black/0 cursor-pointer flex items-center justify-center group-hover/img:bg-black/35 transition-all">
                    <div className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-black/90 text-white text-[10px] font-bold flex items-center gap-1 border border-white/30">
                      <Eye className="w-3 h-3 text-orange-400" />
                      <span>Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Row 2 (Sliding Right - Reverse Direction) */}
          <div 
            className="animate-marquee-frames-reverse flex items-center gap-2 xs:gap-2.5 py-0.5"
            style={{
              animationPlayState: isActive ? "running" : "paused",
            }}
          >
            {[...row2Items, ...row2Items].map((item, idx) => (
              <div
                key={`m2-${item.id}-${idx}`}
                onClick={() => setSelectedFrame(item)}
                className={`relative w-[210px] xs:w-[240px] rounded-[16px] overflow-hidden shrink-0 cursor-pointer border border-white/25 flex flex-col p-2 xs:p-2.5 bg-gradient-to-br ${item.cardBgGradient} group gap-1.5 shadow-md will-change-transform`}
              >
                <div className="relative z-20 flex items-center justify-between gap-1">
                  <span className={`text-[8px] xs:text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-black/50 ${item.badgeBg}`}>
                    {item.category}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80">
                    <Lock className="w-2.5 h-2.5 text-orange-300" />
                  </div>
                </div>
                <div className="relative w-full h-[120px] xs:h-[135px] rounded-lg overflow-hidden border border-white/25 bg-black/20 flex items-center justify-center group/img">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized
                    draggable={false}
                    sizes="240px"
                    className="object-cover object-center select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 z-20 bg-black/0 cursor-pointer flex items-center justify-center group-hover/img:bg-black/35 transition-all">
                    <div className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-black/90 text-white text-[10px] font-bold flex items-center gap-1 border border-white/30">
                      <Eye className="w-3 h-3 text-orange-400" />
                      <span>Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP / TABLET SINGLE ROW (Visible on >= sm screens) */}
        <div 
          className="hidden sm:flex animate-marquee-frames items-center gap-3 sm:gap-5 py-4 sm:py-6 md:py-8"
          style={{
            animationPlayState: isActive ? "running" : "paused",
          }}
        >
          {/* Repeated 2x to guarantee endless seamless looping */}
          {[...FRAME_ITEMS, ...FRAME_ITEMS].map((item, idx) => (
            <motion.div
              key={`d-${item.id}-${idx}`}
              onClick={() => setSelectedFrame(item)}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-[380px] md:w-[420px] rounded-[24px] overflow-hidden shrink-0 cursor-pointer border border-white/25 sm:border-2 flex flex-col p-3.5 bg-gradient-to-br ${item.cardBgGradient} group gap-2.5 shadow-xl"
            >
              {/* Top Category Badge & Protected Indicator */}
              <div className="relative z-20 flex items-center justify-between gap-1.5">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border backdrop-blur-md ${item.badgeBg}`}>
                  {item.category}
                </span>

                <div className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80" title="Protected Preview">
                  <Lock className="w-3 h-3 text-orange-300" />
                </div>
              </div>

              {/* Photostrip Frame Image Display */}
              <div className="relative w-full h-[245px] md:h-[270px] rounded-xl overflow-hidden shadow-xs border border-white/25 bg-black/20 flex items-center justify-center group/img">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  draggable={false}
                  sizes="450px"
                  className="object-cover object-center select-none pointer-events-none transition-transform duration-500 group-hover/img:scale-105"
                  style={{
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                />

                {/* Anti-Copy Invisible Overlay Shield & Hover Preview Indicator */}
                <div
                  className="absolute inset-0 z-20 bg-black/0 cursor-pointer flex items-center justify-center group-hover/img:bg-black/35 transition-all duration-300"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <div className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/30 shadow-lg">
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    <span>Preview Frame</span>
                  </div>
                </div>
              </div>
            </motion.div>
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
              className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-3 sm:p-6 select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: "transform, opacity" }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl lg:max-w-4xl bg-zinc-950 border border-white/20 rounded-[20px] sm:rounded-[32px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] text-white p-3.5 xs:p-4 sm:p-7 flex flex-col md:flex-row gap-4 sm:gap-6 max-h-[86vh] overflow-y-auto [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedFrame(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Left Side: Expanded Uncropped Frame Image Preview Container with STRICT Protection */}
                <div 
                  className="relative w-full md:w-[56%] lg:w-[60%] h-[280px] xs:h-[330px] sm:h-[420px] md:h-[480px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 bg-black/90 shrink-0 flex items-center justify-center select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {/* Photo Frame Display (Full Uncropped Display) */}
                  <Image
                    src={selectedFrame.image}
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
                    <div className="rotate-[-25deg] text-[8px] xs:text-[9px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.25em] text-white/25 uppercase border-y border-white/20 py-1 sm:py-1.5 px-6 sm:px-12 bg-black/20 backdrop-blur-[1px] whitespace-nowrap">
                      ✦ SEBOOTH PREVIEW ONLY • PROTECTED FRAME ✦
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
                <div className="flex flex-col justify-between w-full md:w-[46%] lg:w-[42%] text-left gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1 uppercase font-bayon tracking-tight">
                      {selectedFrame.title}
                    </h3>
                    <p className="text-[11px] xs:text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 sm:mb-4 font-medium">
                      {selectedFrame.desc}
                    </p>

                    {/* Features List */}
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <h4 className="text-[10px] xs:text-[11px] sm:text-xs font-extrabold uppercase text-white/70 tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        <span>Fitur & Spesifikasi Frame:</span>
                      </h4>
                      {selectedFrame.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 text-[11px] xs:text-xs sm:text-sm text-gray-200 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Security Notice */}
                    <div className="p-2 xs:p-2.5 sm:p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[10px] sm:text-[11px] font-medium flex items-start gap-1.5 mb-3 sm:mb-4">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>Template frame ini terlindungi hak cipta Sebooth. Untuk memesan frame custom event kamu, hubungi tim Sebooth via WhatsApp.</span>
                    </div>
                  </div>

                  {/* WhatsApp Order / Booking Button */}
                  <a
                    href={`https://wa.me/6285713899441?text=${encodeURIComponent(`Halo Sebooth, saya mau pakai template frame "${selectedFrame.title}" untuk acara saya!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-full py-2.5 sm:py-3.5 px-4 sm:px-6 bg-gradient-to-r from-[#FF5E00] via-[#FF3900] to-[#551286] text-white font-extrabold text-xs xs:text-sm sm:text-base text-center tracking-wide border border-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
