# WANAS Atelier — خارطة الطريق الشاملة
## Digital Transformation Roadmap 2026–2027

> منصة أزياء فاخرة مصرية — Next.js 16 | Firebase | AI Agents | PWA

---

## الحالة الراهنة — April 2026 ✅

### المنجز بالكامل
| الميزة | الحالة |
|---|---|
| منصة E-Commerce كاملة (Next.js 16, Firebase) | ✅ مكتمل |
| نظام الحجوزات (لا سلة تسوق) | ✅ مكتمل |
| دعم عربي/إنجليزي كامل + RTL | ✅ مكتمل |
| AI Concierge (Gemini 1.5 Pro) | ✅ مكتمل |
| نظام ولاء متعدد المستويات (Silver/Gold/Platinum/Diamond) | ✅ مكتمل |
| Digital Product Passport (DPP) | ✅ مكتمل |
| PWA (قابل للتنصيب) | ✅ مكتمل |
| لوحة إدارة شاملة (Kanban, Insights, Customers) | ✅ مكتمل |
| نظام وكلاء AI ×5 (Style, Content, Analytics, Customer, Inventory) | ✅ مكتمل |
| تكامل واتساب (Meta Cloud API) | ✅ هيكل جاهز |
| Email Marketing (Resend) | ✅ مكتمل |
| Shipping Integration (Aramex + Bosta) | ✅ هيكل جاهز |
| Social Proof (Viewers, Low Stock, Urgency) | ✅ مكتمل |
| نظام الإحالة (Referral) | ✅ مكتمل |
| AI Size Recommendation | ✅ مكتمل |
| Live Shopping Frontend | ✅ مكتمل |
| Audit Logs Admin Page | ✅ مكتمل |
| Style Quiz | ✅ مكتمل |
| Compare Products | ✅ مكتمل |
| Quick View Modal | ✅ مكتمل |
| Automated Firestore Backup | ✅ مكتمل |

---

## الأسبوع القادم (Week 1 — أبريل 2026)

### الأولوية القصوى 🔴

#### يوم 1–2: البيئة والإطلاق
- [ ] إضافة `NEXT_PUBLIC_FIREBASE_API_KEY` في Replit Secrets لتشغيل التطبيق
- [ ] إضافة `FIREBASE_SERVICE_ACCOUNT_BASE64` لتفعيل Admin SDK
- [ ] إضافة `GEMINI_API_KEY` لتفعيل وكلاء AI
- [ ] إضافة `RESEND_API_KEY` + `SMTP_FROM` لتفعيل الإيميلات
- [ ] اختبار كامل لتدفق الحجز (Reservation Flow)

#### يوم 3–4: تكاملات الشحن
- [ ] تسجيل حساب Aramex أو Bosta للتكامل الفعلي
- [ ] إضافة `ARAMEX_ACCOUNT_NUMBER` + `ARAMEX_ACCOUNT_PIN` في Secrets
- [ ] اختبار توليد وصل شحن حقيقي لحجز تجريبي
- [ ] ربط حالة الشحن بصفحة `/track`

#### يوم 5–7: واتساب والإشعارات
- [ ] إنشاء حساب Meta Business للـ WhatsApp Cloud API
- [ ] إضافة `WHATSAPP_API_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID`
- [ ] اختبار إرسال رسالة تأكيد حجز عبر واتساب
- [ ] تفعيل إشعارات حالة الشحن تلقائياً

---

## الأسبوع الثاني (Week 2)

### الأولوية العالية 🟠

#### تحسين تجربة المستخدم
- [ ] إضافة مكوّن SocialProof في صفحة المنتج
- [ ] ربط AI Size Recommendation بنموذج المقاسات في صفحة المنتج
- [ ] إضافة صفحة `/account/loyalty` لعرض نقاط الولاء والمعاملات
- [ ] تحسين صفحة `/account/vip` بعرض كامل لمزايا كل مستوى
- [ ] اختبار دورة الإحالة الكاملة (Referral Cycle)

#### المحتوى والـ SEO
- [ ] تشغيل Content Agent لكتابة أوصاف المنتجات الجديدة
- [ ] تحسين Structured Data لكل صفحة منتج
- [ ] إضافة Breadcrumbs لصفحات الفئات

---

## الشهر الأول (Month 1 — أبريل-مايو 2026)

### ميزات الأعمال الأساسية

#### نظام الإشعارات الكامل
- [ ] Push Notifications للمتصفح (PWA)
- [ ] إشعارات واتساب تلقائية لكل مرحلة من الحجز
- [ ] حملات إيميل مجدولة (Scheduled Email Campaigns)
- [ ] تفعيل Abandoned Reservation Recovery (استرداد الحجوزات المتوقفة)

#### Live Shopping
- [ ] تكامل مع خدمة بث فيديو (Mux أو Cloudflare Stream)
- [ ] إنشاء أول حدث Live Shopping لتشكيلة رمضان
- [ ] نظام الإشعارات للمشتركين قبل البدء
- [ ] تتبع المخزون في الوقت الفعلي خلال البث

#### لوحة الإدارة — تحسينات
- [ ] صفحة تقرير يومي/أسبوعي تلقائي بالـ Analytics Agent
- [ ] صفحة إدارة الإحالات والعروض
- [ ] تنبيهات المخزون المنخفض عبر واتساب للمسؤول
- [ ] تصدير تقارير مخصصة (Excel + CSV)

---

## الشهر الثاني (Month 2 — مايو-يونيو 2026)

### الميزات المتقدمة

#### تجربة المنتج
- [ ] **Virtual Try-On** — استخدام AR (WebXR API) لمحاولة تجربة الألوان
- [ ] **360° Product View** — عرض المنتج من كل الزوايا
- [ ] **Fabric Close-up Zoom** — تكبير نسيج القماش بتفصيل عالي
- [ ] **Style Board** — لوح مزج الإطلالات بالسحب والإفلات

#### الذكاء الاصطناعي
- [ ] **Style Agent API** — متاح كـ Widget قابل للتضمين
- [ ] **Outfit of the Week** — محتوى أسبوعي مُولَّد بالـ AI
- [ ] **Personalized Homepage** — الصفحة الرئيسية تتغير بحسب سجل العميلة
- [ ] **Predictive Search** — البحث يتوقع ما تكتبه العميلة

#### المجتمع والولاء
- [ ] **WANAS Circle** — منتدى خاص VIP للعميلات الذهبيات
- [ ] **Ambassador Program** — برنامج سفراء العلامة على السوشيال ميديا
- [ ] **Birthday Rewards** — مكافآت تلقائية في أعياد الميلاد
- [ ] **First Purchase Gift** — هدية رقمية عند أول حجز

---

## الشهر الثالث (Month 3 — يونيو-يوليو 2026)

### التوسع والنمو

#### التوسع الجغرافي
- [ ] دعم العملات (EGP, SAR, AED, KWD)
- [ ] شحن دولي (DHL Express Integration)
- [ ] صفحات محلية لكل دولة خليجية
- [ ] متطلبات ضريبة القيمة المضافة (KSA, UAE)

#### Mobile App (PWA Advanced)
- [ ] Offline Mode كامل — تصفح بدون إنترنت
- [ ] Camera Scan for DPP — مسح QR بالكاميرا
- [ ] Biometric Authentication — بصمة الإصبع/الوجه
- [ ] Home Screen Shortcuts — اختصارات سريعة

#### Analytics متقدم
- [ ] Customer Journey Mapping كامل
- [ ] Cohort Analysis للعميلات
- [ ] A/B Testing Framework
- [ ] Heatmap Integration

---

## الربع الثاني (Q3 2026 — يوليو-سبتمبر)

### الرؤية بعيدة المدى

#### منصة B2B
- [ ] **Wholesale Portal** — بوابة للموزعين
- [ ] **Retailer Dashboard** — لوحة لبوتيكات الشراكة
- [ ] **Sample Ordering** — طلب عينات للمتاجر

#### الاستدامة والشفافية
- [ ] **Carbon Footprint Calculator** — حاسبة البصمة الكربونية لكل قطعة
- [ ] **Circular Fashion Program** — برنامج إعادة التدوير
- [ ] **Artisan Profiles** — صفحات للحرفيين مع قصصهم
- [ ] **Supply Chain Transparency** — خريطة سلسلة التوريد

#### التقنية
- [ ] **Edge Runtime** — نقل APIs الحرجة لـ Vercel Edge
- [ ] **Image AI Enhancement** — تحسين صور المنتجات تلقائياً
- [ ] **Smart Inventory** — توقع المخزون بالذكاء الاصطناعي
- [ ] **Fraud Detection** — كشف الحجوزات الوهمية

---

## الربع الرابع (Q4 2026 — أكتوبر-ديسمبر)

### موسم الزفاف والأعياد

#### Wedding Suite
- [ ] **Bridal Profile** — ملف العروس الشامل (المقاسات، التفضيلات، الميزانية)
- [ ] **Wedding Party Management** — إدارة طلبات أفراد حفل الزفاف
- [ ] **Fitting Schedule** — جدول مواعيد التجربة للعروسة وصديقاتها
- [ ] **Mood Board Builder** — بناء لوح الإلهام للفستان

#### Black Friday / Eid Collection
- [ ] Flash Sales System
- [ ] Countdown Timers
- [ ] Exclusive Drops (نظام الإطلاقات الحصرية)

---

## مؤشرات الأداء المستهدفة (KPIs)

| المؤشر | الآن | هدف 3 أشهر | هدف 12 شهر |
|---|---|---|---|
| معدل التحويل (Conversion Rate) | ~3.5% | 5% | 8% |
| متوسط قيمة الحجز (AOV) | — | 12,000 EGP | 18,000 EGP |
| رضا العملاء (CSAT) | — | 4.5/5 | 4.8/5 |
| وقت تحميل الصفحة | — | <2s | <1.5s |
| نقاط Lighthouse | — | >90 | >95 |
| عدد العملاء النشطين | — | 500 | 2,000 |
| معدل الاحتفاظ (Retention) | — | 40% | 60% |

---

## المقارنة مع المنافسين

| الميزة | Farfetch | Net-a-Porter | Ounass | **WANAS** |
|---|---|---|---|---|
| E-Commerce | ✅ | ✅ | ✅ | ✅ |
| Arabic RTL كامل | ⚠️ | ⚠️ | ✅ | ✅ |
| AI Stylist | ✅ | ✅ | ❌ | ✅ |
| Digital Product Passport | ✅ | ❌ | ❌ | ✅ |
| WhatsApp Native | ❌ | ❌ | ✅ | ✅ |
| Reservation (لا سلة) | ❌ | ❌ | ❌ | ✅ (فريد) |
| Live Shopping | ✅ | ❌ | ❌ | ✅ |
| PWA | ⚠️ | ❌ | ⚠️ | ✅ |
| Loyalty Tiers | ✅ | ✅ | ✅ | ✅ |
| Size AI | ✅ | ✅ | ❌ | ✅ |
| Egyptian Heritage Focus | ❌ | ❌ | ❌ | ✅ (فريد) |
| AI Content Generation | ❌ | ❌ | ❌ | ✅ (فريد) |

---

## الأسرار المطلوبة للإطلاق الكامل

```
# Firebase (إلزامي للإطلاق)
NEXT_PUBLIC_FIREBASE_API_KEY=
FIREBASE_SERVICE_ACCOUNT_BASE64=

# AI Agents (إلزامي)
GEMINI_API_KEY=

# Email Marketing (إلزامي)
RESEND_API_KEY=
SMTP_FROM=WANAS Atelier <no-reply@wanas-atelier.com>

# WhatsApp (للإشعارات)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Shipping (للشحن الفعلي)
SHIPPING_PROVIDER=bosta
BOSTA_API_KEY=

# Security
SESSION_SECRET=
ENCRYPTION_KEY=
JWT_SECRET=
CRON_SECRET=

# Backup
FIREBASE_BACKUP_BUCKET=gs://wanas-backups
```

---

## الفريق المقترح للتوسع

| الدور | المهام |
|---|---|
| Backend Engineer | Firebase Functions, Shipping APIs, Cron Jobs |
| Frontend Engineer | New features, Performance optimization |
| UX Designer | User testing, Conversion optimization |
| Content Manager | AI content review, Brand voice |
| Customer Success | Live chat, VIP client management |
| Marketing | Campaigns, Social Media, Influencer partnerships |

---

*آخر تحديث: أبريل 2026 — WANAS Atelier Tech Team*
