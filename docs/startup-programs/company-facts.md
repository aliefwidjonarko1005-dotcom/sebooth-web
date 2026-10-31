# Sebooth: fakta perusahaan + jawaban dasar (bahasa Inggris, siap copy-paste)

Diambil dari isi repo (`AGENTS.md`, `_harness/`, `src/`). Bagian bertanda **[ISI SENDIRI]** tidak ada di repo dan harus lu isi dengan angka asli. Jangan dikarang.

## Fakta dari repo
- Nama: Sebooth Photobooth, website https://sebooth.in, Instagram @sebooth.id
- Lokasi: Jl. Prof. Soedarto, Tembalang, Semarang, Jawa Tengah, Indonesia
- Produk fisik: Mini Studio Photobooth, Studio Lighting & Backdrop, Vending Machine Photobooth, Self-Service Kiosk. Paket sewa event "Unlimited 2/3/5 Jam" dan paket per jumlah print (100/200/300+ prints).
- Platform digital (dibangun sendiri):
  - Klaim softfile via QR: setiap sesi di mesin menghasilkan QR ke `sebooth.in/access/[id]` untuk lihat dan unduh foto, strip, GIF, dan live video
  - **3.460+ sesi** tercatat di database (Supabase), media di Google Cloud Storage
  - Sistem antrean digital per event dengan Web Push notification, tampilan TV, dan panel operator
  - Profil pengguna dengan galeri "My Photos"
  - Funnel review setelah download (rating → Google Review → follow Instagram)
  - Admin CMS: session inspector, analytics, CMS frame dan berita
  - 54 artikel SEO (Semarang, Tembalang, Undip, wedding, konser, dll.)
- Stack: Next.js 16, React 19, Supabase, Google Cloud Storage, Web Push
- AI saat ini: **belum ada di produk**

## [ISI SENDIRI]
- Tahun berdiri: ____ · Bentuk badan hukum (PT/CV/perorangan): ____ · NIB/NPWP: ____
- Jumlah tim (full-time / part-time / teknis): ____
- Revenue 12 bulan terakhir (IDR → USD): ____ · Jumlah event per bulan: ____ · Jumlah mesin/unit: ____
- Pendanaan: Bootstrapped (kecuali ada investor) · Total dana dari luar: ____
- Pengeluaran AI/cloud per bulan saat ini: ____ (cek tagihan GCP + Supabase)
- Klien atau mitra yang bisa disebut (kampus, venue, brand): ____

## Jawaban dasar (English)

**One-liner**
Sebooth is a photobooth company in Semarang, Indonesia, that runs its own software platform: guests scan a QR at the booth to instantly claim, view and download their photos, strips, GIFs and videos, while event organizers get digital queuing and live analytics.

**Company description (~100 words)**
Sebooth operates photobooth hardware (studio booths, vending-machine booths and self-service kiosks) for weddings, campus events, concerts and corporate gatherings across Central Java. Unlike most local vendors, we built our own platform at sebooth.in. Every session produces a QR code that leads to a personal gallery where guests claim their softfiles. Event organizers get a digital queue with push notifications, a TV display, and an admin console for frames, content and session analytics. More than 3,460 sessions have gone through the platform so far. We are bootstrapped and built the full stack in-house (Next.js, Supabase, Google Cloud Storage).

**Problem**
At Indonesian events, photobooth guests wait in long physical lines, lose their printed strips, and rarely get their digital files. Vendors share photos through messy Google Drive links or WhatsApp days later. Organizers get no data on attendance or engagement, and vendors cannot turn a one-time guest into a returning customer or a review.

**Solution**
A booth-to-phone pipeline: each session is uploaded to the cloud, and the guest scans a QR to claim an editorial gallery with one-tap download. A digital queue replaces the physical line and notifies guests when their turn is near. After downloading, a review funnel turns happy guests into Google reviews and Instagram followers. The admin console gives the team and organizers session-level visibility.

**Planned AI use cases (rencana, belum dibangun)**
1. **AI frame and template generator**: organizers describe their event theme, and the model (for example Gemini image models) drafts a branded photostrip frame that our team approves. This cuts design turnaround from days to minutes.
2. **Smart gallery**: automatic captions, best-shot selection and highlight reels per event, so organizers get a recap pack right after the event.
3. **Booking assistant**: a chat assistant on the website and WhatsApp that answers package and pricing questions and drafts quotes from our pricing data.
4. **Content operations**: assisting our team in drafting and fact-checking local SEO articles and event recaps (human-edited before publishing).
(Catatan: fitur "cari foto lewat wajah" sengaja tidak dimasukkan. Itu data biometrik dan butuh consent serta kepatuhan UU PDP.)

**Traction**
- 3,460+ photobooth sessions processed on our own platform
- 54 published long-form articles ranking for local photobooth searches in Semarang and Tembalang
- Live digital queue system used at events, with Web Push notifications
- [ISI SENDIRI: revenue, event per bulan, klien, rating Google]

**Team**
Alief Widjonarko, Founder: runs operations and business, and leads product and engineering for the sebooth.in platform. [ISI SENDIRI: anggota tim lain + peran, LinkedIn]
