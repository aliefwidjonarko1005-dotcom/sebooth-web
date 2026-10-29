# KPI Log (GitHub → Sheet KPI)

Setiap push ke `main` menjalankan `.github/workflows/kpi-log.yml`, yang mengirim daftar commit ke `kpi-log.gs`. File ini berjalan di project Apps Script yang sama dengan mesin **KPI Native Sync** di sheet "KPI — Sebooth".

Yang terjadi per push:

1. **Release Log.** Setiap commit menjadi satu baris di tab Release Log pada sheet Website & App. Isinya hash, tanggal, pesan, PIC, Dev ID yang disebut, dan link commit. Commit yang sama tidak ditulis dua kali.
2. **JON-03 otomatis.** Kalau pesan commit memuat `done DEV-202610-001` (bisa juga `closes` atau `selesai`), maka:
   - Status Dev ID itu di Development Tracker berubah jadi **Done**.
   - Waktu push dari server GitHub ditulis sebagai completion timestamp di KPI Evidence.
   - Pada sync jam-jaman berikutnya, mesin KPI memakai timestamp itu dan menilai on-time terhadap Target Date.

   Kalau ternyata lewat deadline, hasilnya tetap tercatat telat. Hanya Dev ID yang PIC dan Platform-nya cocok yang dihitung: Jonar dengan Website/Both untuk JON-03, Adnan dengan App/Both untuk ADN-03. Timestamp yang sudah ada tidak pernah ditimpa.

Hanya menyebut `DEV-…` tanpa kata `done` cukup untuk mencatat Dev ID di Release Log, tanpa mengubah status.

Contoh:

```
feat(queue): prototipe sistem antrian

done DEV-202610-001
```

## Setup (sekali saja)

1. **Tambah file.** Buka sheet "KPI — Sebooth", lalu **Extensions → Apps Script** (project yang berisi KPI Native Sync). Buat file baru, misalnya `KpiLog.gs`, tempel isi `scripts/appscript/kpi-log.gs`, lalu Save. Jangan ubah `Code.gs` milik mesin; file ini memakai `CFG`, `mustSheet_`, `headerMap_`, `loadEvidenceState_`, dan `endOfDay_` dari sana.
2. **Buat secret.**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Masuk ke **Project Settings (ikon gear) → Script Properties → Add script property**, key `KPI_SECRET`, value string tadi.
3. **Deploy sebagai Web App.** **Deploy → New deployment → Web app**, Execute as **Me**, Who has access **Anyone**. Lalu Deploy, Authorize, dan copy URL yang berakhiran `/exec`.
4. **Isi secret di GitHub.** Buka repo → **Settings → Secrets and variables → Actions**:
   - `APPS_SCRIPT_URL` = URL `/exec`
   - `APPS_SCRIPT_SECRET` = string dari langkah 2
5. **Tes koneksi.** Buka **Actions → KPI Log → Run workflow**. Respons yang benar adalah `{"ok":true,"released":0,...}`. Setelah itu, push ke `main` akan langsung mengisi Release Log.

## Cek berhasil atau tidak

1. **GitHub Actions → KPI Log**: run harus hijau. Log step "Send commits to Apps Script" memuat `{"ok":true,"released":N,"done":[...]}`.
2. **Website & App → Release Log**: muncul baris baru per commit. Kalau commit memakai `done DEV-…`, Status di Development Tracker berubah jadi Done.
3. **KPI → KPI Evidence / KPI Progress**: setelah sync jam-jaman (menit ke-08), JON-03 ikut terhitung.
4. **Ada masalah?** Buka Apps Script → Executions. Setiap kiriman muncul sebagai `doPost`, dan error-nya terlihat di sana.

## Catatan

- Kalau `KpiLog.gs` diubah, deploy ulang lewat **Deploy → Manage deployments → Edit → Version: New version** supaya URL tetap sama.
- Kalau secret belum diisi, workflow hanya memberi warning dan tidak gagal.
- GitHub hanya mengirim maksimal 20 commit per push.
- JON-01 (performa) dan JON-02 (uptime) tidak diisi dari commit. Mesin sudah punya monitor sendiri: isi `Monitor URL` dan centang `Active` di baris Website pada tab Settings (kolom G–J) di sheet Website & App.
