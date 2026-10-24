# Heritage Trust internet banking portal: UI/UX audit (before)

Date: October 24, 2026. Scope: the customer portal (`app/(portal)`, `app/register`, `app/PortalLayout.tsx`, and the portal components in `components/`). The admin portal and the marketing site are out of scope. No source files were changed.

## How this audit was done, and its limits

- **Screenshots:** in `audit/before/` at 390 px and 1440 px, using headless Chrome. The app ran as a production build (`next build` and `next start`).
- **Limit — no database:** the workspace has no `.env` and no `DATABASE_URL`, and Docker isn't running. Every signed-in route returns 307 to `/login?redirect=…`, so only the login page and its states could be captured. `/register/[token]` returns a 500 because there's no database.
  - Signed-in screens were audited from their source code instead, using the per-screen metrics below.
  - Before-screenshots of the signed-in screens need a database with a real customer account, either your staging database or a local Postgres. I didn't seed one, because populating fake customer data conflicts with rule 3.
- **Files captured:**
  - `login-390.png` and `login-1440.png`
  - `login_error-empty-*.png` (empty form submitted)
  - `login_error-format-*.png` (identifier in the wrong format)
  - `register_abc-*.png` (unhandled server error, no designed error page)

## 1. Route and screen map

| Route | Screen | Notes |
|---|---|---|
| `/login` | Sign in | Email or account number plus password. No MFA/OTP step exists. |
| — | Password reset | **Does not exist.** "Forgot password?" links to `/contact`, and `ROUTES.forgotPassword` (`/forgot-password`) has no page. |
| — | MFA / OTP | **Does not exist.** Settings shows a 2FA card marked "Coming Soon", and the toggle uses `qrCode: "dummy"`. |
| `/onboarding` | First-login onboarding | Forced by middleware when `isFirstLogin`. Has no h1. |
| (modal) | PIN setup | `PinSetupModal`, shown when `pinSetupComplete` is false. |
| `/dashboard` | Overview | Balance banner, four stat cards, quick actions, chart, recent activity, right-hand panel. |
| `/vaults`, `/vaults/accounts` | Accounts | `/accounts` and `/accounts/*` redirect to `/vaults` (next.config). |
| `/activities` | Transactions | `/transaction` and `/transactions` redirect here. |
| `/transfer`, `/transfer/send` | Transfers and payments | Schema-driven form engine (`components/transfer/TransferFormEngine.tsx`). |
| `/beneficiaries` | Saved recipients | |
| `/bills` | Bill pay | |
| `/deposit` | Deposit and withdrawal | Cheque, wire, card, crypto. |
| `/savings` | Savings and loans | |
| `/benefits`, `/rewards` | Benefits and rewards | `/rewards` is a 176 B stub page. |
| `/cards` | Cards | Card controls, limits, insights, virtual card ("coming soon"). |
| `/statements` | Statements | Downloads a "Simulated PDF Content" blob when the API fails. |
| `/settings` | Profile and settings | |
| `/support` | Support | |
| (header menu) | Logout | `logoutAction()` → `/login`. No confirmation, no "you have signed out" message. |
| (idle) | Session expired | `AutoLogoutProvider` signs out after 10 minutes idle with **no warning and no expired-session message**. A keep-alive ping every 15 s keeps the server session alive for as long as the tab is open. |
| — | Error, 404, loading | **None exist for the portal.** There is no `error.tsx`, `global-error.tsx`, `loading.tsx` or portal `not-found.tsx`. Unknown paths redirect to login; server errors show the raw Next.js "Application error" page. |
| `/register/[token]`, `/register/business/[token]` | KYC registration (link from email) | Each is about 1,770 lines. |
| `/impersonate` | Admin "log in as customer" | Token-based; an admin path into the customer portal. |

**Navigation is inconsistent:**
- The desktop tabs are Overview, Transfer & Payment, Deposit & Withdrawal, Savings & Loans, and Benefits & Rewards.
- The mobile bottom bar is Home, Activities, Transfers & Pay Bills, Vaults & Cards, and More (which is just `/settings`).
- On desktop, Activities, Accounts, Cards, Statements, Beneficiaries and Support have no navigation entry at all.
- On mobile, Deposit, Savings and Benefits have none.

## 2. Findings by screen

### Login (captured)
- **Visual hierarchy:** on mobile the only h1 is in the brand panel, which is hidden, so the visible page title is an h2 ("Sign in"). "Back to heritagetrust.com" wraps onto two lines and collides with the logo at 390 px.
- **Typography:** three typefaces, all retired on the marketing site: Familjen Grotesk, Public Sans and IBM Plex Mono for the "HERITAGE VAULT" label. Footer links are 12 px.
- **Colour:** 52 hard-coded hex values; logo orange `#C8401A` is used for the primary button, links and the error state. Errors therefore look the same as actions, and none of it matches the marketing site's petrol.
- **Copy:** "kept the way we have kept them since **1888**"; "Heritage Trust Bank, N.A."; a hard-coded `1-800-437-4824`; "Back to heritagetrust.com".
- **Form UX:**
  - The "Remember my username" checkbox does nothing; its state is never used.
  - "Enroll in online banking" goes to `/apply` (account opening) instead of the enrolment page.
  - The `?redirect=` parameter set by middleware is ignored, so you always land on `/dashboard`.
  - Validation gives one error for the whole form. Fields have no `aria-invalid` or `aria-describedby`, and the error isn't linked to the field it describes.
- **Accessibility:**
  - 8 links are shorter than 44 px; "Forgot password?" is 16 px tall on mobile.
  - The focus ring is `ring-[#C8401A]/30`, about 1.5:1 against white, below the 3:1 non-text contrast minimum. Only a 1 px border colour change marks focus.
- **Generic look:** a pulsing orange "Heritage Vault" pill, glassy `bg-white/10 backdrop-blur` chips, and a dark gradient over a photo.
- **Inline styles:** an injected `<style>` block and an inline `backgroundImage`.

### Shell: header, sub-header, bottom nav, notifications
- **Privacy and security:** `PortalHeader` calls `https://ipapi.co/json/` on every mount, sending the customer's IP address to a third party, then shows the detected city in the top bar.
- **Hierarchy:** three stacked rows before any content: a dark bar (live clock and location), the logo bar, then the tab row. The clock re-renders every second. "Logged in: Loading..." shows until the profile loads.
- **Icons:** PNG bitmaps (`service.png`, `control.png`), desaturated with CSS, sit next to lucide line icons.
- **Accessibility:** the settings trigger is 32 × 32 px; the bottom-nav labels are `text-[10px]`; the active tab colour uses `text-ink-600`, which is undefined (no such token).
- **Unused code:** `LeftSidebar.tsx` and `RightSidebar.tsx` are never rendered (`RightSidebar` is imported only for a type). `RightSidebar` contains a `'John Doe'` fallback.
- **Undefined classes:** `PortalLayout` toasts use `border-l-vintage-green`, `text-vintage-green`, `text-soft-gold` and `text-charcoal`. None of these is defined, so the toasts fall back to inherited colours.

### Dashboard (code)
- **Hard-coded data shown to every customer:** `components/dashboard/recent-sales.tsx` (lines 84–138) renders a "Simulated" tag, a "Netflix Subscription −$15.99 Tomorrow" item, a "Pending Transfer −$220.00" item, and a "Security Check — Review recent login" item whose button does nothing.
- **Credit score fallbacks:** `RightSidebarWidgets.tsx:158` shows 785 and +12 when no score exists; `/cards` `CreditScore.tsx` is hard-coded to 785; `/savings` falls back to 752, "Excellent", +8. That's three different invented scores.
- **Display bug:** in "Savings progress", "Total saved" shows the **total balance of all accounts**, and "Target" shows the amount already saved (`goal.currentAmount`).
- **Dead UI:** an "analytics" tab panel with no tab to open it.
- **Spacing:** `gap-[2.3px]` and `space-y-[2.3px]` are used for the whole layout rhythm.
- **Typography:** `font-mono` 38 times and text ≤ 11 px 28 times.
- **Radius:** seven radius variants (none, sm, md, lg, xl, 2xl, full) on one screen.
- **Promos:** two promotional notices are always pushed into the banner carousel, even next to account-restriction alerts.
- **Error handling:** any data-loading error redirects to `/login`, so a server problem looks like a logout.

### Accounts / Vaults
- Text ≤ 11 px 31 times and `font-mono` 50 times; 40 `ui/Button` against 2 raw buttons (good). Filters and promo-dismissal state stored in localStorage (acceptable).
- `AccountDetailsDialog.tsx:170` downloads a "Simulated PDF Content" statement.
- `VaultsClient.tsx:68` imports `lib/sentry-mock` (errors only go to `console`).
- The "create/link account" success dialogs show the full account number (`AccountActionDialogs.tsx:488` and `:916`).

### Activities (transactions)
- 20 hex values and 33 tiny-text uses.
- The receipt and statement export (`ActivitiesClient.tsx:1422`) downloads a "Simulated PDF Content" blob.

### Transfer and payments
- 4,392 lines across 40 raw `<button>` and 9 `ui/Button`; text ≤ 11 px 48 times; 48 hex values. This is the only area with `aria-invalid` (6 uses).
- **Visible "demo" copy:**
  - `TransferFormEngine.tsx:1342` ("(demo estimate)") and `:1346` ("(demo)").
  - `lib/transfer-forms/schema.ts` has demo limits, fees and FX rates, "(demo)" help text (lines 146, 281, 359, 633), "Simulated service for demonstration." (706, 721) and "Estimates are demo values." (473).
- **Fixed fake deposit addresses:** the crypto rails show **fixed "DEMO" deposit addresses** (`schema.ts:323–329`, `401–429`). Funds sent there would be lost.
- **Hard-coded FX rates:** `getExchangeRate` (`app/actions/transfer.ts:173`).
- **Fake fallback recipients:** if the beneficiary API fails, `BeneficiarySelector.tsx:84–103` shows two made-up payees ("Alice Smith", "Bob Jones" with account numbers 123456789 and 987654321), which a customer could then select and pay.

### Beneficiaries / Bills
- Bills: 21 hex values; three bitmap and illustration styles.
- `bills.ts:134`: a generated `ACC-xxxxxx` account number is stored when a payee has no account number.
- Beneficiaries: one `confirm()` dialog (native browser dialog, unstyled).

### Deposit and withdrawal
- **The worst for consistency:** 97 `font-mono` uses, 59 tiny-text uses, 52 hex values, 31 inputs.
- **"Load Demo Check" button** (`DepositClient.tsx:1370`) loads a sample cheque image ("Sample Check Loaded", lines 302–309).
- A "3D secure simulation" delay (`:409`), and `CHK-` and `88…` numbers made with `Math.random` (`:146`, `:324`).
- Shows the full account number (`:1171`, by design for wire instructions; should be masked by default with a "reveal" action).
- "Simulated SVG Barcode Art" (`WithdrawalSection.tsx:882`).

### Savings and loans
- `app/actions/savings.ts:725–740`: when a customer has no loans, it **returns an invented "PRE_APPROVED" $25,000 loan** ("demo-loan-1", "Checking ••••4821").
- The 752 credit-score fallback (`savings.ts:543`, `:561`, `:563`; `savings/page.tsx:54`).
- A hard-coded calculator copy line: "Heritage High-Yield Vault (4.75%)" and "CD accounts (5.25%)" (`SavingsClient.tsx:1150`).

### Benefits and rewards
- `getRecentBenefitActivities` (`app/actions/benefits.ts:386–416`) returns three invented activities ("Points Statement Credit +$250.00", "VIP Confirmed", "Priority Pass™") whenever there is no session, and again at lines 470–495.

### Cards
- The "Virtual Cards Coming Soon" toast (`VirtualCardGenerator.tsx:66–69`).
- `CardExpenseChart` spreads a month's total evenly across seven days when there is no daily data, so it shows invented daily spend.
- **Card CVV:** stored in the database and sent to the browser in props (`cards/page.tsx:30`), then rendered by `CardsClient.tsx:147`.
- Eight radius variants on one screen.

### Statements
- Falls back to a "Simulated PDF Content" download when the API fails (`StatementsClient.tsx:39–46`). Nothing appears in the list when there are no statements, and there's no empty-state message.

### Settings / profile
- 2FA is mocked (`SettingsClient.tsx:106`, `:179–182`) and labelled "Coming Soon" (`:491`).
- `updateNotificationPreferences` is commented "Demo mock" (`app/actions/profile.ts:106`).
- The language selector writes to localStorage and the database, then hard-reloads the page. Only some strings are translated (`lib/utils.ts`).

### Support
- `app/actions/support.ts:9` creates a notification "for demo purposes" when a ticket is sent.

### Registration (KYC link)
- 3,641 lines; 180 uses of text ≤ 11 px; four h1s.
- The proof-of-address upload is a **`alert("PoA Upload mock triggered…")`** that stores `'mock-url'` (`RegistrationFormClient.tsx:1262–1263`; business form `:1307–1308`). The step cannot really be completed.
- The draft is saved to localStorage with SSN, ID numbers and signature stripped. Name, date of birth, address, phone and email remain, which is PII on a possibly shared device.
- "Established 1888" (`RegistrationFormClient.tsx:573`, `BusinessRegistrationFormClient.tsx:575`).

### Install prompt
- `MobileInstallPrompt` shows a **fake "installing… 0–100 %" progress bar** before calling the browser's real install prompt.

### Onboarding
- Assigns **randomly generated crypto deposit addresses** (`onboarding/actions.ts:58`, `:64`: `0xUSDC…` and `0xUSDT…` from `Math.random`), and `app/actions/accounts.ts:270` makes a random `dummyAddress`. These are not real wallets, so any deposit to them would be lost.

## 3. Non-production signals (runtime code must be fixed; nothing here is a test file)

The legitimate test and seed tooling to keep is `jest.config.js`, `jest.setup.js`, `prisma/seed.ts` and the root `check-*.ts` and `fix-*.js` scripts. They are not bundled into the app, but they should move to `scripts/` so they're clearly separated.

| # | File:line | Signal | User-visible? |
|---|---|---|---|
| 1 | `app/actions/admin-transactions.ts` and `lib/tx-generator.ts` | Admin generator of random or "targeted-balance" customer transactions, with invented merchants (Amazon, Uber, "Acme Corp Payroll") and back-dated timestamps. The portal shows them as genuine (`isAdminEntry` is never checked in the portal). | **Yes, as real history** |
| 2 | `app/actions/widgets.ts:85–100` | Credit score that changes with `creditScoreAutoMode: 'RANDOM'` (±10 a month) | Yes |
| 3 | `components/dashboard/recent-sales.tsx:84–138` | Hard-coded Netflix, $220 transfer and security-check items, tagged "Simulated" | Yes |
| 4 | `components/dashboard/RightSidebarWidgets.tsx:158–159`; `app/(portal)/cards/components/CreditScore.tsx:9–10`; `app/actions/savings.ts:543,561,563`; `app/(portal)/savings/page.tsx:54` | Invented credit scores (785 / 752) | Yes |
| 5 | `app/actions/savings.ts:725–740` | Invented pre-approved $25,000 loan | Yes |
| 6 | `app/actions/benefits.ts:386–416, 470–495` | Invented benefit activities | Yes |
| 7 | `components/transfer/BeneficiarySelector.tsx:84–103` | Fake fallback payees (Alice Smith, Bob Jones) | Yes, selectable |
| 8 | `lib/transfer-forms/schema.ts:5,10,146,199,281,323–329,359,401–429,473,633,706,721`; `components/transfer/TransferFormEngine.tsx:1342,1346` | "Demo" limits, fees and FX; fixed DEMO crypto addresses; "Simulated service for demonstration." | Yes |
| 9 | `app/(portal)/onboarding/actions.ts:58,64`; `app/actions/accounts.ts:270` | Random crypto deposit addresses | Yes |
| 10 | `app/(portal)/deposit/DepositClient.tsx:302–309,409,1370` | "Load Demo Check", sample cheque, simulated 3-D Secure | Yes |
| 11 | `app/(portal)/statements/StatementsClient.tsx:39–46`; `app/(portal)/activities/ActivitiesClient.tsx:1422`; `app/(portal)/vaults/components/AccountDetailsDialog.tsx:170` | "Simulated PDF Content" downloads | Yes |
| 12 | `app/(portal)/settings/SettingsClient.tsx:106,179–182,491`; `app/actions/profile.ts:106` | Mocked 2FA, "Coming Soon", mocked notification preferences | Yes |
| 13 | `app/(portal)/cards/components/VirtualCardGenerator.tsx:66–69` | "Virtual Cards Coming Soon" | Yes |
| 14 | `app/register/[token]/RegistrationFormClient.tsx:1262–1263`; `app/register/business/[token]/BusinessRegistrationFormClient.tsx:1307–1308` | `alert()` mock upload, `'mock-url'` | Yes |
| 15 | `components/layout/MobileInstallPrompt.tsx:77–90,154` | Fake install progress | Yes |
| 16 | `app/actions/transfer.ts:173` | Hard-coded FX rates | Indirect |
| 17 | `lib/api-client.ts:3–4,46` | "Demo mode … mocked gracefully", `getPortalStatus` always "online" | Indirect |
| 18 | `lib/email.ts:8–13` | With no `RESEND_API_KEY`, emails are only logged to the console in full HTML, including any temporary passwords from `app/actions/requests.ts:13`. Sender is `jpheritage.com`, "MUST change … before production". | Indirect, security |
| 19 | `lib/sentry-mock.ts` (used by `VaultsClient.tsx:68`) | No real error monitoring | No |
| 20 | `app/actions/support.ts:9`; `app/actions/statements.ts:54`; `auth.ts:52` | "for demo" comments describing live behaviour | No |
| 21 | `app/(portal)/login/page.tsx:11,112`; register forms `:573/575` | "1888" | Yes |
| 22 | `app/(portal)/login/page.tsx:14,299,305` | Hard-coded phone and "Heritage Trust Bank, N.A." | Yes |

## 4. Design inventory (129 portal files)

- **Colours:**
  - 50 unique hex values, 288 occurrences. The most used are `#14181F` (48), `#F6F1E7` (31), `#B8893B` gold (28), `#D8432B` (23), `#1F4D3F` (20), `#C8401A` (12), `#1B355B` / `#091C38` navy (18) and `#D4AF37` gold (6).
  - Four competing palettes are in use at once: Ledger cream and vermilion, a "vintage" navy and gold, Tailwind defaults (neutral 421, slate 166, gray 62, red 213, amber 107, emerald 93, blue 55, rose 34, purple 14, indigo 11), and shadcn HSL tokens (`muted`, `primary`, `accent`).
  - Undefined classes that render as nothing: `vintage-gold` (64), `vintage-navy` (9), `vintage-green`, `soft-gold`, `charcoal`, `danger` (6), `ink-600`, `ink-200`, `pine-100`, `pine-600`, `vermilion-500`.
  - The most-used files for hex values: login (53), `DepositClient` (52), `transfer/illustrations` (47), `SavingsClient` (28), `BenefitsClient` (25), `BillsClient` (21), `ActivitiesClient` (20).
- **Fonts:** `font-mono` 414 times, `font-display` 150, `font-sans` 8, `font-serif` 2. These are Familjen Grotesk, Public Sans and IBM Plex Mono, which the root CSS loads by name. The portal loads no fonts itself, so it relies on the corporate layout having loaded them, or falls back to system fonts.
- **Font sizes:**
  - Tailwind `text-xs` 758 times, `text-sm` 240, `text-small` 184, `base` 84, `lg` 73, `xl` 31, `2xl` 34, `3xl` 15, `4xl` 7.
  - Arbitrary sizes: `text-[10px]` 239, `text-[11px]` 232, `text-[9px]` 15, `text-[8px]` 5, `text-[7px]` 1, `text-[13px]` 12, `text-[15px]` 4.
  - That makes **492 instances below 12 px**, far below the 13 px legal floor and 14 px body minimum used on the marketing site.
- **Weights:** bold 523, semibold 453, medium 221, normal 18, black 7, extrabold 1. Heavy bold everywhere flattens the hierarchy.
- **Spacing:** 105 arbitrary values, such as `mb-[1px]` (11), `gap-[2.3px]` (5), `h-[52px]`, `h-[72vh]` and `w-[130px]`.
- **Radii:** `rounded-none` 384, `rounded-full` 104, `rounded` 104, `sm` 49, `lg` 40, `md` 34, `xl` 33, `2xl` 10. That's eight values in use, against one 2 px radius on the marketing site.
- **Shadows:** `shadow` 75, `shadow-sm` 61, `shadow-2xl` 15, `lg` 11, `md` 10, `xl` 5, plus `shadow-vintage-md` and `shadow-inner`. There's also `shadow-none` 67, overriding shadows from base components.
- **Gradients:** 10 (`bg-linear-to-br` 9).
- **Inline styles:** 17 `style={{…}}` across 12 files, plus two injected `<style>` blocks (login, `HeroSlides`).
- **Components:**
  - Two parallel button kits: `components/ui/Button.tsx` (variant `small` and others) and `components/commercial-ui/Button.tsx` (used by onboarding), plus 120+ raw `<button>`s.
  - Two card kits: `components/ui/Card.tsx` and `commercial-ui/Card.tsx`, the latter with a glassmorphism `bg-white/60 backdrop-blur-lg shadow-2xl` look and hover-lift.
  - Two input kits (`components/ui/input.tsx` and `components/forms/Input.tsx`), plus raw inputs throughout.
  - Icons mix lucide, PNG bitmaps (`service.png`, `control.png`, `support_icon.png`), `vintage-icon.tsx` tiles and custom SVG illustrations.
  - Two toast systems: sonner (root layout) and a custom `av:toast` event bus in `PortalLayout`.

## 5. Security issues seen during the audit

These are reported, not fixed, as most fall outside presentation work.

- `auth.ts:52–55, 69–72, 79`: plaintext password comparison (`password === user.password`). The customer form also authenticates **admin** accounts (the admin fallback at line 66).
- `auth.config.ts`: a hard-coded fallback `AUTH_SECRET`.
- `middleware.ts`: logs every `/admin` request.
- `Math.random()` is used for registration tokens (`app/actions/applications.ts:16,183`), temporary passwords (`app/actions/requests.ts:13`), card numbers and CVVs (`app/actions/cards.ts:209–216,309–322`) and account numbers. It is not cryptographically secure; these should use `crypto.randomInt` / `randomBytes`.
- CVVs are stored and sent to the browser (`app/(portal)/cards/page.tsx:30`). PCI DSS forbids storing CVV after authorisation.
- `PortalHeader` sends the customer's IP address to `ipapi.co`.
- Emails, including temporary passwords, are written to server logs when Resend isn't configured (`lib/email.ts`).
- Registration PII is kept in localStorage.
- `lib/api-client.ts` logs full API error bodies to the browser console.

## 6. Prioritised fix list

### Critical
1. **Fabricated financial data shown as real**: the admin transaction generator, the random credit score, hard-coded dashboard items, invented credit scores, the invented pre-approved loan, invented benefit activities, and fake fallback payees (items 1–7 in section 3). These must come from real records or show an honest empty state. Admin-made entries must be clearly attributed adjustments, never invented merchant activity.
2. **Funds-at-risk deposit details**: the fixed DEMO crypto addresses and the randomly generated wallet addresses (items 8–9). Hide these rails until real custody addresses exist.
3. **Security**: plaintext passwords, admin login through the customer form, the fallback auth secret, stored CVVs, and insecure randomness for tokens, passwords and card numbers (section 5).
4. **Visible demo and mock UI**: "Load Demo Check", "(demo)" copy, "Simulated" tag, simulated PDF downloads, the mock proof-of-address upload, the fake install progress bar, and "Coming soon" badges (items 10–15). Each needs a real implementation, or the feature should be hidden.
5. **Missing core flows and states**: no password reset, no MFA, no session-timeout warning or expired-session message, no error, loading or 404 boundaries. Errors redirect to login.

### High
6. Replace the four palettes and 50 hex values with one token set aligned with the marketing site's Isobath system (petrol action colour, Heritage ink, chalk/white, alert red). Remove the undefined `vintage-*`, `soft-gold`, `charcoal` and `danger` classes.
7. Typography: retire Familjen Grotesk and IBM Plex Mono, and move the portal to Source Serif 4 and Source Sans 3 with tabular figures for amounts. Eliminate the 492 sub-12 px instances (13 px floor). Cut `font-mono` (414) to codes only.
8. Navigation: one consistent information architecture on desktop and mobile that reaches every screen. Collapse the three header rows. Remove the live clock and IP geolocation.
9. Accessibility: 44 px touch targets (bottom nav, header icons, login links), visible 3:1 focus rings, a real h1 on every screen, `aria-invalid` and `aria-describedby` errors on every form (only Transfer has any), and no `alert()`/`confirm()` dialogs.
10. Fix the Savings-progress display bug and the even-split daily chart.
11. Remove the IP-geolocation call, and stop storing registration PII in localStorage.

### Medium
12. One button, card, input and toast kit; delete the glassmorphism `commercial-ui/Card`, the PNG icons and the unused `LeftSidebar` / `RightSidebar`.
13. One radius (2 px), no decorative shadows or gradients, replace the 105 arbitrary spacing values with the 8 px scale, and remove the 17 inline styles and 2 injected `<style>` blocks.
14. Copy: remove "1888", "Heritage Trust Bank, N.A.", the hard-coded phone number and "Back to heritagetrust.com"; use sentence case and US date formats throughout.
15. Login: make "Remember my username" work or remove it, honour `?redirect=`, and point "Enroll in online banking" to the enrolment page.
16. Empty states for statements, activity, cards and beneficiaries; skeletons consistently (currently in 15 of about 60 components).
17. Mask full account numbers by default, with an explicit "reveal" action (deposit instructions, account-created dialogs).
18. Replace `sentry-mock` with real error monitoring, or remove it; remove `console.*` from client code.
