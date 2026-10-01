# AGENT BRIEF: Heritage Trust Bank marketing site (redesign, "Ledger" identity)

You are a senior product designer and front-end engineer working inside an **existing** Vite + React + Tailwind repository. This brief is a **guide and a set of recommendations, not a rebuild-from-scratch spec**. Your first job is to read the code and decide, item by item, what already works, what must change, and what to improve beyond this brief.

---

## 0. Operating protocol (follow in order)

**Phase 0: Recon and gap analysis (read-only; change no source files).**

1. Explore the whole repository. Answer every question in section 4.
2. Write `docs/agent/ANALYSIS.md` using the verdict table format in section 4.3.
3. Write `docs/agent/PLAN.md`: ordered phases, files touched, risks, and anything in this brief you are overriding because the code says otherwise.
4. Write `docs/agent/OPEN_QUESTIONS.md` for anything you cannot decide from the code. **Do not stop to ask**; state your assumption, record it, and continue. Only stop if continuing would risk the portal or admin apps.

**Phase 1+: Implement** in the order in section 12, one commit per phase, on a feature branch (`feat/ledger-rebrand`). After each phase run the checks in section 13.

**Phase Final:** write `docs/agent/CHANGELOG.md` (what changed and why) and `docs/agent/RECOMMENDATIONS.md` (section 14), then give a short summary.

### Ground rules

- **Scope: the public marketing site only.** Do **not** modify the e-banking portal or admin portal code, routes, API contracts or environment variables. If portal and marketing share a repo, a bundle or components, isolate your changes and record the coupling in ANALYSIS.md.
- **Code reality beats this brief.** Where the brief assumes something the code doesn't have (a router, a form library, a component), adapt and note it.
- **Reuse before you build.** Search for an existing component, hook or util before creating one. Extend; don't duplicate.
- **Don't upgrade the toolchain.** Keep the installed Tailwind major version (see 4.1 for how to adapt tokens). Don't swap routers, state libraries or form libraries unless they are the cause of a defect.
- **Never invent facts silently.** Every number, claim and name shown to the visitor comes from the single `facts` module (section 6) or is flagged in OPEN_QUESTIONS.md.
- **Realism is the goal.** The site must look and read like a real US national bank. No visible "demo" banners, placeholder text, lorem ipsum or `#` links. Privacy is handled technically (section 11.4), not with visible disclaimers.
- **Do not collect or store real sensitive data.** No full SSN/EIN storage or logging anywhere in the marketing app.

---

## 1. Project context

- **Brand (decided):** legal name **Heritage Trust Bank, N.A.**; short name **Heritage Trust**; online-banking product **Heritage Vault** (use "Vault" for nothing else). Founded **1888**, New York.
- **Current live site:** [https://jpheritage.vercel.app](https://jpheritage.vercel.app), branded "JP Heritage Bank". Everything "JP Heritage" becomes "Heritage Trust".
- **Audience:** the owner is the demo's audience, so optimise for realism and polish rather than conversion funnels.
- **Identity (decided):** **Ledger**, warm paper surfaces, hard ink, one vermilion signal colour (tokens in Appendix B). Replace navy/gold and Playfair Display / Inter / Space Mono.
- **Separate deployment:** the portal is a different deployment. The marketing site leads the new identity; note (don't build) what the portal needs later (section 14).

---

## 2. Findings from an independent audit of the live site (verify each against code)

The audit looked at rendered text and metadata only, not pixels or the code. Treat each item below as a **hypothesis**. For every one, record in ANALYSIS.md: **Confirmed / Already fixed / Different cause / Not applicable**, and where in the code it lives.

| ID | Finding (as observed on the live site) |
| --- | --- |
| A1 | Four competing enrollment/open-account CTAs: header `Open Account`→`/apply`, `Access Vault`→`Log in`→`/login`, `Apply to Use`→`/signup`; login page's "Not enrolled? Sign up now"→`/apply`. |
| A2 | `/security`, `/help`, `/products/heritage-vault` redirect to `/login?redirect=…`. Unknown routes appear to fall into an auth guard instead of a 404. |
| A3 | Footer: all personal links → `/personal-banking`; all business links → `/business-banking`; Mortgages and Treasury Management have no content; four social icons are `href="#"`. |
| A4 | `/apply` rendered header and footer only (empty body) when fetched. |
| A5 | Literal text "\[ Image: … \]" on `/personal-banking`, `/business-banking`, `/about`. |
| A6 | Viewport meta contains `maximum-scale=1` (blocks pinch zoom). |
| A7 | `/contact`, `/apply`, `/signup` inherit the home page title and description; no `og:image`/`og:url`; `twitter:card=summary`; doubled brand in titles ("… |
| A8 | Contradictory facts: "136 years" (should be 138 in 2026), "135 years" on one card, $48B+ vs $2B+ assets, "five institutions united" including two "partnerships", acquired bank named "Heritage Trust Bank". |
| A9 | Two product catalogues on the home page with different names (Heritage Checking/Savings vs Legacy Builder/Golden Years/Founders Circle/White Glove…); "Vault" used for five different things. |
| A10 | Home page repeats stat bands (also About and Wealth); partner marquee is triplicated in the DOM. |
| A11 | One testimonial under the headline "Join thousands of satisfied customers". |
| A12 | Real organisations used as endorsers (J.D. Power, American Banker, "Fortune 100", OCC, FDIC programme, Global Finance) and employers (Goldman Sachs, NY Fed, OCC). |
| A13 | `$0 Monthly Fee*` asterisk with no footnote; no "rates as of" dates; no regular APR range for the card; privacy policy dated 1 Jan 2024. |
| A14 | No Contact link in footer or nav; no branch/ATM locator despite "200+ branches / 55,000+ ATMs". |
| A15 | Login "Forgot username/password?" → `/contact`. |
| A16 | `/signup` step 1 asks Account Number, last 4 SSN, DOB; stepper reads Verify Account → Personal Info → Complete. |
| A17 | Hero has three primary-looking actions in the first viewport. |
| A18 | Image formats mixed (`.jpg` hero, `.webp` login); testimonial avatar file is `happy-customer-1.jpg`. |
| A19 | Claims that invite disbelief: "first major bank to launch fully integrated online banking" (2007), CDFI status, "SVB-replacement banking", "Level 1 PCI-DSS compliance included". |

**Not observable from the live site (you must inspect in code and rendering):** actual colours and fonts, spacing/grid, hover/focus/disabled/error states, responsive behaviour, motion, image weights, bundle size, Core Web Vitals, `vercel.json`, keyboard behaviour of the `Access Vault` menu, `/apply` and `/signup` steps 2–3, form validation and success states.

---

## 3. Decisions already made (do not re-litigate; flag only if code makes them unworkable)

| Topic | Decision |
| --- | --- |
| Brand | Heritage Trust Bank, N.A. / Heritage Trust / Heritage Vault |
| Identity | Ledger (Appendix B) |
| `/apply` | Application **request** form for **new customers**: personal, business, corporate, nonprofit/organisation, wealth. Submission goes to the admin portal for review. |
| `/signup` → **`/enroll`** | Online-banking **enrollment request** for **existing account holders** who don't have e-banking set up yet. Submission goes to the admin portal; admin then emails the full setup form to the customer's registered email. Keep `/signup` as a permanent redirect to `/enroll`. |
| `/login` | Entry point only. Out of scope except the two links in A1/A15. |
| Privacy | Site is realistic and **private** (noindex + access gate), no visible disclaimer. |
| Imagery | See section 9.2. No stock handshakes, no AI-generated people unless consistent and approved. |

---

## 4. Phase 0: what to analyse (answer every item)

### 4.1 Stack and structure

- Tailwind **major version** (v3 `tailwind.config.js` vs v4 `@theme`). **Keep it.** Translate Appendix B into whichever the repo uses.
- Router (library, version, how routes are declared), where the auth guard lives, and **why unknown paths redirect to `/login`**.
- Is the marketing site in the same repo/bundle as the portal or admin? Which components, CSS, utils or contexts are shared? What would a token change break there?
- Build tool config (`vite.config`), env usage, aliases, lint/format/test setup, TypeScript or JS.
- Current Tailwind theme (colours, fonts, spacing, radii, shadows), custom CSS, `@apply` usage, CSS-in-JS, UI libraries (shadcn/Radix/Headless UI), icon set, animation libraries (framer-motion, GSAP, CSS keyframes).
- Fonts: how loaded (Google link, `@import`, self-hosted), weights, `font-display`.
- Head management: react-helmet, React 19 metadata, or static `index.html` only.
- Forms: library (react-hook-form, Formik, none), validation (zod/yup/manual), submission target (API route, Supabase, serverless function, mock), what payload shape the **admin portal expects today** for application requests.
- Static assets: `public/` listing with sizes and formats; `og`/favicon/manifest files.
- `vercel.json` (rewrites, headers, redirects), `robots.txt`, sitemap.

### 4.2 Code-versus-brief checks

For each audit finding A1–A19, find the code location and give a verdict. Then inspect, in a browser at 390 / 768 / 1440 px (Playwright or equivalent), and record: layout breakage, overflow, tap-target size, focus visibility, hover/active/disabled/error/loading states, and animation behaviour with `prefers-reduced-motion`. Capture before-screenshots to `docs/agent/before/`.

### 4.3 ANALYSIS.md format

Open with a 10-line summary, then one table:

| Area / file | Current state | Verdict | Notes / what to do |
| --- | --- | --- | --- |

Verdicts: **Keep**, **Adapt** (works, needs tailoring), **Replace**, **Build** (doesn't exist), **Remove**. Add a short section "Where this brief is wrong or incomplete for this codebase".

---

## 5. Identity: Ledger (implementation rules)

Tokens, type scale and base CSS are in **Appendix B**. Rules:

- **Surfaces:** page `paper-50`, raised/alternate `paper-100`, hairlines `paper-200`, input borders `paper-300`. Dark sections and the footer use `ink-900` with paper text (`.theme-ink`).
- **Vermilion is a stamp, not a theme.** At most two vermilion elements per viewport: the primary button and one mark. Primary button = `vermilion-600` with white text (5.12:1); hover `vermilion-700`. On dark surfaces use `vermilion-400`.
- **Errors never use vermilion.** Use `error` (`#B42318`) on `error-bg`, always with an icon and text.
- **Structure with hairlines, not shadows.** 1px `paper-200` borders. No drop shadows except the focus ring and overlays. Radius: 4px default, 2px small, 8px max (modals).
- **Figures are first-class.** Rates, balances, limits and stats use `font-mono` (IBM Plex Mono) with `tabular-nums` at `data-lg` / `data`. Labels/eyebrows use `label` (uppercase mono, +0.08em).
- **Type:** Familjen Grotesk (display/headings, 600), Public Sans (body), IBM Plex Mono (data). Body measure `max-w-measure` (62ch). Body ≥ 16px, line-height 1.6.
- **Motion:** minimal. 150–200ms ease-out on hover/focus; one entrance reveal per section at most (opacity + 8px translate); everything wrapped in `motion-safe:`. No marquees, no parallax.
- **Iconography:** avoid generic icon-set grids. Prefer numerals, mono labels and hairline rules. Where icons are functional (menu, chevron, external, lock), use one consistent 1.5px-stroke set; custom marks only for the brand.
- **Contrast:** every text/background pair must meet WCAG AA (verified pairs are in Appendix B; any new pair needs a check).

---

## 6. Content and facts rules

1. **Create `src/content/facts.(js|ts)`** and import every number and brand string from it. Seed in **Appendix C**. No hard-coded years, AUM, client counts or phone numbers in JSX.
2. **Years of service is computed:** `new Date().getFullYear() - 1888` (138 in 2026).
3. **One set of figures:** one AUM, one client count, one branch count, one ATM count. The "$2B+" strip is removed; acquisitions are described as a subset ("$2B+ in assets added through acquisitions").
4. **One product system:** Heritage Checking, Heritage Savings, Heritage Rewards Visa®, Personal Loan, Mortgages, Business Checking, Merchant Services, Business Lending, Payroll, Treasury Management, Private Banking (Heritage Select / Private / Ultra). Remove "Legacy Builder", "Golden Years", "Founders Circle", "White Glove", "Vault Credit Cards", "Heritage Vault™ Accounts".
5. **"Vault"** only means online banking (Heritage Vault app and portal).
6. **Awards and endorsers:** remove real third-party names. Replace with invented but plausible ones (e.g. "Regional Bank Customer Satisfaction Award, 2025") or delete. Executive bios use fictional prior employers.
7. **Soften or remove** claims in A19. Remove "SVB-replacement". Do not claim CDFI status.
8. **Disclosures:** every rate carries "APY as of {date}; rates may change." Every asterisk has a visible footnote. Add the card's regular APR range. Wealth disclosure (not FDIC insured, not bank guaranteed, may lose value) stays.
9. **Voice:** use the Wealth page as the reference. Plain, specific, a little dry. Cut generic superlatives ("world-class", "elite", "unmatched"). Keep numbers.
10. **Single contact source:** phone, email, address in `facts`. Suggested fictional phone: `1-800-437-4824` (1-800-HERITAG). Email domain is a constant (`BRAND.domain`); use `heritagetrust.com` placeholders until the owner provides one (record in OPEN_QUESTIONS).

---

## 7. Information architecture and routes

### 7.1 Header

- Left: wordmark "Heritage Trust" (legal "Bank, N.A." in the footer only).
- Primary nav: **Personal, Business, Wealth, About**.
- Utility row/right: `Locations`, `Contact`, `Sign in` (→ `/login`), and one primary button **Open an account** (→ `/apply`). **Remove the `Access Vault` dropdown.** Put `Get online access` (→ `/enroll`) as a text link beneath the sign-in area on the login page and in the footer.
- Fraud-notice bar stays, and its link must go to a real `/security` page.
- Mobile: full-height sheet menu, focus-trapped, `Escape` closes, body scroll locked.
- Required: skip link, `aria-current="page"`, visible focus.

### 7.2 Footer (`theme-ink`)

Columns: Personal (Checking, Savings, Credit Cards, Personal Loans, Mortgages), Business (Business Checking, Merchant Services, Lending, Payroll, Treasury), Online banking (Sign in, Get online access, Security Center, Help), Company (About, Leadership, Careers, Press, Locations, Contact). Each link goes to a **distinct** destination or an in-page anchor with a matching `id`. No `href="#"`. Remove social icons unless real profiles are provided. Legal row: Privacy, Terms, Accessibility, Cookie preferences, Rates & Fees. Fine print: `Heritage Trust Bank, N.A. Member FDIC. Equal Housing Lender.` plus the fictional charter line from `facts`.

### 7.3 Route table

| Route | Action | Notes |
| --- | --- | --- |
| `/` | Adapt | Restructure (7.4) |
| `/personal-banking` | Adapt | Anchors `#checking #savings #card #loan #mortgages` |
| `/business-banking` | Adapt | Anchors `#checking #merchant #lending #payroll #treasury #results` |
| `/wealth` | Adapt | Reference voice |
| `/about` | Adapt | `#leadership` anchor |
| `/contact` | Adapt | Split new/existing; topic select; success state |
| `/apply` | Build or rebuild | Section 8.1 |
| `/enroll` (+ `/signup` redirect) | Build or rebuild | Section 8.2 |
| `/status` | Build | Reference-number lookup for both request types |
| `/security` | Build | Public page, outside the auth guard |
| `/help` | Build | FAQ accordion, outside the auth guard |
| `/products/:slug` | Build (one template) | checking, savings, rewards-visa, personal-loan, mortgages, business-checking, merchant-services, business-lending, private-banking |
| `/locations` | Build | List + static map image; search field optional |
| `/rates-and-fees` | Build | Rates table with as-of date, fee schedule |
| `/terms`, `/accessibility` | Build | Proper copy |
| Cookie preferences | Build as modal | Opened from footer; remembers choice |
| `/careers`, `/press` | Build, light | 5–6 entries each; no live apply |
| `/investors` | Build light or remove link | Short page for a fictional holding company, or drop the link |
| `*` (404) | Build | Real `NotFound`; **must not** redirect to login |
| `robots.txt`, sitemap | Build | See 11.4 |

### 7.4 Home page structure (replace the current 10 stacked sections)

1. Fraud bar → header.
2. **Hero:** `display-xl` headline, one-sentence subhead, one primary button (`Open an account`) and one text link (`Sign in to Heritage Vault`). Beside it: one large mono figure (current savings APY with as-of line) and a framed Heritage Vault screenshot. No stock photo.
3. **Proof strip:** four figures from `facts` with mono labels. (Single stat band on the whole page.)
4. **Segments:** three large entries (Personal / Business / Wealth), each with a one-line promise, one mono figure and a link. Replaces both product grids.
5. **Outcomes:** two Business case-study results (e.g. 34% lower processing cost; $1.8M line in 5 days) instead of the single testimonial.
6. **Vault band** (`theme-ink`): app/online banking, `Sign in` + `Get online access`.
7. **Security:** three facts linking to `/security`.
8. Footer. **Remove** the acquisitions marquee and the second stat strip.

---

## 8. Flows

### 8.1 `/apply`: new-customer application request

**Purpose:** collect an application and deliver it to the admin portal for review. First **inspect how the existing form submits** (endpoint, payload, validation) and keep the contract; add fields additively and document every change in CHANGELOG.

- **Entry:** account-type picker as large selectable rows: **Personal**, **Business**, **Corporate**, **Nonprofit / Organisation**, **Wealth (Private Banking)**. Selection sets `?type=` so deep links work from product pages.
- **Personal steps:** 1 Account (product choice, joint?) → 2 About you (legal name, DOB, citizenship status, ID type and number *masked*) → 3 Contact and address → 4 Employment and income range → 5 Review and consent → Done.
- **Business / Corporate / Nonprofit steps:** 1 Account and entity (legal name, DBA, entity type, EIN *masked*, state and date of formation, industry, website) → 2 Ownership and control (owners of 25%+ and one control person, each with name, DOB, ownership %) → 3 Authorised signers → 4 Expected activity (monthly deposits, cash, international wires, merchant services) → 5 Documents (formation docs, EIN letter; accept PDF/JPG, size limit shown) → 6 Review and consent → Done.
- **Wealth:** shorter request: contact, investable-asset band (Select / Private / Ultra), preferred contact time → Done.
- **UX rules:** progress indicator with "Step n of N" announced via `aria-live`; per-step validation on blur and on continue; Back never loses data; draft saved in `sessionStorage` (never SSN/EIN); errors linked with `aria-describedby`; focus moves to the step heading on step change.
- **Sensitive fields:** `type="text"` with `inputMode="numeric"`, `autocomplete="off"`, masked display, and **never logged or persisted client-side**. Do not send full SSN/EIN to any third-party script.
- **Mobile keyboards:** `type="email"`, `type="tel"` with `autocomplete="tel"`, `autocomplete` tokens (`given-name`, `family-name`, `bday`, `street-address`, `postal-code`).
- **Done screen:** reference number (e.g. `HT-APP-482915`), "Under review. We'll email you within 2 business days", a `/status` link, a "what happens next" three-line list. Send nothing to the visitor beyond what the existing backend already does.

### 8.2 `/enroll`: online-banking enrollment request (existing account holders)

**Purpose:** an existing account holder without e-banking requests access. Admin reviews, then emails the full setup form to the customer's registered email.

- Intro (two lines): who it is for (existing account holders without Heritage Vault access) and what happens next. Link: "Don't have an account? Open one."
- **One step, one screen:** full name, email, mobile phone, account number (masked, `inputMode="numeric"`), account type (Personal / Business), services wanted (Online banking, Mobile app, Bill pay, Wires: checkboxes), consent to electronic communications.
- Do **not** ask for SSN or DOB here (the admin verifies identity before sending the setup form). If the existing code requires them for the current contract, keep them as masked fields and flag in OPEN_QUESTIONS.
- **Done screen:** reference number `HT-ENR-…`, "We'll verify your details and email setup instructions to your registered email within 1 business day", `/status` link, security line ("We never ask for your password, PIN or one-time passcode").
- Preserve the existing submission contract; if the existing flow is 3 steps, flatten the UI only and keep the payload shape.

### 8.3 `/status`

Reference-number lookup (client calls the existing admin-facing status endpoint if one exists; otherwise render a convincing static state machine: Received → Under review → Decision sent). Record in OPEN_QUESTIONS if no endpoint exists.

---

## 9. Page directives

### 9.1 Page-by-page

- **Home:** section 7.4.
- **Personal:** comparison row (APY / fees / minimum) above four product sections; each section gets an anchor id; footnotes; replace the image placeholder with a framed Vault screenshot; delete the unsourced "#1 for 8 years" line or restate as an invented award with a year.
- **Business:** keep the three case studies and move one up; add anchors; footnote the `$0 Monthly Fee*` (badge reads "$0 fee for 12 months"); add a Treasury Management section (the footer links to it); the six sector blocks become links or get real one-paragraph pages later (P2).
- **Wealth:** keep as-is in voice; differentiate the three tiers visually (weight and size, not colour); one primary CTA, one phone link.
- **About:** dynamic year counts; `id="leadership"`; leadership as monogram tiles (or consistent portraits, section 9.2); trim recognition to three invented awards; remove "first major bank" claim; remove CDFI claim.
- **Contact:** two clear blocks "New to Heritage Trust" and "Existing client"; topic select (pre-filled by `?topic=`, e.g. `access` from login's "Forgot"); success state; phone/email from `facts`.
- **Privacy:** update date, remove GDPR vocabulary ("Data Protection Officer" → "Privacy Office"), add a short GLBA-style summary and state-rights section.
- **404:** wordmark, one line, three useful links.

### 9.2 Imagery

- **Hero:** none. Use type, figures and a device-framed portal screenshot (`PhoneFrame`/`BrowserFrame`).
- **Photography** (Unsplash/Pexels, free commercial licences), documentary, unposed, natural light, one consistent grade (slightly warm, slightly desaturated to sit on paper/ink). No handshakes, no posed smiles to camera.
  - Business: real workplaces (kitchens, workshops, storefronts, loading docks).
  - Wealth: architecture and material details, desks and hands, no faces.
  - About: a stone-fronted bank building.
- **Leadership:** monogram tiles by default; portraits only if all are produced with one tool and one prompt style and approved by the owner.
- **Specs:** AVIF with WebP fallback via `<picture>`, explicit `width`/`height`, hero ≤150 KB, below-fold `loading="lazy"`, `fetchpriority="high"` on the LCP image, descriptive `alt` (decorative = `alt=""`), file names by content, not "happy-customer-1".
- **Needed assets:** favicon set (SVG + 32 + 180 apple-touch), 1200×630 `og-default.png` (paper background, wordmark, one figure).

---

## 10. Component inventory (build or fix, priority order)

1. Tokens (Tailwind + CSS variables) and base CSS.
2. `Button` (primary / secondary / text; sizes; hover, focus, active, disabled, loading).
3. `Header`, `MobileMenu`, `SkipLink`; `Footer`.
4. `facts` module and `BRAND` constants.
5. `Seo` (title template `%s | Heritage Trust Bank`, description, canonical, og/twitter, `noindex` flag).
6. Form kit: `FormField`, `Select`, `Checkbox`, `RadioRow` (for account-type picker), `FileDrop`, `StepIndicator`, `FormError`, `FormSuccess`.
7. `Figure` (mono value + label + footnote ref), `Footnote`, `Disclosure`.
8. `ProductCard` (eyebrow, figure, bullets, CTA), `SegmentBlock`, `Tier`, `Timeline`, `Outcome` (case-study result).
9. `PhoneFrame` / `BrowserFrame`.
10. `Accordion` (FAQ, accessible), `Modal` (cookie preferences, focus-trapped), `NotFound`.

Consolidate any near-duplicate cards, buttons or section wrappers you find. Delete the marquee and unused components after migration (grep first).

---

## 11. Technical requirements

### 11.1 Accessibility (WCAG 2.2 AA)

Remove `maximum-scale`. Skip link first; one `<h1>` per page; landmarks (`header`, `nav`, `main`, `footer`); global `:focus-visible` ring (2px, offset 2px); all interactive targets ≥ 44px; forms with real `<label>`s, `aria-describedby` errors and `aria-live` step announcements; accordion and menu operable by keyboard; `prefers-reduced-motion` honoured; no information conveyed by colour alone.

### 11.2 SEO and sharing

`Seo` component on every route with unique title and description; remove `meta-keywords`; canonical URLs; `og:image` and `twitter:card=summary_large_image`; JSON-LD `BankOrCreditUnion`/`Organization` (fictional) on home; `<html lang="en">`.

### 11.3 Performance targets

Mobile Lighthouse ≥ 90 performance, LCP \< 2.5 s, CLS \< 0.05, INP \< 200 ms. Route-level code splitting (`React.lazy`) for every page except home; no portal/admin code in the marketing bundle (verify with a bundle analyzer and record sizes before and after); self-host fonts with `font-display: swap`, preload the display and body files; no render-blocking third-party CSS.

### 11.4 Privacy of the site (instead of a visible disclaimer)

While the site is private: `X-Robots-Tag: noindex, nofollow` header and `<meta name="robots" content="noindex">`, `robots.txt` disallowing all, no sitemap submission. Recommend, and implement if the plan supports it, Vercel Deployment Protection (password); otherwise a lightweight passcode gate that does not touch the portal. Make this a single switch (`VITE_PRIVATE=true`) so it can be lifted later.

### 11.5 Vercel

Provide or fix `vercel.json` (Appendix D): SPA rewrite to `index.html` that **does not** shadow static files, immutable caching for hashed assets, security headers. Ensure unknown routes render the 404 route, never `/login`.

### 11.6 Font loading

Self-host with Fontsource (verify package names exist before installing), or if not possible use the Google Fonts link in Appendix B with `preconnect`.

---

## 12. Implementation order (tokens first)

0. Recon and docs (no code changes).
1. **Foundation:** tokens added **alongside** old ones; fonts; base CSS; `Seo`; `facts`; fix viewport; `vercel.json`; noindex switch; `NotFound` route and auth-guard fix.
2. **Primitives:** `Button`, form kit, `Figure`, `Footnote`.
3. **Chrome:** `Header`, `MobileMenu`, `Footer`; footer link fix; contact in nav.
4. **Pages:** Home, Personal, Business, Wealth, About, Contact.
5. **Flows:** `/apply`, `/enroll` (+ `/signup` redirect), `/status`.
6. **New content routes:** `/security`, `/help`, `/products/:slug`, `/locations`, `/rates-and-fees`, `/terms`, `/accessibility`, cookies modal, `/careers`, `/press`, `/investors`.
7. **Cleanup:** remove old tokens and font imports, dead components, marquee, duplicated sections; run the forbidden-string grep.
8. **Docs:** CHANGELOG, RECOMMENDATIONS.

Commit after every numbered phase with a clear message. Never leave the build broken between phases.

---

## 13. Verification gates (run after every phase; record results in CHANGELOG)

- `npm run build` and lint pass; no new console errors or warnings.
- **Grep must return nothing** in `src/` and `public/` (except tests/docs): `JP Heritage`, `jpheritage`, `136`, `135 years`, `Image:`, `href="#"`, `maximum-scale`, `Playfair`, `Space Mono`, `Legacy Builder`, `Golden Years`, `Founders Circle`, `White Glove`, `J.D. Power`, `Goldman`, `SVB`, `Fortune 100`, `lorem`.
- **Link crawl:** every internal link resolves to a rendered, non-login page (script it with Playwright or `linkinator`).
- **Screenshots** at 390, 768 and 1440 px for every route into `docs/agent/after/`; no horizontal scroll; no clipped text.
- **Accessibility:** axe (or Lighthouse a11y) with zero serious/critical issues; keyboard-only walk-through of header, menu, `/apply`, `/enroll`, accordion, modal.
- **Contrast:** any new colour pair checked against AA.
- **Performance:** Lighthouse mobile on `/`, `/personal-banking`, `/apply`; report scores and bundle sizes.
- **Forms:** submit happy path and each validation error on `/apply` (each account type), `/enroll`, `/contact`; confirm payload shape matches the existing admin contract.
- **Portal/admin untouched:** `git diff --stat` shows no changes in portal/admin paths.

---

## 14. Your latitude: improve beyond this brief

You are expected to make recommendations. In `docs/agent/RECOMMENDATIONS.md`, for each one give: **Issue (where in code) → Why it matters → Fix → Priority and effort (S/M/L)**. Implement low-risk improvements directly (and log them in CHANGELOG); leave anything risky, large or contract-changing as a recommendation. Specifically consider:

- Code smells you find (duplicate components, prop drilling, inline styles, dead routes, unused dependencies, large images).
- Prerendering/SSG for the marketing routes (e.g. `vite-react-ssg`) if the app is client-rendered only.
- A shared `design-tokens` file the portal can adopt later.
- Missing realism details a real bank site would have (e.g. routing-number/charter line, accessibility statement, rates page freshness, security best-practice page, secure-message notice).
- Anything in this brief that conflicts with what you observe in the code: say so plainly and propose the better option.

**Portal handoff note (document only, don't implement):** the portal should later adopt `ink-900` as its base, `paper-50` text, `vermilion-400` accent, IBM Plex Mono for balances and reference numbers, 4px radius and hairline borders, by importing the same tokens.

---

## Appendix A: Facts and content seed (`src/content/facts`)

```js
export const BRAND = {
  legalName: 'Heritage Trust Bank, N.A.',
  shortName: 'Heritage Trust',
  vault: 'Heritage Vault',
  domain: 'heritagetrust.com',            // placeholder, confirm with owner
  phoneDisplay: '1-800-437-4824',         // 1-800-HERITAG (fictional)
  phoneTel: '+18004374824',
  email: 'support@heritagetrust.com',
  address: '1 Heritage Plaza, New York, NY 10005',
  founded: 1888,
};
export const yearsOfService = () => new Date().getFullYear() - BRAND.founded;
export const FACTS = {
  assets: '$48B+',
  clients: '2.4M+',
  states: 38,
  branches: '200+',
  atms: '55,000+',
  employees: '3,200+',
  acquiredAssets: '$2B+',                 // subset of total assets
};
export const RATES = {
  asOf: '1 October 2026',
  checkingApy: '0.30%',
  savingsApy: '4.85%',
  cardCashback: '2.5%',
  personalLoanFrom: '6.49% APR',
};
export const ACQUISITIONS = [             // renamed; all "acquired"
  { name: 'Hudson Savings & Loan', year: 2023 },
  { name: 'Colonial Financial Services', year: 2024 },
  { name: 'Liberty Savings & Loan', year: 2025 },
];
```

## Appendix B: Ledger tokens

**Palette and contrast (all computed, WCAG 2.x):**

| Token | Hex | Verified use |
| --- | --- | --- |
| `paper-50` | `#FBF9F4` | Page background |
| `paper-100` | `#F3EFE4` | Raised/alt surface |
| `paper-200` | `#E6E0D0` | Hairlines |
| `paper-300` | `#D3CBB8` | Input borders |
| `ink-900` | `#14181B` | Text 16.97:1 on paper-50; dark surfaces |
| `ink-700` | `#2E353B` | Text 11.82:1 |
| `ink-500` | `#5B646C` | Secondary text 5.73:1 (5.25:1 on paper-100) |
| `vermilion-600` | `#C93A14` | Primary action; white on it 5.12:1; as text on paper-50 4.87:1 |
| `vermilion-700` | `#A62F0E` | Hover; white on it 6.92:1 |
| `vermilion-400` | `#F2714B` | Accent on ink-900 6.15:1 |
| `vermilion-100` | `#FBE3DA` | Tint |
| `pine-700` | `#1D5243` | Security/secondary 8.53:1 |
| success / warning / error / info | `#1B7A4B` / `#8A5300` / `#B42318` / `#1F5FA6` | 5.08 / 5.74 / 5.75 / 5.63 on their tints |

**Tailwind v3 (`tailwind.config.js` → `theme.extend`):**

```js
colors: {
  paper: { 50: '#FBF9F4', 100: '#F3EFE4', 200: '#E6E0D0', 300: '#D3CBB8' },
  ink: { 900: '#14181B', 700: '#2E353B', 500: '#5B646C' },
  vermilion: { 100: '#FBE3DA', 400: '#F2714B', 600: '#C93A14', 700: '#A62F0E' },
  pine: { 700: '#1D5243' },
  success: { DEFAULT: '#1B7A4B', bg: '#E6F3EC' },
  warning: { DEFAULT: '#8A5300', bg: '#FFF3D6' },
  error: { DEFAULT: '#B42318', bg: '#FDECEA' },
  info: { DEFAULT: '#1F5FA6', bg: '#E8F0FA' },
},
fontFamily: {
  display: ['"Familjen Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
},
fontSize: {
  'display-xl': ['clamp(3rem, 6vw + 1rem, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em', fontWeight: '600' }],
  'display-lg': ['clamp(2.5rem, 4.5vw + 0.5rem, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '600' }],
  h1: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
  h2: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
  h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
  h4: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
  'body-lg': ['1.125rem', { lineHeight: '1.6' }],
  body: ['1rem', { lineHeight: '1.6' }],
  small: ['0.875rem', { lineHeight: '1.5' }],
  label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
  'data-lg': ['2.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
  data: ['1rem', { lineHeight: '1.4' }],
},
borderRadius: { sm: '2px', DEFAULT: '4px', md: '4px', lg: '8px' },
maxWidth: { measure: '62ch' },
```

(Tailwind v4: put the same values in an `@theme { --color-paper-50: #FBF9F4; --font-display: "Familjen Grotesk", …; }` block. Do not upgrade the major version to do this.)

**Base CSS:**

```css
:root {
  --bg:#FBF9F4; --surface:#F3EFE4; --line:#E6E0D0;
  --text:#14181B; --text-muted:#5B646C;
  --action:#C93A14; --action-hover:#A62F0E; --focus:#14181B;
}
.theme-ink {
  --bg:#14181B; --surface:#1C2226; --line:#2E353B;
  --text:#FBF9F4; --text-muted:#B9B3A3;
  --action:#F2714B; --action-hover:#F58B6A; --focus:#FBF9F4;
}
body { background:var(--bg); color:var(--text); font-family:"Public Sans",system-ui,sans-serif; }
:focus-visible { outline:2px solid var(--focus); outline-offset:2px; }
.tabular { font-variant-numeric:tabular-nums; }
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
```

**Fonts (self-host; verify package names):**

```bash
npm i @fontsource-variable/public-sans @fontsource-variable/familjen-grotesk @fontsource/ibm-plex-mono
```

Fallback: `https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap` with `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (`crossorigin`). Set `<meta name="theme-color" content="#FBF9F4">`.

## Appendix C: `vercel.json` starting point (adapt to what exists)

```json
{
  "rewrites": [{ "source": "/((?!assets/|images/|fonts/|favicon|robots\\.txt|sitemap\\.xml).*)", "destination": "/index.html" }],
  "redirects": [{ "source": "/signup", "destination": "/enroll", "permanent": true }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
    ] }
  ]
}
```

(Remove `X-Robots-Tag` when the site goes public. Add a Content-Security-Policy only after you have listed every origin the app actually uses; a wrong CSP breaks the site.)

## Appendix D: Required deliverables checklist

- [ ] `docs/agent/ANALYSIS.md` (verdict table, A1–A19 verdicts, brief-vs-code conflicts)
- [ ] `docs/agent/PLAN.md`
- [ ] `docs/agent/OPEN_QUESTIONS.md`
- [ ] `docs/agent/before/` and `docs/agent/after/` screenshots
- [ ] Implementation committed in phases on `feat/ledger-rebrand`
- [ ] `docs/agent/CHANGELOG.md` with verification results
- [ ] `docs/agent/RECOMMENDATIONS.md`