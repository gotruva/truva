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

  if (!product?.affiliateUrl) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Log the click using service role key — bypasses RLS, never blocks redirect
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { error: dbError } = await supabase.from('affiliate_clicks').insert({
      product_id: product.id,
      provider: product.provider,
      category: product.category,
      referrer: req.headers.get('referer') ?? null,
    });
    if (dbError) {
      console.error('Affiliate click insert failed:', JSON.stringify(dbError));
    }
  } catch (err) {
    console.error('Affiliate click unexpected error:', err);
  }

  const response = NextResponse.redirect(product.affiliateUrl);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
