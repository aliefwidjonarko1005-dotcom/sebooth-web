# Project: Sebooth Website (Web Portal & Kiosk Harness)

## Purpose & Scope
Web portal for Sebooth Photobooth users to access, view, and download digital assets (softfiles) via QR code redirection from physical photobooths. Functions as the public website with product showcases, interactive pricing, dynamic frame templates, 54-article SEO content hub, live digital queue system, and full admin CMS panel.

---

## Quick Task Routing
Before modifying code, load the relevant module context from `_harness/routing.md`:

| Task Area | Key Files & Routes | Details |
|---|---|---|
| **SEO & Articles** | `src/data/articles.ts`, `src/app/artikel/`, `LocalBusinessSchema.tsx` | 54 long-form E-E-A-T articles, 3-5% keyword density, JSON-LD schemas |
| **QR Claim & Softfiles** | `src/app/access/[id]/`, `AccessSessionClient.tsx`, `api/image/route.ts` | Editorial design, crash-proof Sharp loader, 1-tap Google Review widget |
| **Digital Queue System** | `src/app/queue/`, `queueActions.ts`, `pushSender.ts`, `QueueOperatorTab.tsx` | Auth-gated queue, Web Push, proximity tier, scan QR session link |
| **Slide Deck Landing** | `src/components/slides/`, `landingSlides.ts`, `Product.tsx`, `FramesSlider.tsx` | 6-slide vertical discrete transitions, 100svh lock, Coverflow 3D |
| **Admin Operations** | `src/app/admin/`, `SessionLookupTab.tsx`, `api/admin/session-lookup/` | Session inspector table, pagination, search, frame & news CMS |

*See full routing instructions in [_harness/routing.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/routing.md).*

---

## Technical Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling & FX**: Tailwind CSS 4, Framer Motion, Lucide React
- **Typography**: Poppins (Google Font globally mapped to headline, marker, and body)
- **Database & Auth**: Supabase (`@supabase/ssr` cookie-based SSR auth)
- **Media Storage**: Google Cloud Storage + Supabase Storage
- **Push Notifications**: Web Push (`web-push` library with VAPID keys) + Service Worker
- **Caching**: ISR (60s revalidation) on static routes, `Cache-Control: immutable` on media

---

## Supabase Tables
| Table | Description |
|---|---|
| `sessions` | Photobooth sessions (event name, user link, claim status, timestamps) |
| `media` | Media items linked to sessions (photos, strips, GIFs, live videos) |
| `queue_events` | Live event configurations for digital queuing |
| `queue_tickets` | Active and completed queue tickets, status, proximity flags |
| `push_subscriptions` | Web Push endpoint credentials and VAPID auth tokens |
| `site_content` | Dynamic CMS key-value JSON content |
| `admins` | Admin access registry with super admin authority |

---

## Critical Guardrails & Invariants
- **Zero Broken Images**: `/api/image` dynamically loads Sharp with safe fallback to raw stream or direct Google Cloud Storage redirect. Client media items must implement `onError` fallbacks.
- **Connection Pool Safety**: Session claiming uses Next.js Server Actions (`claimSession`) with atomic queries (`eq('is_claimed', false)`) to avoid Supabase connection pool exhaustion during traffic surges.
- **Design Integrity**:
  - Softfile Claim (`/access/[id]`): Editorial Anti-Slop aesthetic (zero emojis, calm contrast, structured card hierarchy).
  - Profile & Queue: Graphic Brutalism (`hard-shadow-black`, high contrast, crisp borders).
  - Homepage: 100svh viewport locking, discrete slide gestures (`translate3d`), no Lenis interference on `/`.
- **SEO Standards**: 3.0%–5.0% token weight density, 40–60 char titles, 120–160 char descriptions, single H1, and full schema compliance validated via `node scripts/verify_full_seo_audit.mjs`.
- **Zero Redirect on Claim Page (`/access/[id]`)**: Pengguna yang membuka atau mengklaim sesi foto WAJIB 100% tetap berada di halaman `/access/[id]`. Dilarang keras melakukan auto-redirect ke `/profile` (My Photos).

*Detailed rules: [_harness/rules.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/rules.md).*

---

## Milestone History (Consolidated)

- **Phase 1: Physical Kiosk Integration (Mesin Kolong)**: Desktop kiosk QR codes redirecting to `/access/[id]` for softfile claiming.
- **Phase 2: Scalability, ISR & Inline Visual CMS**: Migrated public pages to ISR (60s revalidation), reduced API calls by 99%, added live visual text & image editor for admins, image cropping modal.
- **Phase 3: Digital Queue System & Profile Overhaul**: Auth-gated digital queue (`/queue/[eventId]`), Web Push notifications with 4-tier proximity, auto-advance, Safari download proxy, and brutalist dual-mode `/profile` gallery.
- **Phases 4–7: Presentation Slide Deck Landing Page**: Full-screen 6-slide deck engine (`SlideDeckLanding.tsx`), 3D spatial Coverflow services carousel (`Product.tsx`), 35-item photostrip marquee (`FramesSlider.tsx`), interactive pricing package selector (`PricingSlider.tsx`), and FAQ accordion folder stack (`FaqStackSlider.tsx`).
- **Phase 8A: 39-Article SEO Hub & DomainRank Compliance**: Published 39 long-form E-E-A-T articles across 6 clusters (Widpur Vending Machine, Tembalang, Undip Mahasiswa, Concert Vendors, Church Christmas, Semarang Murah) with 100% pass on 11-point SEO audit.
- **Phase 8B: Editorial QR Softfile Claim Overhaul**: Anti-slop redesign of `/access/[id]`, 1-tap Google Review 5-star shortcut (`GoogleReviewPromptCard.tsx`), and crash-proof Sharp image loader in `/api/image`.
- **Phase 8C: Admin Session Lookup Inspector**: List and grid views, multi-field filters, sorting, server-side pagination across 3,460+ sessions.
- **Phase 8D: AGENTS.md Harness Migration**: Cleaned and modularized context into `_harness/` (routing, rules, gc) and archived legacy micro-changelog to `_harness/changelog_archive.md`.
- **Phase 8E: Skills Ecosystem Expansion**: Installed and synchronized complete suite of 24 skills from `taste-skill` (Leonxlnx), `ui-ux-pro-max-skill` (nextlevelbuilder), and synthesized `prompt-engineering` from DAIR.AI.
- **Phase 8F: Speedometer Experience Rating Dial & Instagram Profile Gate**: Built interactive 4-mood speedometer dial (BAD, UGH, OK, GOOD) at `/access/[id]/review` (`ExperienceGaugeReview.tsx`), gated "Unduh Semua Media" to redirect first-time downloaders to review, provided Instagram `@sebooth.id` profile redirect and clean return flow to re-inspect and download photos without auto-download interruptions.
- **Phase 8G: Google Stitch MCP Integration & Interactive Roulette Arc Wheel**: Connected Google Stitch MCP server via `mcp_config.json`, extracted designs from project `Sebooth Claim Mobile App` (`1619999779865531677`), upgraded `/access/[id]/review` (`ExperienceGaugeReview.tsx`) with 5-mood interactive Roulette Swipe Arc (BURUK, KURANG, CUKUP, BAGUS, KEREN!), animated expressive SVG vector faces, spring physics, dynamic pointer gestures, indicator needle tilt, and haptic feedback.
- **Phase 8H: 3D Clay Inflated Periwinkle Pill Button**: Recreated floating softfile download button based on user reference styling (`ClayPillButton.tsx` in `/access/[id]`), implementing authentic matte 3D claymorphic cushion gradient (`#918DF8` to `#635FE6`), multi-layer inner clay volume highlights, signature colored violet-blue glow shadow (`rgba(98, 94, 228, 0.55)`), generous breathing room (15px 40px), clean inline white download icon, and simplified single-line typography "Download All Photo". Removed the Google Review banner above the gallery to streamline user focus directly to their softfile media.
- **Phase 8I: Gated Google Review Roulette & Auto-Download Flow**: Implemented seamless conversion funnel: clicking "Download All Photo" gates first-time downloaders to `/access/[id]/review` (`ExperienceGaugeReview.tsx`), where users select 1-5 stars on the Stitch roulette arc (BURUK to KEREN!). Submitting saves the rating, copies review text to clipboard, directly launches Google Review (`placeid=ChIJMw7u0BePcC4RfJlnOavYI6k`), renders Stage 2 confirmation, and redirects back to `/access/[id]?reviewed=true&download=true` with a top toast notification and automatic batch download of all softfile photos and videos.
- **Phase 8J: 15-Article Anti-Slop SEO Deployment (Photobooth Semarang & Tembalang)**: Deployed 15 high-intent, anti-slop E-E-A-T articles (artikel-40 to artikel-54) targeting Google Trends search queries for Photobooth Semarang and Photobooth Tembalang (pricing breakdown, wedding ballroom, campus BEM expo, graduation Muladi Dome, corporate gathering, sweet 17, photostrip 2x6 vs 4R, Canva frame tutorial, and outdoor lighting). Achieved 100% pass rate on 11-point DomainRank SEO audit across all 54 articles with 3.0%–5.0% natural keyword token density.

- **Phase 8K: Download-First Review Funnel & Interactive Guide v2**: Removed the review gate on `/access/[id]`: files download first, then a bottom sheet asks for a rating (neutral roulette dial), a Google Review (optional topic chips, copy only on tap) and an Instagram follow (`src/config/social.ts`). Replaced `InteractiveTour` with a shared guide engine (`src/components/guide/`) with animated spotlight, gesture glyphs and "do it to continue" steps on claim, profile, queue, ticket and frames pages, plus a swipe cue on the homepage.

*Exhaustive granular changelog archive: [_harness/changelog_archive.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/changelog_archive.md).*

---

## Context Hygiene (GC Policy)
Keep this root document under **250 lines**. Never append micro-commit logs or ephemeral styling tweaks. Log only major architectural milestones and update task routing as features evolve. Refer to [_harness/gc.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/gc.md) for pruning guidelines.
