# Queue Management System v2 — Upgrade Plan

Upgrade sistem antrean Sebooth dari anonymous queue-taking ke full authenticated experience dengan QR scan session linking, Web Push notifications, 4-tier status categories, dan auto-claim foto.

---

## Ringkasan Perubahan Besar

| Area | Sebelum (Phase 3A) | Sesudah (Phase 3B-3E) |
|------|--------------------|-----------------------|
| Auth | Opsional (nama + WA manual) | **Wajib login/register** sebelum ambil antrean |
| Registrasi | Existing `/register` (email + password) | Tambah **nama lengkap + nomor WA wajib** |
| Ambil Antrean | Input nama manual | **Auto-fill dari data akun**, no WA field |
| Notifikasi | WhatsApp via Fontte API | **Web Push Notification** + audio cues per status |
| Session Linking | Webhook dari mesin | **QR Scan dari HP user** → link session ke akun |
| Auto-Claim Foto | Manual via `/access/[id]` | **Otomatis** dikirim ke akun user setelah sesi selesai |
| Status Visual | 2 tier (waiting/called) | **4 tier** (Menunggu → Hampir → Bersiap → Giliran) |
| Estimasi Waktu | Basic countdown | **Detail per-sesi** + integrasi profil |

---

## User Review Required

> [!IMPORTANT]
> **Breaking Change — Auth Wajib**: Setelah Phase 3B, user **tidak bisa** ambil antrean tanpa login. Pastikan ini sesuai keinginan karena menambah friction bagi user pertama kali.

> [!IMPORTANT]  
> **Penghapusan Fonnte WA API**: Semua integrasi WhatsApp notification (`FONNTE_API_KEY`) akan dihapus sepenuhnya dan diganti Web Push. User yang tidak mengizinkan push notification hanya akan mendapat update via halaman tiket (SSE + audio).

> [!WARNING]
> **QR Scan memerlukan HTTPS**: Fitur scan QR di HP (`navigator.mediaDevices.getUserMedia`) hanya berjalan di HTTPS. Pastikan development environment menggunakan HTTPS atau gunakan `localhost` (yang di-exempt oleh browser).

---

## Proposed Changes — Phase Breakdown

---

## Phase 3B — Auth-Gated Queue + User Profile Enhancement

**Tujuan**: Wajibkan login/register sebelum ambil antrean. Perkaya data registrasi. Auto-fill form antrean dari data akun.

### Database Schema Changes

#### [MODIFY] Supabase `auth.users` metadata
- Tambah `user_metadata` fields saat register:
  - `full_name` (string, wajib)
  - `phone_number` (string, wajib — format WA)

#### [NEW] Supabase SQL migration
```sql
-- Tidak perlu tabel baru, cukup pastikan queue_tickets.user_id selalu terisi
-- Tambah constraint: queue_tickets.user_id NOT NULL (setelah migrasi)
ALTER TABLE queue_tickets ALTER COLUMN user_id SET NOT NULL;
```

---

### Frontend — Registration Enhancement

#### [MODIFY] [register/page.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/register/page.tsx)
- Tambah fields di form registrasi:
  - **Nama Lengkap** (wajib)
  - **Nomor WhatsApp** (wajib, format `08xx`)
- Simpan ke `user_metadata` saat `supabase.auth.signUp()`
- Support query param `?redirect=/queue/[eventId]` untuk redirect setelah register berhasil

#### [MODIFY] [login/page.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/login/page.tsx)
- Support query param `?redirect=/queue/[eventId]` untuk redirect setelah login berhasil

---

### Frontend — Queue Join Flow

#### [MODIFY] [queue/[eventId]/page.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/queue/[eventId]/page.tsx)
- Cek auth status server-side
- Jika **belum login**: tampilkan halaman pilihan "Sudah punya akun? Login" / "Belum punya akun? Daftar" dengan redirect param ke halaman ini
- Jika **sudah login**: render `QueueJoinForm` dengan data akun yang sudah ter-autofill

#### [MODIFY] [QueueJoinForm.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/components/queue/QueueJoinForm.tsx)
- Hapus input field `displayName` dan `phoneNumber` — otomatis dari `user_metadata`
- Terima props `user` dengan `full_name` dan `phone_number`
- Tampilkan preview: "Halo, **{nama}**! Ambil antrean untuk **{event}**?"
- Submit langsung kirim `user.id` + `user.full_name`
- Hapus form manual, ganti dengan tombol konfirmasi "Ambil Nomor Antrean"

#### [MODIFY] [queueActions.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/lib/queue/queueActions.ts)
- `joinQueue()` sekarang **wajib** `userId` parameter
- Ambil `display_name` dan `phone_number` dari `auth.users` metadata
- Hapus parameter `displayName` dan `phoneNumber` manual

#### [MODIFY] [join/route.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/api/queue/join/route.ts)
- Validasi auth: ambil user dari cookie session
- Reject request tanpa auth
- Ambil nama + WA dari user metadata

---

### Penghapusan Fonnte WA Integration

#### [DELETE] Semua referensi `FONNTE_API_KEY` dan kode WhatsApp notification
- Hapus WA notification logic dari webhook dan operator actions
- Hapus `wa_notified` field usage (tetap di DB untuk backward compat)
- Hapus env var `FONNTE_API_KEY` dari dokumentasi

---

## Phase 3C — Web Push Notification + 4-Tier Status Categories

**Tujuan**: Implementasi Web Push API sebagai pengganti WA notification. Tambah 4 kategori status visual dengan audio cues berbeda.

### Web Push Infrastructure

#### [NEW] `public/service-worker.js`
- Service Worker untuk menerima push events
- Tampilkan native notification dengan icon Sebooth
- Handle notification click → buka halaman tiket antrean

#### [NEW] `src/lib/queue/pushSubscription.ts`
- Utility functions: `subscribeToPush()`, `unsubscribeFromPush()`
- Request notification permission dari user
- Kirim subscription object ke server

#### [NEW] `src/app/api/queue/push/subscribe/route.ts`
- API endpoint untuk menyimpan push subscription
- Simpan ke tabel `push_subscriptions` (baru)

#### [NEW] `src/app/api/queue/push/send/route.ts`
- Internal API untuk trigger push notification
- Dipanggil saat status tiket berubah

#### [NEW] Supabase table `push_subscriptions`
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### [NEW] Environment variables
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — VAPID public key untuk Web Push
- `VAPID_PRIVATE_KEY` — VAPID private key (server-side only)

---

### 4-Tier Status Categories

#### [MODIFY] [database.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/types/database.ts)
- Tambah type `QueueProximityTier`:
  ```typescript
  export type QueueProximityTier = 'waiting' | 'approaching' | 'preparing' | 'your_turn';
  // 🟢 waiting = masih jauh (5+ sesi)
  // 🟡 approaching = hampir (3-4 sesi lagi)
  // 🟠 preparing = bersiap (1-2 sesi lagi)  
  // 🔴 your_turn = giliran Anda! (status === 'called')
  ```

#### [MODIFY] [QueueStatusBadge.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/components/queue/QueueStatusBadge.tsx)
- Redesign badge untuk 4 tier dengan warna + icon berbeda
- Tambah animasi pulse untuk `preparing` dan `your_turn`
- Tambah shimmer effect untuk `your_turn`

#### [MODIFY] [QueueEstimateTimer.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/components/queue/QueueEstimateTimer.tsx)
- Terima prop `proximityTier` baru
- Ubah warna countdown ring sesuai tier:
  - 🟢 `#22C55E` (green)
  - 🟡 `#EAB308` (yellow)
  - 🟠 `#F97316` (orange)
  - 🔴 `#EF4444` (red) + pulse animation
- Tambah detail estimasi per-sesi: "2 orang × ~5 menit = ~10 menit"
- Tambahkan breakdown siapa yang sedang berfoto

#### [MODIFY] [QueueTicketDisplay.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/components/queue/QueueTicketDisplay.tsx)
- Hitung `proximityTier` dari `positionFromFront`:
  - `positionFromFront >= 5` → `waiting`
  - `positionFromFront 3-4` → `approaching`
  - `positionFromFront 1-2` → `preparing`
  - `status === 'called'` → `your_turn`
- Trigger Web Push notification saat tier berubah ke `preparing` atau `your_turn`
- Trigger audio cue berbeda per tier transition:
  - `approaching`: subtle chime (single tone)
  - `preparing`: double chime (urgent)
  - `your_turn`: triple ascending chime (excited)
- Visual background gradient berubah sesuai tier
- Full-screen takeover animation saat `your_turn`

#### [MODIFY] [queueFetchers.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/lib/queue/queueFetchers.ts)
- `fetchQueueStatus()` sekarang include `proximityTier` per tiket
- Tambah info detail: siapa yang sedang berfoto, estimasi sisa waktu sesi aktif

---

### Push Notification Trigger Points

#### [MODIFY] [webhook/route.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/api/queue/webhook/route.ts)
- Setelah update status tiket, hitung ulang proximity tier untuk semua tiket waiting
- Kirim Web Push ke user yang tier-nya berubah:
  - `approaching`: "Antrean kamu hampir tiba! Masih 3-4 sesi lagi."
  - `preparing`: "Bersiap-siap! Tinggal 1-2 sesi lagi sebelum giliranmu."
  - `your_turn`: "GILIRAN KAMU! Segera menuju booth 📸"

#### [MODIFY] [operator actions in queueActions.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/lib/queue/queueActions.ts)
- `operatorCallNext()` → trigger push notification untuk tiket yang dipanggil
- Setelah setiap perubahan status, recalculate dan broadcast proximity updates

---

## Phase 3D — QR Scan Session Linking + Auto-Claim

**Tujuan**: User scan QR dari layar mesin photobooth menggunakan kamera HP untuk link session. Foto otomatis dikirim ke akun user.

### QR Scan Infrastructure

#### [NEW] `src/components/queue/QRScannerModal.tsx`
- Modal fullscreen dengan kamera HP (menggunakan `navigator.mediaDevices.getUserMedia`)
- Real-time QR code detection menggunakan `BarcodeDetector` API (native browser) dengan fallback ke library `jsQR`
- Setelah scan berhasil:
  1. Parse QR data → extract `session_token`
  2. Kirim API request ke `/api/queue/link-session`
  3. Tampilkan konfirmasi "Sesi berhasil dihubungkan! 🎉"
  4. Tutup modal, update UI
- Viewfinder overlay dengan guide frame
- Flash/torch toggle (jika supported)

#### [NEW] `src/app/api/queue/link-session/route.ts`
- API endpoint: `POST /api/queue/link-session`
- Request body: `{ sessionToken: string }`
- Flow:
  1. Validasi auth (ambil user dari cookie)
  2. Decode `sessionToken` → dapatkan `session_id` + `event_id`
  3. Update `sessions` table: set `user_id = auth.user.id`, `is_claimed = true`
  4. Update `queue_tickets` table: set `session_id = sessions.id`, `status = 'in_session'`
  5. Broadcast SSE update
- Security: token hanya valid selama 10 menit (generated by photobooth app)

#### [NEW] `src/app/api/queue/generate-session-token/route.ts`
- API endpoint untuk mesin photobooth: `POST /api/queue/generate-session-token`
- Generate time-limited token yang encode `session_id` + `event_id` + `timestamp`
- Token ini yang di-render sebagai QR code di layar mesin photobooth
- Authenticated via `QUEUE_WEBHOOK_SECRET`

---

### UI — Scan Button on Ticket Page

#### [MODIFY] [QueueTicketDisplay.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/components/queue/QueueTicketDisplay.tsx)
- Saat status = `called` atau `your_turn`, tampilkan tombol besar:
  ```
  ┌─────────────────────────────┐
  │  📷 SCAN QR UNTUK MULAI    │
  │    Scan QR di layar booth   │
  └─────────────────────────────┘
  ```
- Tombol membuka `QRScannerModal`
- Setelah scan berhasil, status berubah ke `in_session` dan UI update

---

### Auto-Claim Foto

#### [MODIFY] [webhook/route.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/api/queue/webhook/route.ts)
- Pada event `session_completed`:
  1. Cari tiket yang linked ke `session_id`
  2. Dari tiket, dapatkan `user_id`
  3. Update `sessions.user_id = queue_ticket.user_id`
  4. Set `sessions.is_claimed = true` (auto-claim, tidak perlu user action)
  5. Kirim Web Push notification: "Foto kamu sudah siap! Lihat di profil 📸"
  6. Update tiket display dengan link ke `/profile`
- **User tidak perlu scan QR lagi di akhir atau visit `/access/[id]`** — foto langsung muncul di `/profile`

---

## Phase 3E — Enhanced Real-time Estimates + Profile Integration

**Tujuan**: Detail estimasi per-sesi, integrasi antrean di halaman profil user.

### Enhanced Estimates

#### [MODIFY] [QueueEstimateTimer.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/components/queue/QueueEstimateTimer.tsx)
- Tampilkan breakdown detail:
  ```
  Estimasi Waktu Tunggu: ~12 menit
  ├─ 🟢 Sedang berfoto: Dina (#003) — sisa ~4 menit  
  ├─ 🟡 Selanjutnya: Andi (#004) — ~5 menit
  └─ 🟠 Kamu: Budi (#005)
  ```
- Update breakdown secara real-time via SSE

#### [MODIFY] [queueFetchers.ts](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/lib/queue/queueFetchers.ts)
- Enrich `fetchQueueStatus()` response dengan:
  - Nama orang yang sedang berfoto + elapsed time
  - Breakdown per-orang di depan user

---

### Profile Queue Integration

#### [MODIFY] [profile/page.tsx](file:///c:/Users/AXIOO HYPE R5/Documents/2026/06 Sebooth Proposal Company Profile/sebooth-website/src/app/profile/page.tsx)
- Tambah section "Antrean Aktif" di atas gallery jika user punya tiket aktif:
  ```
  ┌──────────────────────────────────────┐
  │ 🎫 Antrean Aktif                     │
  │ Event: Wedding Expo 2026             │
  │ Nomor: #007 | Status: 🟡 Hampir     │  
  │ Estimasi: ~8 menit                   │
  │                    [Lihat Detail →]  │
  └──────────────────────────────────────┘
  ```
- Card ini juga real-time update via SSE
- Link ke halaman tiket detail

#### [NEW] `src/lib/queue/fetchUserActiveTickets.ts`
- Server-side fetcher: dapatkan tiket aktif untuk `user_id` tertentu
- Digunakan oleh profile page

---

## Verification Plan

### Automated Tests
```bash
# Build check
npm run build

# Type check
npx tsc --noEmit
```

### Manual Verification
1. **Auth Flow**: Buka `/queue/[eventId]` tanpa login → harus redirect ke pilihan login/register → setelah login, redirect kembali dan auto-fill nama
2. **Ambil Antrean**: User login → buka halaman antrean → klik "Ambil Nomor Antrean" → tiket muncul dengan status 🟢 Menunggu
3. **Status Transition**: Operator panggil next → user lihat status berubah real-time tanpa refresh:
   - 🟢 → 🟡 (saat 3-4 sesi lagi)
   - 🟡 → 🟠 (saat 1-2 sesi lagi) + audio chime + push notification
   - 🟠 → 🔴 (saat dipanggil) + tombol "SCAN QR" muncul
4. **QR Scan**: User klik "SCAN QR" → kamera HP terbuka → scan QR di layar mesin → session linked → status berubah ke "Sedang berfoto"
5. **Auto-Claim**: Setelah sesi selesai (webhook `session_completed`) → foto otomatis muncul di `/profile` user → push notification "Foto sudah siap!"
6. **Web Push**: Test push notification di mobile browser → pastikan muncul meski tab tidak aktif
7. **Audio Cues**: Test suara notifikasi berbeda untuk setiap tier transition

---

## New Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for Web Push |
| `VAPID_PRIVATE_KEY` | VAPID private key (server-side) |

## Removed Environment Variables

| Variable | Reason |
|----------|--------|
| `FONNTE_API_KEY` | WA notification dihapus, diganti Web Push |

---

## Dependency Baru

| Package | Purpose |
|---------|---------|
| `web-push` | Server-side Web Push API library (VAPID key generation + push sending) |
| `jsqr` | Fallback QR code decoder jika `BarcodeDetector` API tidak tersedia |

---

## Timeline Estimasi

| Phase | Scope | Estimasi |
|-------|-------|----------|
| **3B** | Auth-Gated Queue + Register Enhancement | Implementasi pertama |
| **3C** | Web Push + 4-Tier Status + Audio Cues | Setelah 3B selesai |
| **3D** | QR Scan Session Linking + Auto-Claim | Setelah 3C selesai |
| **3E** | Enhanced Estimates + Profile Integration | Setelah 3D selesai |
