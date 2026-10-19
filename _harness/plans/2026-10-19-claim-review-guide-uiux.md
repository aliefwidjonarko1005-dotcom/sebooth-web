# Plan: Claim Page → Google Review → Follow Instagram + Interactive Guide v2

Tanggal: 2026-10-19 · Status: DIIMPLEMENTASIKAN (Fase A + B). Keputusan: unduh dulu tanpa gate, lalu minta rating dan follow. Handle IG @sebooth.in (bisa diganti via NEXT_PUBLIC_INSTAGRAM_HANDLE). Masukan rating rendah diarahkan ke WhatsApp, tanpa tabel baru.
Skill acuan: `design-taste-frontend` (house rules anti-slop), `ui-ux-pro-max` (onboarding: skip/back wajib; animasi: reduced-motion wajib, 1–2 elemen bergerak per view), `frontend-ui-engineering`, `incremental-implementation`.

---

## 1. Kondisi sekarang (hasil audit kode)

### Claim page `/access/[id]` (`AccessSessionClient.tsx`, 900 baris)
| # | Temuan | Lokasi |
|---|---|---|
| C1 | Banner retensi (3 varian) tinggi dan berat, mendorong galeri ke bawah lipatan pertama di HP. Dua tombol login/daftar dobel di dua varian yang isinya hampir identik. | `AccessSessionClient.tsx:528-687` |
| C2 | Hero `h1` 3xl–5xl Bayon + label "KOLEKSI SOFTFILE" uppercase tracked (eyebrow, melanggar house rule). | `:690-700` |
| C3 | Toast tanpa `aria-live`, `pointer-events-none`, hilang otomatis; progres unduhan bundle hanya angka. | `:468-474`, `bundleProgress` |
| C4 | Tidak ada state "selesai unduh". Setelah file turun, user tidak diberi langkah berikutnya (review / follow). | `handleDownloadBundle` `:295` |

### Funnel review `/access/[id]/review` (`ExperienceGaugeReview.tsx`, 780 baris)
| # | Temuan | Risiko |
|---|---|---|
| R1 | Download **diblokir** sampai user memilih rating (`handleDownloadClick` → redirect ke `/review`). | Kebijakan Google Maps melarang review yang "diberi insentif" dan *review gating*. Mengunci softfile di balik review bisa dianggap insentif → ulasan rawan dihapus massal / profil kena penalti. |
| R2 | Rating default sudah di **KEREN! (index 4)**. | Bias, terasa manipulatif. |
| R3 | Teks ulasan otomatis disalin ke clipboard tanpa diminta, template bintang 5 memuat emoji ⭐. | Menimpa clipboard user, teks seragam = pola "fake review" di mata Google, emoji melanggar design rule claim page. |
| R4 | Auto-redirect berbasis `visibilitychange`/`focus`/`pageshow` + flag di **localStorage**. Flag tidak pernah benar-benar bersih jika user tidak kembali; membuka `/review` lagi langsung terlempar. Pindah tab sebentar sebelum selesai menulis ulasan juga memicu redirect. | Alur rapuh, user bingung "kok balik sendiri". |
| R5 | **Tidak ada langkah follow Instagram sama sekali.** Key `sebooth_redirected_instagram_*` dibaca tapi tidak pernah di-set (sisa Phase 8F). | Fitur yang diminta belum ada. |
| R6 | Handle Instagram di kode: `@sebooth.id` (artikel, schema JSON-LD, AGENTS.md). Permintaan: `@sebooth.in`. | Perlu konfirmasi, lihat Keputusan #1. |

### Guide / panduan
| # | Temuan |
|---|---|
| G1 | Tour hanya ada di 2 page: `/access/[id]` (5 langkah) dan `/profile`. Page lain tanpa panduan: `/access/[id]/review`, `/queue/[eventId]`, `/queue/.../ticket/...`, `/frames`, homepage deck, `/login?claim=`, `/register?claim=`. |
| G2 | `InteractiveTour.tsx` statis: spotlight lompat (tidak dianimasikan antar target), visual gesture disembunyikan di HP untuk target besar (`InteractiveTour.tsx:231`), tidak ada langkah "lakukan aksinya untuk lanjut". |
| G3 | Badge "Fase 1: …" di tiap langkah = eyebrow label (melanggar house rule). |
| G4 | Komponen guide terpecah 4: `InteractiveTour`, `PhotoDirectGestureGuide`, `DesktopGuideModal`, `GestureVisualizer`, plus `MobileGestureTutorial` yang **tidak dipakai di mana pun** (dead code). |
| G5 | Tidak ada `prefers-reduced-motion` di komponen guide (hanya di `globals.css`). |

---

## 2. Arah desain

**Ide:** pengalaman di booth Sebooth adalah *strip foto yang keluar dari mesin*. Funnel setelah unduh dan seluruh guide memakai metafora itu: tiap langkah adalah satu "frame" di strip vertikal yang meluncur ke atas, seperti cetakan keluar dari slot printer. Satu bahasa gerak untuk semua page, tetap tenang (editorial) di claim page dan tegas (brutalism) di profile/queue.

Aturan gerak (semua via `framer-motion`, sudah ada di deps, **tanpa dependency baru**):
- Hanya `transform` + `opacity`. Spring `{ stiffness: 380, damping: 32 }` untuk spotlight, 180–240 ms untuk feedback tombol, exit lebih cepat dari enter.
- Maksimal 2 elemen bergerak per langkah (spotlight + glyph gesture).
- `useReducedMotion()` → semua travel dimatikan, diganti fade 120 ms + panah statis. Konten tidak pernah tersembunyi kalau JS/animasi gagal.

---

## 3. Fase A: Claim page + funnel Review → Instagram

### A1. Unduh dulu, minta belakangan (rekomendasi, lihat Keputusan #2)
Alur baru, **tetap di `/access/[id]`** (patuh Zero Redirect rule, tidak lagi pindah route):

```
Tap "Download All Photo"
  └─ Unduh langsung mulai (bundle progress)
       └─ Bottom sheet "PrintStrip" naik dari bawah, selama & sesudah unduh:
            Frame 1  Rating 1–5 (roulette arc yang sudah ada, TANPA preselect)
            Frame 2  Tulis ulasan di Google   [Buka Google Review]   [Nanti saja]
            Frame 3  Follow @sebooth.in        [Buka Instagram]       [Nanti saja]
            Frame 4  Selesai: ringkasan file terunduh + tombol unduh ulang
```

Alasan: waktu tunggu bundling (beberapa detik sampai puluhan detik untuk video) dipakai sebagai momen meminta, user sedang senang melihat fotonya muncul, dan tidak ada yang diblokir sehingga aman dari kebijakan Google.

Detail:
- **Sheet komponen baru** `src/components/features/AfterDownloadStrip.tsx`: state machine `idle → rating → google → instagram → done`, tiap frame bisa di-skip dan bisa kembali. Progress unduhan tampil sebagai garis tipis di tepi atas sheet (bukan angka saja).
- **Rating**: ekstrak roulette jadi `ExperienceDial.tsx` (presentational) dari `ExperienceGaugeReview.tsx`. Mulai dari posisi netral (jarum di tengah, belum ada mood terpilih, tombol lanjut disabled sampai user memutar/tap).
- **Google Review**:
  - Semua rating (1–5) mendapat tombol Google yang sama besarnya (tidak ada gating rating rendah).
  - Ganti auto-copy dengan **chip topik opsional** ("Frame-nya", "Hasil cetak", "Staf", "Antrean", "Softfile cepat"). Tap chip menyusun draf kalimat di textarea yang bisa diedit; tombol "Salin & buka Google" menyalin **hanya jika user menekannya**. Tanpa emoji.
  - Rating 1–2 tambahan opsi "Kirim masukan langsung ke tim" (disimpan, lihat Keputusan #4) **di samping**, bukan menggantikan, tombol Google.
- **Instagram**:
  - Kartu profil: avatar/logo, handle, 3 thumbnail post terbaru (sudah ada `fetchInstagramPosts()` di `src/lib/serverSupabase.ts:106`), teks "Lihat hasil foto event lain & promo booth".
  - Tombol buka: di HP coba `instagram://user?username=<handle>` lalu fallback `https://instagram.com/<handle>` setelah 600 ms bila halaman masih visible; di desktop langsung URL web, tab baru.
  - Handle diambil dari satu konstanta `src/config/social.ts` (`INSTAGRAM_HANDLE`, `GOOGLE_REVIEW_URL`) agar tidak tersebar lagi di 5 file.
- **Kembali dari Google/IG**: hapus total logika auto-redirect R4. Saat `visibilitychange → visible`, sheet hanya maju ke frame berikutnya dengan micro-confirm "Sudah? Lanjut" (tidak menebak, tidak redirect).
- **Persistensi**: satu key `sebooth_funnel_<sessionId>` di localStorage: `{ rating, googleOpenedAt, igOpenedAt, dismissedAt }`. Sheet tidak muncul otomatis lagi bila sudah `done`/dismissed; tetap bisa dibuka dari kartu kecil di bawah galeri.
- **Route `/access/[id]/review`**: dipertahankan sebagai deep link (mis. dari QR terpisah / WhatsApp) yang merender sheet yang sama dalam mode halaman penuh. Tidak ada redirect paksa.
- **Event analytics** (untuk tab Analytics admin): `funnel_rating_set`, `funnel_google_opened`, `funnel_ig_opened`, `funnel_skipped:<frame>`. Lokasi simpan mengikuti Keputusan #4.

### A2. Perapian claim page
| Perubahan | Detail |
|---|---|
| Banner retensi → **status strip** ringkas | Satu baris: status ("Tersimpan sementara · sisa 2h 14j") + satu tombol "Simpan permanen". Penjelasan panjang pindah ke disclosure "Kenapa?" (animasi height via `layout`). Tiga varian banner dilebur jadi satu komponen `ClaimStatusStrip.tsx` dengan prop `variant`. Galeri naik ke lipatan pertama di 390 px. |
| Hero | Hapus eyebrow "KOLEKSI SOFTFILE". `h1` tetap satu, ukuran turun (2xl/3xl), metadata event satu baris. |
| Galeri | Entrance stagger 60 ms per kartu (sekali, saat masuk viewport); skeleton dengan rasio tetap untuk cegah CLS; badge tipe tetap. |
| Lightbox | Swipe kiri/kanan antar media + tombol prev/next + `Esc`; unduh satuan di dalam lightbox. |
| Tombol unduh (ClayPillButton) | Tiga state jelas: idle → progress (cincin progres di ikon + "3/8") → selesai (centang, label "Tersimpan"). |
| Toast | `role="status" aria-live="polite"`, bisa ditutup, posisi tidak menutupi header. |
| Kartu "Setelah unduh" persisten | Di bawah galeri: dua baris aksi Google Review & Instagram untuk user yang men-skip sheet. Tenang, tanpa ikon berwarna-warni. |

### A3. Kriteria selesai Fase A
- Unduh tidak pernah menunggu rating/review/follow (uji: tap unduh → file mulai turun < 1 s).
- Tidak ada `window.location.href` / `router.push` otomatis keluar dari `/access/[id]` (grep).
- Clipboard hanya ditulis setelah tap eksplisit.
- Instagram terbuka di app (Android/iOS) atau web (desktop) dan user kembali ke frame berikutnya, bukan halaman lain.
- `npx tsc --noEmit` 0 error, `npm run build` bersih, cek browser di 390/768/1440 + reduced motion.

---

## 4. Fase B: Guide v2 (interaktif + motion) di setiap page

### B1. Satu engine, satu config
```
src/components/guide/
  GuideProvider.tsx      context + state (active page, step, seen flags)
  GuideSpotlight.tsx     mask SVG; rect spotlight di-animate antar target (spring), bukan lompat
  GuideCard.tsx          kartu langkah: judul, 1–2 kalimat, progress bar tipis, Kembali / Lewati / Lanjut
  GuideGesture.tsx       glyph jari SVG beranimasi: tap, hold (cincin terisi), swipe-x, swipe-y, pinch, drag-dial
  GuideHintPulse.tsx     cincin denyut kecil di 1 elemen untuk user yang sudah pernah lihat tour
  useGuide.ts            useGuide('access') → { start, isOpen }
src/config/guides.ts     daftar langkah per page (data, bukan JSX)
```
Langkah dapat bertipe:
- `advanceOn: 'next'` (tombol Lanjut),
- `advanceOn: 'click'` (user harus benar-benar mengetuk target, target tetap bisa diklik di dalam spotlight),
- `advanceOn: 'scroll' | 'swipe'` (lanjut setelah user menggeser),
- `advanceOn: 'event:<name>'` (mis. `dial:changed` dari roulette).
Ini yang membuat guide *interaktif*: user belajar dengan melakukan, bukan membaca.

Tema: `variant: 'editorial'` (claim, review: kartu putih, sudut 16, tanpa bayangan berat) dan `variant: 'brutal'` (profile, queue: `hard-shadow-black`, border tebal). Tanpa badge "Fase N", tanpa emoji; urutan ditunjukkan progress bar.

Perilaku:
- Auto-mulai sekali per page per versi (`guide_seen_<page>_v2`), selalu ada tombol `?` untuk membuka ulang.
- Returning user: bukan tour penuh, cukup `GuideHintPulse` di satu fitur baru.
- Lewati / Kembali / `Esc` / panah keyboard / swipe pada kartu. Fokus terkunci di kartu, kembali ke tombol `?` saat tutup. `aria-live` untuk judul langkah.
- Target hilang (mis. banner tidak tampil untuk user yang sudah klaim) → langkah otomatis dilewati, bukan spotlight kosong.
- Reduced motion: spotlight muncul tanpa travel, glyph gesture diganti ikon statis + teks.

### B2. Cakupan per page
| Page | Langkah (ringkas) | Gesture |
|---|---|---|
| `/access/[id]` | Status penyimpanan → ketuk foto untuk lihat penuh (`click`) → geser di lightbox (`swipe`) → Download All → Bagikan | tap, swipe-x |
| `/access/[id]` sheet / `/review` | Putar dial (`event:dial:changed`) → chip ulasan → buka Google → follow IG | drag-dial, tap |
| `/profile` | Migrasi tour lama + `PhotoDirectGestureGuide` ke engine baru (langkah sama, tampilan v2) | swipe-y, pinch, hold |
| `/queue/[eventId]` | Isi nama → ambil nomor → izinkan notifikasi (jelaskan kenapa sebelum prompt browser) | tap |
| `/queue/.../ticket/...` | Arti 4 tier jarak → kapan harus kembali ke booth → tombol check-in / scan QR | tap |
| `/frames` | Filter kategori → buka frame → editor: geser/zoom foto di frame | swipe-x, pinch, drag |
| `/` (deck) | Bukan tour: satu cue animasi "geser / scroll untuk slide berikutnya" di slide 1, hilang setelah gesture pertama | swipe-y |
| `/login?claim=` & `/register?claim=` | Satu kartu konteks: "Masuk untuk menyimpan sesi <event> selamanya", tanpa spotlight | none |

### B3. Bersih-bersih
- Hapus `MobileGestureTutorial.tsx` (tidak dipakai).
- `GestureVisualizer.tsx` dan `DesktopGuideModal.tsx` digantikan `GuideGesture` + mode desktop di `GuideCard` (daftar shortcut keyboard jadi langkah terakhir di desktop).
- `InteractiveTour.tsx` dihapus setelah `/access` dan `/profile` pindah ke engine baru.

### B4. Kriteria selesai Fase B
- Setiap page di tabel B2 punya guide atau cue yang bisa dibuka ulang.
- Spotlight bergerak mulus antar target (tanpa lompat), 60 fps di HP kelas menengah (cek Performance panel, tidak ada layout thrash: hanya transform).
- Semua langkah bisa dilewati; keyboard penuh; reduced motion lolos.
- Tidak ada emoji / eyebrow badge (grep + `lint.mjs` dari `design-taste-frontend`).

---

## 5. Urutan kerja (irisan kecil, tiap irisan bisa dites)

1. `src/config/social.ts` + ganti semua handle/URL hard-coded ke konstanta.
2. Ekstrak `ExperienceDial` dari `ExperienceGaugeReview` (tanpa ubah perilaku), lalu hapus preselect.
3. `AfterDownloadStrip` (rating → Google → IG → done) di `/access/[id]`; lepas gate di `handleDownloadClick`; hapus auto-redirect R4.
4. `ClaimStatusStrip`, hero, toast, tombol unduh 3-state, lightbox swipe.
5. Engine guide `src/components/guide/*` + `guides.ts`, pasang di `/access/[id]` dulu.
6. Migrasi `/profile`, lalu queue, ticket, frames, review, cue homepage, login/register.
7. Hapus komponen guide lama + dead code.
8. Verifikasi: `npx tsc --noEmit`, `npm run build`, browser preview 390/768/1440, reduced motion, alur unduh nyata di Android Chrome & iOS Safari.
9. Update `AGENTS.md` milestone (1 baris) + `_harness/routing.md` (folder `guide/`, `social.ts`).

Perkiraan: Fase A 2–3 sesi kerja, Fase B 3–4 sesi kerja.

---

## 6. Keputusan yang dibutuhkan

1. **Handle Instagram**: kode & schema SEO pakai `@sebooth.id`, permintaan menyebut `@sebooth.in`. Yang benar yang mana? (Kalau `.in`, schema `LocalBusinessSchema.tsx` dan halaman artikel ikut diganti.)
2. **Gate unduh**: rekomendasi = unduh langsung, minta review/follow lewat sheet (aman kebijakan Google). Alternatif = tetap wajib pilih rating dulu sebelum unduh (konversi review mungkin lebih tinggi, tapi berisiko ulasan dihapus Google).
3. **Google Place ID** `ChIJMw7u0BePcC4RfJlnOavYI6k`: masih profil bisnis yang benar untuk sebooth.in?
4. **Masukan privat rating rendah & event funnel**: simpan ke tabel Supabase baru (`session_feedback`, perlu migrasi) atau cukup localStorage + tanpa analytics dulu?
