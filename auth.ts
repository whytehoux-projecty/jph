import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        is_admin: { label: "Admin Login", type: "text" },
        impersonationToken: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (credentials?.impersonationToken) {
          const tokenRecord = await prisma.impersonationToken.findUnique({
            where: { token: credentials.impersonationToken as string }
          });
          
          if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            return null;
          }
          
          const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
          if (!user) return null;
          
          await prisma.impersonationToken.delete({ where: { id: tokenRecord.id } });
          return { id: user.id, email: user.email, name: user.firstName, role: 'USER' };
        }

        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const isAdminLogin = credentials.is_admin === 'true';

        if (isAdminLogin) {
          const admin = await prisma.adminUser.findUnique({ where: { email } });
          if (!admin) return null;
          // For demo: if password matches directly or bcrypt matches
          const passwordsMatch = await bcrypt.compare(password, admin.password).catch(() => false);
          if (passwordsMatch || password === admin.password) {
            return { id: admin.id, email: admin.email, name: admin.firstName, role: 'ADMIN' };
          }
        } else {
          let user;
          if (email.includes('@')) {
            user = await prisma.user.findUnique({ where: { email } });
          } else {
            const account = await prisma.account.findUnique({ where: { accountNumber: email } });
            if (account) {
              user = await prisma.user.findUnique({ where: { id: account.userId } });
            }
          }
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password).catch(() => false);
          if (passwordsMatch || password === user.password) {
            if (!user.hasOnlineAccess || user.eportalStatus !== 'ACTIVE') {
              throw new Error(user.eportalNotificationMessage || "Your Account Access has been suspended, kindly contact CCU.");
            }
            return { id: user.id, email: user.email, name: user.firstName, role: 'USER', isFirstLogin: user.isFirstLogin };
          }
        }

        return null;
      },
    }),
  ],
});
