import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret_do_not_use_in_prod_1234567890",
  session: {
    strategy: "jwt",
    maxAge: 60, // 60 seconds max absolute life (client must ping to keep alive)
    updateAge: 15, // Issue new cookie if 15 seconds have passed
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
