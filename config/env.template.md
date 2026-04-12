# WANAS Environment Variables Template

This file lists all the environment variables required for the WANAS platform to function correctly in production.

## Public Variables (Client-Side)
These variables are prefixed with `NEXT_PUBLIC_` and are accessible in the browser.

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIRESTORE_DATABASE_ID` | Firestore Database ID | Firebase Console > Firestore (usually `(default)`) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API Key | Google AI Studio (aistudio.google.com) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | Sentry Project Settings |

## Server-Side Variables (Secret)
These variables are only accessible on the server. **NEVER** expose these in client-side code.

| Variable | Description | Source |
|----------|-------------|--------|
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 encoded Firebase Service Account JSON | Firebase Console > Project Settings > Service Accounts |
| `JWT_SECRET` | Secret key for signing WhatsApp resume links | Generate a random 32+ char string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Upstash Console |
| `CRON_SECRET` | Bearer token for protecting Vercel Cron jobs | Generate a random string |
| `WHATSAPP_API_TOKEN` | Token for WhatsApp Business API | Meta for Developers Console |
| `SMTP_HOST` | SMTP Server Host | Email Provider (e.g., SendGrid, Mailgun) |
| `SMTP_PORT` | SMTP Server Port | Email Provider (usually 587 or 465) |
| `SMTP_USER` | SMTP Username | Email Provider |
| `SMTP_PASS` | SMTP Password | Email Provider |
| `ENCRYPTION_KEY` | Key for encrypting sensitive data | Generate a random 32-byte hex string |
| `SENTRY_AUTH_TOKEN` | Sentry Auth Token for source maps | Sentry User Settings |

## Security Note
App Check and reCAPTCHA have been disabled to ensure a frictionless luxury user experience. Security is now handled via:
1. **Invisible Honeypots**: Hidden fields in forms to trap bots.
2. **Strict Rate Limiting**: Powered by Upstash Redis (3 requests/hour per IP for sensitive routes).
3. **Idempotency Keys**: Used in order processing to prevent duplicate submissions.

## Instructions for Vercel
1. Go to your Vercel Project > Settings > Environment Variables.
2. Add each variable listed above.
3. For `FIREBASE_SERVICE_ACCOUNT_BASE64`, you can generate it by running:
   `cat service-account.json | base64 | tr -d '\n'`
