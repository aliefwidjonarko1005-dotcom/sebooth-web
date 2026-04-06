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
│   │   ├── profile/page.tsx         # User gallery (My Photos — strip, GIF, live, photos)
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
4. **User Gallery** (`/profile`): Personal photo collection with 4 tabs — Photo Strip (with frame template generator), GIF, Live Photo (video), and individual Photos; all with download functionality.
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
