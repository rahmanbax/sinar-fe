import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const blockedPaths = ['/v2', '/beta-page'];

    if (blockedPaths.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/v2', request.url));
        // atau:
        // return NextResponse.rewrite(new URL('/maintenance', request.url));
    }

    return NextResponse.next();
}