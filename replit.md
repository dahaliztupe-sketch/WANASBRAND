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
