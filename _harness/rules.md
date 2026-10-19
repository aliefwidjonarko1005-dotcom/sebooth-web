# Architectural Rules & Non-Negotiables

## 1. Zero Broken Image Policy
- **`/api/image` Resilience**: Must use safe dynamic loading (`loadSharp`) wrapped in try/catch. If native binary fails or processing errors occur, pipe raw image buffer or 302 redirect directly to Google Cloud Storage. Never throw unhandled exceptions or return HTTP 500 for images.
- **Client Fallbacks**: Media components (`AccessSessionClient`, profile viewers) must implement `onError` to fall back to raw master URLs (`item.url`).

## 2. Supabase Connection Pool Guard
- **Server Action Pooling**: Sesi claim and DB mutations MUST execute via Next.js Server Actions with atomic updates (`is_claimed = false`) to bypass Supabase Free Tier 50 concurrent connection spike limits.
- **Client Auth Calls**: Use `supabase.auth.getSession()` for lightweight local checks instead of triggering repeated `supabase.auth.getUser()` network round-trips.

## 3. Design System Integrity
- **Global Typography**: Poppins font mapped globally across `--font-poppins`, `--font-headline`, `--font-marker`, and `--font-sebooth`.
- **Softfile QR Claim (`/access/[id]`)**: Strictly follow the Editorial Anti-Slop design system (`/design-taste-frontend`): zero emojis, clean high-contrast actions, structured card hierarchy, calm badges.
- **Profile & Queue UI**: Maintain Graphic Brutalism (`hard-shadow-black`, solid contrast, crisp borders).
- **Homepage Slide Deck**: 100svh viewport locking with discrete gesture transitions (`translate3d`), no Lenis smooth-scroll interference on `/`.

## 4. Technical SEO Standards (DomainRank Compliance)
- **Token Density**: 3.0%–5.0% natural keyword token weight across all SEO articles in `src/data/articles.ts`.
- **Metadata Limits**: Meta title 40–60 characters; Meta description 120–160 characters; Exactly 1 `<h1>` per page.
- **Semantic Hierarchy**: H2 for section titles -> H3 for subheadings -> structured comparison tables -> JSON-LD schemas (`LocalBusiness`, `Article`, `FAQPage`, `BreadcrumbList`).
- **Audit Verification**: All SEO changes must pass `node scripts/verify_full_seo_audit.mjs` with 11/11 checks.

## 5. Deployment & Build Quality
- Run `npx tsc --noEmit` and ensure 0 TypeScript errors before committing.
- Ensure production build (`npm run build`) compiles cleanly.

## 6. Zero Redirect Policy on Claim Session Page (`/access/[id]`)
- **Strict Invariant — Stay on Page**: Pengguna yang membuka atau mengklaim sesi di `/access/[id]` WAJIB TETAP berada di `/access/[id]`.
- **Dilarang Redirect ke My Photos (`/profile`)**: Tidak boleh ada auto-redirect, timer redirect, atau redirect otomatis setelah klaim sesi berhasil. Pengguna harus tetap di halaman klaim agar dapat langsung mengunduh softfile.

