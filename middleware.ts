import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const PUBLIC_ROUTES = ['/', '/calculator'];
const PUBLIC_PREFIXES = ['/api/rates', '/api/defi', '/api/newsletter', '/api/feedback', '/api/partner', '/go/', '/_next', '/logos', '/favicon'];

export async function middleware(req: NextRequest) {
  const { supabaseResponse, user } = await updateSession(req);

  const path = req.nextUrl.pathname;
  
  const isPublicRoute = PUBLIC_ROUTES.includes(path) || PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix));
  
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
