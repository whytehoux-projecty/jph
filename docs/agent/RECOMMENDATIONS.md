# Agent Recommendations for Phase 6+

## 1. Implement Phase 6 Placeholder Routes
Currently, the routes specified in Phase 6 (`/security`, `/help`, `/products/[slug]`, `/locations`, `/rates-and-fees`, `/accessibility`, `/careers`, `/press`, `/investors`) have not been created. 
**Recommendation:** Implement a single `[slug]` catch-all route under a new `(content)` group, powered by MDX, so that legal and static informational pages do not need to be hardcoded React components.

## 2. Global Styling Refinements
The transition to the Ledger design tokens (using Tailwind v4) is complete for `app/(corporate)`, but the legacy tokens (`vintage-gold`, `heritage-navy`, `charcoal`, `off-white`, `faded-gray`) are still present in `tailwind.config.ts`.
**Recommendation:** Proceed to migrate `app/(portal)` and `app/(admin)` to the Ledger tokens. Once all usages of legacy tokens are removed, delete `tailwind.config.ts` altogether to fully embrace Tailwind v4's CSS-only configuration model.

## 3. Abstracting Ledger Form Components
In Phase 5, the new multi-step flows (`/apply`, `/enroll`, and `/status`) use raw HTML inputs styled with Tailwind classes to match the Ledger design system.
**Recommendation:** Create generic reusable UI components for forms (e.g., `<LedgerInput>`, `<LedgerSelect>`, `<LedgerCheckbox>`) inside `components/commercial-ui` to standardize form styling across the application.

## 4. API Endpoints for /status and /apply
Currently, the `/status` page uses a hardcoded mock to demonstrate the 4 result states (`approved`, `rejected`, `not_found`, `pending`).
**Recommendation:** Build a `/api/status` route handler that accepts the reference ID and email, querying the `AccountApplication` table to return the actual status dynamically. Similarly, update the `/apply` server action to accept all the new multi-step payload data (such as Account Type).

## 5. Security Upgrades
**Recommendation:** Since this is a banking application, sensitive data such as SSN digits and emails are being passed via Next.js server actions. Ensure that all data is encrypted at rest in Supabase and that appropriate validation and rate-limiting (e.g., via Upstash Redis) are put in place to prevent brute-force attacks on the `/status` lookup endpoint.
