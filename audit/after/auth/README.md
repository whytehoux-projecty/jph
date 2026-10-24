# Authentication screens: before and after

Captured on October 24, 2026 from a production build (`next build`, then `next start`) against the configured database, with headless Chrome at 390 px and 1440 px. Files named `before_*` are the original screens from `audit/before/`.

| State | Before | After |
|---|---|---|
| Sign in | `before_login-*.png` | `login-*.png` |
| Empty form submitted | `before_login_error-empty-*.png` | `login_error-empty-*.png` |
| Identifier in the wrong format | `before_login_error-format-*.png` | `login_error-format-*.png` |
| Details don't match (real server round trip with an address that has no profile) | — | `login_error-nomatch-*.png` |
| Signed out (after confirming sign-out) | did not exist | `signed-out-*.png` |
| Session expired (after the idle timeout) | did not exist | `session-expired-*.png` |

The signed-out and session-expired screens were captured by setting the tab's sign-out reason, exactly as the sign-out dialog and the idle timer do.

## Not captured

These screens and states couldn't be photographed, and none were faked:

- **Online access paused:** the screen shown when an administrator has paused a profile's online access. Capturing it needs a real profile in that state.
- **Idle warning dialog and sign-out confirmation:** these appear inside the signed-in portal, and no customer login has been provided.
- **Caps Lock warning:** headless Chrome cannot set the Caps Lock modifier.

## Not built (no backend)

- **MFA / one-time code:** `auth.ts` has a single password step. There's no code generation, delivery or verification.
- **Forgot password and reset password:** there's no reset-token model, endpoint or email template. The sign-in page links to Contact us, as before.
- **Account locked after failed attempts:** no failed-attempt counter or lockout exists. The only locked state is an administrator pausing online access, and that is designed.
