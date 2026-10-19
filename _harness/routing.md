# Task Routing Guide

Before executing tasks, classify the user request and load only the relevant files:

## 1. SEO, Articles & Content Marketing
- **Catalog Dataset**: `src/data/articles.ts`, `src/data/articles_cluster_undip.ts`
- **Routing Pages**: `src/app/artikel/page.tsx`, `src/app/artikel/[slug]/page.tsx`
- **SEO Schemas**: `src/components/seo/LocalBusinessSchema.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`
- **Homepage Slide**: `src/components/sections/ActivitiesSlider.tsx`
- **Audit Script**: `scripts/verify_full_seo_audit.mjs`

## 2. QR Access Point & Softfile Claim Flow
- **Access Route**: `src/app/access/[id]/page.tsx`
- **Review & Rating Dial**: `src/app/access/[id]/review/page.tsx`
- **Client Interface**: `src/components/features/AccessSessionClient.tsx`
- **Experience Gauge Component**: `src/components/features/ExperienceGaugeReview.tsx`
- **Google Review Shortcut**: `src/components/features/GoogleReviewPromptCard.tsx`
- **Image Optimizer & Fallback**: `src/app/api/image/route.ts`
- **Download Proxy**: `src/app/api/download/route.ts`
- **Server Actions**: `src/app/actions.ts` (`claimSession`)

## 3. Digital Queue System (Auth-Gated)
- **Public Queue Flow**: `src/app/queue/[eventId]/page.tsx`
- **Live Ticket Display**: `src/app/queue/[eventId]/ticket/[ticketId]/page.tsx`
- **Queue Actions & State**: `src/lib/queue/queueActions.ts`, `src/lib/queue/pushSender.ts`, `src/lib/queue/pushSubscription.ts`
- **TV Monitor Display**: `src/app/queue/[eventId]/display/page.tsx`
- **SSE Stream**: `src/app/api/queue/stream/[eventId]/route.ts`
- **Webhook Integration**: `src/app/api/queue/webhook/route.ts`
- **Operator Tab**: `src/components/admin/QueueOperatorTab.tsx`

## 4. Homepage Slide Deck Presentation Engine
- **Master Deck Controller**: `src/components/slides/SlideDeckLanding.tsx`
- **Slide Config**: `src/config/landingSlides.ts`
- **Individual Slide Wrapper**: `src/components/slides/SlideItem.tsx`
- **Slide 1 (Hero)**: `src/components/sections/Hero.tsx`
- **Slide 2 (Services/Coverflow)**: `src/components/sections/Product.tsx`
- **Slide 3 (Frames Marquee)**: `src/components/sections/FramesSlider.tsx`
- **Slide 4 (Pricing)**: `src/components/sections/PricingSlider.tsx`
- **Slide 5 (Activities/SEO)**: `src/components/sections/ActivitiesSlider.tsx`
- **Slide 6 (FAQ Folder Stack)**: `src/components/sections/FaqStackSlider.tsx`

## 5. Admin CMS & Operations
- **Admin Dashboard**: `src/app/admin/page.tsx`
- **Session Lookup & Inspector**: `src/components/admin/SessionLookupTab.tsx`, `src/app/api/admin/session-lookup/route.ts`
- **Analytics & Insights**: `src/components/admin/AnalyticsInsightsTab.tsx`
- **Frame CMS**: `src/components/admin/FrameManagementTab.tsx`
- **News CMS**: `src/components/admin/NewsManagementTab.tsx`
