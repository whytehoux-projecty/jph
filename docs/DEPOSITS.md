# Deposits and withdrawals: bank configuration

The portal's Deposit and withdraw page (`app/(portal)/deposit`) never invents bank details, branches or wallets. Each method only appears once the bank has supplied what it needs, through these environment variables. Each value is JSON on a single line.

| Variable | Enables | Shape |
|---|---|---|
| `BANK_DEPOSIT_DETAILS` | Deposit by bank transfer | `{"bankName":"…","bankAddress":"…","achRouting":"…","wireRouting":"…","swiftBic":"…"}`. The routing numbers must pass the ABA checksum; `swiftBic` is optional. |
| `DEPOSIT_LOCATIONS` | Cash deposits; branch cash orders (withdrawal) | `[{"id":"…","name":"…","type":"BRANCH","address":"…","cityStateZip":"…","hours":"…"}]`. Use `type: "ATM"` for deposit-only ATMs: they're offered for cash deposits but not for cash orders. |
| `CRYPTO_DEPOSIT_CONFIGS` | USDC / USDT deposits | `[{"token":"USDC","network":"ERC20","networkLabel":"Ethereum (ERC-20)","address":"0x…","confirmationsRequired":12,"minimumDeposit":10}]`. Add `memoOrTag` for networks that need one. Addresses must be wallets the bank controls. |

An invalid value is logged and treated as missing. Admin › E-bank › Deposits shows what customers currently see, and says which variable to set.

## How requests are processed

- **Deposits** are recorded as pending credits. Staff approve them in Admin › E-bank › Deposits, which credits the account once (approving twice can't credit twice) and notifies the customer.
- **Cheque photos** are stored in the `deposit_images` table, not on disk or in `public/`. Only the customer who uploaded them and administrators can open them, through `/api/deposits/images/[id]`. Photos that aren't attached to a deposit within 24 hours are deleted the next time that customer uploads.
- **Bill attachments** (a PDF or photo a customer adds to a bill payment) use the same private table, with `side = BILL`. They're uploaded through `/api/bills/attachments` and served by `/api/bills/attachments/[id]` (PDFs download rather than open in the browser). The shared logic is in `lib/private-files.ts`.
- **Withdrawals** (to another bank, cash from a branch, cashier's cheque) need the customer's transaction PIN. They wait in the Withdrawal Requests tab. Approving one debits the account, and is refused if the balance no longer covers it. Staff then carry out the transfer, cash order or cheque through normal operations.

## Database

The `DepositImage` model (`deposit_images` table) was added to `prisma/schema.prisma` and created in the database on 2026-10-25.

Don't apply schema changes with a plain `npx prisma db push` without looking first. The live database still differs slightly from the schema: `accounts.is_external` allows nulls, and `cards.card_tier` has no default. Preview any change with `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`, and apply only the statements you intend with `npx prisma db execute`.
