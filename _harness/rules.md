# Architectural Rules & Non-Negotiables

## 1. Zero Broken Image Policy
- **`/api/image` Resilience**: Must use safe dynamic loading (`loadSharp`) wrapped in try/catch. If native binary fails or processing errors occur, pipe raw image buffer or 302 redirect directly to Google Cloud Storage. Never throw unhandled exceptions or return HTTP 500 for images.
- **Client Fallbacks**: Media components (`AccessSessionClient`, profile viewers) must implement `onError` to fall back to raw master URLs (`item.url`).

## 2. Supabase Connection Pool Guard
- **Server Action Pooling**: Sesi claim and DB mutations MUST execute via Next.js Server Actions with atomic updates (`is_claimed = false`) to bypass Supabase Free Tier 50 concurrent connection spike limits.
- **Client Auth Calls**: Use `supabase.auth.getSession()` for lightweight local checks instead of triggering repeated `supabase.auth.getUser()` network round-trips.

## 3. Design System Integrity
- **Global Typography**: Bayon for display headings (one weight only, never `font-black`), Hanken Grotesk for everything else. Numbers use Hanken: Bayon's "1" reads as "I".
- **Softfile QR Claim (`/access/[id]`)**: Strictly follow the Editorial Anti-Slop design system (`/design-taste-frontend`): zero emojis, clean high-contrast actions, structured card hierarchy, calm badges.
- **Profile & Queue UI**: Same language as the public pages: navy, orange, Bayon headings, Hanken 15px+, targets 44px+, no hard shadows, glass or gradients. Keep the ticket's solid colour per proximity tier (`getProximityTierColor`), since the guide tells people to read it, and keep the `tour-*`, `bottom-nav-*` and `guide-*` ids the guide targets.
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

## 7. Queue Privacy
- **Public means venue-screen data only**: `fetchQueueStatus`, the SSE stream, `/api/queue/[eventId]/status` and the venue screen carry `PUBLIC_TICKET_COLUMNS` and nothing else. A ticket id or session id leads to someone's ticket and photos, so they are private too. The client finds its own ticket by `queue_number`.
- **Private columns and all ticket writes** go through `createQueueServerClient` (`src/lib/queue/queueAuth.ts`), after an owner or admin check in the route. Never read `queue_tickets` with `select("*")` as the anon role: the rules in `_harness/sql/queue-privacy.sql` refuse it.
- **Keep three lists in step** when a public column changes: `PUBLIC_TICKET_COLUMNS` in `queueFetchers.ts`, the `grant select` in `queue-privacy.sql`, and `scripts/verify_queue_privacy.mjs`.
- **Testing**: never write to the real database. The queue's server code can run against a local stand-in for Supabase by starting `next dev` with `NEXT_PUBLIC_SUPABASE_URL` pointed at it.

