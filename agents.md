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
│   │   ├── about/page.tsx           # About Us page (company story)
│   │   ├── access/[id]/page.tsx     # QR Access Point (session viewer + claimer)
│   │   ├── admin/page.tsx           # Admin CMS Panel (content, pricing, IG, news, admins)
│   │   ├── login/page.tsx           # Login page (email/password + claim flow)
│   │   ├── partnership/page.tsx     # Partnership page (EO/WO inquiry form)
│   │   ├── profile/page.tsx         # User gallery (My Photos — strip, GIF, live, photos)
│   │   └── register/page.tsx        # Registration page (signup + session claim)
│   ├── components/
│   │   ├── features/
│   │   │   └── FrameEditorModal.tsx  # Canvas-based strip frame editor modal
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Site header (responsive nav + mobile hamburger)
│   │   │   ├── Footer.tsx            # Site footer (4-column: brand, nav, social, office)
│   │   │   └── LayoutShell.tsx       # Conditional layout (excludes header/footer on auth/app pages)
│   │   ├── sections/                 # Homepage section components (all receive server-side data via props)
│   │   │   ├── Hero.tsx              # Hero banner (cinematic fullscreen + CTA)
│   │   │   ├── About.tsx             # About teaser section (links to /about)
│   │   │   ├── Product.tsx           # Product showcase (Standard, Deluxe, Glamour booths)
│   │   │   ├── Pricing.tsx           # Pricing tables (Unlimited + Quota packages)
│   │   │   ├── Testimonials.tsx      # Customer testimonials (3-column grid)
│   │   │   ├── Gallery.tsx           # Event gallery (server-fetched, filterable masonry grid)
│   │   │   ├── InstagramFeed.tsx     # Instagram feed (server-fetched posts, client-side embed script)
│   │   │   ├── FAQ.tsx               # FAQ accordion (animated expand/collapse)
│   │   │   ├── News.tsx              # Latest news grid (server-fetched, published items)
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
│   └── middleware.ts                # Auth middleware (protects /profile, /admin)
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

- **ISR (Incremental Static Regeneration)**: Homepage revalidates every 60 seconds. Within that window, all visitors receive instant cached HTML from Vercel Edge.
- **Server-side parallel fetching**: `page.tsx` uses `Promise.all()` to fetch `site_content`, `instagram_posts`, `news`, `gallery`, and `section_visibility` in parallel from Supabase.
- **Section visibility**: Resolved server-side — hidden sections are not sent to the client at all, saving bandwidth and render time.
- **Cache headers**: Static assets (fonts, images, JS/CSS bundles) served with `Cache-Control: public, max-age=31536000, immutable`.
- **Image optimization**: `next.config.ts` whitelists Supabase Storage and Google Cloud Storage domains for `next/image`.
- **Security headers**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: on`, `Permissions-Policy` locked down.

## Changelog & Continuous Updates (AI Roadmap)

- **April 2026 (Phase 1.5 - Desktop Mesin Kolong Integration)** ✅: The physical Photobooth application now acts as a headless "Mesin Kolong". Desktop Kiosk QR Codes redirect visitors directly to `/access/[id]` for the Photo Claim Mechanism.
- **April 2026 (Phase 2A - Scalability)** ✅: Implemented ISR with 60s revalidation on homepage. Refactored Gallery, InstagramFeed, and News from client-side fetching to server-side props. Added `next.config.ts` with image optimization (Supabase + GCS domains), cache headers for static assets, and security headers. Expanded `revalidateSiteContent()` to cover `/`, `/about`, `/partnership`. Result: ~99% reduction in Supabase API calls (from ~1,200 per 300 visitors to ~5).
- **April 2026 (Phase 2B - Inline Visual Editor)** ✅: Implemented Wix-like live Inline Visual Editor. Super Admins click textual/image elements directly on the live site via `EditableText` / `EditableImage` overlays. Changes save immediately to Supabase `site_content` table. Includes `LayoutEditorModal` (split-panel editor with iframe preview, section visibility, gallery management, zoom 10-300%), `IframeEditBridge` (click-to-edit in iframe via postMessage), and `TextEditModal`.
