# Project: Sebooth Website (Web Portal)

## Purpose

A web portal designed for Sebooth photobooth users to access, view, and download their digital assets (softfiles) via QR code redirection from the physical photobooth stations. Also serves as the company's public-facing website with product information, pricing, gallery, partnership program, and an admin CMS panel to manage all website content.

## AI Agent Rules

- **CRITICAL**: You (the AI Agent) MUST ALWAYS update this `agents.md` file whenever there is a new user prompt, a new feature built, or any significant code changes. This is to guarantee that `agents.md` is always up-to-date and serves as the absolute single source of truth for the project context.

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **UI/Logic**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **Backend/Database**: Supabase (Auth, Database, Storage)
- **Media Storage**: Google Cloud Storage (photos, videos, GIFs)
- **Auth Library**: `@supabase/ssr` (cookie-based SSR auth)
- **Caching**: ISR (Incremental Static Regeneration, 60s revalidation)
- **Utilities**: `clsx`, `tailwind-merge`

## Directory Structure

```
sebooth-website/
├── public/                          # Static assets
│   ├── frames/                      # SVG frame overlay templates for strip editor
│   ├── logo-text-black.png          # Brand logo
│   └── *.svg                        # Default Next.js icons
├── src/
│   ├── app/                         # App Router pages and layouts
│   │   ├── layout.tsx               # Root layout (Inter + custom Sebooth font)
│   │   ├── globals.css              # Global CSS (Tailwind 4 imports)
│   │   ├── page.tsx                 # Homepage (ISR, server-side data fetching)
│   │   ├── actions.ts               # Server Actions (revalidateSiteContent, revalidateSpecificPage)
│   │   ├── about/page.tsx           # About Us page (ISR Server Component + CMS + SEO)
│   │   ├── access/[id]/page.tsx     # QR Access Point (Server Component + generateMetadata)
│   │   ├── admin/page.tsx           # Admin CMS Panel (content, pricing, IG, news, admins)
│   │   ├── login/page.tsx           # Login page (email/password + claim flow)
│   │   ├── partnership/page.tsx     # Partnership page (ISR Server Component + CMS + SEO)
│   │   ├── profile/page.tsx         # User gallery (Feed + Gallery dual-mode view)
│   │   ├── profile/[sessionId]/page.tsx # Session detail (tab-based strip/GIF/live/photos view)
│   │   └── register/page.tsx        # Registration page (signup + session claim)
│   ├── components/
│   │   ├── features/
│   │   │   ├── FrameEditorModal.tsx  # Canvas-based strip frame editor modal
│   │   │   └── AccessSessionClient.tsx # Client component for /access/[id] (claim UI + auth)
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Site header (responsive nav + mobile hamburger)
│   │   │   ├── Footer.tsx            # Site footer (4-column: brand, nav, social, office)
│   │   │   └── LayoutShell.tsx       # Conditional layout (excludes header/footer on auth/app pages)
│   │   ├── sections/                 # Homepage section components (all receive server-side data via props)
│   │   │   ├── Hero.tsx              # Hero banner (cinematic fullscreen + CTA)
│   │   │   ├── About.tsx             # About teaser section (links to /about)
│   │   │   ├── AboutContent.tsx      # Client component for /about page (CMS-driven, Framer Motion)
│   │   │   ├── Product.tsx           # Product showcase (Standard, Deluxe, Glamour booths)
│   │   │   ├── Pricing.tsx           # Pricing tables (Unlimited + Quota packages)
│   │   │   ├── Testimonials.tsx      # Customer testimonials (3-column grid)
│   │   │   ├── Gallery.tsx           # Event gallery (server-fetched, next/image, masonry grid)
│   │   │   ├── InstagramFeed.tsx     # Instagram feed (server-fetched posts, client-side embed script)
│   │   │   ├── FAQ.tsx               # FAQ accordion (animated expand/collapse)
│   │   │   ├── News.tsx              # Latest news grid (server-fetched, next/image)
│   │   │   ├── PartnershipContent.tsx # Client component for /partnership page (CMS-driven)
│   │   │   └── Location.tsx          # Location/map section (studio address)
│   │   └── ui/
│   │       └── FloatingCTA.tsx       # Floating WhatsApp button
│   ├── lib/
│   │   ├── supabase.ts              # Supabase browser client factory
│   │   ├── serverSupabase.ts        # Server-side Supabase client + ISR data fetchers
│   │   ├── useSiteContent.ts        # parseJsonContent() utility for CMS JSON fields
│   │   ├── useSectionVisibility.ts  # Client-side section visibility hook (fallback)
│   │   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
│   ├── types/
│   │   └── database.ts              # TypeScript interfaces (SessionData, MediaItem)
│   └── middleware.ts                # Auth middleware (optimized: skips public routes)
├── .env.local                       # Environment variables (Supabase URL/keys, admin emails)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

## Design System

- **Color Palette**:
  - Primary Dark: `#1A1A1A` (text & backgrounds)
  - Primary Green: `#0F3D2E` (brand accent, CTAs)
  - Gold Accent: `#D4AF37` (premium highlights)
  - Light Background: `#F9F9F9`
  - Neutral Gray: `#E5E5E5` / `#EAEAEA`
- **Typography**:
  - Body: Inter (Google Font, `--font-sans`)
  - Display/Brand: Sebooth (custom local font, `--font-sebooth`)

## Supabase Database Tables

| Table              | Purpose                                           |
|--------------------|---------------------------------------------------|
| `sessions`         | Photobooth session records (event name, user link, claim status) |
| `media`            | Media files linked to sessions (photos, GIFs, videos, strips) |
| `site_content`     | CMS key-value content for homepage sections       |
| `instagram_posts`  | Instagram post URLs for embed feed section         |
| `news`             | News/announcements managed via admin panel         |
| `admins`           | Admin user registry (email + super admin flag)     |

## Authentication & Authorization

- **Provider**: Supabase Auth (email/password)
- **Middleware**: SSR cookie-based auth via `@supabase/ssr`; protects `/profile` and `/admin` routes (redirects unauthenticated users to `/login`)
- **Admin Access**: Dual validation — environment variable (`NEXT_PUBLIC_ADMIN_EMAILS`) + `admins` DB table; super admins can invite other admins
- **Session Claiming**: QR scan → `/access/[id]` → auto-claim (if logged in) or redirect to `/register?claim=[id]` or `/login?claim=[id]`

## Key Features

1. **Landing Page (Homepage)**: Full company website with 10 sections — Hero, About, Product, Pricing, Testimonials, Gallery, Instagram Feed, FAQ, News, Location. All data fetched server-side with ISR (60s revalidation).
2. **QR Access Point** (`/access/[id]`): Direct link from QR code at photobooth; shows session preview, handles auto-claim for logged-in users, and prompts registration/login for anonymous users.
3. **User Authentication** (`/login`, `/register`): Email/password auth with integrated session claiming flow (via `?claim=[id]` query parameter).
4. **User Gallery** (`/profile`): Dual-mode photo gallery — **Feed View** (vertical scroll of all sessions as Instagram-style cards with strip thumbnails, media indicators, and "See More" CTA) and **Gallery View** (2-column grid of all photo strips). Toggle via grid icon in nav bar.
5. **Session Detail** (`/profile/[sessionId]`): Single-session deep view with 4 tabs — Photo Strip (with frame template generator), GIF, Live Photo (video), and individual Photos; all with download functionality.
5. **Photo Strip Generator**: Client-side canvas rendering of photo strips with multiple frame templates (Classic White, Night Edition, Wedding Elegant); carousel navigation between templates.
6. **Frame Editor Modal**: Advanced canvas-based frame compositor modal for applying SVG frame overlays to raw photos.
7. **About Page** (`/about`): Company narrative (origin story, vision & mission with numbered steps).
8. **Partnership Page** (`/partnership`): B2B page for Event Organizers & Wedding Organizers with benefits overview and inquiry form.
9. **Admin CMS Panel** (`/admin`): Full content management with 5 tabs — Site Content, Pricing, Instagram Posts, News, and Admin Management (super admin only).
10. **Inline Visual Editor**: Wix-like live editing system — admins click text/images directly on the live site to edit. Components: `EditableText`, `EditableTextAdvanced`, `EditableImage`, `LayoutEditorModal` (split-panel with iframe preview), `IframeEditBridge`, `TextEditModal`, `SectionVisibilityControl`, `GalleryMediaEditor`.
11. **Instagram Feed Section**: Dynamic Instagram post embeds, server-side fetched from Supabase and passed as props.
12. **Floating WhatsApp CTA**: Persistent WhatsApp floating button on public pages.
13. **Responsive Layout Shell**: Conditional header/footer rendering (excluded on auth, profile, admin, and access pages).

## Coding Conventions

- Use Functional Components with TypeScript.
- Follow App Router paradigms (Server Components by default, `'use client'` for interactive pages).
- Utility-first CSS with Tailwind 4.
- Modular component design (`sections/`, `layout/`, `features/`, `ui/`, `admin/`).
- Framer Motion for all animations (entry animations, tab transitions, accordion, modals).
- `cn()` helper for conditional class merging.
- Indonesian language for user-facing UI strings (mixed with English for professional sections).
- **Data fetching pattern**: Server Components fetch data via `serverSupabase.ts` functions → pass as `initialData` / `initialXxx` props to `'use client'` section components. Never fetch Supabase data in client-side `useEffect` for public pages.
- **Cache invalidation**: After admin edits, call `revalidateSiteContent()` server action to purge ISR cache.

## Scalability Architecture

- **ISR (Incremental Static Regeneration)**: Homepage, About, and Partnership pages revalidate every 60 seconds. All visitors within that window get instant cached HTML from Vercel Edge.
- **Server-side parallel fetching**: `page.tsx` uses `Promise.all()` to fetch `site_content`, `instagram_posts`, `news`, `gallery`, and `section_visibility` in parallel from Supabase.
- **Server-Side Session Fetching & Claiming**: `/access/[id]` fetches session data server-side via `fetchSessionById()`. The claim mechanism is entirely handled via **Next.js Server Actions (`claimSession`)** using `@supabase/ssr` cookies. This ensures nuclear resilience by inherently batching Supabase API requests via Vercel pool, completely avoiding the 50 concurrent connection leak in Supabase Free Tier. This also features an atomic DB claim update to prevent race conditions.
- **Lazy Authentication Fetch**: Context providers (`AdminEditProvider.tsx`) and components on public pages use `supabase.auth.getSession()` (synchronous zero-latency local check) instead of `supabase.auth.getUser()` (heavy API network check). Unauthenticated visitors trigger 0 API calls for auth.
- **Section visibility**: Resolved server-side — hidden sections are not sent to the client at all, saving bandwidth and render time.
- **Middleware optimization**: Auth check (`supabase.auth.getUser()`) only runs on protected routes (`/profile`, `/admin`). Public routes skip middleware entirely for zero-latency routing.
- **Cache headers**: Static assets (fonts, images, JS/CSS bundles) served with `Cache-Control: public, max-age=31536000, immutable`.
- **Image optimization**: `next.config.ts` whitelists Supabase Storage and Google Cloud Storage domains for `next/image`. Gallery and News sections use `next/image` with automatic WebP/AVIF conversion.
- **Security headers**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: on`, `Permissions-Policy` locked down.
- **SEO metadata**: All public pages export `Metadata` or `generateMetadata()` with title, description, and Open Graph tags.

## Changelog & Continuous Updates (AI Roadmap)

- **April 2026 (Phase 1.5 - Desktop Mesin Kolong Integration)** ✅: The physical Photobooth application now acts as a headless "Mesin Kolong". Desktop Kiosk QR Codes redirect visitors directly to `/access/[id]` for the Photo Claim Mechanism.
- **April 2026 (Phase 2A - Scalability)** ✅: Implemented ISR with 60s revalidation on homepage. Refactored Gallery, InstagramFeed, and News from client-side fetching to server-side props. Added `next.config.ts` with image optimization (Supabase + GCS domains), cache headers for static assets, and security headers. Expanded `revalidateSiteContent()` to cover `/`, `/about`, `/partnership`. Result: ~99% reduction in Supabase API calls (from ~1,200 per 300 visitors to ~5).
- **April 2026 (Phase 2A+ - Scalability Continuation)** ✅: Converted `/about` and `/partnership` from `"use client"` to ISR Server Components with CMS integration (`about_page` / `partnership_page` sections in `site_content`). Converted `/access/[id]` to Server Component with server-side session fetch + `generateMetadata()` for dynamic SEO. Optimized middleware to skip `getUser()` on public routes. Migrated Gallery and News sections from `<img>` to `next/image` for automatic WebP/AVIF. Added SEO metadata exports to About, Partnership, and Access pages.
- **April 2026 (Phase 2A++ - Enterprise Load Balancing Fix)** ✅: Refactored Session Claim function into a Next.js Server Action with an atomic SQL condition (`eq('is_claimed', false)`) to eliminate double-claim race conditions and bypass standard Supabase Free Tier limitations during a 400+ user traffic spike via pooling. Changed unused API-heavy `getUser()` checks in client contexts (like `AdminEditProvider` and `AccessSessionClient`) to `getSession()` to eliminate thousands of 4xx network calls.
- **April 2026 (Phase 2B - Inline Visual Editor)** ✅: Implemented Wix-like live Inline Visual Editor. Super Admins click textual/image elements directly on the live site via `EditableText` / `EditableImage` overlays. Changes save immediately to Supabase `site_content` table. Includes `LayoutEditorModal` (split-panel editor with iframe preview, section visibility, gallery management, zoom 10-300%), `IframeEditBridge` (click-to-edit in iframe via postMessage), and `TextEditModal`.
- **April 2026 (Phase 2C - Mobile UX Perfection)** ✅: Perfecting UI/UX flows specifically for handheld devices. Patched: Header menu lock-body overlay, Hero component viewport height responsiveness (`svh`), Profile strip canvas lazy-rendering (to preserve CPU/Ram on low-end androids), and strictly hiding the Split UI Layout Editor module for small screens.
- **April 2026 (Phase 2D - Gallery Enhancement, News Detail & Section Images)** ✅: Added gallery metadata editor (editable event names, categories, video upload support). Created `/news/[id]` detail page with ISR + dynamic SEO. News cards now link to detail pages with "Baca Selengkapnya" CTA. News image upload with "Sync to Gallery" checkbox auto-adds news images to gallery. Replaced placeholder images in About, Product, Location sections with `EditableImage` components. Added `fetchNewsById()` server fetcher. Updated `fetchGalleryImages()` with video file type detection (`mediaType` field).
- **April 2026 (Phase 2E - Image Crop Modal & Full Inline Editing)** ✅: Added `ImageCropModal` canvas-based image cropper (drag-to-pan, zoom, aspect ratio) that appears before upload in `EditableImage`. Created `EditableArrayItemText` component for inline editing of JSON array items. Made ALL text on the website inline-editable in admin mode: Product items (name, tagline, description), Pricing features & packages (prices, durations), Testimonials (quotes, authors, roles), FAQ (questions, answers), Footer CTA, Header CTA.
- **June 2026 (Phase 3A - Queue Management System)** ✅: Built full digital queue system for photobooth visitors. Key features: (1) `/queue/[eventId]` — consumer takes a queue number via web without requiring login (optional WA number for notifications); (2) `/queue/[eventId]/ticket/[ticketId]` — live ticket display with SVG countdown ring, position-from-front, SSE real-time updates with auto-reconnect + 10s polling fallback, Web Audio API notification sound when called; (3) `/queue/[eventId]/display` — fullscreen TV display mode for venue monitors; (4) Webhook API `/api/queue/webhook` for desktop photobooth app integration (POST `session_started`/`session_completed` events); (5) Operator Dashboard tab in `/admin` — create events, call next, skip, complete, reset, QR code generator, TV display link; (6) SSE broadcast system via `/api/queue/stream/[eventId]`; (7) WhatsApp notifications via Fonnte API (configurable `FONNTE_API_KEY`) sent at position threshold (default: 2 from front); (8) Rolling average session duration calculation (updated on each `session_completed` webhook); (9) Ticket auto-link to `sessions` table via `queue_ticket_id` foreign key. New DB tables: `queue_events`, `queue_tickets`. New env vars: `QUEUE_WEBHOOK_SECRET`, `FONNTE_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
- **June 2026 (Phase 3B - Auth-Gated Queue)** ✅: Queue system now requires login/registration. Anonymous queue tickets are no longer supported. Key changes: (1) Register page enhanced with `full_name` + `phone_number` fields stored in Supabase `user_metadata`; (2) Login & Register pages support `?redirect=` query param for queue flow; (3) `/queue/[eventId]` now checks auth server-side — unauthenticated users see `QueueAuthGate` component with login/register choice; (4) `QueueJoinForm` auto-fills user data from account (no manual input); (5) Join API validates auth and extracts user data from metadata; (6) WhatsApp/Fonnte notification system completely removed from SSE stream; (7) `joinQueue()` now requires `userId` as mandatory parameter.
- **June 2026 (Phase 3C - Web Push + 4-Tier Proximity + Audio Cues)** ✅: Replaced Fonnte WA notifications with Web Push Notifications + visual/audio feedback. Key features: (1) Service Worker (`public/service-worker.js`) for push notification display + click-to-open; (2) Push subscription flow via `pushSubscription.ts` client utilities + `/api/queue/push/subscribe` endpoint; (3) Server-side push sender (`pushSender.ts`) using `web-push` library with VAPID keys; (4) 4-tier proximity system (`QueueProximityTier`): `waiting` 🟢 (5+), `approaching` 🟡 (3-4), `preparing` 🟠 (1-2), `your_turn` 🔴 (called); (5) Redesigned `QueueStatusBadge` with tier-specific colors, pulse animations, shimmer effects; (6) Enhanced `QueueEstimateTimer` with tier-colored countdown ring + detailed estimate breakdown (who's shooting, per-session calculation); (7) Dynamic background gradients on ticket page per tier; (8) Distinct Web Audio API chimes per tier transition: single chime (approaching), double urgent (preparing), triple ascending (your_turn); (9) Webhook sends push notifications on proximity changes + "Foto sudah siap!" on completion; (10) Push toggle button on ticket page. New DB table: `push_subscriptions`. New env vars: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`. New columns on `queue_tickets`: `push_preparing_sent`, `push_approaching_sent`.
- **June 2026 (Phase 3D - QR Scan Session Linking + Auto-Claim)** ✅: Users scan QR code from photobooth screen to link session to their account. Key features: (1) `QRScannerModal` component with camera access via `getUserMedia`, native `BarcodeDetector` API with `jsQR` fallback, viewfinder overlay with animated scan line, torch toggle, success animation; (2) `/api/queue/generate-session-token` — photobooth app generates time-limited QR token (base64url, 10min expiry); (3) `/api/queue/link-session` — validates token, finds user's active ticket, links session to user account, broadcasts SSE update; (4) "SCAN QR UNTUK MULAI" button appears on ticket page when status is `called`; (5) Webhook `session_completed` auto-claims photos to user via `user_id` on ticket → `sessions.user_id` update; (6) Push notification "Foto Kamu Sudah Siap!" sent on auto-claim completion. New column on `queue_tickets`: `session_id`.
- **June 2026 (Phase 3E - Profile Queue Integration)** ✅: Active queue tickets displayed on user's profile page. Key features: (1) `ActiveQueueCard` component shows ticket number, event name, booth, status badge, and links to ticket detail; (2) Profile page fetches active tickets on init and renders them in a dark gradient card above photo gallery; (3) `fetchUserActiveTickets.ts` server-side fetcher for user-specific tickets.
- **June 2026 (Phase 3F - Auto-Advance Queue + Push Notification Fix)** ✅: Queue now fully automated — no manual operator "Next" click needed. Key changes: (1) Webhook `session_completed` now **auto-calls next waiting ticket** (sets status to `called`, sets `called_at` + 5min `expires_at`); (2) Auto-called user receives urgent push notification "GILIRAN KAMU! 🔴" with `requireInteraction: true` and vibrate pattern; (3) **VAPID keys generated and configured** in `.env.local` — previously missing, which caused all push notifications to silently fail; (4) Fixed VAPID subject format from `https://` URL to `mailto:` (required by web-push spec); (5) `QueueTicketDisplay` now **auto-prompts for notification permission** on mount instead of only subscribing when already granted; (6) Operator manual `call_next` action also sends push notification + proximity pushes; (7) Refactored `sendProximityPushNotifications` to use `createServiceClient()` instead of redundant dynamic imports; (8) Fixed `cookieStore.set()` try-catch in operator action route; (9) Fixed `Permissions-Policy` header to allow `camera=(self)` for QR scanner. New env vars configured: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_SITE_URL`, `QUEUE_WEBHOOK_SECRET`. Webhook response now includes `autoCalledNext: boolean` field.
- **June 2026 (Phase 3G - Profile UI Redesign & Brutalism Integration)** ✅: Completely redesigned the `My Photos` (`/profile`) page to adopt the main website's Graphic Brutalism Design System (`bg-white`, `text-primary`, `hard-shadow-black`, strict square borders, `marker-font`). Removed the "Edit Page" (`EditModeToggle`) floating button from the profile page to keep the UI clean for admins and users. Updated `ActiveQueueCard` to match the brutalist aesthetic (squared corners, dark borders, bold solid text) for seamless integration into the redesigned profile layout.
- **June 2026 (Phase 3H - Profile Feed + Gallery Redesign)** ✅: Complete UX overhaul of `/profile` from single-session tab viewer to Instagram-inspired dual-mode. Key changes: (1) **Feed View** — all sessions displayed as vertical-scroll cards (`SessionFeedCard`) with strip hero image, media type indicators (GIF/Live/Photos count), event name, date, and "See More" CTA linking to detail page; (2) **Gallery View** — 2-column grid of all photo strips (`GalleryGrid`) with event overlay and tap-to-navigate; (3) **View toggle** via grid/list icon in top nav bar; (4) **Blue nav bar** (`bg-primary`) with white icons — mobile shows icon-only (Home, Grid toggle, Logout), desktop adds text labels; (5) Removed greeting ("Halo, username"), session dropdown, and bottom tab bar from main profile page; (6) **New `/profile/[sessionId]` page** preserves original tab-based view (Strip/GIF/Live/Photos) scoped to one session with back navigation; (7) **Golden ratio typography** scale applied across all profile pages; (8) `EditModeToggle` updated with `startsWith("/profile")` to hide on all profile sub-routes. New components: `SessionFeedCard.tsx`, `GalleryGrid.tsx`.
- **June 2026 (Phase 3I - Safari Download Proxy & Queue Brutalism)** ✅: Fixed a critical iOS Safari bug where downloading media silently failed due to async Blob/CORS restrictions by building a custom API proxy (`/api/download/route.ts`) that streams the file with a `Content-Disposition: attachment` header, forcing the native iOS download prompt. Completely redesigned the Queue module (`QueueAuthGate`, `QueueJoinForm`, `QueueTicketDisplay`, `QueueStatusBadge`, `QueueEstimateTimer`) to follow the Graphic Brutalism design system (`bg-white`, `border-4 border-black`, `hard-shadow-black`, strict block colors, marker fonts), replacing the old sleek dark glassmorphism theme.
