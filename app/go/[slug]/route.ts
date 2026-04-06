import { NextRequest, NextResponse } from 'next/server';
import { getLiveRates } from '@/lib/rates';
import { createSupabaseServerClient } from '@/lib/supabase';

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

  // Log the click — don't block the redirect if this fails
  try {
    const supabase = await createSupabaseServerClient();
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

  return NextResponse.redirect(product.affiliateUrl);
}
