# KPI Log (GitHub → Google Sheet)

Setiap push ke `main` menjalankan `.github/workflows/kpi-log.yml`, yang mengirim daftar commit ke Apps Script `kpi-log.gs`. Satu commit menjadi satu baris di tab **KPI Log**: Logged At, Commit Date, Author, Message, Files Changed, Branch, Repo, Hash, URL. Commit yang sudah tercatat tidak ditulis ulang (dicek dari Hash).

## Setup (sekali saja)

1. **Buat Sheet.** Buka Google Sheet baru (atau yang sudah ada), lalu menu **Extensions → Apps Script**.
2. **Tempel kode.** Ganti isi `Code.gs` dengan isi `scripts/appscript/kpi-log.gs`, lalu Save.
3. **Buat secret.** Bikin string acak panjang, misalnya dengan:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Di Apps Script: **Project Settings (ikon gear) → Script Properties → Add script property**, key `KPI_SECRET`, value string tadi.
4. **Deploy sebagai Web App.** **Deploy → New deployment → Select type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik Deploy, izinkan akses (Authorize), lalu copy **Web app URL** (berakhiran `/exec`).
5. **Isi secret di GitHub.** Repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `APPS_SCRIPT_URL` = Web app URL dari langkah 4
   - `APPS_SCRIPT_SECRET` = string dari langkah 3
6. **Tes.** Tab **Actions → KPI Log → Run workflow** (mencatat HEAD sebagai "manual run"), atau langsung push ke `main`. Baris baru muncul di tab **KPI Log**.

## Catatan

- Kalau kode `.gs` diubah, deploy ulang lewat **Deploy → Manage deployments → Edit (pensil) → Version: New version**. Cara ini menjaga URL tetap sama. Kalau pakai "New deployment", URL berubah dan secret `APPS_SCRIPT_URL` harus diganti.
- Kalau secret belum diisi, workflow hanya memberi warning dan tidak gagal.
- Kalau secret salah, workflow gagal dengan respons `{"ok":false,"error":"unauthorized"}`.
- Push event GitHub hanya membawa maksimal 20 commit per push. Push yang lebih besar dari itu hanya tercatat 20 commit terakhir.
