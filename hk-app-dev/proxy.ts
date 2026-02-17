import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page
  if (pathname === '/auth/login') {
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const payload = await verifyToken(token);
      if (!payload || !payload.sub) {
        // Invalid token, clear cookie and redirect
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('token');
        return response;
      }
      // Valid token, allow access
      return NextResponse.next();
    } catch (error) {
      // Token verification failed, clear and redirect
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
