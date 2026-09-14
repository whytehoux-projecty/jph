# Definitive Porting & Migration Plan: Standalone → Unified Bank (Option A)

**Architecture**: Every portal page becomes an `async` Server Component that reads directly from Prisma. Interactive sections (forms, dialogs, toggles) are split into child `"use client"` components that receive data as props and call Server Actions for mutations.

---

## Critical Pre-flight Findings

| # | Issue | Severity |
|---|-------|----------|
| 1 | `overview/page.tsx` imports `oakLeaf from "../../Adobe Express - file-2.png"` — file doesn't exist in unified-bank | 🚨 Build-breaking |
| 2 | `dashboard/page.tsx` calls `api.profile.get()` and `api.transactions.getStats()` — not in unified stub | 🚨 Runtime crash |
| 3 | `settings/page.tsx` calls `api.twoFactor.*` — not in unified stub | 🚨 Runtime crash |
| 4 | `statements/page.tsx` posts to `/api/statements/generate` — route doesn't exist | 🚨 Runtime error |
| 5 | `actions.ts` uses `new PrismaClient()` per-call — connection pool exhaustion | ⚠️ Performance |
| 6 | `api/savings-goals/route.ts` uses in-memory state — resets on restart | ⚠️ Data loss |
| 7 | `unified-bank/lib/api-client.ts` is a local stub (not external). The app won't crash on most pages, but returns empty data everywhere | ⚠️ Silent empty state |
| 8 | Login page is missing 12 lines of UI: social footer links (Globe, Award icons), `rememberMe` checkbox, "Sign up now" link | 🟡 UX regression |
| 9 | `Header.tsx` in unified-bank is the **corporate site header** (marketing nav). The portal uses the standalone `Header.tsx` (user account nav + notification bell) | 🚨 Wrong component |
| 10 | `Footer.tsx` differs: standalone has social icons via lucide-react brand icons; unified uses inline SVGs workaround (correct approach — lucide dropped brand icons) | ✅ Already fixed |
| 11 | Transfer page: uses `api.twoFactor.verify()` before submitting — needs to be stubbed/removed for demo | ⚠️ Need decision |
| 12 | `lib/api-client.ts` must NOT be deleted — the `(corporate)` route group uses it for `requestAccountOpening` and `submitContactForm` | ⚠️ Risk of breaking corporate |

---

## Execution Phases

```
Phase 0  → Foundation (Prisma singleton + schema expansion)
Phase 1  → Fix all build-breaking and crash bugs
Phase 2  → Create the Server Actions library (12 action files)
Phase 3  → Migrate every portal page (Option A: Server Components)
Phase 4  → Migrate all sub-components under app/(portal)/*/components/
Phase 5  → Migrate shared components in /components/
Phase 6  → Restore Transfer page full UI
Phase 7  → Database seeding + verification
```

---

## Phase 0: Foundation

### [NEW] `unified-bank/lib/prisma.ts`
Global Prisma singleton — prevents connection pool exhaustion in development and serverless:
```ts
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### [MODIFY] `unified-bank/prisma/schema.prisma`
Add these 5 missing models (required for bills, statements, savings, notifications):

```prisma
model SavingsGoal {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  name          String
  targetAmount  Float    @map("target_amount")
  currentAmount Float    @default(0) @map("current_amount")
  targetDate    DateTime @map("target_date")
  createdAt     DateTime @default(now()) @map("created_at")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("savings_goals")
}

model Payee {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  name          String
  accountNumber String   @map("account_number")
  category      String   @default("OTHER")
  country       String   @default("usa")
  createdAt     DateTime @default(now()) @map("created_at")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bills         Bill[]
  @@map("payees")
}

model Bill {
  id        String    @id @default(cuid())
  accountId String    @map("account_id")
  payeeId   String    @map("payee_id")
  amount    Float
  status    String    @default("PENDING") // PENDING, PAID
  paidAt    DateTime? @map("paid_at")
  createdAt DateTime  @default(now()) @map("created_at")
  account   Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  payee     Payee     @relation(fields: [payeeId], references: [id], onDelete: Cascade)
  @@map("bills")
}

model Statement {
  id          String   @id @default(cuid())
  accountId   String   @map("account_id")
  period      String   // e.g. "2026-08"
  generatedAt DateTime @default(now()) @map("generated_at")
  account     Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  @@map("statements")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  title     String
  message   String
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("notifications")
}
```
Also add relations to existing models: `User` → `savingsGoals`, `payees`, `notifications`; `Account` → `bills`, `statements`.

### [MODIFY] `unified-bank/app/(portal)/actions.ts`
- Replace `new PrismaClient()` with `import { prisma } from '@/lib/prisma'`.

---

## Phase 1: Bug Fixes

### [MODIFY] `app/(portal)/overview/page.tsx` — Build fix
- **Line 8**: Remove `import oakLeaf from "../../Adobe Express - file-2.png"`.
- Replace all uses of `{oakLeaf}` image src with `"/bank-logo.svg"`.

### [MODIFY] `app/(portal)/dashboard/page.tsx` — Crash fix
- Remove `api.profile.get()` and `api.transactions.getStats()` calls.
- Temporarily replace with hardcoded empty state / skeleton. Full fix in Phase 3.

### [MODIFY] `app/(portal)/settings/page.tsx` — Crash fix
- Remove all `api.twoFactor.*` calls.
- Wrap the 2FA UI section with a `"Coming Soon"` badge and disabled state. Full fix in Phase 3.

### [MODIFY] `app/(portal)/statements/page.tsx` — Runtime error fix
- Remove `apiClient.post('/api/statements/generate')`.
- Replace with a toast: `"Statement generation is being upgraded. Please try again shortly."` Full fix in Phase 3.

---

## Phase 2: Server Actions Library

All files in `unified-bank/app/actions/`. Each file starts with `'use server'` and uses the shared Prisma singleton.

### [NEW] `app/actions/accounts.ts`
| Action | Description |
|--------|-------------|
| `getAccounts()` | Auth-guarded. Fetch all accounts + balances for the session user |
| `getAccountById(id)` | Fetch one account + last 10 transactions |
| `getAccountTransactions(accountId, limit?)` | Paginated transactions for a specific account |

### [NEW] `app/actions/transactions.ts`
| Action | Description |
|--------|-------------|
| `getTransactions(filters?)` | Paginated list: type, date range, search, limit, offset |
| `getTransactionStats(period)` | Sum CREDIT/DEBIT for 'week'/'month'/'year' |
| `getRecentTransactions(limit?)` | Last N transactions across all accounts |
| `updateCategory(id, category)` | PATCH transaction metadata field |
| `addNote(id, note)` | Append note to transaction metadata |
| `disputeTransaction(id, reason)` | Set status → 'DISPUTED', store reason in metadata |
| `exportReceiptData(id)` | Return structured receipt object (PDF rendered client-side) |

### [NEW] `app/actions/transfer.ts`
| Action | Description |
|--------|-------------|
| `submitTransfer(formData)` | Create PENDING Transaction, handles LOCAL/WIRE/CRYPTO types. Replaces standalone `actions.ts` |
| `getExchangeRate(from, to)` | Return hardcoded demo rate map (USD→EUR: 0.92, etc.) — no external API needed |
| `getRecentRecipients(method, limit?)` | Query Beneficiaries filtered by method/type |

### [NEW] `app/actions/beneficiaries.ts`
| Action | Description |
|--------|-------------|
| `getBeneficiaries()` | All beneficiaries for session user |
| `getBeneficiariesByMethod(method)` | Filtered by transfer method |
| `createBeneficiary(data)` | Insert new beneficiary |
| `deleteBeneficiary(id)` | Delete (verify ownership first) |

### [NEW] `app/actions/cards.ts`
| Action | Description |
|--------|-------------|
| `getCards()` | All cards across user's accounts |
| `getCardById(id)` | Single card with account info |
| `freezeCard(id)` | Set status → 'FROZEN' |
| `unfreezeCard(id)` | Set status → 'ACTIVE' |
| `updateLimits(id, limits)` | Store dailyLimit/monthlyLimit in card metadata JSON |
| `issueCard(accountId, cardType)` | Create new Card record with generated number |

### [NEW] `app/actions/bills.ts`
| Action | Description |
|--------|-------------|
| `getPayees()` | All payees for session user |
| `addPayee(data)` | Create new Payee |
| `deletePayee(id)` | Remove payee (verify ownership) |
| `payBill(data)` | Create Bill record + PENDING Transaction |
| `getProviders()` | Return static providers JSON (replaces the Edge API route) |
| `getBillHistory()` | List all Bills for user's accounts |

### [NEW] `app/actions/savings.ts`
| Action | Description |
|--------|-------------|
| `getSavingsGoal()` | Fetch or create default SavingsGoal for user |
| `updateSavingsGoal(data)` | Upsert savings goal record |

### [NEW] `app/actions/statements.ts`
| Action | Description |
|--------|-------------|
| `getStatements()` | All statements for user's accounts |
| `generateStatement(accountId, period)` | Create Statement record in Prisma |
| `getStatementDetails(id)` | Fetch statement + account transactions for that period |

### [NEW] `app/actions/profile.ts`
| Action | Description |
|--------|-------------|
| `getProfile()` | Session user's User record from Prisma |
| `updateProfile(data)` | Update firstName, lastName, phone |
| `changePassword(currentPwd, newPwd)` | bcrypt verify current, hash + save new |
| `updatePreferences(prefs)` | Store preferredLanguage, preferredCurrency (add fields to User model) |
| `updateNotificationSettings(settings)` | Store notification prefs in User metadata |

### [NEW] `app/actions/notifications.ts`
| Action | Description |
|--------|-------------|
| `getNotifications()` | All notifications for user, sorted by date desc |
| `markAsRead(id)` | Set isRead → true |
| `markAllAsRead()` | Bulk update |

### [NEW] `app/actions/support.ts`
| Action | Description |
|--------|-------------|
| `sendContactMessage(data)` | Create a Notification record for admin review (demo) or log to console |

---

## Phase 3: Portal Pages Migration (Option A)

Each page becomes an `async` Server Component. The interactive client parts become named child components (in the same file or a `./components/` sub-file).

---

### 🔐 `/login` — `app/(portal)/login/page.tsx`
**Status**: Mostly done (NextAuth), 12-line UI regression.
**Work**:
- Port missing UI from standalone: `rememberMe` checkbox, "Sign up now" link.
- Fix "Forgot username/password?" link to point to `/apply` (internal) instead of `#`.
- The social icon imports (`Globe`, `Award`, `Zap`, `FacebookIcon`, etc.) were used in the standalone page footer — verify if they appear in the standalone login or just in the Footer component; adjust accordingly.
- Remove unused standalone-era imports (`Lock`, `Mail`, `Eye`, `EyeOff`, etc.) — already done in unified, confirm clean.
- **Architecture**: Keep as `"use client"` — login form is inherently interactive, no server data needed.

---

### 📊 `/dashboard` — `app/(portal)/dashboard/page.tsx`
**Status**: Broken (calls non-existent api methods, `"use client"` everywhere).
**Current lines**: 318 (standalone) / 318 (unified).
**Work**:
- Convert `DashboardPage` to `async` Server Component (remove `"use client"` from top-level).
- Fetch in parallel at server level:
  - `getAccounts()` → total balance, per-account breakdown
  - `getRecentTransactions(5)` → for Recent Transactions widget
  - `getTransactionStats("month")` → income / expenses stats
  - `getSavingsGoal()` → savings goal card
  - `getNotifications()` → unread count for header badge
- Pass all data as props to existing child components.
- Wrap `QuickActions`, `SpendingByCategory`, `Overview`, `RecentTransactions` in a `"use client"` wrapper only if they use hooks.
- Remove the `export const dynamic = "force-dynamic"` directive (not needed on Server Components).

**Component split**:
```
DashboardPage (async Server Component)
  └── DashboardStats (pure display, props-driven)
  └── <Overview /> (recharts — must remain "use client")
  └── <RecentTransactions /> (pure display, can be Server Component)
  └── <QuickActions /> (links only, can be Server Component)
  └── <SpendingByCategory /> (recharts — must remain "use client")
  └── <SavingsGoalUpdater /> [NEW "use client"] — calls updateSavingsGoal action
```

---

### 🔍 `/overview` — `app/(portal)/overview/page.tsx`
**Status**: Duplicate of dashboard + broken `oakLeaf` import (build-breaking).
**Current lines**: 494 (standalone) / 494 (unified).
**Work**:
- Fix `oakLeaf` import first (Phase 1).
- Repurpose as a distinct **"Financial Overview"** page: analytics-focused, not a dashboard clone.
  - Show all accounts listed with sparkline charts.
  - Show category breakdown pie chart.
  - Show income vs expense bar chart per month.
  - Show analytics tab with trends.
- Convert to `async` Server Component:
  - Fetch `getAccounts()`, `getTransactions({ limit: 100 })`, `getTransactionStats("month")`.
- Keep `Overview` (recharts bar chart) and `SpendingByCategory` (recharts pie) as `"use client"` children.
- Remove the `import oakLeaf` and `Image src={oakLeaf}` usage entirely.
- Remove the `analyticsData` local state (move to server-fetched props).

---

### 💳 `/accounts` — `app/(portal)/accounts/page.tsx`
**Status**: UI intact, all data fetching broken (api calls return empty).
**Current lines**: 639 (both).
**Work**:
- Convert to `async` Server Component.
- Server-fetch: `getAccounts()` for account list + balances; `getProfile()` for user greeting.
- Pass `accounts` and `user` as props to child components.
- Sub-components that need to become `"use client"`:
  - `AccountCard` — has internal state (expand/collapse, mini transaction fetch) 
  - `AccountActionDialogs` — has form state + calls `api.contact.send` → replace with `sendContactMessage` Server Action
  - `AccountDetailsDialog` — has tabs, downloads → calls `getStatements` + `downloadStatement`
  - `AccountAnalytics` — recharts, must remain `"use client"`
- Remove `export const dynamic = "force-dynamic"`.

---

### 📋 `/transactions` — `app/(portal)/transactions/page.tsx`
**Status**: UI intact (2,282 lines), all data fetching broken.
**Current lines**: 2,282 (both).
**Work** (special case — too complex to fully Server-Componentize):
- Create a thin `async` Server Component wrapper `TransactionsPage` that pre-fetches initial data:
  - `getAccounts()` → for account filter dropdown
  - `getTransactions({ limit: 100 })` → initial list
- Pass initial data to the existing `"use client"` `TransactionsContent` component as props.
- Inside `TransactionsContent`, replace all `api.*` calls:
  - `api.transactions.getAll()` → `getTransactions()` Server Action (called via `startTransition`)
  - `api.transactions.updateCategory()` → `updateCategory()` Server Action
  - `api.transactions.addNote()` → `addNote()` Server Action
  - `api.transactions.dispute()` → `disputeTransaction()` Server Action
  - `api.transactions.exportReceipt()` → `exportReceiptData()` Server Action (receipt PDF rendered client-side)
- Remove `export const dynamic = "force-dynamic"`.

---

### 💳 `/cards` — `app/(portal)/cards/page.tsx`
**Status**: UI intact (627 lines), card fetch broken, freeze/unfreeze broken.
**Current lines**: 627 (both).
**Work**:
- Convert to `async` Server Component.
- Server-fetch: `getCards()` + account info.
- Pass card data as props to `"use client"` interactive shell.
- Fix import paths: `@/app/cards/components/...` → `./components/...` (already done in unified).
- Inside the interactive shell, replace:
  - `api.cards.unfreeze(id)` → `unfreezeCard(id)` Server Action (via `startTransition`)
  - `api.cards.freeze(id)` → `freezeCard(id)` Server Action
- Sub-components (see Phase 4 for full treatment).

---

### 🧾 `/bills` — `app/(portal)/bills/page.tsx`
**Status**: UI intact (516 lines), all data fetching broken (9 api calls).
**Current lines**: 516 (both).
**Work**:
- Convert to `async` Server Component.
- Server-fetch: `getAccounts()`, `getProviders()`, `getPayees()`.
- Pass to `"use client"` `BillsContent` child component.
- Replace all `api.bills.*` calls:
  - `api.accounts.getAll()` → server-prefetched props
  - `api.bills.getProviders()` → `getProviders()` Server Action (or server-prefetched props)
  - `api.bills.getPayees()` → `getPayees()` Server Action
  - `api.bills.addPayee()` → `addPayee()` Server Action
  - `api.bills.pay()` → `payBill()` Server Action
  - `api.bills.payVerified()` → `payBill()` Server Action (verified variant)
  - `api.bills.uploadInvoice()` → keep existing Edge route `/api/bills/upload-invoice`
- Remove `export const dynamic = "force-dynamic"`.

---

### 👥 `/beneficiaries` — `app/(portal)/beneficiaries/page.tsx`
**Status**: UI intact (340 lines), all data broken.
**Current lines**: 340 (both).
**Work**:
- Convert to `async` Server Component.
- Server-fetch: `getBeneficiaries()`.
- Pass to `"use client"` `BeneficiariesContent`.
- Replace:
  - `api.beneficiaries.getAll()` → server-prefetched props
  - `api.beneficiaries.create()` → `createBeneficiary()` Server Action
  - `api.beneficiaries.delete()` → `deleteBeneficiary()` Server Action

---

### ⚙️ `/settings` — `app/(portal)/settings/page.tsx`
**Status**: UI intact (822 lines), profile/password broken, 2FA crashes.
**Current lines**: 822 (both).
**Work**:
- Convert outer shell to `async` Server Component.
- Server-fetch: `getProfile()` → initial profile values.
- Pass profile data as props to `"use client"` `SettingsContent`.
- Inside `SettingsContent`, replace:
  - `api.profile.get()` → server-prefetched props (initial render)
  - `api.profile.update()` → `updateProfile()` Server Action
  - `api.profile.changePassword()` → `changePassword()` Server Action
  - `api.profile.update({ preferredLanguage, preferredCurrency })` → `updatePreferences()` Server Action
  - `api.profile.update({ notificationPreferences })` → `updateNotificationSettings()` Server Action
  - `api.twoFactor.*` → **stub** all 2FA sections as "Coming soon — will be available upon full launch" with disabled UI. Do NOT crash.

---

### 📄 `/statements` — `app/(portal)/statements/page.tsx`
**Status**: UI intact (213 lines), all data fetching broken.
**Current lines**: 213 (both).
**Work**:
- Convert to `async` Server Component.
- Server-fetch: `getStatements()`.
- Pass to `"use client"` `StatementsContent`.
- Replace:
  - `api.statements.getAll()` → server-prefetched props
  - `api.statements.download(id)` → `getStatementDetails(id)` Server Action, then generate a client-side text/PDF blob
  - `apiClient.post('/api/statements/generate')` → `generateStatement()` Server Action

---

### 🆘 `/support` — `app/(portal)/support/page.tsx`
**Status**: UI intact (260 lines), `api.contact.send` broken.
**Current lines**: 260 (both).
**Work**:
- Keep as `"use client"` (fully interactive FAQ + contact form — no server data needed on load).
- Replace `api.contact.send()` → `sendContactMessage()` Server Action.

---

### 💸 `/transfer` — `app/(portal)/transfer/page.tsx`
**Status**: UI completely stubbed (135 lines). Full restoration in Phase 6.

---

### 🚫 `/unavailable` — `app/(portal)/unavailable/page.tsx`
**Status**: Identical in both. UI-only page, no data fetching.
**Work**: None required. Verify it still renders correctly in unified layout.

---

## Phase 4: Sub-Component Migration (under `app/(portal)/*/components/`)

### Accounts sub-components

#### [MODIFY] `accounts/components/AccountCard.tsx` (318 lines)
- Receives `account` + `transactions` as props from Server Component parent.
- Remove `api.transactions.getAll()` → accept initial transactions as prop; on demand use `getAccountTransactions()` Server Action.

#### [MODIFY] `accounts/components/AccountDetailsDialog.tsx` (696 lines)
- Receives `account` as prop.
- Remove `api.statements.getAll()` → `getStatements()` Server Action (lazy-loaded when dialog opens).
- Remove `api.statements.download()` → `getStatementDetails()` Server Action.

#### [MODIFY] `accounts/components/AccountActionDialogs.tsx` (349 lines)
- Remove `api.contact.send()` → `sendContactMessage()` Server Action.

#### `accounts/components/AccountAnalytics.tsx`
- Pure recharts component. No api calls. Accept `transactions` as props. **No changes needed.**

---

### Cards sub-components

#### [MODIFY] `cards/components/CardExpenseChart.tsx` (179 lines)
- Remove `api.transactions.getStats("week")` and `getStats("month")`.
- Accept `weekStats` and `monthStats` as props from parent Server Component.

#### [MODIFY] `cards/components/CardSpendingInsights.tsx` (179 lines)
- Remove `api.transactions.getAll()` call.
- Accept `transactions` as props.

#### [MODIFY] `cards/components/CardTransactionHistory.tsx` (307 lines)
- Remove `api.transactions.getAll({ limit: 100 })`.
- Accept `transactions` as props.
- Remove `api.transactions.dispute()` → `disputeTransaction()` Server Action.

#### [MODIFY] `cards/components/CardLimitsControl.tsx` (200 lines)
- Remove `api.cards.updateLimits()` → `updateLimits()` Server Action.
- No data fetching; receives `card` and `cardId` as props.

#### [MODIFY] `cards/components/CardLocationTable.tsx` (106 lines)
- Remove `api.transactions.getAll({ limit: 5 })`.
- Accept `transactions` as props.

#### `cards/components/CardDetailsDialog.tsx` — No api calls. No changes needed.
#### `cards/components/CreditScore.tsx` — No api calls. No changes needed.
#### `cards/components/VirtualCardGenerator.tsx` — No api calls. No changes needed.

---

### Bills sub-components
#### `bills/components/CountrySelector.tsx` — No api calls. No changes needed.
#### `bills/components/ServiceCategoryGrid.tsx` — No api calls. No changes needed.
#### `bills/components/InvoiceUploader.tsx` — Already uses existing Edge route (`/api/bills/upload-invoice`). No changes needed.

---

## Phase 5: Shared Components Migration (under `/components/`)

### [MODIFY] `components/layout/Header.tsx`
**Critical finding**: The unified-bank `Header.tsx` is the corporate marketing nav header. The portal needs the standalone version which has:
- User account dropdown
- Notification bell → `NotificationCenter`
- Right sidebar toggle button
- Portal status indicator

**Work**: Keep both headers. The `EBankingLayout.tsx` already conditionally renders based on route. The portal layout uses the standalone-style Header (already correct in `EBankingLayout.tsx` which imports from the right place). **Verify the import path is to the correct Header component**.

### [MODIFY] `components/layout/Footer.tsx`
Already fixed (inline SVG social icons). No additional work needed.

### [MODIFY] `components/NotificationCenter.tsx`
- Remove `api.notifications.getAll()`.
- Accept `notifications` as props (passed from Server Component parent in layout or header).
- Add `markAsRead(id)` Server Action call via `startTransition`.
- Add `markAllAsRead()` Server Action call.

### [MODIFY] `components/dashboard/RightSidebarWidgets.tsx`
- Remove `api.notifications.getAll()` (method doesn't exist in unified stub — silent crash).
- Accept `notifications` as props OR call `getNotifications()` Server Action lazily.

### [MODIFY] `components/transfer/EnhancedAccountSelector.tsx`
- Remove `api.profile.get()` + `api.accounts.getAll()`.
- Accept `accounts: Account[]` and `userProfile` as props from parent.

### [MODIFY] `components/transfer/BeneficiarySelector.tsx`
- Remove `api.beneficiaries.getAll()` + `api.beneficiaries.getAllByMethod()`.
- Accept `beneficiaries` as props; call `createBeneficiary()` Server Action on add.

### [MODIFY] `components/transfer/FeeCalculator.tsx`
- Remove `api.exchangeRates.getRate()`.
- Call `getExchangeRate(from, to)` Server Action via `startTransition`.

### `components/transfer/ScheduleTransfer.tsx` — No api calls. No changes needed.
### `components/transfer/TransferMethodSelector.tsx` — No api calls. No changes needed.
### `components/portal/PortalStatusIndicator.tsx` — Differs between standalone/unified. Keep unified version (already uses local health check).

---

## Phase 6: Transfer Page Full Restoration

### [MODIFY] `app/(portal)/transfer/page.tsx` — Full rewrite
**This is the most significant single task. The standalone version (1,599 lines) has:**
- Multi-step transfer form (method selection → details → OTP → receipt)
- Transfer method selector (Internal, ACH, Wire, Zelle, RTP, International)
- Beneficiary search and quick-select
- Fee calculator with live FX rate display
- Scheduled transfer picker
- 2FA OTP step (pre-transfer verification)
- Receipt modal with PDF download + native share
- Multi-language support via `translate()`

**Migration strategy**:
1. Copy the full 1,599-line file from standalone as the starting point.
2. Fix the 7 import paths from `@/app/cards/...` → `./components/...` (already done).
3. Remove `api.twoFactor.verify()` call — for demo, skip 2FA step entirely (or show it as "bypassed for demo").
4. Replace `api.accounts.getAll()` → accept `accounts` as prop from a thin Server Component wrapper page.
5. Replace `api.profile.get()` → accept `userProfile` as prop.
6. Replace `api.transfers.create()` and `api.transfers.createWire()` → `submitTransfer()` Server Action (in `app/actions/transfer.ts`).
7. Update `FeeCalculator`, `BeneficiarySelector`, `EnhancedAccountSelector` to use their new prop-based API (Phase 5).
8. Keep Suspense boundaries, receipt modal, PDF download, native share.
9. Wrap the full transfer form in a `"use client"` `TransferContent` component.
10. The outer `TransferPage` becomes an `async` Server Component that prefetches accounts + beneficiaries.

**Architecture**:
```
TransferPage (async Server Component)
  → prefetches: getAccounts(), getBeneficiaries(), getProfile()
  └── TransferContent (existing rich "use client" form, receives props)
        └── TransferMethodSelector (no api, pure UI)
        └── EnhancedAccountSelector (receives accounts prop)
        └── BeneficiarySelector (receives beneficiaries prop)
        └── FeeCalculator (calls getExchangeRate via startTransition)
        └── ScheduleTransfer (no api, pure UI)
        └── ReceiptModal (pure UI, client-side PDF)
```

---

## Phase 7: Seeding & Final Cleanup

### [NEW] `unified-bank/prisma/seed.ts`
Seed the database so the app has realistic data from first load:
- 1 Admin user (`admin@jpheritage.com` / `admin123`)
- 2 Demo users with `hasOnlineAccess: true`
- 2–3 Accounts per user (Checking, Savings, one Credit)
- 20–30 Transactions per account (mix of CREDIT/DEBIT, various statuses)
- 5 Beneficiaries per user
- 1 Savings Goal per user
- 2–3 Notifications per user (unread)
- 2–3 Cards per account
- 2–3 Payees per user
- 2–3 Statements per account

### API Route Decisions
| Route | Action |
|-------|--------|
| `app/api/auth/[...nextauth]/route.ts` | **Keep** — Required by NextAuth |
| `app/api/bills/upload-invoice/route.ts` | **Keep** — Used by InvoiceUploader |
| `app/api/bills/providers/route.ts` | **Remove** after `getProviders()` Server Action is ready |
| `app/api/savings-goals/route.ts` | **Remove** after `getSavingsGoal()` Server Action is ready |
| `lib/api-client.ts` | **Audit then scope**: mark all `api.*` methods used only by `(corporate)` as safe; document which portal-facing methods to deprecate. Do NOT delete. |

---

## Verification Matrix

### Automated Checks
```bash
npx tsc --noEmit                          # Zero TypeScript errors
npm run build                             # Successful production build
grep -r "api-client" app/(portal)         # Must return 0 results
grep -r "new PrismaClient()" app/         # Must return 0 (only lib/prisma.ts creates it)
```

### Page-by-Page Manual Verification
| Page | Data Loads | Mutations Work | No Console Errors |
|------|-----------|----------------|-------------------|
| `/login` | N/A | ✅ NextAuth sign-in works | ✅ |
| `/dashboard` | Balance, stats, transactions from SQLite | Savings goal update | ✅ |
| `/overview` | Accounts, analytics from SQLite | N/A | ✅ No oakLeaf crash |
| `/accounts` | All accounts + balances | Open dialog, link external | ✅ |
| `/transactions` | Full list, filters, pagination | Category, note, dispute, export | ✅ |
| `/cards` | Cards list with status | Freeze, unfreeze, limits | ✅ |
| `/bills` | Providers, payees, accounts | Add payee, pay bill, upload invoice | ✅ |
| `/beneficiaries` | Full beneficiary list | Add, delete | ✅ |
| `/settings` | Profile loaded | Update profile, change password | ✅ 2FA shows "Coming soon" |
| `/statements` | Statement list | Generate, download | ✅ |
| `/support` | FAQs static | Contact form submits | ✅ |
| `/transfer` | Accounts, beneficiaries pre-loaded | Full transfer flow, receipt modal | ✅ |
| `/unavailable` | Static | N/A | ✅ |
| Admin `/admin` | Pending transactions | Approve/reject | ✅ |

### End-to-End Smoke Test
1. Seed the database (`npx prisma db seed`)
2. Log in as demo user
3. Verify dashboard shows real account balance
4. Submit a transfer → verify it appears as PENDING in admin
5. Admin approves → re-check transfer in transactions page
