import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/calculator'];
const PUBLIC_PREFIXES = ['/api/rates', '/api/defi', '/api/newsletter', '/_next', '/logos', '/favicon'];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const isPublicRoute = PUBLIC_ROUTES.includes(path) || PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix));
  
  if (!isPublicRoute) {
    // Week 1 MVP: Redirect to home. Auth will be added in Week 3
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
