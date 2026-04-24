import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // First update the session
  const { supabaseResponse, user } = await updateSession(req);

  const isAuthPage = pathname === '/admin/login';
  const isAdminRoot = pathname.startsWith('/admin');

  // Redirect if visiting admin pages without a session
  if (isAdminRoot && !isAuthPage && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    
    // Create the redirect response
    const redirectResponse = NextResponse.redirect(url);
    
    // IMPORTANT: Transfer any cookies refreshed by updateSession to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
      });
    });
    
    return redirectResponse;
  }

  // If visiting login page while already logged in, go to dashboard
  if (isAuthPage && user) {
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
