import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './lib/prisma';
import { verifyPassword } from './lib/password';
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim();
        const password = credentials.password as string;
        const isAdminLogin = credentials.is_admin === 'true';

        if (isAdminLogin) {
          const admin = await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
          if (!admin) return null;
          // Admin rows created before hashing are upgraded to bcrypt on first sign-in.
          const passwordsMatch = await verifyPassword(password, admin.password, {
            legacyPlaintext: true,
            onUpgrade: (hash) => prisma.adminUser.update({ where: { id: admin.id }, data: { password: hash } }),
          });
          if (passwordsMatch) {
            return { id: admin.id, email: admin.email, name: admin.firstName, role: 'ADMIN' };
          }
        } else {
          let user;
          if (email.includes('@')) {
            user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
          } else {
            const account = await prisma.account.findUnique({ where: { accountNumber: email } });
            if (account) {
              user = await prisma.user.findUnique({ where: { id: account.userId } });
            }
          }
          // Customer sign-in only ever authenticates customers; administrators
          // sign in at /admin/login.
          if (!user) return null;
          const passwordsMatch = await verifyPassword(password, user.password);
          if (passwordsMatch) {
            if (!user.hasOnlineAccess || user.eportalStatus !== 'ACTIVE') {
              throw new CustomAuthError(user.eportalNotificationMessage || "Your Account Access has been suspended, kindly contact CCU.");
            }
            return { id: user.id, email: user.email, name: user.firstName, role: 'USER', isFirstLogin: user.isFirstLogin };
          }
        }

        return null;
      },
    }),
  ],
});
