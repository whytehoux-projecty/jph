# Sign-in security

## Customer sign-in (two steps)

1. `beginSignIn` (`app/(portal)/login/actions.ts`) finds the customer by email or account number and checks the password with a wrong-try limit. Only once the password is right does it check for paused online access or an expired temporary password. It then creates a short-lived **challenge**.
2. The browser sends that challenge to NextAuth (`signIn('credentials', { challenge, code })`). `authorize` in `auth.ts` accepts **only** a live, unused challenge. So neither the wrong-try limit nor the emailed code can be skipped by calling the NextAuth endpoint directly.

An unknown account and a wrong password get the same answer, and take about the same time.

### Emailed sign-in codes (two-factor)

| Setting | Effect |
|---|---|
| `SIGN_IN_EMAIL_CODES=required` | After the password, a 6-digit code is emailed and must be entered. It works for 10 minutes and allows 5 tries. |
| Not set | Password only. The challenge just bridges the two requests, and lasts 2 minutes. |

Codes are sent only if email works (`RESEND_API_KEY`). If `required` is set but email isn't configured, an error is logged and sign-in falls back to password only, so a broken mailer can't lock every customer out.

## Wrong passwords

`lib/sign-in-guard.ts`, for customers and staff (admin sign-in) alike:

- **Limit:** 5 wrong passwords in a row pause sign-in for 15 minutes, and the person is emailed (customers also get a notification).
- **No bursts:** each try is claimed in the database *before* the password is compared, so a burst of parallel guesses can't exceed the limit.
- **Reset:** only a correct password, or a password reset, clears the count.

## Forgotten password

`/forgot-password` (public):

1. **Request:** the customer enters their email, and an **8-digit code** is emailed. A code is used instead of a link, so nothing secret goes in a URL. The page gives the same answer whether or not the address has an account.
2. **Reset:** they enter the code with a new password, which must meet the password policy. Codes work for 15 minutes, allow 5 tries, and are limited to 3 per hour.
3. **Afterwards:** the password is changed, any sign-in pause is cleared, and the customer gets a notification and a "your password was changed" email.

Not available online:
- **No email:** if email isn't configured, the page tells customers to contact the bank.
- **First sign-in:** customers who haven't completed it yet use their temporary password, or staff issue a new one.

## Codes and challenges

`lib/one-time-codes.ts`, table `one_time_codes`:
- **Storage:** only HMAC-SHA256 hashes, keyed with `AUTH_SECRET`.
- **Use:** each code can be used once, and its tries are claimed before checking.

## Staff sign-in

Staff sign-in uses the same two steps:
- **Step one:** `beginAdminSignIn` (`app/(admin)/admin/login/actions.ts`) checks the password with the wrong-try limit.
- **Step two:** `authorize` accepts only a staff challenge. A customer's challenge can't sign in staff, and the reverse.

| Setting | Effect |
|---|---|
| `ADMIN_SIGN_IN_EMAIL_CODES=required` | A 6-digit code is emailed to the staff address after the password. As for customers, it's used only when email is configured. |

## Signing out other devices

Sessions are JWTs that last 15 minutes and renew while in use. Each customer and member of staff has a **session version** (`session_version`):
- **At sign-in:** the session carries the version.
- **While in use:** `auth.ts` re-checks it at most once a minute (`lib/session-version.ts`).
- **When it's raised:** older sessions end within a minute.

It's raised by:
- **Password reset:** every device is signed out.
- **Staff issuing a new temporary password:** the customer starts again.
- **Staff pausing online access:** the customer's open sessions end.
- **Admin › customer profile › "Sign out everywhere".**
- **Settings › "Sign out of other devices":** the customer's current session moves to the new version and stays signed in.
