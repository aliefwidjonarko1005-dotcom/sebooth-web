# Project: Sebooth Website (Web Portal & Kiosk Harness)

## Purpose & Scope
Web portal for Sebooth Photobooth users to access, view, and download digital assets (softfiles) via QR code redirection from physical photobooths. Functions as the public website with product showcases, interactive pricing, dynamic frame templates, 69-article SEO content hub, live digital queue system, and full admin CMS panel.

---

## Quick Task Routing
Before modifying code, load the relevant module context from `_harness/routing.md`:

| Task Area | Key Files & Routes | Details |
|---|---|---|
| **SEO & Articles** | `src/data/articles.ts`, `src/app/artikel/`, `LocalBusinessSchema.tsx` | 69 long-form E-E-A-T articles, 3-5% keyword density, JSON-LD schemas |
| **QR Claim & Softfiles** | `src/app/access/[id]/`, `AccessSessionClient.tsx`, `api/image/route.ts` | Editorial design, crash-proof Sharp loader, 1-tap Google Review widget |
| **Digital Queue System** | `src/app/queue/`, `queueActions.ts`, `pushSender.ts`, `QueueOperatorTab.tsx` | Auth-gated queue, Web Push, proximity tier, scan QR session link |
| **Slide Deck Landing** | `src/components/slides/`, `landingSlides.ts`, `Product.tsx`, `FramesSlider.tsx` | 6-slide vertical discrete transitions, 100svh lock, Coverflow 3D |
| **Admin Operations** | `src/app/admin/`, `SessionLookupTab.tsx`, `api/admin/session-lookup/` | Session inspector table, pagination, search, frame & news CMS |

*See full routing instructions in [_harness/routing.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/routing.md).*

---

## Technical Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling & FX**: Tailwind CSS 4, Framer Motion, Lucide React
- **Typography**: Bayon (display headings, one weight only) + Hanken Grotesk (everything else)
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
- **Connection Pool Safety**: Session claiming uses Next.js Server Actions (`claimSession`) with atomic queries (`eq('is_claimed', false)`) to avoid Supabase connection pool exhaustion during traffic surges. It is the only way to claim: `/login` and `/register` send people to `/access/[id]`, which claims, and never write to `sessions` themselves.
- **Login Redirects**: A `redirect` value comes from the URL, so it always goes through `safeRedirectPath` (`src/lib/safeRedirect.ts`) before being opened or passed on.
- **Design Integrity**:
  - Softfile Claim (`/access/[id]`): Editorial Anti-Slop aesthetic (zero emojis, calm contrast, structured card hierarchy).
  - Profile & Queue: same language as the public pages (navy, orange, Bayon headings, Hanken 15px+, no hard shadows or glass). The ticket screen's solid colour per proximity tier is functional: the guide tells people to read it (`getProximityTierColor`).
  - Homepage: 100svh viewport locking, discrete slide gestures (`translate3d`), no Lenis interference on `/`.
- **SEO Standards**: 3.0%–5.0% token weight density, 40–60 char titles, 120–160 char descriptions, single H1, and full schema compliance validated via `node scripts/verify_full_seo_audit.mjs`.
- **Zero Redirect on Claim Page (`/access/[id]`)**: Pengguna yang membuka atau mengklaim sesi foto WAJIB 100% tetap berada di halaman `/access/[id]`. Dilarang keras melakukan auto-redirect ke `/profile` (My Photos).
- **Queue Privacy**: Anything public about a ticket (`fetchQueueStatus`, the SSE stream, `/api/queue/[eventId]/status`, the venue screen) carries only `PUBLIC_TICKET_COLUMNS`. Ticket ids, phone numbers, account ids and sessions go through `createQueueServerClient` after an owner or admin check, and a ticket page opens for its owner only. Database rules: `_harness/sql/queue-privacy.sql`.

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

- **Phase 8L: Anti-Slop UI Polish (Public Pages)**: Replaced the floating glass nav with a plain bar (desktop) and corner tab (mobile), now also on `/artikel` routes. Rebuilt About, Partnership, the article hub and article detail on one language: navy hero, Hanken body at 17px+, Bayon headings without fake bold, real Sebooth prints and photos, orange close. Homepage slides lost imitation controls (Pinterest save/like, fake favourite), invented Instagram posts, emoji and 7–11px labels. `/frames` serves webp (`frameImage`) instead of 4.6 MB PNGs; article data no longer reaches the homepage bundle. Shared modal behaviour lives in `useModalFocus`.

- **Phase 8M: Queue & Profile Out of Brutalism**: Queue landing, gate, join, ticket, scanner and venue display rebuilt on the public-page language (`FlowHero`); the ticket is a white two-part stub on a solid tier colour, with the check-in and scan actions above the fold. Check-in now confirms at once, the scan button no longer needs a reload, and a ticket that leaves the live lists refreshes to its final status. `/profile` keeps its gestures and haptics but loses glass and blur (`Dock` replaces `LiquidGlassDock`); gallery cards and the photo view name their session. One guide theme everywhere (the `brutal` and `ios` variants are gone).

- **Phase 8N: Queue Privacy & One Live Ticket per Person**: The public queue status, stream and venue screen stopped carrying phone numbers, account ids, ticket ids and sessions; the operator tab gets those from the admin-only `/api/queue/operator/status`. Ticket pages, cancelling and notification sign-up now check the owner. Joining again returns the number already held, `/queue/[eventId]` sends holders back to their ticket, and `/queue` lists it (`ActiveQueueCard`). The matching database rules are in `_harness/sql/queue-privacy.sql`, run by hand.

- **Phase 8O: Safe Login & Register**: Closed the open redirect (including `javascript:`), and `?claim=` no longer claims from the browser: it only leads to `/access/[id]`, where `claimSession` applies the owner and expiry rules. Both pages rebuilt on `FlowHero` and `AuthForm`: visible labels, right keyboards and autofill, show-password, errors in Indonesian that say how to fix them.

*Exhaustive granular changelog archive: [_harness/changelog_archive.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/changelog_archive.md).*

---

## Context Hygiene (GC Policy)
Keep this root document under **250 lines**. Never append micro-commit logs or ephemeral styling tweaks. Log only major architectural milestones and update task routing as features evolve. Refer to [_harness/gc.md](file:///c:/Users/AXIOO%20HYPE%20R5/Documents/2026/06%20Sebooth%20Proposal%20Company%20Profile/sebooth-website/_harness/gc.md) for pruning guidelines.
