# WANAS-Expert Skill

**Version:** 1.0.0  
**Project:** WANAS — منصة الأزياء المصرية الفاخرة  
**Stack:** Next.js 16.2.4, TypeScript 5.8, Firebase (Client + Admin), Tailwind CSS v4, Gemini AI

---

## معرفة المشروع الأساسية

### هيكل المشروع (App Router)
```
/
├── app/                    # Next.js 16 App Router
│   ├── layout.tsx          # Root layout - Language/RTL detection via cookies
│   ├── page.tsx            # Home — Server Component, Firebase Admin fetch
│   ├── admin/              # Admin dashboard (protected by session JWT)
│   │   └── insights/       # AI-powered analytics, Recharts funnel
│   ├── api/                # API Routes (all server-side)
│   │   ├── auth/session/   # JWT session creation via Firebase ID Token
│   │   ├── admin/          # Admin CRUD — verified by SESSION_SECRET JWT
│   │   ├── reservation/    # Core booking flow — Zod validation + Firestore tx
│   │   ├── concierge/      # Gemini AI chat with function calling
│   │   └── cron/           # Scheduled jobs (backup, analytics)
├── components/             # Shared UI components
├── lib/
│   ├── firebase/
│   │   ├── client.ts       # Firebase Web SDK (browser + SSR)
│   │   └── server.ts       # Firebase Admin SDK (server only)
│   ├── services/           # Business logic (email, loyalty, cache)
│   ├── schemas/            # Zod validation schemas
│   └── utils/              # encryption, firestoreError, validate-env
├── store/                  # Zustand stores (wishlist, shopping bag, selection)
├── types/                  # TypeScript type definitions
├── firestore.rules         # Firestore security rules
└── proxy.ts                # ⚠️ MISNAMED — Should be middleware.ts
```

### تدفق الحجز (Reservation Flow)
1. User adds items → `useSelectionStore` (Zustand + persist)
2. Fills form → validated client-side with React state
3. POST `/api/reservation` → Zod validation → Rate limit (Upstash) → Honeypot check
4. Firebase Admin Transaction: counter increment, inventory decrement, reservation write
5. PII encrypted (AES-256 via `lib/utils/encryption.ts`)
6. Email via Resend → WhatsApp link generated for ambassador contact
7. Loyalty points awarded (1 per 10 EGP)

### نظام التصميم (Design System)
- **Fonts:** Playfair Display (serif, en), Montserrat (sans, en), Tajawal (arabic)
- **CSS Variables:** `--font-serif`, `--font-sans`, `--font-arabic`
- **RTL Support:** cookie-based `language` detection → `dir="rtl"` on `<html>`
- **Theme:** next-themes, light mode only (enableSystem: false)
- **Color vars:** `bg-primary`, `bg-secondary`, `text-primary`, `accent-primary`, `text-inverted`
- **Tailwind v4:** postcss-based, no tailwind.config.ts plugins

### Firebase Architecture
| SDK | File | Usage |
|-----|------|-------|
| Client (Web) | `lib/firebase/client.ts` | Browser auth, Firestore listeners, SSR sitemap |
| Admin | `lib/firebase/server.ts` | API routes, Server Components, Token verification |

### قواعد Firestore الأمنية
- Default deny via explicit rules per collection
- `isAdmin()` checks: JWT token.admin claim OR Firestore role=='admin' OR hardcoded email
- Wildcard rule `/{document=**}` allows admin full access
- PII fields (phone, address) stored AES-256 encrypted

### متغيرات البيئة المطلوبة
```
NEXT_PUBLIC_FIREBASE_*      # Firebase client config
FIREBASE_SERVICE_ACCOUNT_BASE64  # Admin SDK credential
SESSION_SECRET              # JWT signing (⚠️ has insecure fallback)
ENCRYPTION_KEY              # AES-256 for PII
UPSTASH_REDIS_REST_URL/TOKEN # Rate limiting
RESEND_API_KEY              # Email
NEXT_PUBLIC_GEMINI_API_KEY  # ⚠️ Used server-side but NEXT_PUBLIC_ = exposed to client
JWT_SECRET                  # Token signing
CRON_SECRET                 # Cron job auth
```

### مشاكل أمنية معروفة (للمرجع)
1. `proxy.ts` مسمى خطأ — ليس `middleware.ts` → Auth/headers middleware لا تعمل
2. `SESSION_SECRET` له fallback نصي hardcoded في 4 ملفات
3. `NEXT_PUBLIC_GEMINI_API_KEY` مكشوف في bundle العميل لكن يُستخدم في server routes
4. Email مدير hardcoded في `firestore.rules`
5. `waitlist` — المستخدمون لا يستطيعون قراءة طلباتهم الخاصة

### Firestore Indexes
- `reservations`: (userId, status, createdAt) — للمستخدمين
- `reservations`: (status, createdAt) — للإدارة
- `products`: (status, createdAt) — للعرض

---

## نقاط الأداء الحرجة
- `insights/page.tsx` `fetchLowStock()`: يقرأ **كل** المنتجات بلا `limit()` — مشكلة N+1 محتملة
- `sitemap.ts` يستخدم Firebase Client SDK (ليس Admin) على السيرفر
- `three.js` (38MB) و `firebase` (34MB) من أثقل التبعيات

---

*هذه المهارة مرجع داخلي لتحليل مشروع WANAS. تحديث: 17 أبريل 2026.*
