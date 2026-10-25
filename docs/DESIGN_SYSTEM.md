# Heritage Vault design system

The design system for the Heritage Trust online banking portal (Heritage Vault). It is derived from the commercial site's Isobath system (`app/(corporate)/isobath.css`), so the portal and heritagetrust.com read as one institution.

| Source | What it holds |
|---|---|
| `app/styles/tokens.css` | Every token: colour, type, radii, elevation, motion, breakpoints, z-index. The single source of truth. |
| `app/globals.css` | Imports the tokens. Points the shadcn role names (`primary`, `muted-foreground` and so on) at them. Holds the deprecated legacy palette. |
| `app/fonts.ts` | The three Source faces, loaded once through `next/font` and shared with the commercial site. |
| `components/ui/*` | Components built on the tokens. |
| `lib/format.ts` | Amount and account-number formatting. |

## Principles

1. **Understated, not decorative.** White ground, ink text, one action colour. Use rules and space, not shadows, gradients or glass.
2. **Petrol is the only action colour.** If something is petrol, it can be pressed. Logo orange appears only in the logo artwork.
3. **Figures are the product.** Every amount uses tabular, lining figures in the text face, and goes through `<Amount>`.
4. **Hidden by default.** Account numbers are masked unless the customer reveals them, and balances honour the customer's "hide balances" preference.
5. **Accessible by construction.** Components carry their own labels, focus rings, 44 px targets and live regions. Screens should not have to add them.

---

## Brand

### Logo

| File | Use |
|---|---|
| `public/images/logos/heritage-trust-logo.svg` | Horizontal lockup on light grounds (portal header) |
| `public/images/logos/heritage-trust-logo-reversed.svg` | Horizontal lockup on ink |
| `public/images/logos/heritage-trust-mark.svg` | The H mark alone: tight spaces, app icon |
| `public/images/logos/heritage-trust-logo-stacked*.svg` | Signature lockup for sign-in and onboarding panels |

- **Clear space:** at least the width of one stem of the H on every side.
- **Minimum size:** mark 16 px; horizontal lockup 140 px wide; stacked lockup 96 px wide.
- **Don't:** recolour the doorway, stretch, rotate, outline, or add a shadow or glow; place the logo on a busy photo; set the wordmark in another face.
- **Alt text:** "Heritage Trust" when the logo links home; `alt=""` when the name is already written next to it.

### Iconography

- **One library:** [lucide-react](https://lucide.dev). Don't use emoji, raster icons or a second icon set. Third-party payment brands (`BrandIcon`: Zelle, Venmo, Cash App, USDC, USDT) are logos, not icons, and are the only images used as icons.
- **Stroke:** 1.5 at 24 px and above; the lucide default of 2 at 16–20 px.
- **Sizes:** 16 px (`size-4`) inline with small text and in buttons; 20 px (`size-5`) in controls and toolbars; 24 px (`size-6`) in empty states and feature tiles.
- **Colour:** `currentColor`. Icons inherit the text colour; status icons take the status colour.
- **Accessibility:** decorative icons get `aria-hidden="true"`. An icon-only button needs an `aria-label` and a 44 px target (`size="icon"` on `Button`).

### Imagery

Architectural photography in natural light, the same tone as the commercial heroes (`public/images/hero/*`). Don't use stock "fintech" illustrations or people-pointing-at-screens shots. Use imagery only on sign-in, onboarding and empty marketing panels, never inside task flows.

---

## Tokens

All colour tokens are Tailwind v4 theme variables, so each one is available as a utility (`bg-surface`, `text-fg-muted`, `border-line` and so on) and as a CSS variable (`var(--color-surface)`).

### Colour: surfaces

| Token | Value | Use |
|---|---|---|
| `surface` | `#FFFFFF` | Page ground, cards, inputs |
| `surface-muted` | `#F4F6F5` (chalk) | Bands, table header rows, hover |
| `surface-sunken` | `#E9EDEC` | Skeletons, wells, pressed |
| `surface-selected` | `#E2EEEC` (shallows) | Selected row, active navigation |
| `surface-inverse` | `#14181C` | Ink sections, tooltips |
| `scrim` | ink at 56 % | Behind modals and drawers |

### Colour: text

| Token | Value | Contrast | Use |
|---|---|---|---|
| `fg` | `#14181C` | 17.8:1 on surface | Body text, headings, figures |
| `fg-muted` | `#56636A` | 6.2:1 on surface, 5.7:1 on muted | Secondary text, captions, labels |
| `fg-disabled` | `#8A9599` | — | Disabled controls only (exempt under WCAG) |
| `fg-action` | `#0E4A55` | 9.9:1 on surface | Links, tertiary buttons |
| `fg-on-action` | `#FFFFFF` | 9.9:1 on action | Text on primary and destructive buttons |
| `fg-inverse` / `fg-inverse-muted` | `#FFFFFF` / `#AEB8BC` | 17.8:1 / 8.8:1 on inverse | Text on ink |

### Colour: borders

| Token | Value | Use |
|---|---|---|
| `line` | `#D5DBDA` (shoal) | Decorative rules, card edges, table rows |
| `line-strong` | `#7E8C8F` | Input borders: 3.5:1, meets the 3:1 non-text minimum |
| `line-inverse` | `#333D43` | Rules on ink |

### Colour: action and focus

| Token | Value | Use |
|---|---|---|
| `action` | `#0E4A55` (petrol) | Primary buttons, checked controls, active tab |
| `action-hover` | `#0A3840` | Hover and pressed state of `action` |
| `action-subtle` | `#E2EEEC` | Tertiary hover, info tiles |
| `action-on-inverse` | `#7CC4B8` (sea-glass) | Actions on ink, 8.9:1 |
| `focus` | `#0E4A55` | The focus ring, everywhere |

### Colour: status

Each status has a strong colour (text, icons, borders) and a subtle one (backgrounds). The strong colour on its subtle background is at least 5.6:1.

| Status | Strong | Subtle | Use |
|---|---|---|---|
| `success` | `#1B6B45` | `#E7F2EC` | Completed, active, credited |
| `warning` | `#8A5300` | `#FFF4DB` | Pending, needs attention, expiring |
| `danger` | `#B3261E` | `#FCEDEB` | Failed, declined, frozen, destructive actions, field errors |
| `info` | `#1F5FA6` | `#E8F0FA` | Neutral notices, processing |

Money: `amount-credit` (`#1B6B45`) for incoming amounts and `amount-debit` (`#14181C`) for outgoing. The sign always carries the meaning; colour only reinforces it.

**Never** convey status by colour alone. Always pair it with text, a sign or an icon.

### Colour: brand primitives

`brand-ink`, `brand-petrol`, `brand-petrol-deep`, `brand-shallows`, `brand-sea-glass`, `brand-chalk`, `brand-shoal`, `brand-fog`, `brand-orange`. These are the raw palette. Use role tokens in components. `brand-orange` is for logo artwork only.

**Dark mode:** none. The commercial site has dark *sections* (`surface-inverse`) but no dark theme, and the portal follows it.

### Typography

| Family | Token | Use |
|---|---|---|
| Source Serif 4 | `font-display`, `font-serif` | Display, h1, h2: page titles and dialog titles |
| Source Sans 3 | `font-sans` (default), `font-mono` | Everything else: UI, body, h3–h6, every figure |
| Source Code Pro | `font-code` | Reference codes only (confirmation and IBAN-style references) |

Faces are self-hosted by `next/font` with `font-display: swap`. `font-mono` is deliberately the text face with tabular figures: numbers are never set in a monospace.

| Style | Utility | Size | Line height | Weight | Face |
|---|---|---|---|---|---|
| Display | `text-display` | 36 → 48 px fluid | 1.1 | 300 | Serif |
| Heading 1 | `text-h1` | 28 → 36 px fluid | 1.2 | 400 | Serif |
| Heading 2 | `text-h2` | 22 → 26 px fluid | 1.25 | 400 | Serif |
| Heading 3 | `text-h3` | 20 px | 1.4 | 600 | Sans |
| Heading 4 | `text-h4` | 17 px | 1.47 | 600 | Sans |
| Heading 5 | `text-h5` | 15 px | 1.47 | 600 | Sans |
| Heading 6 | `text-h6` | 13 px, caps, +6 % | 1.23 | 600 | Sans |
| Body large | `text-body-lg` | 18 px | 1.55 | 400 | Sans |
| Body | `text-body` | 16 px | 1.56 | 400 | Sans |
| Small | `text-small` | 14 px | 1.5 | 400 | Sans |
| Caption | `text-caption` | 13 px (legal floor) | 1.4 | 400 | Sans |
| Label | `text-label` + `uppercase` | 13 px, +6 % | 1.23 | 600 | Sans |
| Figure | `text-figure` | 32 → 44 px fluid | 1.1 | 300 | Sans, tabular |
| Data large | `text-data-lg` | 28 px | 1.15 | 400 | Sans, tabular |
| Data | `text-data` | 16 px | 1.4 | 400 | Sans, tabular |

Rules:

- **One h1 per page:** the page title, in the serif.
- **Labels:** four words or fewer, in caps.
- **Measure:** cap running text at `max-w-(--container-measure)` (68ch).
- **Minimum size:** nothing below 13 px.
- **Figures:** `table`, `.font-mono`, `.tabular` and `.tabular-nums` all get `tabular-nums lining-nums` from the base layer.

### Spacing

The base is 4 px: Tailwind's `--spacing` is `0.25rem`, so `p-1` is 4 px, `p-4` is 16 px and so on. Use the scale and no arbitrary pixel values.

| Step | px | Typical use |
|---|---|---|
| 1 | 4 | Icon and text gap in pills |
| 2 | 8 | Between related controls |
| 3 | 12 | Inside compact rows |
| 4 | 16 | Page gutter on mobile; card padding at 360 px |
| 5 | 20 | Card padding on mobile |
| 6 | 24 | Card padding from `sm`; gutter on tablet |
| 8 | 32 | Between sections on mobile; gutter on desktop |
| 12 | 48 | Between sections on desktop |
| 16 | 64 | Page top and bottom on desktop |

### Radii

| Token | Value | Use |
|---|---|---|
| `rounded-control` | 2 px | Buttons, inputs, selects, pills, tabs, checkboxes |
| `rounded-surface` | 4 px | Cards, dialogs, drawers, menus, toasts, alerts |
| `rounded-round` | 9999 px | Avatars, switch, radio, status dots. Never on cards or buttons. |

The Tailwind `rounded-lg`, `rounded-xl` and `rounded-2xl` sizes still exist for legacy screens and are not used in new work.

### Elevation

Flat by default: surfaces are separated by `line` rules and `surface-muted` bands.

| Token | Use |
|---|---|
| none | Cards, tables, page sections |
| `shadow-raised` | Switch thumb, sticky header once scrolled |
| `shadow-overlay` | Things that float above the page: menus, selects, popovers, dialogs, drawers, toasts |

### Motion

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 80 ms | Pressed states |
| `--duration-fast` | 150 ms | Hover, focus, colour changes |
| `--duration-base` | 220 ms | Dialogs, toasts, fades |
| `--duration-slow` | 320 ms | Drawers sliding in |
| `ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | State changes |
| `ease-enter` | `cubic-bezier(.2, .7, .1, 1)` | Things arriving |
| `ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | Things leaving |

- **Animations:** `animate-hv-fade-in`, `animate-hv-rise`, `animate-hv-slide-up`, `-down`, `-left`, `-right` and `animate-hv-pulse`.
- **Reduced motion:** always prefix animations with `motion-safe:`. A global `prefers-reduced-motion: reduce` rule in `tokens.css` also cuts every animation and transition to 0.01 ms.
- **What not to animate:** don't use scale-on-hover, lift-on-hover or parallax. Motion confirms a change; it never decorates.

Usage: `duration-(--duration-fast) ease-standard`.

### Breakpoints

Mobile-first. The base styles cover 360 px and up.

| Name | Min width | Layout |
|---|---|---|
| (base) | 0 | One column, bottom navigation, bottom-sheet dialogs |
| `sm` | 640 px | Centred dialogs, inline form actions |
| `md` | 768 px | Tables leave the stacked view; two columns |
| `lg` | 1024 px | Desktop navigation, side panels |
| `xl` | 1280 px | 1440 px layouts are designed here; content max width `--container-page` (1280 px) |
| `2xl` | 1536 px | Wide screens: content stays centred |

### Z-index

Use as `z-(--z-modal)`. Never use raw numbers like `z-50` or `z-9999` in new code.

| Token | Value | Layer |
|---|---|---|
| `--z-base` | 0 | Page |
| `--z-raised` | 10 | Sticky table headers, overlapping cards |
| `--z-sticky` | 30 | Sticky sub-navigation |
| `--z-header` | 40 | Portal header, bottom navigation |
| `--z-overlay` | 60 | Modal and drawer scrim |
| `--z-modal` | 70 | Dialogs, drawers |
| `--z-dropdown` | 75 | Menus, selects, popovers (above the dialog that opened them) |
| `--z-toast` | 80 | Toasts |
| `--z-skip-link` | 100 | Skip link |

### Other tokens

| Token | Value | Use |
|---|---|---|
| `--size-target` | 44 px | Minimum touch target |
| `--container-page` | 1280 px | Portal content width |
| `--container-form` | 576 px | Single-column forms |
| `--container-measure` | 68ch | Running text |

---

## Components

All components are in `components/ui`. Import from `@/components/ui/<file>`.

### Button

`Button.tsx`

| Variant | Use |
|---|---|
| `primary` | The one action the screen exists for. One per view. |
| `secondary` | Alternatives next to a primary (Cancel, Back, Download) |
| `tertiary` | Low-emphasis actions in toolbars, rows and cards |
| `destructive` | Irreversible actions: remove payee, cancel transfer, freeze card |
| `link` | Inline navigation styled as text |

| Size | Height | Use |
|---|---|---|
| `sm` | 36 px | Dense tables and toolbars on desktop only |
| `md` (default) | 44 px | Everything else |
| `lg` | 48 px | Primary actions at the end of a flow |
| `icon` | 44 × 44 px | Icon-only. Requires `aria-label`. |

- **Props:**
  - `loading`: shows a spinner, disables the button and sets `aria-busy`.
  - `loadingLabel`: announced to screen readers while loading.
  - `fullWidth`
  - `icon` / `iconPosition`
  - `asChild`: renders a `next/link` with button styling.
- **Disabled:** buttons render the disabled colours; there's no opacity fade.
- **Type:** there's no default `type`, so forms keep the native submit behaviour. Pass `type="button"` for non-submit buttons inside forms.
- **Aliases:** `outline` = `secondary`, `ghost` = `tertiary`, and `small` / `medium` / `large` = `sm` / `md` / `lg`. They're kept for existing call sites; use the new names in new code.

```tsx
<Button loading={isPending} loadingLabel="Sending transfer" size="lg" fullWidth>Send $250.00</Button>
<Button variant="secondary" asChild><Link href="/statements">View statements</Link></Button>
```

### Form field

`form-field.tsx`

`FormField` renders the label, an optional hint, the control and an error, and wires them together. Controls inside it pick up the field's `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` automatically.

```tsx
<FormField label="Payee name" hint="As shown on their bank account" error={errors.name?.message} required>
  <Input autoComplete="name" {...register("name")} />
</FormField>
```

- **The label is always visible.** Placeholders are examples, never labels. `hideLabel` exists only for controls whose purpose is already visible, such as a search box with a search button.
- **Optional fields:** mark them with `optional`. Required fields aren't starred.
- **Errors:**
  - Each error appears under its field with an icon, in `danger`, and is announced politely (`aria-live`).
  - Say what's wrong and how to fix it: "Enter an amount of $1.00 or more", not "Invalid".
  - On submit, move focus to the first invalid field.

### Inputs

`input.tsx`, `textarea.tsx`, `native-select.tsx`, `select.tsx`

- **Shape:** 48 px tall, 1 px `line-strong` border, `rounded-control`, 16 px text (which also stops iOS zooming in on focus).
- **Focus:** 2 px petrol outline.
- **Invalid:** `aria-invalid` turns the border `danger`.
- **Disabled:** `surface-muted` background with `fg-disabled` text.
- **Read-only:** `surface-muted` background with normal text.
- **Select:** prefer `NativeSelect` on mobile and in long forms. Use the Radix `Select` only where options need custom rendering, such as an account picker with balances.
- **Mobile keyboards:** set `inputMode` and `autoComplete` on every field: `inputMode="decimal"` for amounts, `autoComplete="one-time-code"` for codes.

### Checkbox and radio

`checkbox.tsx`

`Checkbox`, `Radio` and `ChoiceGroup` are native inputs drawn with tokens, so they get full keyboard and form support. The whole label row is the 44 px target. Group radios in a `ChoiceGroup` with a `legend`.

```tsx
<ChoiceGroup legend="Delivery speed" error={errors.speed?.message}>
  <Radio name="speed" value="standard" label="Standard" description="1–3 business days, no fee" />
  <Radio name="speed" value="same-day" label="Same day" description="Before 5 pm ET, $25 fee" />
</ChoiceGroup>
```

### Switch

`switch.tsx`

Only for settings that take effect immediately, such as card lock or notifications. Anything that needs a Save button uses a checkbox instead. The switch is drawn at 44 × 24 px with a 44 px hit area. Always pair it with a visible label (`<Label htmlFor>`).

### Password field

`password-input.tsx`

`PasswordInput` has a Show/Hide toggle: a real button with `aria-pressed` and `aria-controls`. It defaults to `autoComplete="current-password"`; pass `new-password` when the customer is creating one. Autocorrect, autocapitalise and spellcheck are off.

### OTP input

`otp-input.tsx`

`OtpInput` is for one-time codes and transaction PINs.

- **Input:** digits only. Pasting the full code into any box fills them all, and the first box carries `autoComplete="one-time-code"` for SMS autofill.
- **Keyboard:** arrow keys and Backspace move between boxes.
- **Callbacks:** `onComplete` fires when every box is filled.
- **PINs:** set `masked` to show dots.
- **Labelling:** inside a `FormField`, the group is labelled by the field label and each box is announced as "Digit n of 6".

### Card

`Card.tsx`

A flat white surface with a 1 px rule and `rounded-surface`. It has no shadow and no hover lift.

- **Variants:** `muted` gives a chalk band; `outline` is transparent with a rule.
- **Clickable cards:** set `interactive` on cards that are links. The link itself carries the focus ring.

### Table

`table.tsx`

```tsx
<Table stackOnMobile>
  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead numeric>Amount</TableHead></TableRow></TableHeader>
  <TableBody>
    <TableRow>
      <TableCell label="Date">12 Oct</TableCell>
      <TableCell>Payroll — Northwind Ltd</TableCell>
      <TableCell label="Amount" numeric><Amount value={tx.amount} tone="auto" /></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

- **Stacked view:** with `stackOnMobile`, rows become two-column blocks below 768 px. Each cell with a `label` shows it above the value. Cells without one, such as the description, span the full row. The header stays available to screen readers.
- **Headers:** headings are caps labels in `fg-muted` over a 1 px ink rule. `TableHead` defaults to `scope="col"`.
- **Numbers:** numeric columns take `numeric`, which right-aligns them on desktop and sets tabular figures.

### Badge and status pill

`badge.tsx`

- **Badge variants:** `neutral`, `info`, `success`, `warning`, `danger`, `outline`. The legacy `default`, `secondary` and `destructive` are kept for existing call sites.
- **StatusPill:** adds a status dot. Use it for transaction and account states. The text always names the state.

```tsx
<StatusPill status="warning">Pending</StatusPill>
```

### Alert

`alert.tsx`

An inline, persistent message inside the page: `info`, `success`, `warning` or `danger`, with an optional `title` and `actions`. `danger` uses `role="alert"`; the others use `role="status"`.

### Toast

`toast.tsx` with `lib/toast.ts`

Transient feedback after an action. Raise it with `toast.success({ title, description })`, `toast.error`, `toast.warn` or `toast.info`. `ToastViewport` is mounted once in `PortalLayout`.

- **Announcements:** errors are announced assertively, everything else politely.
- **Timing:** hovering or focusing a toast pauses its timer.
- **Position:** bottom-right on desktop; above the bottom navigation on mobile.
- **Content:** never put account numbers or full amounts in a toast.

### Modal and drawer

`dialog.tsx`, `sheet.tsx`

- **Dialog:** a centred dialog from 640 px; a bottom sheet below that, capped at 90 % of the viewport height with safe-area padding.
- **Sheet:** the drawer for filters and detail panels. It slides from any side and is `min(85vw, 24rem)` wide on the sides.
- **Scrim:** both use `scrim` with no blur.
- **Close button:** a 44 px close button with the accessible name "Close".
- **Titles:** set in the serif (`text-h2`). Every dialog needs a `DialogTitle`, even if it's visually hidden.
- **Focus:** Radix traps focus and returns it to the trigger on close.

### Tabs

`tabs.tsx`

Underline tabs: the active tab has a 2 px petrol rule over the 1 px list rule. The list scrolls horizontally on narrow screens, and tabs are 44 px tall. Arrow-key navigation comes from Radix.

### Skeleton

`skeleton.tsx`

`Skeleton` and `SkeletonText` mirror the shape of the content they stand in for and are hidden from assistive tech. Set `aria-busy="true"` on the region that is loading. The pulse respects reduced motion.

### Empty state

`empty-state.tsx`

Says what is missing, why, and what to do next, with one primary action. Pass `headingLevel` to fit the page outline. Never use it to stand in for a feature that doesn't exist.

```tsx
<EmptyState icon={Users} title="No saved payees yet" description="Add a payee once and pay them again in two taps." action={<Button>Add payee</Button>} />
```

### Pagination

`pagination.tsx`

Controlled (`page`, `pageCount`, `onPageChange`). On mobile it shows Previous and Next with "Page x of y". From `sm` up it adds page numbers with ellipses, and the current page carries `aria-current="page"`. Give the `nav` a specific `label`, such as "Transaction pages".

### Avatar

`avatar.tsx`

A round photo with an initials fallback on `surface-selected`. The photo's `alt` is the customer's name, or `""` when the name is printed alongside.

### Amount

`amount.tsx`

Every monetary value goes through `Amount`.

| Prop | Behaviour |
|---|---|
| `tone="plain"` (default) | Balances and totals: ink, normal sign |
| `tone="auto"` | Transactions: credits show `+` in `amount-credit`, debits show `−` in ink |
| `masked` | Shows `••••` with "Amount hidden" for screen readers |
| `size` | `sm`, `md` (`text-data`), `lg` (`text-data-lg`), `figure` (headline balance) |
| `currency`, `locale` | Passed to `Intl.NumberFormat` |

`AmountVisibilityToggle` is the eye button for the "hide balances" preference. It's controlled: the screen persists the choice through the existing profile setting (`hideBalance`), never through localStorage.

`Money` is the earlier plain formatter, kept for existing call sites.

### Account number

`account-number.tsx`

`AccountNumber` is masked by default (`•••• 6789`) and announced as "ending in 6 7 8 9".

- **Reveal:** with `revealable`, an eye button shows the full number grouped in fours. It re-masks after 30 seconds.
- **Data handling:** the component never writes the number to storage, the URL or the console.
- **Elsewhere:** use `maskAccountNumber()` from `lib/format.ts` wherever an account number appears in text, such as select options or confirmation copy.

---

## App shell and page header

`app/PortalLayout.tsx` with `components/layout/*`

- **Navigation source:** one definition, `lib/portal-nav.ts`, feeds the desktop sidebar, the mobile drawer and the mobile tab bar. Add routes there, never in a component.
- **Desktop (`lg` and up):** a fixed 256 px sidebar holds the logo and grouped navigation (Banking, Move money, Grow, then Support and Settings). The active item gets a petrol rule, a `surface-selected` fill and `aria-current="page"`. A sticky top bar holds Help, notifications and the user menu.
- **Mobile:** a top bar with a menu button and the logo. A bottom tab bar has Home, Accounts, Pay, Activity and Menu, all within thumb reach. Menu opens the full navigation in a drawer.
- **User menu:** customer name and email, then Profile and settings, Help and support, and Sign out (which asks for confirmation). In a staff view, Sign out is replaced by Return to admin.
- **Staff view:** when an administrator opens a customer's online banking from the admin portal, a dark banner inside the sticky header names the customer and offers Return to admin.
- **Content:** width is capped at `--container-page`. The footer carries only the commercial site's legal line and links.

### Page header

`components/layout/PageHeader.tsx`

Every signed-in page starts with a `PageHeader`:

- **Title:** the page's only h1, in the serif.
- **Description:** optional, one sentence.
- **Breadcrumb:** only for pages two or more levels deep.
- **Actions:** at most one primary action, placed last.

```tsx
<PageHeader
  title="Statements"
  description="Monthly statements for all your accounts."
  breadcrumb={[{ label: "Accounts", href: "/vaults" }, { label: "Statements" }]}
  actions={<Button>Download all</Button>}
/>
```

### Page states

Every data page gets `loading.tsx` and `error.tsx` next to its `page.tsx`:

- **Loading:** a skeleton that mirrors the page's layout.
- **Error:** an `EmptyState` with a Try again button (`reset()`) and a link to support.
- **Empty sections:** use `EmptyState` with a next step.

A page never shows a blank area, and it never fills one with placeholder figures.

## Accessibility checklist (WCAG 2.1 AA)

- **Contrast:** text is 4.5:1 or more (every text token above passes on its intended surface). Non-text UI such as input borders and focus rings is 3:1 or more.
- **Focus:** every interactive element shows the 2 px petrol `:focus-visible` ring. Never remove an outline without replacing it.
- **Targets:** 44 × 44 px minimum (`--size-target`).
- **Labels:** every input has a visible `<label>` through `FormField`. Icon-only buttons have an `aria-label`.
- **Errors:** they appear next to the field, are linked with `aria-describedby`, are announced politely, and move focus to the first error on submit.
- **Keyboard:** everything is reachable and operable by keyboard. Radix components handle menus, dialogs, tabs and selects.
- **Status:** status is never shown by colour alone.
- **Motion:** respects `prefers-reduced-motion`.
- **Zoom:** pinch-zoom is allowed (`viewport` has no `maximumScale`), and layouts reflow at 320 px wide (400 % zoom).

## Security in the UI

- **Masking:** account and card numbers are masked by default. Revealing one is a deliberate, timed action.
- **Storage and URLs:** never put balances, account numbers or personal data in localStorage, sessionStorage, URL parameters or `console` output. UI preferences that need to persist go through the profile API.
- **Feedback text:** toasts and errors never echo full account numbers.
- **Session timeout:** idle sign-out is owned by `AutoLogoutProvider`. Components must not extend a session on their own.

## Deprecated: migrate when a screen is restyled

These still render, so unmigrated screens don't break, but new code must not use them.

| Legacy | Replace with |
|---|---|
| `paper-50`, `paper-100`, `paper-200` | `surface`, `surface-muted`, `line` |
| `paper-300` (borders) | `line-strong` (inputs) or `line` (rules) |
| `ink-900`, `ink-700`, `ink-500` | `fg`, `fg`, `fg-muted` |
| `vermilion-*`, `pine-*` (actions) | `action`, `action-hover`, `action-subtle` |
| `stone-*` | `fg-muted`, `line` |
| `shadow-vintage-*`, `shadow-navy-glow`, `shadow-gold-glow` | none, or `shadow-overlay` for floating layers |
| `rounded-lg`, `rounded-xl`, `rounded-2xl` on cards and buttons | `rounded-surface`, `rounded-control` |
| raw Tailwind palette (`red-600`, `emerald-700`, `slate-*`, `gray-*` …) | status and role tokens |
| `VintageIcon` | lucide icon in a `surface-muted` tile, or a plain icon |

**Undefined classes:** several class names used by portal screens were never defined, so they currently render as nothing. Fix them screen by screen:

- `ink-400`, `ink-600`, `ink-800`
- `vintage-gold`, `vintage-green`, `vintage-navy`
- `charcoal`, `soft-gold`
