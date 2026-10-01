# CHANGELOG

## Phase 4: Remaining Marketing Pages
- **Business Banking (`/business-banking`)**: Completely rewritten using Ledger design system. Removed legacy Tailwind tokens, fixed image placeholders, and incorporated new components (`Figure`, `DisclosureBlock`). Updated copy to reference `Heritage Trust Bank` and `facts.ts`.
- **Wealth Management (`/wealth`)**: Restyled with Ledger components. Removed references to "Golden Years", "Founders Circle", and "White Glove". Integrated `DisclosureBlock` for investment disclaimers.
- **About (`/about`)**: Replaced `Hero` component with a new Ledger-compliant header. Updated timeline and removed "first major bank" and "CDFI" claims. Used `yearsOfService()` helper for dynamic age calculation.
- **Contact (`/contact`)**: Rewritten to feature routing options (New Customer vs. Existing Customer). Fixed TypeScript errors on form submission (mapped `topic` to `subject` for API call).
- **Privacy Policy (`/privacy`)**: Updated branding to "Heritage Trust Bank" and replaced "Data Protection Officer" with "Privacy Office". Formatted with Ledger typography.
- **Terms (`/terms`)**: Cleaned up all branding to reference "Heritage Trust Bank" and removed legacy styling.

## Phase 5: Implementation Flows
- **Apply Flow (`/apply`)**: Rewrote the application form into a 3-step, split-screen flow (Personal/Business select, Contact Details, Review). Integrated success state using `CheckCircle` and `referenceId`. Replaced legacy inputs with Ledger-compliant raw inputs and `Button` components.
- **Enroll Flow (`/signup` mapped to `/enroll`)**: Transformed into a clean, center-aligned, multi-step card form. Removed SSN and DOB requirements per the brief. Used `CheckCircle` for the success state and removed all legacy styling.
- **Status Flow (`/status`)**: Created a new route `/status` allowing users to look up their application using an email address and `Reference ID`. Features dynamic result mockups (`pending`, `approved`, `rejected`, `not_found`) to demonstrate Ledger form patterns.
- **Verification (`/verification/[id]`)**: Replaced legacy `Card` and `Input` components with Ledger styling. Used dynamic BRAND configurations.

## Phase 7: Cleanup
- Automated removal of remaining `JP Heritage` and `jpheritage` strings from `app/`, `components/`, and `prisma/`. Replaced them with `Heritage Trust` and `heritagetrust` appropriately.
- Verified absence of forbidden strings via Regex `grep` (`136`, `135 years`, `Goldman`, `J.D. Power`, `Fortune 100`, `SVB`, `CDFI`, `Legacy Builder`, etc.).
- Fixed a Server Component hydration/event handler issue in `app/(corporate)/page.tsx` by replacing `onMouseOver` with Tailwind CSS arbitrary variants (`hover:[background:var(--action-hover)]`).
- Cleaned up dead legacy commercial components (`Hero.tsx`, `BankMergerShowcase.tsx`, `ProductGrid.tsx`, `Statistics.tsx`, `Testimonials.tsx`).
