import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', url: !!url, key: !!key });
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('affiliate_clicks').insert({
      product_id: 'debug-test',
      provider: 'Debug',
      category: 'banks',
      referrer: null,
    }).select();

    return NextResponse.json({ success: !error, error: error ?? null, data: data ?? null });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
