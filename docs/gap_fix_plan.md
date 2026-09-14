# JPH Unified Bank — Comprehensive Gap Fix Plan
**Source:** Gap Analysis Report (jph_gap_analysis.md)
**Target:** `unified-bank` at `/Volumes/Project Disk/PROJECTS/JPHeritage/unified-bank`
**Scope:** 17 issues across 4 critical bugs, 5 design regressions, 7 feature gaps, 3 code-quality improvements

---

## Execution Phases

```
Phase A → Critical Bug Fixes          (4 items — must run first)
Phase B → Design & Visual Regressions (5 items — visible on every load)
Phase C → Feature Gaps                (7 items — functionality missing vs. standalone)
Phase D → Code Quality & Tech Debt    (3 items — cleanup and robustness)
Phase E → Seed & Verification         (1 item — run last, validates everything)
```

---

## Phase A — Critical Bug Fixes

> [!CAUTION]
> These are blocking issues. Complete all of Phase A before proceeding. Phase B+ changes are cosmetic improvements on top of a working base.

---

### A1 — Purge Stale `api-client` Imports from Portal Files

**Severity:** 🔴 Critical
**Root cause:** Migration from `api-client` to Server Actions left stale import lines in 3 files.

#### A1.1 — [`BeneficiariesClient.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/beneficiaries/BeneficiariesClient.tsx)

- **Line 7**: `import { api } from '@/lib/api-client';` → **Delete this line**
- The file already imports `createBeneficiary` and `deleteBeneficiary` from `@/app/actions/beneficiaries` on line 6. No `api.*` calls remain. Import is dead.
- **Also fix Line 74–77**: The `loadBeneficiaries` function calls `window.location.reload()` — replace with `router.refresh()` (Next.js App Router pattern):

```diff
-  const loadBeneficiaries = async () => {
-    // Mock load for UI updates after adding/deleting
-    window.location.reload();
-  };
+  const loadBeneficiaries = async () => {
+    router.refresh();
+  };
```

#### A1.2 — [`BillsClient.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/bills/BillsClient.tsx)

- **Line 15**: `import { api } from "@/lib/api-client";` → **Delete this line**
- All data mutations already use `payBill` from `@/app/actions/bills` (line 14).

#### A1.3 — [`AccountDetailsDialog.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/accounts/components/AccountDetailsDialog.tsx)

- **Line 35**: `import { api } from "@/lib/api-client";` → **Delete this line**
- Statements are already loaded via `getStatements` from `@/app/actions/statements` (imported on line 8).

**Verification command after all A1 changes:**
```bash
grep -rn "api-client" app/(portal) --include="*.tsx" --include="*.ts"
# Must return zero results
```

---

### A2 — Wire `getProfile()` to `RightSidebar`

**Severity:** 🔴 Critical
**Root cause:** [`RightSidebar.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/layout/RightSidebar.tsx) renders hardcoded "John Doe", "ID: 8839-2991-00", "PREMIUM MEMBER" on lines 86, 92, 96.

#### A2.1 — Update `RightSidebarProps` interface

```diff
-interface RightSidebarProps {
-  isOpen: boolean;
-  onToggle: () => void;
-}
+interface UserProfile {
+  firstName: string;
+  lastName: string;
+  id: string;
+  tier: string;
+}
+interface RightSidebarProps {
+  isOpen: boolean;
+  onToggle: () => void;
+  profile?: UserProfile | null;
+}
```

#### A2.2 — Replace hardcoded JSX values (lines 76–98)

```diff
-  <AvatarFallback className="rounded-xl text-3xl">JD</AvatarFallback>
+  <AvatarFallback className="rounded-xl text-3xl">
+    {profile ? `${profile.firstName[0]}${profile.lastName[0]}` : '??'}
+  </AvatarFallback>

-  <h3 className="font-playfair font-bold text-2xl text-charcoal">John Doe</h3>
+  <h3 className="font-playfair font-bold text-2xl text-charcoal">
+    {profile ? `${profile.firstName} ${profile.lastName}` : 'Welcome'}
+  </h3>

-  <Badge ...>PREMIUM MEMBER</Badge>
+  <Badge ...>{profile?.tier ? `${profile.tier} MEMBER` : 'MEMBER'}</Badge>

-  <p className="text-xs text-muted-foreground font-mono mt-1">ID: 8839-2991-00</p>
+  <p className="text-xs text-muted-foreground font-mono mt-1">
+    ID: {profile?.id ? profile.id.slice(-10).toUpperCase() : '—'}
+  </p>
```

#### A2.3 — Fetch and pass `profile` from `EBankingLayout.tsx`

**File:** [`app/EBankingLayout.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/EBankingLayout.tsx)

```diff
+import { getProfile } from '@/app/actions/profile';

 export default async function EBankingLayout({ children }) {
+  let profile = null;
+  try { profile = await getProfile(); } catch { /* unauthenticated — stays null */ }

   // pass down to RightSidebar:
-  <RightSidebar isOpen={rightSidebarOpen} onToggle={...} />
+  <RightSidebar isOpen={rightSidebarOpen} onToggle={...} profile={profile} />
```

---

### A3 — Fix Seed Script: Add `prisma.seed` Config + Rewrite Seed Data

**Severity:** 🔴 Critical
**Root cause:** `package.json` has no `"prisma": { "seed": "..." }` field. Seed script also has severely minimal data (1 user, 3 transactions, no notifications/payees/bills/statements, unhashed passwords).

#### A3.1 — Add `prisma.seed` to `package.json`

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Ensure `ts-node` is installed:
```bash
npm install --save-dev ts-node
```

#### A3.2 — Rewrite `prisma/seed.ts`

The seed must create:
- **1 AdminUser**: `admin@jpheritage.com` / `Admin123!` (bcrypt hashed)
- **2 Demo Users**: `john.doe@jpheritage.com` and `jane.smith@jpheritage.com` / `Demo123!` (bcrypt hashed with `bcryptjs`)
  - User 1: PREMIUM tier, `hasOnlineAccess: true`
  - User 2: STANDARD tier, `hasOnlineAccess: true`
- **3 Accounts per demo user**: CHECKING, SAVINGS, CREDIT — with realistic starting balances
- **25 transactions per account**: Spread across 6 months; mix of CREDIT/DEBIT/APPROVED/PENDING; cover LOCAL_TRANSFER and INT_WIRE types; realistic descriptions (Salary, Grocery, Rent, Utilities, Restaurant, etc.)
- **5 Beneficiaries per user**: Mix of internal and external, with SWIFT codes for international
- **1 SavingsGoal per user**: With `currentAmount` set to ~40% of `targetAmount` for visible progress
- **3 Notifications per user**: 2 read + 1 unread — types: `INFO`, `SUCCESS`, `WARNING`
- **2 Cards per checking account**: DEBIT (VISA) + CREDIT (MASTERCARD), both ACTIVE
- **2 Payees per user**: Utility company + streaming service
- **2 Statements per account**: Past 2 months

> [!IMPORTANT]
> Use `bcryptjs` (already used in the auth module, cross-platform, no native binaries required) for all password hashing in seed:
> ```ts
> import bcrypt from 'bcryptjs';
> const hashedPassword = await bcrypt.hash('Demo123!', 12);
> ```

#### A3.3 — Run the seed

```bash
cd /Volumes/Project\ Disk/PROJECTS/JPHeritage/unified-bank
npx prisma db push           # Apply schema (idempotent)
npx prisma db seed           # Populate demo data
```

---

### A4 — Fix Login: Validation, Forgot-Password Link, Health Check

**Severity:** 🔴 Critical
**File:** [`app/(portal)/login/page.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/login/page.tsx)

#### A4.1 — Tighten account number validation (~line 54)

```diff
-const isAccountNumber = /^[a-zA-Z0-9-]+$/.test(formData.accountNumber);
+const isAccountNumber = /^\d{10,12}$/.test(formData.accountNumber);
```

This matches the standalone: only 10–12 digit strings are account numbers; everything else is treated as email input.

#### A4.2 — Fix "Forgot username/password?" link (line 256)

```diff
-<Link href="/apply" ...>Forgot username/password?</Link>
+<Link href="/contact" ...>Forgot username/password?</Link>
```

No password reset page exists yet — `/contact` is the correct fallback (has the support form). Update to a dedicated `/forgot-password` route when that feature is built.

#### A4.3 — Wire `PortalStatusIndicator` to login page

The component exists but is not used anywhere. Import it and render it above the login card:

```diff
+import { PortalStatusIndicator } from '@/components/portal/PortalStatusIndicator';

 // In JSX, above the main login card container:
+<PortalStatusIndicator
+  healthCheckUrl="/api/health"
+  pollInterval={60000}
+  showDetails={false}
+  className="mb-4"
+/>
```

**[NEW FILE]** `app/api/health/route.ts`:
```ts
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { status: 'online', timestamp: new Date().toISOString() }
  });
}
```

---

## Phase B — Design & Visual Regressions

> [!NOTE]
> These are UI-layer changes only. They can be done in any order within this phase.

---

### B1 — Restore Full Notification Panel in `NotificationCenter`

**Severity:** 🟠 High
**File:** [`components/NotificationCenter.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/NotificationCenter.tsx)

**Current state:** Only renders a bell button + unread dot. Popover imports are present but unused.

**Required implementation:**

1. Add `isOpen` state to control Popover open/close.
2. Add `notifications` state fetched via `getNotifications()` on mount.
3. Add `markAsRead(id)` and `markAllAsRead()` calls (import from `@/app/actions/notifications`).
4. Bell button click → open Popover (not the right sidebar toggle).

**Component structure:**
```tsx
<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="small" ...>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && <UnreadDot />}
    </Button>
  </PopoverTrigger>
  <PopoverContent align="end" className="w-[380px] p-0">
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h3 className="font-semibold text-sm">Notifications</h3>
      {unreadCount > 0 && (
        <Button variant="ghost" size="small" onClick={handleMarkAllAsRead}>
          Mark all read
        </Button>
      )}
    </div>
    <ScrollArea className="h-[400px]">
      {notifications.length === 0
        ? <EmptyState message="All caught up!" />
        : notifications.map(n => <NotificationItem key={n.id} n={n} onRead={handleMarkAsRead} />)
      }
    </ScrollArea>
  </PopoverContent>
</Popover>
```

**`NotificationItem` styling:**
- Unread: `border-l-2 border-[color:var(--heritage-gold)] bg-amber-50/30`
- Read: `border-l-2 border-transparent bg-transparent`
- Icon: mapped from `n.isRead` → Check; type INFO → `Info`, WARNING → `AlertCircle`, etc.
- Timestamp: `formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })`

---

### B2 — Wire `RightSidebarWidgets` to Real Prisma Data

**Severity:** 🟠 High
**File:** [`components/dashboard/RightSidebarWidgets.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/dashboard/RightSidebarWidgets.tsx)

#### B2.1 — `AccountSwitcherWidget` (lines 251–270)

Add `getAccounts` call:
```diff
+import { getAccounts } from '@/app/actions/accounts';

 export function AccountSwitcherWidget() {
+  const [accounts, setAccounts] = useState<any[]>([]);
+  useEffect(() => {
+    getAccounts().then(setAccounts).catch(() => setAccounts([]));
+  }, []);
```
Replace hardcoded `<SelectItem>` lines with `accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.accountType} ••••{a.accountNumber.slice(-4)}</SelectItem>)`.

#### B2.2 — `UpcomingBillsWidget` (lines 80–124)

```diff
+import { getBillHistory } from '@/app/actions/bills';
+import { formatDistanceToNow } from 'date-fns';

 export function UpcomingBillsWidget() {
-  const bills = [{ name: "Netflix Subscription", ... }, ...]; // hardcoded
+  const [bills, setBills] = useState<any[]>([]);
+  useEffect(() => {
+    getBillHistory().then(data => setBills(data.filter(b => b.status === 'PENDING').slice(0, 3))).catch(() => setBills([]));
+  }, []);
```

#### B2.3 — `CashFlowProjectionWidget` (lines 154–193)

```diff
+import { getTransactionStats } from '@/app/actions/transactions';

 export function CashFlowProjectionWidget() {
-  const inflow = 8420;
-  const outflow = 5140;
+  const [inflow, setInflow] = useState(0);
+  const [outflow, setOutflow] = useState(0);
+  useEffect(() => {
+    getTransactionStats('month').then(s => { setInflow(s.income || 0); setOutflow(s.expenses || 0); }).catch(() => {});
+  }, []);
```

> [!NOTE]
> `BudgetWidget` and `CreditScoreWidget` remain as designed/static demo data. Add a small `"Demo"` badge to each to communicate this honestly to reviewers.

---

### B3 — Fix Dashboard Grid Spacing (`gap-1` → `gap-4`)

**Severity:** 🟠 High
**Files:**
- [`app/(portal)/dashboard/page.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/dashboard/page.tsx) lines 54, 63
- [`app/(portal)/overview/page.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/overview/page.tsx) — search for all `gap-1` in grid containers

**Changes:**

| File | Line | Current | Fix |
|------|------|---------|-----|
| dashboard/page.tsx | 54 | `"grid gap-1 md:grid-cols-2 lg:grid-cols-4"` | `"grid gap-4 md:grid-cols-2 lg:grid-cols-4"` |
| dashboard/page.tsx | 63 | `"grid gap-1 md:grid-cols-2 lg:grid-cols-4"` | `"grid gap-4 md:grid-cols-2 lg:grid-cols-4"` |
| dashboard/page.tsx | 51 | `"flex-1 space-y-4 p-4 pt-0"` | `"flex-1 space-y-6 p-6 pt-4"` |
| overview/page.tsx | all grid containers | `gap-1` | `gap-4` |

---

### B4 — Connect `EBankingWidget` to `Hero.tsx`

**Severity:** 🟡 Medium
**Files:**
- [`components/commercial/Hero.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/commercial/Hero.tsx) lines 47–53
- [`components/commercial/EBankingWidget.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/commercial/EBankingWidget.tsx) handleSubmit (~line 28)

#### B4.1 — Import and render `EBankingWidget` in `Hero.tsx`

```diff
+import { EBankingWidget } from '@/components/commercial/EBankingWidget';

-          {showEBankingWidget ? (
-            <div className="flex items-center justify-center">
-              <div className="w-full max-w-md">
-                {/* Placeholder */}
-              </div>
-            </div>
+          {showEBankingWidget ? (
+            <div className="flex items-center justify-center">
+              <EBankingWidget className="w-full max-w-md" />
+            </div>
```

#### B4.2 — Update `EBankingWidget.handleSubmit` to use internal routing

```diff
-  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000';
-  try {
-    await fetch(`${portalUrl}/api/health`, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
-    window.location.href = portalUrl;
-  } catch (_) {
-    router.push('/unavailable');
-  } finally {
-    setIsChecking(false);
-  }
+  // In the unified bank, portal is the same app — no external URL needed
+  router.push('/login');
+  setIsChecking(false);
```

---

### B5 — Add `Testimonials` Section + Corporate `/unavailable` Page

**Severity:** 🟡 Medium

#### B5.1 — Add `Testimonials` to homepage

**File:** [`app/(corporate)/page.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28corporate%29/page.tsx)

```diff
+import { Testimonials } from '@/components/commercial/Testimonials';

 // In homepage JSX, after <Statistics /> and before final CTA section:
+<Testimonials />
```

#### B5.2 — [NEW FILE] `app/(corporate)/unavailable/page.tsx`

Port the standalone `Bank/corporate-website/app/unavailable/page.tsx`. Key adaptations:
- Update all import paths from `@/components/ui/...` → `@/components/commercial-ui/...`
- Update "Return to Home" href to use `ROUTES.home` from `@/lib/constants`
- Add metadata export: `export const metadata = { title: 'Service Unavailable | JP Heritage Bank' }`

---

## Phase C — Feature Gaps

---

### C1 — Transfer: Add OTP Input UI (Logic Already Present)

**Severity:** 🟠 High
**File:** [`app/(portal)/transfer/TransferClient.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/transfer/TransferClient.tsx)

**Finding:** The OTP state and `handleSubmit` transitions are fully implemented (lines 118–312). The OTP step is triggered correctly. What's missing is the **JSX panel that renders when `isOtpStep === true`**.

**Fix:** Insert the OTP input panel between the review summary card and the action buttons. Render it conditionally:

```tsx
{isOtpStep && (
  <Card className="border-amber-200 bg-amber-50/50">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-amber-600" />
        Verification Required
      </CardTitle>
      <CardDescription>
        Enter the 6-digit code sent to your registered device.
        <span className="block mt-1 text-xs text-amber-700/70 italic">
          Demo: enter any 6-digit code to proceed.
        </span>
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Input
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="000000"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
        autoFocus
      />
      {otpError && <p className="text-sm text-destructive">{otpError}</p>}
      <Button
        type="button"
        variant="ghost"
        size="small"
        disabled={resendCooldown > 0}
        onClick={() => { setResendCooldown(30); setOtpCode(''); }}
        className="w-full text-xs"
      >
        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
      </Button>
    </CardContent>
  </Card>
)}
```

**Also remove** the no-op `export const dynamic = "force-dynamic"` at line 3:
```diff
-export const dynamic = "force-dynamic";
```

---

### C2 — Beneficiaries: Wire "Transfer" CTA to Pre-fill Transfer Form

**Severity:** 🟡 Medium
**File:** [`app/(portal)/beneficiaries/BeneficiariesClient.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/beneficiaries/BeneficiariesClient.tsx)

The `TransferClient` already reads `searchParams.get("accountNumber")` and `searchParams.get("recipientName")` (lines 159, 162). Only the send-side is needed:

```diff
+import Link from 'next/link';

 // For each beneficiary card's "Transfer" button:
-<Button variant="ghost" size="small"><Send className="h-3.5 w-3.5 mr-1.5" /> Transfer</Button>
+<Link href={`/transfer?accountNumber=${encodeURIComponent(b.accountNumber)}&recipientName=${encodeURIComponent(b.name)}&bankName=${encodeURIComponent(b.bankName)}`}>
+  <Button variant="ghost" size="small">
+    <Send className="h-3.5 w-3.5 mr-1.5" /> Transfer
+  </Button>
+</Link>
```

---

### C3 — Settings: Verify `preferredLanguage`/`preferredCurrency` End-to-End

**Severity:** 🟡 Medium — verification only
**Finding:** Already wired in code (lines 98–99 and 148–150 in `SettingsClient.tsx`). The `settings/page.tsx` Server Component must pass full profile. Verify during Phase E.

**No code changes required** — confirm working during E3 smoke test.

---

### C4 — Admin Panel: Add 30-second Auto-Refresh

**Severity:** 🔵 Low
**File:** Admin transactions component (the `"use client"` component inside `app/(admin)/admin/(dashboard)/transactions/`)

```tsx
// At the top of the client component:
const router = useRouter();
const [lastRefresh, setLastRefresh] = useState(new Date());

useEffect(() => {
  const interval = setInterval(() => {
    router.refresh();
    setLastRefresh(new Date());
  }, 30000);
  return () => clearInterval(interval);
}, [router]);
```

Display in the panel header:
```tsx
<p className="text-xs text-muted-foreground">
  Auto-refreshing · Last updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
</p>
```

---

### C5 — Remove `api` Dependency from `AccountActionDialogs`

**Severity:** 🟡 Medium
**File:** [`app/(portal)/accounts/components/AccountActionDialogs.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/accounts/components/AccountActionDialogs.tsx)

```bash
grep -n "api\." "app/(portal)/accounts/components/AccountActionDialogs.tsx"
```

For each `api.contact.send()` call found:
```diff
-await api.contact.send({ ... });
+await sendContactMessage({ ... }); // from '@/app/actions/support'
```

For "Link External Account" dialog — render as disabled/coming-soon state:
```tsx
<div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 text-center">
  <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
  <p className="text-sm font-medium">Identity Verification Required</p>
  <p className="text-xs text-muted-foreground mt-1">
    To link an external account, please visit a branch or call our support line.
  </p>
</div>
```

---

### C6 — Corporate `/unavailable` Page

Already addressed in **Phase B5.2**. See above.

---

### C7 — Verify Transfer Receipt: Confirm `buildReceiptSummary` Exists

**Severity:** 🟡 Medium
**File:** [`app/(portal)/transfer/TransferClient.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/transfer/TransferClient.tsx)

Search for `buildReceiptSummary` in the file:
```bash
grep -n "buildReceiptSummary" app/(portal)/transfer/TransferClient.tsx
```

If not defined (the function is called at line 339 but not yet defined), add it before `handleSubmit`:

```ts
const buildReceiptSummary = (txResult: any, isWire: boolean): TransferReceiptSummary => ({
  id: txResult?.reference,
  createdAt: new Date().toISOString(),
  fromAccountMasked: selectedAccount
    ? `${selectedAccount.accountType} ••••${selectedAccount.accountNumber.slice(-4)}`
    : '••••',
  toLabel: isWire
    ? `${formData.recipientName} · ${formData.toAccountNumber}`
    : formData.toAccountNumber,
  amount: parseFloat(formData.amount),
  currency: selectedAccount?.currency || 'USD',
  methodLabel: transferTypeOptions.find(t => t.id === selectedTypeId)?.label || 'Transfer',
  scheduleLabel: formData.schedule.type === 'now'
    ? 'Sent immediately'
    : `Scheduled: ${formData.schedule.startDate}`,
  reference: txResult?.reference || '—',
});
```

Verify the receipt modal renders correctly and the PDF/share trigger works.

---

## Phase D — Code Quality & Technical Debt

---

### D1 — Fix `RightSidebar` Background Colour (Green → White)

**Severity:** 🟡 Design inconsistency
**File:** [`components/layout/RightSidebar.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/layout/RightSidebar.tsx) line 63

```diff
-"fixed right-0 top-[70px] bottom-0 w-[300px] border-l border-[#1E4B35]/10 bg-[#F1F8F5]/95 ..."
+"fixed right-0 top-[70px] bottom-0 w-[300px] border-l border-[color:var(--heritage-navy)]/10 bg-white/95 ..."
```

`#F1F8F5` and `border-[#1E4B35]/10` are remnants of the old green design. The current navy-gold design system uses white surfaces with navy borders.

---

### D2 — Fix Savings Goal: Show `currentAmount`, Not `targetAmount`

**Severity:** 🟡 UX misleading
**File:** [`app/(portal)/dashboard/page.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/app/%28portal%29/dashboard/page.tsx)

Find the savings goal card display. The `savingsGoal` variable is set to `goal?.targetAmount || 25000` — this shows the goal ceiling, not how much is saved.

```diff
-const savingsGoal = goal?.targetAmount || 25000;
+const savingsGoal = goal?.currentAmount || 0;
+const savingsTarget = goal?.targetAmount || 25000;
```

Add a progress bar below the amount:
```tsx
<Progress
  value={savingsTarget > 0 ? (savingsGoal / savingsTarget) * 100 : 0}
  className="h-1.5 mt-2"
/>
<p className="text-[10px] text-white/60 mt-1">
  of {formatCurrency(savingsTarget, currency, locale)} goal
</p>
```

---

### D3 — Extract Shared `DashboardStatCard` Component

**Severity:** ⚠️ Refactor — reduces duplication between dashboard and overview
**[NEW FILE]:** [`components/dashboard/DashboardStatCard.tsx`](file:///Volumes/Project%20Disk/PROJECTS/JPHeritage/unified-bank/components/dashboard/DashboardStatCard.tsx)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  className?: string;
  animate?: string; // e.g. "animate-fade-in-up animate-delay-100"
}

export function DashboardStatCard({
  title, value, icon: Icon, change, changeType = 'neutral', subtitle, className, animate,
}: DashboardStatCardProps) {
  const changeColor = changeType === 'positive'
    ? 'text-green-300'
    : changeType === 'negative'
    ? 'text-red-300'
    : 'text-white/60';
  return (
    <Card className={cn('shadow-sm hover:shadow-md transition-shadow duration-300 bg-[color:var(--heritage-navy)]/90 border-[color:var(--heritage-navy-mid)] text-white', animate, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[color:var(--heritage-gold)]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-playfair">{value}</div>
        {change && <p className={cn('text-xs mt-1', changeColor)}>{change}</p>}
        {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
```

Replace the duplicated stat card JSX in `dashboard/page.tsx` and `overview/page.tsx` with `<DashboardStatCard>` instances.

---

## Phase E — Database Seed & Full Verification

> [!IMPORTANT]
> Run Phase E only after all Phase A–D changes are complete and `npm run dev` starts without errors.

---

### E1 — Database Reset & Seed

```bash
cd /Volumes/Project\ Disk/PROJECTS/JPHeritage/unified-bank

npx prisma migrate reset --force  # Wipe and recreate DB
npx prisma db push                # Apply schema
npx prisma db seed                # Populate with demo data
```

---

### E2 — Build Validation Checklist

```bash
# TypeScript — must return 0 errors
npx tsc --noEmit

# No api-client imports in portal
grep -r "api-client" "app/(portal)" --include="*.tsx" --include="*.ts"
# Expected: 0 results

# No stray new PrismaClient() outside lib/
grep -r "new PrismaClient()" app/ lib/ --include="*.ts"
# Expected: only lib/prisma.ts

# Production build
npm run build
```

---

### E3 — Page-by-Page Smoke Test

| Route | Verify |
|-------|--------|
| `/` | Testimonials renders, EBankingWidget shows in hero |
| `/personal-banking` | EBankingWidget in hero → redirects to `/login` |
| `/login` | PortalStatusIndicator shows "Online", account number validation rejects alphanumeric, forgot-password goes to `/contact` |
| `/dashboard` | Real name in right sidebar, real balance, `gap-4` spacing, no "John Doe" |
| `/overview` | Analytics charts show real seeded data |
| `/accounts` | Accounts from Prisma, AccountDetailsDialog statements tab loads |
| `/transactions` | Full list, search/filter works, category edit → saves |
| `/cards` | Cards from Prisma, freeze button transitions to FROZEN |
| `/bills` | Providers load from server action, pay bill submits to Prisma |
| `/beneficiaries` | List from Prisma, Transfer CTA → pre-fills `/transfer` form |
| `/transfer` | OTP panel renders after review step, receipt modal shows after submit |
| `/settings` | Profile name/email pre-filled, language/currency dropdowns save |
| `/statements` | Statement list from Prisma |
| `/support` | Contact form submits via `sendContactMessage()` action |
| `/admin` | Pending transactions, approve/reject, auto-refresh countdown |
| Right Sidebar | Logged-in user's real name + initials, real account switcher |
| Notification Bell | Popover opens, notifications listed, mark-as-read works |
| `/unavailable` | Corporate version renders correctly |

---

## Summary: All Changed Files

| Phase | File | Type |
|-------|------|------|
| A1 | `app/(portal)/beneficiaries/BeneficiariesClient.tsx` | Modify |
| A1 | `app/(portal)/bills/BillsClient.tsx` | Modify |
| A1 | `app/(portal)/accounts/components/AccountDetailsDialog.tsx` | Modify |
| A2 | `components/layout/RightSidebar.tsx` | Modify |
| A2 | `app/EBankingLayout.tsx` | Modify |
| A3 | `package.json` | Modify |
| A3 | `prisma/seed.ts` | Rewrite |
| A4 | `app/(portal)/login/page.tsx` | Modify |
| A4 | `app/api/health/route.ts` | **NEW** |
| B1 | `components/NotificationCenter.tsx` | Rewrite |
| B2 | `components/dashboard/RightSidebarWidgets.tsx` | Modify |
| B3 | `app/(portal)/dashboard/page.tsx` | Modify |
| B3 | `app/(portal)/overview/page.tsx` | Modify |
| B4 | `components/commercial/Hero.tsx` | Modify |
| B4 | `components/commercial/EBankingWidget.tsx` | Modify |
| B5 | `app/(corporate)/page.tsx` | Modify |
| B5 | `app/(corporate)/unavailable/page.tsx` | **NEW** |
| C1 | `app/(portal)/transfer/TransferClient.tsx` | Modify |
| C2 | `app/(portal)/beneficiaries/BeneficiariesClient.tsx` | Modify |
| C4 | Admin transactions client component | Modify |
| C5 | `app/(portal)/accounts/components/AccountActionDialogs.tsx` | Modify |
| C7 | `app/(portal)/transfer/TransferClient.tsx` | Verify/Modify |
| D1 | `components/layout/RightSidebar.tsx` | Modify |
| D2 | `app/(portal)/dashboard/page.tsx` | Modify |
| D3 | `components/dashboard/DashboardStatCard.tsx` | **NEW** |

**Total: 25 file changes — 3 new files, 22 modifications, 1 full rewrite**
