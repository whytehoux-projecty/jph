# ANALYSIS.md — Heritage Trust Bank, Ledger Redesign
**Phase 0 read-only recon. No source files modified.**
Date: 2026-10-01 | Current year: 2026

---

## 10-Line Summary

This is a **Next.js 15 / React 19 / Tailwind v4** monorepo, **not** a Vite + React app as the brief assumed. All three products (marketing site, e-banking portal, admin portal) live in a single repo under route groups: `(corporate)` = marketing, `(portal)` = e-banking, `(admin)` = admin. A single `middleware.ts` with an explicit `PUBLIC_PATHS` array controls access; marketing routes are already whitelisted. Tailwind is v4 (uses `@import "tailwindcss"` + `@config` in CSS, with a `tailwind.config.ts` still present for token definitions). The current identity is navy/gold with Playfair Display + Inter + JetBrains Mono — all three targeted for replacement. The database is Supabase PostgreSQL accessed via Prisma; form submissions call server actions that write to `AccountApplication` and `OnlineAccessRequest` tables. Almost all audit findings A1–A19 are confirmed in code. The most critical issues are: wrong brand everywhere (JP Heritage vs Heritage Trust), forbidden strings, image placeholders with `[ Image: … ]` text, `maximumScale:1` in root layout, `136` hardcoded in three places, real third-party names as endorsers (J.D. Power, Goldman Sachs, Fortune 100), SVB-replacement and CDFI claims, and four `href="#"` social links. Scope isolation is achievable by restricting changes to `app/(corporate)`, `components/commercial`, `components/commercial-ui`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, and a new `src/content/facts.ts`.

---

## Findings Verdict Table — A1 through A19

| ID | Finding | Verdict | Code Location | Action |
|----|---------|---------|--------------|--------|
| A1 | Four competing enrollment/open-account CTAs | **Confirmed** | `components/layout/Header.tsx` L66–88 | Remove `Access Vault` dropdown; keep one primary `Open an account` → `/apply`; add text `Sign in` → `/login` |
| A2 | `/security`, `/help`, `/products/*` redirect to `/login` | **Confirmed** | `middleware.ts` L9–44 | Add all new marketing routes to `PUBLIC_PATHS` |
| A3 | Footer personal/business links all point to same page; social icons `href="#"` | **Confirmed** | `Footer.tsx` L38–91 | Add distinct anchors per §7.2; remove social icons |
| A4 | `/apply` empty body | **Different cause** | `apply/page.tsx` | Page is client-rendered; audit fetched without JS. Page is 30KB and exists. Rebuild to multi-step flow per §8.1 |
| A5 | Literal `[ Image: … ]` text | **Confirmed** | `personal-banking/page.tsx` L120, `business-banking/page.tsx` L140, `about/page.tsx` L163 | Replace with real images |
| A6 | `maximum-scale=1` | **Confirmed** | `app/layout.tsx` L39 (`maximumScale: 1`) | Remove the property |
| A7 | Pages inherit home title; no og:image/canonical | **Confirmed (partial)** | `(corporate)/layout.tsx` L7–21 | Add `generateMetadata` to each page; create `og-default.png` |
| A8 | "136 years", "$2B+ AUM" contradicts "$48B+", five institutions | **Confirmed** | `page.tsx` L38; `wealth/page.tsx` L160; `about/page.tsx` L10; `BankMergerShowcase.tsx` L199–209 | Centralise in `facts.ts`; compute years dynamically |
| A9 | Two product catalogues; "Vault" for five things | **Confirmed** | `page.tsx` L44–69 + `ProductGrid.tsx` L16–89 | Delete `ProductGrid.tsx`; unify per brief §6.4 |
| A10 | Stat band repeated; marquee triplicated in DOM | **Confirmed** | `page.tsx` L152; `BankMergerShowcase.tsx` L57–58 | Remove marquee entirely |
| A11 | One testimonial under "thousands of satisfied customers" | **Confirmed** | `Testimonials.tsx` L80–82 | Replace with two B2B outcome cards; delete component |
| A12 | Real orgs as endorsers/employers | **Confirmed** | `about/page.tsx` L62 Goldman Sachs; L97 J.D. Power; L99 Fortune 100; L68 OCC | Replace with fictional names per §6.6 |
| A13 | `$0 Monthly Fee*` no footnote; no "as of" dates | **Confirmed** | `personal-banking/page.tsx` (no footnote block) | Add `Footnote` component; add "APY as of {date}" on all rates |
| A14 | No Contact link in nav or footer | **Confirmed** | `Header.tsx`; `Footer.tsx` | Add Contact to header utility row; add Contact column in footer |
| A15 | Login "Forgot?" → `/contact` | **Not inspectable** | `app/(portal)/login/*` (out of scope) | Document as recommendation |
| A16 | `/signup` asks SSN and DOB | **Confirmed** | `signup/page.tsx` L15–30 | Remove SSN/DOB; DB schema only stores `accountNumber` + `email` — they were never sent to backend |
| A17 | Hero has three primary-looking actions | **Confirmed** | `page.tsx` L112–129 | Two competing gold/outline buttons. Reduce to one primary + one text link |
| A18 | Mixed image formats; `happy-customer-1.jpg` filename | **Confirmed** | `public/images/new/`; `Testimonials.tsx` L24 | Convert hero to AVIF+WebP; rename files by content |
| A19 | "first major bank" (2007), CDFI, "SVB-replacement" | **Confirmed** | `about/page.tsx` L32, L150; `business-banking/page.tsx` L86 | Soften timeline; remove CDFI claim; remove SVB-replacement |

---

## Full Stack and Structure Analysis

| Area / file | Current state | Verdict | Notes |
|-------------|--------------|---------|-------|
| **Runtime** | Next.js 15.1 / React 19 | **Keep** | SSR/RSC by default; `generateMetadata` for SEO. Brief assumed Vite — adapt all instructions to Next.js patterns |
| **Tailwind** | v4 (`@import "tailwindcss"`; `@tailwindcss/postcss`) | **Keep v4** | Appendix B tokens go in `@theme {}` block in CSS, not `tailwind.config.ts theme.extend` |
| **Router** | Next.js App Router (file-system, route groups) | **Keep** | No separate router library needed |
| **Auth guard** | `middleware.ts` + `next-auth` v5 beta; `PUBLIC_PATHS` array | **Adapt** | Extend `PUBLIC_PATHS` for all new marketing routes. Portal/admin logic untouched |
| **Marketing routes** | `/`, `/personal-banking`, `/business-banking`, `/wealth`, `/about`, `/contact`, `/apply`, `/signup`, `/privacy`, `/terms` | **Adapt** | New routes need pages + `PUBLIC_PATHS` entries |
| **Portal routes** | `(portal)` group: `/dashboard`, `/accounts`, `/login`, etc. | **Do not touch** | Separate. `PortalHeader`, `LeftSidebar` used internally |
| **Admin routes** | `(admin)/admin/*` | **Do not touch** | Separate |
| **Shared layout components** | `Header.tsx`, `Footer.tsx` — used by `(corporate)` layout only | **Adapt safely** | Portal uses `PortalHeader` + `LeftSidebar`. `components/ui/*` is portal-only — do not delete |
| **`lib/constants.ts`** | `BANK_INFO` (JP Heritage brand), `ROUTES` | **Replace** | Create `src/content/facts.ts` as source of truth; update `lib/constants.ts` to re-export |
| **Forms (marketing)** | Manual validation; no RHF/Zod | **Adapt** | RHF + Zod already installed. Use them for multi-step `/apply` |
| **Form submission** | Server actions → Prisma → Supabase | **Keep contract** | `requestAccountOpening` + `requestOnlineAccess` targets unchanged; extend payload additively |
| **`AccountApplication` schema** | Required: name, email, phone, DOB, address, city, state, zip, employment, income | **Keep; extend** | Multi-step form must collect all required fields |
| **Tailwind tokens** | Navy/gold palette; Playfair/Inter/JetBrains Mono | **Replace** | Add Ledger tokens alongside; remove old tokens in Phase 7 after checking portal usage |
| **Fonts** | Google Fonts import in both `globals.css` files | **Replace** | Use `next/font/google` (auto-self-hosted); or Fontsource packages |
| **`(corporate)/globals.css`** | Marketing-specific styles + Google Fonts import | **Adapt** | Ledger tokens and Ledger font imports go here |
| **Root `app/globals.css`** | shadcn HSL vars + Tailwind import (used by portal too) | **Isolate** | Only remove the Google Fonts import; keep all shadcn vars |
| **`app/layout.tsx`** | Sets `maximumScale:1`; JP Heritage metadata | **Adapt** | Remove `maximumScale`; update portal metadata (not marketing) |
| **`vercel.json`** | Security headers; no `X-Robots-Tag`; no `/signup` redirect | **Adapt** | Add noindex header; add `/signup`→`/enroll` permanent redirect |
| **`robots.txt`** | Missing | **Build** | Create `public/robots.txt` disallowing all while private |
| **`BankMergerShowcase.tsx`** | Marquee; inline styles; forbidden fonts in `<style>` tag | **Remove** | Replace with static acquisitions block |
| **`ProductGrid.tsx`** | Forbidden product names (Legacy Builder, Founders Circle, etc.); "135 years" | **Remove** | Replaced by Segments section |
| **`Testimonials.tsx`** | `happy-customer-*.jpg` avatars; "thousands" claim; auto-play carousel | **Remove** | Replaced by Outcomes cards |
| **`Statistics.tsx`** | Not imported anywhere on marketing | **Remove** | Dead component |
| **`Hero.tsx`** | Not imported by any marketing page | **Remove** | Dead — home page inlines its hero |
| **`EBankingWidget.tsx`** | Not imported by home page | **Evaluate** | Grep before removing — may be used on portal pages |
| **Accessibility** | No skip link; mobile menu not focus-trapped; no `aria-current`; `maximumScale:1` | **Fix in Phase 1+3** | All items in §11.1 |
| **SEO** | No canonical; no `og:image`; no `twitter:card`; `keywords` meta present | **Fix in Phase 1+4** | Build `generateMetadata` pattern; create `og-default.png` |
| **`images.unoptimized: true`** | Set in `next.config.mjs` L10 | **Pending decision** | Must be removed for `<Image>` to serve AVIF/WebP. Record in OPEN_QUESTIONS |
| **`auth.config.ts`** | `authorized` returns `true` (middleware handles auth) | **Keep** | Clean pattern |
| **`postcss.config.mjs`** | `@tailwindcss/postcss` | **Keep** | Required for Tailwind v4 |

---

## Where This Brief Is Wrong or Incomplete for This Codebase

1. **"Vite + React"** — Repo is Next.js 15 App Router. Strictly an improvement. All brief instructions apply; use Next.js equivalents (`next/font`, `generateMetadata`, `dynamic()`, server actions).
2. **"Tailwind v3 `theme.extend`"** — v4 is installed. Ledger tokens go in `@theme {}` CSS block, not `tailwind.config.ts`.
3. **"`React.lazy` code splitting"** — Use `dynamic()` from Next.js instead. Server Components are already split automatically.
4. **"Fontsource self-host"** — `next/font/google` is the idiomatic choice; it auto-self-hosts at build time. Either approach works; `next/font/google` is preferred.
5. **"`vercel.json` SPA rewrite"** — Not needed; Next.js SSR handles all routes. The rewrite rule from Appendix C would conflict with Next.js routing. Omit it.
6. **"`images.unoptimized: true`"** — Must be set to `false` for AVIF/WebP via `<Image>`. This may incur Vercel image optimization costs on a demo plan — confirm with owner.
7. **"No form library"** — RHF + Zod are already installed. The multi-step `/apply` form should use them for consistency.
8. **"Admin portal payload shape"** — The `AccountApplication` schema has several required fields not currently collected by the marketing form. The new multi-step form must fill them. No schema migration required — just collect the data properly.
