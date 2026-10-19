# Design System: Sebooth Claim Photo QR Page (`/access/[id]`)

> **Single Source of Truth** untuk antarmuka klaim softfile digital photobooth via scan QR code. Disusun menggunakan standar *Anti-Slop Editorial Design* dan kompatibel penuh dengan Google Stitch & AI agent visual synthesis.

---

## 1. Visual Theme & Atmosphere

### Karakteristik & Vibe
Halaman klaim foto Sebooth bukan sekadar halaman unduhan biasa, melainkan **touchpoint digital pertama** setelah tamu berfoto di kiosk fisik (*Mesin Kolong*). Karena 95%+ pengunjung membuka halaman ini langsung dari kamera ponsel (iOS / Android) saat masih berada di venue acara atau baru saja pulang, desain harus memberikan kesan:
- **Editorial & Warmly Professional**: Latar belakang bernuansa *Warm Studio Canvas* (`#FAF8F5`) yang hangat layaknya galeri cetak foto seni, bukan putih rumah sakit (`#FFFFFF`) atau hitam pekat (`#000000`).
- **Tactile & Trustworthy**: Kartu memiliki sudut membulat humanis (16px–28px), bayangan difus alami tanpa glow neon, dan hierarki visual yang tenang.
- **Urgency without Panic**: Sisa waktu penyimpanan 3 hari dikomunikasikan secara tegas (*calm urgency*) dengan aksen amber/warm honey, bukan peringatan bahaya merah mencolok yang mengganggu momen bahagia.

### Dial Nilai Desain (Taste Spectrum)
- **Density: 5 / 10 (Daily App Balanced)** — Ruang bernapas yang cukup antar elemen tanpa membuang ruang layar vertikal pada smartphone.
- **Variance: 7 / 10 (Offset Asymmetric)** — Tata letak galeri dinamis yang menghargai proporsi photostrip (2:3) berdampingan dengan foto pose tunggal (3:4) dan loop live video.
- **Motion: 6 / 10 (Fluid Spring CSS)** — Transisi halus berbasis *spring physics* tanpa animasi dekoratif lambat yang menghambat kecepatan unduh tamu.

---

## 2. Color Palette & Roles

Semua warna dikalibrasi secara ketat. **AI Purple/Neon Blue glows secara eksplisit dilarang.**

| Nama Token | Hex / Nilai | Role & Penggunaan Fungsional |
|---|---|---|
| **Canvas Cream** | `#FAF8F5` | Background canvas utama seluruh viewport. Memberikan kesan hangat, organik, dan premium. |
| **Pure Surface** | `#FFFFFF` | Background kartu informasi, status box, popover dialog, dan container media. |
| **Dark Vault** | `#121620` | Container khusus kartu Google Review 5-star & Lightbox modal. Kontras tinggi bergaya studio malam. |
| **Navy Brand** | `#002366` | Warna identitas primer logo Sebooth & aksen judul institusional. |
| **Fiery Orange** | `#FF4500` / `#FF5500` | Signature CTA accent Sebooth: tombol "Unduh Semua Media", highlight promo, dan kicker badge. |
| **Orange Gradient** | `linear-gradient(90deg, #FF6A00 0%, #FF3D00 50%, #E62A00 100%)` | Gradient eksklusif untuk tombol aksi primer bundle download. |
| **Deep Charcoal** | `#181B34` | Warna teks judul display utama (H1). Menggantikan pure black `#000000`. |
| **Slate Ink** | `#0F172A` | Teks heading sekunder dan label teks berbobot tebal. |
| **Muted Slate** | `#64748B` | Teks deskripsi, keterangan tanggal, instruksi sekunder (max 65ch). |
| **Whisper Border** | `rgba(226, 232, 240, 0.8)` / `#E2E8F0` | Garis batas 1px pada kartu, pemisah header, dan tombol outline. |
| **Amber Warning** | `#D97706` / `#FEF3C7` | Banner retensi 3 hari (peringatan simpan sementara ke akun). |
| **Emerald Safe** | `#059669` / `#ECFDF5` | Status sukses klaim, verifikasi permanen, dan badge akun tertaut. |
| **Rose Alert** | `#E11D48` / `#FFF1F2` | Notifikasi error / sesi kedaluwarsa. |

---

## 3. Typography Architecture

### Font Stacks
1. **Display & Brand Headlines**: `Bayon`, `sans-serif` (uppercase, track-tight, high-impact poster aesthetic khas Sebooth).
2. **Body & Interface**: `Poppins`, system sans-serif (`font-sans`), clean, humanis, sangat terbaca di layar HP resolusi tinggi.
3. **Numbers & Timers**: `ui-monospace`, `JetBrains Mono`, `tabular-nums` untuk countdown timer, ukuran media, dan progress unduhan.

### Skala Tipografi
- **Hero Title (H1)**: `clamp(1.875rem, 5vw, 3rem)` — `font-bayon font-black uppercase text-[#181B34] tracking-tight`.
- **Section Headers (H2/H3)**: `1rem` – `1.25rem` (`font-bold text-slate-900 tracking-tight`).
- **Kicker Badge**: `11px` (`font-extrabold uppercase tracking-widest text-[#FF5500]`).
- **Body Text**: `0.875rem` (`14px`) pada desktop, `0.75rem` – `0.8125rem` (`12–13px`) pada mobile (`text-slate-600 leading-relaxed`).
- **Micro Metadata & Hints**: `10px` – `11px` (`text-slate-400 font-medium`).

### Larangan Tipografi (Banned Patterns)
- **Dilarang** menggunakan font `Inter` default (menghilangkan karakter personal brand).
- **Dilarang** menggunakan font serif konvensional (*Times New Roman*, *Georgia*).
- **Dilarang** teks melebihi 65 karakter per baris pada blok paragraf deskripsi.
- **Dilarang** teks headline membungkus lebih dari 3 baris di viewport smartphone.

---

## 4. Component Stylings & Interaction Specifications

### 4.1 Sticky Top App Bar
- **Struktur**: Ketinggian `56px`, `sticky top-0 z-40`, background `#FAF8F5` dengan `backdrop-blur-md` 90% opacity, border bawah 1px `border-slate-200/80`.
- **Elemen Kiri**: Tombol kembali 36×36px (`rounded-xl`, border 1px, chevron), logo tipografi `SEBOOTH.` (Navy `#002366` + Orange dot), separator slash `/`, dan judul acara ter-truncate.
- **Elemen Kanan**:
  - Tombol **Galeri Akun** (tampil hanya jika sesi sudah diklaim).
  - Tombol **Bagikan Tautan** (36×36px icon button, trigger Web Share API / copy clipboard).
  - Tombol **Panduan Penggunaan** (36×36px icon button, trigger Interactive Tour).

### 4.2 Status & Retention Callout Banners
Kartu status berada tepat di bawah header dan mengadopsi 4 status dinamis:
1. **Sesi Tertaut Permanen**:
   - Background `#FFFFFF`, border `#E2E8F0`, icon perisai hijau (`#059669`).
   - Teks: *"Sesi tersimpan permanen di akun kamu"*, CTA cepat ke `/profile`.
2. **Sesi Diklaim Pengguna Lain**:
   - Background `#F1F5F9`, border `#CBD5E1`, icon info abu-abu.
   - Tetap memberikan akses baca dan unduh file secara bebas tanpa memblokir tamu.
3. **Penyimpanan Sementara Aktif (< 3 Hari)**:
   - Background `#FFFDF9`, border `rgba(252, 211, 77, 0.8)`, chip waktu sisa amber tebal.
   - Teks: *"Sisa Waktu: XX jam XX menit"*.
   - Tombol ganda: Tombol gelap primer *"Masuk & Klaim Sesi"* + Tombol putih sekunder *"Daftar Akun Baru"*.
4. **Sesi Melewati Batas 3 Hari (Expired)**:
   - Background `#FFFFFF`, border `#FECDD3`, chip merah muda.
   - Peringatan unduh instan sebelum rotasi file server berkala.

### 4.3 Hero Section & Primary Action Stack
- **Judul**: Kicker `KOLEKSI SOFTFILE` berwarna `#FF5500`, diikuti headline raksasa `Foto & Video Sesi Kamu` dalam `font-bayon`.
- **Sub-info**: `[Nama Event] · [Jumlah Media] media · [Hari, Tanggal Jam]`.
- **Action Buttons**:
  - **Tombol Utama: "Unduh Semua Media"**:
    - Bentuk pill bulat sempurna (`rounded-full`), padding `px-7 py-3.5`.
    - Gradient oranye menyala (`#FF6A00` ke `#E62A00`), drop shadow `0 8px 24px rgba(255,85,0,0.35)`.
    - Logika unduh berurutan (*Sequential Native Save*) langsung ke Galeri Kamera (Camera Roll) ponsel via Web Share Level 2 tanpa ZIP file yang membingungkan pengguna mobile.
    - Status loading: Indikator spinner + counter real-time `Menyimpan ke Galeri (2/5)...`.
  - **Tombol Sekunder: "Beri Ulasan Studio"**:
    - Background `#FFFFFF`, border tebal 2px `#181B34`, teks hitam display, icon bintang amber emas.
    - Membuka halaman `/access/[id]/review` dengan dial speedometer ulasan interaktif.

### 4.4 Google Review 5-Star Prompt Card (`GoogleReviewPromptCard`)
- **Visual Container**: Permukaan hitam kebiruan gelap (`#121620`), radius besar 28px–32px, ambient glow oranye subtil di sudut kanan atas (`#FF5500/20 blur-3xl`).
- **Badge**: Chip mini `GOOGLE REVIEW` + bar bintang 5 berwarna `#F59E0B` dengan rating `5.0`.
- **Logo**: Container kaca frosted putih 10% dengan ikon Google 4-warna vektor asli.
- **Interaktivitas**: Satu ketukan langsung membuka URL ulasan Google Maps Sebooth (`search.google.com/local/writereview`).
- **State Pasca-Review**: Berubah menjadi kartu ucapan terima kasih dengan badge hijau `TERVERIFIKASI` dan tombol tautan profil studio.

### 4.5 Media Gallery Grid
- **Responsive Layout**:
  - Layar Ponsel (`< 640px`): `grid-cols-2`, gap 12px.
  - Tablet/Desktop (`>= 640px`): `grid-cols-2 md:grid-cols-3`, gap 16px.
- **Aspek Rasio Kartu**:
  - Photostrip: `aspect-[2/3]` (tinggi proporsional layout strip 3-pose).
  - Pose Tunggal: `aspect-[3/4]` (rasio standar potret studio).
  - Video / GIF Live: `aspect-[3/4]` atau `aspect-[2/3]` dengan atribut autoplay, loop, muted, dan playsInline.
- **Detail Overlay Tiap Kartu**:
  - Chip label di sudut kiri atas: Frosted glass hitam (`bg-black/55 backdrop-blur-md`), teks putih `10px uppercase`.
  - Tombol unduh mandiri di sudut kanan atas: Tombol melayang 32×32px kaca frosted hitam (`bg-black/50 hover:bg-black/80`).
  - Efek hover: Skala halus foto `scale-[1.02]`, gradien gelap halus bawah dengan teks *"Lihat detail"*.
  - Native Touch Support: `-webkit-touch-callout: default` agar tamu bisa melakukan long-press langsung di browser Safari/Chrome untuk opsi simpan foto sistem.

### 4.6 Lightbox Detail Modal
- **Backdrop**: Layar penuh dengan `bg-black/80 backdrop-blur-md`, animasi *fade-in*.
- **Modal Box**: Container gelap `#0B0F17`, radius 24px, border 1px putih 15%, lebar maksimal 512px.
- **Top Bar**: Label jenis media di kiri, tombol unduh mandiri putih kontras di kanan, tombol silang tutup.
- **Media Content**: `max-h-[75vh] object-contain` dengan penanganan rotasi & fallback error.
- **Bottom Hint**: Keterangan ramah mobile: *"Tahan (long-press) foto untuk opsi simpan di HP, atau gunakan tombol Unduh di atas"*.

### 4.7 Interactive Guided Tour (`InteractiveTour`)
- **Alur 6 Langkah**:
  1. *Fase 1: Batas Simpan Sementara 3 Hari* (target: banner urgensi).
  2. *Fase 2: Unduh Semua File ke Galeri* (target: tombol bundle).
  3. *Fase 3: Simpan Cepat di Layar HP* (target: hint long-press).
  4. *Fase 4: Ulasan di Google Maps* (target: kartu review 5-star).
  5. *Fase 5: Preview Detail Resolusi Penuh* (target: item media pertama).
  6. *Fase 6: Bagikan Tautan Sesi* (target: tombol share bar).
- **Desain Dialog**: Tooltip kartu melayang dengan indikator langkah bulat, instruksi gestur (*tap / hold / pinch*), dan tombol aksi lanjut.

---

## 5. Layout & Responsive Architecture

### Prinsip Layout
- **Mobile First Focus**: Grid dan tombol dioptimasi untuk viewport genggaman tangan 360px–430px (iPhone & Android modern).
- **Viewport Height Safety**: Menggunakan `min-h-[100svh]` (bukan `h-screen` atau `100vh`) guna menghindari layout loncat akibat dinamika URL bar Safari iOS dan Chrome Android.
- **Max-Width Containment**: Konten dibatasi `max-w-4xl` (896px) di tengah viewport dengan padding horizontal seimbang (`px-4 sm:px-6`).
- **Bottom Safe-Zone**: Ruang kosong bawah `pb-24` untuk memberikan ruang sentuh yang nyaman tanpa terpotong gesture bar ponsel.

### Grid Breakpoints
```css
/* Mobile standard (< 640px) */
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 0.75rem;

/* Tablet / Laptop (>= 768px) */
grid-template-columns: repeat(3, minmax(0, 1fr));
gap: 1rem;
```

---

## 6. Motion & Micro-Interactions

### Spesifikasi Animasi & Spring Physics
- **Button Feedback**: `active:scale-95 transition-all duration-150` memberikan umpan balik taktil seperti tombol fisik kiosk.
- **Hover Micro-Lift**: `hover:scale-[1.02]` dengan pergeseran shadow halus (`shadow-md`).
- **Modal & Dialog**: Spring easing `stiffness: 300, damping: 25`, animasi eksklusif menggunakan `transform` dan `opacity` (akselerasi GPU penuh).
- **Toast Notifications**: Slide-in dari atas `animate-fade-in`, background `slate-950/90` frosted, auto-dismiss 3.5–4.5 detik.

### Logika Penyimpanan Tanpa File ZIP (Zero-ZIP Download UX)
Pengguna umum smartphone sering kesulitan mengekstrak file `.zip` di Files / Download manager. Karena itu, arsitektur unduh Sebooth mengimplementasikan:
1. **Web Share API Level 2 (iOS Photos / Android Gallery Direct)**: Membawa array `File[]` utuh ke sistem share native ponsel.
2. **Sequential Multiple Download Fallback**: Pengunduhan beruntun tiap media dengan jeda 450ms dan penamaan file bersih (`Sebooth_[EventName]_[Label]_[Index].[ext]`).

---

## 7. Anti-Patterns (Banned AI Clichés)

Berikut adalah daftar elemen dan pola yang **DIHARAMKAN** muncul pada halaman claim photo QR:

1. **Dilarang Menggunakan Emojis**: Dilarang memakai emoji apa pun (misal: 📸, 🔥, ⚡, ⭐, 🎉). Gunakan ikon monokromatik dari `lucide-react`.
2. **Dilarang Font Inter**: Font `Inter` dilarang untuk mempertahankan keunikan visual Sebooth (gunakan kombinasi `Bayon` + `Poppins`).
3. **Dilarang Pure Black (`#000000`)**: Gunakan `#181B34`, `#0F172A`, atau `#121620` untuk saturasi gelap yang berkelas.
4. **Dilarang Neon Glows & AI Violet**: Dilarang menambahkan outer glow ungu/sian bergaya AI generik.
5. **Dilarang Mengemas Unduhan Mobile ke ZIP**: Jangan memaksa pengguna smartphone mengekstrak ZIP di browser ponsel.
6. **Dilarang Copywriting AI Klise**: Hindari kata-kata kosong seperti *"Seamless experience"*, *"Unleash your memories"*, *"Next-gen photobooth"*. Gunakan bahasa Indonesia lugas, hangat, dan informatif.
7. **Dilarang Teks Penunjuk Bergerak**: Dilarang tombol bertuliskan *"Scroll down to see photos"* atau panah berkedip-kedip ke bawah.
8. **Dilarang Broken Image State**: Setiap gambar dan video wajib memiliki atribut fallback dan handler `onError` yang mengarah ke URL master Google Cloud Storage.

---

## 8. Google Stitch Generation Prompts (Reference Templates)

Gunakan template visual prompt berikut saat meminta Google Stitch atau sub-agent visual merancang/memodifikasi layar ini:

### Prompt Layar Utama (Claim Page Overview)
```text
Mobile-first web application screen for a premium photobooth softfile claim page named "Sebooth". Warm cream canvas background (#FAF8F5). Clean sticky header with brand typography "SEBOOTH.", event title breadcrumb, and minimal icon buttons. 
Top section features an elegant white card displaying a 3-day retention countdown with warm honey amber badge and two distinct action buttons ("Masuk & Klaim Sesi" in dark slate, "Daftar Akun Baru" in white with subtle border).
Hero section features bold uppercase headline in Bayon display font "FOTO & VIDEO SESI KAMU" with vibrant fiery orange pill CTA button "Unduh Semua Media" with soft drop shadow.
Below hero is a sleek dark navy-charcoal card (#121620) for Google Reviews with 5 amber stars, Google multi-color icon in frosted glass container, and a pill action button.
Gallery section contains a 2-column mobile grid of photos and photostrips with rounded corners, frosted type badges ("Photostrip", "Foto Pose 1", "Live Video"), individual download buttons, and zero emojis. High-end editorial aesthetic, zero neon glows, warm and inviting atmosphere.
```

### Prompt Modal Pratinjau Resolusi Penuh (Lightbox View)
```text
Mobile modal overlay for high-resolution photo detail preview on Sebooth web app. Deep blurred black backdrop (rgba(0,0,0,0.85)). Clean dark slate container (#0B0F17) with 24px rounded corners and subtle 1px border.
Header contains uppercase media title badge in white text, an individual "Unduh" button in pure white with dark text, and a minimal close icon button.
Center displays a crisp high-resolution vertical photostrip with smooth scaling and full image aspect ratio containment.
Footer displays a subtle typography note in slate-400 font: "Tahan (long-press) foto untuk opsi simpan di HP, atau gunakan tombol Unduh di atas". Premium editorial finish, no unnecessary decorations.
```
