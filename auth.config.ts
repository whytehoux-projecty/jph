import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
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
