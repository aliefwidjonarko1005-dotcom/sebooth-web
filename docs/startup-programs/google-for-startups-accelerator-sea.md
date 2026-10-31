# Google for Startups Accelerator: Southeast Asia: draf untuk angkatan berikutnya

Info: https://startup.google.com/programs/accelerator/southeast-asia/
**Status: tutup.** Angkatan 2026 aplikasinya 25 Mei–20 Jun 2026, demo day 10–11 Nov 2026. Belum ada tanggal angkatan berikutnya. Kalau pola tahunannya sama, kemungkinan buka lagi sekitar Mei 2027 (ini tebakan, belum dikonfirmasi).

## Langkah sekarang
1. Daftar kabar angkatan berikutnya: https://rsvp.withgoogle.com/events/google-for-startups-accelerator-updates (isi sendiri)
2. Pantau juga Komdigi dan Garuda Spark Innovation Hub, mitra program untuk startup Indonesia.

## Kenapa kemungkinan belum lolos sekarang (jujur)
- Targetnya "ideally between Seed and Series B" dengan traction. Sebooth bootstrapped. Traction ada, tapi belum ada pendanaan.
- Mereka mau tim "deeply technical, preferably leveraging ... machine learning and AI" dengan "sizable in-house technical expertise". Sekarang belum ada AI di produk dan tim teknisnya kecil.
- Angkatan 2026 cuma 25 startup dari 6 negara. Contoh startup Indonesia di angkatan ini: Majoo, Dash Electric.

## Yang perlu dibangun sebelum Mei 2027 biar kompetitif
- [ ] Minimal 1 fitur AI live dengan metrik (misal AI frame generator dipakai di X event)
- [ ] Angka traction yang rapi: revenue bulanan, jumlah event, growth sesi bulan ke bulan, rating Google
- [ ] Pertimbangkan dana pre-seed/angel kalau memang mau jalur ini
- [ ] Tambah 1 orang teknis (co-founder/CTO) biar tim tidak cuma founder
- [ ] Email domain, LinkedIn perusahaan, pitch deck 10 slide

## Draf jawaban (English)
Pertanyaan persis belum dipublikasikan. Ini untuk pertanyaan khas accelerator Google.

**What problem are you solving and for whom?**
Event photo experiences in Indonesia are still offline-first: guests queue physically, get a paper strip, and rarely receive their digital files. Organizers get no data. We serve event organizers (campuses, weddings, concerts, corporates) and their guests in Central Java.

**What is your solution and what makes it technically defensible?**
Pakai "Solution" + "proprietary technology" dari company-facts.md / google-for-startups-cloud.md.

**How will you use AI / which Google technology?**
Gemini on Vertex AI for event-themed frame generation, automatic captioning and highlight selection, and a booking assistant. Cloud Run and GCS for the media pipeline. Firebase/Web Push for real-time queue notifications.

**What technical challenge do you want Google's help with?**
Scaling real-time media delivery during peak moments of large events (thousands of guests claiming photos within minutes), and designing a cost-efficient generative pipeline for frames and recaps that keeps quality consistent with our brand.

**Traction / funding / team:** company-facts.md + [ISI SENDIRI]
