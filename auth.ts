import { currentSessionVersion, SESSION_CHECK_SECONDS } from '@/lib/session-version';
import { consumeSignInChallenge } from '@/lib/one-time-codes';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './lib/prisma';
import { CredentialsSignin } from 'next-auth';

class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { auth, signIn, signOut, unstable_update, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = await authConfig.callbacks.jwt(params);

      // Session version (lib/session-version.ts): set at sign-in, re-checked
      // at most once a minute. A raised version ends this session.
      const owner = token.sub && (token.role === 'ADMIN' || token.role === 'USER')
        ? ({ kind: token.role === 'ADMIN' ? 'admin' : 'customer', id: token.sub } as const)
        : null;
      if (params.user) {
        (token as any).sv = (params.user as any).sessionVersion ?? 0;
        (token as any).svAt = Date.now();
      } else if (owner && params.trigger === 'update' && params.session && 'refreshSessionVersion' in params.session) {
        // After "sign out other devices": keep this session, on the new version.
        (token as any).sv = (await currentSessionVersion(owner)) ?? -1;
        (token as any).svAt = Date.now();
      } else if (owner && Date.now() - ((token as any).svAt ?? 0) > SESSION_CHECK_SECONDS * 1000) {
        const current = await currentSessionVersion(owner);
        if (current === null || current !== ((token as any).sv ?? 0)) return null;
        (token as any).svAt = Date.now();
      }

      // Staff view start/end (app/actions/staff-view.ts → unstable_update).
      // Only a token that signed in as ADMIN can carry one; the customer is
      // looked up here so a forged payload can't name a non-existent user.
      if (params.trigger === 'update' && token.role === 'ADMIN' && params.session && 'staffView' in params.session) {
        const requested = (params.session as any).staffView;
        if (requested === null) {
          delete (token as any).staffView;
        } else if (typeof requested?.userId === 'string') {
          const customer = await prisma.user.findUnique({
            where: { id: requested.userId },
            select: { id: true, email: true, firstName: true, lastName: true },
          });
          if (customer) {
            (token as any).staffView = {
              userId: customer.id,
              email: customer.email,
              name: `${customer.firstName} ${customer.lastName}`.trim(),
              startedAt: new Date().toISOString(),
            };
          }
        }
      }
      // After onboarding (app/(portal)/onboarding/actions.ts): re-read the
      // first-login flag from the database. Nothing from the client is used.
      if (params.trigger === 'update' && token.role === 'USER' && !(token as any).staffView && params.session && 'refreshFirstLogin' in params.session && token.sub) {
        const user = await prisma.user.findUnique({ where: { id: token.sub }, select: { isFirstLogin: true } });
        if (user) token.isFirstLogin = user.isFirstLogin;
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        is_admin: { label: "Admin Login", type: "text" },
        // Customer sign-in, step two (see beginSignIn).
        challenge: { label: "Challenge", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const isAdminLogin = credentials?.is_admin === 'true';

        // Both paths accept only a challenge issued by the matching first step
        // (beginAdminSignIn / beginSignIn), which applied the wrong-password
        // limit and any emailed code. Neither can be skipped by calling this
        // endpoint directly, and a customer's challenge can't sign in staff.
        const result = await consumeSignInChallenge((credentials?.challenge as string) || '', (credentials?.code as string) || undefined);
        if (!result.ok) {
          if (result.reason === 'wrong') throw new CustomAuthError(`CODE_WRONG:${result.triesLeft ?? 0}`);
          throw new CustomAuthError(result.reason === 'used-up' ? 'CODE_USED_UP' : 'CODE_EXPIRED');
        }

        if (isAdminLogin) {
          if (result.owner.kind !== 'admin') return null;
          const admin = await prisma.adminUser.findUnique({ where: { id: result.owner.id } });
          if (!admin) return null;
          return { id: admin.id, email: admin.email, name: admin.firstName, role: 'ADMIN', sessionVersion: admin.sessionVersion } as any;
        }
        if (result.owner.kind !== 'customer') return null;

        // Customers: password, limit, access checks and any code were handled by
        // beginSignIn (app/(portal)/login/actions.ts).
        const user = await prisma.user.findUnique({ where: { id: result.owner.id } });
        if (!user || !user.hasOnlineAccess || user.eportalStatus !== 'ACTIVE') return null;
        return { id: user.id, email: user.email, name: user.firstName, role: 'USER', isFirstLogin: user.isFirstLogin, sessionVersion: user.sessionVersion } as any;
      },
    }),
  ],
});
