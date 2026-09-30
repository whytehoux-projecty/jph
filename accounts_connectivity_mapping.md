# Connectivity Report: E-Banking Accounts Page & Admin Portal

This document outlines the end-to-end data, actions, and event connectivity between the newly improved Customer Accounts Page (`/accounts`), the Database schema (`schema.prisma`), and the Admin Interface Portal (`/admin/customers`). 

By bridging these three layers, the admin portal can directly orchestrate the exact components and states experienced by the end user on the accounts page.

## 1. Global Notification & Promo Banner
*How the admin pushes targeted alerts (like upsells or compliance warnings) to the user's dashboard.*

- **Admin Interface:** The admin manages a customer's `eportalNotificationMessage` via the "User Management" section. Changes are fired through the `updateEportalStatus` action in `app/actions/admin-customers.ts`.
- **Database Model:** `User` -> `eportalNotificationMessage` (String).
- **Customer Portal:** `app/(portal)/accounts/page.tsx` fetches the authenticated user's profile. If `eportalNotificationMessage` is present, it passes it down to `AccountsClient` as `promoMessage`. 
- **Component Layer:** `AccountsClient.tsx` conditionally renders the new `<PromoBanner>` component *only* if the message exists, allowing the admin to dynamically control the banner without hardcoding it.

## 2. Account Status & Balance Integrity
*How the admin enforces account freezes, tier upgrades, or balance modifications, and how the UI respects it.*

- **Admin Interface:** Admins can freeze accounts or correct balance anomalies using the `updateAccount` / `deleteAccount` actions (in `admin-customers.ts`) or `handleToggleAccountStatus` / `handleUpdateAccountBalance` (in `adminAccounts.ts`).
- **Database Model:** `Account` -> `status` (ACTIVE, SUSPENDED, BLOCKED) and `balance` (Float).
- **Customer Portal:** 
  - The `accounts/page.tsx` leverages Server Components to fetch real-time DB data.
  - The mapped `initialAccounts` prop passes the `balance` and `status` to `AccountsClient.tsx`.
- **Component Layer:** The `<Money>` and `AccountCard` components render the truth strictly based on DB state. Additionally, if the admin suspends all accounts, the `AccountsClient` `hasAccounts = false` logic forcefully gracefully degrades the page to the empty state (hiding analytics and filters automatically).

## 3. "Pending Actions" Analytics Drilldown
*How the "Pending Actions" module intelligently queries and reacts to admin-triggered events.*

- **Admin Interface:** Admins process or spawn actions requiring user attention: sending notifications (`notifications.ts`), changing transaction states (`admin-transactions.ts`), or replying to support tickets.
- **Database Model:** Connects across three tables:
  - `Notification` (where `isRead: false`)
  - `Transaction` (where `status: 'PENDING'`)
  - `SupportTicket` (where `status: 'OPEN'`)
- **Customer Portal:** Previously hardcoded to `3`, `accounts/page.tsx` now dynamically aggregates these counts directly from `prisma` at load time, passing the sum down as `pendingActionsCount`.
- **Component Layer:** `AccountAnalytics.tsx` receives this number. If `> 0`, it triggers the new amber semantic `AlertBar` module, informing the user that action is required. If `0`, the module vanishes cleanly.

---

### Sync & Revalidation Pipeline
Every admin mutation function triggers `revalidatePath('/admin/customers/account-holders')` AND the underlying data structure guarantees that the next time the customer navigates to `/accounts`, Next.js SSR executes `getAccounts()` and the layout reflects the exact changes orchestrated by the Admin.
