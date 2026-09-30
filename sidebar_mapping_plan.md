# Right Sidebar Audit & Mapping Plan

## Overview
This report fulfills Phase 1 of the objective. It reviews all components rendered in the e-banking portal's right sidebar (`RightSidebar.tsx`), documenting their data sources, scopes, and admin management connections. 

## Sidebar Item Mapping Table

| Sidebar Item | Current Data Source | Scope | Existing Admin Component | Action Needed / Target Admin Home |
|--------------|---------------------|-------|--------------------------|-----------------------------------|
| **Profile Photo & Info** | Real (`User` table via `profile` prop). Photo relies on a static fallback (`/images/icons/default-avatar.svg`). | Per-Customer | Basic customer table view (`/admin/customers`). No photo upload/approval component exists. | **Action:** Build Photo Manager in the Customer Management Panel (view, replace, approve/reject). Update sidebar to use the real approved image. Add visibility toggle. |
| **Recent Alerts** | Real (`Notification` table via `getNotifications()`) | Per-Customer | Global Notification Dispatch (`adminNotifications.ts`) | **Action:** Build per-customer visibility toggle in Customer Panel. |
| **Account Switcher** | Real (`Account` table via `getAccounts()`) | Per-Customer | Account Management Panel (`adminAccounts.ts`) | **Action:** Build per-customer visibility toggle in Customer Panel. |
| **Credit Score** | Real (`CreditScore` table via `getCreditScore()`) | Per-Customer | None | **Action:** Build a Credit Score Manager in the Customer Management Panel (edit score, range, notes). Add visibility toggle. |
| **Budget** | Real (`Budget` table via `getBudgets()`) | Per-Customer | None | **Action:** Build per-customer visibility toggle. (Budgets are natively managed by the customer). |
| **Cash Flow Projection**| Derived (Calculated from `Transaction` table stats) | Per-Customer | Transaction Management Panel | **Action:** Build per-customer visibility toggle. |
| **Upcoming Bills** | Real (`Bill` table via `getBillHistory()`) | Per-Customer | None | **Action:** Build per-customer visibility toggle. |
| **Financial Tip** | Hardcoded text string | Global | None | **Action:** Move data to a global setting in Admin `System Settings`. Add per-customer visibility override in Customer Panel. |
| **Quick Access (Menu)** | Hardcoded array of links (`extraServices`) | Global | None | **Action:** Migrate to a central Sidebar Registry. Add global management in `System Settings`, and per-customer visibility toggle in Customer Panel. |
| **Promo: "Upgrade to Metal"**| Hardcoded JSX | Global | None | **Action:** Connect to a global promotion config or remove/merge into the registry. Add per-customer visibility toggle. |

## Proposed Architecture for Phases 2-4

1. **Sidebar Registry:** Create a central definition file (e.g., `lib/sidebar-registry.ts`) that exports an array of sidebar items with `id`, `label`, `scope`, and `defaultVisibility`. `RightSidebar.tsx` will map over this registry to render active widgets.
2. **Data Layer (Visibility):** Add a `sidebarPreferences` (JSON String) column to the `User` model in `schema.prisma`. This will store a dictionary of `{ [widgetId: string]: boolean }` to handle per-customer overrides.
3. **Admin Customer Panel ("Sidebar Content"):** Introduce a new tab or section within the individual customer view (`/admin/customers/account-holders/[id]` or similar modal). This will house:
   - Profile Photo uploader / approver.
   - Credit Score Editor (score value, model, last updated).
   - Visibility Toggles mapping to the Sidebar Registry keys.

Please review this mapping. If you approve, I will proceed with Phase 2 (connecting system data and updating the schema) and then move to Phases 3 and 4.
