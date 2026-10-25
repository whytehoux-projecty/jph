# Savings goals and loans: how they work

## Savings goals

A goal holds money set aside from the customer's accounts (`savings_goals.current_amount`). Every movement is recorded as a transaction on the account involved:

| Action | Transaction | Needs |
|---|---|---|
| Add money (manual) | `SAVINGS_ALLOCATION`, debit | Transaction PIN; enough balance |
| Automatic saving (daily job) | `SAVINGS_ALLOCATION`, debit, channel `SCHEDULED` | PIN given once, when automatic saving is turned on |
| Move money back | `SAVINGS_RELEASE`, credit | Transaction PIN; the goal holds enough |

Each of these runs in one database transaction. A goal can only be deleted when it's empty, so money set aside can't disappear.

### Schedules

A goal can have a plan: an amount, a linked account, and **weekly** (a weekday) or **monthly** (day 1–28).

- **Save automatically (`AUTO`):** on the day, the amount moves from the linked account into the goal. It's capped at what's left to reach the target, and stops once the goal is reached. If the balance is short, nothing moves; the customer is told and it tries again next time.
- **Remind me (`MANUAL`):** on the day, the customer gets a portal notification and an email asking them to add the money.

The schedule logic is in `lib/savings-schedule.ts`, and the job is in `lib/savings-jobs.ts`.

### The daily job

`vercel.json` runs `GET /api/cron/savings` every day at 07:00 UTC.

- **`CRON_SECRET` must be set** in the Vercel project. Vercel sends it as `Authorization: Bearer …`. Without it the route refuses to run, so nothing happens rather than the route being open.
- **Emails** go through Resend (`lib/email.ts`), so `RESEND_API_KEY` must be set and the sender domain verified. Without it, customers still get the portal notification.
- **Links in emails** use `NEXT_PUBLIC_APP_URL`.
- **Repeat runs are safe.** Each goal's next date is moved forward before it's processed, so a repeated run never handles the same day twice.

## Loans

The portal offers only products the bank publishes: personal, auto, and mortgage/home equity. Their rates and terms come from `src/content/rates.ts`, the same table as the Rates and fees page (`lib/loan-products.ts`).

An application is a pending `LOAN_APPLICATION` transaction. It is not an approval or an offer. Staff approve it in Admin › E-bank › Loans, which pays the amount into the chosen account once (approving twice can't pay twice), or decline it with a reason.

The credit score card appears only when staff have recorded a score for the customer.
