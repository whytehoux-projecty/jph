import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  // No fallback: without a configured secret Auth.js refuses to start rather
  // than signing sessions with a value published in source.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes for banking security (avoids clock skew issues)
    updateAge: 5 * 60, // Slide expiration every 5 minutes
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true; // Let middleware.ts handle the routing and authorization logic completely
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      if (token?.isFirstLogin !== undefined) {
        (session.user as any).isFirstLogin = token.isFirstLogin;
      }
      // Staff view: an administrator is viewing a customer's online banking.
      // The portal sees the customer (so every existing data action scopes to
      // them); the admin is kept as `staffView.staff`. Admin-only actions see
      // role USER and refuse, and middleware keeps /admin closed until the
      // staff view ends. Set only by auth.ts (jwt, trigger "update").
      const staffView = (token as any)?.staffView;
      if (staffView?.userId && token?.role === 'ADMIN') {
        session.user.id = staffView.userId;
        session.user.email = staffView.email;
        session.user.name = staffView.name;
        (session.user as any).role = 'USER';
        delete (session.user as any).isFirstLogin;
        (session as any).staffView = {
          customerName: staffView.name,
          staffId: token.sub,
          staffName: (token as any).name ?? null,
          startedAt: staffView.startedAt,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        if ('isFirstLogin' in user) {
          token.isFirstLogin = (user as any).isFirstLogin;
        }
      }
      return token;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
