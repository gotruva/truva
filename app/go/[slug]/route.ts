import { NextRequest, NextResponse } from 'next/server';
import { getLiveRates } from '@/lib/rates';
import { createClient } from '@supabase/supabase-js';
import { getClientIp } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

// Simple in-memory dedup: track (ip+slug) -> last click timestamp
// Prevents trivial click fraud from a single IP hammering the same product.
const recentClicks = new Map<string, number>();
const CLICK_DEDUP_WINDOW_MS = 60 * 1000; // 1 click per IP per product per minute

function isDuplicateClick(ip: string, slug: string): boolean {
  const key = `${ip}:${slug}`;
  const last = recentClicks.get(key);
  const now = Date.now();
  if (last && now - last < CLICK_DEDUP_WINDOW_MS) return true;
  recentClicks.set(key, now);
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const rates = await getLiveRates();
  const product = rates.find((r) => r.id === slug);

  if (!product) {
    console.warn('Affiliate redirect slug not found', { slug });
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!product.affiliateUrl) {
    console.warn('Affiliate redirect missing destination URL', { slug, productId: product.id });
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Log the click — skip duplicates to reduce fraud noise in metrics
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Affiliate click logging skipped: missing env vars', { slug });
  } else {
    const ip = getClientIp(req);
    const duplicate = isDuplicateClick(ip, slug);

    if (duplicate) {
      console.info('Affiliate click deduped (same IP+product within 1m)', { slug, ip });
    } else {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { error: dbError } = await supabase.from('affiliate_clicks').insert({
          product_id: product.id,
          provider: product.provider,
          category: product.category,
          referrer: req.headers.get('referer') ?? null,
        });
        if (dbError) {
          console.error('Affiliate click insert failed', {
            slug,
            productId: product.id,
            code: dbError.code,
            message: dbError.message,
          });
        }
      } catch (err) {
        console.error('Affiliate click unexpected error', {
          slug,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  const response = NextResponse.redirect(product.affiliateUrl);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
