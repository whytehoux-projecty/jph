import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that are always public — no auth check
const PUBLIC_PATHS = [
    '/login',
    '/admin/login',
    '/unavailable',
    // Corporate marketing pages (existing)
    '/',
    '/personal-banking',
    '/business-banking',
    '/wealth',
    '/about',
    '/contact',
    '/apply',
    '/signup',
    '/enroll',      // enrollment request (replaces /signup)
    '/register',    // KYC registration form via token
    '/verification',// Verification scheduling
    '/privacy',
    '/terms',
    // New marketing routes (Phase 6)
    '/security',
    '/help',
    '/status',
    '/locations',
    '/rates-and-fees',
    '/accessibility',
    '/careers',
    '/press',
    '/investors',
    // Product pages — the existing startsWith logic covers /products/* slugs
    '/products',
];

// Prefixes that are always public
const PUBLIC_PREFIXES = [
    '/_next',
    '/static',
    '/images',
    '/api',
    '/favicon',
    '/favicons',
    '/icons',
    '/fonts',
    '/sw.js',
    '/workbox',
    '/manifest',
];

function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return true;
    return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export default auth(function middleware(req: NextRequest & { auth: any }) {
    const { pathname } = req.nextUrl;

    const session = req.auth;
    const isLoggedIn = !!session?.user;
    const role = (session?.user as any)?.role;

    if (pathname.startsWith('/admin')) {
      console.log(`[Middleware] ${req.method} ${pathname} | isLoggedIn: ${isLoggedIn} | role: ${role}`);
    }

    // Handle authenticated users trying to access login pages
    if (isLoggedIn) {
        if (pathname === '/login' && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        if (pathname === '/admin/login' && role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', req.url));
        }
    }

    // Always allow public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Admin routes — require ADMIN role
    if (pathname.startsWith('/admin')) {
        if (!isLoggedIn || role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
        return NextResponse.next();
    }

    // Portal routes (dashboard, accounts, etc.) — require login
    if (!isLoggedIn) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (role === 'ADMIN') {
        // Admins should not access portal routes directly, send to admin dashboard
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Force onboarding if isFirstLogin is true
    if ((session.user as any).role === 'USER' && (session.user as any).isFirstLogin && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Prevent access to onboarding if isFirstLogin is false
    if ((session.user as any).role === 'USER' && !(session.user as any).isFirstLogin && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}) as any;

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.ico).*)',
    ],
};
