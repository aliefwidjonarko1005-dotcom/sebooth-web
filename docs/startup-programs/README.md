# Program Startup: Google, xAI, OpenAI (cek per 31 Okt 2026)

Riset dari halaman resmi yang dibuka langsung tanggal 31 Oktober 2026. Angka dan syarat bisa berubah, jadi cek lagi link-nya sebelum apply.

## Ringkasan cepat

| Program | Status sekarang | Syarat utama | Sebooth lolos? | Benefit |
|---|---|---|---|---|
| **Google AI Studio / Gemini API (tahap "Build your MVP")** | Langsung pakai, tanpa aplikasi | Builder pre-funded, pelanggan baru Google Cloud | **Ya** | Akses gratis Gemini API di AI Studio (free tier, ada rate limit). Tidak ada kredit dolar. |
| **Google for Startups Cloud Program (Grow & Scale)** | Buka, rolling | Pendanaan Pre-Seed s/d Series A, umur 3–5 tahun, MVP jalan, domain terverifikasi, email domain = website, kredit GCP sebelumnya ≤ $5.000 | **Kemungkinan belum**, kecuali Sebooth sudah pernah terima dana investor (angel/pre-seed). Bootstrapped murni → tier ini bukan buat lu. | s/d $350K (AI startup: $250K thn 1 + 20% s/d $100K thn 2; non-AI: $100K + $100K), Workspace Business Plus 12 bln, kredit Maps, training |
| **Google for Startups Accelerator: Southeast Asia** | **Tutup.** Aplikasi 25 Mei–20 Jun 2026, demo day 10–11 Nov 2026. Belum ada jadwal angkatan berikutnya. | Startup SEA, Seed–Series B, ada traction, tim teknis in-house yang kuat, idealnya AI/ML | **Belum.** Tahap dan kedalaman teknis belum masuk. Daftar RSVP biar dapat kabar angkatan berikutnya. | Equity-free, 3 bulan, mentor Google, bootcamp SG/SF, s/d $350K kredit Cloud |
| **Grok for Startups (xAI / SpaceXSI)** | Buka | **Venture-backed**, produk live, email kerja yang domainnya sama dengan website. Email pribadi ditolak. | **Tidak**, karena belum ada investor VC. Bisa apply ulang "once you've raised". | Kredit buat 6–12 bulan pemakaian (20% saat approve, 80% setelah onboarding), satu saldo untuk Grok/Grok Build/Grok Bot/API |
| **OpenAI for Startups (kredit API)** | Hanya lewat VC partner | Wajib **kode referral dari VC partner** (Thrive, Sequoia, a16z, Kleiner Perkins, Conviction, dll.) | **Tidak.** Tidak ada jalur publik tanpa VC partner. | Kredit API, rate limit naik, akses solutions engineer |
| **OpenAI Grove** | Angkatan 2 tutup 12 Jan 2026. Tidak ditemukan pengumuman angkatan 3. | Individu builder tahap sangat awal, ~15 orang, di San Francisco | Tidak relevan sekarang | Mentoring, kredit, akses awal model |

**Kesimpulan jujur:** dengan kondisi sekarang (bootstrapped, belum ada investor, produk inti layanan photobooth + platform web), yang **realistis cuma Google AI Studio (gratis, tanpa aplikasi)**. Google Cloud Program tier kredit besar, Grok for Startups, dan kredit OpenAI semuanya **mensyaratkan pendanaan dari investor**. Kalau suatu saat Sebooth dapat dana angel/pre-seed, Google Cloud Program jadi pilihan pertama, soalnya Sebooth sudah pakai Google Cloud Storage.

Satu hal lagi yang perlu lu tahu: **di repo ini belum ada fitur AI sama sekali** (tidak ada pemanggilan Gemini/OpenAI/Grok di `src/`). Untuk program yang membedakan "AI startup" (Google) atau menanyakan use case API (OpenAI/xAI), use case AI di draf masih berupa **rencana**, dan di draf ditulis jujur sebagai rencana.

## Detail per program

### 1. Google

**a. AI Studio / Gemini API free tier**
- Link: https://aistudio.google.com/
- Halaman resmi menyebut tahap ini "For pre-funded builders and new Google Cloud customers founding digital-native products."
- Tidak perlu aplikasi. Cukup akun Google, lalu bikin API key. Free tier ada rate limit. Kalau butuh lebih, aktifkan billing (bayar per pemakaian).
- Program terkait yang tercantum di startup.google.com/programs: Gemini API Sprints, Gemini Startup Forum (seed s/d Series A), Startup School (kelas online). Status buka/tutup untuk Indonesia tidak tertulis.

**b. Google for Startups Cloud Program (Grow & Scale)**
- Link info: https://cloud.google.com/startup · Apply: https://cloud.google.com/startup/apply (harus login Google)
- Kriteria resmi:
  - "Pre-Seed to Series A funding, founded within the last 3-5 years (depending on program tier)"
  - Produk proprietary yang scalable, MVP jalan, roadmap jelas, **domain perusahaan terverifikasi**
  - **Email perusahaan yang cocok dengan website publik** (jadi alief@sebooth.in wajib, Gmail tidak bisa)
  - **Akun Google Cloud + Billing Account ID** yang valid
  - Belum pernah terima kredit Google Cloud > $5.000
  - Dikecualikan: dev shop, konsultan, **agensi**, blog/konten pribadi, nonprofit, lembaga pendidikan, dll. Sebooth harus diposisikan sebagai platform/produk digital, bukan "jasa event".
- Benefit: s/d $350K kredit dalam 2 tahun. Kredit cuma berlaku untuk produk first-party GCP yang pay-as-you-go (Vertex AI/Gemini termasuk, model pihak ketiga seperti Claude di Model Garden tidak). Plus Workspace Business Plus 12 bulan (syarat: domain tidak berlangganan Workspace berbayar dalam 31 hari sebelum apply), kredit Maps (aplikasi terpisah), training Google Skills, Startup Success Manager.
- Deadline: rolling, tidak ada deadline.
- Badan hukum: tidak disebut eksplisit di halaman, tapi form akan minta data perusahaan dan pendanaan. Siapkan data PT/CV kalau ada.

**c. Google for Startups Accelerator: Southeast Asia 2026**
- Link: https://startup.google.com/programs/accelerator/southeast-asia/
- Status: "Applications are now closed." Jadwal 2026: buka 25 Mei, tutup 20 Jun, kick-off 18 Agu, bootcamp Singapura 7–10 Sep, bootcamp SF 5–9 Okt, demo day 10–11 Nov.
- Kriteria: berbasis di SEA, "demonstrating traction, ideally between Seed and Series B", "deeply technical, preferably leveraging ... machine learning and AI", "sizable in-house technical expertise", founder wajib ikut sesi.
- Benefit: equity-free, mentor Google, s/d $350K kredit Cloud (menurut press release 25 Mei 2026), akses Trusted Tester. Komdigi kasih dukungan tambahan untuk startup Indonesia.
- Langkah sekarang: daftar "Register your interest" di https://rsvp.withgoogle.com/events/google-for-startups-accelerator-updates

### 2. xAI: Grok for Startups
- Link info: https://x.ai/startups · Apply: https://x.ai/startups/apply
- FAQ resmi: "We check every application for venture backing, a live product, and a company email that matches your website. If you don't qualify yet, you can reapply once you've raised."
- Data yang diminta: work email, LinkedIn, website perusahaan, detail pendanaan, revenue, pengeluaran AI saat ini, ukuran tim, investor. "We can't approve applications that use a personal email."
- Benefit: jumlah kredit tergantung pendanaan, revenue, dan AI spend, ditargetkan sekitar 6 bulan pemakaian realistis. 20% cair saat approve, 80% setelah onboarding. Satu grant per perusahaan.
- Deadline: tidak disebut (kelihatannya rolling).
- Free credit API umum: halaman docs/pricing xAI sekarang tidak menyebut kredit gratis saat daftar.

### 3. OpenAI
- Link: https://openai.com/startups/ (redirect ke /business/why-openai/startups/)
- FAQ resmi: kredit API dibuka "through eligible VC partners". Saat apply diminta: "A unique referral code from your VC", deskripsi produk dan rencana pakai API, nama perusahaan dan kontak tim dengan "valid business email", detail pendanaan dasar, serta OpenAI org ID.
- Tanpa VC partner tidak ada form publik. Yang bisa dipakai gratis: Build Hours, starter repo, newsletter "Startup Drop", event (kebanyakan di AS/Eropa).
- OpenAI Grove: angkatan 2 sudah tutup (update 12 Jan 2026). Tidak ketemu info angkatan berikutnya: https://openai.com/index/openai-grove

## Prasyarat yang sama di hampir semua program
1. **Email domain** `alief@sebooth.in`. Wajib di Google Cloud, xAI, dan OpenAI. Forwarding saja cukup buat terima email verifikasi, tapi idealnya bisa *kirim* juga dari alamat itu (Gmail "Send mail as" pakai SMTP Hostinger). Domain di Google Cloud juga mungkin perlu diverifikasi lewat TXT record di DNS Hostinger.
2. **Website live** yang menyebut nama perusahaan: sebooth.in ✔
3. **LinkedIn** founder dan halaman perusahaan Sebooth (xAI minta LinkedIn).
4. **Data pendanaan**: jawab jujur "Bootstrapped / self-funded". Jangan ngaku pre-seed kalau belum.
5. **Badan hukum** (PT/CV + NIB/NPWP): tidak diwajibkan eksplisit di halaman mana pun, tapi form biasanya minta nama legal dan negara registrasi. Kalau belum punya, isi nama usaha dan siapkan jawaban jujur.

## File di folder ini
- [google-for-startups-cloud.md](google-for-startups-cloud.md): draf jawaban Google Cloud Program + langkah AI Studio
- [google-for-startups-accelerator-sea.md](google-for-startups-accelerator-sea.md): draf untuk angkatan accelerator berikutnya
- [xai-grok-for-startups.md](xai-grok-for-startups.md): draf untuk kalau nanti sudah dapat VC
- [openai-for-startups.md](openai-for-startups.md): draf untuk kalau nanti punya VC partner
- [company-facts.md](company-facts.md): fakta perusahaan dari repo (bahan bersama semua draf)

## Sumber
- https://cloud.google.com/startup
- https://startup.google.com/cloud/
- https://startup.google.com/programs/accelerator/southeast-asia/
- https://www.googlecloudpresscorner.com/Google-Cloud-Launches-AI-Startup-Innovation-Corridor-from-Southeast-Asia-to-Silicon-Valley-with-EnterpriseSG-Komdigi-NIC-and-SIHUB
- https://startup.google.com/programs/
- https://x.ai/startups
- https://docs.x.ai/developers/pricing
- https://openai.com/business/why-openai/startups/
- https://openai.com/index/openai-grove
