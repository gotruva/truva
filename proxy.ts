import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const PUBLIC_ROUTES = ['/', '/calculator', '/terms'];
const PUBLIC_PREFIXES = ['/api/rates', '/api/defi', '/api/newsletter', '/api/feedback', '/api/partner', '/go/', '/_next', '/logos', '/favicon', '/credit-cards'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const reviewUiEnabled = process.env.TRUVA_ENABLE_STAGING_REVIEW_UI === 'true' || process.env.NODE_ENV === 'development';
  const isReviewRoute = path === '/admin/rates/review' || path.startsWith('/admin/rates/review/');
  const isPublicRoute =
    PUBLIC_ROUTES.includes(path) ||
    PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix)) ||
    (reviewUiEnabled && isReviewRoute);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(req);

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
