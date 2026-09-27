import fs from 'fs';
import path from 'path';

const SCREENS = [
  {
    id: '01_slide_hero',
    category: 'LANDING SLIDE DECK',
    categoryColor: '#FF5500',
    number: '01',
    title: 'Slide 01 — Hero Banner & Instant Booking CTA',
    route: 'GET / (Slide 01)',
    description: 'Tampilan pembuka landing page cinematic full-screen 100dvh dengan dynamic visual headline "Seboothkan Momenmu Bersama Sebooth", floating glassmorphism navigation header dengan active dot indicator, dan tombol CTA "SEBOOTH-IN SEKARANG" dengan link WhatsApp interaktif.',
    tags: ['Full-Screen 100dvh Lock', 'Floating Glass Nav Header', 'Pulsating WhatsApp CTA', 'Native Scroll Snap Cue', 'Hero Overlay Composition']
  },
  {
    id: '02_slide_services',
    category: 'LANDING SLIDE DECK',
    categoryColor: '#0F3D2E',
    number: '02',
    title: 'Slide 02 — Services & 3D Coverflow Equipment Showcase',
    route: 'GET /#services (Slide 02)',
    description: 'Showcase varian produk photobooth Sebooth (Standard Booth, Deluxe Booth, Glamour Booth) dalam format 3D Coverflow kartu melayang dengan efek rotasi spatial dan pop-up modal spesifikasi detail hardware pro (DSLR, studio lighting, dye-sublimation printer).',
    tags: ['3D Spatial Coverflow', 'Pop-up Modal Spesifikasi', 'Dual Ambient Glow Blobs', 'Touch Swipe & Drag Navigation', 'Poppins Editorial Typography']
  },
  {
    id: '03_slide_frames',
    category: 'LANDING SLIDE DECK',
    categoryColor: '#D97706',
    number: '03',
    title: 'Slide 03 — Exclusive Frames Dual-Tier Marquee Showcase',
    route: 'GET /#frames (Slide 03)',
    description: 'Katalog display template frame photostrip 2x6 dan postcard 4R dengan animasi dual-tier continuous infinite marquee yang meluncur mulus tanpa henti. Dilengkapi fitur hover-pause dan modal zoom untuk mengecek detail grafis setiap frame.',
    tags: ['Dual-Tier Infinite Marquee', 'Dynamic Aspect Detection', 'Auto Hover-Pause', 'Frame Lightbox Preview', 'Zero-Shift Smooth Sliding']
  },
  {
    id: '04_slide_gallery',
    category: 'LANDING SLIDE DECK',
    categoryColor: '#EF4444',
    number: '04',
    title: 'Slide 04 — Pinterest-Style Masonry Wall & Real Feed',
    route: 'GET /#portfolio (Slide 04)',
    description: 'Galeri portofolio hasil cetak dan softfile nyata mengadopsi layout authentic Pinterest masonry wall. Ditenagai algoritma greedy height-balanced multi-column (2 kolom mobile s/d 6 kolom desktop), 86 foto nyata, tombol hover Pinterest merah "SIMPAN", dan penghematan data WebP 96%.',
    tags: ['Pinterest Native 2-Column Mobile', 'Greedy Height-Balanced Multi-Column', '86 Real Session Photos', 'WebP 96% Data Saving (35KB/img)', 'Progressive Infinite Scroll']
  },
  {
    id: '05_slide_pricing',
    category: 'LANDING SLIDE DECK',
    categoryColor: '#2563EB',
    number: '05',
    title: 'Slide 05 — Pricing Plans & Rental Package Tables',
    route: 'GET /#pricing (Slide 05)',
    description: 'Tabel paket sewa photobooth transparan tanpa biaya tersembunyi dengan pilihan Paket Unlimited (2 Jam & 3 Jam) dan Paket Quota. Dilengkapi badge highlight paket terfavorit, daftar fasilitas lengkap dengan centang checklist, dan tombol booking cepat.',
    tags: ['Unlimited & Quota Switcher', 'Most Favorite Badge Highlight', 'Checklist Fasilitas Lengkap', 'Direct WhatsApp Reservation', 'High-Contrast Card Depth']
  },
  {
    id: '06_slide_faq',
    category: 'LANDING SLIDE DECK',
    categoryColor: '#8B5CF6',
    number: '06',
    title: 'Slide 06 — Vector 3D Folder Tabs & Fast Accordion FAQ',
    route: 'GET /#contact (Slide 06)',
    description: 'Pusat bantuan interaktif berbentuk tab folder berkas 3D nyata dengan kurva vektor Bezier (Frame & Props, Teknis & Venue, Umum & Booking). Dropdown accordion ditenagai CSS Grid row transition (0fr -> 1fr) berkecepatan tinggi tanpa layout recalculation lag.',
    tags: ['Vector Bezier 3D Folder Tabs', 'Ultra-Fast CSS Grid Accordion', 'Direct Q&A Structure', 'Zero-Lag 120 FPS Response', 'Snug Snapping Proximity']
  },
  {
    id: '07_myphotos_focus',
    category: 'USER PORTAL APPLICATION',
    categoryColor: '#10B981',
    number: '07',
    title: 'My Photos — Focus 3D Polaroid Photo Stack View',
    route: 'GET /profile (Focus Mode)',
    description: 'Antarmuka portal softfile pengguna mengadopsi estetika Instagram Stories Polaroid Stack. Kartu foto tampil bertumpuk 3D melayang di layar. Pengguna dapat me-tap foto untuk mengocok (shuffle) pose dan men-swipe horizontal antar sesi foto dengan respon 1:1 tanpa jeda.',
    tags: ['Instagram Polaroid 3D Stack', 'Tap-to-Shuffle Spring Easing', '1:1 Native Touch Drag Slider', 'Quick HD Single Download', '1-Click ZIP Archive Bundler']
  },
  {
    id: '08_myphotos_overview',
    category: 'USER PORTAL APPLICATION',
    categoryColor: '#059669',
    number: '08',
    title: 'My Photos — Optical Zoom-Out Matrix Overview',
    route: 'GET /profile (Overview Mode)',
    description: 'Mode overview bird\'s-eye view seluruh sesi yang dimiliki pengguna. Ketika tombol grid 00 00 ditekan, kartu sesi aktif mengecil secara terpusat (justified center) tanpa pergeseran horizontal canggung, memudahkan pemilihan sesi secara visual.',
    tags: ['Optical In-Place Zoom-Out', 'Justified Symmetric Centering', 'Tap-to-Focus Smooth Glide', 'Zero Horizontal Shift', 'Feather-Light DOM Virtualization']
  },
  {
    id: '09_frames_catalog',
    category: 'PUBLIC FEATURE SUBPAGE',
    categoryColor: '#F59E0B',
    number: '09',
    title: 'Frames Catalog — Dedicated Template Gallery Subpage',
    route: 'GET /frames',
    description: 'Halaman katalog galeri mandiri untuk mengeksplorasi seluruh koleksi template frame Sebooth. Dilengkapi pencarian instan (search bar), filter kategori (All, Wedding, Birthday, Corporate, Minimalist), dan modal lightbox untuk melihat detail grafis frame.',
    tags: ['Category Filter Pills', 'Instant Search Filtering', 'Dynamic Aspect Ratio Cards', 'High-Definition Lightbox Modal', 'Direct WhatsApp Frame Request']
  },
  {
    id: '10_login',
    category: 'AUTHENTICATION SYSTEM',
    categoryColor: '#3B82F6',
    number: '10',
    title: 'Login Page — User Auth & Photobooth Session Claim',
    route: 'GET /login',
    description: 'Gerbang autentikasi aman bagi pengunjung untuk masuk ke portal My Photos. Dilengkapi integrasi auto-redirect setelah login, tombol registrasi akun baru, dan petunjuk pengambilan softfile.',
    tags: ['Clean Brutalist Container', 'Auto-Redirect Handler', 'Supabase Auth Integration', 'Softfile Access Notice', 'Error State Banners']
  },
  {
    id: '11_register',
    category: 'AUTHENTICATION SYSTEM',
    categoryColor: '#6366F1',
    number: '11',
    title: 'Register Page — New Account Registration',
    route: 'GET /register',
    description: 'Form pendaftaran akun baru dengan field nomor WhatsApp aktif untuk kebutuhan sinkronisasi otomatis notifikasi antrean fisik, konfirmasi booking, dan pengiriman link unduhan softfile acara.',
    tags: ['WhatsApp Number Field', 'Inline Validation', 'Password Confirmation Guard', 'Smooth Navigation to Login', 'Mobile-Ergonomic Form Layout']
  },
  {
    id: '12_admin',
    category: 'MANAGEMENT DASHBOARD',
    categoryColor: '#DC2626',
    number: '12',
    title: 'Admin CMS — Live Operator & Session Inspector Panel',
    route: 'GET /admin',
    description: 'Pusat kendali operator booth dan administrator: Tab Live Booth Monitor untuk memantau status operasional kamera & printer, Session Lookup untuk mengecek data pengklaim sesi, dan manajemen upload frame template.',
    tags: ['Real-Time Live Booth Monitor', 'Session Claim Lookup Inspector', 'Zero Heavy Image Bandwidth Guard', 'Frame CMS Management', 'Super Admin Permission Shield']
  },
  {
    id: '13_access_claim',
    category: 'HARDWARE QR INTEGRATION',
    categoryColor: '#EC4899',
    number: '13',
    title: 'QR Kiosk Access — Guest Photo Claim Screen',
    route: 'GET /access/[sessionId]',
    description: 'Titik akses scan QR code fisik yang terpampang di layar kiosk photobooth setelah sesi foto berakhir. Tamu diarahkan ke halaman ini untuk mengklaim dan menautkan foto ke akun Sebooth mereka secara instan.',
    tags: ['Hardware Kiosk QR Point', 'Instant Session ID Linking', 'Real-Time Auto Claim Handler', 'Guest Download Access', 'Tactile Claim CTA Button']
  },
  {
    id: '14_queue_display',
    category: 'EVENT DISPLAY MONITOR',
    categoryColor: '#14B8A6',
    number: '14',
    title: 'Digital Queue TV Display — On-Site Queue Monitor',
    route: 'GET /queue/[eventId]/display',
    description: 'Antarmuka visual layar TV monitor besar untuk ditempatkan di lokasi acara/venue. Menampilkan nomor antrean yang sedang dipanggil (Now Calling), nomor berikutnya, indikator booth aktif, dan banner QR registrasi antrean.',
    tags: ['10-Foot UI TV Display Scale', 'Real-Time Audio-Visual Chime Cues', 'Multi-Booth Concurrent Support', 'High-Contrast Ambient Dark Mode', 'SSE Live Stream Sync']
  }
];

function buildHtml(imagePrefix, videoPrefix) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEBOOTH — Complete UI/UX Showcase & Video Demonstration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #07090E;
      color: #E2E8F0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #07090E; }
    ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }

    /* Floating Navigation Header */
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(7, 9, 14, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px 24px;
    }
    .header-inner {
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-logo {
      font-family: 'Poppins', sans-serif;
      font-weight: 900;
      font-size: 24px;
      letter-spacing: -0.02em;
      color: #FFFFFF;
      display: flex;
      align-items: center;
    }
    .brand-logo span { color: #FF5500; }
    .badge-pill {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(255, 85, 0, 0.15);
      color: #FF7733;
      border: 1px solid rgba(255, 85, 0, 0.3);
    }
    .nav-stats {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 13px;
      color: #94A3B8;
    }
    .nav-stats strong { color: #F1F5F9; font-weight: 600; }

    /* Quick Jump Nav Bar */
    .quick-nav {
      background: rgba(15, 23, 42, 0.6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 10px 24px;
      overflow-x: auto;
      white-space: nowrap;
    }
    .quick-nav-inner {
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      gap: 8px;
    }
    .quick-pill {
      display: inline-block;
      font-size: 12px;
      font-weight: 600;
      color: #94A3B8;
      text-decoration: none;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      transition: all 0.2s ease;
    }
    .quick-pill:hover {
      background: rgba(255, 85, 0, 0.15);
      color: #FF7733;
      border-color: rgba(255, 85, 0, 0.4);
    }
    .quick-pill.featured {
      background: rgba(255, 85, 0, 0.2);
      color: #FF5500;
      border-color: rgba(255, 85, 0, 0.5);
      font-weight: 700;
    }

    /* Main Container */
    .main-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 40px 24px 80px 24px;
    }

    /* Intro Hero Banner */
    .intro-banner {
      background: linear-gradient(135deg, rgba(255, 85, 0, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(255, 85, 0, 0.25);
      border-radius: 24px;
      padding: 40px 48px;
      margin-bottom: 48px;
      position: relative;
      overflow: hidden;
    }
    .intro-banner::before {
      content: '';
      position: absolute;
      top: -120px;
      right: -120px;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 85, 0, 0.25) 0%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }
    .intro-title {
      font-family: 'Poppins', sans-serif;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFFFFF;
      margin-bottom: 12px;
      line-height: 1.25;
    }
    .intro-desc {
      font-size: 16px;
      color: #94A3B8;
      max-width: 860px;
      line-height: 1.7;
    }
    .intro-metrics {
      display: flex;
      gap: 32px;
      margin-top: 28px;
      flex-wrap: wrap;
    }
    .metric-item {
      display: flex;
      flex-direction: column;
    }
    .metric-val {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #FF5500;
      line-height: 1.1;
    }
    .metric-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Video Showcase Section Card */
    .video-showcase-card {
      background: linear-gradient(180deg, rgba(255, 85, 0, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(255, 85, 0, 0.35);
      border-radius: 24px;
      padding: 36px 40px;
      margin-bottom: 56px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
      position: relative;
    }
    .video-container-wrapper {
      margin-top: 24px;
    }
    .video-window {
      background: #141C2B;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.85);
    }
    .video-player-box {
      position: relative;
      width: 100%;
      background: #000000;
      aspect-ratio: 16 / 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .video-player-box video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .video-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .video-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .download-video-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FF5500;
      color: #FFFFFF;
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      padding: 10px 22px;
      border-radius: 9999px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(255, 85, 0, 0.4);
    }
    .download-video-btn:hover {
      background: #FF6611;
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(255, 85, 0, 0.6);
    }

    /* Section Card */
    .section-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 36px 40px;
      margin-bottom: 56px;
      transition: border-color 0.2s;
    }
    .section-card:hover {
      border-color: rgba(255, 255, 255, 0.16);
    }
    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .section-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .section-category {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .section-route {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #64748B;
      background: rgba(255, 255, 255, 0.04);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }
    .section-desc {
      font-size: 14.5px;
      color: #94A3B8;
      max-width: 900px;
      line-height: 1.65;
      margin-top: 6px;
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .tag-pill {
      font-size: 11.5px;
      font-weight: 500;
      color: #CBD5E1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 3px 10px;
      border-radius: 6px;
    }

    /* Comparison Stage (Side-by-Side) */
    .comparison-stage {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 380px;
      gap: 32px;
      align-items: start;
      margin-top: 28px;
    }
    @media (max-width: 1080px) {
      .comparison-stage {
        grid-template-columns: 1fr;
      }
    }

    /* Desktop Window Mockup */
    .desktop-window {
      background: #141C2B;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      position: relative;
    }
    .window-header {
      background: #0F1622;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .window-dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #EF4444; }
    .dot-yellow { background: #F59E0B; }
    .dot-green { background: #10B981; }
    .window-address {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 11.5px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .address-lock {
      font-size: 11px;
      color: #10B981;
    }
    .window-badge {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .window-body {
      position: relative;
      background: #0B0F17;
      cursor: zoom-in;
      overflow: hidden;
    }
    .window-body img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s ease;
    }
    .window-body:hover img {
      transform: scale(1.015);
    }
    .zoom-hint {
      position: absolute;
      bottom: 14px;
      right: 14px;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 9999px;
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.2s ease;
    }
    .window-body:hover .zoom-hint,
    .phone-screen:hover .zoom-hint {
      opacity: 1;
      transform: translateY(0);
    }

    /* Mobile Phone Mockup */
    .mobile-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .phone-frame {
      width: 100%;
      max-width: 380px;
      background: #181E29;
      border: 4px solid #2B3545;
      border-radius: 46px;
      padding: 10px 10px 14px 10px;
      box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .phone-speaker-island {
      width: 110px;
      height: 22px;
      background: #000000;
      border-radius: 12px;
      margin: 0 auto 10px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .phone-camera-dot {
      width: 8px;
      height: 8px;
      background: #111827;
      border: 1px solid #1F2937;
      border-radius: 50%;
    }
    .phone-speaker-slit {
      width: 36px;
      height: 3px;
      background: #1F2937;
      border-radius: 2px;
    }
    .phone-screen {
      border-radius: 36px;
      overflow: hidden;
      background: #000000;
      position: relative;
      cursor: zoom-in;
    }
    .phone-screen img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s ease;
    }
    .phone-screen:hover img {
      transform: scale(1.02);
    }
    .phone-home-indicator {
      width: 100px;
      height: 4px;
      background: #475569;
      border-radius: 9999px;
      margin: 10px auto 0 auto;
    }
    .device-label {
      font-size: 11.5px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 10px;
      text-align: center;
    }

    /* Lightbox Modal */
    .lightbox-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.94);
      backdrop-filter: blur(12px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .lightbox-modal.active {
      display: flex;
    }
    .lightbox-img-wrapper {
      max-width: 94vw;
      max-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .lightbox-img-wrapper img {
      max-width: 100%;
      max-height: 90vh;
      border-radius: 12px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
      object-fit: contain;
    }
    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 24px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      font-size: 24px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .lightbox-close:hover {
      background: rgba(255, 85, 0, 0.5);
    }
    .lightbox-caption {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #FFFFFF;
      white-space: nowrap;
    }

    /* Footer */
    .page-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 40px 24px;
      text-align: center;
      color: #64748B;
      font-size: 13px;
    }
    .page-footer strong { color: #CBD5E1; }
  </style>
</head>
<body>

  <!-- Sticky Top Header -->
  <header class="sticky-header">
    <div class="header-inner">
      <a href="#" class="brand">
        <span class="brand-logo">SEBOOTH<span>.</span></span>
        <span class="badge-pill">UI/UX & VIDEO SHOWCASE</span>
      </a>
      <div class="nav-stats">
        <span>Video: <strong>MP4 & WebM HD (1440×900 24FPS)</strong></span>
        <span>Screenshots: <strong>14 View / 28 Tangkapan Layar</strong></span>
      </div>
    </div>
  </header>

  <!-- Quick Navigation Pills -->
  <nav class="quick-nav">
    <div class="quick-nav-inner">
      <a href="#video-demo" class="quick-pill featured">📹 VIDEO DEMO SLIDE DECK</a>
      ${SCREENS.map(s => `<a href="#${s.id}" class="quick-pill">${s.number}. ${s.title.split('—')[0].trim()}</a>`).join('')}
    </div>
  </nav>

  <!-- Main Container -->
  <main class="main-container">

    <!-- Intro Banner -->
    <div class="intro-banner">
      <h1 class="intro-title">Dokumentasi Video & Visual UI/UX Seluruh Halaman Website Sebooth</h1>
      <p class="intro-desc">
        Arsip video demonstrasi dan galeri tangkapan layar lengkap berdampingan (Side-by-Side) untuk setiap halaman, modul slide deck, dan portal aplikasi Sebooth. 
        Mencakup rekaman navigasi dinamis beresolusi <strong>1440×900 px 24 FPS</strong> serta screenshot per-halaman dalam mode <strong>Desktop Web (1440×900)</strong> dan <strong>Mobile Phone (390×844)</strong>.
      </p>
      <div class="intro-metrics">
        <div class="metric-item">
          <span class="metric-val">1 Video</span>
          <span class="metric-label">Demonstrasi Slide Deck HD</span>
        </div>
        <div class="metric-item">
          <span class="metric-val">14 View</span>
          <span class="metric-label">Halaman & Modul Lengkap</span>
        </div>
        <div class="metric-item">
          <span class="metric-val">28 SS</span>
          <span class="metric-label">Desktop + Mobile Mockup</span>
        </div>
        <div class="metric-item">
          <span class="metric-val">100%</span>
          <span class="metric-label">Kecocokan Layout UI/UX</span>
        </div>
      </div>
    </div>

    <!-- Video Demonstration Feature Section -->
    <section id="video-demo" class="video-showcase-card">
      <div class="section-header">
        <div>
          <div class="section-meta">
            <span class="section-category" style="background: rgba(255,85,0,0.18); color: #FF5500; border: 1px solid rgba(255,85,0,0.35);">
              VIDEO DEMONSTRASI SLIDE DECK
            </span>
            <span class="section-route">MP4 (H.264) & WebM (VP9) • 1440×900 px • 24 FPS</span>
          </div>
          <h2 class="section-title">Rekaman Video Demonstrasi Navigasi Slide Deck Landing Page</h2>
          <p class="section-desc">
            Video demonstrasi transisi interaktif berurutan di landing page: Slide 01 (Hero Panning & WhatsApp Booking CTA) &rarr; Slide 02 (Our Services 3D Coverflow & Partner Logo Marquee) &rarr; Slide 03 (Frames 2-Tier Infinite Marquee) &rarr; Slide 04 (Pinterest Wall Real Photos) &rarr; Slide 05 (Pricing & Packages) &rarr; Slide 06 (3D FAQ Folders & Fast Accordion).
          </p>
        </div>
      </div>
      
      <div class="video-container-wrapper">
        <div class="video-window">
          <div class="window-header">
            <div class="window-dots">
              <div class="dot dot-red"></div>
              <div class="dot dot-yellow"></div>
              <div class="dot dot-green"></div>
            </div>
            <div class="window-address">
              <span class="address-lock">🔒</span>
              <span>sebooth.id/demo-slidedeck.mp4</span>
            </div>
            <div class="window-badge">24 FPS • 1440×900</div>
          </div>
          <div class="video-player-box">
            <video id="slidedeck-video" controls autoplay loop muted playsinline>
              <source src="${videoPrefix}/sebooth_slidedeck_demo.mp4" type="video/mp4">
              <source src="${videoPrefix}/sebooth_slidedeck_demo.webm" type="video/webm">
              Browser kamu tidak mendukung pemutaran video HTML5.
            </video>
          </div>
        </div>
        <div class="video-action-bar">
          <div class="video-tags">
            <span class="tag-pill">Slide 01 Hero</span>
            <span class="tag-pill">Slide 02 3D Coverflow</span>
            <span class="tag-pill">Slide 03 Frames Marquee</span>
            <span class="tag-pill">Slide 04 Pinterest Wall</span>
            <span class="tag-pill">Slide 05 Pricing</span>
            <span class="tag-pill">Slide 06 FAQ 3D Folders</span>
          </div>
          <a href="${videoPrefix}/sebooth_slidedeck_demo.mp4" download="sebooth_slidedeck_demo.mp4" class="download-video-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download File Video MP4 (6.09 MB)
          </a>
        </div>
      </div>
    </section>

    <!-- Section Cards Flow (Linear Document) -->
    ${SCREENS.map(s => `
    <article id="${s.id}" class="section-card">
      <div class="section-header">
        <div>
          <div class="section-meta">
            <span class="section-category" style="background: ${s.categoryColor}25; color: ${s.categoryColor}; border: 1px solid ${s.categoryColor}40;">
              ${s.number} / ${s.category}
            </span>
            <span class="section-route">${s.route}</span>
          </div>
          <h2 class="section-title">${s.title}</h2>
          <p class="section-desc">${s.description}</p>
          <div class="tag-list">
            ${s.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Side-by-Side Comparison -->
      <div class="comparison-stage">
        
        <!-- Desktop Mockup (1440x900) -->
        <div class="desktop-wrapper">
          <div class="desktop-window">
            <div class="window-header">
              <div class="window-dots">
                <div class="dot dot-red"></div>
                <div class="dot dot-yellow"></div>
                <div class="dot dot-green"></div>
              </div>
              <div class="window-address">
                <span class="address-lock">🔒</span>
                <span>sebooth.id${s.route.replace('GET ', '').split(' ')[0]}</span>
              </div>
              <div class="window-badge">Desktop (1440×900)</div>
            </div>
            <div class="window-body" onclick="openLightbox('${imagePrefix}/${s.id}_desktop.png', '${s.title} — Desktop Mode (1440×900)')">
              <img src="${imagePrefix}/${s.id}_desktop.png" alt="${s.title} Desktop" loading="lazy" />
              <div class="zoom-hint">🔍 Klik untuk Zoom HD</div>
            </div>
          </div>
          <div class="device-label">Desktop Widescreen (1440×900 px)</div>
        </div>

        <!-- Mobile Mockup (390x844) -->
        <div class="mobile-wrapper">
          <div class="phone-frame">
            <div class="phone-speaker-island">
              <div class="phone-speaker-slit"></div>
              <div class="phone-camera-dot"></div>
            </div>
            <div class="phone-screen" onclick="openLightbox('${imagePrefix}/${s.id}_mobile.png', '${s.title} — Mobile Mode (390×844)')">
              <img src="${imagePrefix}/${s.id}_mobile.png" alt="${s.title} Mobile" loading="lazy" />
              <div class="zoom-hint">🔍 Klik Zoom HD</div>
            </div>
            <div class="phone-home-indicator"></div>
          </div>
          <div class="device-label">Mobile Handheld (390×844 px)</div>
        </div>
      </div>
    </article>
    `).join('')}

  </main>

  <!-- Lightbox Zoom Modal -->
  <div id="lightbox" class="lightbox-modal" onclick="closeLightbox()">
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <div class="lightbox-img-wrapper" onclick="event.stopPropagation()">
      <img id="lightbox-img" src="" alt="Zoom Preview" />
      <div id="lightbox-caption" class="lightbox-caption"></div>
    </div>
  </div>

  <!-- Page Footer -->
  <footer class="page-footer">
    <p>Dibuat secara otomatis untuk <strong>Sebooth Website Project</strong> &bull; &copy; 2026 Sebooth Indonesia. All Rights Reserved.</p>
  </footer>

  <script>
    function openLightbox(src, caption) {
      const modal = document.getElementById('lightbox');
      const img = document.getElementById('lightbox-img');
      const cap = document.getElementById('lightbox-caption');
      img.src = src;
      cap.textContent = caption;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      const modal = document.getElementById('lightbox');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  </script>
</body>
</html>
`;
}

// Generate two versions:
// 1. Root `ui_showcase.html` with image path `./public/screenshots/` and video path `./public/videos`
fs.writeFileSync('ui_showcase.html', buildHtml('./public/screenshots', './public/videos'), 'utf8');
console.log('Saved: ui_showcase.html (Root with ./public/screenshots and ./public/videos)');

// 2. Public `public/ui_showcase.html` with image path `./screenshots/` and video path `./videos` (for Next.js static serving)
fs.writeFileSync(path.join('public', 'ui_showcase.html'), buildHtml('./screenshots', './videos'), 'utf8');
console.log('Saved: public/ui_showcase.html (Public with ./screenshots and ./videos)');
