import { NextRequest, NextResponse } from 'next/server';
import { getLiveRates } from '@/lib/rates';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

  // Log the click using service role key — bypasses RLS, never blocks redirect
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missingEnv = [
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean);
    console.error('Affiliate click logging skipped due to missing env', {
      slug,
      missingEnv,
    });
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
          details: dbError.details,
          hint: dbError.hint,
        });
      }
    } catch (err) {
      console.error('Affiliate click unexpected error', {
        slug,
        productId: product.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const response = NextResponse.redirect(product.affiliateUrl);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
