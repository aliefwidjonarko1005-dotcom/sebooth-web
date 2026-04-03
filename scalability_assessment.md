# Scalability Assessment: Sebooth Ecosystem
## Skenario: 300+ Sesi Foto, 400+ Concurrent Users

---

## Verdict: ⚠️ CUKUP MUMPUNI, TAPI ADA 5 BOTTLENECK KRITIS

Arsitektur saat ini sudah **80% siap** untuk skenario di atas. ISR, middleware optimization, dan server-side fetching sudah sangat solid. Namun ada **5 titik lemah** yang bisa jadi bottleneck serius di bawah beban tinggi.

---

## 📊 Layer-by-Layer Analysis

### 1. Homepage & Public Pages — ✅ AMAN (Grade: A)

| Metric | Status |
|---|---|
| ISR 60s revalidation | ✅ Hanya ~1 Supabase call per 60 detik |
| Server-side parallel fetch | ✅ `Promise.all()` — 5 queries parallel |
| Section visibility | ✅ Resolved server-side, hidden sections tidak dikirim |
| Static asset caching | ✅ 1 tahun `immutable` cache |
| `next/image` optimization | ✅ WebP/AVIF otomatis |

**400 visitors ke homepage = 400 cached HTML responses dari Vercel Edge CDN.** Zero Supabase calls. Ini sudah optimal.

---

### 2. `/access/[id]` (QR Scan Page) — ⚠️ BOTTLENECK UTAMA (Grade: C)

Ini adalah **halaman paling kritis** karena semua 400 orang akan scan QR → hit `/access/[id]`.

| Issue | Severity | Detail |
|---|---|---|
| **No caching** | 🔴 HIGH | Setiap QR scan = 1 fresh Supabase query (`sessions` + `media` JOIN). 400 concurrent scans = 400 DB queries |
| **No connection pooling** | 🔴 HIGH | `createServerContentClient()` membuat Supabase client baru setiap request. Supabase Free tier hanya support **50 concurrent connections** |
| **No rate limiting** | 🟡 MEDIUM | Tidak ada proteksi dari rapid QR re-scans |

> [!CAUTION]
> **Worst case**: Dalam event besar (wedding 400 tamu), ketika QR code ditampilkan di layar dan semua tamu scan serentak, Supabase Free plan akan **kewalahan**. Error `too many connections` sangat mungkin terjadi.

**Estimasi beban**:
```
400 users scan QR (within 5 minutes)
= 400 x fetchSessionById() queries
= 400 x (SELECT sessions + JOIN media)
= ~800 Supabase API calls in 5 minutes
+ 400 x auth check di client-side (supabase.auth.getUser())
= ~1,200 total Supabase calls
```

---

### 3. `/profile` (User Gallery) — ⚠️ MODERATE RISK (Grade: B-)

| Issue | Severity | Detail |
|---|---|---|
| **Full client-side fetch** | 🟡 MEDIUM | `useEffect` → `supabase.from('sessions').select('*, media(*)')` — setiap user memuat semua sesi mereka |
| **Canvas strip generation** | 🟡 MEDIUM | 3 template x fetch gambar via CORS → heavy CPU di client. Tidak masalah untuk server, tapi UX lambat di HP murah |
| **No pagination** | 🟡 MEDIUM | Jika 1 user punya 50+ sesi, semua di-load sekaligus |

**OK untuk 400 users** karena masing-masing hanya query data mereka sendiri (filtered by `user_id`). Tapi tidak ada connection pooling.

---

### 4. Supabase Database — ⚠️ TIER-DEPENDENT (Grade: B+/F)

| Plan | Concurrent Connections | API Calls/Month | Database Size | Verdict |
|---|---|---|---|---|
| **Free** | 50 | 500K | 500MB | ❌ **TIDAK CUKUP** untuk 300+ sesi/event |
| **Pro ($25/mo)** | 200 | Unlimited | 8GB | ✅ Comfortable |
| **Team ($599/mo)** | 400 | Unlimited | Custom | ✅ Overkill |

> [!IMPORTANT]
> **Supabase Free tier TIDAK cukup** untuk skenario ini. Dengan 300 sesi per event dan tiap sesi punya ~5 media items:
> - `sessions` table: 300 rows per event × 12 events/year = 3,600 rows/year
> - `media` table: 1,500 rows per event × 12 = 18,000 rows/year
> - Storage: 300 × 5 × ~3MB = **~4.5GB per event** (melebihi Free 500MB)

---

### 5. Media Storage (Google Cloud Storage) — ✅ AMAN (Grade: A)

GCS sudah handles scale. Tidak ada concern di sini.

- File serving via CDN-backed URLs
- No direct writes from web app (upload dari Desktop Mesin Kolong)
- `next/image` proxies through Vercel's CDN

---

### 6. Session Claiming (Write Operations) — ⚠️ RACE CONDITION (Grade: C+)

```typescript
// AccessSessionClient.tsx — Line 73-96
const handleClaim = async () => {
    const { error } = await supabase
        .from('sessions')
        .update({ user_id: user.id, is_claimed: true })
        .eq('id', id)
    // ❌ No WHERE is_claimed = false!
}
```

| Issue | Severity | Detail |
|---|---|---|
| **No atomic claim check** | 🔴 HIGH | Query tidak include `.eq('is_claimed', false)`. Dua user bisa claim sesi yang sama secara bersamaan |
| **No RLS enforcement** | 🟡 MEDIUM | Claim logic ada di client-side JavaScript. Tanpa RLS, user bisa manipulasi request |
| **No server-side claim** | 🟡 MEDIUM | Claim seharusnya di Server Action, bukan client-side Supabase call |

---

### 7. Authentication Middleware — ✅ AMAN (Grade: A)

After Phase 2A+ optimization:
- Public routes skip `getUser()` entirely → zero latency
- Only `/profile` and `/admin` trigger auth check
- Cookie-based SSR auth via `@supabase/ssr`

10/10 — tidak ada concern.

---

### 8. AdminEditProvider — ⚠️ MINOR (Grade: B)

```typescript
// ClientProviders.tsx — wraps ENTIRE app
<AdminEditProvider>
    {children}
    <EditModeToggle />
</AdminEditProvider>
```

| Issue | Severity | Detail |
|---|---|---|
| **Auth check on every page** | 🟡 MEDIUM | `AdminEditProvider` calls `supabase.auth.getUser()` on mount for ALL visitors (even non-admin). 400 visitors = 400 unnecessary auth calls |

---

## 🎯 Priority Fix Matrix

| # | Fix | Effort | Impact | Priority |
|---|-----|--------|--------|----------|
| 1 | **Upgrade Supabase to Pro** | 💰 $25/mo | Removes connection + storage limits | 🔴 P0 |
| 2 | **Server Action for claiming** | 🔧 2 hours | Fix race condition + security | 🔴 P0 |
| 3 | **AdminEditProvider lazy auth** | 🔧 30 min | Skip auth check for non-admin pages | 🟡 P1 |
| 4 | **Rate limit /access/[id]** | 🔧 1 hour | Prevent QR spam | 🟡 P1 |
| 5 | **Profile pagination** | 🔧 2 hours | Handle power users with many sessions | 🟢 P2 |

---

## 📈 Capacity Estimate (After Fixes)

| Metric | Free Plan | Pro Plan ($25/mo) |
|---|---|---|
| Concurrent QR scans | ~50 users max | ~200 users OK |
| Homepage traffic | ∞ (ISR cached) | ∞ (ISR cached) |
| Sessions per month | ~100 | ~10,000+ |
| Media storage | 500MB (~1 event) | 8GB (~17 events) |
| Monthly API calls | 500K (tight) | Unlimited |

---

## ✅ Kesimpulan

**Untuk 300+ sesi dan 400+ concurrent users:**

1. **Homepage/About/Partnership** → ✅ Siap. ISR handles ini dengan sempurna.
2. **QR Scan flow** → ⚠️ Butuh Supabase Pro plan. Free plan akan crash di 50+ concurrent scans.
3. **Claim mechanism** → 🔴 Ada race condition yang harus diperbaiki dengan Server Action + atomic update.
4. **Storage** → 🔴 Free plan 500MB tidak cukup. Butuh Pro (8GB) atau external storage.
5. **Admin tools** → ✅ Siap (low traffic by nature).

**Rekomendasi**: Upgrade ke Supabase Pro ($25/mo) + fix claim race condition = sistem siap untuk production scale.
