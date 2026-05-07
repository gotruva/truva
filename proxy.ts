import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { isAdminUser } from '@/lib/admin-auth';

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // First update the session
  const { supabaseResponse, user } = await updateSession(req);

  const isAuthPage = pathname === '/admin/login';
  const isAdminRoot = pathname.startsWith('/admin');

  // Redirect unauthenticated users away from admin
  if (isAdminRoot && !isAuthPage && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';

    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
      });
    });

    return redirectResponse;
  }

  // Redirect authenticated non-admin users away from admin
  if (isAdminRoot && !isAuthPage && user && !isAdminUser(user.id)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If visiting login page while already logged in as admin, go to dashboard
  if (isAuthPage && user && isAdminUser(user.id)) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Handle traditional public/private logic if needed, 
  // but for now, we just pass through everything else (letting pages handle their own logic)
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
