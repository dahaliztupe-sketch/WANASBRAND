# WANAS Atelier — Luxury Fashion Platform

> Last comprehensive upgrade: April 2026 — Holistic Transformation Session

## Overview
Wanas is a Next.js 16 e-commerce / brand platform using Firebase, Sanity, Sentry, Resend, and Upstash Redis.

## Running the App
The app runs via the "Start application" workflow:
- Command: `npm run dev`
- Port: 5000 (bound to 0.0.0.0 for Replit compatibility)
- URL: http://localhost:5000

## Key Technologies
- **Framework**: Next.js 16.2.4 (App Router)
- **Auth/DB**: Firebase (client + admin SDK)
- **CMS**: Sanity
- **Email**: Resend
- **Rate limiting**: Upstash Redis
- **Error tracking**: Sentry
- **AI**: Google Gemini
- **Styling**: Tailwind CSS v4

## Environment Variables Required
Set these in Replit Secrets (see .env.example):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIRESTORE_DATABASE_ID`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `RESEND_API_KEY`
- `SMTP_FROM`
- `ENCRYPTION_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `WHATSAPP_API_TOKEN`
- `JWT_SECRET`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `CRON_SECRET`

## Holistic Transformation (April 2026 — Session 5)

### Design System (TypeUI — "Refined")
- `.agents/skills/design-system/SKILL.md` — Comprehensively updated with WANAS brand identity:
  - Color tokens (gold #D4AF37, cream #FDFBF7, black #1A1A1A) for light & dark modes
  - Typography rules: Tajawal for Arabic, Playfair Display for EN headings
  - Motion system: "Slow & Confident" — spring config `stiffness: 100, damping: 20`
  - Full RTL logical property rules and QA checklist

### Critical Bug Fixes
- `app/sitemap.ts` — Rewrote to use Admin SDK (server-side Firebase) instead of client SDK; added `limit(500)`, ISR revalidation, `updatedAt` timestamps, 5 new static routes
- `app/not-found.tsx` — Fixed invisible button: `bg-primary text-inverted` → `bg-inverted text-inverted` (was cream-on-cream / black-on-black)
- `app/error.tsx` — Same invisible button fix applied
- `app/product/[slug]/page.tsx` — Rewrote to use Admin SDK for server-side data fetching (client SDK with `persistentLocalCache` is browser-only); added `limit(1)`, improved structured data, bilingual `alternates`
- `lib/services/ai-recommendations.ts` — Fixed hacky `as any` cast; rewrote using proper `@google/genai` API with `ai.models.generateContent()`; added `generateProductDescription()` function
- `components/Header.tsx` — Added `limit(100)` to unbounded products Firestore query

### RTL Fixes (Logical CSS Properties)
- `components/MobileMenu.tsx` — `right-8` → `end-8` (close button)
- `components/CookieConsent.tsx` — `left-0 right-0` → `inset-x-0`; `ml-2` → `ms-2`
- `components/ProductClient.tsx` — `border-l/pl-8` → `border-s/ps-8` (blockquote)
- `app/auth/page.tsx` — `left-12/right-12` → `start-12/end-12` (decorative elements); `left-4` → `start-4` (form icons)

### New Features
- `components/RecommendedProducts.tsx` — New "You May Also Like / قد يعجبكِ أيضاً" component with carousel navigation, personalized recommendations, skeleton loading, motion animations
- `components/ProductClient.tsx` — Now includes `<RecommendedProducts>` section before "Recently Viewed"
- `lib/services/personalization.ts` — Fully implemented recommendation engine: category affinity, price-range matching, fallback to trending, `getTrendingProducts()` helper

### Enhancements
- `app/admin/reservations/ExportButton.tsx` — Two export modes: "Accounting Export" (confirmed only, financial summary) and "Full Export" (all reservations with items, tracking, notes); proper CSV escaping; UTF-8 BOM for Excel Arabic compatibility
- `app/passport/[certificateNumber]/page.tsx` — Enhanced DPP with: craftsmanship journey timeline, fabric composition progress bars, care icons, sustainability section, print-optimized layout, `generateMetadata()`
- `tsconfig.json` — Target updated to ES2025

### Code Quality
- `lib/services/personalization.ts` — Replaced stub implementation with real recommendation logic

---

## Comprehensive Upgrade (April 2026 — Session 4)

### TypeScript — Zero Errors Achieved (421 → 0)
- `lib/firebase.ts` — Cast JSON config as `Record<string, string>`, used `getApps()[0]!`
- `components/KanbanBoard.tsx` — Used `DragEndEvent`, cast `UniqueIdentifier` to string
- `locales/en.ts` — Merged duplicate `waitlistModal` key
- `tsconfig.json` — Set `target: ES2024`, `noUncheckedIndexedAccess`, `downlevelIteration`
- `lib/encryption.ts` — Fixed index access with `!` non-null assertions
- `lib/services/*.ts` — Added `db` null checks, fixed Google AI `as any` casts
- All 40+ remaining type errors fixed batch-by-batch

### Infrastructure
- `package.json` — Added `engines: { node: ">=25.0.0" }`, Vitest/Playwright test scripts
- `vitest.config.ts` — Created full Vitest configuration (jsdom, coverage via v8, alias @/)
- `vitest.setup.ts` — Jest-DOM matchers setup
- `next.config.ts` — Moved `reactCompiler: true` out of `experimental` to root level (Next.js 16 API)

### Design — Bento Grid Redesign (Group C)
- `components/ProductCard.tsx` — Added `BentoSize` prop (`hero|tall|wide|compact|feature`) with full-bleed dark overlay mode, gradient fade, `ArrowUpRight` CTA
- `components/CollectionsClient.tsx` — Redesigned with 12-col Bento Grid (`auto-rows-[340px]`), 6-item repeating pattern (hero 7col/2row, tall 5/2, compact 4/1, wide 8/1, feature 5/2)
- `components/FeaturedProducts.tsx` — Rewrote to use Bento-style `ProductCard` with `hero/tall/wide` sizes and matching grid layout
- `components/HomeClient.tsx` — Updated Suspense fallback to match new Bento skeleton layout

### Testing Packages Installed
- `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`

## Comprehensive Audit & Fixes (April 2026 — Session 2)

### Fixed (Critical)
- `app/api/cron/update-analytics/route.ts` — Rewrote to use Admin SDK syntax (was mixing client SDK functions with Admin SDK `db`, guaranteed runtime crash)
- `firestore.rules` — `isValidWaitlist` now correctly makes `userId` optional with type validation; `waitlist` create rule enforces ownership when userId provided; read rule guards with `'userId' in resource.data` check to prevent undefined field errors
- `next.config.ts` — Removed `ignoreBuildErrors: true` (was silently swallowing TypeScript errors in production builds)
- `next.config.ts` — Fixed `X-Frame-Options: DENY` conflict with `proxy.ts SAMEORIGIN`; both now unified to `SAMEORIGIN`

### Fixed (High)
- `next.config.ts` — Consolidated all security headers: added HSTS, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control
- `proxy.ts` — Removed duplicate security headers (now handled entirely by next.config.ts); proxy handles only JWT auth and redirects
- `next.config.ts` — Added `allowedDevOrigins` with `REPLIT_DEV_DOMAIN` to fix cross-origin HMR warning in Replit

### Fixed (Medium — Firestore Cost/Performance)
- `app/admin/customers/page.tsx` — Added `limit(500)` to unbounded users query
- `app/admin/waitlist/page.tsx` — Added `limit(500)` to unbounded waitlist query
- `app/admin/insights/page.tsx` — Added `limit(500)` to unbounded products query
- `app/admin/products/page.tsx` — Added `limit(1000)` to both product queries
- `lib/services/product.service.ts` — Added `limit(500)` to `checkInventory` query
- `lib/services/analytics.ts` — Removed debug `console.log('Analyzing checkout funnel...')`

## Feature Development (April 2026 — Session 3)

### New Features Built
- **Quick View Modal** (`components/QuickViewModal.tsx`) — Slide-up modal for rapid product preview without page navigation; triggered from ProductCard hover; uses `useQuickViewStore` Zustand store; integrated globally via `components/QuickViewProvider.tsx` in layout
- **Style Quiz** (`app/style-quiz/page.tsx`) — 4-step quiz (occasion, colour palette, silhouette, budget) that scores and recommends products from Firestore; full Arabic/English bilingual support with translations added to both locale files
- **Compare Products** — `store/useCompareStore.ts` (Zustand + persist, max 3 items); `components/ComparePanel.tsx` (sticky floating panel with mini-product images + "Compare Now" link); `app/compare/page.tsx` (side-by-side attribute table)
- **ProductCard enhanced** — Now has 3 hover-action buttons: Wishlist (Heart), Quick View (Eye), Compare (GitCompare); "Quick View" label strip at card bottom
- **Wishlist Badge in Header** — Heart icon with item count badge in desktop header (`components/Header.tsx`)
- **Style Quiz Promo Section** — Added to `components/HomeClient.tsx` between Philosophy and Concierge sections
- **ShareButtons improved** (`components/ShareButtons.tsx`) — Now uses native Web Share API first, falls back to clipboard copy; WhatsApp, Instagram, Facebook sharing retained
- **Footer** — Added Style Quiz link to Client Services column

### Bug Fixes
- `components/CollectionsClient.tsx` — Fixed missing `idx` prop passed to `<ProductCard>`
- `next.config.ts` CSP — Added `https://www.transparenttextures.com` to `img-src` to fix background texture CSP violation

### Environment Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Migrated from `firebase-applet-config.json` to Replit shared environment variable (security improvement)

### New Pages
- `/style-quiz` — Interactive style profile quiz
- `/compare` — Product comparison page (requires `?ids=id1,id2,id3` query params)

### New Stores
- `store/useQuickViewStore.ts`
- `store/useCompareStore.ts`
- `store/useRecentlyViewedStore.ts`

### New Translations Added (ar + en)
- `styleQuiz` — Full quiz translations (title, steps, options, results)

## Security Fixes Applied (April 2026 — Session 1)
- `proxy.ts` now verifies JWT admin sessions before allowing access to `/admin` routes
- `SESSION_SECRET` no longer has a hardcoded fallback — centralized via `lib/utils/session.ts`
- `GEMINI_API_KEY` (private) replaces `NEXT_PUBLIC_GEMINI_API_KEY` for all server-side AI usage
- AI Report generation moved to server-side `/api/admin/insights/ai-report` route
- Firestore waitlist rule updated to allow users to read their own entries
- Security headers (HSTS, X-Frame-Options, Permissions-Policy, etc.) now properly applied via proxy.ts
- `lib/utils/session.ts` — centralized JWT session creation/verification utility

## Migration Notes (Vercel → Replit)
- Dev/start scripts updated to use `-p 5000 -H 0.0.0.0`
- `turbopack: {}` removed from next.config.ts (caused Turbopack root detection issues)
- `instrumentation.ts` commented out (Sentry + env validation disabled until secrets are set)
- `serverExternalPackages` extended with gRPC/OpenTelemetry packages to prevent SSR bundling issues
- Installed with `npm install --legacy-peer-deps` due to @pdfme peer dep conflict

## Install
```bash
npm install --legacy-peer-deps
```
