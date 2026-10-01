# PLAN.md — Heritage Trust Bank, Ledger Redesign
**Implementation roadmap for `feat/ledger-rebrand` branch.**
Date: 2026-10-01

---

## Branch Setup

```bash
git checkout -b feat/ledger-rebrand
```

---

## Phase 0 — Recon and Docs (complete, no source files changed)

- [x] ANALYSIS.md
- [x] PLAN.md
- [x] OPEN_QUESTIONS.md
- [ ] Before screenshots (captured during Phase 1 browser run)

---

## Phase 1 — Foundation
**Commit message:** `feat(foundation): Ledger tokens, fonts, facts, viewport, vercel, noindex, 404, auth-guard fix`

### Files touched
| File | Change |
|------|--------|
| `app/layout.tsx` | Remove `maximumScale: 1`; update `appleWebApp.title` to "Heritage Trust" |
| `app/(corporate)/globals.css` | Replace Google Fonts import with `next/font/google` imports (in layout); add `@theme {}` block with all Ledger tokens (Appendix B); add Ledger base CSS (`:root`, `.theme-ink`, `body`, `:focus-visible`, `.tabular`, `@media prefers-reduced-motion`) |
| `app/(corporate)/layout.tsx` | Wire `next/font/google` font variables to `<div>` classNames; update `metadata` (title template, description, og); add `themeColor: '#FBF9F4'` to viewport export |
| `src/content/facts.ts` | **Create.** Seed from Appendix A: `BRAND`, `yearsOfService()`, `FACTS`, `RATES`, `ACQUISITIONS` |
| `lib/constants.ts` | Update `BANK_INFO` and `ROUTES` to pull from `facts.ts`; add `/enroll`, `/security`, `/help`, `/locations`, `/status`, `/rates-and-fees`, `/accessibility` routes |
| `middleware.ts` | Add to `PUBLIC_PATHS`: `/enroll`, `/security`, `/help`, `/status`, `/locations`, `/rates-and-fees`, `/terms`, `/accessibility`, `/careers`, `/press`, `/investors`; add prefix `/products` |
| `vercel.json` | Add `X-Robots-Tag: noindex, nofollow` header (removable later via env switch); add `{ source: "/signup", destination: "/enroll", permanent: true }` redirect |
| `public/robots.txt` | **Create.** `User-agent: * / Disallow: /` while private |
| `app/(corporate)/not-found.tsx` | **Create.** Real 404: wordmark, one line, three useful links. No redirect to login |
| `tailwind.config.ts` | Add Ledger tokens to `theme.extend` (colours, fontFamily, fontSize, borderRadius, maxWidth) as backup for the `@config` path; keep old tokens alongside |

### Verification gate
- `npm run build` passes
- No new console errors
- `/security` and `/help` no longer redirect to `/login` (test by fetching without auth)

---

## Phase 2 — Primitives
**Commit message:** `feat(primitives): Button, Figure, Footnote, FormField, Select, Checkbox, RadioRow, FileDrop, StepIndicator, FormError, FormSuccess`

### Files touched
| File | Change |
|------|--------|
| `components/commercial-ui/Button.tsx` | Rewrite: variants (primary/secondary/text), sizes, hover/focus/active/disabled/loading states; Ledger colours; no drop shadows |
| `components/commercial-ui/Figure.tsx` | **Create.** Mono value + label + footnote ref (superscript). Uses `font-mono tabular-nums`. |
| `components/commercial-ui/Footnote.tsx` | **Create.** Footnote list renderer |
| `components/commercial-ui/Disclosure.tsx` | **Create.** Wealth/investment disclosure block |
| `components/forms/FormField.tsx` | **Create.** Label + input + error + `aria-describedby` wrapper |
| `components/forms/RadioRow.tsx` | **Create.** Account-type picker (large selectable rows) |
| `components/forms/FileDrop.tsx` | **Create.** PDF/JPG drop zone with size limit display |
| `components/forms/StepIndicator.tsx` | **Create.** "Step n of N" with `aria-live="polite"` |
| `components/forms/FormError.tsx` | **Create.** Error state: icon + text + `role="alert"` |
| `components/forms/FormSuccess.tsx` | **Create.** Success/done screen: reference number, next steps |

### Verification gate
- `npm run build` passes
- Storybook equivalent: manually test Button in all states if a dev server is running

---

## Phase 3 — Chrome (Header, Footer, Mobile Menu)
**Commit message:** `feat(chrome): Header, MobileMenu, Footer, SkipLink — Ledger identity, correct links, Contact in nav`

### Files touched
| File | Change |
|------|--------|
| `components/layout/Header.tsx` | Rewrite with Ledger identity: wordmark "Heritage Trust" (text, no logo image initially); nav: Personal / Business / Wealth / About; utility: `Locations`, `Contact`, `Sign in` (text), `Open an account` (primary button); remove `Access Vault` dropdown; `aria-current="page"`, skip link |
| `components/commercial/SkipLink.tsx` | **Create.** First element in layout, links to `#main-content` |
| `app/(corporate)/layout.tsx` | Add `<SkipLink />`; add `id="main-content"` to content wrapper |
| `components/layout/MobileMenu.tsx` | **Create** as standalone component (extracted from Header); focus-trapped; `Escape` closes; body scroll locked; full-height sheet |
| `components/layout/Footer.tsx` | Rewrite: 4 columns (Personal, Business, Online Banking, Company) with distinct anchors; no `href="#"` social icons; `theme-ink` background; Contact and Locations in Company column; legal row with Rates & Fees, Accessibility; `Heritage Trust Bank, N.A. Member FDIC. Equal Housing Lender.` |
| `components/commercial/SecurityNoticeBanner.tsx` | Update brand text: "Heritage Trust" instead of "JP Heritage" |

### Verification gate
- All footer links resolve to a rendered page or an in-page anchor (no `href="#"`)
- Mobile menu: focus trapped, `Escape` closes, body scroll locked
- Skip link appears on focus
- `aria-current="page"` on active nav item

---

## Phase 4 — Pages
**Commit message:** `feat(pages): Home, Personal, Business, Wealth, About, Contact — Ledger identity, facts module, no forbidden strings`

### Files touched (marketing pages only)
| File | Change |
|------|--------|
| `app/(corporate)/page.tsx` | Rewrite to §7.4 structure: Hero (headline + 1 APY figure + 1 primary CTA + 1 text link), Proof strip (4 figures from facts), Segments (Personal/Business/Wealth), Outcomes (2 case studies), Vault band (theme-ink), Security (3 facts linking to /security), Footer. Remove ProductGrid, Testimonials, BankMergerShowcase |
| `app/(corporate)/(commercial)/personal-banking/page.tsx` | Adapt: comparison row; anchor IDs (#checking #savings #card #loan #mortgages); replace image placeholder with real image or PhoneFrame; add footnotes; remove "#1 for 8 years" or restate as invented award; figures from facts |
| `app/(corporate)/(commercial)/business-banking/page.tsx` | Adapt: keep 3 case studies, move one up; anchor IDs; add Treasury section; footnote $0 Monthly Fee*; remove SVB-replacement and CDFI; replace image placeholder |
| `app/(corporate)/wealth/page.tsx` | Adapt: remove "136"; differentiate three tiers visually; one primary CTA; phone link from facts; wealth disclosure |
| `app/(corporate)/(commercial)/about/page.tsx` | Adapt: dynamic year (`yearsOfService()`); id="leadership"; replace Goldman/JD Power/Fortune 100/OCC with fictional equivalents; trim recognitions to 3 invented; remove "first major bank" claim; remove CDFI; replace image placeholder; keep timeline (soften 2007 claim) |
| `app/(corporate)/contact/page.tsx` | Rewrite: two blocks (New / Existing); topic select pre-fillable from `?topic=`; success state; facts-sourced phone/email |
| `app/(corporate)/privacy/page.tsx` | Update: date, remove "Data Protection Officer" → "Privacy Office", GLBA summary, state rights section |
| `app/(corporate)/terms/page.tsx` | Update: brand strings, Heritage Trust references |
| `components/commercial/BankMergerShowcase.tsx` | Delete after migration |
| `components/commercial/ProductGrid.tsx` | Delete after migration |
| `components/commercial/Testimonials.tsx` | Delete after migration |
| `components/commercial/Statistics.tsx` | Delete (dead component) |
| `components/commercial/Hero.tsx` | Delete (dead component) |

### `generateMetadata` pattern for each page
```ts
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Page Title',
    description: '…',
    openGraph: { images: [{ url: '/images/og-default.png' }] },
    twitter: { card: 'summary_large_image' },
  };
}
```

### Verification gate
- Zero instances of: `JP Heritage`, `jpheritage`, `136`, `135 years`, `[ Image:`, `href="#"`, `Goldman`, `J.D. Power`, `Fortune 100`, `SVB`, `CDFI`, `Playfair`, `Space Mono`, `Legacy Builder`, `Golden Years`, `Founders Circle`, `White Glove`
- All page titles unique; og:image present on all routes
- All image placeholders replaced

---

## Phase 5 — Flows: /apply, /enroll, /status
**Commit message:** `feat(flows): /apply multi-step, /enroll one-screen, /status lookup, /signup permanent redirect`

### Files touched
| File | Change |
|------|--------|
| `app/(corporate)/apply/page.tsx` | Rebuild as multi-step form (Server Component shell + `'use client'` form component). Account-type picker → branching steps per §8.1. Use RHF + Zod. Keep `requestAccountOpening` server action; extend payload to cover all required DB fields. Draft saved in `sessionStorage` (no SSN/EIN). Reference number format `HT-APP-XXXXXX`. |
| `app/(corporate)/enroll/page.tsx` | **Create.** One-screen enrollment per §8.2. Remove SSN/DOB. Keep `requestOnlineAccess` action. Reference number `HT-ENR-XXXXXX`. |
| `app/(corporate)/status/page.tsx` | **Create.** Reference-number lookup. Client calls `/api/status?ref=` (see API route below). Static state machine if no endpoint. |
| `app/api/status/route.ts` | **Create.** GET handler: parses `ref` query param, determines type (HT-APP- or HT-ENR-), queries Prisma for matching record, returns `{ status, type, createdAt }`. |
| `middleware.ts` | Already updated in Phase 1 to include `/enroll` and `/status` in `PUBLIC_PATHS`. |
| `next.config.mjs` | Add `/signup` → `/enroll` redirect (belt + suspenders alongside vercel.json) |

### Verification gate
- `/apply` happy path: submit each account type, verify payload reaches DB
- `/apply` validation: per-step validation on blur and on continue
- `/apply` Back: does not lose data
- `/enroll` happy path: submit, verify `OnlineAccessRequest` created
- `/status` with a valid HT-APP reference number shows correct status
- No SSN/DOB in `/enroll`
- `sessionStorage` cleared on done screen

---

## Phase 6 — New Content Routes
**Commit message:** `feat(routes): /security, /help, /products/:slug, /locations, /rates-and-fees, /terms, /accessibility, /careers, /press, cookies modal`

### Files touched
| File | Change |
|------|--------|
| `app/(corporate)/security/page.tsx` | **Create.** Three security facts; password/OTP warning; links to /contact and /help |
| `app/(corporate)/help/page.tsx` | **Create.** FAQ accordion (Radix `@radix-ui/react-accordion` already installed). Categories: Account, Vault, Loans, Contact |
| `app/(corporate)/products/[slug]/page.tsx` | **Create.** One template for all 9 product slugs. Static `generateStaticParams`. |
| `app/(corporate)/locations/page.tsx` | **Create.** Branch list (static, from facts); search field (optional); static map image |
| `app/(corporate)/rates-and-fees/page.tsx` | **Create.** Rates table with "as of" date; fee schedule; footnotes |
| `app/(corporate)/accessibility/page.tsx` | **Create.** Accessibility statement |
| `app/(corporate)/careers/page.tsx` | **Create.** 5–6 fictional job entries; no live apply |
| `app/(corporate)/press/page.tsx` | **Create.** 5–6 fictional press entries |
| `app/(corporate)/investors/page.tsx` | **Create.** Light page for fictional holding company, or redirect if owner chooses to remove link |
| `components/commercial/CookieModal.tsx` | **Create.** Modal (Radix Dialog); remembers choice in `localStorage`; opened from footer |
| `middleware.ts` | All new routes already added in Phase 1 |

### Verification gate
- All footer links resolve to a rendered page
- `/help` accordion: keyboard operable
- Cookie modal: focus-trapped, choice remembered

---

## Phase 7 — Cleanup
**Commit message:** `chore(cleanup): remove old tokens, fonts, dead components, marquee; run forbidden-string grep`

### Files touched
| File | Change |
|------|--------|
| `tailwind.config.ts` | Remove old tokens (`heritage-navy`, `soft-gold`, `warm-cream`, `vintage-green`, `charcoal`, etc.) **after** confirming portal does not use them via class names (grep: `heritage-navy`, `soft-gold` in `app/(portal)` and `components/portal`) |
| `app/(corporate)/globals.css` | Remove old Playfair/Inter/JetBrains Google Fonts import; remove old CSS vars |
| `app/globals.css` | Remove only the Playfair Google Fonts import (root layout); keep shadcn vars |
| Dead components | Delete confirmed dead: `Statistics.tsx`, `Hero.tsx` (already done in Phase 4 if removed then) |
| Unused images | Flag `happy-customer-*.jpg` as deletable; confirm none used in portal |

### Verification gate (full forbidden-string grep)
```bash
grep -rn "JP Heritage\|jpheritage\|136\|135 years\|Image:\|href=\"#\"\|maximum-scale\|maximumScale.*1\|Playfair\|Space Mono\|Legacy Builder\|Golden Years\|Founders Circle\|White Glove\|J\.D\. Power\|Goldman\|SVB\|Fortune 100\|lorem\|happy-customer" src/ public/ --include="*.tsx" --include="*.ts" --include="*.css" --include="*.json"
```
Must return zero matches in marketing-scope files.

---

## Phase 8 — Docs (Final)
**Commit message:** `docs(agent): CHANGELOG, RECOMMENDATIONS, after screenshots`

- Write `docs/agent/CHANGELOG.md`
- Write `docs/agent/RECOMMENDATIONS.md`
- Capture after screenshots at 390 / 768 / 1440 px for all routes → `docs/agent/after/`

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| `images.unoptimized: true` blocks AVIF/WebP serving | High | Confirm with owner; if cost is concern, manually generate AVIF/WebP and serve via `<picture>` without `<Image>` optimisation |
| Old Tailwind token classes used by portal | Medium | Grep `app/(portal)` and `components/portal` for `heritage-navy`, `soft-gold` etc. before removing from `tailwind.config.ts` |
| `AccountApplication` required DB fields not collected by current form | High | Multi-step form in Phase 5 collects all required fields; fallback: make `address`, `city`, `state` optional in Prisma schema (migration needed) |
| `next-auth` v5 beta breaking changes | Low | Not modifying auth at all |
| Supabase Postgres image storage for `/apply` document uploads | Medium | Use Next.js `/api/upload` route with Supabase Storage; record in OPEN_QUESTIONS if no bucket exists |

## Overrides to the Brief (code-driven)

| Brief Instruction | Override | Reason |
|------------------|---------|--------|
| "Vite + React" patterns | Use Next.js equivalents | Repo is Next.js 15 |
| Tailwind v3 `theme.extend` | Use `@theme {}` CSS block | Tailwind v4 installed |
| `React.lazy` | Use `dynamic()` | Next.js idiom |
| Fontsource | Use `next/font/google` | Auto-self-hosts; cleaner |
| `vercel.json` SPA rewrite | Omit | Conflicts with Next.js SSR routing |
| "No form library" in brief | Use RHF + Zod | Already installed; complex multi-step form warrants it |
