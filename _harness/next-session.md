# Next Session Harness — Sebooth Website (lanjutan audit 2026-11-01, bagian 2)

> Copy semua isi di bawah garis ini ke sesi baru.

---

Lanjutin perbaikan website Sebooth (repo ini). Baca dulu `AGENTS.md`, `_harness/rules.md`, `_harness/routing.md` dan `DESIGN.md` sebelum ngubah kode. Pakai skill `/caveman`, `/ponytail`, `/ponytail-review` (review diff sebelum commit), `/ui-ux-pro-max`, `/design-taste-frontend`, `/stop-slop` (untuk laporan).

## Status sekarang

**Sudah di-commit (belum di-push):** `ae2cdda refactor(brand): unify orange/navy hex into theme tokens` = tugas 1 selesai.
- Token baru di `src/app/globals.css`: `--color-orange-press` (#e63e00, hover/pressed) dan `--color-navy-raised` (#0239a0, chip di atas latar navy). `--c-*` dihapus (gak dipakai).
- Sengaja dibiarkan: `ClayPillButton` violet, `SeboothLoader` `#fe6b00` (raster logo tercetak warna itu), biru tema kartu di `FramesSlider`.

**Selesai tapi BELUM di-commit** (working tree, satu tugas = satu commit, tanya user dulu):
- **Tugas 2**: `src/components/sections/AboutContent.tsx`, `PartnershipContent.tsx`. Hero cuma geser `y: 30`, tanpa `opacity: 0`, dan `initial={reduceMotion ? false : ...}` via `useReducedMotion`. Diukur di browser: H1 opacity 1 sejak paint pertama di dua halaman. tsc dan eslint bersih.
- **Tugas 3**: `playwright.config.ts`, `e2e/smoke.spec.ts`, `e2e/download-all.spec.ts`, script `test:e2e` + `@playwright/test` di `package.json`, `.gitignore` (test-results, playwright-report), `package-lock.json`. Hasil: 9 lolos, 1 skip (Download All butuh `E2E_SESSION_ID`, minta user satu ID sesi asli). Catatan: `/access/<id-gak-ada>` balas **200**, bukan 404, karena `app/loading.tsx` mulai stream sebelum `notFound()` jalan (soft 404). Test cek isi halaman, bukan status. Perubahan `package-lock.json` yang hapus `"@img/sharp-linux-x64": "*"` aman: paket itu tetap ada di `optionalDependencies`.
- **Tugas 4, bagian profile** (belum diverifikasi di browser): `src/app/profile/page.tsx` 1.821 → ~1.300 baris. Komponen baru di `src/components/profile/`: `profileMedia.ts` (tipe + helper URL), `ClaimSessionModal.tsx` (dua salinan modal klaim digabung, prop `showQueueLink`), `ProfileEmptyState.tsx`, `BookshelfView.tsx`, `SessionOptionsModal.tsx`, `ProfileDock.tsx`. Modal "Pilih Sesi Foto" (grid) dihapus karena gak punya pembuka di mana pun. tsc lolos. ESLint: error di page turun 7→6, satu `any` pindah ke `profileMedia.ts`. `GalleryGrid.tsx` dan `SessionFeedCard.tsx` di folder yang sama adalah file lama, bukan buatan sesi ini.

## Tugas tersisa, kerjain berurutan

### 4a. Verifikasi pecahan profile (wajib sebelum commit)
Bandingkan DOM sebelum/sesudah: `git stash` file profile, ambil snapshot, `git stash pop`, ambil snapshot lagi, hash harus sama. Halaman: `/profile?preview=1` (dev only, tanpa login; menampilkan 28 sesi user preview). Set `localStorage.guide_seen_profile_v4 = 'true'` dulu. Urutan: fokus → klik `[title="Opsi Sesi"]` → tutup `#tour-profile-options-close` → `#bottom-nav-bookshelf-btn` (gallery). Normalisasi: buang `nextjs-portal`, `script`, atribut `src/srcset/class` di `img/video/source`, dan untuk gallery buang semua atribut `style` (animasi). Setelah stash/pop, browser bisa nyimpan chunk lama: buka tab baru dan fetch chunk dengan `cache: 'reload'` kalau ada hydration mismatch aneh.

### 4b. Pecah `src/components/sections/PricingSlider.tsx` (~1.170 baris)
Batas bersih yang sudah dipetakan:
- Data (`PackageType`, `DetailedPackage`, `DETAILED_PACKAGES`, `waBase`, baris ~31–176) → `sections/pricing/pricingPackages.ts`.
- Stage desktop (`<div className="hidden md:flex ...">`, ~396–822) → `DesktopPricingStage.tsx`. Props: `selectedPackage, isAllYouCan, isBatch, selectedTierId, setSelectedTierId, setTicketPkg, handleSelectPackage, handleBackToOverview`.
- Stage mobile (`<div className="flex md:hidden ...">`, ~827–1141) → `MobilePricingStage.tsx`. Props sama + `activeSlide, setActiveSlide`.
- Satu-satunya importer: `SlideItem.tsx` (dynamic import `mod.PricingSlider`), tipe gak di-import dari luar.
Verifikasi dengan cara yang sama (hash `#pricing` outerHTML, buang `style` dan `src`): mobile 375px (overview, `[aria-label="Next Package Card"]`, tombol "ALL YOU CAN", "BATCH BOOKING") dan desktop 1280px.

### 4c. Pecah `src/components/admin/SessionLookupTab.tsx` (~1.130 baris)
Belum dimulai. Admin punya `?preview=1` di dev. Cek dengan hash DOM yang sama.

### 5. Beresin root folder
Belum dimulai. Kandidat: `build_output.txt`, `ui_showcase.html`, `main background.png`, `tes.py`, `IMPLEMENTATION_COMPLETE.md`, `DELIVERABLES.md`, `QUICK_REFERENCE.md`, `CLICK_TO_EDIT_IMPLEMENTATION.md`, `feature_documentation.md`, `implementation_plan.md`, `scalability_assessment.md`. **Baca isinya, kasih daftar ke user, hapus cuma yang disetujui.** Cek data sensitif di file yang ke-commit.

## Kendala yang ditemui sesi sebelumnya
- **Supabase project sempat ke-pause.** Akibatnya `/profile?preview=1` macet di loader. Pastikan project aktif sebelum verifikasi.
- `/api/image` ke GCS sering timeout 8 detik per gambar. Dev server dan 6 koneksi browser per host jadi penuh, halaman profile bisa butuh ~3 menit sampai tampil. Tool JS browser timeout di 45 detik, jadi tunggu dalam beberapa panggilan pendek.
- Navigasi slide homepage di browser pane gak stabil: klik dot `[aria-label^="Pindah ke Slide 06"]` kadang perlu diulang beberapa kali (jeda 3 detik). Di desktop 1280px, klik link "PRICING" dan dot gak memindah slide, belum ketemu cara. Coba tombol "Scroll ke slide berikutnya" atau wheel.
- Dev server lain di folder ini pegang lock `.next` (port 3000). Gak bisa `next build` selama dev server jalan. Matikan dulu (`Get-NetTCPConnection -LocalPort 3000` → kill parent `next dev`).

## Butuh akses user (jangan dikerjain tanpa izin)
- **RLS tabel `admins`**: tambah/hapus admin jalan dari browser (`src/app/admin/page.tsx`, `addAdmin`/`removeAdmin`). Pastikan cuma super admin yang bisa insert/delete.
- **RLS tabel `sessions`/`media`** (belum dicek): `?preview=1` bisa baca sesi user hardcoded `e42f79ce-...` pakai anon key di browser. Pastikan anon gak bisa baca sesi orang lain di production.
- **Rate limiter** `src/lib/apiSecurity.ts` masih in-memory, butuh Upstash Redis.
- **Monitoring** (Sentry) dan **analytics** (Vercel Analytics) butuh akun.

## Aturan kerja
- User mayoritas pakai HP: verifikasi **mobile dulu** (375px). Suka gaya modern minimal.
- Prefix command shell pakai `rtk`.
- Dev server: `.claude/launch.json` config `sebooth-dev` (port 3000).
- Wajib lulus sebelum commit: `npx tsc --noEmit`, `npx eslint <file yang diubah>` (bandingkan jumlah error dengan HEAD; error lama gak usah dibenerin), `npx next build` exit 0, dan `npm run test:e2e`.
- Jangan pakai emoji di UI, jangan warna violet/indigo baru. Warna lewat token (`primary`, `secondary`, `blue-dark`, `orange-press`, `navy-raised`), bukan hex lepas.
- Laporan akhir: apa yang berubah, apa yang dites dan hasilnya, apa yang belum.
