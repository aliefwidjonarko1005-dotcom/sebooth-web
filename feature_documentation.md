# Sebooth Website — Dokumentasi Lengkap Fitur & Halaman

Dokumen ini menjelaskan secara detail **semua halaman dan fitur** yang ada di website Sebooth, berdasarkan source code yang telah dianalisis sepenuhnya.

---

## 📐 Arsitektur Umum

### Root Layout ([src/app/layout.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/layout.tsx))
- Mengatur **dua font** yang digunakan di seluruh website:
  - **Inter** (Google Font) — font utama untuk body text, label, dan paragraf. Diatur sebagai CSS variable `--font-sans`.
  - **Sebooth** (font lokal kustom dari [src/app/fonts/Sebooth.otf](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/fonts/Sebooth.otf)) — font display/brand untuk heading utama. Diatur sebagai CSS variable `--font-sebooth`.
- Mengatur metadata SEO default:
  - Title: *"Sebooth - Premium Photobooth Experience"*
  - Description: *"Capture Every Moment, Create Infinite Memories with Sebooth."*
- Mengaktifkan `scroll-smooth` pada `<html>` untuk navigasi anchor yang halus.
- Custom selection color: Gold (`#D4AF37`) background dengan text hitam.
- Membungkus semua children dengan [LayoutShell](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/layout/LayoutShell.tsx#10-24) component untuk conditional header/footer.

### Layout Shell ([src/components/layout/LayoutShell.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/layout/LayoutShell.tsx))
- **Fungsi**: Menentukan apakah Header, Footer, dan FloatingCTA ditampilkan atau disembunyikan berdasarkan path URL saat ini.
- **Path yang dikecualikan** (tanpa Header/Footer/FloatingCTA):
  - `/profile` — halaman galeri user
  - `/login` — halaman login
  - `/register` — halaman registrasi
  - `/admin` — halaman admin panel
  - `/access/*` — halaman akses sesi via QR code
- **Path yang ditampilkan** (dengan Header/Footer/FloatingCTA):
  - `/` (homepage)
  - `/about`
  - `/partnership`

### Middleware ([src/middleware.ts](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/middleware.ts))
- **Fungsi**: Proteksi route berbasis autentikasi menggunakan Supabase SSR cookies.
- **Route yang diproteksi**: `/profile` dan `/admin` — user yang belum login akan otomatis diarahkan ke `/login`.
- **Mekanisme**: Membuat Supabase server client menggunakan `createServerClient` dari `@supabase/ssr`, membaca cookie dari request, dan memeriksa status autentikasi user via `supabase.auth.getUser()`.
- **Matcher**: Semua route kecuali `api`, `_next/static`, `_next/image`, dan [favicon.ico](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/favicon.ico).

---

## 🏠 Halaman Homepage (`/`)

**File**: [src/app/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/page.tsx)

Homepage adalah landing page utama website Sebooth yang terdiri dari **9 section** yang ditampilkan secara berurutan dari atas ke bawah:

### 1. Hero Section ([src/components/sections/Hero.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/Hero.tsx))

- **Tampilan**: Section fullscreen yang menampilkan area cinematic (placeholder untuk video loop atau foto resolusi tinggi) dengan overlay gelap.
- **Konten**:
  - Heading utama: *"Capture Every Moment, Create Infinite Memories."* (menggunakan font Sebooth kustom)
  - Subheading: *"Premium Photobooth Experience for Weddings, Corporate, and Private Parties. Powered by Industrial Efficiency."*
  - Tombol CTA: **"Book Your Experience"** yang mengarah ke section `#contact`
- **Animasi**: Staggered fade-in animation menggunakan Framer Motion — heading muncul lebih dulu, lalu subheading, lalu tombol CTA.
- **Layout**: Konten diposisikan di bagian bawah section (items-end) memberikan kesan cinematic.

### 2. About Section ([src/components/sections/About.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/About.tsx))

- **Tampilan**: Layout dua kolom (grid 2 kolom di desktop, 1 kolom di mobile).
- **Kolom Kiri (Text)**:
  - Label: *"Our Story"* (uppercase, hijau brand)
  - Heading: *"From Engineering to Aesthetics."* (font Sebooth)
  - Paragraf teaser singkat tentang asal usul Sebooth dari Semarang
  - Link **"Read Our Full Story →"** yang mengarah ke halaman `/about`
- **Kolom Kanan (Visual)**: Placeholder 4:5 aspect ratio untuk gambar/ilustrasi "Zero-Lag System".
- **Animasi**: Fade-in saat scroll ke view (whileInView) menggunakan Framer Motion.

### 3. Product Section ([src/components/sections/Product.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/Product.tsx))

- **Tampilan**: Split-screen layout dua kolom (gambar kiri, daftar produk kanan).
- **Kolom Kiri**: Area display gambar produk yang berubah secara dinamis sesuai produk yang dipilih, dengan animasi crossfade (AnimatePresence mode="wait").
- **Kolom Kanan**:
  - Header section: *"Our Services"* → *"Curated Experiences."*
  - **3 produk interaktif** yang bisa diklik untuk expand/collapse:
    1. **Standard Booth** — *"Digital-First Experience"*
       - Spesifikasi: Unlimited Digital Shots, Basic Props Kit, Instant QR Download, Online Gallery Access
    2. **Deluxe Booth** — *"The Professional Choice"*
       - Spesifikasi: Unlimited Physical Prints, Premium Backdrop Selection, DNP RX1 HS High-Speed Printing, On-site Technical Assistant
    3. **Glamour Booth** — *"Studio Elegance"*
       - Spesifikasi: Black & White Signature, High-End Studio Lighting, Beauty Filter Integration, Luxury Visuals
- **Interaksi**: Klik pada produk akan mengubah:
  - Background item menjadi hitam (state aktif)
  - Tagline berubah warna ke gold (`#D4AF37`)
  - Konten detail (deskripsi + spesifikasi) muncul dengan animasi expand
  - Gambar di kolom kiri berubah sesuai produk yang dipilih

### 4. Pricing Section ([src/components/sections/Pricing.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/Pricing.tsx))

- **Tampilan**: Layout dua kolom menampilkan dua jenis paket harga.
- **Unlimited Package** (kolom kiri):
  - *"All You Can Photo Experience"*
  - 4 pilihan durasi:
    - 1 Hour — Rp1.800.000
    - 2 Hours — Rp2.200.000
    - 3 Hours — Rp2.800.000
    - 5 Hours — Rp4.000.000
- **Quota Package** (kolom kanan):
  - *"Print Quantity Based"*
  - 5 pilihan kuota cetak:
    - 100 Prints — Rp1.300.000
    - 200 Prints — Rp2.400.000
    - 300 Prints — Rp3.300.000
    - 400 Prints — Rp4.200.000
    - 500 Prints — Rp5.000.000
- **Visual**: Setiap item harga ditampilkan sebagai baris horizontal dengan hover effect (background abu-abu).
- **Animasi**: Fade-in saat scroll ke view.

### 5. Testimonials Section ([src/components/sections/Testimonials.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/Testimonials.tsx))

- **Tampilan**: Grid 3 kolom menampilkan testimoni dari klien.
- **3 Testimoni**:
  1. **Sarah & Dimas** (Wedding Clients) — tentang kualitas cetak yang tak tertandingi
  2. **TechCorp Indonesia** (Corporate Partner) — tentang energi baru di acara gala perusahaan
  3. **Local Coffee Shop** (Brand Activation) — tentang kemudahan dan estetika
- **Visual**: Quote dalam format serif italic, dengan nama penulis (bold) dan peran (uppercase, muted).
- **Animasi**: Staggered fade-in (delay bertahap per kartu).

### 6. Gallery Section ([src/components/sections/Gallery.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/Gallery.tsx))

- **Tampilan**: Grid masonry (4 kolom di desktop) dengan item berukuran bervariasi (ada yang wide, ada yang tall).
- **Filter Kategori**: 5 tombol filter di bagian atas:
  - All, Wedding, Corporate, Private, Cultural
  - Klik pada kategori akan memfilter galeri secara real-time
- **6 Item Galeri** (data statis):
  1. Gala Night 2024 (Corporate)
  2. Sarah & John (Wedding, tall)
  3. Tech Summit (Corporate, wide)
  4. Sweet 17: Bella (Private)
  5. Product Launch (Corporate)
  6. Summer Fest (Cultural, wide)
- **Hover Effect**: Overlay hijau (`#0F3D2E`) muncul saat hover, menampilkan nama event dan kategori.
- **Animasi**: Fade-in/out saat filter berubah.

### 7. Instagram Feed Section ([src/components/sections/InstagramFeed.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/InstagramFeed.tsx))

- **Tampilan**: Horizontal scrollable carousel menampilkan embed post Instagram.
- **Sumber Data**: Diambil secara dinamis dari tabel `instagram_posts` di Supabase, diurutkan berdasarkan `display_order`.
- **Mekanisme**: Setiap post di-embed menggunakan `<iframe>` dengan URL `{instagram_url}embed/`.
- **Visual**: Setiap card berukuran 320–350px lebar, dengan rounded corners, border, dan shadow. Snap scrolling untuk mobile.
- **Conditional Rendering**: Section hanya muncul jika ada minimal 1 post Instagram di database. Jika kosong, section tidak dirender sama sekali.
- **Animasi**: Staggered fade-in per card.

### 8. FAQ Section ([src/components/sections/FAQ.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/FAQ.tsx))

- **Tampilan**: Layout dua kolom — judul di kiri, accordion di kanan.
- **4 Pertanyaan FAQ**:
  1. *"Do you travel outside of Semarang?"* — Ya, bisa ke seluruh Jawa Tengah dan nasional.
  2. *"How much space do you need?"* — Butuh area 3x3 meter.
  3. *"Can we customize the photo frame design?"* — Ya, semua paket include custom frame.
  4. *"Do you provide digital copies?"* — Ya, download via QR code + online gallery.
- **Interaksi**: Klik pertanyaan untuk expand/collapse jawaban. Hanya satu jawaban yang bisa terbuka dalam satu waktu.
- **Animasi**: Expand/collapse dengan animasi height dan opacity menggunakan AnimatePresence. Ikon berubah dari Plus ke Minus saat terbuka (warna gold).

### 9. Location Section ([src/components/sections/Location.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/sections/Location.tsx))

- **Tampilan**: Section full-width 600px tinggi sebagai placeholder untuk Google Maps embed.
- **Konten**:
  - Heading: *"Visit Our Studio"*
  - Card info alamat:
    - **Sebooth HQ**
    - Jl. Photobooth Premium No. 12, Semarang Selatan, Jawa Tengah 50241
  - Link **"Get Directions →"** yang mengarah ke Google Maps
- **Status**: Masih placeholder (belum ada embed Google Maps aktual).

---

## 📄 Halaman About (`/about`)

**File**: [src/app/about/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/about/page.tsx)

### Fungsi
Halaman yang menceritakan **kisah perusahaan Sebooth** secara naratif, menampilkan visi dan misi perusahaan.

### Struktur
**3 section utama**:

1. **Hero Narrative**
   - Label: *"Our Story"*
   - Heading besar: *"Membangun Kenangan."*
   - 2 paragraf naratif tentang asal usul Sebooth:
     - Pertanyaan awal: *"Bagaimana kita bisa membuat momen singkat menjadi abadi?"*
     - Cerita bermula dari garasi kecil di Semarang, menggabungkan presisi teknik dengan seni fotografi
   - Animasi fade-in saat halaman dimuat

2. **Vision & Mission** (background hitam `#1A1A1A`)
   - Layout dua kolom:
   - **Kolom Kiri — Mimpi Besar (Vision)**:
     - Menjadi standar emas dalam industri *event experience* di Indonesia
     - Teknologi dan keramahtamahan untuk kebahagiaan nyata
   - **Kolom Kanan — Langkah Kecil (Mission)**:
     - 3 langkah bernomor dengan aksen gold:
       1. **Technical Excellence** — Inovasi peralatan optik dan cetak terbaik
       2. **Human Connection** — Tim sebagai pemandu kebahagiaan
       3. **Sustainable Growth** — Tumbuh dengan mitra lokal

3. **Footer Quote**
   - Quote closing: *"Every picture tells a story. Let us help you write yours."*

---

## 🤝 Halaman Partnership (`/partnership`)

**File**: [src/app/partnership/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/partnership/page.tsx)

### Fungsi
Halaman B2B yang ditujukan untuk **Event Organizer (EO)** dan **Wedding Organizer (WO)** yang ingin bermitra dengan Sebooth.

### Struktur
**2 kolom utama**:

**Kolom Kiri — Partner Benefits**:
- 3 keuntungan bermitra:
  1. **Lucrative Commission** (ikon Zap, gold) — Komisi 10-15% atau skema net-rate
  2. **Whitelabel Option** (ikon ShieldCheck) — "Ghost Mode" untuk event premium, booth muncul sebagai layanan in-house klien
  3. **Dedicated Coordinator** (ikon CheckCircle) — Akses langsung ke technical lead, tanpa call center
- Tombol **"Download Partner Rate Card"** (hitam, dengan ikon Download)

**Kolom Kanan — Inquiry Form**:
- Form registrasi partner dengan field:
  - Agency / Company Name
  - Contact Person + WhatsApp (side by side)
  - Est. Events per Year (dropdown: 1-5, 5-10, 10-20, 20+ VIP Partner)
  - Message / Special Request (textarea)
  - Tombol **"Apply for Partnership →"** (hijau brand)

---

## 🔐 Halaman Login (`/login`)

**File**: [src/app/login/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/login/page.tsx)

### Fungsi
Halaman autentikasi email/password dengan integrasi **session claiming flow**.

### Fitur Detail
- **Form Login**: Email + Password input dengan ikon (Mail, Lock)
- **Mode Klaim**: Jika URL mengandung query parameter `?claim=[id]`:
  - Judul berubah menjadi *"Masuk untuk Klaim"*
  - Deskripsi berubah menjadi *"Satu langkah lagi untuk menyimpan sesi fotomu."*
  - Badge biru muncul: *"⚡ Mode Klaim Aktif"*
  - Setelah login berhasil, session di database akan otomatis di-update dengan `user_id` user dan `is_claimed: true`
  - Redirect ke `/access/[id]` setelah berhasil
- **Mode Normal** (tanpa claim):
  - Judul: *"Masuk ke Sebooth"*
  - Deskripsi: *"Akses semua galeri fotomu di sini."*
  - Redirect ke `/profile` setelah berhasil
- **Error Handling**: Pesan error ditampilkan dalam box merah jika login gagal
- **Navigasi**: Link ke "Lupa Password?" dan "Daftar Akun Baru" (mempertahankan claim ID jika ada)
- **Animasi**: Card muncul dengan scale + opacity animation
- **Suspense Boundary**: Loading spinner sambil menunggu `useSearchParams` siap

---

## 📝 Halaman Register (`/register`)

**File**: [src/app/register/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/register/page.tsx)

### Fungsi
Halaman registrasi akun baru dengan integrasi **session claiming flow**, mirip dengan halaman login.

### Fitur Detail
- **Form Registrasi**: Email + Password (minimum 6 karakter)
- **Mode Klaim**: Jika URL mengandung `?claim=[id]`:
  - Judul: *"Daftar & Klaim Foto"*
  - Deskripsi: *"Daftar sekarang dan foto ini jadi milikmu selamanya."*
  - Badge biru: *"🌟 Klaim Fotomu Sekarang"*
  - Setelah registrasi berhasil, session otomatis di-claim ke user baru
  - Redirect ke `/access/[id]`
- **Mode Normal**:
  - Judul: *"Buat Akun Sebooth"*
  - Deskripsi: *"Mulai simpan kenanganmu selamanya."*
  - Redirect ke `/profile`
- **Navigasi**: Link ke "Masuk" (halaman login, mempertahankan claim ID)

---

## 📱 Halaman QR Access Point (`/access/[id]`)

**File**: [src/app/access/[id]/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/access/%5Bid%5D/page.tsx)

### Fungsi
**Titik masuk utama** bagi pengguna photobooth. Setelah foto diambil di booth fisik, user memindai QR code yang mengarahkan ke halaman ini. Halaman ini menampilkan preview semua media dari sesi tersebut dan mengelola proses klaim kepemilikan.

### Alur Kerja (Flow)
1. **Fetch Session**: Mengambil data sesi dari Supabase berdasarkan `[id]` di URL, beserta semua media terkait (photos, GIFs, videos).
2. **Check Auth**: Memeriksa apakah user sudah login.
3. **Preview Grid**: Menampilkan semua media dalam grid responsif (1 kolom mobile, 2 tablet, 3 desktop):
   - Gambar ditampilkan dengan `<img>`
   - Video/live ditampilkan dengan `<video>` (autoPlay, loop, muted)
   - Setiap card memiliki hover zoom effect dan label tipe media
   - Heading: *"Yeay! Kenanganmu Siap."*
   - Subtitle menampilkan jumlah media dan nama event

### 4 Skenario CTA (Call-to-Action)

| Skenario | Kondisi | Tampilan |
|---|---|---|
| **Auto-Claim** | User login + sesi belum diklaim | Otomatis klaim tanpa klik, lalu redirect ke `/profile` setelah 2 detik |
| **Manual Claim** | User login + sesi belum diklaim (fallback) | Card biru dengan greeting personal + tombol "Klaim Sekarang! 🚀" |
| **Claim Berhasil** | Sesi berhasil diklaim | Ikon ✓ + *"Foto Sudah Di Klaim"* + tombol "Lihat My Photos" |
| **Sudah Diklaim Orang Lain** | Sesi diklaim oleh user berbeda | Ikon ✗ + *"Sudah Diklaim"* + pesan maaf |
| **Guest (Belum Login)** | User belum login | *"Simpan Selamanya?"* + 2 tombol: "Daftar Sekarang" (→ `/register?claim=[id]`) dan "Sudah Punya Akun" (→ `/login?claim=[id]`) |

### Error Handling
- Jika sesi tidak ditemukan: Tampilan error dengan ikon XCircle merah dan pesan *"Session tidak ditemukan atau link sudah kedaluwarsa."* serta tombol "Kembali ke Beranda".

---

## 🖼️ Halaman User Gallery / My Photos (`/profile`)

**File**: [src/app/profile/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/profile/page.tsx)

### Fungsi
**Halaman pribadi user** untuk melihat dan mendownload semua foto, GIF, video, dan photo strip dari sesi-sesi photobooth yang telah diklaim.

### Proteksi
- Dilindungi oleh middleware — hanya user yang sudah login yang bisa mengakses.
- Jika belum login, otomatis redirect ke `/login`.

### Navigasi Atas (Custom Navbar)
- Link "🏠 Beranda" (ke homepage)
- Judul: **"My Photos"**
- Tombol "Keluar" (logout) yang mengarah ke `/login`

### Header
- Greeting personal: *"Halo, [username]! 👋"* (mengambil bagian sebelum @ dari email)
- **Session Picker**: Jika user memiliki lebih dari 1 sesi, muncul dropdown untuk berpindah antar sesi (menampilkan nama event + tanggal). Saat hanya 1 sesi, info event ditampilkan sebagai text label.

### 4 Tab Konten (Bottom Navigation Pill)

Tab ditampilkan sebagai **floating bottom navigation bar** berbentuk pill (rounded, shadow) yang fixed di bawah layar:

#### Tab 1: Strip (Photo Strip)
- **Fungsi**: Menampilkan photo strip dengan berbagai template frame.
- **Mekanisme**: Jika ada minimal 3 foto individual, sistem akan otomatis generate strip menggunakan **Canvas API** di client-side untuk setiap template frame:
  1. **Original Strip** — strip asli dari booth (jika ada)
  2. **Classic White** — background putih, teks hitam, subtitle "THE PREMIUM EXPERIENCE"
  3. **Night Edition** — background hitam `#1A1A1A`, border abu-abu, teks putih, subtitle "NIGHT EDITION"
  4. **Wedding Elegant** — background krem `#F9F6F0`, border gold tebal (`#D4AF37`), teks hijau brand, subtitle "WEDDING COLLECTION"
- **Canvas Rendering**: Strip 1080×1920px, 3 slot foto (16:9 per slot, center-crop), branding "SEBOOTH" di bagian bawah.
- **Navigasi**: Carousel dengan tombol ← → dan indikator dot.
- **Download**: Tombol **"Simpan Strip"** untuk mendownload strip yang sedang ditampilkan.
- **Loading State**: Spinner *"Membuat template..."* saat generating.

#### Tab 2: GIF
- **Fungsi**: Menampilkan GIF animasi dari sesi.
- **Deteksi**: File GIF dideteksi berdasarkan `type === 'gif'` atau nama file mengandung `animation.gif`.
- **Tampilan**: Gambar GIF dalam rounded card dengan shadow.
- **Download**: Tombol **"Simpan GIF"**.

#### Tab 3: Live (Live Photo / Video)
- **Fungsi**: Menampilkan live photo (video pendek) dari sesi.
- **Deteksi**: File live dideteksi berdasarkan `type === 'live'` atau nama file mengandung `live.mp4`.
- **Tampilan**: Video player dengan autoPlay, loop, muted, playsInline.
- **Error Handling**: Jika video gagal dimuat, menampilkan fallback UI: ikon AlertCircle + *"Video gagal dimuat"* + *"File mungkin rusak atau belum selesai"*.
- **Download**: Tombol **"Simpan Live Photo"**.

#### Tab 4: Photos (Foto Individual)
- **Fungsi**: Menampilkan semua foto individu dari sesi (dikecualikan strip dan GIF).
- **Tampilan**: Grid 2 kolom, aspect-square, dengan hover zoom effect.
- **Download Per Foto**: Tombol download muncul di pojok kanan bawah saat hover.
- **Download Semua**: Tombol **"Simpan Semua Foto"** yang mendownload semua media secara berurutan dengan delay 400ms antar file.

### Empty State
- Jika user belum memiliki sesi yang diklaim: Tampilan kosong dengan ikon Grid besar, heading *"Belum Ada Koleksi"*, dan instruksi *"Scan QR code di Sebooth untuk mulai mengisi galerimu!"*.

### Download Mechanism
- Semua download menggunakan custom [downloadFile()](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/profile/page.tsx#25-42) function yang:
  1. Fetch file via URL
  2. Convert ke Blob
  3. Buat object URL → trigger download via `<a>` tag
  4. Revoke URL setelah selesai
  5. Fallback: buka di tab baru jika fetch gagal

---

## 🛡️ Halaman Admin Panel (`/admin`)

**File**: [src/app/admin/page.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/app/admin/page.tsx)

### Fungsi
**Panel CMS** untuk mengelola seluruh konten website. Hanya bisa diakses oleh admin yang terverifikasi.

### Sistem Autentikasi Admin (Dual Check)
1. **Environment Variable**: Email admin yang terdaftar di `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated) — selalu berfungsi, tidak terpengaruh RLS.
2. **Database Table**: Tabel `admins` di Supabase dengan kolom `email` dan `is_super`.
3. **Super Admin**: User yang terdaftar di env var ATAU memiliki `is_super: true` di database. Super admin bisa mengelola admin lain.

### Access Denied State
- Jika user login tapi bukan admin: Tampilan ShieldCheck merah + *"Access Denied"* + *"Akun Anda tidak terdaftar sebagai admin."* + link ke My Photos dan Beranda.

### Navigasi Atas
- Link ke homepage (ikon Home)
- Badge: ShieldCheck hijau + *"Admin Panel"*
- Tombol logout

### Toast Notification
- Pesan sukses/error muncul di atas layar sebagai floating badge hijau dengan animasi bounce, otomatis hilang setelah 3 detik.

### 5 Tab Admin

#### Tab 1: Content (Site Content)
- **Fungsi**: Mengelola konten teks untuk semua section di homepage.
- **Struktur Data**: Tabel `site_content` dengan kolom `section`, `key`, `value`.
- **Tombol Quick-Add**: 7 tombol untuk menambah item ke section: hero, about, product, gallery, faq, location, testimonials.
- **Per Item**:
  - Input Key (nama konten)
  - Textarea Value (isi konten)
  - Tombol Save (hijau) + Delete (merah)
- **Grouping**: Item dikelompokkan berdasarkan section name, masing-masing dalam card terpisah.

#### Tab 2: Pricing
- **Fungsi**: Shortcut untuk mengelola item pricing (sebenarnya subset dari Content tab dengan section "pricing").
- **Per Item**: Input nama paket + input harga + Save + Delete.
- **Tombol**: "Tambah Paket" untuk menambah pricing baru.

#### Tab 3: Instagram
- **Fungsi**: Mengelola daftar post Instagram yang ditampilkan di homepage.
- **Input**: URL Instagram post (contoh: `https://www.instagram.com/p/XXXXX/`)
- **List**: Daftar post dengan nomor urut, URL (truncated), dan tombol delete.
- **Urutan**: Ditampilkan berdasarkan `display_order`, post baru otomatis mendapat order terakhir.

#### Tab 4: News
- **Fungsi**: Mengelola berita dan pengumuman.
- **Form Tambah Berita**:
  - Judul berita
  - Isi berita (textarea)
  - URL gambar (opsional)
  - Tombol **"Publish"**
- **Daftar Berita**: Menampilkan thumbnail (jika ada image_url), judul (bold), preview isi (2 line clamp), tanggal, dan tombol delete.

#### Tab 5: Admins (Super Admin Only)
- **Fungsi**: Mengelola daftar admin. **Hanya muncul untuk super admin.**
- **Invite Admin**: Input email + tombol "Invite" — menambahkan email ke tabel `admins` dengan `is_super: false`.
- **Daftar Admin**: Menampilkan email, badge "Super Admin" (gold) jika `is_super: true`, dan tombol delete (hanya untuk non-super admin — super admin tidak bisa dihapus dari UI).

---

## 🎨 Komponen Fitur Khusus

### Frame Editor Modal ([src/components/features/FrameEditorModal.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/features/FrameEditorModal.tsx))

- **Fungsi**: Modal advanced untuk **compositing foto dengan frame overlay SVG** menggunakan Canvas API.
- **Input**: Array `rawPhotos` (MediaItem[]) + `isOpen` + `onClose`
- **3 Template Frame**:
  1. Classic White (`/frames/classic.svg`)
  2. Night Edition (`/frames/dark.svg`)
  3. Wedding Elegant (`/frames/elegant.svg`)
- **Canvas Processing** (1080×1620px):
  1. Draw background putih
  2. Draw 3 foto ke 3 slot (60px margin, 960×420px per slot)
  3. Center-crop foto agar pas di slot
  4. Draw SVG overlay di atas semua
  5. Export ke JPEG 95% quality
- **UI Modal**: Split layout — preview besar di kiri, controls di kanan:
  - Tombol navigasi ← → untuk ganti frame
  - Info frame aktif
  - Tombol **"Download Hasil"**
- **Animasi**: Modal muncul/hilang dengan scale + opacity. Preview berubah dengan fade animation.

---

## 🧩 Komponen Layout

### Header ([src/components/layout/Header.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/layout/Header.tsx))

- **Dua State**:
  - **Transparent** (sebelum scroll > 50px): Background transparan, padding besar
  - **Solid** (setelah scroll > 50px): Background putih, border bawah, padding kecil
- **Logo**: Gambar [logo-text-black.png](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/public/logo-text-black.png) dengan Next.js Image (priority loading)
- **Desktop Navigation** (hidden di mobile): 7 menu item:
  1. About Us → `/about`
  2. Our Product → `/#product`
  3. Pricing → `/#pricing`
  4. Gallery → `/#gallery`
  5. Partnership → `/partnership`
  6. Location → `/#location`
  7. My Photos → `/profile`
  - Tombol CTA: **"Book Now"** (background hijau brand)
- **Mobile Navigation**: Hamburger menu (ikon Menu/X) yang membuka dropdown fullwidth dengan animasi slide-down.

### Footer ([src/components/layout/Footer.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/layout/Footer.tsx))

- **Background**: Hitam (`#1A1A1A`) dengan text putih/abu-abu
- **4 Kolom**:
  1. **Brand**: Logo "sebooth." + deskripsi singkat
  2. **Menu**: 5 navigation links (About, Product, Pricing, Gallery, Locations)
  3. **Connect**: 3 social media links (Instagram, TikTok, WhatsApp) — masing-masing dengan ikon ArrowUpRight saat hover
  4. **Office**: Alamat kantor (Jl. Photobooth Premium No. 12, Semarang) + email hello@sebooth.com
- **Bottom Bar**: Copyright © + Privacy Policy + Terms of Service links

### Floating WhatsApp CTA ([src/components/ui/FloatingCTA.tsx](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/components/ui/FloatingCTA.tsx))

- **Posisi**: Fixed, bottom-right (bottom-8 right-8)
- **Tampilan**: Circle hijau WhatsApp (`#25D366`) dengan ikon MessageCircle
- **Interaksi**: Hover menghasilkan scale-up effect, klik membuka chat WhatsApp di tab baru
- **Visibility**: Hanya muncul di halaman publik (homepage, about, partnership) — tidak muncul di login, register, profile, admin, access.

---

## 🗃️ Utilitas & Type Definitions

### Supabase Client ([src/lib/supabase.ts](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/lib/supabase.ts))
- Factory function [createClient()](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/lib/supabase.ts#3-8) yang membuat Supabase browser client menggunakan `createBrowserClient` dari `@supabase/ssr`.
- Menggunakan environment variables: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Utility Function ([src/lib/utils.ts](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/lib/utils.ts))
- [cn(...inputs)](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/lib/utils.ts#4-7) — Menggabungkan class names menggunakan `clsx` dan `tailwind-merge`. Dipakai di seluruh komponen untuk conditional class merging tanpa konflik Tailwind.

### Type Definitions ([src/types/database.ts](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/types/database.ts))
- **[MediaItem](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/types/database.ts#1-9)**: Interface untuk item media di database.
  - [id](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/middleware.ts#4-68), `session_id`, `url`, `type` (union: 'image' | 'video' | 'gif' | 'photo' | 'live'), `metadata` (optional Record), `created_at`
- **[SessionData](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/types/database.ts#10-18)**: Interface untuk data sesi photobooth.
  - [id](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/src/middleware.ts#4-68), `created_at`, `event_name` (nullable), `user_id` (nullable), `is_claimed` (boolean), `media` (optional array of MediaItem)

---

## 🔄 Alur User Utama (User Journey)

### Alur 1: Pengunjung Website
```
Homepage → Browse sections → Book Now / WhatsApp CTA
```

### Alur 2: Mitra EO/WO
```
Homepage → Partnership → Isi inquiry form → Submit
```

### Alur 3: User Photobooth (Utama)
```
Foto di booth fisik → Scan QR code → /access/[id]
  ├─ Sudah login → Auto-claim → Redirect ke /profile
  └─ Belum login → Pilih Daftar/Login
       ├─ /register?claim=[id] → Daftar → Auto-claim → /profile
       └─ /login?claim=[id] → Login → Auto-claim → /profile
```

### Alur 4: Admin CMS
```
/login → /admin → Kelola konten (Content, Pricing, Instagram, News, Admins)
```
