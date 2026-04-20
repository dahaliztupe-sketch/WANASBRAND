---
name: refined
description: Carefully curated, modern minimal style with elegant serif typography and understated, sophisticated palettes.
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# WANAS Atelier — Refined Design System

## Mission
You are an expert design-system guideline author for WANAS Atelier — a luxury Egyptian fashion house.
Create practical, implementation-ready guidance that delivers "Quiet Luxury" (الفخامة الهادئة): understated, confident, beautifully crafted.

## Brand Identity
WANAS is a handcrafted fashion house from Cairo. Every design decision should communicate:
- Timeless elegance over trend-chasing
- Handcraft and human touch over clinical precision
- Cultural pride (Arabic heritage) expressed with global sophistication

## Style Foundations
- Visual style: quiet luxury, modern minimal, editorial
- Typography scale: 12/14/16/20/24/32/40/56/72
- Fonts:
  - Arabic body & UI: `Tajawal` (weights: 300, 400, 500, 700)
  - English headings / editorial: `Playfair Display` (weights: 400, 500, 600, 700)
  - English body / UI: `Montserrat` (weights: 300, 400, 500, 600)
  - Monospace / certificates: `JetBrains Mono`
- Spacing scale: 4/8/12/16/24/32/48/64/96

## Color Tokens

### Light Mode (Default)
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FDFBF7` | Page background (warm cream) |
| `--bg-secondary` | `#F5F0E6` | Cards, drawers, muted surfaces |
| `--text-primary` | `#1A1A1A` | Headlines and body copy |
| `--text-secondary` | `#4A4A4A` | Captions, metadata, labels |
| `--accent-primary` | `#D4AF37` | Gold — CTAs, dividers, highlights |
| `--accent-hover` | `#B8962D` | Gold hover state |
| `--border-primary` | `#D1C7B7` | Muted sand border |

### Dark Mode
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#1A1A1A` | Rich black background |
| `--bg-secondary` | `#262626` | Elevated surfaces |
| `--text-primary` | `#FDFBF7` | Cream text |
| `--text-secondary` | `#D1C7B7` | Muted sand text |
| `--accent-primary` | `#D4AF37` | Gold unchanged |
| `--accent-hover` | `#B8962D` | Gold hover |
| `--border-primary` | `#4A4A4A` | Dark border |

## Motion System — "Slow & Confident"
Every animation must feel like a luxury reveal, not a tech pop.

### Core Principles
- **Slow is elegant.** Minimum duration: 400ms. Default transitions: 600–900ms.
- **Spring physics.** Use spring animations for organic, fabric-like feel.
- **Directional meaning.** Content enters from below. Drawers slide from the correct RTL/LTR edge.
- **No bouncing.** `stiffness: 100, damping: 20` — critically damped, no overshoot.

### Motion Presets (use these in Motion/React)
```ts
// Page enter — slow editorial reveal
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

// Spring — for interactive elements (drawers, sheets, cards)
export const springConfig = { type: 'spring', stiffness: 100, damping: 20 };

// Stagger children — for product grids
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

// Clip reveal — for editorial content (text, images)
export const clipReveal = {
  initial: { clipPath: 'inset(0 100% 0 0)' },
  animate: { clipPath: 'inset(0 0% 0 0)' },
  transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
};

// Hover scale — subtle, never jarring
export const hoverScale = { scale: 1.02, transition: { duration: 0.6 } };

// Image zoom on hover
export const imageZoom = {
  whileHover: { scale: 1.08 },
  transition: { duration: 2, ease: [0.22, 1, 0.36, 1] }
};
```

## Typography Rules
- Use `font-arabic` (`Tajawal`) for ALL text when `dir="rtl"` is set.
- Use `font-serif` (`Playfair Display`) for EN headings: hero titles, product names, section headers.
- Use `font-sans` (`Montserrat`) for EN body: labels, captions, descriptions, UI text.
- **Never mix Arabic words into an EN font-family.** Always apply `font-arabic` wrapper.
- Heading sizes: `text-5xl` → `text-9xl` for editorial heroes; `text-2xl` → `text-4xl` for page headings.
- **Letter spacing:** English headings `tracking-tight`; English labels `tracking-[0.3em]` uppercase. Arabic: `tracking-normal` only.

## RTL Awareness (Arabic Support)
This is an **absolute requirement.** All layout logic must be bidirectional-aware.

### Logical Property Rules
| ❌ Do NOT use | ✅ Use instead |
|---|---|
| `pl-*`, `pr-*` | `ps-*`, `pe-*` |
| `ml-*`, `mr-*` | `ms-*`, `me-*` |
| `left-*`, `right-*` (for layout) | `start-*`, `end-*` |
| `border-l-*`, `border-r-*` | `border-s-*`, `border-e-*` |
| `rounded-l-*`, `rounded-r-*` | `rounded-s-*`, `rounded-e-*` |
| `text-left`, `text-right` | `text-start`, `text-end` |

### Directional Animations
- Drawers must slide from `end` (right in LTR, left in RTL).
- Arrows pointing "forward" must flip in RTL: use `rtl:rotate-180` on `<ArrowRight />`.
- Chevrons must flip: use `rtl:scale-x-[-1]`.

### Font Application
```tsx
// Correct pattern
<div className={language === 'ar' ? 'font-arabic' : 'font-sans'}>
```

## Component Families
- buttons, inputs, forms, selects, checkboxes, textareas
- date pickers, file uploaders, cards, tables, data lists
- badges, avatars, breadcrumbs, pagination, steppers
- modals, drawers/sheets, tooltips, menus, navigation
- sidebars, headers, command palette, tabs, accordions
- carousels, progress indicators, skeletons, alerts/toasts
- empty states, onboarding, authentication screens, settings pages
- product cards (bento layout: hero/tall/wide/compact/feature)
- digital product passports, reservation flows, concierge chat

## Accessibility
- WCAG 2.2 AA minimum contrast ratios: 4.5:1 body, 3:1 large text
- All interactive elements must have visible `focus-visible` ring: `outline-none focus-visible:ring-2 focus-visible:ring-accent-primary`
- Minimum touch targets: 44×44px
- Keyboard-first: Tab, Enter, Space, Escape all handled
- ARIA labels in both EN and AR

## Writing Tone
- English: refined, evocative, literary. Avoid corporate jargon.
- Arabic: elegant Modern Standard Arabic (فصحى معاصرة) with occasional colloquial warmth.
- Never use exclamation marks in product copy.
- CTAs: "Discover", "Reserve", "Explore the Collection" — never "Buy Now" or "Add to Cart".

## Rules: Do
- Prefer semantic CSS tokens (`var(--accent-primary)`) over raw hex values in components
- Preserve visual hierarchy through generous whitespace (breathing room = luxury)
- Keep interaction states explicit: default, hover, focus-visible, active, disabled, loading, error
- Use `limit()` on every Firestore query
- Use `Promise.all()` for parallel data fetching
- Wrap async boundaries in `<Suspense>` with skeleton fallbacks

## Rules: Don't
- Never use `ml-*` or `mr-*` for directional layout
- Never use inline `style={{ color: '#D4AF37' }}` — use Tailwind tokens
- Never animate at `duration < 300ms` for transitions (feels cheap)
- Never show raw error messages to users — use elegant fallback states
- Never load fonts without `display: swap`
- Never expose secrets in `NEXT_PUBLIC_` env vars

## Skeleton Loading Pattern
All data-dependent sections must show a skeleton while loading:
```tsx
<Suspense fallback={<ProductGridSkeleton />}>
  <ProductGrid productsPromise={promise} />
</Suspense>
```
Skeletons use `bg-primary/5` base with shimmer: `animate-[shimmer_1.5s_linear_infinite]`.

## Quality Gates
1. Every component must render correctly in both LTR (EN) and RTL (AR)
2. All Firestore queries must have `limit()` applied
3. Every interactive element must have an `aria-label`
4. Page-level loading states must use `<Suspense>` + skeleton
5. Motion durations must be ≥ 400ms for transitions, ≥ 800ms for editorial reveals
6. No TypeScript `any` casts — use proper type definitions

## QA Checklist
- [ ] RTL layout correct (no left/right artifacts)
- [ ] Arabic font applied when `dir="rtl"`
- [ ] Gold accent applied to interactive highlights
- [ ] Skeleton shown during data load
- [ ] All Firestore queries have `limit()`
- [ ] Animations use spring or luxury easing `[0.22, 1, 0.36, 1]`
- [ ] No console errors or warnings in browser
- [ ] WCAG contrast passes on gold-on-cream

<!-- TYPEUI_SH_MANAGED_END -->
