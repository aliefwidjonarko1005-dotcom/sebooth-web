# Google for Startups Cloud Program: draf jawaban

Info: https://cloud.google.com/startup · Apply: https://cloud.google.com/startup/apply (login Google dulu) · Rolling, tanpa deadline.
Jawaban dasar ada di [company-facts.md](company-facts.md).

## Lu masuk tier mana?
- **Bootstrapped, belum ada investor** → tier yang cocok adalah **"Build your MVP"**: langsung pakai AI Studio (https://aistudio.google.com/), tanpa form. Gemini API gratis dengan rate limit. Tidak ada kredit dolar. **Ini rekomendasi buat sekarang.**
- **Sudah dapat dana Pre-Seed s/d Series A** (termasuk angel) → apply **Grow & Scale** (s/d $100K atau $250K tahun pertama). Kalau belum ada pendanaan dan tetap apply, kemungkinan besar ditolak, karena halamannya tegas menulis "Pre-Seed to Series A funding".
- Status "AI startup" (kredit $250K) butuh produk yang memang berbasis AI. Sebooth sekarang belum. Jujur saja pilih/jelaskan sebagai startup non-AI yang berencana menambah fitur AI.

## Langkah AI Studio (gratis, bisa sekarang)
1. Login https://aistudio.google.com/ pakai akun Google bisnis.
2. Klik "Get API key" → buat project → copy key, simpan sebagai env var (`GEMINI_API_KEY`), jangan di-commit.
3. Coba prototipe use case #1 (AI frame generator) di Build mode. Hasilnya bisa jadi bukti "working AI MVP" kalau nanti apply Grow & Scale.

## Checklist sebelum apply Grow & Scale
- [ ] Email `alief@sebooth.in` aktif (bisa terima, idealnya bisa kirim)
- [ ] Akun Google Cloud dengan **Billing Account ID** (Sebooth sudah pakai GCS, jadi cek di Console → Billing. Pakai billing account milik perusahaan, bukan pribadi.)
- [ ] Pastikan billing account itu **belum pernah dapat kredit > $5.000**
- [ ] Verifikasi domain sebooth.in (TXT record di DNS Hostinger kalau diminta)
- [ ] Bukti pendanaan (nama investor, jumlah, tanggal)
- [ ] Jangan langganan Google Workspace berbayar di domain sebooth.in dalam 31 hari sebelum apply kalau mau klaim Workspace gratis 12 bulan
- [ ] Data legal perusahaan (nama, negara, tahun berdiri)

## Draf jawaban form (English)
Field persis baru kelihatan setelah login. Ini jawaban untuk pertanyaan yang umum muncul.

**Company name:** Sebooth
**Website:** https://sebooth.in
**Country:** Indonesia
**Year founded:** [ISI SENDIRI]
**Funding stage / total raised:** [ISI SENDIRI, jujur]
**Number of employees:** [ISI SENDIRI]
**Industry:** Consumer / Events & Entertainment technology

**Describe your product:**
Sebooth runs photobooth hardware at events and a self-built cloud platform at sebooth.in. Every booth session uploads to Google Cloud Storage and produces a QR code; guests scan it to claim and download their photos, strips, GIFs and videos. Organizers get a digital queue with push notifications, a TV display and an admin console. More than 3,460 sessions have been processed so far.

**How do you use / plan to use Google Cloud?**
We already store all session media on Google Cloud Storage and serve it through our Next.js app. With the program we plan to: (1) move image processing and the media API to Cloud Run; (2) use Gemini on Vertex AI to generate event-themed photostrip frames from an organizer's brief; (3) generate automatic captions, best-shot picks and highlight recaps per event; (4) build a booking assistant grounded on our pricing data. Credits would let us prototype and validate these AI features with real events before paying for them from revenue.

**What is your proprietary technology?**
An end-to-end booth-to-phone pipeline built in-house: session ingestion from our kiosks, atomic claim handling designed for traffic spikes at large events, a crash-safe image delivery layer, a real-time digital queue with Web Push and proximity tiers, and a review/retention funnel. All of it runs on our own codebase, not a white-label tool.

**Traction:** lihat company-facts.md + [revenue, event/bulan]

**Catatan posisi:** Google mengecualikan "dev shops, consultancies or agencies". Tekankan bahwa Sebooth menjual **produk/platform sendiri** (kiosk + software), bukan jasa bikin software untuk orang lain.
