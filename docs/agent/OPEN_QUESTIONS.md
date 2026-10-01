# OPEN_QUESTIONS.md — Heritage Trust Bank, Ledger Redesign
**Questions that cannot be resolved from code alone. Assumptions recorded.**
Date: 2026-10-01

---

## Q1 — Domain name for Heritage Trust Bank
**Question:** The brief specifies `heritagetrust.com` as a placeholder domain. What is the real domain?
**Assumption:** Using `heritagetrust.com` as specified in Appendix A. All `BRAND.domain`, `BRAND.email`, and metadata canonical URLs will use this domain.
**Impact if wrong:** Email addresses in footer, contact page, and privacy policy will need a one-line change in `src/content/facts.ts`.
**Risk to portal:** None.

---

## Q2 — `images.unoptimized: true` in `next.config.mjs`
**Question:** This flag disables Next.js automatic image optimisation (AVIF/WebP serving, resizing). It was presumably set to avoid Vercel image optimisation costs or to support a Docker build. The brief requires AVIF with WebP fallback.
**Assumption:** Keeping `unoptimized: true` for now. Hero and key images will be pre-converted to AVIF + WebP manually and served via `<picture>` elements with explicit `<source type="image/avif">` and `<source type="image/webp">` tags. The `<Image>` component is used only for images where format conversion is not critical.
**Impact if wrong:** If the flag is set to `false`, `<Image>` handles conversion automatically; manual `<picture>` wrappers become unnecessary but harmless.
**Action for owner:** Confirm whether Vercel image optimisation can be enabled (has cost implications on free/hobby plans). If yes, set `unoptimized: false` and simplify image markup.

---

## Q3 — Supabase Storage bucket for document uploads (`/apply` business flow)
**Question:** The `/apply` business/corporate/nonprofit step 5 requires PDF/JPG document uploads (formation docs, EIN letter). The `AccountApplication` schema has `idDocumentUrl` and `livenessImageUrl` columns, but there is no evident Supabase Storage bucket configuration in the codebase.
**Assumption:** Document uploads will use a client-side file picker that encodes the file as a base64 data URL and stores it temporarily in `sessionStorage` during the form flow. On final submission, the server action will upload to a Supabase Storage bucket named `application-documents` (to be created by the owner). If the bucket does not exist, the upload step will be skipped and the `idDocumentUrl` field will be null (schema allows null). A `OPEN_QUESTION` warning will be shown in the done screen if upload was skipped.
**Risk to portal:** None — no portal code touches this bucket.

---

## Q4 — `/status` endpoint for application reference lookup
**Question:** Is there an existing admin-facing status endpoint, or does the `/status` page need a client-side lookup against the database?
**Assumption:** No dedicated REST status endpoint exists. The `/status` page will call a new Next.js API route `GET /api/status?ref=HT-APP-XXXXXX` that queries Prisma for the matching `AccountApplication` or `OnlineAccessRequest` record and returns `{ status, type, createdAt }`. The reference number format encodes the record type (`HT-APP-` or `HT-ENR-`).
**Action for owner:** If a separate admin portal has a status webhook or REST endpoint, supply the URL so the marketing site can call it instead of Prisma directly.

---

## Q5 — `maximumScale` removal — portal impact
**Question:** `maximumScale: 1` is set in `app/layout.tsx`, which is the root layout shared by the portal, admin, and marketing routes. Removing it will also affect the portal and admin apps (which is an improvement — they shouldn't block pinch-zoom either).
**Assumption:** Removing `maximumScale` is safe and correct for all three apps. Proceeding.
**Risk:** Low. Pinch-zoom is a user right; removing the restriction never breaks functionality.

---

## Q6 — Old Tailwind tokens used by portal or admin
**Question:** Tokens like `heritage-navy`, `soft-gold`, `warm-cream`, `charcoal` are defined in `tailwind.config.ts` and used extensively in marketing. Are they also used by portal or admin components?
**Assumption:** Assuming yes until a grep confirms otherwise. Phase 7 cleanup will grep `app/(portal)`, `app/(admin)`, and `components/portal` + `components/admin` for these token names before removing them from `tailwind.config.ts`. If portal uses them, they stay in the config but are removed from marketing files.
**Action:** Record result of grep in CHANGELOG Phase 7.

---

## Q7 — Favicon and logo for Heritage Trust identity
**Question:** The brand identity changes from "JP Heritage Bank" to "Heritage Trust Bank, N.A." The current logo is a bank-logo.svg (351 KB — very large, likely an inline SVG with embedded content). A new favicon set and wordmark are needed.
**Assumption:** A text wordmark "Heritage Trust" in Familjen Grotesk 600 will be used in the header (no logo image) until the owner provides official brand assets. For the favicon, a simple HT monogram or the letter H in vermilion on paper background will be generated via `generate_image`. The current `public/bank-logo.svg` and `public/vault-login-logo.svg` will not be deleted — they may be used by the portal login page.
**Action for owner:** Provide official Heritage Trust Bank logo and favicon if one exists.

---

## Q8 — Social media profiles
**Question:** The brief says "remove social icons unless real profiles are provided." The current footer has four social icons with `href="#"`.
**Assumption:** Social icons will be removed entirely. No social profile URLs have been provided.
**Action for owner:** Provide real social profile URLs if Heritage Trust Bank has them, and they can be added back with correct hrefs.

---

## Q9 — Privacy policy date
**Question:** The current privacy policy is dated "January 1, 2024" (confirmed from live site audit). The brief says to update the date.
**Assumption:** Setting the privacy policy "Last Updated" date to the implementation date: **October 1, 2026**. The `RATES.asOf` date (1 October 2026) will also be used as the "rates as of" date throughout the site.

---

## Q10 — Admin application management for business/nonprofit `/apply` types
**Question:** The current `AccountApplication` schema has `applicationType` field (PERSONAL, BUSINESS) and general fields. The brief requires additional business-specific fields: EIN, DBA name, entity type, formation date, state, industry, website, ownership structure (25%+ owners), authorized signers, expected activity, and document URLs. These are not in the current schema.
**Assumption:** The new `/apply` business form will collect all these fields but only send what the existing schema supports to the server action, plus any new nullable fields we add. A Prisma migration will be needed to add: `businessName`, `dbaName`, `entityType`, `ein` (masked/tokenized), `stateOfFormation`, `yearOfFormation`, `industry`, `website`, `ownershipData` (JSON string). This migration is **a schema change** — it requires the owner to apply a Prisma migration to the Supabase database.
**Action for owner:** Review the proposed schema additions in CHANGELOG Phase 5 and apply migration.

---

## Q11 — Enrollment (formerly `/signup`) — existing DB contract
**Question:** The current `OnlineAccessRequest` schema only has `accountNumber` and `email`. The brief's new `/enroll` form collects: full name, email, mobile phone, account number, account type, services wanted (checkboxes), consent.
**Assumption:** The `OnlineAccessRequest` schema will be extended with nullable fields: `fullName`, `phone`, `accountType`, `servicesWanted` (comma-separated string). This is a small additive migration. The `requestOnlineAccess` server action will be updated to send these additional fields.
**Action for owner:** Apply the migration (detailed in CHANGELOG Phase 5).

---

## Q12 — Vercel Deployment Protection (password gate)
**Question:** The brief recommends Vercel Deployment Protection (password) for the private phase.
**Assumption:** This is a Vercel project setting, not a code change. It requires the Vercel dashboard to be configured by the owner. Recording here as an owner action item. The `X-Robots-Tag: noindex,nofollow` header (added to `vercel.json` in Phase 1) provides search-engine privacy without a login gate.

---

## Q13 — `next/font/google` vs Fontsource for Familjen Grotesk
**Question:** Familjen Grotesk is available on Google Fonts. `@fontsource-variable/familjen-grotesk` also exists. Which should be used?
**Assumption:** Using `next/font/google` because it self-hosts automatically at build time with no extra packages. If Familjen Grotesk is not available via `next/font/google` (it may require the `experimental` flag), fall back to Fontsource package. Will verify during Phase 1 implementation.
**Update if resolved:** Record in CHANGELOG Phase 1.
