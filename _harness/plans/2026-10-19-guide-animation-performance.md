# Plan: Guide animation ringan di HP (claim page `/access/[id]`)

Tanggal: 2026-10-19 · Status: F1–F5 SELESAI (lihat §7). Belum diuji di HP asli.
Batasan: semua animasi guide tetap ada (spotlight glide, finger gesture, ripple, pulse ring). Yang diganti hanya *cara* animasinya dijalankan. Tanpa dependency baru.

---

## 1. Kenapa patah-patah (hasil audit kode)

| # | Penyebab | Lokasi | Dampak di HP |
|---|---|---|---|
| P1 | Loop `requestAnimationFrame` memanggil `getBoundingClientRect()` lalu `setBox()` **tiap frame** selama ada scroll/layout shift. Tiap `setBox` = render ulang seluruh `Guide` dan semua spring Framer di-*retarget* (hole, ring, gesture, card). Saat `scrollIntoView({behavior:'smooth'})` jalan, ini terjadi ~60x/detik. | `Guide.tsx:134-159`, `:116` | Paling berat. Main thread penuh, spotlight "mengejar" target dan tersendat. |
| P2 | Spotlight memakai **SVG `<mask>` layar penuh** yang `x/y/width/height`-nya dianimasikan. Setiap frame, browser me-*rasterize* ulang mask selebar layar di CPU (SVG mask tidak di-composite di GPU). | `Guide.tsx:245-279` | Paint layar penuh per frame. |
| P3 | Loop gesture tak berujung (`repeat: Infinity`) di Framer Motion memakai transform terpisah (`scale`, `x`, `y`, `rotate`). Jenis ini dijalankan JS di main thread, bukan compositor. Saat main thread sibuk decode foto/video, loop ikut tersendat. | `GuideGesture.tsx:31-39, 51-69` | Jari "patah" walaupun spotlight diam. |
| P4 | `drop-shadow` (CSS filter) dipasang di elemen yang terus bergerak. Filter dihitung ulang tiap frame. | `GuideGesture.tsx:68` | Paint mahal tiap frame. |
| P5 | Pulse ring langkah "ketuk untuk lanjut" adalah `<rect>` SVG yang di-scale. Elemen SVG tidak punya layer sendiri, jadi ikut memicu repaint SVG penuh (P2). | `Guide.tsx:264-278` | Repaint terus-menerus selama langkah klik. |
| P6 | Halaman di belakang overlay berat untuk GPU: tiap kartu galeri punya **2 `backdrop-blur`** (badge + tombol unduh), header sticky juga `backdrop-blur-md`, dan semua video di grid `autoPlay`. Overlay redup di atasnya memaksa blur di-*recompose* setiap kali overlay berubah. | `AccessSessionClient.tsx:434, 553-560, 580, 588` | 10 media = 20+ area blur + beberapa video decode bersamaan. |
| P7 | Guide auto-start pakai `setTimeout(1400)`, sering bertabrakan dengan gambar/video yang baru mulai decode. | `useGuide.ts:11-14` | Animasi masuk pertama yang paling sering terasa lag. |

Catatan: Lenis sudah dimatikan di `/access` (`SmoothScrollProvider.tsx`), jadi bukan penyebab.

---

## 2. Perbaikan (urut dampak terbesar dulu)

### F1. Tracking target tanpa render React (atasi P1)
- Ganti state `box` dengan 4 `useMotionValue` (`x, y, w, h`). Loop pelacak menulis langsung ke motion value. **Nol render React per frame.**
- Spring hanya dipakai saat **ganti langkah** (`animate(mv, target, spring)`). Saat scroll/layout shift, nilai di-`set()` langsung supaya spotlight menempel, tidak mengejar.
- Pelacak tidak lagi rAF abadi: jalan dari event `scroll` (passive, capture), `resize`, dan `ResizeObserver` pada target. Tiap event menjadwalkan **satu** rAF. Kalau tidak ada yang bergerak, CPU idle.
- `setState` hanya untuk hal yang benar-benar mengubah markup: target ketemu/hilang, dan di HP "kartu di atas atau di bawah" (dihitung ulang hanya kalau sisinya berubah).
- Blockers (4 div pemblokir klik) ikut membaca motion value lewat `style`, bukan props hasil render.

### F2. Spotlight jadi satu div composited (atasi P2, P5)
- Hapus SVG mask. Pakai satu `motion.div` `fixed`, posisi via `transform: translate3d`, `border-radius` sesuai varian, dan peredup lewat `box-shadow: 0 0 0 200vmax rgba(15,23,42,.6)` (brutal: `rgba(10,10,10,.68)`).
- Garis tepi putih/hitam = `outline`/`border` di div yang sama.
- Perpindahan posisi = composite saja (murah). Perubahan ukuran hanya repaint selama ~300 ms transisi antar langkah, bukan terus-menerus.
- Pulse ring = div terpisah di dalam spotlight, dianimasikan CSS `@keyframes` (`transform: scale` + `opacity`), punya layer sendiri.
- Tanpa target (kartu di tengah): div yang sama dengan ukuran 0 di tengah layar, jadi transisi masuk/keluar tetap mulus.

### F3. Loop gesture pindah ke CSS keyframes (atasi P3, P4)
- `FINGER_MOTION` dan ripple ditulis ulang sebagai `@keyframes` di `globals.css` (`guide-tap`, `guide-hold`, `guide-swipe-x`, `guide-swipe-y`, `guide-scroll`, `guide-pinch`, `guide-dial`, `guide-ripple`, `guide-ripple-hold`). Durasi, `times`, `repeatDelay` dipetakan ke persentase keyframe, jadi gerakannya tetap sama.
- Hanya `transform` + `opacity`, plus `will-change: transform`. Browser menjalankannya di compositor thread, tetap mulus walau main thread sibuk.
- `drop-shadow` dihapus dari elemen bergerak, diganti bayangan statis di dalam SVG jari (salinan path digeser 2-3 px dengan opacity rendah, tanpa blur). Tampilan nyaris sama, tanpa filter per frame.
- `prefers-reduced-motion`: `@media` mematikan keyframes, jari statis + ring tetap tampil (perilaku sekarang).
- Framer Motion tetap dipakai untuk animasi sekali jalan (kartu masuk, ganti teks, progress bar). Wrapper glyph mengikuti spotlight lewat motion value yang sama dari F1.

### F4. Halaman di belakang lebih ringan (atasi P6)
- Badge tipe media dan tombol unduh di kartu galeri: hapus `backdrop-blur-*`, pakai warna solid (`bg-black/60`, `bg-black/50`). Secara visual hampir sama di atas foto.
- Header sticky: `bg-[#FAF8F5]/95` tanpa blur (atau blur hanya di `sm:` ke atas).
- Video di grid: `autoPlay` hanya saat terlihat (IntersectionObserver, play/pause), `preload="metadata"`. Saat guide terbuka, video grid di-pause, dilanjutkan saat guide tutup.
- `transition-all` di kartu dan tombol diganti `transition-[box-shadow,transform]`.

### F5. Waktu mulai yang tidak bentrok (atasi P7)
- `useGuide`: setelah `delay`, buka lewat `requestIdleCallback` (fallback `setTimeout`), dengan `timeout` 1500 ms supaya tetap pasti muncul.
- Di claim page, `enabled` juga menunggu gambar media pertama `onLoad` (atau 2 detik, mana yang duluan).

---

## 3. File yang disentuh
- `src/components/guide/Guide.tsx` (F1, F2), mesin bersama, jadi profile, queue, ticket, frames ikut lebih ringan.
- `src/components/guide/GuideGesture.tsx` (F3)
- `src/app/globals.css` (keyframes F2, F3)
- `src/components/guide/useGuide.ts` (F5)
- `src/components/features/AccessSessionClient.tsx` (F4, F5)

API `Guide` / `GuideStep` / `src/config/guides.ts` **tidak berubah**. `GUIDE_KEYS` tidak perlu di-bump karena langkahnya sama.

## 4. Urutan kerja
1. Ukur baseline (lihat §5) di `/access/[id]` dengan sesi berisi ≥ 8 media termasuk video.
2. F1 + F2 (satu commit, karena saling bergantung). Cek varian `editorial` dan `brutal`, langkah `advanceOn: 'click'`, tombol Kembali, Esc, target yang hilang (di-skip).
3. F3. Bandingkan gerakan jari berdampingan dengan versi lama.
4. F4 + F5.
5. Ukur ulang, catat angka sebelum/sesudah di file ini.

## 5. Cara membuktikan
- Chrome DevTools > Performance, mode mobile + **CPU 4x slowdown**, rekam dari guide muncul sampai langkah 3.
  - Target: tidak ada long task > 50 ms selama guide; frame rate ≥ 55 fps saat spotlight pindah langkah.
  - Rendering > **Paint flashing**: saat gesture loop jalan dan tidak ada yang discroll, tidak boleh ada kilatan hijau layar penuh (sekarang ada, karena P2/P3/P4).
  - Rendering > **Frame rendering stats** untuk angka fps.
- HP Android kelas menengah asli via `chrome://inspect` (remote debugging), ulangi rekaman yang sama.
- Cek iOS Safari: `box-shadow` spread besar dan `@keyframes` transform aman di Safari 15+.

## 6. Risiko
- `box-shadow` 200vmax pada div yang ukurannya berubah: repaint selama transisi langkah saja. Kalau masih berat di HP sangat murah, opsi cadangan: 4 div peredup (sudah ada sebagai blockers) yang diberi warna, sudut hole jadi kotak.
- Spotlight langsung menempel saat scroll (tanpa spring). Ini disengaja: terasa lebih "nempel" dan tidak lag. Spring tetap ada saat pindah langkah.

---

## 7. Hasil pengukuran

Cara ukur: dev server, viewport 375x812, sesi `77dedef8-…` (9 media), skrip benchmark di console (rAF frame delta, `requestIdleCallback` untuk % main thread sibuk, `MutationObserver` untuk tulisan DOM/detik, `PerformanceObserver('longtask')`). Langkah yang diukur: "Lihat foto ukuran penuh" (gesture tap + pulse ring).

Catatan: di CPU laptop semua skenario sudah 60 fps, jadi fps tidak membedakan. Angka yang relevan untuk HP adalah beban main thread, karena itu yang habis duluan di CPU HP (4-6x lebih lambat).

| Skenario | Metrik | Baseline | F1 + F2 |
|---|---|---|---|
| Scroll halaman saat guide terbuka | main thread sibuk | 28% | **13%** |
| | tulisan DOM / detik | 646 | **214** |
| Langkah gesture diam | main thread sibuk | 13% | 12% |
| | tulisan DOM / detik | 242 | **122** |
| Pindah langkah (klik target) | main thread sibuk | 16% | 18% |
| Halaman tanpa guide (pembanding) | main thread sibuk | 10% | 11% |

- Scroll dengan guide terbuka sekarang hampir setara halaman tanpa guide (13% vs 11%).
- Sisa 122 tulisan/detik di langkah gesture berasal dari loop jari Framer (`GuideGesture`), target F3.
- Paint layar penuh dari SVG mask hilang (spotlight sekarang satu div composited). Ini tidak terlihat di metrik JS; konfirmasi dengan Paint flashing di DevTools/HP asli.
- Dicek manual: varian editorial dan brutal, langkah klik tembus lubang, Kembali, Esc, target hilang di-skip, kartu dock atas/bawah di HP, kartu di bawah target di desktop (`/frames`). Tidak ada error console.

### Setelah F3 (gesture ke CSS keyframes, tanpa drop-shadow)

| Skenario | Metrik | Baseline | F1 + F2 | F1 + F2 + F3 |
|---|---|---|---|---|
| Langkah gesture diam | tulisan DOM / detik | 242 | 122 | **0** |
| | main thread sibuk | 13% | 12% | 12% (= halaman tanpa guide) |
| Lightbox + gesture swipe | tulisan DOM / detik | 36 | 36 | **0** |
| Scroll saat guide terbuka | tulisan DOM / detik | 646 | 214 | **104** |
| | main thread sibuk | 28% | 13% | 18% |

- Semua loop (7 gesture, ripple tap/hold/pinch, pulse ring) sekarang `CSSAnimation`, dicek via `document.getAnimations()`. `filter` pada jari = `none`.
- % sibuk saat scroll berfluktuasi 13-18% antar-run di dev mode (noise rIC); tulisan DOM turun konsisten.
- `GuideGesture` juga dipakai cue swipe homepage (`SlideDeckLanding.tsx`) dan dial rating (`ExperienceDial.tsx`); keduanya ikut ringan, API tidak berubah.

### Setelah F4 + F5 (semua perbaikan)

| Skenario | Metrik | Baseline | F1–F3 | F1–F5 |
|---|---|---|---|---|
| Langkah gesture diam | main thread sibuk | 13% | 12% | **9%** |
| | tulisan DOM / detik | 242 | 0 | 0 |
| Scroll saat guide terbuka | main thread sibuk | 28% | 18% | **14%** |
| | tulisan DOM / detik | 646 | 104 | **101** |
| Pindah langkah | main thread sibuk | 16% | 15% | **12%** |
| Halaman tanpa guide | main thread sibuk | 10% | 12% | **9%** |

- Elemen dengan `backdrop-filter` di claim page (HP): **0** (sebelumnya 2 per kartu galeri + header). Header tetap blur di `sm:` ke atas.
- Video grid: `preload="metadata"`, play hanya saat dekat viewport (IntersectionObserver, margin 120px), dijeda selama guide terbuka, jalan lagi setelah guide ditutup (dicek: `paused` true → false).
- Waktu mulai guide: menunggu thumbnail pertama `onLoad` (fallback 1,5 s), lalu `delay: 900` ms, lalu `requestIdleCallback` (timeout 1,5 s). Terukur: guide muncul 1,9 s setelah galeri tampil (sebelumnya tetap 1,4 s tanpa peduli gambar).
- Perubahan: `GridVideo` (komponen kecil di `AccessSessionClient.tsx`), `useGuide.ts` (idle start, berlaku untuk semua page).
