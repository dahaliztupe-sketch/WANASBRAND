# تقرير التدقيق الشامل — مشروع WANAS
**المُدقِّق:** WANAS-Expert AI Architect  
**التاريخ:** 17 أبريل 2026  
**الإصدار:** Next.js 16.2.4 | TypeScript 5.8 | Firebase | Tailwind CSS v4

---

## ما قبل التدقيق: إنشاء المهارة المخصصة

قبل البدء، تم إجراء تحليل شامل للمشروع بقراءة متوازية لـ 40+ ملفاً تغطي:
- هيكل `app/` بالكامل (App Router، API Routes، Server/Client Components)
- قواعد Firestore الأمنية وفهارسها
- تبعيات `package.json` وتقرير `npm audit`
- مسار التشغيل `lib/firebase/server.ts` و `lib/firebase/client.ts`
- ملف الـ proxy/middleware ونظام الجلسات

✅ **تم إنشاء مهارة `WANAS-Expert`** وحفظها في `.agents/skills/WANAS-Expert/SKILL.md` كمرجع استراتيجي دائم لهذا المشروع.

---

## المحور الأول: التدقيق الأمني 🔐

### 1.1 قواعد Firestore

| المجموعة | القراءة | الكتابة | الحكم |
|----------|---------|---------|-------|
| `users` | المالك أو المسؤول | المصادق عليه (مع تحقق) | ✅ صحيح |
| `products` | عام | المسؤول + تحقق | ✅ صحيح |
| `reservations` | المالك أو المسؤول | الإنشاء للمالك فقط | ✅ صحيح |
| `waitlist` | المسؤول فقط | المصادق عليه | ⚠️ قابل للمراجعة |
| `concierge_chats` | المالك أو المسؤول | المالك مع تحقق صارم | ✅ صحيح |
| `returnRequests` | المالك أو المسؤول | الإنشاء للمالك | ✅ صحيح |
| `settings/global` | عام | المسؤول | ✅ صحيح |
| `/{document=**}` | المسؤول | المسؤول | ⚠️ مراجعة |

**نقاط القوة:**
- ✅ **Default Deny** محقق بشكل كامل — لا توجد قاعدة عامة تسمح بالوصول المفتوح
- ✅ تحقق من ملكية البيانات (`isOwner`) مطبَّق على المجموعات الحساسة
- ✅ دوال `isValidReservation()` و`isValidUser()` و`isValidReturn()` تتحقق من البنية والأنواع والحجم
- ✅ `areImmutableFieldsUnchanged()` تمنع تعديل `uid` و`email` و`createdAt`
- ✅ `isValidReservationStatusTransition()` تمنع القفز العشوائي بين الحالات

**المشاكل المكتشفة:**

> **⚠️ مشكلة متوسطة — Waitlist لا يمكن للمستخدم قراءة طلبه الخاص**
> ```
> match /waitlist/{entryId} {
>   allow create: if isAuthenticated() && isValidWaitlist(request.resource.data);
>   allow read, update, delete: if isAdmin(); // ← المستخدم لا يملك قراءة طلبه!
> }
> ```
> يمكن أن يتقدم مستخدم للقائمة الانتظار لكنه لا يستطيع رؤية طلبه. **التوصية:** إضافة `|| isAuthenticated()` مع تقييد القراءة للمستند الذي يملكه.

> **⚠️ مشكلة منخفضة — Email مسؤول hardcoded في قواعد Firestore**
> ```javascript
> request.auth.token.email == "abdalrahman32008@gmail.com"
> ```
> إذا اختُرق هذا الحساب، يصبح المهاجم مسؤولاً تلقائياً. **التوصية:** الاعتماد الكلي على `request.auth.token.admin` المُعيَّن من Firebase Admin SDK، وحذف الشرط المبني على البريد الإلكتروني.

> **⚠️ مشكلة منخفضة — قاعدة الـ wildcard في الأسفل**
> ```
> match /{document=**} {
>   allow read, write: if isAdmin();
> }
> ```
> هذه القاعدة مقبولة لكنها خطرة إذا أُسيئ استخدام صلاحية المسؤول. يُفضَّل تحديد المجموعات المسموح للمسؤول بالوصول الكامل إليها.

---

### 1.2 رؤوس الأمان (Security Headers)

**مشكلة حرجة تم اكتشافها: `proxy.ts` ليس Next.js Middleware!**

```
⛔ CRITICAL: ملف proxy.ts ≠ middleware.ts
```

تم اكتشاف أن ملف الـ middleware مسمى `proxy.ts` وليس `middleware.ts` المطلوب من Next.js. هذا يعني أن:
- ❌ **حماية مسارات `/admin` و `/account` معطّلة تماماً** — يمكن لأي شخص الوصول إليها دون جلسة
- ❌ **رؤوس الأمان (HSTS, X-Frame-Options, الخ) لا تُطبَّق** على أي طلب

الرؤوس المعرَّفة في `proxy.ts` والتي **لا تعمل حالياً**:
| الرأس | القيمة المقصودة | الحالة |
|-------|----------------|--------|
| `Strict-Transport-Security` | max-age=63072000 | ❌ لا تعمل |
| `X-Frame-Options` | SAMEORIGIN | ❌ لا تعمل |
| `X-Content-Type-Options` | nosniff | ❌ لا تعمل (موجود في next.config.ts) |
| `X-XSS-Protection` | 1; mode=block | ❌ لا تعمل |

> ✅ **الإيجابي:** `next.config.ts` يُضيف بعض رؤوس الأمان عبر `headers()` لكنها تفتقر لـ HSTS وبعض الإعدادات المهمة.

**التوصية الفورية:** إعادة تسمية `proxy.ts` إلى `middleware.ts`.

---

### 1.3 الثغرات في الكود (Code Vulnerabilities)

> **🚨 ثغرة حرجة — SESSION_SECRET بقيمة افتراضية hardcoded**

مكتشفة في **4 ملفات** مختلفة:
```typescript
// app/api/auth/session/route.ts (+ 3 ملفات أخرى)
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
```
إذا لم يُعيَّن `SESSION_SECRET` في متغيرات البيئة، يمكن لأي شخص توليد JWT صالح بسر معروف وانتحال صلاحية المسؤول.

> **🚨 ثغرة عالية — NEXT_PUBLIC_GEMINI_API_KEY مكشوف في bundle العميل**

```typescript
// app/api/concierge/route.ts (server-side route)
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
```
أي متغير يبدأ بـ `NEXT_PUBLIC_` يُدمج في JavaScript bundle الذي يُرسَل للمتصفح. **هذا المفتاح مكشوف للجميع.** يجب تغيير اسمه إلى `GEMINI_API_KEY` (بدون NEXT_PUBLIC_) لأن هذا المتغير يُستخدم فقط في server routes.

---

### 1.4 الاعتماديات — نتائج npm audit

| الحزمة | الخطورة | CVE / Advisory | التفاصيل |
|--------|---------|----------------|---------|
| `@pdfme/common` | **متوسطة** | GHSA-pgx6-7jcq-2qff | SSRF via unvalidated URL in `getB64BasePdf` — CVSS 6.8 |
| `@pdfme/pdf-lib` | **متوسطة** | GHSA-vrqm-gvq7-rrwh | Decompression bomb (DoS) في FlateDecode — CVSS 6.5 |
| `@pdfme/generator` | **متوسطة** | (عبر pdfme/common) | متأثر بالثغرتين أعلاه |
| `@google-cloud/firestore` | منخفضة | عبر google-gax | — |
| `@google-cloud/storage` | منخفضة | عبر retry-request | — |
| `firebase-admin` | منخفضة | عبر التبعيات أعلاه | Fix يتطلب تخفيضاً لـ v10 |
| `@tootallnate/once` | منخفضة | GHSA-vpq2-c234-7xj6 | Incorrect Control Flow — CVSS 3.3 |

> **التوصية:** ثغرات `@pdfme` لا يوجد لها إصلاح متاح حالياً. إذا كان PDF يُولَّد من بيانات مدخلة من المستخدم (مثل جواز السفر الرقمي)، **تأكد من تعقيم المدخلات** بشكل صارم قبل تمريرها لـ pdfme.

---

## المحور الثاني: أداء تحسين محركات البحث 🚀

### 2.1 تحسين الصور (Image Optimization)

**الإيجابيات:**
- ✅ `remotePatterns` مُقيَّد بـ 4 نطاقات محددة فقط (Google, Picsum, Unsplash, Firebase Storage)
- ✅ دعم `image/avif` و `image/webp` للتقليل المثلى للحجم
- ✅ `minimumCacheTTL: 31536000` (سنة كاملة) للصور الثابتة
- ✅ `dangerouslyAllowSVG: true` مع CSP مقيَّد

**المشاكل:**
> **⚠️ مشكلة متوسطة — `sizes` غير مُعرَّفة في صور لوحة الإدارة**
> ```typescript
> // admin/insights/page.tsx
> <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
> // ← غياب sizes مع fill يجعل المتصفح يطلب أكبر صورة متاحة دائماً
> ```
> يجب إضافة `sizes="(max-width: 768px) 40px, 40px"` على الصور الصغيرة.

> **⚠️ مشكلة بسيطة — `sitemap.ts` يستخدم Firebase Client SDK على السيرفر**
> ```typescript
> import { db } from '@/lib/firebase/client'; // ← Client SDK في Server Context
> ```
> يجب استخدام `lib/firebase/server.ts` (Admin SDK) في sitemap لضمان الأداء وتجنب تهيئة SDK مزدوجة.

### 2.2 جلب البيانات (Data Fetching)

**الإيجابيات:**
- ✅ `app/page.tsx` يستخدم Firebase Admin مع `.limit(3)` للمنتجات المميزة
- ✅ استخدام `Promise.all()` في insights لتوازي الطلبات
- ✅ `Firestore Transaction` في `/api/reservation` يمنع race conditions

**المشاكل:**
> **⚠️ مشكلة عالية — قراءة ALL products بلا limit في insights**
> ```typescript
> // admin/insights/page.tsx
> const qProducts = query(collection(db, 'products')); // ← لا limit!
> const snapshot = await getDocs(qProducts);
> // ثم filter في JavaScript
> const lowStock = snapshot.docs.filter(p => totalStock < 5);
> ```
> مع 1000 منتج، هذا = 1000 قراءة Firestore عند كل تحميل للصفحة. يجب نقل هذا المنطق إلى cron job ينشئ وثيقة `stats/inventory_alerts`.

### 2.3 تحسين محركات البحث (SEO)

**الإيجابيات:**
- ✅ `robots.ts` يمنع فهرسة `/admin`, `/api`, `/account`
- ✅ `sitemap.ts` يولد روابط ديناميكية للمنتجات مع `hreflang` (ar/en)
- ✅ `layout.tsx` يتضمن بيانات Schema.org للـ Organization و WebSite
- ✅ `alternates.languages` صحيحة في metadata وsitemap
- ✅ `appleWebApp` و `manifest` لدعم PWA

**المشاكل:**
> **⚠️ مشكلة بسيطة — OpenGraph locale ثابتة**
> ```typescript
> openGraph: { locale: "en_US" } // ← ثابتة بالإنجليزية حتى للصفحات العربية
> ```
> يجب تحديدها ديناميكياً بناءً على لغة الصفحة.

> **⚠️ مشكلة بسيطة — لا توجد صفحات `/ar/*` و `/en/*` فعلية**
> الـ `hreflang` يشير إلى `https://wanasbrand.com/ar/product/slug` لكن اللغة تُدار عبر cookies وليس مسارات URL. هذا يربك محركات البحث.

---

## المحور الثالث: تحليل أداء التكلفة 💰

### 3.1 تقييم مخاطر فاتورة Firestore

#### نموذج التكلفة (1000 زيارة + 100 طلب يومياً)

| العملية | الموقع | القراءات/طلب | يومياً | ملاحظات |
|---------|--------|-------------|-------|---------|
| Landing Page | `app/page.tsx` | 3 | 3,000 | ✅ limit(3) |
| Admin Insights (low stock) | `admin/insights` | N (كل المنتجات) | N × زيارات المسؤول | 🔴 لا limit |
| Admin Insights (carts) | `admin/insights` | 20 | متغير | ✅ limit(20) |
| Funnel Stats | `admin/insights` | 1 | متغير | ✅ مُحسَّن |
| Reservation Create | `/api/reservation` | `items.length + 1` | ~200 | ✅ Transaction |
| Product Page | يُفترض server fetch | ~1 | ~500 | يعتمد على التطبيق |
| **إجمالي يومي تقريبي** | | | **~5,000+** | بافتراض 50 منتج |

**التقدير:**
- Firestore Free Tier: 50,000 قراءة/يوم
- بافتراض نمو إلى 10,000 زيارة يومية + المسؤولين: **~50,000 قراءة/يوم** تقترب من الحد
- التكلفة بعد تجاوز المجاني: **$0.06 / 100,000 قراءة**

**النقطة الحرجة:** `fetchLowStock()` يقرأ جميع المنتجات في كل تحميل للوحة insights. مع 200 منتج و10 زيارات مسؤول = **2,000 قراءة إضافية يومياً** يمكن تجنبها بالكامل.

#### أماكن تحسين التكلفة

| المشكلة | التأثير | الحل |
|---------|---------|------|
| `fetchLowStock` بلا limit | عالي | cron job ينشئ `stats/low_stock_alerts` |
| `concierge_chats` يجلب 10 محادثات لتقرير AI | متوسط | تخزين ملخصات مسبقاً |
| `sitemap.ts` يعيد جلب المنتجات | منخفض | `revalidate` للـ sitemap |

### 3.2 تأثير التبعيات على حجم الحزمة

| المكتبة | الحجم على القرص | ملاحظة |
|---------|----------------|--------|
| `three.js` | **38 MB** | 3D — هل يُستخدم فعلاً؟ |
| `firebase` (client) | **34 MB** | ضروري |
| `@react-pdf/renderer` | 320 KB | منطقي |
| `recharts` | 5.3 MB | يمكن استبداله بـ `chart.js` (أصغر) |

> **⚠️ تنبيه: `three.js` (38MB)** — إذا كان يُستخدم لتأثير بصري محدود، فكّر في استبداله بـ CSS 3D transforms أو `@react-three/drei` مع lazy loading.

**تقدير Bundle Size النهائي (Client-side JS):**
- Firebase Client SDK: ~350 KB gzipped
- Next.js Runtime: ~90 KB
- three.js (إذا loaded): ~600 KB gzipped
- Framer Motion: ~45 KB
- **إجمالي متوقع: ~1.2-1.5 MB** (مع three.js)، **~600 KB** بدونه

---

## المحور الرابع: أفضل الممارسات والمعايير ⚙️

### 4.1 استخدام TypeScript

| الإعداد | القيمة | الحكم |
|---------|--------|-------|
| `strict: true` | ✅ | صارم |
| `skipLibCheck: true` | ✅ | للتسريع |
| `noEmit: true` | ✅ | صحيح لـ Next.js |
| `isolatedModules: true` | ✅ | للتوافق مع SWC |
| `esModuleInterop: true` | ✅ | — |
| `target: ES2017` | ✅ | مناسب للمتصفحات الحديثة |

- ✅ **لا يوجد استخدام مفرط لـ `any`** — فحص الكود أعطى 0 نتيجة لـ `: any` في app/ و lib/
- ✅ TypeScript Strict Mode مفعَّل بالكامل

### 4.2 معالجة الأخطاء

**الإيجابيات:**
- ✅ `/api/reservation` يستخدم `try/catch` مع تصنيف الأخطاء (400 vs 500)
- ✅ `lib/firebase/server.ts` يتحقق من وجود `db` قبل كل عملية
- ✅ `DatabaseUnavailable` component يُعرض عند غياب Firebase
- ✅ `handleFirestoreError()` utility لمعالجة أخطاء Firestore الموحدة
- ✅ `ErrorBoundary` مُطبَّق في Root Layout

**المشاكل:**
> **⚠️ مشكلة متوسطة — رسائل خطأ تكشف تفاصيل داخلية**
> ```typescript
> // app/api/reservation/route.ts
> const message = error instanceof Error ? error.message : 'Failed';
> return NextResponse.json({ error: message }, { status });
> ```
> رسائل مثل `"Product ABC123 not found"` أو `"Insufficient stock for SKU-456"` قد تكشف تفاصيل عن بنية قاعدة البيانات. يُفضَّل log الرسالة الكاملة في Sentry وإرجاع رسالة عامة للعميل.

> **⚠️ مشكلة بسيطة — Sentry معطَّل حالياً**
> ملف `instrumentation.ts` تم تعطيله لأسباب التهجير إلى Replit. تسجيل الأخطاء في الإنتاج معطَّل مؤقتاً.

### 4.3 هيكل المشروع

```
✅ تقييم ممتاز لهيكل المجلدات
```

| المجلد | التقييم | ملاحظة |
|--------|---------|--------|
| `app/` | ✅ | App Router مع تقسيم واضح server/client |
| `components/` | ✅ | مكونات منطقية ومُقسَّمة |
| `lib/firebase/` | ✅ | فصل واضح client vs server |
| `lib/services/` | ✅ | منطق الأعمال مُعزَّل |
| `lib/schemas/` | ✅ | Zod schemas مركزية |
| `store/` | ✅ | Zustand stores منفصلة حسب الوظيفة |
| `types/` | ✅ | Types مركزية |

**الملاحظات:**
- ✅ `proxy.ts` سيُصبح مثالياً بعد إعادة تسميته لـ `middleware.ts`
- ✅ استخدام `app/actions/` لـ Server Actions مُقيَّد
- ⚠️ `firebase-applet-config.json` موجود في جذر المشروع وقد يُدمج في git — تأكد من `.gitignore`

---

## المحور الخامس: اقتراحات التحسين الاستراتيجية 🎯

### 1. إصلاح `middleware.ts` — **أولوية قصوى / جهد منخفض**

```typescript
// إعادة تسمية proxy.ts → middleware.ts
// هذا وحده يفعّل حماية Admin + Security Headers
```
**التأثير:** يُصلح ثغرتين أمنيتين حرجتين دفعة واحدة (auth + headers).

### 2. تحسين RTL UX — **قيمة عالية / جهد متوسط**

التحسينات المقترحة:
```css
/* تحسين typography العربية */
.rtl p { line-height: 1.9; letter-spacing: 0; word-spacing: 0.05em; }
/* تحريك العناصر المتماثلة */
.rtl .icon-arrow { transform: scaleX(-1); }
/* دعم أرقام عربية في التواريخ */
.rtl time { font-variant-numeric: traditional; }
```
- إضافة دعم `Logical Properties` في Tailwind: `ms-4` بدلاً من `ml-4`
- مراجعة تأثيرات الـ Framer Motion لتكون RTL-aware
- اختبار على أجهزة عربية حقيقية

### 3. Skeleton Loaders + Optimistic Updates — **قيمة عالية / جهد منخفض**

```typescript
// مثال: Skeleton للمنتجات في HomeClient
function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-primary/5 aspect-[3/4]" />
  );
}
// مع React Suspense:
<Suspense fallback={<ProductSkeleton />}>
  <FeaturedProducts promise={featuredProductsPromise} />
</Suspense>
```
حالياً يُعرض `PreloaderWrapper` للصفحة كاملة — يمكن استبداله بـ granular skeletons لتحسين LCP.

### 4. Optimistic Inventory Stats — **قيمة عالية / جهد منخفض**

```typescript
// إضافة cron job جديد: /api/cron/sync-inventory-stats
// يُحدِّث stats/inventory_alerts كل 30 دقيقة
await db.collection('stats').doc('inventory_alerts').set({
  lowStockProducts: lowStockItems, // ← مسبق الحساب
  lastUpdated: new Date().toISOString()
});

// في insights/page.tsx: قراءة وثيقة واحدة بدلاً من كل المنتجات
const alertsDoc = await getDoc(doc(db, 'stats', 'inventory_alerts'));
```
**التوفير:** من N قراءات لـ 1 قراءة عند كل تحميل لـ insights.

### 5. تحسين PWA + إشعارات الحالة — **قيمة عالية / جهد متوسط**

المشروع لديه بنية PWA ممتازة (manifest, ServiceWorker, InstallPrompt). التحسين التالي:
```typescript
// إضافة Background Sync لحالة الحجز
self.addEventListener('sync', (event) => {
  if (event.tag === 'reservation-status-check') {
    event.waitUntil(checkReservationStatus());
  }
});
```
- إضافة إشعارات Push عند تغيير حالة الحجز (يُبلَّغ المستخدم تلقائياً)
- `offline fallback page` للمستخدمين بدون إنترنت
- Cache استراتيجية `stale-while-revalidate` للمنتجات

---

## جدول الملخص التنفيذي

### أهم 5 مشاكل مكتشفة

| # | المشكلة | الخطورة | الأولوية | الجهد |
|---|---------|---------|---------|------|
| 1 | **`proxy.ts` ليس Middleware** — حماية Admin Routes معطَّلة تماماً | 🔴 حرجة | P0 | 5 دقائق |
| 2 | **SESSION_SECRET بقيمة افتراضية** — يمكن تزوير JWT للمسؤول | 🔴 حرجة | P0 | 10 دقائق |
| 3 | **NEXT_PUBLIC_GEMINI_API_KEY مكشوف** — يُرسَل لكل متصفح | 🟠 عالية | P1 | 15 دقيقة |
| 4 | **fetchLowStock بلا limit** — قراءة كل المنتجات عند كل زيارة لـ insights | 🟡 متوسطة | P2 | 2-3 ساعات |
| 5 | **ثغرة SSRF في @pdfme** — CVSS 6.8 عند معالجة PDF من مدخلات خارجية | 🟡 متوسطة | P2 | تعقيم المدخلات |

### أهم 5 تحسينات مقترحة

| # | التحسين | القيمة | الجهد | أولوية |
|---|---------|--------|------|--------|
| 1 | Rename `proxy.ts` → `middleware.ts` (يُصلح مشكلتين حرجتين) | 🔥 عالية جداً | 5 دقائق | فوري |
| 2 | تغيير `NEXT_PUBLIC_GEMINI_API_KEY` → `GEMINI_API_KEY` | 🔥 عالية | 15 دقيقة | فوري |
| 3 | Cron Job لتجميع مخزون منخفض بدلاً من قراءته عند الطلب | ⚡ عالية | 2 ساعات | هذا الأسبوع |
| 4 | Granular Skeleton Loaders بدلاً من Full-Page Preloader | ✨ متوسطة | 4 ساعات | هذا الشهر |
| 5 | Background Sync لإشعارات حالة الحجز (PWA) | ✨ متوسطة | يوم | الشهر القادم |

---

## التقييم العام

```
┌─────────────────────────────┬──────────┐
│ المحور                       │ التقييم  │
├─────────────────────────────┼──────────┤
│ الأمان (بعد إصلاح Middleware) │ 78 / 100 │
│ الأداء وتحسين البحث           │ 80 / 100 │
│ كفاءة التكلفة                │ 72 / 100 │
│ جودة الكود وأفضل الممارسات    │ 88 / 100 │
│ جاهزية للإنتاج (الآن)        │ 65 / 100 │
│ جاهزية للإنتاج (بعد P0+P1)   │ 90 / 100 │
└─────────────────────────────┴──────────┘
```

> **خلاصة:** المشروع مبني بمستوى هندسي عالٍ مع اهتمام واضح بالأمان والأداء. المشكلتان الحرجتان (Middleware + SESSION_SECRET) يجب معالجتهما قبل أي نشر في بيئة الإنتاج. بعد إصلاحهما، يصبح المشروع جاهزاً بشكل ممتاز للإطلاق.

---

*تقرير مُولَّد بواسطة WANAS-Expert Skill — 17 أبريل 2026*
