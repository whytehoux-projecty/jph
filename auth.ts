import { checkPasswordWithLimit, minutesLeft } from '@/lib/sign-in-guard';
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

        if (isAdminLogin) {
          if (!credentials?.email || !credentials?.password) return null;
          const email = (credentials.email as string).trim();
          const admin = await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
          if (!admin) return null;
          // Same wrong-password limit as customers. Admin rows created before
          // hashing are upgraded to bcrypt on first sign-in.
          const check = await checkPasswordWithLimit(
            { kind: 'admin', id: admin.id, email: admin.email, stored: admin.password },
            credentials.password as string,
            (hash) => prisma.adminUser.update({ where: { id: admin.id }, data: { password: hash } }),
          );
          if (check.ok) return { id: admin.id, email: admin.email, name: admin.firstName, role: 'ADMIN' };
          if (check.lockedUntil) throw new CustomAuthError(`LOCKED:${minutesLeft(check.lockedUntil)}`);
          return null;
        }

        // Customers: the password (and wrong-try limit, access checks and any
        // emailed code) is handled by beginSignIn in app/(portal)/login/actions.ts.
        // This only accepts the challenge it issued, so neither the limit nor
        // the code can be skipped by calling this endpoint directly.
        const result = await consumeSignInChallenge((credentials?.challenge as string) || '', (credentials?.code as string) || undefined);
        if (!result.ok) {
          if (result.reason === 'wrong') throw new CustomAuthError(`CODE_WRONG:${result.triesLeft ?? 0}`);
          throw new CustomAuthError(result.reason === 'used-up' ? 'CODE_USED_UP' : 'CODE_EXPIRED');
        }
        const user = await prisma.user.findUnique({ where: { id: result.userId } });
        if (!user || !user.hasOnlineAccess || user.eportalStatus !== 'ACTIVE') return null;
        return { id: user.id, email: user.email, name: user.firstName, role: 'USER', isFirstLogin: user.isFirstLogin };
      },
    }),
  ],
});
