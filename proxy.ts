import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getDefaultRoute(role: string, level?: string): string {
    switch (role) {
        case 'superadmin':
            return '/v2/superadmin';
        case 'admin':
            return '/v2/admin';
        case 'big':
            return '/v2/big';
        case 'verificator':
            if (!level || level === 'NATIONAL') return '/v2/verifikator-pusat';
            if (level === 'PROVINCE') return '/v2/verifikator-provinsi';
            return '/v2/verifikator-kota';
        case 'surveyor':
        case 'contributor':
            return '/v2/surveyor';
        default:
            return '/v2';
    }
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value;
    const level = request.cookies.get('level')?.value;

    // 1. If trying to access login page (/v2)
    if (pathname === '/v2') {
        return NextResponse.next();
    }

    // 2. For all other /v2 subroutes, user must be logged in
    if (!token || !role) {
        return NextResponse.redirect(new URL('/v2', request.url));
    }

    // 3. Page specific role guarding
    if (pathname.startsWith('/v2/superadmin') && role !== 'superadmin') {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    if (pathname.startsWith('/v2/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    if (pathname.startsWith('/v2/big') && role !== 'big') {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    if (pathname.startsWith('/v2/verifikator-pusat') && (role !== 'verificator' || (level && level !== 'NATIONAL'))) {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    if (pathname.startsWith('/v2/verifikator-provinsi') && (role !== 'verificator' || level !== 'PROVINCE')) {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    if (pathname.startsWith('/v2/verifikator-kota') && (role !== 'verificator' || level === 'PROVINCE' || level === 'NATIONAL')) {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    if (pathname.startsWith('/v2/surveyor') && role !== 'surveyor' && role !== 'contributor') {
        return NextResponse.redirect(new URL(getDefaultRoute(role, level), request.url));
    }
    return NextResponse.next();
}

export const config = {
    // Run proxy only for /v2 and its sub-pages
    matcher: ['/v2', '/v2/:path*'],
};

export default proxy;
export { proxy as middleware };