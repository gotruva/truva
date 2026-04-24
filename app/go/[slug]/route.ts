import { NextRequest, NextResponse } from 'next/server';

import { getLiveRates } from '@/lib/rates';
import { getClientIp } from '@/lib/apiSecurity';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Simple in-memory dedup to suppress accidental double-clicks and obvious click spam.
const recentClicks = new Map<string, number>();
const CLICK_DEDUP_WINDOW_MS = 5 * 1000;

function isDuplicateClick(dedupeKey: string): boolean {
  const last = recentClicks.get(dedupeKey);
  const now = Date.now();
  if (last && now - last < CLICK_DEDUP_WINDOW_MS) return true;
  recentClicks.set(dedupeKey, now);
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pagePath = req.nextUrl.searchParams.get('page_path');
  const placement = req.nextUrl.searchParams.get('placement');
  const pageViewId = req.nextUrl.searchParams.get('page_view_id');

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
  const supabase = createSupabaseAdminClient('public');

  if (!supabase) {
    console.error('Affiliate click logging skipped: missing env vars', { slug });
  } else {
    const ip = getClientIp(req);
    const dedupeKey = pageViewId && placement
      ? `${pageViewId}:${slug}:${placement}`
      : `${ip}:${slug}`;
    const duplicate = isDuplicateClick(dedupeKey);

    if (duplicate) {
      console.info('Affiliate click deduped', { slug, ip, pageViewId, placement });
    } else {
      try {
        const { error: dbError } = await supabase.from('affiliate_clicks').insert({
          product_id: product.id,
          provider: product.provider,
          category: product.category,
          page_path: pagePath,
          placement,
          page_view_id: pageViewId,
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
