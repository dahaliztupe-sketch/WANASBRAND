# Wanas — Next.js App on Replit

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
