import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes - must be admin role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Protect admin API routes
    if (pathname.startsWith('/api/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const res = NextResponse.next();
    // Let root layout know the pathname so it can set html lang="ne" for /ne/* routes
    res.headers.set('x-pathname', pathname);
    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Admin routes require authentication
        if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
          return !!token;
        }

        // Download API requires authentication
        if (pathname.startsWith('/api/download')) {
          return !!token;
        }

        // All other routes are public
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/download/:path*', '/ne/:path*'],
};
