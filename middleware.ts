import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that are always public — no auth check
const PUBLIC_PATHS = [
    '/login',
    '/admin/login',
    '/unavailable',
    // Corporate marketing pages
    '/',
    '/personal-banking',
    '/business-banking',
    '/wealth',
    '/about',
    '/contact',
    '/apply',
    '/signup',
    '/privacy',
    '/terms',
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

    // Always allow public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const session = req.auth;
    const isLoggedIn = !!session?.user;

    // Admin routes — require ADMIN role
    if (pathname.startsWith('/admin')) {
        if (!isLoggedIn || (session.user as any).role !== 'ADMIN') {
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
